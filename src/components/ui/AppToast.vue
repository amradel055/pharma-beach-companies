<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-item', `toast-${toast.type}`]"
        role="alert"
      >
        <span class="toast-bar" />
        <span class="toast-icon"><i :class="iconClass(toast.type)" /></span>
        <p class="toast-msg">{{ toast.message }}</p>
        <button
          type="button"
          class="toast-close"
          aria-label="إغلاق"
          @click="toastStore.remove(toast.id)"
        >
          <i class="pi pi-times" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

function iconClass(type) {
  return {
    success: 'pi pi-check-circle',
    error: 'pi pi-times-circle',
    warning: 'pi pi-exclamation-triangle',
    info: 'pi pi-info-circle',
  }[type] || 'pi pi-info-circle'
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  pointer-events: none;
  width: max-content;
  min-width: min(380px, calc(100vw - 2rem));
  max-width: min(580px, calc(100vw - 2rem));
}

.toast-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 14px 13px 16px;
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 12px;
  box-shadow: 0 10px 30px -8px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.05);
  font-family: 'Cairo', sans-serif;
  pointer-events: auto;
  overflow: hidden;
}

/* Colored accent bar on the inline-start edge (right in RTL) */
.toast-bar {
  position: absolute;
  inset-block: 8px;
  inset-inline-start: 6px;
  width: 4px;
  border-radius: 999px;
  background: var(--toast-accent);
}

.toast-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  margin-inline-start: 6px;
  background: var(--toast-tint);
  color: var(--toast-accent);
}
.toast-icon i { font-size: 14px; }

.toast-msg {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.5;
  color: #0f172a;
  word-break: break-word;
}

.toast-close {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #94a3b8;
  border-radius: 7px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;
}
.toast-close i { font-size: 12px; }
.toast-close:hover { background: #f1f5f9; color: #475569; }

/* Per-type accent + tint (CSS vars consumed above) */
.toast-success { --toast-accent: #16a34a; --toast-tint: rgba(22, 163, 74, 0.10); }
.toast-error   { --toast-accent: #dc2626; --toast-tint: rgba(220, 38, 38, 0.10); }
.toast-warning { --toast-accent: #d97706; --toast-tint: rgba(217, 119, 6, 0.12); }
.toast-info    { --toast-accent: #0284c7; --toast-tint: rgba(2, 132, 199, 0.10); }

/* Transitions */
.toast-enter-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateY(-16px) scale(0.96); }
.toast-leave-to { opacity: 0; transform: translateY(-10px) scale(0.96); }
.toast-move { transition: transform 0.3s ease; }

@media (max-width: 640px) {
  .toast-container {
    left: 1rem;
    right: 1rem;
    transform: none;
    width: auto;
    max-width: none;
  }
}
</style>
