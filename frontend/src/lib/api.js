import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('golf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('golf_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
}

// ─── Scores ────────────────────────────────────────────────────────
export const scoresAPI = {
  getMyScores: () => api.get('/scores'),
  addScore: (data) => api.post('/scores', data),
  updateScore: (id, data) => api.put(`/scores/${id}`, data),
  deleteScore: (id) => api.delete(`/scores/${id}`),
}

// ─── Subscriptions ─────────────────────────────────────────────────
export const subscriptionAPI = {
  getPlans: () => api.get('/subscriptions/plans'),
  createCheckout: (planId) => api.post('/subscriptions/checkout', { planId }),
  getStatus: () => api.get('/subscriptions/status'),
  cancel: () => api.post('/subscriptions/cancel'),
  portal: () => api.post('/subscriptions/portal'),
}

// ─── Charities ─────────────────────────────────────────────────────
export const charitiesAPI = {
  getAll: (params) => api.get('/charities', { params }),
  getOne: (id) => api.get(`/charities/${id}`),
  updateMyCharity: (data) => api.put('/charities/my-selection', data),
  donate: (data) => api.post('/charities/donate', data),
  // Admin
  create: (data) => api.post('/charities', data),
  update: (id, data) => api.put(`/charities/${id}`, data),
  remove: (id) => api.delete(`/charities/${id}`),
}

// ─── Draws ─────────────────────────────────────────────────────────
export const drawsAPI = {
  getAll: () => api.get('/draws'),
  getLatest: () => api.get('/draws/latest'),
  getMyHistory: () => api.get('/draws/my-history'),
  // Admin
  simulate: (config) => api.post('/draws/simulate', config),
  publish: (id) => api.post(`/draws/${id}/publish`),
  create: (data) => api.post('/draws', data),
}

// ─── Winners ────────────────────────────────────────────────────────
export const winnersAPI = {
  getMyWinnings: () => api.get('/winners/my-winnings'),
  uploadProof: (id, formData) => api.post(`/winners/${id}/proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // Admin
  getAll: (params) => api.get('/winners', { params }),
  verify: (id, action) => api.post(`/winners/${id}/verify`, { action }),
  markPaid: (id) => api.post(`/winners/${id}/pay`),
}

// ─── Admin ──────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  getUserScores: (userId) => api.get(`/admin/users/${userId}/scores`),
  getAnalytics: () => api.get('/admin/analytics'),
  getDrawStats: () => api.get('/admin/draw-stats'),
}
