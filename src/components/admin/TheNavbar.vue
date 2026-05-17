<template>
  <header class="navbar">
    <div class="nav-inner">
      <!-- Brand (RTL start) -->
      <div class="nav-brand">
        <button class="nav-burger" aria-label="القائمة" @click="mobileOpen = !mobileOpen">
          <i :class="mobileOpen ? 'pi pi-times' : 'pi pi-bars'" />
        </button>
        <RouterLink to="/" class="nav-logo">
          <img :src="logo" alt="Pharma Beach" />
        </RouterLink>
      </div>

      <!-- Primary nav (desktop) — centered -->
      <nav class="nav-links">
        <div class="nav-track">
          <template v-for="section in visibleSections" :key="section.label">
            <!-- Flat / single-item section → direct link(s) -->
            <template v-if="section.flat || section._items.length === 1">
              <RouterLink
                v-for="item in section._items"
                :key="item.to"
                :to="item.to"
                :class="['nav-link', { active: isActive(item.to) }]"
              >
                <i :class="item.icon" />
                <span>{{ item.label }}</span>
              </RouterLink>
            </template>

            <!-- Multi-item section → dropdown -->
            <div
              v-else
              :class="['nav-dd', { open: openDropdown === section.label }]"
            >
              <button
                :class="['nav-link', 'nav-dd-trigger', { active: sectionActive(section) }]"
                @click="toggleDropdown(section.label)"
              >
                <i :class="section.icon || 'pi pi-th-large'" />
                <span>{{ section.label }}</span>
                <i class="pi pi-chevron-down nav-dd-caret" />
              </button>
              <Transition name="dd">
                <div v-if="openDropdown === section.label" class="nav-dd-panel">
                  <RouterLink
                    v-for="item in section._items"
                    :key="item.to"
                    :to="item.to"
                    :class="['nav-dd-item', { active: isActive(item.to) }]"
                    @click="openDropdown = null"
                  >
                    <i :class="item.icon" />
                    <span>{{ item.label }}</span>
                  </RouterLink>
                </div>
              </Transition>
            </div>
          </template>
        </div>
      </nav>

      <!-- User (RTL end) -->
      <div class="nav-user" ref="userMenuRef">
        <button :class="['user-btn', { open: userMenuOpen }]" @click="userMenuOpen = !userMenuOpen">
          <div class="user-av">
            <i class="pi pi-user" />
          </div>
          <i class="pi pi-chevron-down user-caret" />
        </button>

        <Transition name="usr">
          <div v-if="userMenuOpen" class="drop-menu">
            <div class="drop-head">
              <div class="drop-av">
                {{ userInitial }}
                <span class="drop-av-dot" />
              </div>
              <div class="drop-info">
                <span class="drop-name">{{ auth.user?.name }}</span>
                <span class="drop-email">{{ auth.user?.email }}</span>
              </div>
            </div>

            <div class="drop-role-row">
              <span class="drop-role"><i class="pi pi-id-card" /> {{ roleLabel }}</span>
            </div>

            <div class="drop-list">
              <RouterLink
                to="/profile"
                class="drop-item"
                style="--i: 0"
                @click="userMenuOpen = false"
              >
                <span class="drop-ic"><i class="pi pi-user" /></span>
                <span class="drop-tx">
                  <b>الملف الشخصي</b>
                  <small>إدارة بيانات حسابك</small>
                </span>
                <i class="pi pi-angle-left drop-chev" />
              </RouterLink>
              <button class="drop-item danger" style="--i: 1" @click="handleLogout">
                <span class="drop-ic"><i class="pi pi-sign-out" /></span>
                <span class="drop-tx">
                  <b>تسجيل الخروج</b>
                  <small>إنهاء الجلسة الحالية</small>
                </span>
                <i class="pi pi-angle-left drop-chev" />
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="sheet">
      <div v-if="mobileOpen" class="mobile-menu">
        <template v-for="section in visibleSections" :key="section.label">
          <div class="m-group-label">{{ section.label }}</div>
          <RouterLink
            v-for="item in section._items"
            :key="item.to"
            :to="item.to"
            :class="['m-item', { active: isActive(item.to) }]"
            @click="mobileOpen = false"
          >
            <i :class="item.icon" />
            <span>{{ item.label }}</span>
          </RouterLink>
        </template>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false" />
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/constants/roles'
import { NAV_SECTIONS } from '@/constants/nav'
import logo from '@/assets/images/logo.png'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { hasPermission } = usePermissions()

