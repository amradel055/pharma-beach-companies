<template>
  <div class="bookings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">سجل الحجوزات</h1>
        <p class="page-desc">عرض كل الحجوزات بتفاصيلها المالية وحالات الدفع</p>
      </div>
      <RouterLink to="/admin/owner" class="btn-primary">
        <i class="pi pi-plus" />
        إنشاء حجز
      </RouterLink>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="mini-stat" v-for="(s, i) in stats" :key="i" :style="{ '--accent': s.color }">
        <div class="mini-stat-icon">
          <i :class="s.icon" />
        </div>
        <div class="mini-stat-info">
          <span class="mini-stat-value">{{ s.value }}</span>
          <span class="mini-stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-row">
        <div class="search-box">
          <i class="pi pi-search" />
          <input v-model="search" type="text" placeholder="بحث بكود الحجز أو اسم الحاجز أو الشاليه..." />
          <button v-if="search" class="search-clear" @click="search = ''">
            <i class="pi pi-times" />
          </button>
        </div>

        <div class="filter-group">
          <AppDropdown
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="كل الحالات"
          />
        </div>

        <div class="filter-group date-group">
          <DateRangePicker
            :from="dateFrom"
            :to="dateTo"
            @update:from="dateFrom = $event"
            @update:to="dateTo = $event"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="paginatedRows.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-inbox" /></div>
        <h3>لا توجد حجوزات</h3>
        <p>{{ search || filterStatus || dateFrom || dateTo ? 'لم يتم العثور على نتائج مطابقة' : 'لم يتم إنشاء حجوزات بعد' }}</p>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>كود الحجز</th>
              <th>إسم الحاجز</th>
              <th>الشاليه</th>
              <th>من</th>
              <th>إلى</th>
              <th>الليالى</th>
              <th>سعر الليلة</th>
              <th>رسوم القرية</th>
              <th>مبالغ إضافية</th>
              <th>المدفوع</th>
              <th class="th-balance">المتبقى</th>
              <th>التأمين</th>
              <th>الشركة %</th>
              <th>البروكر %</th>
              <th>المالك %</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedRows" :key="row.id" class="table-row">
              <td class="cell-code">{{ row.id }}</td>
              <td class="cell-name">{{ row.guestName }}</td>
              <td>
                <div class="chalet-cell">
                  <strong>{{ row.chaletName }}</strong>
                  <span v-if="row.chaletNumber">{{ row.chaletNumber }}</span>
                </div>
              </td>
              <td class="cell-date">{{ fmtDate(row.checkIn) }}</td>
              <td class="cell-date">{{ fmtDate(row.checkOut) }}</td>
              <td class="cell-num">{{ row.nights }}</td>
              <td class="cell-num">{{ fmtNum(row.nightlyPrice) }}</td>
              <td class="cell-num">{{ fmtNum(row.villageFee) }}</td>
              <td class="cell-num">{{ fmtNum(row.extras) }}</td>
              <td class="cell-num cell-paid">{{ fmtNum(row.paid) }}</td>
              <td class="cell-num cell-balance" :class="{ 'is-zero': row.balance === 0 }">{{ fmtNum(row.balance) }}</td>
              <td class="cell-num">{{ fmtNum(row.deposit) }}</td>
              <td class="cell-pct">{{ row.companyPct ? row.companyPct + '%' : '—' }}</td>
              <td class="cell-pct">{{ row.brokerPct ? row.brokerPct + '%' : '—' }}</td>
              <td class="cell-pct">{{ row.ownerPct ? row.ownerPct + '%' : '—' }}</td>
              <td>
                <span class="status-tag" :class="row.statusClass">{{ row.statusLabel }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="filteredRows.length > 0" class="pagination">
        <button class="pag-btn" :disabled="currentPage === 1" @click="currentPage--">
          <i class="pi pi-angle-right" />
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          :class="['pag-btn', { active: p === currentPage }]"
          @click="currentPage = p"
        >{{ p }}</button>
        <button class="pag-btn" :disabled="currentPage === totalPages" @click="currentPage++">
          <i class="pi pi-angle-left" />
        </button>
        <span class="pag-info">{{ filteredRows.length }} حجز</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useBookingsStore } from '@/stores/bookings'
