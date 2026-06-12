import api from '../../services/api';

export const aiService = {
  async chat(messages) {
    const res = await api.post('/api/ai/chat', { messages });
    return res.data;
  },
  async usage() {
    const res = await api.get('/api/ai/usage');
    return res.data;
  },
};
