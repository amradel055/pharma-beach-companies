<template>
  <div class="dashboard-home">
    <!-- Welcome Card -->
    <div class="welcome-card">
      <!-- Animated Background -->
      <div class="welcome-bg">
        <div class="wb-orb o1" />
        <div class="wb-orb o2" />
        <div class="wb-orb o3" />
        <div class="wb-orb o4" />
        <div class="wb-orb o5" />
        <div class="wb-grid" />
        <div class="wb-shimmer" />
      </div>

      <!-- Particles -->
      <div class="wb-particles">
        <span v-for="n in 6" :key="n" class="particle" :style="{ '--p': n }" />
      </div>

      <div class="welcome-content">
        <div class="welcome-badge anim-item" style="--d: 0s">
          <span class="badge-dot" />
          <span>{{ roleLabel }}</span>
        </div>
        <h1 class="welcome-title anim-item" style="--d: 0.1s">
          مرحباً، <span class="title-gradient">{{ auth.user?.name }}</span>
        </h1>
        <p class="welcome-desc anim-item" style="--d: 0.2s">{{ welcomeMessage }}</p>
        <div class="welcome-date anim-item" style="--d: 0.3s">
          <i class="pi pi-calendar" />
          <span>{{ todayFormatted }}</span>
        </div>
      </div>

      <div class="welcome-visual anim-item" style="--d: 0.15s">
        <div class="wv-orbit">
          <div class="wv-dot d1" />
          <div class="wv-dot d2" />
          <div class="wv-dot d3" />
        </div>
        <div class="wv-ring r1" />
        <div class="wv-ring r2" />
        <div class="wv-core">
          <span class="wv-logo-top">Pharma</span>
          <span class="wv-logo-bottom">Beach</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div
        v-for="(stat, i) in roleStats"
        :key="i"
        class="stat-card"
        :style="{ '--i': i, '--accent': stat.color }"
      >
        <!-- Background glow on hover -->
        <div class="stat-glow" />
        <div class="stat-shine" />

        <div class="stat-header">
          <div class="stat-icon-wrap">
            <div class="stat-icon-ring" />
            <i :class="stat.icon" />
          </div>
          <span class="stat-suffix">{{ stat.suffix }}</span>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: stat.bar }" />
          <div class="stat-bar-glow" :style="{ width: stat.bar }" />
        </div>
      </div>
    </div>

    <!-- Activity + Quick Actions Row -->
    <div class="bottom-grid">
      <!-- Recent Activity -->
      <div class="activity-card anim-section" style="--d: 0.5s">
        <div class="card-head">
          <h2><i class="pi pi-history" /> النشاط الأخير</h2>
        </div>
        <div class="activity-list">
          <div v-for="(a, i) in recentActivity" :key="i" class="activity-item" :style="{ '--d': (0.55 + i * 0.04) + 's' }">
            <div class="act-icon" :style="{ background: a.bg }">
              <i :class="a.icon" :style="{ color: a.color }" />
            </div>
            <div class="act-info">
              <span class="act-text">{{ a.text }}</span>
              <span class="act-time">{{ a.time }}</span>
            </div>
          </div>
          <div v-if="recentActivity.length === 0" class="activity-empty">
            <i class="pi pi-check-circle" />
            <span>لا يوجد نشاط حديث</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-card anim-section" style="--d: 0.55s">
        <div class="card-head">
          <h2><i class="pi pi-bolt" /> الوصول السريع</h2>
        </div>
        <div class="quick-grid">
          <RouterLink
            v-for="(action, i) in quickActions"
            :key="i"
            :to="action.to"
            class="quick-item"
            :style="{ '--d': (0.6 + i * 0.04) + 's', '--accent': action.color }"
          >
            <div class="qi-icon">
              <i :class="action.icon" />
            </div>
            <span class="qi-label">{{ action.label }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Pending Orders Banner -->
    <div v-if="pendingOrders > 0" class="pending-banner anim-section" style="--d: 0.7s">
      <div class="pb-content">
        <div class="pb-pulse" />
        <div class="pb-info">
          <strong>{{ pendingOrders }} طلب في الانتظار</strong>
          <span>تحتاج إلى مراجعة ومعالجة</span>
        </div>
      </div>
      <RouterLink to="/admin/orders" class="pb-btn">
        <span>عرض الطلبات</span>
        <i class="pi pi-arrow-left" />
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'
import { useChaletsStore } from '@/stores/chalets'
import { useUsersStore } from '@/stores/users'
import { useCouponsStore } from '@/stores/coupons'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES, ROLE_LABELS } from '@/constants/roles'

