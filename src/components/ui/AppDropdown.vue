<template>
  <div class="app-dropdown" ref="dropRef">
    <button
      type="button"
      :class="['dd-trigger', { error, disabled }]"
      @click="!disabled && (open = !open)"
    >
      <span :class="{ 'dd-placeholder': !hasValue }">
        <slot name="selected" :selected="selectedOption">
          {{ displayLabel }}
        </slot>
      </span>
      <i :class="['pi', open ? 'pi-chevron-up' : 'pi-chevron-down']" />
    </button>

    <Transition name="dd">
      <div v-if="open" class="dd-list" :style="{ minWidth: listMinWidth }">
        <div v-if="$slots.header" class="dd-list-header">
          <slot name="header" />
        </div>
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :class="['dd-option', { selected: modelValue === opt.value }]"
          @click="select(opt)"
        >
          <slot name="option" :option="opt">
            <span v-if="opt.dot" class="dd-dot" :style="{ background: opt.dot }" />
            <span v-if="opt.icon" class="dd-opt-icon"><i :class="opt.icon" /></span>
            {{ opt.label }}
          </slot>
        </button>
        <div v-if="options.length === 0" class="dd-empty">
          {{ emptyText }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: '' },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'اختر...' },
  error: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  emptyText: { type: String, default: 'لا توجد خيارات' },
  listMinWidth: { type: String, default: '100%' },
})

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const dropRef = ref(null)

const selectedOption = computed(() => {
  return props.options.find((o) => o.value === props.modelValue) || null
})

const hasValue = computed(() => props.modelValue !== '' && props.modelValue !== null && props.modelValue !== undefined)

const displayLabel = computed(() => {
  if (selectedOption.value) return selectedOption.value.label
  return props.placeholder
})

function select(opt) {
  emit('update:modelValue', opt.value)
  emit('change', opt.value)
  open.value = false
}

function handleClickOutside(e) {
  if (dropRef.value && !dropRef.value.contains(e.target)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.app-dropdown {
  position: relative;
}

.dd-trigger {
  width: 100%;
  height: 42px;
  padding: 0 14px;
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

.dd-trigger:hover:not(.disabled) {
  border-color: #cbd5e1;
  background: #fff;
}

.dd-trigger.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.dd-trigger.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dd-placeholder {
  color: #94a3b8;
}

.dd-trigger i {
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
  transition: transform 0.2s;
}

/* List */
.dd-list {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 100%;
  width: max-content;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
  z-index: 100;
  padding: 4px;
  max-height: 240px;
  overflow-y: auto;
}

.dd-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.15) transparent;
}

.dd-list::-webkit-scrollbar {
  width: 2px;
}

.dd-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 6px 0;
}

.dd-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.2);
  border-radius: 10px;
}

.dd-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.35);
}

.dd-list-header {
  padding: 8px 10px 4px;
}

/* Option */
.dd-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 9px 14px;
  border: none;
  background: none;
  font-size: 13px;
  font-family: inherit;
  color: #475569;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.12s;
  text-align: right;
  white-space: nowrap;
}

.dd-option:hover {
  background: #f8fafc;
  color: #1e293b;
}

.dd-option.selected {
  background: rgba(249, 115, 22, 0.06);
  color: #f97316;
  font-weight: 600;
}

.dd-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dd-opt-icon i {
  font-size: 14px;
  color: #94a3b8;
}

.dd-empty {
  padding: 14px;
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
}

/* Transition */
.dd-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dd-leave-active {
  transition: all 0.15s ease;
}

.dd-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.dd-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
