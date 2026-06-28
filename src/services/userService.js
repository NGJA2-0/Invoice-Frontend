import { api } from './api'

export const userService = {
  getProfile: async (userId) => {
    const response = await api.get(`/users/${userId}`)
    return response
  },

  updateProfile: async (userId, data) => {
    const response = await api.put(`/users/${userId}`, data)
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
}
