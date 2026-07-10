import { api } from './api'

export const verificationService = {
  // POST /api/v1/verifications/submit
  // User identity is read from the JWT — no userId in FormData
  submit: async (formData) => {
    const response = await api.postForm('/verifications/submit', formData)
    return response
  },

  // GET /api/v1/verifications/me
  getStatus: async () => {
    const response = await api.get('/verifications/me')
    return response
  },

  // POST /api/v1/verifications/me (update documents)
  updateDocuments: async (formData) => {
    const response = await api.postForm('/verifications/me', formData)
    return response
  },
}
