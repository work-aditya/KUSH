import api from './api';

export const contactService = {
  async submitMessage(data) {
    const res = await api.post('/contact', data);
    return res.data;
  },
};

export const pageService = {
  async getPageBySlug(slug) {
    const res = await api.get(`/pages/${slug}`);
    return res.data.data;
  },
};
