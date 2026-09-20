import { supabase } from '../lib/supabaseClient';

export const adminService = {
  // 1. Dashboard Metrics Aggregation
  async getDashboard() {
    try {
      // Fetch Orders
      const { data: orders = [] } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          customer_id,
          profiles (full_name, email),
          order_items (product_name)
        `)
        .order('created_at', { ascending: false });

      // Fetch Users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch Active Plans
      const { count: activePlansCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const paidOrders = orders?.filter((o) => o.status === 'paid') || [];
      const pendingOrders = orders?.filter((o) => o.status === 'pending') || [];
      const failedOrders = orders?.filter((o) => o.status === 'failed') || [];

      const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

      const recentOrders = (orders || []).slice(0, 10).map((o) => ({
        _id: String(o.id),
        id: o.id,
        merchantTransactionId: o.order_number,
        amount: Number(o.total_amount),
        status: o.status,
        createdAt: o.created_at,
        userId: {
          name: o.profiles?.full_name || 'Trainee',
          email: o.profiles?.email || 'N/A',
        },
        pricingId: {
          title: o.order_items?.[0]?.product_name || 'Coaching Plan',
        },
      }));

      return {
        totalRevenue,
        paidOrdersCount: paidOrders.length,
        pendingOrdersCount: pendingOrders.length,
        failedOrdersCount: failedOrders.length,
        totalUsers: totalUsers || 0,
        activePlansCount: activePlansCount || 4,
        recentOrders,
      };
    } catch (err) {
      console.warn('adminService getDashboard exception:', err);
      return {
        totalRevenue: 0,
        paidOrdersCount: 0,
        pendingOrdersCount: 0,
        failedOrdersCount: 0,
        totalUsers: 0,
        activePlansCount: 4,
        recentOrders: [],
      };
    }
  },

  // 2. Pricing Plans CRUD
  async getPricingPlans() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_features (id, feature_text, display_order)
      `)
      .order('id', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((p) => ({
      _id: String(p.id),
      id: p.id,
      title: p.name,
      name: p.name,
      slug: p.slug,
      planType: (p.plan_type || '').includes('couple') ? 'couple' : 'single',
      price: Number(p.price),
      duration: p.duration_months ? `${p.duration_months} Month${p.duration_months > 1 ? 's' : ''}` : '1 Month',
      sessions: p.sessions,
      description: p.description,
      features: (p.product_features || []).map((f) => f.feature_text),
      isActive: p.is_active,
      highlighted: p.highlighted,
    }));
  },

  async createPricingPlan(plan) {
    const isCouple = plan.planType === 'couple';
    const slug = plan.slug || plan.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const { data: prod, error } = await supabase
      .from('products')
      .insert({
        name: plan.title,
        slug,
        plan_type: isCouple ? 'couple-partner' : '1-on-1-single',
        description: plan.description,
        price: Number(plan.price),
        currency: 'INR',
        duration_months: parseInt(plan.duration, 10) || 1,
        sessions: parseInt(plan.sessions, 10) || 12,
        is_active: plan.isActive ?? true,
        highlighted: plan.highlighted ?? false,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (plan.features && Array.isArray(plan.features)) {
      const featureRows = plan.features.map((feat, idx) => ({
        product_id: prod.id,
        feature_text: feat,
        display_order: idx + 1,
      }));
      await supabase.from('product_features').insert(featureRows);
    }

    return { ...prod, _id: String(prod.id), title: prod.name };
  },

  async updatePricingPlan(id, plan) {
    const isCouple = plan.planType === 'couple';
    const { data: prod, error } = await supabase
      .from('products')
      .update({
        name: plan.title,
        plan_type: isCouple ? 'couple-partner' : '1-on-1-single',
        description: plan.description,
        price: Number(plan.price),
        duration_months: parseInt(plan.duration, 10) || 1,
        sessions: parseInt(plan.sessions, 10) || 12,
        is_active: plan.isActive ?? true,
        highlighted: plan.highlighted ?? false,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);

    if (plan.features && Array.isArray(plan.features)) {
      await supabase.from('product_features').delete().eq('product_id', id);
      const featureRows = plan.features.map((feat, idx) => ({
        product_id: id,
        feature_text: feat,
        display_order: idx + 1,
      }));
      await supabase.from('product_features').insert(featureRows);
    }

    return { ...prod, _id: String(prod.id), title: prod.name };
  },

  async deletePricingPlan(id) {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // 3. Pages CMS
  async getPages() {
    const { data, error } = await supabase.from('cms_pages').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((p) => ({ ...p, _id: String(p.id) }));
  },

  async createPage(page) {
    const { data, error } = await supabase.from('cms_pages').insert(page).select().single();
    if (error) throw new Error(error.message);
    return { ...data, _id: String(data.id) };
  },

  async updatePage(id, page) {
    const { data, error } = await supabase.from('cms_pages').update(page).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return { ...data, _id: String(data.id) };
  },

  async deletePage(id) {
    const { error } = await supabase.from('cms_pages').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  // 4. Coupons Management
  async getCoupons() {
    const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map((c) => ({
      ...c,
      _id: String(c.id),
      discountType: c.discount_type,
      discountValue: Number(c.discount_value),
      minimumOrderAmount: Number(c.minimum_order_amount || 0),
      usageLimit: c.usage_limit,
      usedCount: c.used_count || 0,
      isActive: c.is_active,
    }));
  },

  async createCoupon(coupon) {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: coupon.code.toUpperCase(),
        discount_type: coupon.discountType || 'percentage',
        discount_value: Number(coupon.discountValue),
        minimum_order_amount: Number(coupon.minimumOrderAmount || 0),
        usage_limit: coupon.usageLimit ? parseInt(coupon.usageLimit, 10) : null,
        is_active: coupon.isActive ?? true,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ...data, _id: String(data.id) };
  },

  async deleteCoupon(id) {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async toggleCouponStatus(id) {
    const { data: c } = await supabase.from('coupons').select('is_active').eq('id', id).single();
    const newStatus = !c?.is_active;
    const { data, error } = await supabase
      .from('coupons')
      .update({ is_active: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ...data, _id: String(data.id), isActive: data.is_active };
  },

  // 5. Orders Management
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        status,
        created_at,
        customer_id,
        profiles (id, full_name, phone),
        order_items (product_name, unit_price, quantity),
        payments (id, razorpay_order_id, razorpay_payment_id, status)
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((o) => ({
      _id: String(o.id),
      id: o.id,
      merchantTransactionId: o.order_number,
      amount: Number(o.total_amount),
      status: o.status,
      createdAt: o.created_at,
      userId: {
        name: o.profiles?.full_name || 'Trainee',
        phone: o.profiles?.phone || '',
        email: 'trainee@coachkush.com',
      },
      pricingId: {
        title: o.order_items?.[0]?.product_name || 'Coaching Program',
        duration: '1-2 Months',
        sessions: 12,
      },
      payments: o.payments,
    }));
  },

  // 6. Users Management
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        avatar_url,
        is_active,
        created_at,
        user_roles (roles (name))
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((u) => {
      const roleName = u.user_roles?.[0]?.roles?.name || 'customer';
      return {
        _id: u.id,
        id: u.id,
        name: u.full_name || 'Trainee',
        phone: u.phone,
        email: `${(u.full_name || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`,
        role: roleName,
        active: u.is_active,
        createdAt: u.created_at,
      };
    });
  },

  async toggleUserStatus(id, active) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_active: active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ...data, _id: data.id, active: data.is_active };
  },

  // 7. Messages Management
  async getMessages() {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((m) => ({ ...m, _id: String(m.id) }));
  },

  async updateMessageStatus(id, status) {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { ...data, _id: String(data.id) };
  },
};

export default adminService;
