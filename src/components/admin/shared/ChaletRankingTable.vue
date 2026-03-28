<template>
  <div class="ranking-card">
    <div class="ranking-header">
      <h3><i class="pi pi-sort-amount-down" /> ترتيب الشاليهات</h3>
      <div class="ranking-sort">
        <AppDropdown v-model="sortBy" :options="sortOptions" placeholder="ترتيب حسب" />
      </div>
    </div>

    <div v-if="sorted.length === 0" class="ranking-empty">
      <p>لا توجد بيانات للفترة المحددة</p>
    </div>

    <table v-else class="ranking-table">
      <thead>
        <tr>
          <th>#</th>
          <th>الشاليه</th>
          <th>الحجوزات</th>
          <th>الليالي</th>
          <th>الدخل</th>
          <th>صافي المالك</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in sorted" :key="r.chaletId">
          <td><span class="rank-num" :class="{ top: i < 3 }">{{ i + 1 }}</span></td>
          <td>
            <div class="rank-chalet">
              <span class="rank-name">{{ r.chaletName }}</span>
              <span class="rank-number">{{ r.chaletNumber }}</span>
            </div>
          </td>
          <td class="rank-val">{{ r.bookingsCount }}</td>
          <td class="rank-val">{{ r.totalNights }}</td>
          <td class="rank-val highlight">{{ formatNum(r.totalIncome) }} <small>ج.م</small></td>
          <td class="rank-val">{{ formatNum(r.netOwner) }} <small>ج.م</small></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  rankings: { type: Array, default: () => [] },
})

const sortBy = ref('income_desc')
const sortOptions = [
  { value: 'income_desc', label: 'الأعلى دخلاً' },
  { value: 'income_asc', label: 'الأقل دخلاً' },
  { value: 'bookings_desc', label: 'الأكثر حجزاً' },
]

const sorted = computed(() => {
  const list = [...props.rankings]
  if (sortBy.value === 'income_desc') list.sort((a, b) => b.totalIncome - a.totalIncome)
  else if (sortBy.value === 'income_asc') list.sort((a, b) => a.totalIncome - b.totalIncome)
  else if (sortBy.value === 'bookings_desc') list.sort((a, b) => b.bookingsCount - a.bookingsCount)
  return list
})

function formatNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.ranking-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
.ranking-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.ranking-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.ranking-header h3 i { color: #f97316; font-size: 16px; }
.ranking-sort { width: 160px; }
.ranking-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; }

.ranking-table { width: 100%; border-collapse: collapse; }
.ranking-table th { padding: 12px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.ranking-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.ranking-table tr:last-child td { border-bottom: none; }
.ranking-table tr:hover { background: #fafbfc; }

.rank-num { width: 28px; height: 28px; border-radius: 8px; background: #f1f5f9; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #64748b; }
.rank-num.top { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; }

.rank-chalet { display: flex; flex-direction: column; gap: 2px; }
.rank-name { font-weight: 600; color: #1e293b; font-size: 13.5px; }
.rank-number { font-size: 12px; color: #94a3b8; }

.rank-val { font-weight: 600; text-align: center; }
.rank-val.highlight { color: #10b981; }
.rank-val small { font-size: 11px; color: #94a3b8; font-weight: 500; }

@media (max-width: 768px) {
  .ranking-header { flex-direction: column; gap: 10px; align-items: flex-start; }
  .ranking-sort { width: 100%; }
  .ranking-card { overflow-x: auto; }
  .ranking-table { min-width: 500px; }
  .ranking-table th, .ranking-table td { padding: 10px 12px; font-size: 12.5px; }
}
</style>
