import api from '../../services/api';
export const adminService = {
  async getStats() { const res = await api.get('/api/admin/stats'); return res.data; },
  async listUsers(params) { const res = await api.get('/api/admin/users', { params }); return res.data; },
  async listTutors(params) { const res = await api.get('/api/admin/tutors', { params }); return res.data; },
  async listStudents(params) { const res = await api.get('/api/admin/students', { params }); return res.data; },
  async listBookings(params) { const res = await api.get('/api/admin/bookings', { params }); return res.data; },
  async listPayments(params) { const res = await api.get('/api/admin/payments', { params }); return res.data; },
  async listDisputes(params) { const res = await api.get('/api/admin/disputes', { params }); return res.data; },
  async updateTutorVerification(tutorId, status) { const res = await api.patch(`/api/admin/tutors/${tutorId}/verification`, { status }); return res.data; },
};
