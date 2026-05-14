import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES, ADMIN_ROLES } from '@/constants/roles'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Where each role lands after login / on "/" / on a denied admin route.
// MUST point to a route the role is actually allowed to access, otherwise
// the role-guard below will loop back here forever.
const ROLE_HOME = {
  [ROLES.SUPER_ADMIN]: 'admin-owner',
  [ROLES.ADMIN_COMPANY]: 'admin-owner',
  [ROLES.ADMIN_VILLAGE]: 'admin-village',
  [ROLES.CUSTOMER_SERVICE_COMPANY]: 'admin-users',
  [ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE]: 'admin-orders',
  [ROLES.CUSTOMER_SERVICE_VILLAGE]: 'admin-orders',
  [ROLES.BROKER_COMPANY]: 'admin-broker',
  [ROLES.BROKER_VILLAGE]: 'admin-broker',
  [ROLES.FINANCIAL_MEMBER]: 'admin-village',
  [ROLES.OPERATION]: 'admin-operator-dashboard',
  [ROLES.SECURITY]: 'admin-qr-scanner',
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
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE],
        },
      },

      // Chalet management
      {
        path: 'chalets',
        name: 'admin-chalets',
        component: () => import('@/views/admin/chalets/ChaletListView.vue'),
        meta: { title: 'الشاليهات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY] },
      },
      {
        path: 'settings/search-attributes',
        name: 'admin-search-attributes',
        component: () => import('@/views/admin/settings/SearchAttributesView.vue'),
        meta: { title: 'خيارات البحث', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY] },
      },
      {
        path: 'settings/amenities',
        name: 'admin-amenities',
        component: () => import('@/views/admin/settings/AmenitiesView.vue'),
        meta: { title: 'الكماليات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY] },
      },

      // Approvals — Super Admin only
      {
        path: 'approvals',
        name: 'admin-approvals',
        component: () => import('@/views/admin/approvals/ApprovalQueueView.vue'),
        meta: { title: 'طلبات الاعتماد', roles: [ROLES.SUPER_ADMIN] },
      },

      // Bookings calendar — primary landing for the admin tier
      {
        path: 'owner',
        name: 'admin-owner',
        component: () => import('@/views/admin/owner/OwnerDashboardView.vue'),
        meta: { title: 'تقويم الحجوزات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },

      // Bookings register
      {
        path: 'bookings',
        name: 'admin-bookings',
        component: () => import('@/views/admin/bookings/BookingsRegisterView.vue'),
        meta: { title: 'سجل الحجوزات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },

      // Village dashboard (financial reports)
      {
        path: 'village',
        name: 'admin-village',
        component: () => import('@/views/admin/village/VillageDashboardView.vue'),
        meta: {
          title: 'تقارير القرية',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.FINANCIAL_MEMBER],
        },
      },

      // CS operations
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/cs/OrdersQueueView.vue'),
        meta: {
          title: 'الطلبات',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      // New booking — calendar step (pick chalet + date range)
      // Placed BEFORE :id so /new doesn't match the param route.
      {
        path: 'orders/new',
        name: 'admin-order-create',
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
        path: 'orders/new/form',
        name: 'admin-order-create-form',
        component: () => import('@/views/admin/cs/BookingFormView.vue'),
        meta: {
          title: 'إتمام الحجز',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE, ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_VILLAGE, ROLES.CUSTOMER_SERVICE_COMPANY],
        },
      },
      {
        path: 'orders/:id',
        name: 'admin-order-details',
        component: () => import('@/views/admin/cs/OrderDetailsView.vue'),
        meta: {
          title: 'تفاصيل الطلب',
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

      // Broker dashboard
      {
        path: 'broker',
        name: 'admin-broker',
        component: () => import('@/views/admin/broker/BrokerDashboardView.vue'),
        meta: {
          title: 'لوحة البروكر',
          roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.BROKER_COMPANY, ROLES.BROKER_VILLAGE],
        },
      },

      // Operators
      {
        path: 'operators',
        name: 'admin-operators',
        component: () => import('@/views/admin/operator/OperatorListView.vue'),
        meta: { title: 'المشغلين', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },

      // Operator dashboard
      {
        path: 'operator',
        name: 'admin-operator-dashboard',
        component: () => import('@/views/admin/operator/OperatorDashboardView.vue'),
        meta: { title: 'لوحة المشغل', roles: [ROLES.SUPER_ADMIN, ROLES.OPERATION] },
      },

      // Security management
      {
        path: 'security',
        name: 'admin-security',
        component: () => import('@/views/admin/security/SecurityListView.vue'),
        meta: { title: 'أعضاء الأمن', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },

      // QR Scanner
      {
        path: 'security/scanner',
        name: 'admin-qr-scanner',
        component: () => import('@/views/admin/security/QrScannerView.vue'),
        meta: {
          title: 'ماسح QR',
          roles: [ROLES.SUPER_ADMIN, ROLES.SECURITY, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE],
        },
      },

      // General Settings — Super Admin only
      {
        path: 'settings/general',
        name: 'admin-general-settings',
        component: () => import('@/views/admin/settings/GeneralSettingsView.vue'),
        meta: { title: 'الإعدادات العامة', roles: [ROLES.SUPER_ADMIN] },
      },

      // Site Terms — Super Admin only
      {
        path: 'settings/site-terms',
        name: 'admin-site-terms',
        component: () => import('@/views/admin/settings/SiteTermsView.vue'),
        meta: { title: 'شروط الموقع', roles: [ROLES.SUPER_ADMIN] },
      },

      // Village Terms
      {
        path: 'settings/village-terms',
        name: 'admin-village-terms',
        component: () => import('@/views/admin/settings/VillageTermsView.vue'),
        meta: { title: 'شروط القرية', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },

      // Village Daily Report
      {
        path: 'village/daily-report',
        name: 'admin-village-daily-report',
        component: () => import('@/views/admin/village/VillageDailyReportView.vue'),
        meta: { title: 'التقرير اليومي', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.ADMIN_VILLAGE] },
      },

      // Coupons
      {
        path: 'coupons',
        name: 'admin-coupons',
        component: () => import('@/views/admin/coupons/CouponListView.vue'),
        meta: { title: 'كوبونات الخصم', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY] },
      },
      {
        path: 'coupons/report',
        name: 'admin-coupons-report',
        component: () => import('@/views/admin/coupons/CouponReportView.vue'),
        meta: { title: 'تقرير الكوبونات', roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN_COMPANY, ROLES.CUSTOMER_SERVICE_COMPANY] },
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
