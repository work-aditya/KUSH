import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '../../services/settingsService';
import {
  MessageCircle,
  Mail,
  Video,
  ShieldCheck,
  Instagram,
  Youtube,
  Phone,
  ArrowUpRight,
} from 'lucide-react';

export const Footer = () => {
  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsService.getSiteSettings,
    staleTime: 60 * 1000,
  });

  const whatsappUrl =
    settings?.whatsapp_url ||
    import.meta.env.VITE_WHATSAPP_CONTACT_URL ||
    'https://wa.me/917042858524';
  const whatsappNumber = settings?.whatsapp_number || '+91 70428 58524';
  const instagramUrl = settings?.instagram_url || 'https://instagram.com/coachkush';
  const youtubeUrl = settings?.youtube_url;
  const supportEmail = settings?.email || 'support@coachkush.com';
  const tagline =
    settings?.footer_tagline ||
    'Elite 1-on-1 and partner fitness coaching led directly by Kush. Delivering tailored body transformations, strength conditioning, and progressive overload tracking through live, interactive video coaching on Google Meet and Zoom.';
  const copyright =
    settings?.footer_copyright ||
    'CoachKush. All rights reserved. Designed for elite performance & online accountability.';

  // Extract handle for Instagram display (e.g., @coachkush)
  const instagramHandle = instagramUrl
    ? '@' + instagramUrl.replace(/\/$/, '').split('/').pop().replace('@', '')
    : '@coachkush';

  return (
    <footer className="border-t border-brand-border bg-brand-card/60 text-brand-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center p-1.5 shadow-sm">
                <img src="/assets/logo/logo.svg" alt="CoachKush" className="w-full h-full" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                COACH<span className="text-brand-accent">KUSH</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-brand-muted max-w-md">
              {tagline}
            </p>

            {/* Social Channels Icons Pill */}
            <div className="flex items-center gap-3 pt-1">
              {instagramUrl && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Profile"
                  className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 hover:scale-110 active:scale-95 transition-all"
                  title="Follow Kush on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Chat"
                  className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-95 transition-all"
                  title="Direct WhatsApp Chat"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                </a>
              )}
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all"
                  title="Subscribe on YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              <a
                href={`mailto:${supportEmail}`}
                aria-label="Direct Email"
                className="w-10 h-10 rounded-xl bg-brand-surface border border-brand-border text-brand-muted hover:text-white flex items-center justify-center hover:border-brand-accent transition-all"
                title={`Email: ${supportEmail}`}
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-brand-darkMuted pt-2">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-brand-accent" />
                Live Video Coaching
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-emerald" />
                Razorpay Secure Payments
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-brand-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-accent transition-colors">
                  About Kush
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-brand-accent transition-colors">
                  Membership & Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-brand-accent transition-colors">
                  FAQ & Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-accent transition-colors">
                  Contact & Inquiries
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Connect */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Direct Support
            </h3>
            <ul className="space-y-3 text-sm">
              {/* WhatsApp Item */}
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-emerald hover:underline font-medium group"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>WhatsApp: {whatsappNumber}</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>

              {/* Instagram Item */}
              {instagramUrl && (
                <li>
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-400 hover:text-pink-300 hover:underline font-medium group"
                  >
                    <Instagram className="w-4 h-4 shrink-0" />
                    <span>Instagram: {instagramHandle}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              )}

              {/* Contact Form */}
              <li>
                <Link to="/contact" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-brand-muted shrink-0" />
                  <span>Contact Form ({supportEmail})</span>
                </Link>
              </li>

              {/* Legal Pages */}
              <li className="pt-2 border-t border-brand-border/40">
                <Link to="/pages/terms" className="text-xs text-brand-darkMuted hover:text-brand-muted">
                  Terms of Coaching
                </Link>
              </li>
              <li>
                <Link to="/pages/privacy" className="text-xs text-brand-darkMuted hover:text-brand-muted">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-darkMuted">
          <p>&copy; {new Date().getFullYear()} {copyright}</p>
          <p>Designed for elite performance & online accountability.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
