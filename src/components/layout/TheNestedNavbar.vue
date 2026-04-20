<template>
  <header class="nested-navbar">
    <div class="navbar-inner">
      <RouterLink to="/" class="navbar-logo">
        <img :src="logo" alt="Pharma Beach" />
      </RouterLink>

      <span class="navbar-title">{{ pageTitle }}</span>

      <!-- Auth state -->
      <div class="navbar-actions">
        <template v-if="auth.isAuthenticated">
          <div class="nav-user-menu" ref="navMenuRef">
            <button class="nav-avatar-btn" @click="navMenuOpen = !navMenuOpen">
              <span class="nav-avatar-ring">
                <span class="nav-avatar">{{ userInitial }}</span>
              </span>
              <span class="nav-user-name">{{ auth.user.name }}</span>
              <i :class="['nav-chevron', navMenuOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down']" />
            </button>
            <Transition name="dropdown">
              <div v-if="navMenuOpen" class="nav-dropdown">
                <div class="nav-dropdown-header">
                  <span class="nav-dropdown-avatar">{{ userInitial }}</span>
                  <div class="nav-dropdown-info">
                    <strong>{{ auth.user.name }}</strong>
                    <span class="nav-dropdown-email">{{ auth.user.email }}</span>
                  </div>
                </div>
                <div class="nav-dropdown-body">
                  <button class="nav-dropdown-item logout" @click="handleLogout">
                    <i class="pi pi-sign-out" />
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </template>

        <button class="back-btn" @click="goBack" aria-label="رجوع">
          العودة
          <i class="pi pi-arrow-left" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import logo from '@/assets/images/logo.png'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const navMenuOpen = ref(false)
const navMenuRef = ref(null)

const pageTitle = computed(() => route.meta?.title || '')

const userInitial = computed(() => {
  if (!auth.user?.name) return '?'
  return auth.user.name.charAt(0).toUpperCase()
})

function goBack() {
  if (window.history.length > 2) {
    router.back()
  } else {
    router.push('/')
  }
}

function handleLogout() {
  auth.logout()
  navMenuOpen.value = false
  toast.success('تم تسجيل الخروج')
  router.push('/')
}

function onClickOutside(e) {
  if (navMenuRef.value && !navMenuRef.value.contains(e.target)) {
    navMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.nested-navbar {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  max-width: 1280px;
  width: 100%;
  padding: 0 2rem;
}

.navbar-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 1.25rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 50px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.back-btn {
  padding: 0.45rem 1rem;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  font-family: inherit;
  color: #fff;
  transition: all 0.25s ease;
  flex-shrink: 0;
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.35);
  white-space: nowrap;
}

.back-btn:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-darker));
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.5);
  transform: scale(1.05);
}

.navbar-title {
  flex: 1;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0f172a;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #0f172a, #334155);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.navbar-logo img {
  height: 34px;
  width: auto;
}

/* ── Nav user menu ── */
.nav-user-menu {
  position: relative;
}

.nav-avatar-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.7rem 0.2rem 0.2rem;
  border-radius: 50px;
  border: 1.5px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  animation: userFloat 3s ease-in-out infinite;
}

@keyframes userFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.nav-avatar-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(var(--primary-rgb), 0.2);
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.1);
}

.nav-avatar-ring {
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

.nav-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  border: 2px solid #fff;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(var(--primary-rgb), 0.3); }
  50% { box-shadow: 0 0 0 5px rgba(var(--primary-rgb), 0); }
}

.nav-user-name {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-chevron {
  font-size: 0.55rem;
  color: #94a3b8;
  margin-left: 0.25rem;
  animation: bounceDown 2s ease-in-out infinite;
}

@keyframes bounceDown {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(2px); }
}

.nav-dropdown {
  position: absolute;
  top: calc(100% + 0.75rem);
  left: 50%;
  transform: translateX(-50%);
  min-width: 240px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  z-index: 50;
}

.nav-dropdown-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.06), rgba(var(--primary-rgb), 0.02));
  border-bottom: 1px solid #f1f5f9;
}

.nav-dropdown-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

.nav-dropdown-info strong {
  display: block;
  font-size: 0.84rem;
  font-weight: 700;
  color: #0f172a;
}

.nav-dropdown-email {
  display: block;
  font-size: 0.7rem;
  color: #94a3b8;
  direction: ltr;
  text-align: right;
  margin-top: 1px;
}

.nav-dropdown-body {
  padding: 0.35rem;
}

.nav-dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0.2rem 0.5rem;
}

.nav-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: none;
  background: transparent;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  font-family: inherit;
  text-decoration: none;
  transition: all 0.2s ease;
}

.nav-dropdown-item:hover {
  background: #f8fafc;
  color: var(--primary);
}

.nav-dropdown-item i {
  font-size: 0.85rem;
  width: 18px;
  text-align: center;
}

.nav-dropdown-item.logout {
  color: #ef4444;
}

.nav-dropdown-item.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

/* Transitions */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-10px) scale(0.97);
}

@media (max-width: 640px) {
  .nested-navbar {
    top: 0.75rem;
    padding: 0 1rem;
  }

  .navbar-inner {
    padding: 0.45rem 1rem;
    gap: 0.6rem;
  }

  .back-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }

  .navbar-title {
    font-size: 0.82rem;
  }

  .navbar-logo img {
    height: 28px;
  }

  .nav-avatar {
    width: 24px;
    height: 24px;
    font-size: 0.68rem;
  }

  .nav-user-name {
    display: none;
  }

  .nav-chevron {
    display: none;
  }
}
</style>
