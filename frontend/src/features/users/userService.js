import api from '../../services/api';
export const userService = {
  async getMe() { const res = await api.get('/api/users/me'); return res.data; },
  async updateMe(data) { const res = await api.patch('/api/users/me', data); return res.data; },
};