const openDropdown = ref(null)
const userMenuOpen = ref(false)
const mobileOpen = ref(false)
const userMenuRef = ref(null)

const userInitial = computed(() => auth.user?.name?.charAt(0) || '؟')
const roleLabel = computed(() => ROLE_LABELS[auth.user?.role] || 'مستخدم')

// Per-item gating: an item is visible when the user has its own permission
// (or, if it has none, the section's). A section is shown only if ≥1 item is
// visible; `_items` carries just the visible ones. A section that collapses
// to a single visible item renders as a flat link (see template).
function itemVisible(section, item) {
  const perm = item.permission || section.permission
  return !perm || hasPermission(perm)
}
const visibleSections = computed(() =>
  NAV_SECTIONS
    .map((s) => ({ ...s, _items: s.items.filter((i) => itemVisible(s, i)) }))
    .filter((s) => s._items.length > 0),
)

function isActive(path) {
  if (path === '/') return route.path === '/'
  return route.path === path || route.path.startsWith(path + '/')
}
function sectionActive(section) {
  return section._items.some((i) => isActive(i.to))
}

function toggleDropdown(label) {
  openDropdown.value = openDropdown.value === label ? null : label
  userMenuOpen.value = false
}

async function handleLogout() {
  userMenuOpen.value = false
  await auth.logout()
  router.push({ name: 'login' })
}

function handleClickOutside(e) {
  if (!e.target.closest('.nav-dd')) openDropdown.value = null
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    userMenuOpen.value = false
  }
}

// Close every menu on navigation.
watch(
  () => route.fullPath,
  () => {
    openDropdown.value = null
    userMenuOpen.value = false
    mobileOpen.value = false
  },
)

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
/* ═══════════════════════════════════
   NAVBAR SHELL
   ═══════════════════════════════════ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}
/* Centred accent line — colour lives in the middle and fades out toward
   both edges. Keeps the continuous flow, masked so the ends disappear. */
.navbar::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 2px;
  background: linear-gradient(90deg, #f97316, #fbbf24, #fb923c, #f97316);
  background-size: 300% 100%;
  opacity: 0.7;
  -webkit-mask: linear-gradient(90deg, transparent 0%, #000 44%, #000 56%, transparent 100%);
  mask: linear-gradient(90deg, transparent 0%, #000 44%, #000 56%, transparent 100%);
  animation: navFlow 7s linear infinite;
}
@keyframes navFlow {
  to { background-position: 300% 0; }
}

/* 3-track grid → nav is perfectly centred regardless of brand / user width */
.nav-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  height: 66px;
  max-width: 1480px;
  margin: 0 auto;
  padding: 0 26px;
}

/* ═══════════════════════════════════
   BRAND
   ═══════════════════════════════════ */
.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-self: start;
}

.nav-logo {
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.nav-logo img {
  height: 32px;
  width: auto;
  object-fit: contain;
  display: block;
  animation: logoBreathe 4.5s ease-in-out infinite;
}
/* Periodic glint sweeping across the logo */
.nav-logo::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 45%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.6), transparent);
  transform: skewX(-18deg);
  pointer-events: none;
  animation: logoSheen 5.5s ease-in-out infinite;
}
@keyframes logoBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}
@keyframes logoSheen {
  0% { inset-inline-start: -60%; }
  22%, 100% { inset-inline-start: 130%; }
}

