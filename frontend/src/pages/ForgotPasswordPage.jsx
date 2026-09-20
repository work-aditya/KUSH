import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Mail, ArrowRight, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const ForgotPasswordPage = () => {
  const { forgotPassword, isSendingResetLink } = useAuth();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setEmailSent(true);
    } catch (err) {
      // Toast displayed via useAuth
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-brand-border shadow-2xl space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent mx-auto mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted">
            Enter your email to receive a secure recovery link.
          </p>
        </div>

        {emailSent ? (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto" />
              <p className="text-sm font-bold text-white">Reset Link Dispatched</p>
              <p className="text-xs text-brand-muted leading-relaxed">
                We've sent a password recovery link to{' '}
                <span className="text-white font-medium">{submittedEmail}</span>. Please check your inbox and spam folder.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setEmailSent(false)}
                className="w-full text-xs"
              >
                Send Another Email
              </Button>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="w-full gap-2 text-xs">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                Registered Email *
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

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 shadow-xl mt-4"
              isLoading={isSendingResetLink}
            >
              Send Recovery Link
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="flex items-center justify-between pt-4 border-t border-brand-border/60 text-xs">
              <Link to="/login" className="text-brand-muted hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </Link>
              <Link to="/register" className="text-brand-accent hover:underline font-semibold">
                Create Account
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
