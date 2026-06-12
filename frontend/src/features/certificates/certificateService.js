import api from '../../services/api';

export const certificateService = {
  async me() {
    const res = await api.get('/api/certificates/me');
    return res.data;
  },
  async verify(txHash) {
    const res = await api.get(`/api/certificates/verify/${txHash}`);
    return res.data;
  },
  async mint(studentId, level) {
    const res = await api.post('/api/certificates/mint', { student_id: studentId, level });
    return res.data;
  },
};