.nav-burger {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #f1f5f9;
  border: none;
  color: #334155;
  font-size: 17px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.nav-burger:hover {
  background: #e2e8f0;
}

/* ═══════════════════════════════════
   PRIMARY NAV — plain centred links
   ═══════════════════════════════════ */
.nav-links {
  justify-self: center;
  min-width: 0;
}

.nav-track {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px;
  color: #64748b;
  font-size: 13.5px;
  font-weight: 600;
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: color 0.16s;
}
.nav-link i {
  font-size: 16px;
  color: #94a3b8;
  transition: color 0.16s;
}
.nav-link:hover {
  color: #0f172a;
}
.nav-link:hover i {
  color: #64748b;
}
.nav-link.active {
  color: #ea580c;
}
.nav-link.active i {
  color: #f97316;
}

/* ═══════════════════════════════════
   DROPDOWN
   ═══════════════════════════════════ */
.nav-dd {
  position: relative;
}
.nav-dd-caret {
  font-size: 10px !important;
  color: #94a3b8;
  margin-inline-start: 1px;
  transition: transform 0.18s ease;
}
.nav-dd.open .nav-dd-caret {
  transform: rotate(180deg);
}
.nav-dd-trigger.active .nav-dd-caret {
  color: #f97316;
}

.nav-dd-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 50%;
  transform: translateX(50%);
  min-width: 230px;
  background: #fff;
  border: 1px solid rgba(226, 232, 240, 0.7);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04);
  padding: 7px;
  z-index: 1001;
}

.nav-dd-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.nav-dd-item i {
  font-size: 16px;
  width: 18px;
  text-align: center;
  color: #94a3b8;
  transition: color 0.15s;
}
.nav-dd-item:hover {
  background: #f8fafc;
  color: #0f172a;
}
.nav-dd-item.active {
  background: rgba(249, 115, 22, 0.09);
  color: #ea580c;
}
.nav-dd-item.active i {
  color: #f97316;
}

/* ═══════════════════════════════════
   USER MENU
   ═══════════════════════════════════ */
.nav-user {
  position: relative;
  justify-self: end;
}

/* Single primary button — user icon + chevron live inside the orange bg */
.user-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 15px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #fb923c, #ea580c);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(234, 88, 12, 0.32);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}
.user-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(234, 88, 12, 0.42);
  filter: brightness(1.04);
}
.user-btn.open {
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.22), 0 4px 12px rgba(234, 88, 12, 0.38);
}
.user-btn:active { transform: translateY(0) scale(0.97); }
.user-btn:focus-visible {
  outline: 2px solid #ea580c;
  outline-offset: 2px;
}

/* Transparent icon wrapper — the button itself is the primary surface */
.user-av {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.user-av > i {
  font-size: 18px;
  color: #fff;
}

/* Chevron — sits next to the icon, both inside the primary button */
.user-caret {
  font-size: 11px !important;
  color: rgba(255, 255, 255, 0.85);
  transition: transform 0.22s ease, color 0.18s;
}
.user-btn:hover .user-caret { color: #fff; }
.user-btn.open .user-caret {
  transform: rotate(180deg);
  color: #fff;
}

/* ── Dropdown ── */
.drop-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  width: min(272px, calc(100vw - 24px));
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.1), 0 1px 3px rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.7);
  overflow: hidden;
  z-index: 1001;
  transform-origin: top left;
}

