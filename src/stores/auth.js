import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ADMIN_ROLES } from '@/constants/roles'
import api, { clearTokens, getAccessToken, getRefreshToken, getErrorMessage, setTokens } from '@/lib/api'

const USER_KEY = 'pb_user'
// Refresh the access token every 9 minutes (well under the typical 1h JWT lifetime).
const REFRESH_INTERVAL_MS = 9 * 60 * 1000

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const returnUrl = ref(null)
  let refreshTimer = null

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => ADMIN_ROLES.includes(userRole.value))

  function init() {
    const saved = localStorage.getItem(USER_KEY)
    if (saved) {
      try {
        user.value = JSON.parse(saved)
      } catch {
        localStorage.removeItem(USER_KEY)
      }
    }
    // Resume the auto-refresh loop if a previous session is still in storage.
    if (getAccessToken() && getRefreshToken()) {
      _startRefreshTimer()
    }
  }

  function _setUser(u) {
    user.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  function _clearSession() {
    user.value = null
    localStorage.removeItem(USER_KEY)
    clearTokens()
    _stopRefreshTimer()
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Auto-refresh of the access token
  // ──────────────────────────────────────────────────────────────────────────
  function _startRefreshTimer() {
    _stopRefreshTimer()
    refreshTimer = setInterval(() => {
      refreshAccessToken()
    }, REFRESH_INTERVAL_MS)
  }

  function _stopRefreshTimer() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  // POST /v1/auth/admin/refresh-token — rotate the access token (and refresh
  // token if the backend rotates it too). Stops the timer + clears the session
  // if refresh fails (e.g., refresh_token revoked).
  async function refreshAccessToken() {
    const refresh = getRefreshToken()
    if (!refresh) return { ok: false, error: 'no refresh token' }

    try {
      const { data } = await api.post('/v1/auth/admin/refresh-token', {
        refresh_token: refresh,
      })

      const payload = data?.data || data
      const newAccess = payload?.access_token
      const newRefresh = payload?.refresh_token

      if (!newAccess) {
        _clearSession()
        return { ok: false, error: 'no access token in refresh response' }
      }

      setTokens({ accessToken: newAccess, refreshToken: newRefresh || refresh })
      return { ok: true }
    } catch (error) {
      _clearSession()
      return { ok: false, error: getErrorMessage(error, 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً') }
    }
  }

  // Wipe all leftover mock data from the old localStorage layer so the API
  // becomes the single source of truth. Keeps only the auth keys we just set.
  function _clearStaleMockData() {
    const keep = new Set([USER_KEY, 'pb_access_token', 'pb_refresh_token'])
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)
      if (key && key.startsWith('pb_') && !keep.has(key)) {
        localStorage.removeItem(key)
      }
    }
  }

  // POST /v1/auth/admin/login → { success, data: { access_token, refresh_token, user } }
  async function login(identifier, password) {
    try {
      const { data } = await api.post('/v1/auth/admin/login', {
        identifier: identifier.trim(),
        password,
      })

      const payload = data?.data || data
      const access = payload?.access_token
      const refresh = payload?.refresh_token
      const rawUser = payload?.user

      if (!access || !rawUser) {
        return { ok: false, error: 'استجابة غير متوقعة من الخادم' }
      }

      setTokens({ accessToken: access, refreshToken: refresh })
      _setUser(_normalizeUser(rawUser))
      _startRefreshTimer()

      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'بيانات الدخول غير صحيحة') }
    }
  }

  // GET /v1/auth/admin/me → admin profile (+ roles)
  async function fetchMe() {
    try {
      const { data } = await api.get('/v1/auth/admin/me')
      const raw = data?.user || data?.data || data
      _setUser(_normalizeUser(raw))
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب بيانات المستخدم') }
    }
  }

  // POST /v1/auth/admin/logout — clear client state regardless of API result.
  async function logout() {
    try {
      await api.post('/v1/auth/admin/logout')
    } catch {
      // ignore — we still clear local state
    } finally {
      _clearSession()
    }
  }

  // Maps API uppercase role names ("ADMIN") to the lowercase slugs the frontend
  // uses ("site_admin"). Extend as new role names come back from the backend.
  const API_ROLE_TO_SLUG = {
    ADMIN: 'site_admin',
    SITE_ADMIN: 'site_admin',
    SITE_CS: 'site_cs',
    VILLAGE_ADMIN: 'village_admin',
    VILLAGE_CS: 'village_cs',
    OWNER: 'owner',
    BROKER: 'broker',
    AGENT: 'agent',
    OPERATOR: 'operator',
    SECURITY: 'security',
  }

  function _mapRole(apiRole) {
    if (!apiRole) return null
    return API_ROLE_TO_SLUG[apiRole] || String(apiRole).toLowerCase()
  }

  // Normalize the API user object into the shape the rest of the app expects:
  // { id, name, email, role, avatar, ...rest }.
  function _normalizeUser(raw) {
    if (!raw || typeof raw !== 'object') return raw

    let apiRole = null
    if (Array.isArray(raw.roles) && raw.roles.length) {
      const first = raw.roles[0]
      apiRole = typeof first === 'string' ? first : first?.slug || first?.name
    } else if (raw.role) {
      apiRole = raw.role
    } else if (raw.user_type) {
      apiRole = raw.user_type
    }

    const name = raw.name || [raw.first_name, raw.last_name].filter(Boolean).join(' ').trim() || raw.email

    return {
      ...raw,
      name,
      role: _mapRole(apiRole),
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Password reset (still localStorage-backed — will move to the OTP endpoints
  // next round).
  // ──────────────────────────────────────────────────────────────────────────
  function _getUsers() {
    try {
      return JSON.parse(localStorage.getItem('pb_users') || '[]')
    } catch {
      return []
    }
  }

  function _saveUsers(users) {
    localStorage.setItem('pb_users', JSON.stringify(users))
  }

  function _getResetTokens() {
    try {
      return JSON.parse(localStorage.getItem('pb_reset_tokens') || '[]')
    } catch {
      return []
    }
  }

  function _saveResetTokens(tokens) {
    localStorage.setItem('pb_reset_tokens', JSON.stringify(tokens))
  }

  function requestPasswordReset(email) {
    const normalizedEmail = email.trim().toLowerCase()
    const users = _getUsers()
    const found = users.find((u) => u.email === normalizedEmail)

    if (found) {
      const token = Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
      const tokens = _getResetTokens()
      tokens.push({
        token,
        email: normalizedEmail,
        expiresAt: Date.now() + 30 * 60 * 1000,
      })
      _saveResetTokens(tokens)
      return { ok: true, token }
    }

    return { ok: true }
  }

  function validateResetToken(token) {
    const tokens = _getResetTokens()
    const entry = tokens.find((t) => t.token === token)

    if (!entry || entry.expiresAt < Date.now()) {
      return { ok: false, error: 'الرابط غير صالح أو منتهي' }
    }

    return { ok: true, email: entry.email }
  }

  function resetPassword(token, newPassword) {
    const validation = validateResetToken(token)
    if (!validation.ok) return validation

    const users = _getUsers()
    const userIndex = users.findIndex((u) => u.email === validation.email)
    if (userIndex === -1) {
      return { ok: false, error: 'المستخدم غير موجود' }
    }

    if (users[userIndex].password === newPassword) {
      return { ok: false, error: 'كلمة المرور الجديدة يجب أن تختلف عن القديمة' }
    }

    users[userIndex].password = newPassword
    _saveUsers(users)

    const tokens = _getResetTokens().filter((t) => t.email !== validation.email)
    _saveResetTokens(tokens)

    return { ok: true }
  }

  init()

  return {
    user,
    returnUrl,
    isAuthenticated,
    userRole,
    isAdmin,
    login,
    logout,
    fetchMe,
    refreshAccessToken,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
  }
})
