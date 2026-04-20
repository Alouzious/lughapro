import api from '../../services/api';

export const bookingService = {
  async create(data) {
    const res = await api.post('/api/bookings', data);
    return res.data;
  },
  async getMyBookings() {
    const res = await api.get('/api/bookings/me');
    return res.data;
  },
  async updateStatus(bookingId, status) {
    const res = await api.patch(`/api/bookings/${bookingId}/status`, { status });
    return res.data;
  },
};
