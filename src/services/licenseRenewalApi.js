import { api, fetchWithFallback, API_BASE_URL } from './api'

// Admin-only license renewal management — routes unchanged, no JWT needed here
export const licenseRenewalApi = {
  getPending: async () => {
    const res = await fetchWithFallback(`${API_BASE_URL}/admin/license-renewals/pending`)
    return res.json()
  },
  approve: (id) => api.put(`/admin/license-renewals/${id}/approve`),
  reject:  (id) => api.put(`/admin/license-renewals/${id}/reject`),
}