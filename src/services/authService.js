import { api } from './api'

export const authService = {
  // Verify username and get user info
  verifyUsername: async (username) => {
    const response = await api.post('/auth/verify-username', {
      username,
    })
    return response
  },

  // User login
  userLogin: async (username, password) => {
    const response = await api.post('/auth/user-login', {
      username,
      password,
    })
    return response
  },

  // Admin login
  adminLogin: async (username, password) => {
    const response = await api.post('/auth/admin-login', {
      username,
      password,
    })
    return response
  },

  // Sign up
  signup: async (payload) => {
    const response = await api.post('/auth/signup', payload)
    return response
  },

  // Legacy methods for backward compatibility
  login: async (username, password) => {
    // First verify username
    const verified = await authService.verifyUsername(username)
    if (!verified.isAdmin) {
      return authService.userLogin(username, password)
    } else {
      return authService.adminLogin(username, password)
    }
  },
}
