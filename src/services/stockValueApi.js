import { api, fetchWithFallback, API_BASE_URL } from './api'

const BASE = '/stock-values'

// Raw fetch — with Render fallback
const getRaw = async (path) => {
  const res = await fetchWithFallback(`${API_BASE_URL}${path}`)
  return res.json()
}

export const stockValueApi = {
  getAll: () => getRaw(BASE),
  create: (payload) => api.post(BASE, payload),
  update: (id, payload) => api.put(`${BASE}/${id}`, payload),
  delete: (id) => api.delete(`${BASE}/${id}`),
}