import { api } from './api'

export const adminService = {
  getPendingRegistrations: async () => {
    const response = await api.get('/admin/registrations/pending')
    return response
  },

  // Fetches pending "data edit request" submissions (tin / stockValue / gemDealerFileNo changes).
  // Backend auto-scopes results by the caller's identity from the JWT Bearer token —
  // admins only see requests assigned to them while super admins see everything.
  getEditRequests: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit })
    const response = await api.get(`/admin/edit-requests?${params.toString()}`)
    return response
  },

  approveEditRequest: async (id, data) => {
    const response = await api.put(`/admin/edit-requests/${id}/approve`, data)
    return response
  },

  rejectEditRequest: async (id, data) => {
    const response = await api.put(`/admin/edit-requests/${id}/reject`, data)
    return response
  },

  // Paginated + filterable users summary for the admin Users table.
  // status is optional: 'pending' | 'approved' | 'rejected'
  getUsersSummary: async ({ page = 1, limit = 10, status } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('limit', limit)
    if (status) params.set('status', status)
    const response = await api.get(`/admin/users/summary?${params.toString()}`)
    return response
  },

  // Full profile for a single user, shown on the user detail screen
  getUserProfile: async (userId) => {
    if (!userId) throw new Error('User ID is required')
    const response = await api.get(`/users/${userId}`)
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

  // Officer capacity per stage — superadmin only
  getOfficerCapacitySummary: async () => {
    const response = await api.get('/admin/officers/capacity-summary')
    return response
  },

  // Aggregate user counts (total/approved/rejected/pending) — superadmin only
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats')
    return response
  },

  // Aggregate user counts scoped to a specific admin's assigned registrations — plain admin only
  getAdminUserStats: async (adminId) => {
    if (!adminId) throw new Error('Admin ID is required')
    const response = await api.get(`/admin/users/stats/${adminId}`)
    return response
  },

  // 3 most recent invoices system-wide, for the dashboard "Latest invoices" widget — superadmin only
  getLatestInvoices: async () => {
    const response = await api.get('/admin/invoices/latest')
    return response
  },

  // Full invoice list across all dealers, paginated + filterable by status — superadmin only
  // raw: true keeps `pagination` as a sibling of `data` instead of getting stripped by parseResponse
  getSuperAdminInvoices: async ({ page = 1, limit = 10, status } = {}) => {
    const params = new URLSearchParams()
    params.set('page', page)
    params.set('limit', limit)
    if (status) params.set('status', status)
    const response = await api.get(`/super-admin/invoices?${params.toString()}`, {
      raw: true,
    })
    return response
  },

  // Full user profile (business details, contact info, assigned admin) for the
  // "created by" click-through modal on Invoice Management — superadmin only
  getUserDetailsById: async (userId) => {
    if (!userId) throw new Error('User ID is required')
    const response = await api.get(`/admin/users/${userId}`)
    return response
  },

}
