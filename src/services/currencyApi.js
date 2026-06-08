import { api } from './api'

const BASE = '/admin/currencies'

export const currencyApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page)     query.set('page',   params.page)
    if (params.limit)    query.set('limit',  params.limit)
    if (params.search)   query.set('search', params.search)
    if (params.isActive !== undefined) query.set('isActive', params.isActive)
    const qs = query.toString()
    return api.get(`${BASE}${qs ? `?${qs}` : ''}`)
  },

  getById: (id) => api.get(`${BASE}/${id}`),

  create: (payload) => api.post(BASE, payload),

  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  delete: (id) => api.delete(`${BASE}/${id}`),

  updateStatus: (id, isActive) =>
    api.patch(`${BASE}/${id}/status`, { isActive }),

  bulkUpdate: (currencies) =>
    api.post(`${BASE}/bulk-update`, { currencies }),
}