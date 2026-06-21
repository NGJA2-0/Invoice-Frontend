import { api, fetchWithFallback, API_BASE_URL } from './api'

const BASE = '/items'

// Raw fetch to preserve { data, total } shape — with Render fallback
const getRaw = async (path) => {
  const res = await fetchWithFallback(`${API_BASE_URL}${path}`)
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