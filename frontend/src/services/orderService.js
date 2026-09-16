import api from './api';

export const orderService = {
  // Master Rule: Frontend sends ONLY pricingId. Amount is authoritative on backend.
  async createOrder(pricingId) {
    const res = await api.post('/orders', { pricingId });
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
