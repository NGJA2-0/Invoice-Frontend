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

  updateProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data)
    return response
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
}
