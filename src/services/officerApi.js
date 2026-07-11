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

  // GET /api/v1/admin/officers/:id/capacity
  getCapacity: (officerId) => api.get(`${BASE}/officers/${officerId}/capacity`),

  // PUT /api/v1/admin/officers/:id
  update: (id, payload) => api.put(`${BASE}/officers/${id}`, payload),

  // PATCH /api/v1/admin/officers/:id/capacity
  updateCapacity: (id, payload) => api.patch(`${BASE}/officers/${id}/capacity`, payload),

  // DELETE /api/v1/admin/officers/:id
  remove: (id) => api.delete(`${BASE}/officers/${id}`),

  // PATCH /api/v1/admin/officers/transfer-slots
  transferSlots: (payload) => api.patch(`${BASE}/officers/transfer-slots`, payload),

  // GET /api/v1/stage1/my-invoices
  getAssignedInvoices: () => api.get(`/stage1/my-invoices`),

 // GET /api/v1/stage2/my-invoices
  getStage2AssignedInvoices: () => api.get(`/stage2/my-invoices`),

  // GET /api/v1/stage3/my-invoices
  getStage3AssignedInvoices: () => api.get(`/stage3/my-invoices`),

// GET /api/v1/stage2/invoices/:originalInvoiceId/latest
  getStage2DocumentById: (originalInvoiceId) => api.get(`/stage2/invoices/${originalInvoiceId}/latest`),

  // GET /api/v1/stage3/invoices/:originalInvoiceId/latest
  getStage3DocumentById: (originalInvoiceId) => api.get(`/stage3/invoices/${originalInvoiceId}/latest`),

  // GET /api/v1/stage2/invoices/:originalInvoiceId/history
  getStage2History: (originalInvoiceId) => api.get(`/stage2/invoices/${originalInvoiceId}/history`),

  // GET /api/v1/stage3/invoices/:originalInvoiceId/history
  getStage3History: (originalInvoiceId) => api.get(`/stage3/invoices/${originalInvoiceId}/history`),

  // POST /api/v1/stage2/invoices/:originalInvoiceId/propose-edits
  editStage2Invoice: (originalInvoiceId, payload) =>
    api.post(`/stage2/invoices/${originalInvoiceId}/propose-edits`, payload),

  // POST /api/v1/stage3/invoices/:originalInvoiceId/propose-edits
  editStage3Invoice: (originalInvoiceId, payload) =>
    api.post(`/stage3/invoices/${originalInvoiceId}/propose-edits`, payload),

  // PATCH /api/v1/stage3/invoices/:originalInvoiceId/reject
  rejectStage3Invoice: (originalInvoiceId, payload) =>
    api.patch(`/stage3/invoices/${originalInvoiceId}/reject`, payload),

  // POST /api/v1/stage3/invoices/:originalInvoiceId/complete
  completeStage3Invoice: (originalInvoiceId, payload) =>
    api.post(`/stage3/invoices/${originalInvoiceId}/complete`, payload),

  // PATCH /api/v1/stage2/invoices/:originalInvoiceId/status
  updateStage2InvoiceStatus: (originalInvoiceId, payload) =>
    api.patch(`/stage2/invoices/${originalInvoiceId}/status`, payload),

  // POST /api/v1/stage2/invoices/:originalInvoiceId/complete
  completeStage2Invoice: (originalInvoiceId, payload) =>
    api.post(`/stage2/invoices/${originalInvoiceId}/complete`, payload),

  // GET /api/v1/stage1/invoices/:originalInvoiceId/latest
  getDocumentById: (originalInvoiceId) => api.get(`/stage1/invoices/${originalInvoiceId}/latest`),

  // GET /api/v1/stage1/invoices/:originalInvoiceId/history
  getHistory: (originalInvoiceId) => api.get(`/stage1/invoices/${originalInvoiceId}/history`),

  // PATCH /api/v1/stage1/invoices/:originalInvoiceId/status
  updateInvoiceStatus: (originalInvoiceId, payload) =>
    api.patch(`/stage1/invoices/${originalInvoiceId}/status`, payload),

  // POST /api/v1/stage1/invoices/:originalInvoiceId/complete
  completeInvoice: (originalInvoiceId, payload) =>
    api.post(`/stage1/invoices/${originalInvoiceId}/complete`, payload),

  // POST /api/v1/stage1/invoices/:originalInvoiceId/propose-edits
  editInvoice: (originalInvoiceId, payload) =>
    api.post(`/stage1/invoices/${originalInvoiceId}/propose-edits`, payload),
}