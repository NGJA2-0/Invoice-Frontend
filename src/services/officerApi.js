import { api } from './api'

const BASE = '/admin'

export const officerApi = {
  // GET /api/v1/admin/admins
  getAdmins: () => api.get(`${BASE}/admins`),

  // POST /api/v1/admin/officers
  create: (payload) => api.post(`${BASE}/officers`, payload),

  // GET /api/v1/admin/officers/by-admin/:adminId
  getByAdmin: (adminId) => api.get(`${BASE}/officers/by-admin/${adminId}`),

  // GET /api/v1/admin/officers/grouped
  getGrouped: () => api.get(`${BASE}/officers/grouped`),

  // PUT /api/v1/admin/officers/:id
  update: (id, payload) => api.put(`${BASE}/officers/${id}`, payload),

  // DELETE /api/v1/admin/officers/:id
  remove: (id) => api.delete(`${BASE}/officers/${id}`),

  // GET /api/v1/stage1/officers/:officerId/invoices
  getAssignedInvoices: (officerId) => api.get(`/stage1/officers/${officerId}/invoices`),

  // GET /api/v1/stage1/documents/:id
  getDocumentById: (id) => api.get(`/stage1/documents/${id}`),
}