import { supabase } from '../lib/supabaseClient';

export const DEFAULT_FALLBACK_PRODUCTS = [
  {
    id: 'custom-workout-plan',
    _id: 'custom-workout-plan',
    name: 'Custom Workout Plan',
    title: 'Custom Workout Plan',
    slug: 'custom-workout-plan',
    plan_type: 'single',
    planType: 'single',
    duration: '4 Weeks',
    duration_months: 1,
    sessions: 4,
    price: 5999,
    currency: 'INR',
    sku: 'CK-WORKOUT-PLAN-4W',
    highlighted: false,
    description: 'Tailored training program customized to your equipment, goals, and experience with exercise video cues.',
    features: [
      'Personalized workout plan',
      'Home / Gym workout options',
      'Goal-based training',
      'Progressive workout structure',
      'Weekly workout adjustments',
      'Exercise form/video guidance',
      'Workout duration planning',
      'Injury/limitation considerations',
      'Weekly schedule',
      'WhatsApp support',
    ],
  },
  {
    id: 'diet-plan',
    _id: 'diet-plan',
    name: 'Diet Plan',
    title: 'Diet Plan',
    slug: 'diet-plan',
    plan_type: 'single',
    planType: 'single',
    duration: '4 Weeks',
    duration_months: 1,
    sessions: 4,
    price: 7999,
    currency: 'INR',
    sku: 'CK-DIET-PLAN-4W',
    highlighted: false,
    description: 'Personalized nutrition plan with custom meal options, macro targets, and ongoing diet adjustments.',
    features: [
      'Personalized diet plan',
      'Vegetarian / Non-Vegetarian options',
      'Custom meal plan based on preferences',
      'Weekly diet adjustments',
      'Calorie & macro-based planning',
      'Food allergy/intolerance consideration',
      'Meal timing guidance',
      'Hydration guidance',
      'Practical meal/substitution options',
      'WhatsApp support',
    ],
  },
  {
    id: 's12-single',
    _id: 'bfea34fa-02ce-409f-9227-a9dc6a40dfae',
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
      '12 Live 1-on-1 video sessions',
      'Real-time form cues & posture correction',
      'Personalized workout program',
      'Nutrition & calorie guidance',
      'Weekly form review & adjustments',
      'Direct WhatsApp support with Kush',
    ],
  },
  {
    id: 's12-couple',
    _id: '69e2bcd8-f0c2-4371-afb1-3d0f631518b9',
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
      '12 Live interactive couple sessions',
      'Custom programs for both individuals',
      'Dual nutrition & habit tracking',
      'Simultaneous form correction',
      'Partner motivation & accountability',
      'Dedicated WhatsApp group with Kush',
    ],
  },
  {
    id: 's24-single',
    _id: 'ec864dea-29b2-4343-91e9-538868a55104',
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
      '24 Live 1-on-1 video coaching sessions',
      'Complete periodized transformation plan',
      'Macro & meal plan optimization',
      'Bi-weekly body composition check-ins',
      'Priority schedule booking slots',
      'VIP 24/7 WhatsApp support with Kush',
    ],
  },
  {
    id: 's24-couple',
    _id: 'e5ac4006-80d4-4349-8d4e-7c2749611ada',
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
      '24 Live joint video coaching sessions',
      'Dual transformation periodization',
      'Synchronized dual nutrition strategy',
      'Shared milestone tracking & form audits',
      'Priority partner scheduling slots',
      'Dedicated VIP WhatsApp group with Kush',
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
    duration: p.duration || (p.duration_months ? `${p.duration_months} Month${p.duration_months > 1 ? 's' : ''}` : '4 Weeks'),
    features: featuresList.length > 0 ? featuresList : (p.features || []),
    price: Number(p.price),
  };
};

// In-memory cache & in-flight promise deduplication to prevent duplicate SELECT products queries
let activePlansPromise = null;
let activePlansCache = null;
let activePlansCacheTimestamp = 0;
const PLANS_CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes

let adminTestPlanPromise = null;
let adminTestPlanCache = null;
let adminTestPlanCacheTimestamp = 0;

export const productService = {
  // Clear in-memory product cache (called on admin updates or manual refetch)
  clearCache() {
    activePlansCache = null;
    activePlansCacheTimestamp = 0;
    activePlansPromise = null;
    adminTestPlanCache = null;
    adminTestPlanCacheTimestamp = 0;
    adminTestPlanPromise = null;
  },

  // Fetch active products from PostgreSQL via Supabase with promise & TTL deduplication
  async getActivePlans(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && activePlansCache && now - activePlansCacheTimestamp < PLANS_CACHE_TTL_MS) {
      return activePlansCache;
    }

    if (activePlansPromise) {
      return activePlansPromise;
    }

    activePlansPromise = (async () => {
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
            duration,
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
          .neq('slug', 'admin-test-5rs')
          .order('price', { ascending: true });

        if (error) {
          console.warn('Supabase getActivePlans warning:', error.message);
          return DEFAULT_FALLBACK_PRODUCTS;
        }

        if (!data || data.length === 0) {
          return DEFAULT_FALLBACK_PRODUCTS;
        }

        const formatted = data.map(formatProductRecord);
        activePlansCache = formatted;
        activePlansCacheTimestamp = Date.now();
        return formatted;
      } catch (err) {
        console.warn('productService getActivePlans exception:', err);
        return DEFAULT_FALLBACK_PRODUCTS;
      } finally {
        activePlansPromise = null;
      }
    })();

    return activePlansPromise;
  },

  // Retrieve special ₹5 test payment plan strictly for admin verification
  async getAdminTestPlan(forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh && adminTestPlanCache && now - adminTestPlanCacheTimestamp < PLANS_CACHE_TTL_MS) {
      return adminTestPlanCache;
    }

    if (adminTestPlanPromise) {
      return adminTestPlanPromise;
    }

    adminTestPlanPromise = (async () => {
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
            duration,
            duration_months,
            sessions,
            sku,
            image_url,
            highlighted,
            is_active,
            product_features (id, feature_text, display_order),
            product_images (id, image_url, alt_text, display_order, is_primary)
          `)
          .eq('slug', 'admin-test-5rs')
          .single();

        if (!error && data) {
          const formatted = formatProductRecord(data);
          adminTestPlanCache = formatted;
          adminTestPlanCacheTimestamp = Date.now();
          return formatted;
        }

        const fallback = {
          id: 'a0000000-0000-0000-0000-000000000005',
          _id: 'a0000000-0000-0000-0000-000000000005',
          name: 'Admin Live Test (₹5)',
          title: 'Admin Live Test (₹5)',
          slug: 'admin-test-5rs',
          planType: 'single',
          duration: '1 Session',
          duration_months: 1,
          sessions: 1,
          price: 5,
          currency: 'INR',
          sku: 'CK-ADMIN-TEST-5RS',
          highlighted: false,
          description: 'Live Razorpay production payment pipeline test (₹5 INR verification). Strictly for administrator testing.',
          features: [
            'Live Razorpay ₹5 test order creation',
            'HMAC-SHA256 signature verification test',
            'End-to-end production webhook audit',
            'Immediate enrollment activation verification',
          ],
        };
        adminTestPlanCache = fallback;
        adminTestPlanCacheTimestamp = Date.now();
        return fallback;
      } catch (err) {
        console.warn('getAdminTestPlan fallback:', err);
        return null;
      } finally {
        adminTestPlanPromise = null;
      }
    })();

    return adminTestPlanPromise;
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
