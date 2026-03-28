<template>
  <div class="stat-card" :style="{ '--accent': color }">
    <div class="stat-top">
      <div class="stat-icon">
        <i :class="icon" />
      </div>
      <span v-if="trend" :class="['stat-trend', trend > 0 ? 'up' : 'down']">
        <i :class="trend > 0 ? 'pi pi-arrow-up-right' : 'pi pi-arrow-down-right'" />
        {{ Math.abs(trend) }}%
      </span>
    </div>
    <span class="stat-value">{{ displayValue }}</span>
    <span class="stat-label">{{ label }}</span>
    <div v-if="showBar" class="stat-bar">
      <div class="stat-bar-fill" :style="{ width: barWidth }" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: [Number, String], default: 0 },
  icon: { type: String, default: 'pi pi-chart-bar' },
  color: { type: String, default: '#f97316' },
  trend: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  showBar: { type: Boolean, default: false },
  barPercent: { type: Number, default: 0 },
})

const displayValue = computed(() => {
  const v = typeof props.value === 'number' ? props.value.toLocaleString('ar-EG') : props.value
  return props.suffix ? `${v} ${props.suffix}` : v
})

const barWidth = computed(() => Math.min(100, props.barPercent) + '%')
</script>

<style scoped>
.stat-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px;
  transition: all 0.15s;
}

.stat-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.stat-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon i {
  font-size: 20px;
  color: var(--accent);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.up { color: #10b981; }
.stat-trend.down { color: #ef4444; }
.stat-trend i { font-size: 12px; }

.stat-value {
  display: block;
  font-size: 26px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.stat-bar {
  height: 4px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 14px;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--accent);
  transition: width 0.6s ease;
}
</style>
