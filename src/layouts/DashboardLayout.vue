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
  perspective: 1400px;
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
  transition: opacity 0.32s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}
.page-leave-active {
  transition: opacity 0.18s ease, transform 0.22s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(16px) rotateX(5deg);
  transform-origin: top center;
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.992);
}
@media (prefers-reduced-motion: reduce) {
  .page-enter-from,
  .page-leave-to { transform: none; }
  .page-enter-active,
  .page-leave-active { transition: opacity 0.2s ease; }
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
