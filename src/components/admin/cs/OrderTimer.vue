<template>
  <span :class="['timer', colorClass]">
    <i class="pi pi-stopwatch" />
    {{ display }}
  </span>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const props = defineProps({
  createdAt: { type: String, required: true },
  frozenAt: { type: String, default: null },
})

const settings = useSettingsStore()

const now = ref(Date.now())
let interval = null

onMounted(() => { interval = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => { clearInterval(interval) })

const endTime = computed(() => props.frozenAt ? new Date(props.frozenAt).getTime() : now.value)
const elapsed = computed(() => Math.max(0, Math.floor((endTime.value - new Date(props.createdAt).getTime()) / 1000)))

const display = computed(() => {
  const h = Math.floor(elapsed.value / 3600)
  const m = Math.floor((elapsed.value % 3600) / 60)
  const s = elapsed.value % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const colorClass = computed(() => {
  const mins = elapsed.value / 60
  if (mins > settings.csTimerOrangeMax) return 'danger'
  if (mins > settings.csTimerGreenMax) return 'warn'
  return 'ok'
})
</script>

<style scoped>
.timer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  direction: ltr;
}

.timer i { font-size: 13px; }

.timer.ok { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.timer.warn { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.timer.danger { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
</style>
