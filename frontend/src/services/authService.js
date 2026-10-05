import { supabase } from '../lib/supabaseClient.js';
import { getAuthRedirectUrl } from '../utils/domain.js';
import { normalizePhoneNumber } from '../utils/phone.js';

const ADMIN_ROLE_ID = '22b2bf47-cdc5-413b-a67c-ebe9ab657981';

// In-flight promise & short TTL cache to prevent duplicate getMe queries
let inFlightGetMePromise = null;
let cachedMe = null;
let cachedMeTimestamp = 0;
const ME_CACHE_TTL_MS = 15 * 1000; // 15 seconds

/**
 * Maps Supabase & PostgreSQL errors to user-friendly messages without leaking
 * database details, error codes (e.g. 23505), or internal stack traces.
 */
export const mapAuthError = (error) => {
  if (!error) return new Error('An unexpected error occurred. Please try again.');
  const msg = (error.message || '').toLowerCase();
  const code = (error.code || error.status || '').toString().toLowerCase();

  // 1. Phone number already exists
  if (
    msg.includes('phone_already_exists') ||
    msg.includes('profiles_phone_key') ||
    msg.includes('idx_profiles_normalized_phone') ||
    msg.includes('account with this phone number already exists') ||
    msg.includes('phone number already exists') ||
    (msg.includes('phone') && (msg.includes('unique') || msg.includes('duplicate') || msg.includes('23505')))
  ) {
    return new Error('An account with this phone number already exists.');
  }

  // 2. Email address already exists
  if (
    msg.includes('user already registered') ||
    msg.includes('email already in use') ||
    msg.includes('email address already registered') ||
    msg.includes('account with this email already exists') ||
    (msg.includes('email') && (msg.includes('unique') || msg.includes('duplicate') || msg.includes('already exists')))
  ) {
    return new Error('An account with this email already exists.');
  }

  // 3. Network / Connection errors
  if (msg.includes('failed to fetch') || msg.includes('network') || msg.includes('timeout')) {
    return new Error('Unable to connect to authentication server. Please check your network connection.');
  }

  // 4. Rate limits
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return new Error('Email rate limit reached on auth server. Please wait a few minutes before trying again.');
  }

  // 5. Database errors / constraint violations
  if (
    msg.includes('database error') ||
    msg.includes('duplicate key') ||
    msg.includes('postgresql') ||
    msg.includes('constraint') ||
    msg.includes('23505') ||
    msg.includes('relation') ||
    code === '23505'
  ) {
    if (msg.includes('phone')) {
      return new Error('An account with this phone number already exists.');
    }
    if (msg.includes('email')) {
      return new Error('An account with this email already exists.');
    }
    return new Error('Unable to create your account right now. Please try again.');
  }

  return new Error(error.message || 'Unable to create your account right now. Please try again.');
};

const formatUserData = async (authUser) => {
  if (!authUser) return null;

  let roleName = 'customer';

  try {
    // 1. Authoritative RPC check (Postgres SECURITY DEFINER function is_admin)
    try {
      const { data: isAdm } = await supabase.rpc('is_admin');
      if (isAdm === true) {
        roleName = 'admin';
      }
    } catch {
      // continue to table query
    }

    // 2. Query all roles from user_roles
    if (roleName !== 'admin') {
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', authUser.id);

      const assignedRoleNames = (userRoles || [])
        .map((ur) => ur.roles?.name || (ur.role_id === ADMIN_ROLE_ID ? 'admin' : null))
        .filter(Boolean);

      if (
        assignedRoleNames.includes('admin') ||
        (userRoles || []).some((ur) => ur.role_id === ADMIN_ROLE_ID) ||
        authUser.user_metadata?.role === 'admin' ||
        authUser.app_metadata?.role === 'admin'
      ) {
        roleName = 'admin';
      } else if (
        assignedRoleNames.includes('staff') ||
        authUser.user_metadata?.role === 'staff'
      ) {
        roleName = 'staff';
      } else if (assignedRoleNames.length > 0) {
        roleName = assignedRoleNames[0];
      }
    }
  } catch (err) {
    console.warn('Role check fallback:', err);
    if (authUser.user_metadata?.role === 'admin' || authUser.app_metadata?.role === 'admin') {
      roleName = 'admin';
    }
  }

  // Profile lookup
  let profile = null;
  try {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    profile = data;
  } catch {
    // ignore
  }

  return {
    id: authUser.id,
    _id: authUser.id,
    email: authUser.email,
    name:
      profile?.full_name ||
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      'Trainee',
    phone: profile?.phone || authUser.user_metadata?.phone || '',
    avatarUrl: profile?.avatar_url || '',
    role: roleName,
    isActive: profile?.is_active ?? true,
    createdAt: profile?.created_at || authUser.created_at,
  };
};