const auth = useAuthStore()
const bookingsStore = useBookingsStore()
const chaletsStore = useChaletsStore()
const usersStore = useUsersStore()
const couponsStore = useCouponsStore()
const { hasRole, hasPermission } = usePermissions()

const roleLabel = computed(() => ROLE_LABELS[auth.user?.role] || 'مستخدم')

const todayFormatted = new Date().toLocaleDateString('ar-EG', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const welcomeMessage = computed(() => {
  if (hasRole(ROLES.SITE_ADMIN)) return 'يمكنك إدارة كل أقسام النظام ومراقبة الأداء العام'
  if (hasRole(ROLES.SITE_CS)) return 'يمكنك إدارة الشاليهات والمستخدمين وخيارات البحث'
  if (hasRole(ROLES.VILLAGE_CS)) return 'يمكنك إدارة الطلبات والتصاريح ومتابعة العمليات'
  if (hasRole(ROLES.OWNER)) return 'تابع شاليهاتك وتقاريرك المالية وأداء الحجوزات'
  if (hasRole(ROLES.BROKER)) return 'تابع أداء مناديبك وعمولاتك وتقارير الحجوزات'
  if (hasRole(ROLES.AGENT)) return 'يمكنك متابعة تصاريحك وحجوزاتك'
  return 'مرحباً بك في لوحة التحكم'
})

const totalBookings = computed(() => bookingsStore.bookings.filter((b) => b.status === 'CONFIRMED').length)
const totalRevenue = computed(() => bookingsStore.bookings.filter((b) => b.status === 'CONFIRMED').reduce((s, b) => s + Number(b.total || 0), 0))
const pendingOrders = computed(() => bookingsStore.bookings.filter((b) => b.status === 'PENDING' || b.status === 'PROCESSING' || b.status === 'TEMPORARY').length)
const activeCoupons = computed(() => couponsStore.totalActive)

const roleStats = computed(() => [
  {
    label: 'إجمالي الحجوزات',
    value: totalBookings.value.toLocaleString('ar-EG'),
    icon: 'pi pi-calendar',
    color: '#f97316',
    suffix: 'حجز',
    bar: Math.min(100, totalBookings.value * 5) + '%',
  },
  {
    label: 'الشاليهات النشطة',
    value: chaletsStore.totalPublished.toLocaleString('ar-EG'),
    icon: 'pi pi-building',
    color: '#0ea5e9',
    suffix: 'شاليه',
    bar: Math.min(100, chaletsStore.totalPublished * 10) + '%',
  },
  {
    label: 'المستخدمين',
    value: usersStore.totalInternal.toLocaleString('ar-EG'),
    icon: 'pi pi-users',
    color: '#8b5cf6',
    suffix: 'مستخدم',
    bar: Math.min(100, usersStore.totalInternal * 8) + '%',
  },
  {
    label: 'الإيرادات',
    value: totalRevenue.value.toLocaleString('ar-EG'),
    icon: 'pi pi-wallet',
    color: '#10b981',
    suffix: 'ج.م',
    bar: Math.min(100, totalRevenue.value / 500) + '%',
  },
])

// Recent activity from bookings
const recentActivity = computed(() => {
  return bookingsStore.bookings
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((b) => {
      const statusMap = {
        CONFIRMED: { text: `تم تأكيد حجز ${b.chaletName}`, icon: 'pi pi-check-circle', color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
        PENDING: { text: `طلب حجز جديد - ${b.chaletName}`, icon: 'pi pi-clock', color: '#eab308', bg: 'rgba(234,179,8,0.08)' },
        PROCESSING: { text: `جاري معالجة حجز ${b.chaletName}`, icon: 'pi pi-spin pi-spinner', color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
        TEMPORARY: { text: `حجز مؤقت - ${b.chaletName}`, icon: 'pi pi-bookmark', color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
      }
      const info = statusMap[b.status] || statusMap.PENDING
      return {
        ...info,
        time: timeAgo(b.createdAt),
      }
    })
})

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'الآن'
  if (mins < 60) return `منذ ${mins} دقيقة`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `منذ ${hours} ساعة`
  const days = Math.floor(hours / 24)
  return `منذ ${days} يوم`
}

const quickActions = computed(() => {
  const actions = []
  if (hasPermission('manage_users')) actions.push({ label: 'المستخدمين', to: '/admin/users', icon: 'pi pi-users', color: '#8b5cf6' })
  if (hasPermission('manage_chalets')) actions.push({ label: 'الشاليهات', to: '/admin/chalets', icon: 'pi pi-building', color: '#0ea5e9' })
  if (hasPermission('manage_approvals')) actions.push({ label: 'الاعتمادات', to: '/admin/approvals', icon: 'pi pi-check-circle', color: '#10b981' })
  if (hasPermission('view_owner_dashboard')) actions.push({ label: 'شاليهاتي', to: '/admin/owner', icon: 'pi pi-home', color: '#f97316' })
  if (hasPermission('view_village_dashboard')) actions.push({ label: 'تقارير القرية', to: '/admin/village', icon: 'pi pi-chart-bar', color: '#06b6d4' })
  if (hasPermission('manage_orders')) actions.push({ label: 'الطلبات', to: '/admin/orders', icon: 'pi pi-clipboard', color: '#f43f5e' })
  if (hasPermission('view_broker_dashboard')) actions.push({ label: 'البروكر', to: '/admin/broker', icon: 'pi pi-briefcase', color: '#eab308' })
  if (hasPermission('view_agent_permits')) actions.push({ label: 'تصاريحي', to: '/admin/agent/permits', icon: 'pi pi-id-card', color: '#64748b' })
  if (hasPermission('manage_coupons')) actions.push({ label: 'الكوبونات', to: '/admin/coupons', icon: 'pi pi-tag', color: '#ec4899' })
  return actions
})
</script>

<style scoped>
.dashboard-home {
  width: 100%;
}

/* ═══════════════════════════════════
   WELCOME CARD
   ═══════════════════════════════════ */
.welcome-card {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #162036 40%, #1a1a3e 70%, #0f172a 100%);
  border-radius: 20px;
  padding: 44px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  overflow: hidden;
  animation: welcomeEntry 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animated Orbs */
.welcome-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.wb-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  opacity: 0;
  animation: orbAppear 1s ease forwards, orbFloat var(--dur) ease-in-out infinite var(--del);
}

.wb-orb.o1 {
  width: 280px; height: 280px;
  background: rgba(249, 115, 22, 0.15);
  top: -80px; left: -40px;
  --dur: 8s; --del: 0.3s;
}

.wb-orb.o2 {
  width: 220px; height: 220px;
  background: rgba(14, 165, 233, 0.12);
  bottom: -100px; right: 15%;
  --dur: 11s; --del: 0.5s;
}

.wb-orb.o3 {
  width: 160px; height: 160px;
  background: rgba(139, 92, 246, 0.12);
  top: 10%; right: 25%;
  --dur: 13s; --del: 0.7s;
}

.wb-orb.o4 {
  width: 120px; height: 120px;
  background: rgba(236, 72, 153, 0.08);
  bottom: 10%; left: 25%;
  --dur: 9s; --del: 0.9s;
}

.wb-orb.o5 {
  width: 100px; height: 100px;
  background: rgba(16, 185, 129, 0.08);
  top: 50%; right: 5%;
  --dur: 10s; --del: 1.1s;
}

/* Subtle grid pattern */
.wb-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(ellipse 60% 80% at 30% 50%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 80% at 30% 50%, black 30%, transparent 70%);
}

/* Shimmer sweep */
.wb-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
  animation: shimmerSweep 6s ease-in-out infinite;
  transform: skewX(-15deg);
}

/* Floating particles */
.wb-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.4);
  animation: particleFloat calc(4s + var(--p) * 1.5s) ease-in-out infinite;
  animation-delay: calc(var(--p) * 0.8s);
  top: calc(20% + var(--p) * 10%);
  right: calc(5% + var(--p) * 14%);
  opacity: 0;
}

