<template>
  <div class="date-range">
    <div class="dr-field">
      <label>من تاريخ</label>
      <DatePicker
        :modelValue="fromDate"
        @update:modelValue="onFromChange"
        dateFormat="dd/mm/yy"
        placeholder="اختر التاريخ"
        showIcon
        iconDisplay="input"
        :showOnFocus="false"
        class="dr-picker"
      />
    </div>
    <div class="dr-field">
      <label>إلى تاريخ</label>
      <DatePicker
        :modelValue="toDate"
        @update:modelValue="onToChange"
        dateFormat="dd/mm/yy"
        placeholder="اختر التاريخ"
        showIcon
        iconDisplay="input"
        :showOnFocus="false"
        :minDate="fromDate || undefined"
        class="dr-picker"
      />
    </div>
    <button v-if="from || to" class="dr-clear" @click="$emit('clear')" title="مسح">
      <i class="pi pi-times" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import DatePicker from 'primevue/datepicker'

const props = defineProps({
  from: { type: String, default: '' },
  to: { type: String, default: '' },
})
const emit = defineEmits(['update:from', 'update:to', 'clear'])

const fromDate = computed(() => props.from ? new Date(props.from) : null)
const toDate = computed(() => props.to ? new Date(props.to) : null)

function toISODate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}

function onFromChange(val) {
  emit('update:from', toISODate(val))
}

function onToChange(val) {
  emit('update:to', toISODate(val))
}
</script>

<style scoped>
.date-range {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.dr-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dr-field label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.dr-clear {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.dr-clear:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #ef4444;
}

@media (max-width: 640px) {
  .date-range {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .dr-clear {
    align-self: flex-end;
  }
}
</style>

<style>
/* PrimeVue DatePicker overrides for admin panel */
.dr-picker .p-datepicker-input {
  height: 40px !important;
  padding: 0 12px !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  font-family: 'Cairo', sans-serif !important;
  color: #1e293b !important;
  background: #fafbfc !important;
  transition: all 0.15s !important;
  width: 160px !important;
}

.dr-picker .p-datepicker-input:focus {
  border-color: #f97316 !important;
  background: #fff !important;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08) !important;
  outline: none !important;
}

.dr-picker .p-datepicker-input-icon-container {
  color: #94a3b8 !important;
}

/* Calendar popup styling */
.p-datepicker-panel {
  border-radius: 14px !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08) !important;
  overflow: hidden !important;
  font-family: 'Cairo', sans-serif !important;
}

.p-datepicker-header {
  padding: 12px 16px !important;
  border-bottom: 1px solid #f1f5f9 !important;
}

.p-datepicker-title button {
  font-weight: 700 !important;
  color: #0f172a !important;
  font-family: 'Cairo', sans-serif !important;
}

.p-datepicker-calendar td > span {
  width: 36px !important;
  height: 36px !important;
  border-radius: 10px !important;
  font-size: 13px !important;
  transition: all 0.12s !important;
}

.p-datepicker-calendar td > span:hover {
  background: #f8fafc !important;
}

.p-datepicker-calendar td > span.p-highlight {
  background: #f97316 !important;
  color: #fff !important;
  border-radius: 10px !important;
}

.p-datepicker-calendar td.p-datepicker-today > span:not(.p-highlight) {
  border: 2px solid #f97316 !important;
  background: transparent !important;
  color: #f97316 !important;
  font-weight: 700 !important;
}

.p-datepicker-prev-button,
.p-datepicker-next-button {
  width: 32px !important;
  height: 32px !important;
  border-radius: 8px !important;
  transition: all 0.12s !important;
}

.p-datepicker-prev-button:hover,
.p-datepicker-next-button:hover {
  background: #f1f5f9 !important;
}
</style>
