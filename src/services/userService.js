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

  getInvoices: async (userId) => {
    const response = await api.get(`/users/${userId}/invoices`)
    return response
  },
}
