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
  const { data: initialUser, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (initialUser) {
      dispatch(setUser(initialUser));
    } else if (isError) {
      dispatch(clearUser());
    }
  }, [initialUser, isError, dispatch]);

  // Supabase Auth State Change Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const userObj = await authService.getMe();
        if (userObj) dispatch(setUser(userObj));
      } else if (event === 'SIGNED_OUT') {
        dispatch(clearUser());
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
      dispatch(addToast({ type: 'error', message: err.message || 'Registration failed' }));
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
  };
};

export default useAuth;
