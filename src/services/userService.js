import { api } from './api'

export const userService = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response
  },

   // GET /api/v1/invoices/:id
  getInvoiceById: async (invoiceId, userId) => {
    const response = await api.get(`/invoices/${invoiceId}`, {
      headers: { 'X-User-Id': userId },
    })
    return response
  },

  // POST /api/v1/invoices/:id/pdf — returns { data: <invoiceData>, meta, sections }
  // matching exactly what InvoicePreview expects as its `preview` prop.
  // api.post() auto-attaches X-User-Id and unwraps payload.data for us.
  getInvoicePdfData: async (invoiceId) => {
    const response = await api.post(`/invoices/${invoiceId}/pdf`)
    return response
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data)
    return response
  },

  // POST /api/v1/users/edit-requests — regulated fields, requires admin approval
  // api.post() automatically attaches X-User-Id from localStorage via request()
  submitEditRequest: async (data) => {
    const response = await api.post('/users/edit-requests', data)
    return response
  },

  // GET /api/v1/stock-values — list of available stock value brackets
  getStockValues: async () => {
    const response = await api.get('/stock-values', { raw: true })
    return Array.isArray(response?.data) ? response.data : []
  },

  // PUT /api/v1/users/details — partial update, only send changed fields
  // api.put() automatically attaches X-User-Id from localStorage via request()
  updateUserDetails: async (data) => {
    const response = await api.put('/users/details', data)
    return response
  },

  getInvoices: async (userId, { page = 1, pageSize = 10, status, sort = 'date_desc' } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('pageSize', pageSize)
    if (status) params.set('status', status)
    if (sort) params.set('sort', sort)

    const response = await api.get(
      `/invoices/user/${userId}?${params.toString()}`,
      { headers: { 'X-User-Id': userId } }
    )
    return response
  },

  getFavorites: async (userId, { page, pageSize } = {}) => {
    const params = new URLSearchParams()
    if (page) params.set('page', page)
    if (pageSize) params.set('pageSize', pageSize)
    const query = params.toString()

    const response = await api.get(
      `/invoices/favorites/${userId}${query ? `?${query}` : ''}`,
      { raw: true }
    )
    return response
  },

  removeFavorite: async (invoiceId, userId) => {
    const response = await api.delete(
      `/invoices/favorites/${invoiceId}?userId=${userId}`
    )
    return response
  },

  addFavorite: async (userId, invoiceId) => {
    const response = await api.post('/invoices/favorites', {
      userId,
      invoiceId,
    })
    return response
  },

  // GET /api/v1/invoices/total — returns { totalInvoices, xUserID }
  // api.get() automatically attaches X-User-Id from localStorage via request()
  getTotalInvoices: async (userId) => {
    const response = await api.get('/invoices/total', {
      headers: { 'X-User-Id': userId },
    })
    return response
  },

  // GET /api/v1/invoices/status-count?status=<status> — returns { status, totalInvoices, xUserID }
  getInvoiceCountByStatus: async (userId, status) => {
    const response = await api.get(`/invoices/status-count?status=${status}`, {
      headers: { 'X-User-Id': userId },
    })
    return response
  },
}
