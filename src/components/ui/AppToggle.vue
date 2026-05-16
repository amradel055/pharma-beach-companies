<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :class="['app-toggle', { 'is-on': modelValue, 'is-disabled': disabled }]"
    :disabled="disabled"
    @click="onClick"
  >
    <span class="app-toggle-track">
      <span class="app-toggle-thumb" />
    </span>
    <span v-if="$slots.default" class="app-toggle-label">
      <slot />
    </span>
  </button>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'change'])

function onClick() {
  if (props.disabled) return
  const next = !props.modelValue
  emit('update:modelValue', next)
  emit('change', next)
}
</script>

<style scoped>
.app-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
}
.app-toggle.is-disabled { cursor: not-allowed; opacity: 0.5; }

.app-toggle-track {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: #e2e8f0;
  transition: background 0.15s;
  flex-shrink: 0;
}
.app-toggle.is-on .app-toggle-track {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.30);
}

.app-toggle-thumb {
  position: absolute;
  top: 3px;
  inset-inline-start: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.15);
  transition: inset-inline-start 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.app-toggle.is-on .app-toggle-thumb {
  inset-inline-start: 19px;
}

.app-toggle-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
}
</style>
