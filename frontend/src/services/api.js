import axios from 'axios';
import { API_BASE_URL } from '../constants/config.js';
import { store } from '../store/store.js';
import { setCredentials, logoutLocal } from '../features/auth/authSlice.js';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

let csrfToken = null;
const rawApi = axios.create({ baseURL: API_BASE_URL, withCredentials: true });

const ensureCsrf = async () => {
  if (csrfToken) return csrfToken;
  const response = await rawApi.get('/csrf-token');
  csrfToken = response.data.csrfToken;
  return csrfToken;
};

api.interceptors.request.use(async (config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method) && !config.headers.Authorization) {
    config.headers['CSRF-Token'] = await ensureCsrf();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/auth/refresh')) {
      original._retry = true;
      try {
        const refreshed = await api.post('/auth/refresh');
        store.dispatch(setCredentials(refreshed.data));
        original.headers.Authorization = `Bearer ${refreshed.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        store.dispatch(logoutLocal());
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const endpoints = {
  auth: {
    me: () => api.get('/auth/me'),
    login: (payload) => api.post('/auth/login', payload),
    signup: (payload) => api.post('/auth/signup', payload),
    logout: () => api.post('/auth/logout'),
    forgot: (payload) => api.post('/auth/forgot-password', payload),
    reset: (payload) => api.post('/auth/reset-password', payload),
    verify: (payload) => api.post('/auth/verify-email', payload),
    updateProfile: (payload) => api.patch('/auth/profile', payload),
    changePassword: (payload) => api.patch('/auth/password', payload)
  },
  properties: {
    list: (params) => api.get('/properties', { params }),
    featured: () => api.get('/properties/featured'),
    detail: (slug) => api.get(`/properties/${slug}`),
    similar: (id) => api.get(`/properties/${id}/similar/list`),
    create: (payload) => api.post('/properties', payload),
    update: (id, payload) => api.patch(`/properties/${id}`, payload),
    uploadAssets: (id, formData) => api.post(`/properties/${id}/assets`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    remove: (id) => api.delete(`/properties/${id}`),
    wishlist: () => api.get('/properties/wishlist/me'),
    toggleWishlist: (id) => api.post(`/properties/${id}/wishlist`)
  },
  bookings: {
    list: (params) => api.get('/bookings', { params }),
    create: (payload) => api.post('/bookings', payload),
    updateStatus: (id, payload) => api.patch(`/bookings/${id}/status`, payload)
  },
  payments: {
    list: () => api.get('/payments'),
    create: (payload) => api.post('/payments', payload)
  },
  reviews: {
    create: (payload) => api.post('/reviews', payload),
    list: (params) => api.get('/reviews', { params })
  },
  chats: {
    list: () => api.get('/chats'),
    create: (payload) => api.post('/chats', payload),
    messages: (chatId) => api.get(`/chats/${chatId}/messages`),
    send: (chatId, payload) => api.post(`/chats/${chatId}/messages`, payload)
  },
  notifications: {
    list: () => api.get('/notifications'),
    read: (payload) => api.patch('/notifications/read', payload)
  },
  admin: {
    analytics: () => api.get('/admin/analytics'),
    agents: () => api.get('/admin/agents'),
    reports: () => api.get('/admin/reports'),
    updateReport: (id, payload) => api.patch(`/admin/reports/${id}`, payload),
    moderate: (id, payload) => api.patch(`/admin/listings/${id}/moderate`, payload),
    approveAgent: (id, payload) => api.patch(`/admin/agents/${id}/verification`, payload),
    announce: (payload) => api.post('/admin/announcements', payload)
  },
  users: {
    list: (params) => api.get('/users', { params }),
    status: (id, payload) => api.patch(`/users/${id}/status`, payload),
    report: (payload) => api.post('/users/reports', payload)
  },
  agent: {
    me: () => api.get('/agents/me'),
    save: (payload) => api.put('/agents/me', payload),
    analytics: () => api.get('/agents/analytics')
  }
};
