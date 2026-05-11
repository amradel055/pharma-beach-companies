<template>
  <header :class="['topbar', { 'sidebar-collapsed': sidebarCollapsed }]">
      <!-- Right Side (RTL start) -->
      <div class="topbar-start">
        <button class="mobile-menu-btn" @click="$emit('toggleMobile')">
          <i class="pi pi-bars" />
        </button>

        <nav class="breadcrumb">
          <RouterLink to="/admin" class="breadcrumb-link">
            <i class="pi pi-objects-column" />
            <span>لوحة التحكم</span>
          </RouterLink>
          <template v-if="pageTitle !== 'لوحة التحكم'">
            <i class="pi pi-angle-left breadcrumb-sep" />
            <span class="breadcrumb-current">{{ pageTitle }}</span>
          </template>
        </nav>
      </div>

      <!-- Left Side (RTL end) -->
      <div class="topbar-end">
        <!-- Notifications -->
        <div class="tb-notif-wrap" ref="notifRef">
          <button class="tb-icon-btn" @click="notifOpen = !notifOpen" title="الإشعارات">
            <i class="pi pi-bell" />
            <span v-if="notifUnread > 0" class="tb-dot">{{ notifUnread }}</span>
          </button>
          <Transition name="dropdown">
            <div v-if="notifOpen" class="notif-dropdown">
              <div class="notif-header">
                <strong>الإشعارات</strong>
                <button v-if="notifUnread > 0" class="notif-read-all" @click="markAllRead">تحديد الكل كمقروء</button>
              </div>
              <div class="notif-list" v-if="userNotifs.length > 0">
                <div v-for="n in userNotifs.slice(0, 10)" :key="n.id"
                     :class="['notif-item', { unread: !n.read }]"
                     @click="notifStore.markAsRead(n.id)">
                  <div class="notif-icon"><i class="pi pi-calendar" /></div>
                  <div class="notif-body">
                    <strong>{{ n.title }}</strong>
                    <p>{{ n.body }}</p>
                    <span class="notif-time">{{ formatTime(n.createdAt) }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="notif-empty">لا توجد إشعارات</div>
            </div>
          </Transition>
        </div>

        <div class="tb-separator" />

        <!-- User -->
        <div class="user-area" ref="userMenuRef">
          <button class="user-btn" @click="menuOpen = !menuOpen">
            <div class="user-av">{{ userInitial }}</div>
            <span class="user-label">{{ auth.user?.name }}</span>
            <i :class="['pi', menuOpen ? 'pi-chevron-up' : 'pi-chevron-down']" style="font-size: 10px; color: #94a3b8;" />
          </button>

          <Transition name="drop">
            <div v-if="menuOpen" class="drop-menu">
              <div class="drop-head">
                <div class="drop-av">{{ userInitial }}</div>
                <div class="drop-info">
                  <span class="drop-name">{{ auth.user?.name }}</span>
                  <span class="drop-email">{{ auth.user?.email }}</span>
                  <span class="drop-role">{{ roleLabel }}</span>
                </div>
              </div>
              <div class="drop-sep" />
              <div class="drop-section">
                <RouterLink to="/admin/profile" class="drop-item" @click="menuOpen = false">
                  <i class="pi pi-user" />
                  الملف الشخصي
                </RouterLink>
              </div>
              <div class="drop-sep" />
              <div class="drop-section">
                <button class="drop-item drop-danger" @click="handleLogout">
                  <i class="pi pi-sign-out" />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import { ROLE_LABELS } from '@/constants/roles'

defineProps({
  sidebarCollapsed: Boolean,
})
defineEmits(['toggleMobile'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notifStore = useNotificationsStore()

const menuOpen = ref(false)
const userMenuRef = ref(null)
const notifOpen = ref(false)
const notifRef = ref(null)

const userNotifs = computed(() => notifStore.getForUser(auth.user?.id))
const notifUnread = computed(() => notifStore.unreadCount(auth.user?.id))

function markAllRead() {
  notifStore.markAllRead(auth.user?.id)
}

function formatTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / 60000)
  if (diff < 1) return 'الآن'
  if (diff < 60) return `منذ ${diff} دقيقة`
  if (diff < 1440) return `منذ ${Math.floor(diff / 60)} ساعة`
  return d.toLocaleDateString('ar-EG')
}

// Close notification dropdown on outside click
function onClickOutside(e) {
  if (notifRef.value && !notifRef.value.contains(e.target)) notifOpen.value = false
}

const pageTitle = computed(() => route.meta?.title || 'لوحة التحكم')
const userInitial = computed(() => auth.user?.name?.charAt(0) || '?')
const roleLabel = computed(() => ROLE_LABELS[auth.user?.role] || 'مستخدم')

async function handleLogout() {
  menuOpen.value = false
  await auth.logout()
  router.push({ name: 'login' })
}

function handleClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
/* ═══════════════════════════════════
   TOPBAR — floating glassmorphic bar
   ═══════════════════════════════════ */
.topbar {
  width: 100%;
  height: 52px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.55);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.03),
    0 4px 16px rgba(0, 0, 0, 0.02);
}