.drop-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 16px 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.10));
}
.drop-av {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fb923c, #ea580c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 17px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35), 0 0 0 4px rgba(255, 255, 255, 0.65);
}
.drop-av-dot {
  position: absolute;
  bottom: 0;
  inset-inline-start: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #22c55e;
  border: 2.5px solid #fff;
}
.drop-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.drop-name {
  font-size: 14.5px;
  font-weight: 800;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.drop-email {
  font-size: 12px;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drop-role-row {
  padding: 12px 16px;
  border-bottom: 1px solid #f1f5f9;
}
.drop-role {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  font-size: 11px;
  font-weight: 800;
  color: #ea580c;
  background: rgba(249, 115, 22, 0.1);
  padding: 7px 11px;
  border-radius: 8px;
}
.drop-role i { font-size: 11px; }

.drop-list {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.drop-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  width: 100%;
  background: none;
  border: none;
  border-radius: 12px;
  color: #334155;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  text-align: start;
  transition: background 0.16s;
  /* staggered reveal */
  opacity: 0;
  animation: dropItemIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i, 0) * 60ms + 70ms);
}
@keyframes dropItemIn {
  from { opacity: 0; transform: translateY(7px); }
  to { opacity: 1; transform: translateY(0); }
}
.drop-ic {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.16s, color 0.16s;
}
.drop-ic i { font-size: 16px; }
.drop-tx {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}
.drop-tx b { font-size: 13px; font-weight: 700; }
.drop-tx small { font-size: 11px; color: #94a3b8; font-weight: 500; }
.drop-chev {
  font-size: 13px !important;
  color: #cbd5e1;
  transition: transform 0.18s ease, color 0.16s;
}
.drop-item:hover { background: #f8fafc; }
.drop-item:hover .drop-ic {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
}
.drop-item:hover .drop-chev {
  color: #94a3b8;
  transform: translateX(-3px);
}
.drop-item.danger b { color: #dc2626; }
.drop-item.danger:hover { background: rgba(254, 242, 242, 0.85); }
.drop-item.danger:hover .drop-ic {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
.drop-item.danger:hover .drop-chev { color: #f87171; }

/* User menu transition */
.usr-enter-active { transition: opacity 0.22s ease, transform 0.26s cubic-bezier(0.22, 1, 0.36, 1); }
.usr-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.usr-enter-from { opacity: 0; transform: translateY(-8px) scale(0.96); }
.usr-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }

@media (prefers-reduced-motion: reduce) {
  .drop-item { opacity: 1; animation: none; }
  .navbar::after,
  .nav-logo img,
  .nav-logo::after { animation: none; }
  .nav-logo::after { display: none; }
  .usr-enter-active,
  .usr-leave-active,
  .user-caret,
  .user-av,
  .drop-chev,
  .drop-ic { transition: none; }
}

/* ═══════════════════════════════════
   MOBILE MENU
   ═══════════════════════════════════ */
.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  left: 0;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
  padding: 12px;
  max-height: calc(100vh - 66px);
  overflow-y: auto;
  z-index: 1001;
}
.m-group-label {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #94a3b8;
  padding: 12px 12px 6px;
}
.m-group-label:first-child {
  padding-top: 4px;
}
.m-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: 10px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
}
.m-item i {
  font-size: 17px;
  width: 20px;
  text-align: center;
  color: #94a3b8;
}
.m-item:hover {
  background: #f8fafc;
}
.m-item.active {
  background: rgba(249, 115, 22, 0.09);
  color: #ea580c;
}
.m-item.active i {
  color: #f97316;
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 66px 0 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(1px);
  z-index: 1000;
}

/* ═══════════════════════════════════
   TRANSITIONS
   ═══════════════════════════════════ */
.dd-enter-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.dd-leave-active {
  transition: all 0.13s ease;
}
.dd-enter-from,
.dd-leave-to {
  opacity: 0;
}
.nav-dd-panel.dd-enter-from,
.nav-dd-panel.dd-leave-to {
  transform: translateX(50%) translateY(-6px) scale(0.98);
}

.sheet-enter-active,
.sheet-leave-active {
  transition: all 0.22s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 1024px) {
  .nav-inner {
    grid-template-columns: auto 1fr auto;
  }
  .nav-links {
    display: none;
  }
  .nav-burger {
    display: flex;
  }
  .mobile-menu {
    display: block;
  }
  .mobile-overlay {
    display: block;
  }
}

@media (max-width: 640px) {
  .nav-inner {
    height: 58px;
    padding: 0 14px;
    gap: 10px;
  }
  .nav-logo img {
    height: 27px;
  }
  .user-meta,
  .user-caret {
    display: none;
  }
  .user-btn {
    padding: 3px;
    border-color: transparent;
  }
  .user-btn:hover {
    box-shadow: none;
  }
  .mobile-menu {
    top: 58px;
    max-height: calc(100vh - 58px);
  }
  .mobile-overlay {
    inset: 58px 0 0;
  }
}
</style>
