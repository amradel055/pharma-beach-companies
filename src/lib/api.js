import axios from 'axios'

const ACCESS_TOKEN_KEY = 'pb_access_token'
const REFRESH_TOKEN_KEY = 'pb_refresh_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || null
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || null
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens()
      localStorage.removeItem('pb_user')
    }
    return Promise.reject(error)
  },
)

// Extracts a human-readable error message from a backend error response.
// Falls back through the typical Laravel / generic patterns.
export function getErrorMessage(error, fallback = 'حدث خطأ غير متوقع') {
  const data = error?.response?.data
  if (!data) return error?.message || fallback
  if (typeof data === 'string') return data
  if (data.message) return data.message
  if (data.error) return typeof data.error === 'string' ? data.error : fallback
  if (data.errors && typeof data.errors === 'object') {
    const first = Object.values(data.errors)[0]
    if (Array.isArray(first) && first.length) return first[0]
    if (typeof first === 'string') return first
  }
  return fallback
}

export default api
