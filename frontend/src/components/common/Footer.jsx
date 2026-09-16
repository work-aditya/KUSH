import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Video, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const whatsappUrl =
    import.meta.env.VITE_WHATSAPP_CONTACT_URL ||
    'https://wa.me/917042858524';

  return (
    <footer className="border-t border-brand-border bg-brand-card/60 text-brand-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center p-1.5">
                <img src="/assets/logo/logo.svg" alt="CoachKush" className="w-full h-full" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                COACH<span className="text-brand-accent">KUSH</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-brand-muted max-w-md">
              Elite 1-on-1 and partner fitness coaching led directly by Kush. Delivering tailored body transformations, strength conditioning, and progressive overload tracking through live, interactive video coaching on Google Meet and Zoom.
            </p>
            <div className="flex items-center gap-4 text-xs text-brand-darkMuted pt-2">
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
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-emerald hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp: +91 70428 58524</span>
                </a>
              </li>
              <li>
                <Link to="/contact" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4 text-brand-muted" />
                  Contact Form
                </Link>
              </li>
              <li>
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
          <p>&copy; {new Date().getFullYear()} CoachKush. All rights reserved.</p>
          <p>Designed for elite performance & online accountability.</p>
        </div>
      </div>
    </footer>
  );
};
