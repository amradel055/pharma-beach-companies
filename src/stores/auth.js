import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ADMIN_ROLES } from '@/constants/roles'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const returnUrl = ref(null)

  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => user.value?.role || null)
  const isAdmin = computed(() => ADMIN_ROLES.includes(userRole.value))

  // Restore session on init
  function init() {
    const saved = localStorage.getItem('pb_user')
    if (saved) {
      try {
        user.value = JSON.parse(saved)
      } catch {
        localStorage.removeItem('pb_user')
      }
    }
  }

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

  function _setUser(u) {
    user.value = u
    localStorage.setItem('pb_user', JSON.stringify(u))
  }

  function login(identifier, password) {
    const users = _getUsers()
    const trimmed = identifier.trim()
    const isPhone = /^[+\d]/.test(trimmed) && !trimmed.includes('@')
    const found = users.find((u) =>
      isPhone
        ? u.phone === trimmed && u.password === password
        : u.email === trimmed.toLowerCase() && u.password === password,
    )
    if (!found) {
      return { ok: false, error: 'بيانات الدخول غير صحيحة' }
    }

    // Check if account is inactive
    if (found.active === false) {
      return { ok: false, error: 'الحساب غير مفعل' }
    }

    const { password: _, ...safeUser } = found
    _setUser(safeUser)
    return { ok: true }
  }

  function logout() {
    user.value = null
    localStorage.removeItem('pb_user')
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

  // Run init immediately
  init()

  return {
    user,
    returnUrl,
    isAuthenticated,
    userRole,
    isAdmin,
    login,
    logout,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
  }
})
