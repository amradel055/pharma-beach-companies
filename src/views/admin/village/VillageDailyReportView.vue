<template>
  <div class="report-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">التقرير اليومي للقرية</h1>
        <p class="page-desc">ملخص الحجوزات وتسجيلات الدخول والخروج</p>
      </div>
      <button class="btn-export" @click="exportCSV">
        <i class="pi pi-download" />
        تصدير CSV
      </button>
    </div>

    <!-- Date Picker -->
    <div class="date-card">
      <div class="date-row">
        <label class="date-label"><i class="pi pi-calendar" /> التاريخ</label>
        <input v-model="selectedDate" type="date" class="date-input" />
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="stats-row">
      <div class="mini-stat" v-for="(s, i) in stats" :key="i" :style="{ '--accent': s.color }">
        <div class="mini-stat-icon"><i :class="s.icon" /></div>
        <div class="mini-stat-info">
          <span class="mini-stat-value">{{ s.value }}</span>
          <span class="mini-stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- Bookings Today -->
    <div class="section-card">
      <h3 class="card-title"><i class="pi pi-bookmark" /> حجوزات اليوم</h3>
      <div v-if="bookingsToday.length === 0" class="empty-mini">
        <i class="pi pi-inbox" />
        <span>لا توجد حجوزات لهذا اليوم</span>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>الشاليه</th>
            <th>تسجيل الدخول</th>
            <th>تسجيل الخروج</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in bookingsToday" :key="b.id" class="table-row">
            <td class="cell-name">{{ b.chaletName }} ({{ b.chaletNumber }})</td>
            <td>{{ formatDate(b.checkIn) }}</td>
            <td>{{ formatDate(b.checkOut) }}</td>
            <td>
              <span class="status-tag" :class="b.status.toLowerCase()">{{ statusLabel(b.status) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Check-ins Today -->
    <div class="section-card">
      <h3 class="card-title"><i class="pi pi-sign-in" /> تسجيلات الدخول اليوم</h3>
      <div v-if="checkInsToday.length === 0" class="empty-mini">
        <i class="pi pi-inbox" />
        <span>لا توجد تسجيلات دخول لهذا اليوم</span>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>الشاليه</th>
            <th>وقت الدخول المتوقع</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in checkInsToday" :key="b.id" class="table-row">
            <td class="cell-name">{{ b.chaletName }} ({{ b.chaletNumber }})</td>
            <td>{{ formatDate(b.checkIn) }}</td>
            <td>
              <span v-if="b.checkedInAt" class="done-badge"><i class="pi pi-check-circle" /> تم</span>
              <span v-else class="overdue-badge" :class="{ overdue: isOverdue(b.checkIn) }">
                <i :class="isOverdue(b.checkIn) ? 'pi pi-exclamation-triangle' : 'pi pi-clock'" />
                {{ isOverdue(b.checkIn) ? 'متأخر' : 'في الانتظار' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Check-outs Today -->
    <div class="section-card">
      <h3 class="card-title"><i class="pi pi-sign-out" /> تسجيلات الخروج اليوم</h3>
      <div v-if="checkOutsToday.length === 0" class="empty-mini">
        <i class="pi pi-inbox" />
        <span>لا توجد تسجيلات خروج لهذا اليوم</span>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>الشاليه</th>
            <th>وقت الخروج المتوقع</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in checkOutsToday" :key="b.id" class="table-row">
            <td class="cell-name">{{ b.chaletName }} ({{ b.chaletNumber }})</td>
            <td>{{ formatDate(b.checkOut) }}</td>
            <td>
              <span v-if="b.checkedOutAt" class="done-badge"><i class="pi pi-check-circle" /> تم</span>
              <span v-else class="overdue-badge" :class="{ overdue: isOverdue(b.checkOut) }">
                <i :class="isOverdue(b.checkOut) ? 'pi pi-exclamation-triangle' : 'pi pi-clock'" />
                {{ isOverdue(b.checkOut) ? 'متأخر' : 'في الانتظار' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookingsStore } from '@/stores/bookings'
import { useToastStore } from '@/stores/toast'

const bookingsStore = useBookingsStore()
const toast = useToastStore()

const todayISO = new Date().toISOString().slice(0, 10)
const selectedDate = ref(todayISO)

const selectedDay = computed(() => {
  const d = new Date(selectedDate.value)
  d.setHours(0, 0, 0, 0)
  return d
})

const bookingsToday = computed(() => {
  return bookingsStore.bookings.filter((b) => {
    if (b.status === 'CANCELLED' || b.status === 'EXPIRED') return false
    const ci = new Date(b.checkIn); ci.setHours(0, 0, 0, 0)
    const co = new Date(b.checkOut); co.setHours(0, 0, 0, 0)
    return selectedDay.value >= ci && selectedDay.value < co
  })
})

const checkInsToday = computed(() => {
  return bookingsStore.bookings.filter((b) => {
    if (b.status !== 'CONFIRMED') return false
    const ci = new Date(b.checkIn); ci.setHours(0, 0, 0, 0)
    return ci.getTime() === selectedDay.value.getTime()
  })
})

const checkOutsToday = computed(() => {
  return bookingsStore.bookings.filter((b) => {
    if (b.status !== 'CONFIRMED') return false
    const co = new Date(b.checkOut); co.setHours(0, 0, 0, 0)
    return co.getTime() === selectedDay.value.getTime()
  })
})

const stats = computed(() => [
  { label: 'حجوزات اليوم', value: bookingsToday.value.length, icon: 'pi pi-bookmark', color: '#8b5cf6' },
  { label: 'تسجيلات دخول', value: checkInsToday.value.length, icon: 'pi pi-sign-in', color: '#10b981' },
  { label: 'تسجيلات خروج', value: checkOutsToday.value.length, icon: 'pi pi-sign-out', color: '#f97316' },
])

function statusLabel(status) {
  return { CONFIRMED: 'مؤكد', PENDING: 'معلق', TEMPORARY: 'مؤقت' }[status] || status
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

function isOverdue(iso) {
  return new Date(iso) < new Date()
}

function exportCSV() {
  const BOM = '\uFEFF'
  const headers = ['الشاليه', 'رقم الشاليه', 'تسجيل الدخول', 'تسجيل الخروج', 'الحالة', 'تم الدخول', 'تم الخروج']
  const rows = bookingsToday.value.map((b) => [
    b.chaletName,
    b.chaletNumber,
    formatDate(b.checkIn),
    formatDate(b.checkOut),
    statusLabel(b.status),
    b.checkedInAt ? 'نعم' : 'لا',
    b.checkedOutAt ? 'نعم' : 'لا',
  ])
  const csv = BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `daily-report-${selectedDate.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('تم تصدير التقرير بنجاح')
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.btn-export { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-export:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35); }

.date-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.date-row { display: flex; align-items: center; gap: 12px; }
.date-label { display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 600; color: #475569; }
.date-label i { color: #f97316; }
.date-input { height: 40px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; }
.date-input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
.mini-stat { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
.mini-stat-icon { width: 40px; height: 40px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 10%, transparent); display: flex; align-items: center; justify-content: center; }
.mini-stat-icon i { font-size: 18px; color: var(--accent); }
.mini-stat-value { display: block; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }
.mini-stat-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }

.section-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
.card-title i { color: #f97316; font-size: 18px; }

.empty-mini { display: flex; align-items: center; gap: 8px; padding: 20px; color: #94a3b8; font-size: 13.5px; justify-content: center; }
.empty-mini i { font-size: 16px; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.data-table td { padding: 12px 16px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.table-row { transition: background 0.15s; }
.table-row:hover { background: #fafbfc; }
.table-row:last-child td { border-bottom: none; }

.cell-name { font-weight: 600; color: #1e293b; }

.status-tag { display: inline-flex; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.status-tag.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-tag.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.status-tag.temporary { background: rgba(148, 163, 184, 0.08); color: #94a3b8; }

.done-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; background: rgba(16, 185, 129, 0.08); color: #10b981; }
.overdue-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; background: rgba(234, 179, 8, 0.08); color: #eab308; }
.overdue-badge.overdue { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .btn-export { width: 100%; justify-content: center; }
  .stats-row { grid-template-columns: 1fr; }
  .section-card { overflow-x: auto; }
  .data-table { min-width: 400px; }
}
</style>
