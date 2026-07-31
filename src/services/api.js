const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('shoka_token')
  const headers = new Headers(options.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (response.status === 204) return null
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(payload?.detail || '请求失败', response.status, payload)
  }
  return payload
}

export const apiGet = (path) => api(path)
export const apiPost = (path, data) => api(path, { method: 'POST', body: JSON.stringify(data) })
export const apiPut = (path, data) => api(path, { method: 'PUT', body: JSON.stringify(data) })
export const apiPatch = (path, data) => api(path, { method: 'PATCH', body: JSON.stringify(data) })
export const apiDelete = (path) => api(path, { method: 'DELETE' })
