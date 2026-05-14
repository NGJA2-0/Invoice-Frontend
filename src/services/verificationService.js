import { api } from './api'

export const verificationService = {
  submit: async (formData) => {
    const response = await api.postForm('/verifications/submit', formData)
    return response
  },

  getStatus: async (userId) => {
    const response = await api.get(`/verifications/${userId}`)
    return response
  },

  updateDocuments: async (userId, formData) => {
    const response = await api.postForm(`/verifications/${userId}`, formData)
    return response
  },
}
