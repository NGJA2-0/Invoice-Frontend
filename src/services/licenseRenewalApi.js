import { api } from './api'

// Admin-only license renewal management — all routes under /admin/**, unchanged URLs
export const licenseRenewalApi = {
  // Bearer token is injected automatically by api.get
  getPending: () => api.get('/admin/license-renewals/pending'),
  approve: (id) => api.put(`/admin/license-renewals/${id}/approve`),
  reject:  (id) => api.put(`/admin/license-renewals/${id}/reject`),
}