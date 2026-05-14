import { api } from './api'

export const adminService = {
  getPendingRegistrations: async () => {
    const response = await api.get('/admin/registrations/pending')
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
