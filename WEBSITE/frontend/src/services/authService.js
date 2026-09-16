import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    return res.data.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },

  async adminLogin(credentials) {
    const res = await api.post('/auth/admin-login', credentials);
    return res.data.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data?.user;
  },
};
