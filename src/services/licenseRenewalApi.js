import { api, fetchWithFallback, API_BASE_URL } from './api'

export const licenseRenewalApi = {
  getPending: async () => {
    const res = await fetchWithFallback(`${API_BASE_URL}/admin/license-renewals/pending`)
    return res.json()
  },
  approve: (id) => api.put(`/admin/license-renewals/${id}/approve`),
  reject:  (id) => api.put(`/admin/license-renewals/${id}/reject`),
}