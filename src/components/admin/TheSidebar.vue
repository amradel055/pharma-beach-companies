<template>
  <aside :class="['sidebar', { collapsed, 'mobile-open': mobileOpen }]">
    <div class="sidebar-inner">
    <!-- Logo Area -->
    <div class="sidebar-header">
      <RouterLink to="/admin" class="sidebar-logo">
        <div class="logo-icon">
          <img :src="logo" alt="PB" />
        </div>
        <Transition name="fade-text">
          <span v-if="!collapsed" class="logo-text">Pharma Beach</span>
        </Transition>
      </RouterLink>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <template v-for="(section, si) in visibleSections" :key="section.label">
        <div class="nav-group" :style="{ '--si': si }">
          <!-- Section Label -->
          <div v-if="!collapsed" class="nav-group-label">
            {{ section.label }}
          </div>
          <div v-else class="nav-group-divider" />

          <!-- Menu Items -->
          <div v-for="item in section.items" :key="item.to" class="nav-item-wrapper">
            <RouterLink
              :to="item.to"
              :class="['nav-item', { active: isActive(item.to) }]"
              @click="$emit('closeMobile')"
            >
              <div class="nav-item-icon">
                <i :class="item.icon" />
              </div>
              <Transition name="fade-text">
                <span v-if="!collapsed" class="nav-item-label">{{ item.label }}</span>
              </Transition>
              <span v-if="!collapsed && item.badge" class="nav-badge">{{ item.badge }}</span>

              <!-- Active Indicator -->
              <div v-if="isActive(item.to)" class="active-indicator" />
            </RouterLink>

            <!-- Tooltip (collapsed state) -->
            <Transition name="tooltip">
              <div v-if="collapsed && hoveredItem === item.to" class="nav-tooltip">
                {{ item.label }}
              </div>
            </Transition>
          </div>
        </div>
      </template>
    </nav>
    </div>

    <!-- Floating Collapse Button -->
    <button :class="['edge-toggle', { collapsed }]" @click="$emit('toggle')">
      <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'" />
    </button>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useApprovalsStore } from '@/stores/approvals'
import logo from '@/assets/images/logo.png'

const props = defineProps({
  collapsed: Boolean,
  mobileOpen: Boolean,
})
defineEmits(['toggle', 'closeMobile'])

const route = useRoute()
const { hasPermission } = usePermissions()
const approvalsStore = useApprovalsStore()
const hoveredItem = ref(null)

function isActive(path) {
  if (path === '/admin') return route.path === '/admin'
  return route.path === path || route.path.startsWith(path + '/')
}

