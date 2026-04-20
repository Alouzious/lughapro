import api from '../../services/api';
export const disputeService = {
  async create(data) { const res = await api.post('/api/disputes', data); return res.data; },
  async getMyDisputes() { const res = await api.get('/api/disputes/me'); return res.data; },
  async updateStatus(id, status) { const res = await api.patch(`/api/disputes/${id}/status`, { status }); return res.data; },
};
