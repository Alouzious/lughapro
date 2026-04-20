import api from '../../services/api';

export const ratingService = {
  async create(data) {
    const res = await api.post('/api/ratings', data);
    return res.data;
  },
};
