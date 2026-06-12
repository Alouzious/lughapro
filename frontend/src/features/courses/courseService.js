import api from '../../services/api';

export const courseService = {
  async list(params = {}) {
    const res = await api.get('/api/courses', { params });
    return res.data;
  },
  async mine() {
    const res = await api.get('/api/courses/mine');
    return res.data;
  },
  async get(id) {
    const res = await api.get(`/api/courses/${id}`);
    return res.data;
  },
  async create(data) {
    const res = await api.post('/api/courses', data);
    return res.data;
  },
  async update(id, data) {
    const res = await api.patch(`/api/courses/${id}`, data);
    return res.data;
  },
  async publish(id) {
    const res = await api.post(`/api/courses/${id}/publish`);
    return res.data;
  },
  async addModule(courseId, data) {
    const res = await api.post(`/api/courses/${courseId}/modules`, data);
    return res.data;
  },
  async updateModule(moduleId, data) {
    const res = await api.patch(`/api/modules/${moduleId}`, data);
    return res.data;
  },
  async deleteModule(moduleId) {
    const res = await api.delete(`/api/modules/${moduleId}`);
    return res.data;
  },
  async reorderModules(courseId, moduleIds) {
    const res = await api.patch('/api/modules/reorder', { course_id: courseId, module_ids: moduleIds });
    return res.data;
  },
  // Enrollment + progress
  async enroll(courseId, data = {}) {
    const res = await api.post(`/api/courses/${courseId}/enroll`, data);
    return res.data;
  },
  async progress(courseId) {
    const res = await api.get(`/api/courses/${courseId}/progress`);
    return res.data;
  },
  async myEnrollments() {
    const res = await api.get('/api/enrollments/me');
    return res.data;
  },
  async completeModule(moduleId) {
    const res = await api.post(`/api/modules/${moduleId}/complete`);
    return res.data;
  },
  async getQuiz(moduleId) {
    const res = await api.get(`/api/modules/${moduleId}/quiz`);
    return res.data;
  },
  async submitQuiz(moduleId, answers) {
    const res = await api.post(`/api/modules/${moduleId}/quiz-submit`, { answers });
    return res.data;
  },
  async quizResult(moduleId) {
    const res = await api.get(`/api/modules/${moduleId}/quiz-result`);
    return res.data;
  },
  // Admin
  async approve(courseId) {
    const res = await api.post(`/api/admin/courses/${courseId}/approve`);
    return res.data;
  },
};
