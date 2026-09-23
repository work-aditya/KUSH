import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Lock, User, ArrowLeft, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';

const adminLoginSchema = z.object({
  email: z.string().min(1, 'Administrator username or email is required'),
  password: z.string().min(1, 'Security key or password is required'),
});

export const AdminLoginPage = () => {
  const { adminLogin, isAdminLoggingIn, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const returnTo = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      const res = await adminLogin({
        email: data.email.trim(),
        password: data.password,
      });
      if (res?.user?.role === 'admin') {
        navigate(returnTo, { replace: true });
      }
    } catch (err) {
      setAuthError(err.message || 'Admin authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Top Branding & Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 text-brand-accent shadow-lg shadow-brand-accent/10 mb-2">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="inline-block">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full bg-brand-card border border-brand-border text-brand-muted">
              Internal System Gateway
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CoachKush Admin Portal
          </h1>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Restricted area. Please provide valid administrative credentials to manage clients, sessions, and platform settings.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-brand-border shadow-2xl space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Admin Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="ENTER EMAIL"
                  {...register('email')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Master Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="PASSWORD"
                  {...register('password')}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
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

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 shadow-xl mt-4 bg-brand-accent hover:bg-brand-accent/90 text-brand-bg font-bold"
              isLoading={isAdminLoggingIn}
            >
              <KeyRound className="w-4 h-4" />
              Authenticate & Enter Console
            </Button>
          </form>

          <div className="pt-4 border-t border-brand-border/60 text-center">
            <p className="text-[11px] text-brand-muted">
              🔒 All access requests and IP sessions are cryptographically logged for security audits.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-light transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to CoachKush Main Website
          </Link>
        </div>
      </div>
    </div>
  );
};
