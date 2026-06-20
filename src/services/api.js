const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const RENDER_FALLBACK_URL = 'https://invoice-backend-ibyr.onrender.com/api/v1'

const buildUrl = (path) => `${API_BASE_URL}${path}`

// Tries the primary URL first; if the server is unreachable (network error),
// automatically retries with the Render-hosted backend.
const fetchWithFallback = async (url, options) => {
  try {
    return await fetch(url, options)
  } catch (err) {
    if (err instanceof TypeError && API_BASE_URL !== RENDER_FALLBACK_URL) {
      const fallbackUrl = url.replace(API_BASE_URL, RENDER_FALLBACK_URL)
      return await fetch(fallbackUrl, options)
    }
    throw err
  }
}

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null)
  if (!response.ok || (payload && payload.success === false)) {
    const error = new Error(payload?.message || response.statusText)
    error.status = response.status
    error.details = payload?.errors || null
    throw error
  }
  if (payload?.data !== undefined && payload?.data !== null) {
    return payload.data
  }
  return payload ?? null
}

const getStoredUserId = () => {
  try {
    const raw = localStorage.getItem('ngja_user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.id || null
  } catch {
    return null
  }
}

const request = async (path, options = {}) => {
  const userId = getStoredUserId()
  const response = await fetchWithFallback(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'X-User-Id': userId } : {}),
      ...(options.headers || {}),
    },
  })
  return parseResponse(response)
}

const requestForm = async (path, formData, options = {}) => {
  const response = await fetchWithFallback(buildUrl(path), {
    method: 'POST',
    body: formData,
    ...options,
  })
  return parseResponse(response)
}

const requestWithUserIdHeader = async (path, body, userId) => {
  const response = await fetchWithFallback(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': String(userId),
    },
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export const api = {
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  submitLicenseRenewal: (userId, body) => {
    if (!userId) throw new Error('User ID is required for license renewal')
    return requestWithUserIdHeader('/license-renewals/submit', body, userId)
  },
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => requestForm(path, formData),
}