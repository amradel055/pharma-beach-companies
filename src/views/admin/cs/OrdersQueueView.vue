<template>
  <div class="orders-page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-list" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الحجوزات</h1>
        <p class="page-desc">قائمة حجوزات القرية وتصاريحها</p>
      </div>
      <RouterLink to="/village-bookings/new" class="btn-confirm page-header-action">
        <i class="pi pi-plus" /> حجز جديد
      </RouterLink>
    </div>

    <!-- Stats row — from GET /v1/bookings/stats, filtered same as the table -->
    <div class="stats-row mo-stagger">
      <div class="stat-card">
        <div class="stat-icon orange"><i class="pi pi-bookmark" /></div>
        <div class="stat-body">
          <span class="stat-label">إجمالي الحجوزات</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ animStats.total_bookings }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber"><i class="pi pi-clock" /></div>
        <div class="stat-body">
          <span class="stat-label">قيد الانتظار</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ animStats.pending }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="pi pi-check-circle" /></div>
        <div class="stat-body">
          <span class="stat-label">تصاريح مؤكدة</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ animStats.confirmed_permits }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="pi pi-moon" /></div>
        <div class="stat-body">
          <span class="stat-label">إجمالي الليالي</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ animStats.total_nights }}</strong>
        </div>
      </div>
    </div>

    <!-- Filter section -->
    <section class="bf-section">
      <div class="bf-section-head">
        <h4 class="bf-section-title">
          <i class="pi pi-filter" /> تصفية
          <span v-if="hasActiveFilter" class="bf-counter">{{ activeFilterCount }} نشط</span>
        </h4>
        <button v-if="hasActiveFilter" class="clear-btn" @click="clearFilters">
          <i class="pi pi-times" /> مسح
        </button>
      </div>
      <div class="filter-grid">
        <div class="filter-field">
          <label>الشركة</label>
          <AppDropdown
            v-model="filters.company_id"
            :options="companyOptions"
            placeholder="كل الشركات"
            empty-text="لا توجد شركات"
            @change="onFilterChange"
          />
        </div>
        <div class="filter-field">
          <label>المالك</label>
          <AppDropdown
            v-model="filters.owner_id"
            :options="ownerOptions"
            placeholder="كل الملاك"
            empty-text="لا يوجد ملاك"
            @change="onFilterChange"
          />
        </div>
        <div class="filter-field">
          <label>المجموعة</label>
          <AppDropdown
            v-model="filters.group_id"
            :options="groupOptions"
            placeholder="كل المجموعات"
            empty-text="لا توجد مجموعات"
            @change="onFilterChange"
          />
        </div>

        <!-- Permit-status filter — sent to the API as ?permit_filter= -->
        <div class="filter-field">
          <label>حالة التصريح</label>
          <AppDropdown
            v-model="permitFilter"
            :options="permitOptions"
            @change="onFilterChange"
          />
        </div>

        <div class="filter-field filter-field-range">
          <label>الفترة</label>
          <DateRangePicker
            v-model:from="filters.check_in"
            v-model:to="filters.check_out"
            @change="onFilterChange"
          />
        </div>
      </div>
    </section>

    <!-- List section -->
    <section class="bf-section">
      <div class="bf-section-head">
        <h4 class="bf-section-title">
          <i class="pi pi-clipboard" /> النتائج
          <span class="bf-counter">{{ total }}</span>
        </h4>
      </div>

      <div v-if="loading" class="loading-inline">
        <i class="pi pi-spin pi-spinner" /> جاري التحميل...
      </div>

      <div v-else-if="!rows.length" class="empty-state">
        <div class="empty-icon"><i class="pi pi-search" /></div>
        <h3>لا توجد نتائج</h3>
        <p v-if="hasActiveFilter || permitFilter !== ''">جرّب تعديل عوامل التصفية</p>
        <p v-else>لا توجد حجوزات حالياً</p>
        <RouterLink to="/village-bookings/new" class="btn-confirm">
          <i class="pi pi-plus" /> إنشاء حجز جديد
        </RouterLink>
      </div>

      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th>كود الحجز</th>
              <th>الشاليه</th>
              <th>الإقامة</th>
              <th>التصريح</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.id"
              class="p-row"
            >
              <td>
                <span class="t-code">{{ row.booking_code }}</span>
              </td>
              <td>
                <div class="t-chalet">
                  <span class="t-chalet-name">{{ row.chalet_name }}</span>
                  <small v-if="row.chalet_code" class="t-chalet-code">{{ row.chalet_code }}</small>
                </div>
              </td>
              <td>
                <div class="t-stay">
                  <span class="t-dates">
                    {{ toDisplayDate(row.check_in) }}
                    <i class="pi pi-arrow-left" />
                    {{ toDisplayDate(row.check_out) }}
                  </span>
                  <span class="t-nights">
                    <i class="pi pi-moon" /> {{ row.nights }} {{ row.nights === 1 ? 'ليلة' : 'ليالٍ' }}
                  </span>
                </div>
              </td>
              <td>
                <span :class="['t-status', 'status-anim', row.permit_exists ? 'ok' : 'pending']">
                  <i :class="row.permit_exists ? 'pi pi-check-circle' : 'pi pi-clock'" />
                  {{ row.permit_exists ? 'تصريح مؤكد' : 'قيد الانتظار' }}
                </span>
              </td>
              <td class="act-col">
                <div class="row-actions">
                  <RouterLink
                    v-if="row.permit_exists && canViewPermit"
                    :to="{ name: 'admin-village-booking-permit', params: { id: row.id } }"
                    class="act-btn permit"
                    title="عرض التصريح"
                    aria-label="عرض التصريح"
                  >
                    <i class="pi pi-print" />
                  </RouterLink>
                  <button
                    v-else-if="!row.permit_exists && canConfirmPermit"
                    type="button"
                    class="act-btn confirm"
                    :disabled="confirmingId === row.id"
                    title="تأكيد التصريح"
                    aria-label="تأكيد التصريح"
                    @click="handleConfirmPermit(row)"
                  >
                    <i v-if="confirmingId === row.id" class="pi pi-spin pi-spinner" />
                    <i v-else class="pi pi-check" />
                  </button>

                  <RouterLink
                    :to="{ name: 'admin-village-booking-details', params: { id: row.id } }"
                    class="act-btn view"
                    title="عرض التفاصيل"
                    aria-label="عرض التفاصيل"
                  >
                    <i class="pi pi-eye" />
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppPagination
        :current-page="currentPage"
        :last-page="lastPage"
        :total="total"
        :range-from="rangeFrom"
        :range-to="rangeTo"
        @change="goToPage"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES } from '@/constants/roles'
