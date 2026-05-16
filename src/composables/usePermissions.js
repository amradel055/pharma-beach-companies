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
    // The backend `user.permissions[]` uses granular keys (e.g.
    // `bookings.edit-guests-cars`); the app's own sidebar/route gates use
    // coarse keys (e.g. `manage_users`) that live ONLY in the role map.
    // These are two separate namespaces, so:
    //   1) a positive match in the API list grants access, but
    //   2) absence from the API list must NOT deny — fall through to the
    //      static role → permission map (otherwise every coarse gate breaks).
    const apiPerms = auth.user?.permissions
    if (Array.isArray(apiPerms) && apiPerms.includes(permission)) return true

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