const allSections = [
  {
    label: 'الحجوزات',
    permission: 'view_owner_dashboard',
    items: [
      { label: 'التقويم', to: '/admin/owner', icon: 'pi pi-calendar' },
      { label: 'السجل', to: '/admin/bookings', icon: 'pi pi-list' },
    ],
  },
  // ─── Hidden for now — flip `hidden: false` to bring back ─────────────────
  {
    label: 'إدارة المستخدمين',
    permission: 'manage_users',
    hidden: true,
    items: [
      { label: 'المستخدمين', to: '/admin/users', icon: 'pi pi-users' },
    ],
  },
  {
    label: 'إدارة الشاليهات',
    permission: 'manage_chalets',
    hidden: true,
    items: [
      { label: 'الشاليهات', to: '/admin/chalets', icon: 'pi pi-building' },
      { label: 'خيارات البحث', to: '/admin/settings/search-attributes', icon: 'pi pi-sliders-h' },
      { label: 'الكماليات', to: '/admin/settings/amenities', icon: 'pi pi-sparkles' },
    ],
  },
  {
    label: 'الاعتمادات',
    permission: 'manage_approvals',
    hidden: true,
    items: [
      { label: 'طلبات الاعتماد', to: '/admin/approvals', icon: 'pi pi-check-circle', badge: computed(() => approvalsStore.pendingCount || null) },
    ],
  },
  {
    label: 'إدارة القرية',
    permission: 'view_village_dashboard',
    hidden: true,
    items: [
      { label: 'تقارير القرية', to: '/admin/village', icon: 'pi pi-chart-bar' },
    ],
  },
  {
    label: 'العمليات',
    permission: 'manage_orders',
    hidden: true,
    items: [
      { label: 'الطلبات', to: '/admin/orders', icon: 'pi pi-clipboard' },
      { label: 'التصاريح', to: '/admin/permits', icon: 'pi pi-id-card' },
    ],
  },
  {
    label: 'المشغلين',
    permission: 'manage_operators',
    hidden: true,
    items: [
      { label: 'إدارة المشغلين', to: '/admin/operators', icon: 'pi pi-cog' },
    ],
  },
  {
    label: 'لوحة المشغل',
    permission: 'view_operator_dashboard',
    hidden: true,
    items: [
      { label: 'لوحة المشغل', to: '/admin/operator', icon: 'pi pi-objects-column' },
    ],
  },
  {
    label: 'إدارة الأمن',
    permission: 'manage_security',
    hidden: true,
    items: [
      { label: 'أعضاء الأمن', to: '/admin/security', icon: 'pi pi-shield' },
    ],
  },
  {
    label: 'الأمن',
    permission: 'scan_qr',
    hidden: true,
    items: [
      { label: 'ماسح QR', to: '/admin/security/scanner', icon: 'pi pi-qrcode' },
    ],
  },
  {
    label: 'البروكر',
    permission: 'view_broker_dashboard',
    hidden: true,
    items: [
      { label: 'لوحة البروكر', to: '/admin/broker', icon: 'pi pi-briefcase' },
    ],
  },
  {
    label: 'المندوب',
    permission: 'view_agent_permits',
    hidden: true,
    items: [
      { label: 'تصاريحي', to: '/admin/agent/permits', icon: 'pi pi-id-card' },
    ],
  },
  {
    label: 'التسويق',
    permission: 'manage_coupons',
    hidden: true,
    items: [
      { label: 'كوبونات الخصم', to: '/admin/coupons', icon: 'pi pi-tag' },
    ],
  },
]

const visibleSections = computed(() => {
  return allSections.filter((section) => {
    if (section.hidden) return false
    if (!section.permission) return true
    return hasPermission(section.permission)
  })
})
</script>

<style scoped>
/* ═══════════════════════════════════
   SIDEBAR SHELL
   ═══════════════════════════════════ */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 260px;
  height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1a2332 100%);
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  border-left: 1px solid rgba(148, 163, 184, 0.08);
  border-radius:12px 0 0 12px
}

.sidebar.collapsed {
  width: 72px;
  border-radius:6px 0 0 6px
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ═══════════════════════════════════
   HEADER / LOGO
   ═══════════════════════════════════ */
.sidebar-header {
  padding: 20px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  min-height: 72px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #fff;
  width: 100%;
  overflow: hidden;
}

.logo-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
  transition: transform 0.3s ease;
}

