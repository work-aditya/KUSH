import { supabase } from '../lib/supabaseClient';

const ADMIN_ROLE_ID = '22b2bf47-cdc5-413b-a67c-ebe9ab657981';

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
      // ignore RPC error and continue to table query
    }

    // 2. Query all roles from user_roles (Array lookup, not maybeSingle to support multi-role accounts)
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
  } catch (err) {
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
  // 1. Customer Sign Up with Supabase Auth
  async register({ email, password, name, phone }) {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : 'https://kush-frontend.vercel.app/';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name,
          name,
          phone,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Registration failed');
    }

    if (!data.user) {
      throw new Error('Registration succeeded, but no user was returned. Please verify your email.');
    }

    // Safely upsert profile if session exists
    if (data.session) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: name,
          phone,
          is_active: true,
        });
      } catch (profileErr) {
        console.warn('Profile upsert warning:', profileErr);
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message || 'Invalid credentials');
    }

    const formattedUser = await formatUserData(data.user);
    return { user: formattedUser, session: data.session };
  },

  // 3. Admin Authentication & Role Verification
  async adminLogin({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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

  // 4. Sign Out
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.warn('Sign out warning:', error.message);
    }
    return { success: true };
  },

  // 5. Retrieve current session user
  async getMe() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    return await formatUserData(session.user);
  },

  // 6. Request Password Reset Link
  async forgotPassword(email) {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) {
      throw new Error(error.message || 'Failed to send password reset email');
    }
    return data;
  },

  // 7. Update / Reset Password
  async resetPassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) {
      throw new Error(error.message || 'Failed to update password');
    }
    return data;
  },
};

export default authService;
