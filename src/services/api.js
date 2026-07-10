export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://invoice-backend-ibyr.onrender.com/api/v1'

const RENDER_FALLBACK_URL = 'https://invoice-backend-ibyr.onrender.com/api/v1'

const buildUrl = (path) => `${API_BASE_URL}${path}`

// Tries the primary URL first; if the server is unreachable (network error),
// automatically retries with the Render-hosted backend.
export const fetchWithFallback = async (url, options) => {
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

// Like parseResponse, but returns the full payload untouched
// (no auto-unwrap of payload.data) — used when callers need
// sibling keys like `pagination` alongside `data`.
const parseResponseRaw = async (response) => {
  const payload = await response.json().catch(() => null)
  if (!response.ok || (payload && payload.success === false)) {
    const error = new Error(payload?.message || response.statusText)
    error.status = response.status
    error.details = payload?.errors || null
    throw error
  }
  return payload ?? null
}

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem('ngja_user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.token || null
  } catch {
    return null
  }
}

// If the server responds with 401 (expired / invalid token), clear the
// session and redirect to the login page so the user gets a fresh token.
const handle401 = (response) => {
  if (response.status === 401) {
    localStorage.removeItem('ngja_user')
    localStorage.removeItem('ngja_role')
    window.location.href = '/login'
  }
}

const request = async (path, options = {}) => {
  const token = getStoredToken()
  const { raw, ...fetchOptions } = options
  const response = await fetchWithFallback(buildUrl(path), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(fetchOptions.headers || {}),
    },
  })
  // Only auto-logout if we actually sent a token — a 401 on an
  // unauthenticated call (e.g. login endpoints) is just bad credentials
  // and should propagate as a normal error so the UI can show a message.
  if (token) handle401(response)
  return raw ? parseResponseRaw(response) : parseResponse(response)
}

const requestForm = async (path, formData, options = {}) => {
  const token = getStoredToken()
  const response = await fetchWithFallback(buildUrl(path), {
    method: 'POST',
    body: formData,
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  // Same rule: only auto-logout when a token was sent with the request
  if (token) handle401(response)
  return parseResponse(response)
}

export const api = {
  get: (path, options = {}) => request(path, { method: 'GET', ...options }),
  post: (path, body, options = {}) =>
    request(path, { method: 'POST', body: JSON.stringify(body), ...options }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => requestForm(path, formData),
}