.sidebar-logo:hover .logo-icon {
  transform: scale(1.05);
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-text {
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  background: linear-gradient(135deg, #f97316, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
}

/* ═══════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════ */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
  clip-path: inset(0);
}

/* Scrollbar — ultra thin, visible only on hover */
.sidebar-nav {
  scrollbar-width: none;
}

.sidebar-nav::-webkit-scrollbar {
  width: 0;
}

.sidebar-nav:hover {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
}

.sidebar-nav:hover::-webkit-scrollbar {
  width: 3px;
  margin-left: 2px;
}

.sidebar-nav:hover::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

.sidebar-nav:hover::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.sidebar-nav:hover::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* ═══════════════════════════════════
   NAV GROUPS
   ═══════════════════════════════════ */
.nav-group {
  margin-bottom: 4px;
  animation: groupFadeIn 0.4s ease both;
  animation-delay: calc(var(--si) * 0.05s);
}

.nav-group-label {
  padding: 16px 20px 6px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
}

.nav-group-divider {
  height: 1px;
  background: rgba(148, 163, 184, 0.06);
  margin: 8px 16px;
}

/* ═══════════════════════════════════
   NAV ITEMS
   ═══════════════════════════════════ */
.nav-item-wrapper {
  position: relative;
  padding: 2px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  background: none;
  border: none;
  width: 100%;
  text-align: right;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0;
}

/* Hover */
.nav-item:hover {
  color: #e2e8f0;
  background: rgba(148, 163, 184, 0.08);
}

/* Active */
.nav-item.active {
  color: #fff;
  background: rgba(249, 115, 22, 0.12);
  font-weight: 600;
}

.nav-item.active .nav-item-icon {
  color: #f97316;
}

/* Active Indicator (right border pill) */
.active-indicator {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: #f97316;
  border-radius: 3px 0 0 3px;
  box-shadow: 0 0 8px rgba(249, 115, 22, 0.4);
  animation: indicatorSlide 0.3s ease;
}

.sidebar.collapsed .active-indicator {
  right: -8px;
}

/* Icon */
.nav-item-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s ease, transform 0.2s ease;
}

.nav-item-icon i {
  font-size: 18px;
}

.nav-item:hover .nav-item-icon {
  transform: scale(1.08);
}

/* Label */
.nav-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badge */
.nav-badge {
  margin-right: auto;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
  line-height: 16px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

/* ═══════════════════════════════════
   TOOLTIPS (collapsed state)
   ═══════════════════════════════════ */
.nav-tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: #1e293b;
  color: #f1f5f9;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  white-space: nowrap;
  z-index: 1001;
  pointer-events: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.nav-tooltip::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-left-color: #1e293b;
}

/* ═══════════════════════════════════
   FOOTER
   ═══════════════════════════════════ */

/* ═══════════════════════════════════
   FLOATING EDGE TOGGLE
   ═══════════════════════════════════ */
.edge-toggle {
  position: absolute;
  top: 28px;
  left: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  z-index: 1001;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.edge-toggle:hover {
  background: #f97316;
  border-color: #f97316;
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 3px 12px rgba(249, 115, 22, 0.3);
}

.edge-toggle i {
  transition: transform 0.3s ease;
}

/* ═══════════════════════════════════
   TRANSITIONS
   ═══════════════════════════════════ */
.fade-text-enter-active {
  transition: opacity 0.2s ease 0.1s;
}

.fade-text-leave-active {
  transition: opacity 0.15s ease;
}

.fade-text-enter-from,
.fade-text-leave-to {
  opacity: 0;
}

.tooltip-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-leave-active {
  transition: all 0.15s ease;
}

.tooltip-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(6px);
}

.tooltip-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(6px);
}

/* ═══════════════════════════════════
   ANIMATIONS
   ═══════════════════════════════════ */
@keyframes groupFadeIn {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes indicatorSlide {
  from {
    opacity: 0;
    height: 0;
  }
  to {
    opacity: 1;
    height: 20px;
  }
}

/* ═══════════════════════════════════
   MOBILE
   ═══════════════════════════════════ */
@media (max-width: 768px) {
  .sidebar {
    width: 280px;
    transform: translateX(100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
    overflow-x: hidden;
  }

  .sidebar.collapsed {
    width: 280px;
    transform: translateX(100%);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.3);
  }

  .sidebar.collapsed.mobile-open {
    transform: translateX(0);
  }

  .sidebar.collapsed .nav-item {
    justify-content: flex-start;
    padding: 0 12px;
  }

  .edge-toggle {
    display: none;
  }

  .nav-group-label {
    display: block !important;
  }

  .nav-group-divider {
    display: none;
  }

  .nav-item-label {
    display: inline !important;
  }

  .nav-badge {
    display: inline !important;
  }

  .logo-text {
    display: inline !important;
  }
}
</style>