.particle:nth-child(even) {
  background: rgba(14, 165, 233, 0.3);
  width: 2px;
  height: 2px;
}

/* Content */
.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(249, 115, 22, 0.1);
  border: 1px solid rgba(249, 115, 22, 0.15);
  color: #fb923c;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
  backdrop-filter: blur(8px);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f97316;
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.6);
  animation: dotPulse 2s ease-in-out infinite;
}

.welcome-title {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.title-gradient {
  background: linear-gradient(135deg, #f97316, #fb923c, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 200% auto;
  animation: gradientShift 4s ease infinite;
}

.welcome-desc {
  color: #94a3b8;
  font-size: 15px;
  margin: 0 0 18px;
  max-width: 480px;
  line-height: 1.7;
}

.welcome-date {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  padding: 8px 18px;
  border-radius: 10px;
  backdrop-filter: blur(8px);
  transition: all 0.3s;
}

.welcome-date:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.1);
}

.welcome-date i {
  color: #f97316;
  font-size: 14px;
}

/* Visual — orbiting dots + rings */
.welcome-visual {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wv-orbit {
  position: absolute;
  inset: 0;
  animation: spinSlow 16s linear infinite;
}

.wv-dot {
  position: absolute;
  border-radius: 50%;
  box-shadow: 0 0 12px currentColor;
}

.wv-dot.d1 {
  width: 8px; height: 8px;
  background: #f97316;
  color: rgba(249, 115, 22, 0.5);
  top: 10px; right: 50%;
  transform: translateX(50%);
}

.wv-dot.d2 {
  width: 6px; height: 6px;
  background: #0ea5e9;
  color: rgba(14, 165, 233, 0.5);
  bottom: 20px; left: 10px;
}

.wv-dot.d3 {
  width: 5px; height: 5px;
  background: #8b5cf6;
  color: rgba(139, 92, 246, 0.5);
  top: 50%; right: 5px;
}

.wv-ring {
  position: absolute;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.wv-ring.r1 {
  width: 200px;
  height: 200px;
  border: 1px dashed rgba(249, 115, 22, 0.1);
  animation: spinSlow 25s linear infinite reverse;
}

.wv-ring.r2 {
  width: 165px;
  height: 165px;
  border: 1px solid rgba(249, 115, 22, 0.12);
  animation: spinSlow 18s linear infinite;
}

/* Fixed center — no rotation */
.wv-core {
  position: relative;
  z-index: 2;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.12), rgba(15, 23, 42, 0.4));
  border: 1px solid rgba(249, 115, 22, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  animation: corePulse 3s ease-in-out infinite;
  box-shadow:
    0 0 30px rgba(249, 115, 22, 0.1),
    inset 0 0 20px rgba(249, 115, 22, 0.05);
  backdrop-filter: blur(4px);
}

.wv-logo-top {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.wv-logo-bottom {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  text-transform: uppercase;
  color: rgba(251, 146, 60, 0.5);
  line-height: 1;
}

/* Anim items */
.anim-item {
  animation: slideUp 0.5s ease both;
  animation-delay: var(--d);
}

.anim-section {
  animation: slideUp 0.4s ease both;
  animation-delay: var(--d);
}

/* ═══════════════════════════════════
   STATS GRID
   ═══════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid #f1f5f9;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  animation: statEntry 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
  animation-delay: calc(var(--i) * 0.08s + 0.3s);
  position: relative;
  overflow: hidden;
  cursor: default;
}

/* Top accent line */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  border-color: color-mix(in srgb, var(--accent) 20%, #e2e8f0);
  box-shadow:
    0 8px 28px rgba(0, 0, 0, 0.04),
    0 0 0 1px color-mix(in srgb, var(--accent) 6%, transparent);
  transform: translateY(-4px);
}

.stat-card:hover::before {
  opacity: 1;
}

/* Background glow on hover */
.stat-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 4%, transparent), transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.stat-card:hover .stat-glow {
  opacity: 1;
}

/* Shine sweep on hover */
.stat-shine {
  position: absolute;
  top: 0;
  right: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
  transform: skewX(-15deg);
  pointer-events: none;
  transition: none;
}

.stat-card:hover .stat-shine {
  animation: statShine 0.6s ease forwards;
}

/* Header */
.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  position: relative;
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-icon-ring {
  position: absolute;
  inset: -3px;
  border-radius: 16px;
  border: 2px solid color-mix(in srgb, var(--accent) 12%, transparent);
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.1) rotate(-5deg);
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.stat-card:hover .stat-icon-ring {
  opacity: 1;
  transform: scale(1);
}

.stat-icon-wrap i {
  font-size: 22px;
  color: var(--accent);
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
}

.stat-card:hover .stat-icon-wrap i {
  transform: scale(1.05);
}

.stat-suffix {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  background: #f8fafc;
  padding: 3px 10px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-suffix {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

/* Body */
.stat-body {
  margin-bottom: 14px;
  position: relative;
}

.stat-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.5px;
  line-height: 1;
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.stat-card:hover .stat-value {
  color: var(--accent);
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

/* Progress Bar */
.stat-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, #fff));
  width: 0%;
  animation: barGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 0.1s + 0.6s);
  position: relative;
}

/* Glowing tip on progress bar */
.stat-bar-glow {
  position: absolute;
  top: -2px;
  height: 8px;
  width: 0%;
  animation: barGrow 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--i) * 0.1s + 0.6s);
  pointer-events: none;
  filter: blur(4px);
  background: var(--accent);
  opacity: 0.3;
  border-radius: 4px;
}

