import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES, ADMIN_ROLES } from '@/constants/roles'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Where each role lands after login / on "/" / on a denied admin route.
// MUST point to a route the role is actually allowed to access, otherwise
// the role-guard below will loop back here forever.
const ROLE_HOME = {
  [ROLES.SUPER_ADMIN]: 'admin-users',
  [ROLES.ADMIN_COMPANY]: 'admin-users',
  [ROLES.ADMIN_VILLAGE]: 'admin-village-bookings',
  [ROLES.CUSTOMER_SERVICE_COMPANY]: 'admin-users',
  [ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE]: 'admin-village-bookings',
  [ROLES.CUSTOMER_SERVICE_VILLAGE]: 'admin-village-bookings',
  // Roles whose dedicated dashboards were removed land on the universally
  // accessible profile page (admin-profile.meta.roles = [...ADMIN_ROLES]).
  [ROLES.BROKER_COMPANY]: 'admin-profile',
  [ROLES.BROKER_VILLAGE]: 'admin-profile',
  [ROLES.FINANCIAL_MEMBER]: 'admin-profile',
  [ROLES.OPERATION]: 'admin-profile',
  [ROLES.SECURITY]: 'admin-profile',
  // CLIENT has no admin home — falls through to login.
}

function homeRouteFor(role) {
  return ROLE_HOME[role] || 'login'
}

