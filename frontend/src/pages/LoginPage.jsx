import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Lock, Mail, ArrowRight, Eye, EyeOff, Info } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const returnTo = location.state?.from?.pathname || location.state?.returnTo || '/';
  const emailVerificationNotice = location.state?.emailVerificationNotice;
  const registeredEmail = location.state?.email;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: registeredEmail || '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data);
      if (result?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(returnTo);
      }
    } catch (err) {
      // Toast notification is automatically dispatched by useAuth
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-brand-border shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            Sign in to access your coaching session details and orders.
          </p>
        </div>

        {emailVerificationNotice && (
          <div className="p-4 rounded-2xl bg-brand-accent/10 border border-brand-accent/30 flex items-start gap-3 text-xs text-brand-accent">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Verification link sent!</p>
              <p className="text-brand-muted mt-0.5">
                We sent a confirmation link to <span className="text-white font-medium">{registeredEmail}</span>. Please verify your email before logging in.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-brand-accent hover:underline font-semibold"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
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
            className="w-full gap-2 shadow-xl mt-2"
            isLoading={isLoggingIn}
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-brand-border/60 text-xs text-brand-muted">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-brand-accent font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