import { toDisplayDate } from '@/utils/date'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const csBookings = useCsBookingsStore()
const toast = useToastStore()
const { hasRole } = usePermissions()

// Permit actions are gated to CS_VILLAGE / HEAD_CS_VILLAGE / FINANCIAL_MEMBER
// (same gate as the PermitView route). Other roles just see "فتح".
const canConfirmPermit = computed(() =>
  hasRole(ROLES.CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.FINANCIAL_MEMBER),
)
const canViewPermit = canConfirmPermit

const loading = ref(true)
const rows = ref([])
const confirmingId = ref('')

const filters = reactive({
  company_id: '',
  owner_id: '',
  group_id: '',
  check_in: '',
  check_out: '',
})

// Permit status filter — sent as ?permit_filter=  (0 انتظار / 1 مؤكد / 2 منهي / 3 ملغى)
const permitFilter = ref('')
const permitOptions = [
  { value: '', label: 'الكل' },
  { value: 0, label: 'انتظار' },
  { value: 1, label: 'مؤكد' },
  { value: 2, label: 'منهي' },
  { value: 3, label: 'ملغى' },
]

// Pagination — 1-indexed end-to-end (the store mirrors the Laravel paginator).
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const perPage = ref(10)
const rangeFrom = ref(0)
const rangeTo = ref(0)

const hasActiveFilter = computed(() => Object.values(filters).some((v) => v))
const activeFilterCount = computed(() => Object.values(filters).filter((v) => !!v).length)

// Stats come from GET /v1/bookings/stats with the same filters as the table.
const statsLoading = ref(false)
const stats = ref({ total_bookings: 0, pending: 0, confirmed_permits: 0, total_nights: 0 })

// Count-up: animate the displayed numbers toward the real stats.
const animStats = reactive({ total_bookings: 0, pending: 0, confirmed_permits: 0, total_nights: 0 })
let statsRaf = null
function tweenStats(target) {
  cancelAnimationFrame(statsRaf)
  const start = { ...animStats }
  const t0 = performance.now()
  const dur = 650
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur)
    const e = 1 - Math.pow(1 - p, 3) // easeOutCubic
    for (const k of Object.keys(target)) {
      animStats[k] = Math.round(start[k] + ((target[k] || 0) - start[k]) * e)
    }
    if (p < 1) statsRaf = requestAnimationFrame(step)
  }
  statsRaf = requestAnimationFrame(step)
}
watch(stats, (s) => tweenStats(s), { deep: true })
onBeforeUnmount(() => cancelAnimationFrame(statsRaf))

