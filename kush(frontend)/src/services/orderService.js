import api from './api';

export const orderService = {
  // Master Rule: Frontend sends ONLY pricingId and optional couponCode. Amount is authoritative on backend.
  async createOrder({ pricingId, couponCode }) {
    const payload = { pricingId };
    if (couponCode) payload.couponCode = couponCode;
    const res = await api.post('/orders', payload);
    return res.data.data;
  },

  async validateCoupon({ code, pricingId }) {
    const res = await api.post('/coupons/validate', { code, pricingId });
    return res.data.data;
  },

  async verifyPayment(verificationData) {
    const res = await api.post('/payments/verify', verificationData);
    return res.data.data;
  },

  async getOrder(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },

  async getMyOrders() {
    const res = await api.get('/orders/my');
    return res.data.data;
  },
};

export const paymentService = {
  // Never trust client-side status. Query authoritative backend endpoint.
  async getPaymentStatus(merchantTransactionId) {
    const res = await api.get(`/payments/status/${merchantTransactionId}`);
    return res.data.data;
  },

  getInvoiceDownloadUrl(orderId) {
    const base = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` 
      : '/api';
    return `${base}/invoices/${orderId}/download`;
  },
};
