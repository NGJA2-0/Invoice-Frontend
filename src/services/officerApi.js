import { api } from './api'

const BASE = '/admin'

export const officerApi = {
  // GET /api/v1/admin/admins
  getAdmins: () => api.get(`${BASE}/admins`),

  // POST /api/v1/admin/officers
  create: (payload) => api.post(`${BASE}/officers`, payload),
}