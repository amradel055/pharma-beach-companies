<template>
  <header :class="['header', { scrolled: isScrolled }]">
    <div class="header-inner">
      <RouterLink to="/" class="header-logo">
        <img :src="logo" alt="Pharma Beach" />
      </RouterLink>

      <nav class="header-actions">
        <template v-if="auth.isAuthenticated">
          <div class="user-menu" ref="userMenuRef">
            <button class="avatar-btn" @click="menuOpen = !menuOpen">
              <span class="avatar-ring">
                <span class="avatar-circle">{{ userInitial }}</span>
              </span>
              <span class="avatar-name">{{ auth.user.name }}</span>
              <i :class="['chevron-icon', menuOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down']" />
            </button>
            <Transition name="dropdown">
              <div v-if="menuOpen" class="user-dropdown">
                <div class="dropdown-header">
                  <span class="dropdown-avatar">{{ userInitial }}</span>
                  <div class="dropdown-user-info">
                    <strong>{{ auth.user.name }}</strong>
                    <span class="dropdown-email">{{ auth.user.email }}</span>
                  </div>
                </div>
                <div class="dropdown-body">
                  <RouterLink v-if="isAdminUser" to="/admin" class="dropdown-item" @click="menuOpen = false">
                    <i class="pi pi-th-large" />
                    لوحة التحكم
                  </RouterLink>
                  <button class="dropdown-item logout" @click="handleLogout">
                    <i class="pi pi-sign-out" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-login">تسجيل الدخول</RouterLink>
          <RouterLink to="/register" class="btn-register">إنشاء حساب</RouterLink>
        </template>
      </nav>

      <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" aria-label="القائمة">
        <i :class="mobileOpen ? 'pi pi-times' : 'pi pi-bars'" />
      </button>
    </div>

    <Transition name="slide-down">
      <div v-if="mobileOpen" class="mobile-menu">
        <template v-if="auth.isAuthenticated">
          <div class="mobile-user-card">
            <span class="avatar-ring">
              <span class="avatar-circle">{{ userInitial }}</span>
            </span>
            <div class="mobile-user-info">
              <span class="mobile-user-name">{{ auth.user.name }}</span>
              <span class="mobile-user-email">{{ auth.user.email }}</span>
            </div>
          </div>
          <RouterLink v-if="isAdminUser" to="/admin" class="mobile-logout" style="color: #f97316; border-top: none; text-decoration: none; display: flex;" @click="mobileOpen = false">
            <i class="pi pi-th-large" />
            لوحة التحكم
          </RouterLink>
          <button class="mobile-logout" @click="handleLogout">
            <i class="pi pi-sign-out" />
            تسجيل الخروج
          </button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn-login" @click="mobileOpen = false">تسجيل الدخول</RouterLink>
          <RouterLink to="/register" class="btn-register" @click="mobileOpen = false">إنشاء حساب</RouterLink>
        </template>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { ADMIN_ROLES } from '@/constants/roles'
import logo from '@/assets/images/logo.jpeg'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const isAdminUser = computed(() => ADMIN_ROLES.includes(auth.user?.role))

const isScrolled = ref(false)
const mobileOpen = ref(false)
const menuOpen = ref(false)
const userMenuRef = ref(null)

const userInitial = computed(() => {
  if (!auth.user?.name) return '?'
  return auth.user.name.charAt(0).toUpperCase()
})

function handleLogout() {
  auth.logout()
  menuOpen.value = false
  mobileOpen.value = false
  toast.success('تم تسجيل الخروج')
  router.push('/')
}

function onScroll() {
  isScrolled.value = window.scrollY > 50
}

function onClickOutside(e) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target)) {
    menuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.scrolled {
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  box-shadow: 0 1px 20px rgba(0, 0, 0, 0.08);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-logo img {
  height: 52px;
  width: auto;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transition: height 0.3s ease;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); }
  50% { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
}

.header.scrolled .header-logo img {
  height: 44px;
  border-radius: 0;
  box-shadow: none;
  animation: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-login {
  padding: 0.55rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.25s ease;
  color: #1a1a2e;
  background: rgba(255, 255, 255, 0.65);
  border: 1.5px solid rgba(0, 0, 0, 0.08);
}

.btn-login:hover {
  background: rgba(255, 255, 255, 0.9);
  color: var(--primary);
  border-color: rgba(var(--primary-rgb), 0.2);
}

.header.scrolled .btn-login {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.08);
}

.header.scrolled .btn-login:hover {
  background: rgba(var(--primary-rgb), 0.06);
  color: var(--primary);
  border-color: rgba(var(--primary-rgb), 0.2);
}

.btn-register {
  padding: 0.55rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.25s ease;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  border: none;
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.3);
}

.btn-register:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-darker));
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.4);
  transform: translateY(-1px);
}

/* ── User menu ── */
.user-menu {
  position: relative;
}

.avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.85rem 0.25rem 0.25rem;
  border-radius: 50px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  animation: btnFloat 3s ease-in-out infinite;
}

@keyframes btnFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.avatar-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(var(--primary-rgb), 0.2);
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.1);
}

.header.scrolled .avatar-btn {
  background: rgba(0, 0, 0, 0.03);
}

.header.scrolled .avatar-btn:hover {
  background: rgba(var(--primary-rgb), 0.05);
}

.avatar-ring {
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark), #f59e0b);
  background-size: 200% 200%;
  animation: ringShift 4s ease infinite;
  flex-shrink: 0;
}

@keyframes ringShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  border: 2px solid #fff;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.3); }
  50% { box-shadow: 0 0 0 6px rgba(var(--primary-rgb), 0); }
}

.avatar-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  white-space: nowrap;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  font-size: 0.6rem;
  color: #94a3b8;
  transition: transform 0.3s ease;
  margin-left: 0.4rem;
  animation: bounceDown 2s ease-in-out infinite;
}

@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 0;
  min-width: 260px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  z-index: 50;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.06), rgba(var(--primary-rgb), 0.02));
  border-bottom: 1px solid #f1f5f9;
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

.dropdown-user-info strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.dropdown-email {
  display: block;
  font-size: 0.72rem;
  color: #94a3b8;
  direction: ltr;
  text-align: right;
  margin-top: 1px;
}

.dropdown-body {
  padding: 0.4rem;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.25rem 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f8fafc;
  color: var(--primary);
}

.dropdown-item i {
  font-size: 0.88rem;
  width: 20px;
  text-align: center;
}

.dropdown-item.logout {
  color: #ef4444;
}

.dropdown-item.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* ── Transitions ── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.97);
}

/* Mobile */
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.4rem;
  color: #1a1a2e;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.mobile-toggle:hover {
  background: rgba(0, 0, 0, 0.05);
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 2rem 1.25rem;
  max-width: 1280px;
  margin: 0 auto;
}

.mobile-user-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.06), rgba(var(--primary-rgb), 0.02));
  border-radius: 12px;
  border: 1px solid rgba(var(--primary-rgb), 0.08);
}

.mobile-user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mobile-user-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.mobile-user-email {
  font-size: 0.72rem;
  color: #94a3b8;
  direction: ltr;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-logout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1.5px solid #fecaca;
  background: #fef2f2;
  color: #ef4444;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.mobile-logout:hover {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fca5a5;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .header-actions {
    display: none;
  }

  .mobile-toggle {
    display: block;
  }

  .mobile-menu {
    display: flex;
  }

  .mobile-menu .btn-login,
  .mobile-menu .btn-register {
    text-align: center;
    width: 100%;
    display: block;
  }
}
</style>
