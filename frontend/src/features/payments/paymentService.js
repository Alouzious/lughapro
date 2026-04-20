import api from '../../services/api';
export const paymentService = {
  async create(data) { const res = await api.post('/api/payments', data); return res.data; },
  async getMyPayments() { const res = await api.get('/api/payments/me'); return res.data; },
  async getForBooking(bookingId) { const res = await api.get(`/api/payments/booking/${bookingId}`); return res.data; },
};