import { useChaletsStore } from '@/stores/chalets'
import { useUsersStore } from '@/stores/users'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'

const bookingsStore = useBookingsStore()
const chaletsStore = useChaletsStore()
const usersStore = useUsersStore()

const search = ref('')
const filterStatus = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 10

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'CONFIRMED', label: 'مؤكد' },
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'PROCESSING', label: 'قيد المعالجة' },
  { value: 'TEMPORARY', label: 'مؤقت' },
]

const STATUS_LABELS = {
  CONFIRMED: 'مؤكد',
  PENDING: 'قيد الانتظار',
  PROCESSING: 'قيد المعالجة',
  TEMPORARY: 'مؤقت',
}
const STATUS_CLASSES = {
  CONFIRMED: 'st-confirmed',
  PENDING: 'st-pending',
  PROCESSING: 'st-processing',
  TEMPORARY: 'st-temporary',
}

function paidAmount(b) {
  return (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
}

function guestNameOf(b) {
  if (!b.guests || !b.guests.length) return '—'
  const main = b.guests.find((g) => g.relation === 'صاحب الحجز') || b.guests[0]
  return main?.name || '—'
}

const allRows = computed(() => {
  return bookingsStore.bookings
    .filter((b) => ['CONFIRMED', 'PENDING', 'PROCESSING', 'TEMPORARY'].includes(b.status))
    .map((b) => {
      const chalet = chaletsStore.chalets.find((c) => c.id === b.chaletId) || {}
      const broker = b.brokerId ? usersStore.users.find((u) => u.id === b.brokerId) : null
      const owner = chalet.ownerId ? usersStore.users.find((u) => u.id === chalet.ownerId) : null

      const paid = paidAmount(b)
      const nightlyPrice = b.nights > 0 ? Math.round(Number(b.subtotal || b.total || 0) / b.nights) : 0

      return {
        id: b.id,
        guestName: guestNameOf(b),
        chaletName: b.chaletName || chalet.name || '—',
        chaletNumber: b.chaletNumber || chalet.chaletNumber || null,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        createdAt: b.createdAt,
        nights: b.nights,
        nightlyPrice,
        villageFee: Number(chalet.rentalFee || 0) * b.nights,
        extras: Number(b.guestExtraTotal || 0),
        paid,
        balance: Math.max(0, Number(b.total || 0) - paid),
        deposit: Number(b.deposit || chalet.deposit || 0),
        brokerPct: broker?.commissionPercent || null,
        ownerPct: owner?.commissionPercent || null,
        companyPct: null,
        status: b.status,
        statusLabel: STATUS_LABELS[b.status] || b.status,
        statusClass: STATUS_CLASSES[b.status] || '',
      }
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  const from = dateFrom.value ? new Date(dateFrom.value) : null
  const to = dateTo.value ? new Date(dateTo.value) : null

  return allRows.value.filter((r) => {
    if (filterStatus.value && r.status !== filterStatus.value) return false
    if (q) {
      const hay = `${r.id} ${r.guestName} ${r.chaletName} ${r.chaletNumber || ''}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (from || to) {
      const checkIn = new Date(r.checkIn)
      if (from && checkIn < from) return false
      if (to && checkIn > to) return false
    }
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / PAGE_SIZE)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredRows.value.slice(start, start + PAGE_SIZE)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const cur = currentPage.value
  const pages = []
  const window = 2
  for (let p = 1; p <= total; p++) {
    if (p === 1 || p === total || (p >= cur - window && p <= cur + window)) pages.push(p)
  }
  return pages
})

// Reset to page 1 whenever filters change
watch([search, filterStatus, dateFrom, dateTo], () => { currentPage.value = 1 })

const stats = computed(() => {
  const list = allRows.value
  const totalRevenue = list.reduce((s, r) => s + Number(r.paid || 0), 0)
  return [
    { label: 'إجمالي الحجوزات', value: list.length, icon: 'pi pi-clipboard', color: '#0ea5e9' },
    { label: 'مؤكد', value: list.filter((r) => r.status === 'CONFIRMED').length, icon: 'pi pi-check-circle', color: '#10b981' },
    { label: 'قيد الانتظار', value: list.filter((r) => r.status === 'PENDING' || r.status === 'PROCESSING').length, icon: 'pi pi-clock', color: '#eab308' },
    { label: 'إجمالي المدفوع', value: fmtNum(totalRevenue) + ' ج.م', icon: 'pi pi-wallet', color: '#f97316' },
  ]
})

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtNum(n) {
  return Number(n || 0).toLocaleString('ar-EG')
}
</script>

<style scoped>
/* Page wrapper */
.bookings-page { width: 100%; }

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(249, 115, 22, 0.35); }
.btn-primary i { font-size: 12px; }

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.mini-stat {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  transition: all 0.2s;
}
.mini-stat:hover { border-color: var(--accent); }
.mini-stat-icon {
  width: 42px; height: 42px; border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.mini-stat-icon i { font-size: 18px; color: var(--accent); }
.mini-stat-value { display: block; font-size: 18px; font-weight: 800; color: #0f172a; line-height: 1.1; }
.mini-stat-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }

/* Filters */
.filters-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.filters-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.search-box { position: relative; flex: 1; min-width: 240px; max-width: 380px; }
.search-box i.pi-search { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #94a3b8; }
.search-box input { width: 100%; height: 40px; padding: 0 40px 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #f8fafc; transition: all 0.2s; outline: none; }
.search-box input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.search-box input::placeholder { color: #94a3b8; }
.search-clear {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px; height: 24px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #94a3b8;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.search-clear:hover { background: #f1f5f9; color: #475569; }
.search-clear i { font-size: 11px; }
.filter-group { display: flex; gap: 8px; }
.date-group { margin-inline-start: auto; }

/* Table */
.table-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
.table-wrap { overflow-x: auto; }
.table-wrap::-webkit-scrollbar { height: 8px; }
.table-wrap::-webkit-scrollbar-track { background: #f8fafc; }
.table-wrap::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.data-table { width: 100%; border-collapse: collapse; min-width: max-content; }
.data-table th {
  padding: 12px 10px;
  text-align: center;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.3px;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}
.data-table th.th-balance { background: #fef2f2; color: #b91c1c; }
.data-table td {
  padding: 12px 10px;
  font-size: 12.5px;
  color: #475569;
  border-bottom: 1px solid #f8fafc;
  text-align: center;
  white-space: nowrap;
}
.table-row { transition: background 0.15s; }
.table-row:hover { background: #fafbfc; }
.data-table tr:last-child td { border-bottom: none; }

.cell-code {
  font-family: 'Courier New', monospace;
  font-weight: 800;
  color: #ea580c;
  font-size: 12.5px;
}
.cell-name { font-weight: 700; color: #0f172a; text-align: start; padding-inline-start: 14px; }
.chalet-cell { text-align: start; padding-inline-start: 4px; }
.chalet-cell strong { display: block; font-size: 12.5px; font-weight: 700; color: #0f172a; line-height: 1.3; }
.chalet-cell span { display: block; font-size: 10.5px; color: #94a3b8; font-weight: 600; margin-top: 2px; }
.cell-date { font-size: 12px; color: #475569; }
.cell-num { text-align: center; font-variant-numeric: tabular-nums; font-weight: 600; color: #1e293b; }
.cell-paid { color: #16a34a; }
.cell-balance { color: #b91c1c; font-weight: 700; }
.cell-balance.is-zero { color: #16a34a; }
.cell-pct { color: #475569; font-weight: 700; }

/* Status tag */
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}
.status-tag.st-confirmed { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-tag.st-pending { background: rgba(234, 179, 8, 0.1); color: #a16207; }
.status-tag.st-processing { background: rgba(14, 165, 233, 0.1); color: #0284c7; }
.status-tag.st-temporary { background: rgba(168, 85, 247, 0.1); color: #7c3aed; }

/* Empty state */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-state p { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 16px; border-top: 1px solid #f1f5f9; }
.pag-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #475569; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.pag-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.pag-btn.active { background: #f97316; border-color: #f97316; color: #fff; }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { margin-inline-start: 12px; font-size: 12.5px; color: #94a3b8; font-weight: 600; }

@media (max-width: 900px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .filters-row { flex-direction: column; align-items: stretch; }
  .search-box { max-width: none; }
  .date-group { margin-inline-start: 0; }
}
</style>
