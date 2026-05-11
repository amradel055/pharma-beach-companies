<template>
  <div class="owner-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">الحجوزات</h1>
        <p class="page-desc">متابعة حجوزات الشاليهات والتقارير المالية وأداء كل وحدة</p>
      </div>
    </div>

    <!-- Chalet Selector + Date Range -->
    <div class="controls-card">
      <div class="controls-row">
        <div class="control-field">
          <label>اختر الشاليه</label>
          <AppDropdown v-model="selectedChaletId" :options="chaletOptions" placeholder="كل الشاليهات" />
        </div>
        <DateRangeFilter :from="dateFrom" :to="dateTo" @update:from="dateFrom = $event" @update:to="dateTo = $event" @clear="dateFrom = ''; dateTo = ''" />
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button v-for="t in tabs" :key="t.key" :class="['tab-btn', { active: activeTab === t.key }]" @click="activeTab = t.key">
        <i :class="t.icon" />
        {{ t.label }}
      </button>
    </div>

    <!-- Tab: Calendar -->
    <div v-if="activeTab === 'calendar'" class="tab-content">
      <div class="calendar-card">
        <div class="cal-header">
          <button class="cal-nav" @click="calMonth--"><i class="pi pi-angle-right" /></button>
          <h3>{{ calMonthLabel }}</h3>
          <button class="cal-nav" @click="calMonth++"><i class="pi pi-angle-left" /></button>
        </div>
        <div class="cal-grid">
          <div v-for="d in weekDays" :key="d" class="cal-weekday">{{ d }}</div>
          <div v-for="(day, i) in calDays" :key="i" :class="['cal-day', day.type, { today: day.isToday }]" @click="day.booking && (selectedBooking = day.booking)">
            <span v-if="day.date" class="cal-num">{{ day.num }}</span>
          </div>
        </div>
        <div class="cal-legend">
          <span class="legend-item"><span class="legend-dot confirmed" /> محجوز مؤكد</span>
          <span class="legend-item"><span class="legend-dot partial" /> مدفوع جزئياً</span>
          <span class="legend-item"><span class="legend-dot" /> متاح</span>
        </div>
      </div>

      <!-- Booking Detail Popup -->
      <AppModal v-model="bookingDetailOpen" title="تفاصيل الحجز" icon="pi pi-calendar" size="sm">
        <div v-if="selectedBooking" class="booking-detail">
          <div class="bd-row"><span class="bd-label">الشاليه</span><span>{{ selectedBooking.chaletName }}</span></div>
          <div class="bd-row"><span class="bd-label">تسجيل الدخول</span><span>{{ fmtDate(selectedBooking.checkIn) }}</span></div>
          <div class="bd-row"><span class="bd-label">تسجيل الخروج</span><span>{{ fmtDate(selectedBooking.checkOut) }}</span></div>
          <div class="bd-row"><span class="bd-label">الليالي</span><span>{{ selectedBooking.nights }}</span></div>
          <div class="bd-row"><span class="bd-label">الإجمالي</span><span>{{ fmtNum(selectedBooking.total) }} ج.م</span></div>
          <div class="bd-row"><span class="bd-label">الحالة</span><span :class="['status-tag', selectedBooking.status.toLowerCase()]">{{ selectedBooking.status }}</span></div>
        </div>
      </AppModal>
    </div>

    <!-- Tab: KPIs -->
    <div v-if="activeTab === 'kpis'" class="tab-content">
      <FinancialKPIs :totals="financialData.totals" />
    </div>

    <!-- Tab: Ranking -->
    <div v-if="activeTab === 'ranking'" class="tab-content">
      <ChaletRankingTable :rankings="rankings" />
    </div>

    <!-- Tab: Payment -->
    <div v-if="activeTab === 'payment'" class="tab-content">
      <PaymentStatusTable :details="financialData.details" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChaletsStore } from '@/stores/chalets'
