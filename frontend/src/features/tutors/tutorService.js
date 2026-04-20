import api from '../../services/api';

export const tutorService = {
  async list(params = {}) {
    const res = await api.get('/api/tutors', { params });
    return res.data;
  },
  async getProfile() {
    const res = await api.get('/api/tutors/profile');
    return res.data;
  },
  async createProfile(data) {
    const res = await api.post('/api/tutors/profile', data);
    return res.data;
  },
  async updateProfile(data) {
    const res = await api.patch('/api/tutors/profile', data);
    return res.data;
  },
  async getRatings(tutorId) {
    const res = await api.get(`/api/tutors/${tutorId}/ratings`);
    return res.data;
  },
  async getAverageRating(tutorId) {
    const res = await api.get(`/api/tutors/${tutorId}/average-rating`);
    return res.data;
  },
};
