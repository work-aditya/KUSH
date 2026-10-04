import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Button } from '../components/common/Button';
import { Lock, ArrowRight, ShieldCheck, Eye, EyeOff, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidRecoverySession, setHasValidRecoverySession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate that an authoritative recovery session is active
  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user) {
          if (isMounted) {
            setHasValidRecoverySession(false);
            setIsCheckingSession(false);
          }
          return;
        }

        if (isMounted) {
          setHasValidRecoverySession(true);
          setIsCheckingSession(false);
        }
      } catch {
        if (isMounted) {
          setHasValidRecoverySession(false);
          setIsCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    // Listen for auth events (e.g. PASSWORD_RECOVERY)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session?.user)) {
        if (isMounted) {
          setHasValidRecoverySession(true);
          setIsCheckingSession(false);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted && !isSuccess) {
          setHasValidRecoverySession(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [isSuccess]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('same_password') || msg.includes('same password')) {
          setSubmitError('New password must be different from your old password.');
        } else if (msg.includes('expired') || msg.includes('invalid') || msg.includes('session')) {
          setSubmitError('Password reset link has expired or has already been used.');
          setHasValidRecoverySession(false);
        } else {
          setSubmitError('Unable to update password. Please try again or request a new link.');
        }
        setIsSubmitting(false);
        return;
      }

      // Password successfully updated!
      setIsSuccess(true);

      // Consume/complete the recovery session so it cannot be reused
      sessionStorage.removeItem('ck_recovery_active');
      await supabase.auth.signOut();

      // Clear any recovery params from history
      window.history.replaceState(null, '', '/login');

      // Redirect after showing success notice
      setTimeout(() => {
        navigate('/login', {
          state: {
            passwordUpdatedNotice: true,
            message: 'Your password has been updated successfully. Please sign in with your new password.',
          },
          replace: true,
        });
      }, 2000);
    } catch {
      setSubmitError('Unable to update password. Please try again.');
      setIsSubmitting(false);
    }
  };

  // 1. Loading state while verifying session
  if (isCheckingSession) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-12 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-xs text-brand-muted">Verifying recovery credentials...</p>
      </div>
    );
  }

  // 2. Success state
  if (isSuccess) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-emerald-500/30 shadow-2xl text-center space-y-6 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">Password Updated!</h1>
            <p className="text-sm text-brand-muted">
              Your password has been updated successfully.
            </p>
          </div>

          <p className="text-xs text-brand-darkMuted">
            Redirecting to sign in...
          </p>
        </div>
      </div>
    );
  }

  // 3. No valid recovery session / expired / already used
  if (!hasValidRecoverySession) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-brand-border shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">
              Password Reset Link Expired or Used
            </h1>
            <p className="text-sm text-brand-muted leading-relaxed">
              This password recovery link has already been used, has expired, or is invalid. Reset links can only be used once for security.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link to="/forgot-password">
              <Button variant="primary" size="lg" className="w-full gap-2 shadow-xl">
                Request a New Reset Link
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link to="/login">
              <Button variant="ghost" size="sm" className="w-full text-xs text-brand-muted">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Valid recovery session: Show Create New Password form
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-brand-border shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create New Password
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            Enter and confirm your new secure password below to regain access to your account.
          </p>
        </div>

        {submitError && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 space-y-1">
            <p className="font-semibold">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="ENTER NEW PASSWORD"
                disabled={isSubmitting}
                {...register('password')}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-brand-muted hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="CONFIRM NEW PASSWORD"
                disabled={isSubmitting}
                {...register('confirmPassword')}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3.5 text-brand-muted hover:text-white transition-colors"
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 shadow-xl mt-4"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Update Password
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-brand-border/60 text-xs text-brand-muted">
          Remembered your password?{' '}
          <Link to="/login" className="text-brand-accent font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
