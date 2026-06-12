import api from '../../services/api';

export const creditService = {
  async me() {
    const res = await api.get('/api/credits/me');
    return res.data;
  },
  async history() {
    const res = await api.get('/api/credits/history');
    return res.data;
  },
  async sync() {
    const res = await api.post('/api/credits/sync');
    return res.data;
  },
};
