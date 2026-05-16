<template>
  <div class="app-multiselect" ref="rootRef">
    <button
      type="button"
      :class="['ms-trigger', { error, disabled, open }]"
      @click="!disabled && (open = !open)"
    >
      <span :class="{ 'ms-placeholder': !selectedCount }">
        {{ summary }}
      </span>
      <span class="ms-trailing">
        <span v-if="selectedCount" class="ms-count">{{ selectedCount }}</span>
        <i :class="['pi', open ? 'pi-chevron-up' : 'pi-chevron-down']" />
      </span>
    </button>

    <Transition name="ms">
      <div v-if="open" class="ms-list">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :class="['ms-option', { selected: isSelected(opt.value) }]"
          @click="toggle(opt.value)"
        >
          <span class="ms-box"><i v-if="isSelected(opt.value)" class="pi pi-check" /></span>
          <span class="ms-label">{{ opt.label }}</span>
        </button>
        <div v-if="options.length === 0" class="ms-empty">{{ emptyText }}</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Array of selected option values.
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'اختر...' },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  emptyText: { type: String, default: 'لا توجد خيارات' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const rootRef = ref(null)

const selectedCount = computed(() => props.modelValue.length)

const summary = computed(() => {
  if (!props.modelValue.length) return props.placeholder
  const labels = props.options
    .filter((o) => props.modelValue.includes(o.value))
    .map((o) => o.label)
  return labels.join('، ') || `${props.modelValue.length} محدد`
})

function isSelected(value) {
  return props.modelValue.includes(value)
}

function toggle(value) {
  const next = props.modelValue.includes(value)
    ? props.modelValue.filter((v) => v !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', next)
  emit('change', next)
}

function handleClickOutside(e) {
  if (rootRef.value && !rootRef.value.contains(e.target)) open.value = false
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.app-multiselect {
  position: relative;
}

.ms-trigger {
  width: 100%;
  min-height: 42px;
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  color: #1e293b;
  background: #fafbfc;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  transition: all 0.15s;
}
.ms-trigger:hover:not(.disabled) { border-color: #cbd5e1; background: #fff; }
.ms-trigger.open { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
.ms-trigger.error { border-color: #ef4444; background: #fef2f2; }
.ms-trigger.disabled { opacity: 0.6; cursor: not-allowed; }

.ms-trigger > span:first-child {
  text-align: start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}
.ms-placeholder { color: #94a3b8; }

.ms-trailing { display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0; }
.ms-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.14);
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.ms-trailing > i { font-size: 10px; color: #94a3b8; transition: transform 0.2s; }

/* List */
.ms-list {
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-start: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
  z-index: 100;
  padding: 4px;
  max-height: 260px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.15) transparent;
}
.ms-list::-webkit-scrollbar { width: 2px; }
.ms-list::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 10px; }

.ms-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border: none;
  background: none;
  font-size: 13px;
  font-family: inherit;
  color: #475569;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.12s;
  text-align: start;
}
.ms-option:hover { background: #f8fafc; color: #1e293b; }
.ms-option.selected { color: #0f172a; font-weight: 600; }

.ms-box {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 1.5px solid #cbd5e1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.12s;
}
.ms-option.selected .ms-box {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: #ea580c;
}
.ms-box i { font-size: 10px; color: #fff; }
.ms-label { flex: 1; min-width: 0; }

.ms-empty {
  padding: 14px;
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
}

.ms-enter-active { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
.ms-leave-active { transition: all 0.15s ease; }
.ms-enter-from { opacity: 0; transform: translateY(-6px); }
.ms-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
