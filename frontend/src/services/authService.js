import { supabase } from '../lib/supabaseClient';

const formatUserData = async (authUser) => {
  if (!authUser) return null;

  // Query profile from PostgreSQL
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  // Query role from user_roles
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('roles(name)')
    .eq('user_id', authUser.id)
    .single();

  const roleName = userRole?.roles?.name || authUser.user_metadata?.role || 'customer';

  return {
    id: authUser.id,
    _id: authUser.id,
    email: authUser.email,
    name: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'Trainee',
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