/* ═══════════════════════════════════
   BOTTOM GRID
   ═══════════════════════════════════ */
.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.card-head {
  margin-bottom: 16px;
}

.card-head h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.card-head h2 i {
  font-size: 16px;
  color: #f97316;
}

/* Activity */
.activity-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 22px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  transition: background 0.15s;
  animation: slideUp 0.35s ease both;
  animation-delay: var(--d);
}

.activity-item:hover {
  background: #f8fafc;
}

.act-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.act-icon i {
  font-size: 15px;
}

.act-info {
  flex: 1;
  min-width: 0;
}

.act-text {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.act-time {
  display: block;
  font-size: 11.5px;
  color: #94a3b8;
  margin-top: 1px;
}

.activity-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: #94a3b8;
  font-size: 13.5px;
}

/* Quick Actions */
.quick-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 22px;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 18px 10px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  text-decoration: none;
  transition: all 0.2s ease;
  animation: slideUp 0.35s ease both;
  animation-delay: var(--d);
}

.quick-item:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 3%, transparent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.quick-item:hover .qi-icon {
  transform: scale(1.15);
}

.qi-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 8%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.qi-icon i {
  font-size: 18px;
  color: var(--accent);
}

.qi-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  text-align: center;
}

/* ═══════════════════════════════════
   PENDING BANNER
   ═══════════════════════════════════ */
