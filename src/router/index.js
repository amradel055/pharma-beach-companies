import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLES, ADMIN_ROLES } from '@/constants/roles'
import MainLayout from '@/layouts/MainLayout.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import NestedLayout from '@/layouts/NestedLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const routes = [
  // Main layout — header + footer
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
      },
    ],
  },

  // Default layout — empty page (no header, no footer)
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/LoginView.vue'),
        meta: { title: 'تسجيل الدخول', guest: true },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/views/RegisterView.vue'),
        meta: { title: 'إنشاء حساب', guest: true },
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: () => import('@/views/ForgotPasswordView.vue'),
        meta: { title: 'نسيت كلمة المرور', guest: true },
      },
      {
        path: 'reset-password',
        name: 'reset-password',
        component: () => import('@/views/ResetPasswordView.vue'),
        meta: { title: 'إعادة تعيين كلمة المرور' },
      },
    ],
  },

  // Booking wizard
  {
    path: '/booking',
    component: NestedLayout,
    children: [
      {
        path: '',
        name: 'booking',
        component: () => import('@/views/BookingView.vue'),
        meta: { title: 'البحث عن شاليه' },
      },
      {
        path: ':id',
        name: 'chalet-details',
        component: () => import('@/views/ChaletDetailsView.vue'),
        meta: { title: 'تفاصيل الشاليه' },
      },
    ],
  },

  // Booking confirmation (requires auth)
  {
    path: '/booking-confirmation',
    component: NestedLayout,
    children: [
      {
        path: ':id',
        name: 'booking-confirmation',
        component: () => import('@/views/BookingConfirmationView.vue'),
        meta: { title: 'تأكيد الحجز', requiresAuth: true },
      },
    ],
  },

  // Entry permit (requires auth)
  {
    path: '/entry-permit',
    component: NestedLayout,
    children: [
      {
        path: ':id',
        name: 'entry-permit',
        component: () => import('@/views/EntryPermitView.vue'),
        meta: { title: 'تصريح الدخول', requiresAuth: true },
      },
    ],
  },

  // Nested layout — different navbar, no footer
  {
    path: '/app',
    component: NestedLayout,
    children: [
      {
        path: 'privacy',
        name: 'privacy',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'السياسات والخصوصية' },
      },
      {
        path: 'terms',
        name: 'terms',
        component: () => import('@/views/TermsPageView.vue'),
        meta: { title: 'الشروط والأحكام' },
      },
      {
        path: 'contact',
        name: 'contact',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: 'تواصل معنا' },
      },
    ],
  },

  // Admin dashboard
  {
    path: '/admin',
    component: DashboardLayout,
    meta: { requiresAuth: true, roles: [...ADMIN_ROLES] },
    children: [
      // Everyone with admin access
      {
        path: '',
        name: 'admin-home',
        component: () => import('@/views/admin/DashboardHomeView.vue'),
        meta: { title: 'لوحة التحكم', roles: [...ADMIN_ROLES] },
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

      // Owner dashboard — Site Admin, Owner
      {
        path: 'owner',
        name: 'admin-owner',
        component: () => import('@/views/admin/owner/OwnerDashboardView.vue'),
        meta: { title: 'شاليهاتي', roles: [ROLES.SITE_ADMIN, ROLES.OWNER] },
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

  // Protected routes — redirect to login if not authenticated
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    auth.returnUrl = to.fullPath
    return { name: 'login' }
  }

  // Guest-only routes — redirect to home if already authenticated
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'home' }
  }

  // Role-based guard for admin routes
  if (to.meta.roles && auth.isAuthenticated) {
    const userRole = auth.user?.role
    if (!to.meta.roles.includes(userRole)) {
      // User doesn't have the required role
      if (ADMIN_ROLES.includes(userRole)) {
        return { name: 'admin-home' }
      }
      return { name: 'home' }
    }
  }
})

export default router
