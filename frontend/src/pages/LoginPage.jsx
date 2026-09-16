import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Lock, Mail, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnTo = location.state?.from?.pathname || location.state?.returnTo || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="name@example.com"
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
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
              />
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