import { useBookingsStore } from '@/stores/bookings'
import { usePermissions } from '@/composables/usePermissions'
import { useFinancials } from '@/composables/useFinancials'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { ROLES } from '@/constants/roles'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppModal from '@/components/ui/AppModal.vue'
import DateRangeFilter from '@/components/admin/shared/DateRangeFilter.vue'
import FinancialKPIs from '@/components/admin/shared/FinancialKPIs.vue'
import ChaletRankingTable from '@/components/admin/shared/ChaletRankingTable.vue'
import PaymentStatusTable from '@/components/admin/shared/PaymentStatusTable.vue'

const auth = useAuthStore()
const chaletsStore = useChaletsStore()
const bookingsStore = useBookingsStore()
const { hasRole } = usePermissions()
const { calcBookingFinancials, aggregateFinancials, rankChalets } = useFinancials()
const { dateFrom, dateTo, filterByRange, setCurrentMonth } = useDateRangeFilter()

setCurrentMonth()

const selectedChaletId = ref('')
const activeTab = ref('calendar')
const calMonth = ref(new Date().getMonth())
const calYear = ref(new Date().getFullYear())
const selectedBooking = ref(null)
const bookingDetailOpen = computed({ get: () => !!selectedBooking.value, set: (v) => { if (!v) selectedBooking.value = null } })

const tabs = [
  { key: 'calendar', label: 'التقويم', icon: 'pi pi-calendar' },
  { key: 'kpis', label: 'المؤشرات المالية', icon: 'pi pi-chart-bar' },
  { key: 'ranking', label: 'ترتيب الشاليهات', icon: 'pi pi-sort-amount-down' },
  { key: 'payment', label: 'حالة الدفع', icon: 'pi pi-credit-card' },
]

// Owner's chalets
const ownerChalets = computed(() => {
  if (hasRole(ROLES.SITE_ADMIN)) return chaletsStore.chalets
  return chaletsStore.getByOwner(auth.user?.id)
})

const chaletOptions = computed(() => [
  { value: '', label: 'كل الشاليهات' },
  ...ownerChalets.value.map((c) => ({ value: c.id, label: `${c.name} (${c.chaletNumber})` })),
])

// Filtered bookings
const filteredBookings = computed(() => {
  const chaletIds = selectedChaletId.value
    ? [Number(selectedChaletId.value)]
    : ownerChalets.value.map((c) => c.id)

  let list = bookingsStore.bookings.filter((b) =>
    chaletIds.includes(b.chaletId) && (b.status === 'CONFIRMED' || b.status === 'PENDING')
  )

  list = filterByRange(list, (b) => b.checkIn)
  return list
})

// Chalets map for financials
const chaletsMap = computed(() => {
  const map = {}
  chaletsStore.chalets.forEach((c) => { map[c.id] = c })
  return map
})

// Financial data
const financialData = computed(() => aggregateFinancials(filteredBookings.value, chaletsMap.value))
const rankings = computed(() => rankChalets(financialData.value.details))

// Calendar
const weekDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

const calMonthLabel = computed(() => {
  const realMonth = ((calMonth.value % 12) + 12) % 12
  const yearOffset = Math.floor(calMonth.value / 12)
  const realYear = calYear.value + yearOffset
  const d = new Date(realYear, realMonth, 1)
  return d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
})

