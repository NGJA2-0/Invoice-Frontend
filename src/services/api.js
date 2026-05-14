const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

const buildUrl = (path) => `${API_BASE_URL}${path}`

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => null)
  if (!response.ok || (payload && payload.success === false)) {
    const error = new Error(payload?.message || response.statusText)
    error.status = response.status
    error.details = payload?.errors || null
    throw error
  }
  return payload?.data ?? null
}

const request = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  return parseResponse(response)
}

const requestForm = async (path, formData, options = {}) => {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    body: formData,
    ...options,
  })
  return parseResponse(response)
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) =>
    request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) =>
    request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  postForm: (path, formData) => requestForm(path, formData),
}