const routes = [
  // Root — redirect based on auth state
  {
    path: '/',
    name: 'root',
    redirect: () => {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return { name: 'login' }
      return { name: homeRouteFor(auth.user?.role) }
    },
  },

  // Auth pages — login / forgot / reset (no public sign-up)
  {
    path: '/',
    component: () => import('@/components/layout/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { title: 'تسجيل الدخول', guest: true, layout: 'auth' },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/ForgotPasswordView.vue'),
        meta: { title: 'نسيت كلمة المرور', guest: true, layout: 'auth' },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('@/views/ResetPasswordView.vue'),
        meta: { title: 'إعادة تعيين كلمة المرور', layout: 'auth' },
      },
    ],
  },

  // Admin dashboard
  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, roles: [...ADMIN_ROLES] },
    children: [
      // Default landing for /admin — pick a home that the current role can access.
      {
        path: '',
        redirect: () => {
          const auth = useAuthStore()
          return { name: homeRouteFor(auth.user?.role) }
        },
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: () => import('@/views/admin/ProfileView.vue'),
        meta: { title: 'الملف الشخصي', roles: [...ADMIN_ROLES] },
      },

      // User management
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/users/UserListView.vue'),
        meta: {
          title: 'المستخدمين',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      {
        path: 'roles',
        name: 'admin-roles',
        component: () => import('@/views/admin/users/RolesView.vue'),
        meta: { title: 'الأدوار', roles: [ROLES.SUPER_ADMIN] },
      },
      {
        path: 'owners',
        name: 'admin-owners',
        component: () => import('@/views/admin/users/OwnerListView.vue'),
        meta: { title: 'الملاك', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },
      {
        path: 'companies',
        name: 'admin-companies',
        component: () => import('@/views/admin/users/CompanyListView.vue'),
        meta: { title: 'الشركات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY] },
      },
      {
        path: 'companies/:id',
        name: 'admin-company-detail',
        component: () => import('@/views/admin/users/CompanyDetailView.vue'),
        meta: { title: 'تفاصيل الشركة', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.FINANCIAL_MEMBER] },
      },
      {
        path: 'company-payments',
        name: 'admin-company-payments',
        component: () => import('@/views/admin/users/CompanyPaymentsView.vue'),
        meta: { title: 'سندات القبض', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.FINANCIAL_MEMBER] },
      },

      // System lookups (shared CRUD: floors / rooms / bathrooms / areas / finishing / view / AC)
      {
        path: 'settings/lookups',
        name: 'admin-lookups',
        component: () => import('@/views/admin/settings/LookupsView.vue'),
        meta: { title: 'القيم المرجعية', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY] },
      },
      // Chalet groups CRUD
      {
        path: 'chalet-groups',
        name: 'admin-chalet-groups',
        component: () => import('@/views/admin/settings/ChaletGroupsView.vue'),
        meta: { title: 'مجموعات الشاليهات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },
      // Villages (with nested chalet tiers)
      {
        path: 'villages',
        name: 'admin-villages',
        component: () => import('@/views/admin/settings/VillagesView.vue'),
        meta: { title: 'القرى', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },
      // Key/value system settings
      {
        path: 'settings/system',
        name: 'admin-system-settings',
        component: () => import('@/views/admin/settings/SystemSettingsView.vue'),
        meta: { title: 'إعدادات النظام', roles: [ROLES.SUPER_ADMIN] },
      },
      {
        path: 'settings/amenities',
        name: 'admin-amenities',
        component: () => import('@/views/admin/settings/AmenitiesView.vue'),
        meta: { title: 'الكماليات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY] },
      },

      // CS operations
      {
        path: 'village-bookings',
        name: 'admin-village-bookings',
        component: () => import('@/views/admin/cs/OrdersQueueView.vue'),
        meta: {
          title: 'الحجوزات',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      // Chalets browse page — same role set as the bookings list
      {
        path: 'village-chalets',
        name: 'admin-village-chalets',
        component: () => import('@/views/admin/cs/ChaletsListView.vue'),
        meta: {
          title: 'الشاليهات',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      // New booking — calendar step (pick chalet + date range)
      // Placed BEFORE :id so /new doesn't match the param route.
      {
        path: 'village-bookings/new',
        name: 'admin-village-booking-create',
        component: () => import('@/views/admin/cs/BookingCreateView.vue'),
        meta: {
          title: 'حجز جديد',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      // New booking — form step (guests, cars, payment). Reached via the
      // calendar's "متابعة الحجز" button with chalet_id, check_in, check_out
      // in the query string.
      {
        path: 'village-bookings/new/form',
        name: 'admin-village-booking-form',
        component: () => import('@/views/admin/cs/BookingFormView.vue'),
        meta: {
          title: 'إتمام الحجز',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      // Chalet detail (chalet info + its bookings, reachable from list)
      {
        path: 'village-bookings/chalet/:id',
        name: 'admin-village-booking-chalet',
        component: () => import('@/views/admin/cs/ChaletDetailView.vue'),
        meta: {
          title: 'تفاصيل الشاليه',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      // Permit print view — strict role gate per spec (CS_VILLAGE,
      // HEAD_CS_VILLAGE, FINANCIAL_MEMBER only). Placed BEFORE :id so the
      // /permit suffix isn't swallowed by the param route.
      {
        path: 'village-bookings/:id/permit',
        name: 'admin-village-booking-permit',
        component: () => import('@/views/admin/cs/PermitView.vue'),
        meta: {
          title: 'تصريح الأمن',
          roles: [ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.FINANCIAL_MEMBER],
        },
      },
      {
        path: 'village-bookings/:id',
        name: 'admin-village-booking-details',
        component: () => import('@/views/admin/cs/OrderDetailsView.vue'),
        meta: {
          title: 'تفاصيل الحجز',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },

      // Permits
      {
        path: 'permits',
        name: 'admin-permits',
        component: () => import('@/views/admin/agent/AgentPermitsView.vue'),
        meta: {
          title: 'التصاريح',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE],
        },
      },

    ],
  },

  // Catch-all — redirect to root (which then routes by auth state)
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'root' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const userRole = auth.user?.role
  const hasValidAdminRole = ADMIN_ROLES.includes(userRole)

  // Protected routes — redirect to login if not authenticated
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    auth.returnUrl = to.fullPath
    return { name: 'login' }
  }

  // Guest-only routes — only bounce away if the user has a VALID admin role.
  // Without this check, a partially-broken session (authenticated but no
  // recognized role) would ping-pong between /login and /admin forever.
  if (to.meta.guest && auth.isAuthenticated && hasValidAdminRole) {
    const home = homeRouteFor(userRole)
    if (to.name === home) return
    return { name: home }
  }

  // Role-based guard for admin routes
  if (to.meta.roles && auth.isAuthenticated) {
    if (!to.meta.roles.includes(userRole)) {
      if (hasValidAdminRole) {
        // Has admin access but not for THIS specific route — bounce to the
        // role's home. Guard against the home itself being unreachable
        // (misconfigured ROLE_HOME) to avoid an infinite redirect loop.
        const home = homeRouteFor(userRole)
        if (to.name === home) return
        return { name: home }
      }
      // No valid role at all — wipe the broken session so the next nav doesn't loop
      localStorage.removeItem('pb_user')
      localStorage.removeItem('pb_access_token')
      localStorage.removeItem('pb_refresh_token')
      auth.user = null
      return { name: 'login' }
    }
  }
})

export default router
