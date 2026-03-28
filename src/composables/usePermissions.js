import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { PERMISSIONS, ADMIN_ROLES, ROLE_HIERARCHY } from '@/constants/roles'

export function usePermissions() {
  const auth = useAuthStore()

  const userRole = computed(() => auth.user?.role || 'customer')

  const isAdmin = computed(() => ADMIN_ROLES.includes(userRole.value))

  function hasRole(role) {
    return userRole.value === role
  }

  function hasAnyRole(roles) {
    return roles.includes(userRole.value)
  }

  function hasPermission(permission) {
    const allowedRoles = PERMISSIONS[permission]
    if (!allowedRoles) return false
    return allowedRoles.includes(userRole.value)
  }

  function isAtLeastRole(role) {
    const userIndex = ROLE_HIERARCHY.indexOf(userRole.value)
    const targetIndex = ROLE_HIERARCHY.indexOf(role)
    if (userIndex === -1 || targetIndex === -1) return false
    return userIndex <= targetIndex
  }

  function canAccessRoute(route) {
    const roles = route.meta?.roles
    if (!roles) return true
    return roles.includes(userRole.value)
  }

  return {
    userRole,
    isAdmin,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAtLeastRole,
    canAccessRoute,
  }
}
