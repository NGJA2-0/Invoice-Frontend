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

 // GET /api/v1/stage2/officers/:stage2OfficerId/invoices
  getStage2AssignedInvoices: (stage2OfficerId) => api.get(`/stage2/officers/${stage2OfficerId}/invoices`),

  // GET /api/v1/stage3/officers/:stage3OfficerId/invoices
  getStage3AssignedInvoices: (stage3OfficerId) => api.get(`/stage3/officers/${stage3OfficerId}/invoices`),

// GET /api/v1/stage2/invoices/:originalInvoiceId/latest
  getStage2DocumentById: (originalInvoiceId) => api.get(`/stage2/invoices/${originalInvoiceId}/latest`),

  // GET /api/v1/stage3/invoices/:originalInvoiceId/latest
  getStage3DocumentById: (originalInvoiceId) => api.get(`/stage3/invoices/${originalInvoiceId}/latest`),

  // GET /api/v1/stage2/invoices/:originalInvoiceId/history
  getStage2History: (originalInvoiceId) => api.get(`/stage2/invoices/${originalInvoiceId}/history`),

  // POST /api/v1/stage2/invoices/:originalInvoiceId/officers/:stage2OfficerId/edit
  editStage2Invoice: (originalInvoiceId, stage2OfficerId, payload) =>
    api.post(`/stage2/invoices/${originalInvoiceId}/officers/${stage2OfficerId}/edit`, payload),

  // PATCH /api/v1/stage2/invoices/:originalInvoiceId/officers/:stage2OfficerId/status
  updateStage2InvoiceStatus: (originalInvoiceId, stage2OfficerId, payload) =>
    api.patch(`/stage2/invoices/${originalInvoiceId}/officers/${stage2OfficerId}/status`, payload),

  // POST /api/v1/stage2/invoices/:originalInvoiceId/officers/:stage2OfficerId/complete
  completeStage2Invoice: (originalInvoiceId, stage2OfficerId, payload) =>
    api.post(`/stage2/invoices/${originalInvoiceId}/officers/${stage2OfficerId}/complete`, payload),

  // GET /api/v1/stage1/invoices/:originalInvoiceId/latest
  getDocumentById: (originalInvoiceId) => api.get(`/stage1/invoices/${originalInvoiceId}/latest`),

  // GET /api/v1/stage1/invoices/:originalInvoiceId/history
  getHistory: (originalInvoiceId) => api.get(`/stage1/invoices/${originalInvoiceId}/history`),

  // PATCH /api/v1/stage1/invoices/:originalInvoiceId/officers/:officerId/status
  updateInvoiceStatus: (originalInvoiceId, officerId, payload) =>
    api.patch(`/stage1/invoices/${originalInvoiceId}/officers/${officerId}/status`, payload),

  // POST /api/v1/stage1/invoices/:originalInvoiceId/officers/:officerId/complete
  completeInvoice: (originalInvoiceId, officerId, payload) =>
    api.post(`/stage1/invoices/${originalInvoiceId}/officers/${officerId}/complete`, payload),

  // POST /api/v1/stage1/invoices/:originalInvoiceId/officers/:officerId/edit
  editInvoice: (originalInvoiceId, officerId, payload) =>
    api.post(`/stage1/invoices/${originalInvoiceId}/officers/${officerId}/edit`, payload),
}