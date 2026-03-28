<template>
  <div class="payment-card">
    <div class="payment-header">
      <h3><i class="pi pi-credit-card" /> حالة الدفع</h3>
    </div>

    <!-- Summary -->
    <div class="payment-summary">
      <button :class="['ps-tab', { active: tab === 'full' }]" @click="tab = 'full'">
        <span class="ps-count" style="background: rgba(16, 185, 129, 0.08); color: #10b981;">{{ fullPaid.length }}</span>
        مدفوع بالكامل
      </button>
      <button :class="['ps-tab', { active: tab === 'partial' }]" @click="tab = 'partial'">
        <span class="ps-count" style="background: rgba(234, 179, 8, 0.08); color: #eab308;">{{ partialPaid.length }}</span>
        مدفوع جزئياً
      </button>
      <button :class="['ps-tab', { active: tab === 'unpaid' }]" @click="tab = 'unpaid'">
        <span class="ps-count" style="background: rgba(239, 68, 68, 0.08); color: #ef4444;">{{ unpaid.length }}</span>
        غير مدفوع
      </button>
    </div>

    <!-- Table -->
    <div v-if="activeList.length === 0" class="payment-empty">
      <p>لا توجد حجوزات في هذه الفئة</p>
    </div>

    <table v-else class="payment-table">
      <thead>
        <tr>
          <th>الشاليه</th>
          <th>المدة</th>
          <th>الإجمالي</th>
          <th>المدفوع</th>
          <th>المتبقي</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in activeList" :key="d.booking.id">
          <td>
            <div class="pay-chalet">
              <span class="pay-name">{{ d.booking.chaletName }}</span>
              <span class="pay-num">{{ d.booking.chaletNumber }}</span>
            </div>
          </td>
          <td>{{ d.booking.nights }} ليلة</td>
          <td class="pay-val">{{ formatNum(d.financials.rentalValue) }}</td>
          <td class="pay-val green">{{ formatNum(d.financials.totalPaid) }}</td>
          <td class="pay-val red">{{ formatNum(d.financials.remaining) }}</td>
          <td>
            <span :class="['pay-badge', d.financials.paymentStatus]">
              {{ statusLabel(d.financials.paymentStatus) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  details: { type: Array, default: () => [] },
})

const tab = ref('full')

const fullPaid = computed(() => props.details.filter((d) => d.financials.paymentStatus === 'full'))
const partialPaid = computed(() => props.details.filter((d) => d.financials.paymentStatus === 'partial'))
const unpaid = computed(() => props.details.filter((d) => d.financials.paymentStatus === 'unpaid'))

const activeList = computed(() => {
  if (tab.value === 'full') return fullPaid.value
  if (tab.value === 'partial') return partialPaid.value
  return unpaid.value
})

function formatNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
function statusLabel(s) {
  return { full: 'مدفوع', partial: 'جزئي', unpaid: 'غير مدفوع' }[s] || s
}
</script>

<style scoped>
.payment-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
.payment-header { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.payment-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.payment-header h3 i { color: #f97316; font-size: 16px; }

.payment-summary { display: flex; gap: 8px; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.ps-tab { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; background: none; font-size: 13px; font-weight: 600; font-family: inherit; color: #475569; cursor: pointer; transition: all 0.15s; }
.ps-tab.active { border-color: #f97316; background: rgba(249, 115, 22, 0.04); color: #f97316; }
.ps-tab:hover:not(.active) { background: #f8fafc; }
.ps-count { padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; }

.payment-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; }

.payment-table { width: 100%; border-collapse: collapse; }
.payment-table th { padding: 12px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.payment-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.payment-table tr:last-child td { border-bottom: none; }
.payment-table tr:hover { background: #fafbfc; }

.pay-chalet { display: flex; flex-direction: column; gap: 2px; }
.pay-name { font-weight: 600; color: #1e293b; }
.pay-num { font-size: 12px; color: #94a3b8; }
.pay-val { font-weight: 600; text-align: center; }
.pay-val.green { color: #10b981; }
.pay-val.red { color: #ef4444; }

.pay-badge { padding: 4px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; }
.pay-badge.full { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.pay-badge.partial { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.pay-badge.unpaid { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

@media (max-width: 768px) {
  .payment-summary { flex-wrap: wrap; gap: 6px; padding: 12px 16px; }
  .ps-tab { font-size: 12px; padding: 6px 12px; }
  .payment-card { overflow-x: auto; }
  .payment-table { min-width: 500px; }
  .payment-table th, .payment-table td { padding: 10px 12px; font-size: 12.5px; }
}
</style>
