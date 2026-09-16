import api from './api';

export const adminService = {
  // Dashboard
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  // Pricing
  async getPricingPlans() {
    const res = await api.get('/admin/pricing');
    return res.data.data;
  },
  async createPricingPlan(plan) {
    const res = await api.post('/admin/pricing', plan);
    return res.data.data;
  },
  async updatePricingPlan(id, plan) {
    const res = await api.put(`/admin/pricing/${id}`, plan);
    return res.data.data;
  },
  async deletePricingPlan(id) {
    const res = await api.delete(`/admin/pricing/${id}`);
    return res.data;
  },

  // Pages CMS
  async getPages() {
    const res = await api.get('/admin/pages');
    return res.data.data;
  },
  async createPage(page) {
    const res = await api.post('/admin/pages', page);
    return res.data.data;
  },
  async updatePage(id, page) {
    const res = await api.put(`/admin/pages/${id}`, page);
    return res.data.data;
  },
  async deletePage(id) {
    const res = await api.delete(`/admin/pages/${id}`);
    return res.data;
  },

  // Orders
  async getOrders() {
    const res = await api.get('/admin/orders');
    return res.data.data;
  },

  // Users
  async getUsers() {
    const res = await api.get('/admin/users');
    return res.data.data;
  },
  async toggleUserStatus(id, active) {
    const res = await api.patch(`/admin/users/${id}/status`, { active });
    return res.data.data;
  },

  // Messages
  async getMessages() {
    const res = await api.get('/admin/messages');
    return res.data.data;
  },
  async updateMessageStatus(id, status) {
    const res = await api.patch(`/admin/messages/${id}/status`, { status });
    return res.data.data;
  },
};
