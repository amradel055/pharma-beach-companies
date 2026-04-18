import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ROLES } from '@/constants/roles'

const STORAGE_KEY = 'pb_users'

export const useUsersStore = defineStore('users', () => {
  const users = ref([])

  function init() {
    try {
      users.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      users.value = []
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users.value))
  }

  // Get all internal users (non-customer) with optional filters
  function getAll({ search = '', role = '', status = '' } = {}) {
    return users.value.filter((u) => {
      // Exclude customers
      if (!u.role || u.role === ROLES.CUSTOMER) return false

      // Search by name or phone
      if (search) {
        const q = search.trim().toLowerCase()
        const matchName = u.name?.toLowerCase().includes(q)
        const matchPhone = u.phone?.includes(q)
        if (!matchName && !matchPhone) return false
      }

      // Filter by role
      if (role && u.role !== role) return false

      // Filter by status
      if (status === 'active' && u.active === false) return false
      if (status === 'inactive' && u.active !== false) return false

      return true
    })
  }

  function getById(id) {
    return users.value.find((u) => u.id === id) || null
  }

  function getByRole(role) {
    return users.value.filter((u) => u.role === role && u.active !== false)
  }

  function getBrokers() {
    return getByRole(ROLES.BROKER)
  }

  function getBrokerAgents(brokerId) {
    return users.value.filter((u) => u.role === ROLES.AGENT && u.brokerId === brokerId)
  }

  function create(data) {
    if (!data.name?.trim()) return { ok: false, error: 'الاسم مطلوب' }
    if (!data.phone?.trim()) return { ok: false, error: 'رقم التليفون مطلوب' }
    if (!data.password || data.password.length < 6) return { ok: false, error: 'كلمة المرور مطلوبة (6 أحرف على الأقل)' }
    if (!data.role) return { ok: false, error: 'الدور مطلوب' }
    if (data.role === ROLES.BROKER && !data.commissionPercent) return { ok: false, error: 'نسبة البروكر مطلوبة' }
    if (data.role === ROLES.AGENT && !data.brokerId) return { ok: false, error: 'يجب اختيار البروكر' }

    const existing = users.value.find((u) => u.phone === data.phone.trim())
    if (existing) {
      return { ok: false, error: 'رقم التليفون مسجل بالفعل' }
    }

    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: data.name.trim(),
      email: (data.email || '').trim().toLowerCase() || null,
      phone: data.phone.trim(),
      password: data.password,
      role: data.role,
      active: data.active !== false,
      avatar: null,
      createdAt: new Date().toISOString(),
    }

    // Role-specific fields
    if (data.role === ROLES.BROKER) {
      newUser.commissionPercent = Number(data.commissionPercent) || 0
    }
    if (data.role === ROLES.AGENT) {
      newUser.brokerId = data.brokerId || null
    }
    if (data.role === ROLES.OWNER) {
      newUser.chaletIds = data.chaletIds || []
    }
    if (data.role === ROLES.OPERATOR) {
      newUser.commissionPercent = Number(data.commissionPercent) || 0
      newUser.assignedChaletIds = data.assignedChaletIds || []
      newUser.villageId = data.villageId || null
    }
    if (data.role === ROLES.SECURITY) {
      newUser.nationalId = (data.nationalId || '').trim() || null
      newUser.villageId = data.villageId || null
    }

    users.value.push(newUser)
    _persist()
    return { ok: true, user: newUser }
  }

  function update(id, data) {
    const index = users.value.findIndex((u) => u.id === id)
    if (index === -1) return { ok: false, error: 'المستخدم غير موجود' }

    // Check phone uniqueness (exclude current user)
    if (data.phone) {
      const phoneExists = users.value.find((u) => u.phone === data.phone.trim() && u.id !== id)
      if (phoneExists) return { ok: false, error: 'رقم التليفون مسجل بالفعل' }
    }

    const updated = { ...users.value[index] }
    if (data.name !== undefined) updated.name = data.name.trim()
    if (data.phone !== undefined) updated.phone = data.phone.trim()
    if (data.email !== undefined) updated.email = (data.email || '').trim().toLowerCase() || null
    if (data.password) updated.password = data.password
    if (data.active !== undefined) updated.active = data.active
    if (data.commissionPercent !== undefined) updated.commissionPercent = Number(data.commissionPercent)
    if (data.brokerId !== undefined) updated.brokerId = data.brokerId
    if (data.chaletIds !== undefined) updated.chaletIds = data.chaletIds
    if (data.assignedChaletIds !== undefined) updated.assignedChaletIds = data.assignedChaletIds
    if (data.villageId !== undefined) updated.villageId = data.villageId
    if (data.nationalId !== undefined) updated.nationalId = (data.nationalId || '').trim() || null

    users.value[index] = updated
    _persist()
    return { ok: true, user: updated }
  }

  function toggleActive(id) {
    const user = users.value.find((u) => u.id === id)
    if (!user) return { ok: false, error: 'المستخدم غير موجود' }
    user.active = !user.active
    _persist()

    // If deactivated, also update pb_user if it's the current logged-in user
    return { ok: true, active: user.active }
  }

  function deleteUser(id) {
    const index = users.value.findIndex((u) => u.id === id)
    if (index === -1) return { ok: false, error: 'المستخدم غير موجود' }
    users.value.splice(index, 1)
    _persist()
    return { ok: true }
  }

  function getOperators(villageId = null) {
    return users.value.filter((u) => {
      if (u.role !== ROLES.OPERATOR) return false
      if (villageId && u.villageId !== villageId) return false
      return true
    })
  }

  function getSecurityMembers(villageId = null) {
    return users.value.filter((u) => {
      if (u.role !== ROLES.SECURITY) return false
      if (villageId && u.villageId !== villageId) return false
      return true
    })
  }

  const totalInternal = computed(() => {
    return users.value.filter((u) => u.role && u.role !== ROLES.CUSTOMER).length
  })

  // Init immediately
  init()

  return {
    users,
    totalInternal,
    init,
    getAll,
    getById,
    getByRole,
    getBrokers,
    getBrokerAgents,
    getOperators,
    getSecurityMembers,
    create,
    update,
    toggleActive,
    deleteUser,
  }
})