const companies = ref([])
const owners = ref([])
const groups = ref([])

const companyOptions = computed(() => [
  { value: '', label: 'كل الشركات' },
  ...companies.value.map((c) => ({ value: c.id, label: c.name })),
])
const ownerOptions = computed(() => [
  { value: '', label: 'كل الملاك' },
  ...owners.value.map((o) => ({ value: o.id, label: o.name })),
])
const groupOptions = computed(() => [
  { value: '', label: 'كل المجموعات' },
  ...groups.value.map((g) => ({ value: g.id, label: g.name })),
])

async function loadLookups() {
  const [c, o, g] = await Promise.all([
    csBookings.listCompanies(),
    csBookings.listOwners(),
    csBookings.listGroups(),
  ])
  if (c.ok) companies.value = c.data
  if (o.ok) owners.value = o.data
  if (g.ok) groups.value = g.data
}

async function loadStats() {
  statsLoading.value = true
  const r = await csBookings.getBookingStats({
    company_id: filters.company_id,
    owner_id: filters.owner_id,
    group_id: filters.group_id,
    check_in: filters.check_in,
    check_out: filters.check_out,
    permit_filter: permitFilter.value,
  })
  statsLoading.value = false
  if (r.ok) stats.value = r.data
}

// Pull the current page from the API. `resetPage=true` is used by filter
// handlers — any filter change should bring the user back to page 1.
async function reloadList({ resetPage = false } = {}) {
  if (resetPage) currentPage.value = 1
  loading.value = true
  const r = await csBookings.listBookingsSlim({
    page: currentPage.value,
    ...filters,
    permit_filter: permitFilter.value,
  })
  loading.value = false
  if (r.ok) {
    rows.value = r.data.rows
    currentPage.value = r.data.page || 1
    lastPage.value = r.data.lastPage || 1
    perPage.value = r.data.perPage
    total.value = r.data.total
    rangeFrom.value = r.data.from
    rangeTo.value = r.data.to
  } else {
    toast.error(r.error)
  }
}

function onFilterChange() {
  reloadList({ resetPage: true })
  loadStats()
}

function goToPage(p) {
  if (p < 1 || p > lastPage.value || p === currentPage.value) return
  currentPage.value = p
  reloadList()
}

function clearFilters() {
  filters.company_id = ''
  filters.owner_id = ''
  filters.group_id = ''
  filters.check_in = ''
  filters.check_out = ''
  permitFilter.value = ''
  reloadList({ resetPage: true })
  loadStats()
}

// Inline permit confirmation — same call as the booking-detail screen, so
// users don't have to open every row to confirm.
async function handleConfirmPermit(row) {
  if (!row?.id || confirmingId.value) return
  confirmingId.value = row.id
  const r = await csBookings.confirmPermit(row.id)
  confirmingId.value = ''
  if (r.ok) {
    toast.success('تم تأكيد التصريح بنجاح')
    const idx = rows.value.findIndex((x) => x.id === row.id)
    if (idx !== -1) rows.value[idx] = { ...rows.value[idx], permit_exists: true }
    loadStats()
  } else {
    toast.error(r.error)
  }
}

onMounted(async () => {
  await Promise.all([loadLookups(), reloadList(), loadStats()])
})
</script>

<style scoped>
.orders-page { display: flex; flex-direction: column; gap: 16px; }

/* ── Page header ── */
.page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
.page-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.page-icon i { font-size: 22px; }
.page-header-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }
.page-header-action { flex-shrink: 0; }
.btn-confirm {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
  transition: all 0.15s;
}
.btn-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }

