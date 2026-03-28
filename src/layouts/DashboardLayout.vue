<template>
  <div class="dashboard-layout">
    <TheSidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileOpen"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileOpen = false"
    />

    <!-- Mobile Overlay -->
    <Transition name="overlay">
      <div v-if="mobileOpen" class="sidebar-overlay" @click="mobileOpen = false" />
    </Transition>

    <main :class="['dashboard-main', { 'sidebar-collapsed': sidebarCollapsed }]">
      <div class="dashboard-container">
        <div class="topbar-sticky">
          <TheTopbar
            :sidebar-collapsed="sidebarCollapsed"
            @toggle-mobile="mobileOpen = !mobileOpen"
          />
        </div>
        <div class="dashboard-page">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TheSidebar from '@/components/admin/TheSidebar.vue'
import TheTopbar from '@/components/admin/TheTopbar.vue'

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  background: #f1f5f9;
  position: fixed;
  inset: 0;
  overflow: hidden;
}

/* ═══════════════════════════════════
   MAIN CONTENT
   ═══════════════════════════════════ */
.dashboard-main {
  margin-right: 260px;
  height: 100vh;
  overflow-y: auto;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  scrollbar-width: none;
}

.dashboard-main::-webkit-scrollbar {
  width: 0;
}

.dashboard-main:hover {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.2) transparent;
}

.dashboard-main:hover::-webkit-scrollbar {
  width: 4px;
}

.dashboard-main:hover::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-main:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}

.dashboard-main:hover::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.4);
}

.dashboard-main.sidebar-collapsed {
  margin-right: 72px;
}

.dashboard-container {
  padding: 0 24px 24px;
}

.topbar-sticky {
  position: sticky;
  top: 0;
  z-index: 999;
  padding: 14px 0;
  background: linear-gradient(to bottom, #f1f5f9 70%, transparent);
}

.dashboard-page {
  /* content below topbar */
}

/* ═══════════════════════════════════
   OVERLAY
   ═══════════════════════════════════ */
.sidebar-overlay {
  display: none;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════
   PAGE TRANSITION
   ═══════════════════════════════════ */
.page-enter-active {
  transition: all 0.25s ease;
}

.page-leave-active {
  transition: all 0.15s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 768px) {
  .dashboard-main {
    margin-right: 0;
  }

  .dashboard-main.sidebar-collapsed {
    margin-right: 0;
  }

  .dashboard-container {
    padding: 16px;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    z-index: 999;
  }
}
</style>
