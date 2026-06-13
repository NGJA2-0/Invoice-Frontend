import { api } from './api'

const BASE = '/stock-values'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const getRaw = async (path) => {
  const res = await fetch(`${API_BASE_URL}${path}`)
  return res.json()
}

export const stockValueApi = {
  getAll: () => getRaw(BASE),
  create: (payload) => api.post(BASE, payload),
  update: (id, payload) => api.put(`${BASE}/${id}`, payload),
  delete: (id) => api.delete(`${BASE}/${id}`),
}