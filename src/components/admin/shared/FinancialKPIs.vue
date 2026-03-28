<template>
  <div class="kpi-grid">
    <div v-for="(kpi, i) in kpis" :key="i" class="kpi-card" :style="{ '--accent': kpi.color }">
      <div class="kpi-top">
        <div class="kpi-icon"><i :class="kpi.icon" /></div>
        <span v-if="kpi.suffix" class="kpi-suffix">{{ kpi.suffix }}</span>
      </div>
      <span class="kpi-value">{{ formatNum(kpi.value) }}</span>
      <span class="kpi-label">{{ kpi.label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totals: { type: Object, default: () => ({}) },
})

function formatNum(n) {
  if (n === undefined || n === null) return '0'
  return Number(n).toLocaleString('ar-EG')
}

const kpis = computed(() => {
  const t = props.totals
  return [
    { label: 'عدد الحجوزات', value: t.bookingsCount || 0, icon: 'pi pi-calendar', color: '#8b5cf6', suffix: 'حجز' },
    { label: 'القيمة الإيجارية', value: t.rentalValue || 0, icon: 'pi pi-wallet', color: '#0ea5e9', suffix: 'ج.م' },
    { label: 'رسم الإيجار', value: t.rentalFee || 0, icon: 'pi pi-receipt', color: '#64748b', suffix: 'ج.م' },
    { label: 'نسبة التشغيل (17%)', value: t.operatingFee || 0, icon: 'pi pi-cog', color: '#eab308', suffix: 'ج.م' },
    { label: 'نسبة البروكر', value: t.brokerCommission || 0, icon: 'pi pi-briefcase', color: '#f97316', suffix: 'ج.م' },
    { label: 'نسبة القرية', value: t.villageCommission || 0, icon: 'pi pi-building', color: '#06b6d4', suffix: 'ج.م' },
    { label: 'صافي المالك', value: t.netOwner || 0, icon: 'pi pi-check-circle', color: '#10b981', suffix: 'ج.م' },
    { label: 'إجمالي الليالي', value: t.totalNights || 0, icon: 'pi pi-moon', color: '#a855f7', suffix: 'ليلة' },
  ]
})
</script>

<style scoped>
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.kpi-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 18px;
  transition: all 0.15s;
}

.kpi-card:hover {
  border-color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.kpi-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon i {
  font-size: 17px;
  color: var(--accent);
}

.kpi-suffix {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.kpi-value {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 4px;
}

.kpi-label {
  display: block;
  font-size: 12.5px;
  color: #94a3b8;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .kpi-card { padding: 14px; }
  .kpi-value { font-size: 18px; }
}
</style>
