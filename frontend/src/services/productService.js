import { supabase } from '../lib/supabaseClient';

export const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: 's12-single',
    _id: 's12-single',
    name: 'Session 12 - Single',
    title: 'Session 12 - Single',
    slug: 'session-12-single',
    plan_type: 'single',
    planType: 'single',
    duration: '1 Month',
    duration_months: 1,
    sessions: 12,
    price: 8999,
    currency: 'INR',
    sku: 'CK-S12-SINGLE',
    highlighted: false,
    description: '1-month personalized fitness coaching plan',
    features: [
      '12 Live 1-on-1 Video Sessions',
      'Personalized Workout Program',
      'Nutrition & Calorie Guidance',
      'Weekly Form Review & Adjustments',
      'Direct WhatsApp Support with Kush',
    ],
  },
  {
    id: 's12-couple',
    _id: 's12-couple',
    name: 'Session 12 - Couple',
    title: 'Session 12 - Couple',
    slug: 'session-12-couple',
    plan_type: 'couple',
    planType: 'couple',
    duration: '1 Month',
    duration_months: 1,
    sessions: 12,
    price: 14999,
    currency: 'INR',
    sku: 'CK-S12-COUPLE',
    highlighted: false,
    description: '1-month joint fitness coaching plan',
    features: [
      '12 Joint Video Sessions',
      'Custom Programs for Both Individuals',
      'Dual Nutrition & Habit Tracking',
      'Partner Motivation & Accountability',
      'Dedicated WhatsApp Group with Kush',
    ],
  },
  {
    id: 's24-single',
    _id: 's24-single',
    name: 'Session 24 - Single',
    title: 'Session 24 - Single',
    slug: 'session-24-single',
    plan_type: 'single',
    planType: 'single',
    duration: '2 Months',
    duration_months: 2,
    sessions: 24,
    price: 14999,
    currency: 'INR',
    sku: 'CK-S24-SINGLE',
    highlighted: true,
    description: '2-month personalized transformation coaching plan',
    features: [
      '24 Live 1-on-1 Video Sessions',
      'Complete Periodized Transformation Plan',
      'Macro & Meal Plan Optimization',
      'Bi-weekly Body Composition Check-ins',
      'Priority Schedule Slots & 24/7 WhatsApp',
    ],
  },
  {
    id: 's24-couple',
    _id: 's24-couple',
    name: 'Session 24 - Couple',
    title: 'Session 24 - Couple',
    slug: 'session-24-couple',
    plan_type: 'couple',
    planType: 'couple',
    duration: '2 Months',
    duration_months: 2,
    sessions: 24,
    price: 24999,
    currency: 'INR',
    sku: 'CK-S24-COUPLE',
    highlighted: false,
    description: '2-month joint transformation coaching plan',
    features: [
      '24 Joint Video Coaching Sessions',
      'Dual Transformation Periodization',
      'Sync\'d Nutrition Strategy',
      'Shared Milestone Tracking & Form Audits',
      'VIP WhatsApp Support with Kush',
    ],
  },
];

const formatProductRecord = (p) => {
  const isCouple = (p.plan_type || '').toLowerCase().includes('couple');
  const featuresList = (p.product_features || [])
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((f) => f.feature_text);

  return {
    ...p,
    _id: String(p.id),
    title: p.name,
    planType: isCouple ? 'couple' : 'single',
    duration: p.duration_months ? `${p.duration_months} Month${p.duration_months > 1 ? 's' : ''}` : '1 Month',
    features: featuresList.length > 0 ? featuresList : (p.features || []),
    price: Number(p.price),
  };
};

export const productService = {
  // Fetch active products from PostgreSQL via Supabase
  async getActivePlans() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          category_id,
          name,
          slug,
          plan_type,
          description,
          price,
          currency,
          duration_months,
          sessions,
          sku,
          image_url,
          highlighted,
          is_active,
          product_features (id, feature_text, display_order),
          product_images (id, image_url, alt_text, display_order, is_primary)
        `)
        .eq('is_active', true)
        .order('id', { ascending: true });

      if (error) {
        console.warn('Supabase getActivePlans warning:', error.message);
        return DEFAULT_FALLBACK_PRODUCTS;
      }

      if (!data || data.length === 0) {
        return DEFAULT_FALLBACK_PRODUCTS;
      }

      return data.map(formatProductRecord);
    } catch (err) {
      console.warn('productService getActivePlans exception:', err);
      return DEFAULT_FALLBACK_PRODUCTS;
    }
  },

  async getPlanById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_features (id, feature_text, display_order),
          product_images (id, image_url, alt_text, display_order, is_primary)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        return DEFAULT_FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id)) || null;
      }

      return formatProductRecord(data);
    } catch (err) {
      return DEFAULT_FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id)) || null;
    }
  },

  async getPlanBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_features (id, feature_text, display_order),
          product_images (id, image_url, alt_text, display_order, is_primary)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return DEFAULT_FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
      }

      return formatProductRecord(data);
    } catch (err) {
      return DEFAULT_FALLBACK_PRODUCTS.find((p) => p.slug === slug) || null;
    }
  },
};

export default productService;
