import api from './api';

export const pricingService = {
  async getActivePlans() {
    const res = await api.get('/pricing');
    return res.data.data;
  },

  async getPlanById(id) {
    const res = await api.get(`/pricing/${id}`);
    return res.data.data;
  },
};