.pending-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.06), rgba(249, 115, 22, 0.06));
  border: 1px solid rgba(234, 179, 8, 0.15);
  border-radius: 14px;
}

.pb-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pb-pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #eab308;
  animation: pulse 2s ease-in-out infinite;
  flex-shrink: 0;
}

.pb-info strong {
  display: block;
  font-size: 14px;
  color: #92400e;
}

.pb-info span {
  display: block;
  font-size: 12.5px;
  color: #a16207;
}

.pb-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 20px;
  background: #f97316;
  color: #fff;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
}

.pb-btn:hover {
  background: #ea580c;
  transform: translateY(-1px);
}

.pb-btn i {
  font-size: 12px;
  transition: transform 0.2s;
}

.pb-btn:hover i {
  transform: translateX(-3px);
}

/* ═══════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════ */
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes statEntry {
  from { opacity: 0; transform: translateY(24px) scale(0.96); }
  60% { transform: translateY(-2px) scale(1.01); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes statShine {
  from { right: -100%; }
  to { right: 200%; }
}

@keyframes barGrow {
  from { width: 0%; }
}

@keyframes welcomeEntry {
  from { opacity: 0; transform: translateY(16px) scale(0.99); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes orbAppear {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(15px, -20px) scale(1.05); }
  66% { transform: translate(-10px, 10px) scale(0.95); }
}

@keyframes shimmerSweep {
  0%, 100% { left: -100%; }
  50% { left: 150%; }
}

@keyframes particleFloat {
  0% { opacity: 0; transform: translateY(0) scale(0); }
  20% { opacity: 0.8; transform: translateY(-10px) scale(1); }
  80% { opacity: 0.3; transform: translateY(-40px) scale(0.6); }
  100% { opacity: 0; transform: translateY(-60px) scale(0); }
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 8px rgba(249, 115, 22, 0.6); }
  50% { opacity: 0.6; transform: scale(0.8); box-shadow: 0 0 16px rgba(249, 115, 22, 0.3); }
}

@keyframes gradientShift {
  0% { background-position: 0% center; }
  50% { background-position: 200% center; }
  100% { background-position: 0% center; }
}

@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes corePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(249, 115, 22, 0.1); }
  50% { transform: scale(1.08); box-shadow: 0 0 50px rgba(249, 115, 22, 0.2); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .bottom-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .welcome-card { padding: 24px 18px; }
  .welcome-visual { display: none; }
  .welcome-title { font-size: 22px; }
  .welcome-desc { font-size: 13px; margin-bottom: 12px; }
  .welcome-date { font-size: 12px; padding: 6px 12px; }
  .welcome-badge { font-size: 11px; padding: 5px 12px; }
  .stats-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .stat-card { padding: 14px; }
  .stat-value { font-size: 20px; }
  .stat-icon-wrap { width: 40px; height: 40px; border-radius: 10px; }
  .stat-icon-wrap i { font-size: 18px; }
  .stat-label { font-size: 11.5px; }
  .stat-suffix { font-size: 10px; padding: 2px 6px; }
  .quick-grid { grid-template-columns: repeat(3, 1fr); gap: 6px; }
  .quick-item { padding: 12px 6px; }
  .qi-icon { width: 34px; height: 34px; border-radius: 10px; }
  .qi-icon i { font-size: 16px; }
  .qi-label { font-size: 11px; }
  .activity-card, .quick-card { padding: 16px; }
  .card-head h2 { font-size: 14px; }
  .act-text { font-size: 12px; }
  .act-icon { width: 32px; height: 32px; }
  .pending-banner { padding: 14px 16px; flex-direction: column; gap: 12px; align-items: flex-start; }
  .pb-btn { width: 100%; justify-content: center; }
}

@media (max-width: 380px) {
  .stats-grid { grid-template-columns: 1fr; }
  .quick-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
