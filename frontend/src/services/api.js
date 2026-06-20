import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/* ===== Auth ===== */
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password });

export const register = (name, email, password) =>
  api.post('/api/auth/register', { name, email, password });

/* ===== Reports ===== */
export const createReport = (data) =>
  api.post('/api/reports', data);

export const getMyReports = () =>
  api.get('/api/reports/my');

export const getReport = (id) =>
  api.get(`/api/reports/${id}`);

export const deleteReport = (id) =>
  api.delete(`/api/reports/${id}`);

/* ===== Admin ===== */
export const getAdminReports = () =>
  api.get('/api/admin/reports');

export const updateReportStatus = (id, status) =>
  api.patch(`/api/admin/reports/${id}/status`, { status });

export const getAdminUsers = () =>
  api.get('/api/admin/users');

export const getAdminUser = (id) =>
  api.get(`/api/admin/users/${id}`);

export const updateUserRole = (id, role) =>
  api.patch(`/api/admin/users/${id}/role?role=${role}`);

export const deleteUser = (id) =>
  api.delete(`/api/admin/users/${id}`);

/* ===== AI Service ===== */
export const askAi = (question) =>
  api.post('/api/ai/ask', { question });

export default api;
