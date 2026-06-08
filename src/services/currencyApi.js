import { api } from './api'

const BASE = '/admin/currencies'

export const currencyApi = {
  // GET /api/v1/admin/currencies
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page)     query.set('page',   params.page)
    if (params.limit)    query.set('limit',  params.limit)
    if (params.search)   query.set('search', params.search)
    if (params.isActive !== undefined) query.set('isActive', params.isActive)
    const qs = query.toString()
    return api.get(`${BASE}${qs ? `?${qs}` : ''}`)
  },

  // GET /api/v1/admin/currencies/:id
  getById: (id) => api.get(`${BASE}/${id}`),

  // POST /api/v1/admin/currencies
  create: (payload) => api.post(BASE, payload),

  // PUT /api/v1/admin/currencies/:id
  update: (id, payload) => api.put(`${BASE}/${id}`, payload),

  // DELETE /api/v1/admin/currencies/:id
  delete: (id) => api.delete(`${BASE}/${id}`),

  // PATCH /api/v1/admin/currencies/:id/status
  updateStatus: (id, isActive) =>
    api.patch(`${BASE}/${id}/status`, { isActive }),

  // POST /api/v1/admin/currencies/bulk-update
  bulkUpdate: (currencies) =>
    api.post(`${BASE}/bulk-update`, { currencies }),
}