import { api } from './api'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

export const licenseRenewalApi = {
  getPending: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/license-renewals/pending`)
    return res.json()
  },
  approve: (id) => api.put(`/admin/license-renewals/${id}/approve`),
  reject:  (id) => api.put(`/admin/license-renewals/${id}/reject`),
}