import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const RegisterPage = () => {
  const { register: registerUser, isRegistering } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/pricing');
    } catch (err) {
      // Toast displayed via useAuth
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-brand-border shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Begin Your Training
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            Create your account to book interactive video coaching with Kush.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Rahul Sharma"
                {...register('name')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="email"
                placeholder="you@example.com"
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
              Phone / WhatsApp Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
              <input
                type="tel"
                placeholder="9876543210"
                {...register('phone')}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Password *
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
                <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Confirm *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-400 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full gap-2 shadow-xl mt-4"
            isLoading={isRegistering}
          >
            Create Account & Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-brand-border/60 text-xs text-brand-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-accent font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
