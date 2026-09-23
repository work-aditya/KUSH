import { supabase } from '../lib/supabaseClient';

const STORAGE_KEY = 'coachkush_site_settings';

export const DEFAULT_SETTINGS = {
  id: 'general',
  whatsapp_number: '+91 70428 58524',
  whatsapp_url: import.meta.env.VITE_WHATSAPP_CONTACT_URL || 'https://wa.me/917042858524',
  instagram_url: 'https://instagram.com/coachkush',
  youtube_url: '',
  email: 'support@coachkush.com',
  phone: '+91 70428 58524',
  footer_tagline:
    'Elite 1-on-1 and partner fitness coaching led directly by Kush. Delivering tailored body transformations, strength conditioning, and progressive overload tracking through live, interactive video coaching on Google Meet and Zoom.',
  footer_copyright:
    'CoachKush. All rights reserved. Designed for elite performance & online accountability.',
};

export const settingsService = {
  /**
   * Retrieve active site settings with resilient fallback to local cache and defaults.
   */
  async getSiteSettings() {
    // 1. Check local cached copy first for instant hydration
    let cached = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch {
      // ignore JSON parse issue
    }

    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'general')
        .maybeSingle();

      if (!error && data) {
        const merged = { ...DEFAULT_SETTINGS, ...data };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore storage quota error
        }
        return merged;
      }
    } catch (err) {
      console.warn('site_settings lookup warning:', err.message);
    }

    return cached || DEFAULT_SETTINGS;
  },

  /**
   * Update site settings in Supabase and sync to local storage.
   */
  async updateSiteSettings(patch) {
    const payload = {
      id: 'general',
      whatsapp_number: patch.whatsapp_number?.trim() || DEFAULT_SETTINGS.whatsapp_number,
      whatsapp_url: patch.whatsapp_url?.trim() || DEFAULT_SETTINGS.whatsapp_url,
      instagram_url: patch.instagram_url?.trim() || DEFAULT_SETTINGS.instagram_url,
      youtube_url: patch.youtube_url?.trim() || '',
      email: patch.email?.trim() || DEFAULT_SETTINGS.email,
      phone: patch.phone?.trim() || DEFAULT_SETTINGS.phone,
      footer_tagline: patch.footer_tagline?.trim() || DEFAULT_SETTINGS.footer_tagline,
      footer_copyright: patch.footer_copyright?.trim() || DEFAULT_SETTINGS.footer_copyright,
      updated_at: new Date().toISOString(),
    };

    let serverSuccess = false;
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        serverSuccess = true;
        const merged = { ...DEFAULT_SETTINGS, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      } else if (error) {
        console.warn('Supabase site_settings upsert error:', error.message);
      }
    } catch (err) {
      console.warn('site_settings upsert exception:', err.message);
    }

    // Persist to local cache so changes are immediately active in the browser
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return { ...payload, _syncedLocalOnly: !serverSuccess };
  },
};

export default settingsService;
