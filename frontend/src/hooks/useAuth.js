import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabaseClient';
import { setUser, clearUser, setLoading } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Initial user fetch
  const { data: initialUser, isFetched, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (initialUser) {
      dispatch(setUser(initialUser));
    } else if (isFetched || isError) {
      dispatch(clearUser());
    }
  }, [initialUser, isFetched, isError, dispatch]);

  // Supabase Auth State Change Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userObj = await authService.getMe();
        if (userObj) {
          dispatch(setUser(userObj));
        } else {
          dispatch(clearUser());
        }

        if (typeof window !== 'undefined' && window.location.hash.includes('type=signup')) {
          dispatch(addToast({ type: 'success', message: 'Email verified successfully! Welcome to Coach Kush.' }));
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        if (!session?.user) {
          dispatch(clearUser());
        }
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [dispatch]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(addToast({ type: 'success', message: `Welcome back, ${data.user.name}!` }));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message || 'Login failed' }));
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(addToast({ type: 'success', message: 'Account registered successfully!' }));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err) => {
      let msg = err.message || 'Registration failed';
      if (msg === 'Failed to fetch') {
        msg = 'Unable to connect to authentication server. Please check your network connection.';
      } else if (msg.includes('rate limit')) {
        msg = 'Email rate limit reached on auth server. Please wait a few minutes or try again later.';
      }
      dispatch(addToast({ type: 'error', message: msg }));
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: authService.adminLogin,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      dispatch(addToast({ type: 'success', message: `Admin access granted. Welcome ${data.user.name}!` }));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.response?.data?.error?.message || err.message || 'Admin authentication failed' }));
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      dispatch(clearUser());
      dispatch(addToast({ type: 'info', message: 'You have been logged out' }));
      queryClient.clear();
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      dispatch(addToast({ type: 'success', message: 'Password reset link sent! Please check your email inbox.' }));
    },
    onError: (err) => {
      const msg = err.message === 'Failed to fetch'
        ? 'Unable to connect to server. Please check your internet connection.'
        : err.message || 'Failed to send reset email';
      dispatch(addToast({ type: 'error', message: msg }));
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      dispatch(addToast({ type: 'success', message: 'Password updated successfully! You can now sign in.' }));
    },
    onError: (err) => {
      const msg = err.message === 'Failed to fetch'
        ? 'Unable to connect to server. Please check your internet connection.'
        : err.message || 'Failed to update password';
      dispatch(addToast({ type: 'error', message: msg }));
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'admin',
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    adminLogin: adminLoginMutation.mutateAsync,
    isAdminLoggingIn: adminLoginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isSendingResetLink: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};

export default useAuth;
