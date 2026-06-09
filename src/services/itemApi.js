import { api } from './api'

const BASE = '/items'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Raw fetch to preserve { data, total } shape
const getRaw = async (path) => {
  const res = await fetch(`${API_BASE_URL}${path}`)
  return res.json()
}

export const itemApi = {
  getAll: () => getRaw(BASE),

  search: (q) => getRaw(`${BASE}/search?q=${encodeURIComponent(q)}`),

  suggest: (q) => getRaw(`${BASE}/suggest?q=${encodeURIComponent(q)}`),

  create: (payload) => api.post(BASE, payload),

  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  delete: (id) => api.delete(`${BASE}/${id}`),
}