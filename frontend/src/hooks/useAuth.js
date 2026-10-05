import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { supabase } from '../lib/supabaseClient';
import { setUser, clearUser, setLoading } from '../store/slices/authSlice';
import { addToast } from '../store/slices/uiSlice';

// Module-level singleton listener management across all useAuth hook consumers
let globalAuthSubscription = null;
let activeHookCount = 0;
const dispatchCallbacks = new Set();

export const useAuth = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  // Check if current flow is recovery session
  const isRecoveryActive = typeof window !== 'undefined' && (
    window.location.pathname.includes('/reset-password') ||
    window.location.pathname.includes('/auth/callback') ||
    sessionStorage.getItem('ck_recovery_active') === 'true'
  );

  // Initial user fetch (cached for 5 minutes)
  const { data: initialUser, isFetched, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !isRecoveryActive,
  });

  useEffect(() => {
    if (isRecoveryActive) {
      // Never set full authenticated session during password recovery flow
      return;
    }

    if (initialUser) {
      dispatch(setUser(initialUser));
    } else if (isFetched || isError) {
      dispatch(clearUser());
    }
  }, [initialUser, isFetched, isError, dispatch, isRecoveryActive]);

  // Shared Singleton Supabase Auth State Change Listener
  useEffect(() => {
    activeHookCount++;
    dispatchCallbacks.add(dispatch);

    if (!globalAuthSubscription) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        // 1. Password Recovery Flow - Never treat as normal dashboard login session
        if (event === 'PASSWORD_RECOVERY') {
          sessionStorage.setItem('ck_recovery_active', 'true');
          return;
        }

        const isRecovery = typeof window !== 'undefined' && (
          window.location.pathname.includes('/reset-password') ||
          sessionStorage.getItem('ck_recovery_active') === 'true'
        );

        if (isRecovery && event !== 'SIGNED_OUT') {
          return;
        }

        // 2. Normal authenticated session
        if (session?.user) {
          const userObj = await authService.getMe(true);
          dispatchCallbacks.forEach((cb) => {
            if (userObj) {
              cb(setUser(userObj));
            } else {
              cb(clearUser());
            }
          });

          if (typeof window !== 'undefined' && window.location.hash.includes('type=signup')) {
            dispatchCallbacks.forEach((cb) =>
              cb(addToast({ type: 'success', message: 'Email verified successfully! Welcome to CoachKush.' }))
            );
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else if (event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
          if (!session?.user) {
            dispatchCallbacks.forEach((cb) => cb(clearUser()));
          }
        }
      });

      globalAuthSubscription = subscription;
    }

    return () => {
      dispatchCallbacks.delete(dispatch);
      activeHookCount--;
      if (activeHookCount <= 0) {
        globalAuthSubscription?.unsubscribe();
        globalAuthSubscription = null;
        activeHookCount = 0;
      }
    };
  }, [dispatch]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authService.clearAuthCache();
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
      authService.clearAuthCache();
      dispatch(setUser(data.user));
      dispatch(addToast({ type: 'success', message: 'Account registered successfully!' }));
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message || 'Registration failed' }));
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: authService.adminLogin,
    onSuccess: (data) => {
      authService.clearAuthCache();
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
      authService.clearAuthCache();
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
      dispatch(addToast({ type: 'success', message: 'Your password has been updated successfully.' }));
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
