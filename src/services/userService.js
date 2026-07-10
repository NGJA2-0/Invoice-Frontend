import { api } from './api'

export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/me')
    return response
  },

  // GET /api/v1/invoices/:id
  getInvoiceById: async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}`)
    return response
  },

  // Valid stages: 'stage1' | 'stage2' | 'stage3'

  // GET /api/v1/:stage/invoices/:originalInvoiceId/users/:userId/proposed-edits
  // returns { originalData, proposedData }
  // Note: officer-facing route — userId still required in URL (officer workflow unchanged)
  getProposedEdits: async (stage, originalInvoiceId, userId) => {
    const response = await api.get(
      `/${stage}/invoices/${originalInvoiceId}/users/${userId}/proposed-edits`,
    )
    return response
  },

  // POST /api/v1/:stage/invoices/:originalInvoiceId/users/:userId/review-edits
  // body: { approved: boolean, rejectionReason: string }
  // Note: officer-facing route — userId still required in URL (officer workflow unchanged)
  reviewProposedEdits: async (stage, originalInvoiceId, userId, { approved, rejectionReason }) => {
    const response = await api.post(
      `/${stage}/invoices/${originalInvoiceId}/users/${userId}/review-edits`,
      { approved, rejectionReason },
    )
    return response
  },

  // POST /api/v1/invoices/:id/pdf — returns { data: <invoiceData>, meta, sections }
  // matching exactly what InvoicePreview expects as its `preview` prop.
  getInvoicePdfData: async (invoiceId) => {
    const response = await api.post(`/invoices/${invoiceId}/pdf`)
    return response
  },

  updateProfile: async (data) => {
    const response = await api.put('/users/me', data)
    return response
  },

  // POST /api/v1/users/me/edit-requests — regulated fields, requires admin approval
  submitEditRequest: async (data) => {
    const response = await api.post('/users/me/edit-requests', data)
    return response
  },

  // GET /api/v1/stock-values — list of available stock value brackets
  getStockValues: async () => {
    const response = await api.get('/stock-values', { raw: true })
    return Array.isArray(response?.data) ? response.data : []
  },

  // PUT /api/v1/users/me/details — partial update, only send changed fields
  updateUserDetails: async (data) => {
    const response = await api.put('/users/me/details', data)
    return response
  },

  getInvoices: async ({ page = 1, pageSize = 10, status, sort = 'date_desc' } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('pageSize', pageSize)
    if (status) params.set('status', status)
    if (sort) params.set('sort', sort)

    const response = await api.get(`/invoices/my-invoices?${params.toString()}`)
    return response
  },

  getFavorites: async ({ page, pageSize } = {}) => {
    const params = new URLSearchParams()
    if (page) params.set('page', page)
    if (pageSize) params.set('pageSize', pageSize)
    const query = params.toString()

    const response = await api.get(
      `/invoices/favorites${query ? `?${query}` : ''}`,
      { raw: true }
    )
    return response
  },

  removeFavorite: async (invoiceId) => {
    const response = await api.delete(`/invoices/favorites/${invoiceId}`)
    return response
  },

  addFavorite: async (invoiceId) => {
    const response = await api.post('/invoices/favorites', { invoiceId })
    return response
  },

  // GET /api/v1/invoices/total
  getTotalInvoices: async () => {
    const response = await api.get('/invoices/total')
    return response
  },

  // GET /api/v1/invoices/status-count?status=<status>
  getInvoiceCountByStatus: async (status) => {
    const response = await api.get(`/invoices/status-count?status=${status}`)
    return response
  },

  // GET /api/v1/invoices/my-invoices/actionable
  // returns { total, page, pageSize, totalPages, invoices: [...] }
  getActionableInvoices: async ({ page = 1, pageSize = 10 } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('pageSize', pageSize)

    const response = await api.get(
      `/invoices/my-invoices/actionable?${params.toString()}`,
      { raw: true },
    )
    return response
  },
}
