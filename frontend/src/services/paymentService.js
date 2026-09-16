import api from './api';

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

export default paymentService;
