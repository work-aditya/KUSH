import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { contactService } from '../services/contactService';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';
import { Mail, MessageCircle, Send, CheckCircle2, Clock, MapPin } from 'lucide-react';

const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Please provide at least 10 characters describing your goals'),
});

export const ContactPage = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data) => {
    try {
      await contactService.submitMessage(data);
      dispatch(
        addToast({
          type: 'success',
          message: 'Thank you! Coach Kush will review your message shortly.',
        })
      );
      reset();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err.message || 'Failed to send message. Please try WhatsApp instead.',
        })
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent">Get In Touch</Badge>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Connect With Coach Kush
        </h1>
        <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
          Whether you want to discuss fitness goals, clarify live session setups, or inquire about custom plans, reach out anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info & Direct WhatsApp */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass-card rounded-3xl p-8 border border-brand-border space-y-6">
            <h2 className="text-xl font-bold text-white">Direct Access</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              For instant queries or schedule coordination, WhatsApp is the fastest way to connect with Kush directly.
            </p>

            <WhatsAppButton text="Chat with Kush on WhatsApp" className="w-full" />

            <div className="pt-6 border-t border-brand-border/60 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Official Email</h4>
                  <p className="text-xs text-brand-muted">support@coachkush.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-emerald shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Session Hours</h4>
                  <p className="text-xs text-brand-muted">Mon - Sat: 6:00 AM - 9:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Location & Delivery</h4>
                  <p className="text-xs text-brand-muted">Virtual Live Training across India & Worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-brand-border">
            <h2 className="text-2xl font-bold text-white mb-2">Send an Inquiry</h2>
            <p className="text-xs sm:text-sm text-brand-muted mb-6">
              Fill out the form below and Kush will reply via email or phone within 24 hours.
            </p>

            {isSubmitSuccessful && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-emerald-400 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Your message has been received! Kush will get back to you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...register('name')}
                  className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    {...register('phone')}
                    className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
                  Your Message & Goals *
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell Kush about your fitness history, current goals, or specific questions..."
                  {...register('message')}
                  className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white text-sm placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent transition-colors resize-none"
                />
                {errors.message && (
                  <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2 shadow-xl"
                isLoading={isSubmitting}
              >
                <Send className="w-4 h-4" />
                Submit Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
