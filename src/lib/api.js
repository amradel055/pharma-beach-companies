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

// ──────────────────────────────────────────────────────────────────────────
// Auth-failure handling
//
// This backend reports auth failures TWO ways:
//   • HTTP 401, OR
//   • HTTP 200 with body { success:false, message:"INVALID_TOKEN" | ... }
//
// So we must inspect the *success* path too, not just the error path.
// On an auth failure we try a single token refresh and replay the request;
// if the refresh fails we wipe the session and bounce to /login. Without
// this the app silently keeps sending a stale/rotated token forever (which
// is exactly why the same token works in Postman but not here).
// ──────────────────────────────────────────────────────────────────────────
const AUTH_FAIL_MESSAGES = new Set([
  'INVALID_TOKEN',
  'TOKEN_IS_REQUIRED',
  'TOKEN_EXPIRED',
  'TOKEN_NOT_PROVIDED',
  'UNAUTHENTICATED',
  'Unauthenticated.',
])

// Requests to these endpoints must NOT trigger the refresh/retry cycle.
function isAuthEndpoint(url = '') {
  return /\/auth\/admin\/(login|refresh-token|logout)/.test(String(url))
}

function bodyIsAuthFail(data) {
  return !!data && data.success === false &&
    typeof data.message === 'string' && AUTH_FAIL_MESSAGES.has(data.message)
}

function forceLogout() {
  clearTokens()
  localStorage.removeItem('pb_user')
  const base = import.meta.env.BASE_URL || '/'
  const loginPath = `${base.replace(/\/$/, '')}/login`
  if (!window.location.pathname.endsWith('/login')) {
    window.location.assign(loginPath)
  }
}

// One in-flight refresh shared across all concurrent 401s. Uses a bare axios
// call so it doesn't recurse through these interceptors.
let refreshPromise = null
function runRefresh() {
  const refresh = getRefreshToken()
  if (!refresh) return Promise.resolve(false)
  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/v1/auth/admin/refresh-token`,
        { refresh_token: refresh },
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' } },
      )
      .then((res) => {
        const payload = res?.data?.data || res?.data
        const newAccess = payload?.access_token
        const newRefresh = payload?.refresh_token
        if (!newAccess) return false
        setTokens({ accessToken: newAccess, refreshToken: newRefresh || refresh })
        return true
      })
      .catch(() => false)
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

// Try to recover an auth-failed request with a single token refresh + replay.
//
// IMPORTANT: forceLogout() happens ONLY when the refresh itself fails (the
// refresh token is dead → the session is genuinely over). If the refresh
// succeeds but a specific endpoint STILL returns an auth error, that's a
// backend route/guard bug — NOT an expired session. In that case we just
// reject and let the calling store surface the error, so one broken endpoint
// can't log the user out while the rest of the app still works.
async function recoverAndRetry(config) {
  // Can't recover (no config, auth endpoint, or already retried once) →
  // give up on THIS request but keep the session intact.
  if (!config || config.__authRetried || isAuthEndpoint(config.url)) {
    return null
  }
  const refresh = getRefreshToken()
  if (!refresh) {
    // No refresh token at all → truly unauthenticated.
    forceLogout()
    return null
  }
  const ok = await runRefresh()
  if (!ok) {
    // Refresh call failed → session is over.
    forceLogout()
    return null
  }
  config.__authRetried = true
  // request interceptor re-attaches the now-refreshed Bearer token
  return api(config)
}

api.interceptors.response.use(
  async (response) => {
    if (bodyIsAuthFail(response.data) && !isAuthEndpoint(response.config?.url)) {
      const retried = await recoverAndRetry(response.config)
      if (retried) return retried
    }
    return response
  },
  async (error) => {
    const resp = error.response
    const isFail = resp && (resp.status === 401 || bodyIsAuthFail(resp.data))
    if (isFail && !isAuthEndpoint(error.config?.url)) {
      const retried = await recoverAndRetry(error.config)
      if (retried) return retried
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
