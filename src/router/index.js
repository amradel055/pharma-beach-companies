import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES, ADMIN_ROLES } from '@/constants/roles'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const routes = [
  // Root — redirect based on auth state
  {
    path: '/',
    name: 'root',
    redirect: () => {
      const auth = useAuthStore()
      return auth.isAuthenticated ? { name: 'admin-owner' } : { name: 'login' }
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
      // Default landing for /admin — redirect to the owner dashboard.
      {
        path: '',
        redirect: { name: 'admin-owner' },
      },
      {
        path: 'profile',
        name: 'admin-profile',
        component: () => import('@/views/admin/ProfileView.vue'),
        meta: { title: 'الملف الشخصي', roles: [...ADMIN_ROLES] },
      },

      // User management — Site Admin, Site CS, Village CS
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/users/UserListView.vue'),
        meta: { title: 'المستخدمين', roles: [ROLES.SITE_ADMIN, ROLES.SITE_CS, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS] },
      },

      // Chalet management — Site Admin, Site CS
      {
        path: 'chalets',
        name: 'admin-chalets',
        component: () => import('@/views/admin/chalets/ChaletListView.vue'),
        meta: { title: 'الشاليهات', roles: [ROLES.SITE_ADMIN, ROLES.SITE_CS] },
      },
      {
        path: 'settings/search-attributes',
        name: 'admin-search-attributes',
        component: () => import('@/views/admin/settings/SearchAttributesView.vue'),
        meta: { title: 'خيارات البحث', roles: [ROLES.SITE_ADMIN, ROLES.SITE_CS] },
      },
      {
        path: 'settings/amenities',
        name: 'admin-amenities',
        component: () => import('@/views/admin/settings/AmenitiesView.vue'),
        meta: { title: 'الكماليات', roles: [ROLES.SITE_ADMIN, ROLES.SITE_CS] },
      },

      // Approvals — Site Admin only
      {
        path: 'approvals',
        name: 'admin-approvals',
        component: () => import('@/views/admin/approvals/ApprovalQueueView.vue'),
        meta: { title: 'طلبات الاعتماد', roles: [ROLES.SITE_ADMIN] },
      },

      // Bookings calendar — Site Admin, Owner — primary landing for /admin
      {
        path: 'owner',
        name: 'admin-owner',
        component: () => import('@/views/admin/owner/OwnerDashboardView.vue'),
        meta: { title: 'تقويم الحجوزات', roles: [ROLES.SITE_ADMIN, ROLES.OWNER] },
      },

      // Bookings register — Site Admin, Owner
      {
        path: 'bookings',
        name: 'admin-bookings',
        component: () => import('@/views/admin/bookings/BookingsRegisterView.vue'),
        meta: { title: 'سجل الحجوزات', roles: [ROLES.SITE_ADMIN, ROLES.OWNER] },
      },

      // Village dashboard — Site Admin, Village CS (reports only, not for CS operational)
      {
        path: 'village',
        name: 'admin-village',
        component: () => import('@/views/admin/village/VillageDashboardView.vue'),
        meta: { title: 'تقارير القرية', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN] },
      },

      // CS operations — Site Admin, Village CS
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/cs/OrdersQueueView.vue'),
        meta: { title: 'الطلبات', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS] },
      },
      {
        path: 'orders/:id',
        name: 'admin-order-details',
        component: () => import('@/views/admin/cs/OrderDetailsView.vue'),
        meta: { title: 'تفاصيل الطلب', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS] },
      },

      // Permits — Site Admin, Village CS, Agent
      {
        path: 'permits',
        name: 'admin-permits',
        component: () => import('@/views/admin/agent/AgentPermitsView.vue'),
        meta: { title: 'التصاريح', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN, ROLES.VILLAGE_CS] },
      },

      // Broker dashboard — Site Admin, Broker
      {
        path: 'broker',
        name: 'admin-broker',
        component: () => import('@/views/admin/broker/BrokerDashboardView.vue'),
        meta: { title: 'لوحة البروكر', roles: [ROLES.SITE_ADMIN, ROLES.BROKER] },
      },

      // Agent permits — Site Admin, Agent
      {
        path: 'agent/permits',
        name: 'admin-agent-permits',
        component: () => import('@/views/admin/agent/AgentPermitsView.vue'),
        meta: { title: 'تصاريحي', roles: [ROLES.SITE_ADMIN, ROLES.AGENT] },
      },

      // Operators — Site Admin, Village Admin
      {
        path: 'operators',
        name: 'admin-operators',
        component: () => import('@/views/admin/operator/OperatorListView.vue'),
        meta: { title: 'المشغلين', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN] },
      },

      // Operator dashboard — Site Admin, Operator
      {
        path: 'operator',
        name: 'admin-operator-dashboard',
        component: () => import('@/views/admin/operator/OperatorDashboardView.vue'),
        meta: { title: 'لوحة المشغل', roles: [ROLES.SITE_ADMIN, ROLES.OPERATOR] },
      },

      // Security management — Site Admin, Village Admin
      {
        path: 'security',
        name: 'admin-security',
        component: () => import('@/views/admin/security/SecurityListView.vue'),
        meta: { title: 'أعضاء الأمن', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN] },
      },

      // QR Scanner — Security, Site Admin, Village Admin
      {
        path: 'security/scanner',
        name: 'admin-qr-scanner',
        component: () => import('@/views/admin/security/QrScannerView.vue'),
        meta: { title: 'ماسح QR', roles: [ROLES.SECURITY, ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN] },
      },

      // General Settings — Site Admin
      {
        path: 'settings/general',
        name: 'admin-general-settings',
        component: () => import('@/views/admin/settings/GeneralSettingsView.vue'),
        meta: { title: 'الإعدادات العامة', roles: [ROLES.SITE_ADMIN] },
      },

      // Site Terms — Site Admin
      {
        path: 'settings/site-terms',
        name: 'admin-site-terms',
        component: () => import('@/views/admin/settings/SiteTermsView.vue'),
        meta: { title: 'شروط الموقع', roles: [ROLES.SITE_ADMIN] },
      },

      // Village Terms — Site Admin, Village Admin
      {
        path: 'settings/village-terms',
        name: 'admin-village-terms',
        component: () => import('@/views/admin/settings/VillageTermsView.vue'),
        meta: { title: 'شروط القرية', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN] },
      },

      // Village Daily Report — Site Admin, Village Admin
      {
        path: 'village/daily-report',
        name: 'admin-village-daily-report',
        component: () => import('@/views/admin/village/VillageDailyReportView.vue'),
        meta: { title: 'التقرير اليومي', roles: [ROLES.SITE_ADMIN, ROLES.VILLAGE_ADMIN] },
      },

      // Coupons — Site Admin, Site CS
      {
        path: 'coupons',
        name: 'admin-coupons',
        component: () => import('@/views/admin/coupons/CouponListView.vue'),
        meta: { title: 'كوبونات الخصم', roles: [ROLES.SITE_ADMIN, ROLES.SITE_CS] },
      },
      {
        path: 'coupons/report',
        name: 'admin-coupons-report',
        component: () => import('@/views/admin/coupons/CouponReportView.vue'),
        meta: { title: 'تقرير الكوبونات', roles: [ROLES.SITE_ADMIN, ROLES.SITE_CS] },
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
    return { name: 'admin-owner' }
  }

  // Role-based guard for admin routes
  if (to.meta.roles && auth.isAuthenticated) {
    if (!to.meta.roles.includes(userRole)) {
      if (hasValidAdminRole) {
        // Has admin access but not for THIS specific route — bounce to dashboard home
        return { name: 'admin-owner' }
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
