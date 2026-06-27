import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || err.message;
    return Promise.reject(new Error(msg));
  }
);

export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getOne: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
};

export const contactsApi = {
  getAll: (params) => api.get('/contacts', { params }),
  getOne: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

export const followUpsApi = {
  getAll: (params) => api.get('/follow-ups', { params }),
  create: (data) => api.post('/follow-ups', data),
  update: (id, data) => api.put(`/follow-ups/${id}`, data),
  complete: (id) => api.patch(`/follow-ups/${id}/complete`),
  delete: (id) => api.delete(`/follow-ups/${id}`),
};

export const interviewsApi = {
  getAll: (params) => api.get('/interviews', { params }),
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
  getToday: () => api.get('/dashboard/today'),
};

export const exportApi = {
  csvJobs: () => window.open('http://localhost:3001/api/export/csv/jobs', '_blank'),
  csvContacts: () => window.open('http://localhost:3001/api/export/csv/contacts', '_blank'),
  excel: () => window.open('http://localhost:3001/api/export/excel', '_blank'),
};

export default api;
