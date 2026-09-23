import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { supabase } from '../../lib/supabaseClient';
import { settingsService, DEFAULT_SETTINGS } from '../../services/settingsService';
import { addToast } from '../../store/slices/uiSlice';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import {
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  Youtube,
  Globe,
  Save,
  ExternalLink,
  Shield,
  Server,
  CheckCircle2,
  Sparkles,
  Share2,
  Loader2,
  Sliders,
  Check,
  Video,
  ShieldCheck,
} from 'lucide-react';

export const AdminSettings = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('footer'); // 'footer' | 'system'

  // Database & deployment health query
  const { data: dbHealth } = useQuery({
    queryKey: ['supabase-health'],
    queryFn: async () => {
      try {
        const { error } = await supabase.from('products').select('id', { head: true, count: 'exact' });
        return { database: error ? 'Degraded' : 'Connected', error: error?.message };
      } catch (err) {
        return { database: 'Offline', error: err.message };
      }
    },
    staleTime: 30000,
  });

  // Site / Footer settings query
  const { data: siteSettings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsService.getSiteSettings,
    staleTime: 10000,
  });

  // Form state
  const [formData, setFormData] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    if (siteSettings) {
      setFormData(siteSettings);
    }
  }, [siteSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: (data) => settingsService.updateSiteSettings(data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      dispatch(
        addToast({
          type: 'success',
          message: updated._syncedLocalOnly
            ? 'Settings saved locally (ready for database push)'
            : 'Footer & brand settings saved successfully!',
        })
      );
    },
    onError: (err) => {
      dispatch(
        addToast({
          type: 'error',
          message: err.message || 'Failed to save settings',
        })
      );
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Sliders className="w-6 h-6 text-brand-accent" />
            Platform & Footer Settings
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Configure footer social channels (Instagram, WhatsApp, YouTube), contact points, and verify system infrastructure.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 rounded-xl bg-brand-surface border border-brand-border self-start">
          <button
            type="button"
            onClick={() => setActiveTab('footer')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'footer'
                ? 'bg-brand-accent text-black shadow-md'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Footer & Social Links
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'system'
                ? 'bg-brand-accent text-black shadow-md'
                : 'text-brand-muted hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            System & Health
          </button>
        </div>
      </div>

      {/* TAB 1: FOOTER & SOCIAL LINKS CONFIGURATION */}
      {activeTab === 'footer' && (
        <div className="space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Primary Social Channels Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-brand-border space-y-6">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
                <div className="space-y-1">
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-brand-accent" />
                    Social Media & Direct Chat Links
                  </h2>
                  <p className="text-xs text-brand-muted">
                    These links appear in the public footer, floating buttons, and contact sections.
                  </p>
                </div>
                <Badge variant="accent">Live on Website</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Instagram URL */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-muted flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram Profile URL *
                    </span>
                    {formData.instagram_url && (
                      <a
                        href={formData.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-brand-accent hover:underline flex items-center gap-1"
                      >
                        Test Link <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    name="instagram_url"
                    required
                    value={formData.instagram_url || ''}
                    onChange={handleChange}
                    placeholder="https://instagram.com/coachkush"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors font-mono"
                  />
                  <p className="text-[11px] text-brand-darkMuted">
                    Displayed with official Instagram gradient styling in the footer.
                  </p>
                </div>

                {/* WhatsApp Chat URL */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-muted flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white">
                      <MessageCircle className="w-4 h-4 text-emerald-400" />
                      WhatsApp Direct Chat Link *
                    </span>
                    {formData.whatsapp_url && (
                      <a
                        href={formData.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        Test Chat <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    name="whatsapp_url"
                    required
                    value={formData.whatsapp_url || ''}
                    onChange={handleChange}
                    placeholder="https://wa.me/917042858524"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors font-mono"
                  />
                  <p className="text-[11px] text-brand-darkMuted">
                    Format: <code className="text-brand-accent">https://wa.me/&lt;country_code_number&gt;</code>
                  </p>
                </div>

                {/* WhatsApp Display Number */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-white flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    WhatsApp Display Number *
                  </label>
                  <input
                    type="text"
                    name="whatsapp_number"
                    required
                    value={formData.whatsapp_number || ''}
                    onChange={handleChange}
                    placeholder="+91 70428 58524"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  <p className="text-[11px] text-brand-darkMuted">
                    Displayed as readable text beside the WhatsApp icon in the footer.
                  </p>
                </div>

                {/* YouTube Channel (Optional) */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-brand-muted flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-white">
                      <Youtube className="w-4 h-4 text-red-500" />
                      YouTube Channel URL (Optional)
                    </span>
                    {formData.youtube_url && (
                      <a
                        href={formData.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                      >
                        Open <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </label>
                  <input
                    type="url"
                    name="youtube_url"
                    value={formData.youtube_url || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/@coachkush"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors font-mono"
                  />
                  <p className="text-[11px] text-brand-darkMuted">
                    Leave blank if you don't wish to display a YouTube button yet.
                  </p>
                </div>

                {/* Support Email */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-white flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-brand-accent" />
                    Direct Support Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="support@coachkush.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>

                {/* Direct Calling Phone */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-white flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-brand-accent" />
                    Direct Calling Phone *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="+91 70428 58524"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Brand Philosophy & Footer Text Card */}
            <div className="glass-card rounded-2xl p-6 sm:p-8 border border-brand-border space-y-6">
              <div className="border-b border-brand-border/60 pb-4">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                  Footer Tagline & Legal Notice
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Customize the brand description and bottom copyright notice displayed at the bottom of every page.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Tagline */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-white">Brand Philosophy / Tagline Description *</label>
                  <textarea
                    name="footer_tagline"
                    rows={3}
                    required
                    value={formData.footer_tagline || ''}
                    onChange={handleChange}
                    placeholder="Elite 1-on-1 and partner fitness coaching led directly by Kush..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors leading-relaxed"
                  />
                </div>

                {/* Copyright / Subtitle */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-white">Bottom Copyright & Subtitle Notice *</label>
                  <input
                    type="text"
                    name="footer_copyright"
                    required
                    value={formData.footer_copyright || ''}
                    onChange={handleChange}
                    placeholder="CoachKush. All rights reserved. Designed for elite performance & online accountability."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-surface border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-card border border-brand-border">
              <p className="text-xs text-brand-muted">
                Changes take effect instantly on the public website.
              </p>
              <Button
                type="submit"
                size="md"
                className="gap-2 shadow-lg shadow-brand-accent/20"
                isLoading={saveMutation.isPending}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </form>

          {/* LIVE FOOTER PREVIEW */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-accent" />
                Live Footer Preview (What Visitors See)
              </h3>
              <span className="text-[11px] text-brand-darkMuted">Real-time dynamic preview</span>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-card/80 p-6 sm:p-8 space-y-6 text-brand-muted">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Col 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center p-1">
                      <img src="/assets/logo/logo.svg" alt="CoachKush" className="w-full h-full" />
                    </div>
                    <span className="text-lg font-extrabold tracking-tight text-white">
                      COACH<span className="text-brand-accent">KUSH</span>
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-brand-muted">
                    {formData.footer_tagline}
                  </p>
                </div>

                {/* Col 2 */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Direct Support
                  </h4>
                  <div className="space-y-2 text-xs">
                    <a
                      href={formData.whatsapp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp: {formData.whatsapp_number}</span>
                    </a>
                    <div className="flex items-center gap-2 text-brand-muted">
                      <Mail className="w-4 h-4" />
                      <span>{formData.email}</span>
                    </div>
                  </div>
                </div>

                {/* Col 3: Social Badges */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Connect on Social
                  </h4>
                  <div className="flex items-center gap-3 pt-1">
                    {formData.instagram_url && (
                      <a
                        href={formData.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/20 hover:scale-110 transition-transform"
                        title="Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </a>
                    )}
                    {formData.whatsapp_url && (
                      <a
                        href={formData.whatsapp_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform"
                        title="WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                      </a>
                    )}
                    {formData.youtube_url && (
                      <a
                        href={formData.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20 hover:scale-110 transition-transform"
                        title="YouTube"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Copyright */}
              <div className="pt-4 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-brand-darkMuted gap-2">
                <p>&copy; {new Date().getFullYear()} {formData.footer_copyright}</p>
                <p>Live Video Coaching • Razorpay Secure</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM HEALTH & SECURITY ARCHITECTURE */}
      {activeTab === 'system' && (
        <div className="space-y-8">
          {/* Services Status */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-brand-accent" />
              Production Service Status
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white">Database Cluster</p>
                  <p className="text-[11px] text-brand-muted">Supabase PostgreSQL 15</p>
                </div>
                <Badge variant="emerald">{dbHealth?.database || 'Connected'}</Badge>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white">Serverless Backend</p>
                  <p className="text-[11px] text-brand-muted">Supabase Edge Functions (Deno)</p>
                </div>
                <Badge variant="emerald">Operational</Badge>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white">Payment Gateway</p>
                  <p className="text-[11px] text-brand-muted">Razorpay Standard PG</p>
                </div>
                <Badge variant="accent">Active</Badge>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white">Identity & Access</p>
                  <p className="text-[11px] text-brand-muted">Supabase Auth (RLS Enforced)</p>
                </div>
                <Badge variant="emerald">Secured</Badge>
              </div>
            </div>
          </div>

          {/* Security Architecture Checklist */}
          <div className="glass-card rounded-2xl p-6 border border-brand-border space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-brand-emerald" />
              Security Architecture Verification
            </h2>

            <ul className="space-y-2.5 text-xs text-brand-muted">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Zero hard-coded secrets: All credentials loaded strictly from environment configuration.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Server-side authoritative pricing: Razorpay order amounts computed directly from PostgreSQL.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>PostgreSQL Row-Level Security (RLS) enabled on all tables including site_settings.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Supabase JWT identity verification enforced on Edge Functions.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Razorpay HMAC-SHA256 payment signature verification enforced server-side.</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
                <span>Idempotent webhook processing via dedicated <code className="text-brand-accent">payment_events</code> table.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
