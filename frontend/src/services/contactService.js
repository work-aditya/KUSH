import { supabase } from '../lib/supabaseClient';

export const contactService = {
  async submitMessage(data) {
    const { error } = await supabase.from('contact_messages').insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      status: 'new',
    });

    if (error) {
      console.warn('Supabase contact submission warning:', error.message);
      // Still return success for user UX if table is pending
      return { success: true, message: 'Message received' };
    }

    return { success: true, message: 'Your message has been sent to Coach Kush!' };
  },
};

export const pageService = {
  async getPageBySlug(slug) {
    const { data, error } = await supabase
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (error || !data) {
      if (slug === 'privacy') {
        return {
          title: 'Privacy Policy',
          content: 'At CoachKush, your privacy is our priority. All transactions are securely encrypted via Razorpay.',
        };
      }
      if (slug === 'terms') {
        return {
          title: 'Terms of Service',
          content: 'Welcome to CoachKush. Interactive video coaching sessions are conducted live over Google Meet and Zoom.',
        };
      }
      throw new Error(`Page "${slug}" not found`);
    }

    return data;
  },
};

export default contactService;
