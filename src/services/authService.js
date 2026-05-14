import { api } from './api'

export const authService = {
  signup: async (fullName, nic, email, phone, password, role, tin = '', vat = '') => {
    const response = await api.post('/auth/signup', {
      fullName,
      nic,
      email,
      phone,
      password,
      role: role || 'user',
      tin,
      vat,
      contactInfo: {
        email,
        phone,
      },
    })
    return response
  },

  login: async (nic, password) => {
    const response = await api.post('/auth/login', {
      nic,
      password,
    })
    return response
  },
}
