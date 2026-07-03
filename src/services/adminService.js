import { api } from './api'

export const adminService = {
  getPendingRegistrations: async () => {
    const response = await api.get('/admin/registrations/pending')
    return response
  },

  // Fetches pending "data edit request" submissions (tin / stockValue / gemDealerFileNo changes).
  // Backend auto-scopes results by the caller's X-User-Id (added automatically by api.get),
  // so admins only see requests assigned to them while super admins see everything.
  getEditRequests: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit })
    const response = await api.get(`/admin/edit-requests?${params.toString()}`)
    return response
  },

  getAllUsers: async () => {
    const response = await api.get('/admin/users')
    return response
  },

  approveDealer: async (userId, data) => {
    const response = await api.put(`/admin/dealers/${userId}/approve`, data)
    return response
  },

  rejectDealer: async (userId, data) => {
    const response = await api.put(`/admin/dealers/${userId}/reject`, data)
    return response
  },

  getApprovedDealers: async () => {
    const response = await api.get('/admin/dealers/approved')
    return response || []
  },

  getRejectedDealers: async () => {
    const response = await api.get('/admin/dealers/rejected')
    return response || []
  },
}
