import { api } from './api'

const BASE = '/items'

export const itemApi = {
  getAll: () => api.get(BASE),

  search: (q) => api.get(`${BASE}/search?q=${encodeURIComponent(q)}`),

  suggest: (q) => api.get(`${BASE}/suggest?q=${encodeURIComponent(q)}`),

  create: (payload) => api.post(BASE, payload),

  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  delete: (id) => api.delete(`${BASE}/${id}`),
}