/* ═══════════════════════════════════
   START
   ═══════════════════════════════════ */
.topbar-start {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-menu-btn {
  display: none;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(241, 245, 249, 0.8);
  border: none;
  color: #475569;
  font-size: 16px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.mobile-menu-btn:hover {
  background: #e2e8f0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.15s;
}

.breadcrumb-link:hover {
  color: #475569;
}

.breadcrumb-link i {
  font-size: 14px;
}

.breadcrumb-sep {
  font-size: 11px;
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 600;
}

/* ═══════════════════════════════════
   END
   ═══════════════════════════════════ */
.topbar-end {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tb-icon-btn {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: none;
  border: 1px solid rgba(226, 232, 240, 0.6);
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.tb-icon-btn:hover {
  background: rgba(241, 245, 249, 0.8);
  color: #1e293b;
}

.tb-dot {
  position: absolute;
  top: 8px;
  left: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #fff;
}

.tb-separator {
  width: 1px;
  height: 24px;
  background: rgba(226, 232, 240, 0.6);
  margin: 0 4px;
}

/* ═══════════════════════════════════
   USER BUTTON
   ═══════════════════════════════════ */
.user-area {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 6px;
  border-radius: 10px;
  border: 1px solid rgba(226, 232, 240, 0.6);
  background: none;
  cursor: pointer;
  transition: all 0.15s;
}

.user-btn:hover {
  background: rgba(241, 245, 249, 0.8);
}

.user-av {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  flex-shrink: 0;
}

.user-label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
}

/* ═══════════════════════════════════
   DROPDOWN
   ═══════════════════════════════════ */
.drop-menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  min-width: 250px;
  background: #fff;
  border-radius: 14px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 2px 6px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(226, 232, 240, 0.6);
  overflow: hidden;
  z-index: 1001;
}

.drop-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.drop-av {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  flex-shrink: 0;
}

.drop-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.drop-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.drop-email {
  font-size: 12px;
  color: #64748b;
}

.drop-role {
  font-size: 10.5px;
  font-weight: 600;
  color: #f97316;
  background: rgba(249, 115, 22, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  width: fit-content;
  margin-top: 3px;
}

.drop-sep {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 14px;
}

.drop-section {
  padding: 4px 6px;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  width: 100%;
  background: none;
  border: none;
  border-radius: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
}

.drop-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.drop-danger {
  color: #ef4444;
}

.drop-danger:hover {
  background: rgba(254, 242, 242, 0.8);
}

.drop-item i {
  font-size: 15px;
  width: 18px;
  text-align: center;
}

/* ═══════════════════════════════════
   DROPDOWN TRANSITION
   ═══════════════════════════════════ */
.drop-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.drop-leave-active {
  transition: all 0.15s ease;
}

.drop-enter-from {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 768px) {
  .topbar {
    height: 46px;
    padding: 0 12px;
    border-radius: 10px;
  }

  .mobile-menu-btn {
    display: flex;
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .breadcrumb {
    font-size: 12.5px;
  }

  .breadcrumb-link span {
    display: none;
  }

  .breadcrumb-sep {
    display: none;
  }

  .breadcrumb-current {
    font-size: 13px;
  }

  .user-label {
    display: none;
  }

  .user-btn i {
    display: none;
  }

  .user-btn {
    padding: 3px;
    border-color: transparent;
  }

  .user-av {
    width: 28px;
    height: 28px;
    font-size: 11px;
  }

  .tb-separator {
    display: none;
  }

  .tb-icon-btn {
    width: 34px;
    height: 34px;
    font-size: 15px;
    border-radius: 8px;
  }

  .drop-menu {
    left: auto;
    right: 0;
    min-width: 230px;
  }
}

@media (max-width: 380px) {
  .breadcrumb-current {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* ═══════════════════════════════════
   NOTIFICATIONS
   ═══════════════════════════════════ */
.tb-notif-wrap {
  position: relative;
}

.tb-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  background: #ef4444;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.notif-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 340px;
  max-height: 400px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  z-index: 100;
}

.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.notif-header strong {
  font-size: 0.92rem;
  color: #0f172a;
}

.notif-read-all {
  background: none;
  border: none;
  color: var(--primary, #f97316);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.notif-list {
  overflow-y: auto;
  max-height: 320px;
}

.notif-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s ease;
  border-bottom: 1px solid #f8fafc;
}

.notif-item:hover { background: #f8fafc; }

.notif-item.unread {
  background: rgba(249, 115, 22, 0.04);
  border-right: 3px solid var(--primary, #f97316);
}

.notif-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-icon i { font-size: 0.85rem; color: var(--primary, #f97316); }

.notif-body { flex: 1; min-width: 0; }
.notif-body strong { display: block; font-size: 0.8rem; color: #0f172a; margin-bottom: 0.15rem; }
.notif-body p { font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4; }
.notif-time { font-size: 0.65rem; color: #94a3b8; margin-top: 0.25rem; display: block; }

.notif-empty {
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.85rem;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
