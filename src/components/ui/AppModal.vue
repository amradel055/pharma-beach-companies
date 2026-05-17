<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-backdrop" @click.self="closable && close()">
        <div :class="['modal-panel', sizeClass]">
          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <div class="modal-header-content">
              <div v-if="icon" class="modal-icon" :style="{ '--icon-color': iconColor, '--icon-bg': iconBg }">
                <i :class="icon" />
              </div>
              <div>
                <h3 v-if="title" class="modal-title">{{ title }}</h3>
                <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              </div>
              <slot name="header" />
            </div>
            <button v-if="closable" class="modal-close" @click="close">
              <i class="pi pi-times" />
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  iconColor: { type: String, default: '#f97316' },
  iconBg: { type: String, default: 'rgba(249, 115, 22, 0.08)' },
  size: { type: String, default: 'md' }, // sm, md, lg, xl
  closable: { type: Boolean, default: true },
})

const emit = defineEmits(['update:modelValue', 'close'])

const sizeClass = computed(() => `modal-${props.size}`)

function close() {
  emit('update:modelValue', false)
  emit('close')
}

// Lock body scroll when modal is open
watch(() => props.modelValue, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})
</script>

<style scoped>
/* ═══════════════════════════════════
   BACKDROP
   ═══════════════════════════════════ */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
  overflow-y: auto;
  perspective: 1400px;
}

/* ═══════════════════════════════════
   PANEL
   ═══════════════════════════════════ */
.modal-panel {
  background: #fff;
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.04);
  width: 100%;
  /* Center when it fits; let the fixed backdrop scroll it when taller.
     `margin:auto` in a flex container centers without clipping the top
     on overflow (unlike align-items:center), so tall modals stay usable
     even though the panel no longer clips/scrolls internally. */
  margin: auto;
  max-height: none;
  display: flex;
  flex-direction: column;
  /* visible so AppDropdown menus aren't clipped inside the modal */
  overflow: visible;
}

/* Sizes */
.modal-sm { max-width: 400px; }
.modal-md { max-width: 560px; }
.modal-lg { max-width: 720px; }
.modal-xl { max-width: 900px; }

/* ═══════════════════════════════════
   HEADER
   ═══════════════════════════════════ */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 0;
  gap: 12px;
}

.modal-header-content {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.modal-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--icon-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-icon i {
  font-size: 20px;
  color: var(--icon-color);
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 4px 0 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.modal-close:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* ═══════════════════════════════════
   BODY
   ═══════════════════════════════════ */
.modal-body {
  padding: 20px 24px;
  overflow: visible;
  flex: 1;
}

/* ═══════════════════════════════════
   FOOTER
   ═══════════════════════════════════ */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
}

/* ═══════════════════════════════════
   TRANSITION
   ═══════════════════════════════════ */
.modal-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from {
  opacity: 0;
}

.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-panel {
  transform: translateY(22px) scale(0.95) rotateX(8deg);
  transform-origin: top center;
  opacity: 0;
}

.modal-leave-to .modal-panel {
  transform: translateY(8px) scale(0.98) rotateX(4deg);
  transform-origin: top center;
  opacity: 0;
}

.modal-enter-active .modal-panel {
  transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease;
}

.modal-leave-active .modal-panel {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-from .modal-panel,
  .modal-leave-to .modal-panel { transform: none; }
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 640px) {
  .modal-backdrop {
    padding: 12px 8px;
    align-items: flex-start;
    padding-top: 40px;
  }

  .modal-panel {
    border-radius: 14px;
    max-height: none;
  }

  .modal-sm, .modal-md, .modal-lg, .modal-xl {
    max-width: 100%;
  }

  .modal-header {
    padding: 18px 16px 0;
  }

  .modal-header-content {
    gap: 10px;
  }

  .modal-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
  }

  .modal-icon i {
    font-size: 18px;
  }

  .modal-title {
    font-size: 15px;
  }

  .modal-subtitle {
    font-size: 12px;
  }

  .modal-body {
    padding: 14px 16px;
  }

  .modal-footer {
    padding: 12px 16px;
    flex-wrap: wrap;
  }
}
</style>