export const authService = {
  // 1. Customer Sign Up with Supabase Auth & Normalized Phone Protection
  async register({ email, password, name, phone }) {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const normalizedPhone = normalizePhoneNumber(phone);

    // Step A: Pre-check phone availability at database level
    if (normalizedPhone) {
      try {
        const { data: isAvail, error: checkErr } = await supabase.rpc('check_phone_availability', {
          check_phone: normalizedPhone,
        });

        if (!checkErr && isAvail === false) {
          throw new Error('An account with this phone number already exists.');
        }
      } catch (err) {
        if (err.message === 'An account with this phone number already exists.') {
          throw err;
        }
        // Fallback: direct check on profiles table
        try {
          const { data: existingProf } = await supabase
            .from('profiles')
            .select('id')
            .eq('phone', normalizedPhone)
            .maybeSingle();

          if (existingProf) {
            throw new Error('An account with this phone number already exists.');
          }
        } catch (subErr) {
          if (subErr.message === 'An account with this phone number already exists.') {
            throw subErr;
          }
        }
      }
    }

    // Step B: Set authoritative redirect URL to active origin /auth/callback
    const redirectUrl = typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/auth/callback`
      : getAuthRedirectUrl('/auth/callback');

    let signUpRes;
    try {
      signUpRes = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: cleanName,
            name: cleanName,
            phone: normalizedPhone,
          },
        },
      });
    } catch (netErr) {
      throw mapAuthError(netErr);
    }

    const { data, error } = signUpRes;

    if (error) {
      throw mapAuthError(error);
    }

    // Supabase Auth duplicate email check when confirmations are enabled
    if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('An account with this email already exists.');
    }

    if (!data.user) {
      throw new Error('Registration completed, but no user data was returned. Please verify your email.');
    }

    // Safely upsert profile if session exists immediately (e.g. email confirmations disabled)
    if (data.session) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: cleanName,
          phone: normalizedPhone,
          is_active: true,
        });
      } catch (profileErr) {
        console.warn('Profile upsert note:', profileErr?.message);
      }
    }

    const formattedUser = await formatUserData(data.user);
    return {
      user: formattedUser,
      session: data.session,
      requiresEmailVerification: !data.session,
    };
  },

  // 2. Customer Sign In with Supabase Auth
  async login({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        throw new Error('Invalid email or password. Please try again.');
      }
      if (msg.includes('email not confirmed')) {
        throw new Error('Please confirm your email address before logging in.');
      }
      throw new Error(error.message || 'Login failed');
    }

    const formattedUser = await formatUserData(data.user);
    return { user: formattedUser, session: data.session };
  },

  // 3. Admin Authentication & Role Verification
  async adminLogin({ email, password }) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Admin authentication failed');
    }

    const formattedUser = await formatUserData(data.user);

    if (formattedUser.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Access denied. Administrator privileges required.');
    }

    return { user: formattedUser, session: data.session };
  },

  // Clear auth cache helper
  clearAuthCache() {
    cachedMe = null;
    cachedMeTimestamp = 0;
    inFlightGetMePromise = null;
  },

  // 4. Sign Out
  async logout() {
    this.clearAuthCache();
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
    return { success: true };
  },

  // 5. Retrieve current session user with in-flight promise deduplication
  async getMe(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && cachedMe && now - cachedMeTimestamp < ME_CACHE_TTL_MS) {
      return cachedMe;
    }

    if (inFlightGetMePromise) {
      return inFlightGetMePromise;
    }

    inFlightGetMePromise = (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          cachedMe = null;
          return null;
        }

        const formatted = await formatUserData(session.user);
        cachedMe = formatted;
        cachedMeTimestamp = Date.now();
        return formatted;
      } finally {
        inFlightGetMePromise = null;
      }
    })();

    return inFlightGetMePromise;
  },

  // 6. Request Password Reset Link with Recovery Redirect
  async forgotPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/auth/callback?type=recovery`
      : getAuthRedirectUrl('/auth/callback?type=recovery');

    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: redirectUrl,
    });

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('rate limit')) {
        throw new Error('Reset request limit reached. Please wait a few minutes before trying again.');
      }
      throw new Error(error.message || 'Failed to send password reset email');
    }

    return data;
  },

  // 7. Update / Reset Password in Recovery Session
  async resetPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('same_password') || msg.includes('same password')) {
        throw new Error('Your new password must be different from your old password.');
      }
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('session')) {
        throw new Error('Password reset link has expired or is invalid. Please request a new link.');
      }
      throw new Error(error.message || 'Failed to update password. Please try again.');
    }

    return data;
  },

  // 8. Explicit Phone Availability Checker
  async checkPhoneAvailability(phone) {
    const norm = normalizePhoneNumber(phone);
    if (!norm) return true;

    try {
      const { data, error } = await supabase.rpc('check_phone_availability', {
        check_phone: norm,
      });
      if (error) throw error;
      return data === true;
    } catch {
      // Fallback query
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', norm)
        .maybeSingle();
      return !data;
    }
  },
};

export default authService;
