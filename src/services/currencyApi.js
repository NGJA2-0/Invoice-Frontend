import { api } from './api'

const BASE = '/admin/currencies'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

// Raw fetch for public currency endpoints (outside /admin)
const getRaw = async (path) => {
  const res = await fetch(`${API_BASE_URL}${path}`)
  return res.json()
}

export const currencyApi = {
  // ── Existing admin endpoints ─────────────────────────────────────────────

  getAll: (params = {}) => {
    const query = new URLSearchParams()
    if (params.page)     query.set('page',   params.page)
    if (params.limit)    query.set('limit',  params.limit)
    if (params.search)   query.set('search', params.search)
    if (params.isActive !== undefined) query.set('isActive', params.isActive)
    const qs = query.toString()
    return api.get(`${BASE}${qs ? `?${qs}` : ''}`)
  },

  getById:      (id)           => api.get(`${BASE}/${id}`),
  create:       (payload)      => api.post(BASE, payload),
  update:       (id, payload)  => api.put(`${BASE}/${id}`, payload),
  delete:       (id)           => api.delete(`${BASE}/${id}`),
  updateStatus: (id, isActive) => api.patch(`${BASE}/${id}/status`, { isActive }),
  bulkUpdate:   (currencies)   => api.post(`${BASE}/bulk-update`, { currencies }),

  // ── New public endpoints (used by the valuation form) ───────────────────

  /**
   * GET /api/v1/admin/currencies
   * Returns { data: [{ currencyCode, exchangeRate }, ...] }
   * Used to populate the currency dropdown on form load.
   */
  getAllPublic: () => getRaw(BASE),

  /**
   * GET /api/v1/currencies/:code
   * Returns { currencyCode, currencyName, symbol, exchangeRate }
   * Used to auto-fill the exchange rate when a currency is selected.
   */
  getByCode: (code) => getRaw(`/currencies/${encodeURIComponent(code)}`),
}