const calDays = computed(() => {
  const realMonth = ((calMonth.value % 12) + 12) % 12
  const yearOffset = Math.floor(calMonth.value / 12)
  const year = calYear.value + yearOffset
  const firstDay = new Date(year, realMonth, 1)
  const lastDate = new Date(year, realMonth + 1, 0).getDate()
  const startDow = firstDay.getDay()

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const chaletIds = selectedChaletId.value
    ? [Number(selectedChaletId.value)]
    : ownerChalets.value.map((c) => c.id)

  const allBookings = bookingsStore.bookings.filter((b) =>
    chaletIds.includes(b.chaletId) && (b.status === 'CONFIRMED' || b.status === 'PENDING')
  )

  const days = []
  // Empty slots before first day
  for (let i = 0; i < startDow; i++) days.push({ date: null, type: '' })

  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, realMonth, d)
    date.setHours(0, 0, 0, 0)
    const isToday = date.getTime() === today.getTime()

    // Check if booked
    let type = 'free'
    let matchedBooking = null
    for (const b of allBookings) {
      const bStart = new Date(b.checkIn); bStart.setHours(0, 0, 0, 0)
      const bEnd = new Date(b.checkOut); bEnd.setHours(0, 0, 0, 0)
      if (date >= bStart && date < bEnd) {
        const paid = (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
        type = paid >= b.total ? 'confirmed' : 'partial'
        matchedBooking = b
        break
      }
    }

    days.push({ date, num: d, type, isToday, booking: matchedBooking })
  }

  return days
})

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Controls */
.controls-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
.controls-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.control-field { display: flex; flex-direction: column; gap: 4px; min-width: 220px; }
.control-field label { font-size: 12px; font-weight: 600; color: #64748b; }

/* Tabs */
.tabs-bar { display: flex; gap: 6px; margin-bottom: 16px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 6px; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; border: none; background: none; font-size: 13px; font-weight: 600; font-family: inherit; color: #64748b; cursor: pointer; transition: all 0.15s; }
.tab-btn:hover { background: #f8fafc; color: #475569; }
.tab-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.tab-btn i { font-size: 14px; }

/* Calendar */
.calendar-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; margin-bottom: 16px; }
.cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.cal-header h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
.cal-nav { width: 34px; height: 34px; border-radius: 8px; border: 1px solid #e2e8f0; background: none; color: #475569; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.cal-nav:hover { background: #f8fafc; }

.cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-weekday { text-align: center; font-size: 12px; font-weight: 600; color: #94a3b8; padding: 8px 0; }

.cal-day { aspect-ratio: 1; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #475569; cursor: default; transition: all 0.15s; position: relative; }
.cal-day.free { background: #fff; }
.cal-day.free:hover { background: #f8fafc; }
.cal-day.confirmed { background: rgba(16, 185, 129, 0.12); color: #059669; font-weight: 600; cursor: pointer; }
.cal-day.confirmed:hover { background: rgba(16, 185, 129, 0.2); }
.cal-day.partial { background: rgba(234, 179, 8, 0.12); color: #a16207; font-weight: 600; cursor: pointer; }
.cal-day.partial:hover { background: rgba(234, 179, 8, 0.2); }
.cal-day.today { box-shadow: inset 0 0 0 2px #f97316; }
.cal-num { position: relative; z-index: 1; }

.cal-legend { display: flex; gap: 20px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748b; }
.legend-dot { width: 10px; height: 10px; border-radius: 4px; background: #e2e8f0; }
.legend-dot.confirmed { background: #10b981; }
.legend-dot.partial { background: #eab308; }

/* Booking Detail */
.booking-detail { display: flex; flex-direction: column; gap: 10px; }
.bd-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13.5px; }
.bd-row:last-child { border-bottom: none; }
.bd-label { color: #94a3b8; font-weight: 500; }
.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; }
.status-tag.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-tag.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }

@media (max-width: 768px) {
  .controls-card { padding: 14px 16px; }
  .controls-row { flex-direction: column; gap: 12px; }
  .control-field { min-width: 100%; }
  .tabs-bar { overflow-x: auto; padding: 4px; scrollbar-width: none; }
  .tabs-bar::-webkit-scrollbar { display: none; }
  .tab-btn { white-space: nowrap; padding: 8px 14px; font-size: 12px; }
  .calendar-card { padding: 14px; }
  .cal-day { font-size: 12px; }
  .cal-weekday { font-size: 11px; }
  .cal-header h3 { font-size: 14px; }
  .cal-legend { flex-wrap: wrap; gap: 12px; }
}
</style>