/* ── Stats ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-skeleton {
  display: block;
  width: 52px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: stat-shimmer 1.2s ease-in-out infinite;
}
@keyframes stat-shimmer {
  0% { background-position: 100% 0; }
  100% { background-position: 0 0; }
}
.stat-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease, border-color 0.28s ease;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.11);
  border-color: #e2e8f0;
}
/* Sheen that sweeps across on hover */
.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 45%;
  background: linear-gradient(105deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  transform: skewX(-18deg) translateX(-260%);
  pointer-events: none;
  z-index: 2;
}
.stat-card:hover::before {
  transition: transform 0.7s ease;
  transform: skewX(-18deg) translateX(380%);
}
.stat-icon {
  position: relative;
  width: 44px; height: 44px;
  border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
/* Soft pulsing glow halo — always running, gentle */
.stat-icon::after {
  content: '';
  position: absolute;
  inset: -6px;
  z-index: 0;
  border-radius: 50%;
  background: radial-gradient(closest-side, currentColor, transparent 72%);
  opacity: 0;
  animation: statGlow 3s ease-in-out infinite;
}
@keyframes statGlow {
  0%, 100% { opacity: 0; transform: scale(0.85); }
  50% { opacity: 0.3; transform: scale(1.05); }
}
.stat-card:hover .stat-icon { transform: scale(1.1) rotate(-4deg); }
.stat-icon i {
  position: relative;
  z-index: 1;
  font-size: 17px;
  display: inline-block;
  animation: statFloat 3.6s ease-in-out infinite;
}
@keyframes statFloat {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-2.5px) scale(1.07); }
}
.stat-value {
  font-variant-numeric: tabular-nums;
}
/* Phase-offset each card's loop so the row breathes, not pulses in sync */
.stats-row .stat-card:nth-child(2) .stat-icon::after,
.stats-row .stat-card:nth-child(2) .stat-icon i { animation-delay: 0.45s; }
.stats-row .stat-card:nth-child(3) .stat-icon::after,
.stats-row .stat-card:nth-child(3) .stat-icon i { animation-delay: 0.9s; }
.stats-row .stat-card:nth-child(4) .stat-icon::after,
.stats-row .stat-card:nth-child(4) .stat-icon i { animation-delay: 1.35s; }
.stat-icon.orange { background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 191, 36, 0.14)); color: #ea580c; }
.stat-icon.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(52, 211, 153, 0.14)); color: #059669; }
.stat-icon.amber { background: linear-gradient(135deg, rgba(234, 179, 8, 0.14), rgba(251, 191, 36, 0.14)); color: #b45309; }
.stat-icon.blue { background: linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(56, 189, 248, 0.14)); color: #0284c7; }
.stat-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.stat-label { font-size: 11.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }

/* ── Section card ── */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
}
.bf-section-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 800; color: #0f172a; margin: 0;
}
.bf-section-title i { color: #f97316; }
.bf-counter {
  margin-inline-start: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.clear-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 9px;
  background: #fff;
  border: 1px solid #fecaca;
  color: #ef4444;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.clear-btn:hover { background: #fef2f2; }

/* ── Filter grid ── */
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1.4fr;
  gap: 12px;
  align-items: end;
}
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.filter-field label { font-size: 11.5px; font-weight: 700; color: #64748b; }
.filter-field-range { min-width: 220px; }

/* ── Row actions ── */
/* Rows are no longer click-to-open — navigation is via the عرض button only. */
.p-row { cursor: default; }
.row-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: nowrap;
}
.row-actions > * {
  flex-shrink: 0;
}

/* Icon-only action buttons */
.act-btn {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.16s ease, box-shadow 0.16s ease,
    background 0.16s ease, border-color 0.16s ease, color 0.16s ease;
}
.act-btn i { font-size: 19px; line-height: 1; }
.act-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.1);
}
.act-btn:active { transform: translateY(0); }
.act-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Variants */
.act-btn.view:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #0f172a;
}
.act-btn.permit {
  color: #ea580c;
  border-color: rgba(249, 115, 22, 0.32);
  background: rgba(249, 115, 22, 0.06);
}
.act-btn.permit:hover {
  background: rgba(249, 115, 22, 0.14);
  border-color: #f97316;
}
.act-btn.confirm {
  color: #059669;
  border-color: rgba(16, 185, 129, 0.32);
  background: rgba(16, 185, 129, 0.07);
}
.act-btn.confirm:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
}

/* ── Animated status badge ── */
.status-anim {
  animation: statusPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes statusPop {
  from { opacity: 0; transform: scale(0.7); }
  to { opacity: 1; transform: scale(1); }
}
/* Pending permits gently pulse to draw attention; confirmed stays calm. */
.status-anim.pending i {
  animation: statusPulse 1.8s ease-in-out infinite;
  transform-origin: center;
}
@keyframes statusPulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.18); opacity: 0.65; }
}

@media (max-width: 900px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .status-anim,
  .status-anim.pending i,
  .stat-icon::after,
  .stat-icon i { animation: none; }
  .stat-icon::after,
  .stat-card::before { display: none; }
  .stat-card,
  .stat-icon { transition: none; }
}
</style>
