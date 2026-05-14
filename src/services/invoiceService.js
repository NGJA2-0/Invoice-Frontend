import { api } from './api'

export const invoiceService = {
  create: async (invoiceData) => {
    const response = await api.post('/invoices', invoiceData)
    return response
  },

  getById: async (invoiceId) => {
    const response = await api.get(`/invoices/${invoiceId}`)
    return response
  },

  updateDraft: async (invoiceId, data) => {
    const response = await api.put(`/invoices/${invoiceId}`, data)
    return response
  },

  delete: async (invoiceId) => {
    const response = await api.delete(`/invoices/${invoiceId}`)
    return response
  },

  generateNumber: async () => {
    const response = await api.get('/invoices/generate-number')
    return response
  },

  getByUser: async (userId) => {
    const response = await api.get(`/users/${userId}/invoices`)
    return response
  },
}
