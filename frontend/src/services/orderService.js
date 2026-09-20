import { supabase } from '../lib/supabaseClient';
import { paymentService } from './paymentService';

export const orderService = {
  // Master Rule: Frontend sends ONLY pricingId (product_id) and optional couponCode
  async createOrder({ pricingId, couponCode }) {
    return await paymentService.createRazorpayOrder({
      productId: pricingId,
      quantity: 1,
      couponCode,
    });
  },

  // Authoritative Coupon Validation against PostgreSQL coupons table
  async validateCoupon({ code, pricingId }) {
    if (!code) throw new Error('Coupon code is required');
    const cleanCode = code.trim().toUpperCase();

    // 1. Fetch coupon
    const { data: coupon, error: couponErr } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single();

    if (couponErr || !coupon) {
      throw new Error(`Coupon "${cleanCode}" is invalid or expired.`);
    }

    const now = new Date();
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      throw new Error('This coupon is not active yet.');
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      throw new Error('This coupon has expired.');
    }
    if (coupon.usage_limit && (coupon.used_count || 0) >= coupon.usage_limit) {
      throw new Error('This coupon has reached its maximum redemption limit.');
    }

    // 2. Fetch product price if pricingId is provided
    let basePrice = 8999;
    if (pricingId) {
      const { data: prod } = await supabase
        .from('products')
        .select('price')
        .eq('id', pricingId)
        .single();
      if (prod?.price) {
        basePrice = Number(prod.price);
      }
    }

    if (coupon.minimum_order_amount && basePrice < Number(coupon.minimum_order_amount)) {
      throw new Error(`Minimum order of ₹${coupon.minimum_order_amount} required to use this coupon.`);
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      const raw = (basePrice * Number(coupon.discount_value)) / 100;
      discountAmount = coupon.max_discount_amount
        ? Math.min(raw, Number(coupon.max_discount_amount))
        : raw;
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(basePrice, Number(coupon.discount_value));
    }

    return {
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discountAmount,
    };
  },

  // Authoritative verification call
  async verifyPayment(verificationData) {
    return await paymentService.verifyRazorpayPayment(verificationData);
  },

  async getOrder(id) {
    return await paymentService.getPaymentStatus(id);
  },

  async getMyOrders() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        subtotal,
        discount_amount,
        total_amount,
        currency,
        status,
        created_at,
        order_items (id, product_name, unit_price, quantity, subtotal),
        payments (id, razorpay_order_id, razorpay_payment_id, status, paid_at)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('getMyOrders error:', error.message);
      return [];
    }

    return data.map((o) => ({
      _id: String(o.id),
      id: o.id,
      merchantTransactionId: o.order_number,
      amount: Number(o.total_amount),
      status: o.status,
      createdAt: o.created_at,
      planTitle: o.order_items?.[0]?.product_name || 'Coaching Plan',
      items: o.order_items,
      payments: o.payments,
    }));
  },
};

export default orderService;
