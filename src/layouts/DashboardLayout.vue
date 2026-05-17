<template>
  <div class="dashboard-layout">
    <div class="dashboard-scroll">
      <TheNavbar />
      <main class="dashboard-page">
        <div class="dashboard-container">
          <RouterView v-slot="{ Component }">
            <Transition name="page" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import TheNavbar from '@/components/admin/TheNavbar.vue'
</script>

<style scoped>
.dashboard-layout {
  position: fixed;
  inset: 0;
  background: #f1f5f9;
  overflow: hidden;
}

/* Single scroll surface — the navbar sticks to the top of it. */
.dashboard-scroll {
  height: 100vh;
  overflow-y: auto;
  scrollbar-width: none;
}
.dashboard-scroll::-webkit-scrollbar {
  width: 0;
}
.dashboard-scroll:hover {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.2) transparent;
}
.dashboard-scroll:hover::-webkit-scrollbar {
  width: 5px;
}
.dashboard-scroll:hover::-webkit-scrollbar-track {
  background: transparent;
}
.dashboard-scroll:hover::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.25);
  border-radius: 10px;
}
.dashboard-scroll:hover::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.45);
}

.dashboard-page {
  padding: 22px 0 32px;
}

.dashboard-container {
  max-width: 1480px;
  margin: 0 auto;
  padding: 0 26px;
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

@media (max-width: 640px) {
  .dashboard-page {
    padding: 16px 0 24px;
  }
  .dashboard-container {
    padding: 0 14px;
  }
}
</style>
