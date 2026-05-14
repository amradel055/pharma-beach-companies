<template>
  <div class="orders-page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-list" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الحجوزات</h1>
        <p class="page-desc">قائمة حجوزات القرية</p>
      </div>
      <RouterLink to="/admin/village-bookings/new" class="btn-confirm page-header-action">
        <i class="pi pi-plus" /> حجز جديد
      </RouterLink>
    </div>

    <!-- Stats row -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon orange"><i class="pi pi-bookmark" /></div>
        <div class="stat-body">
          <span class="stat-label">إجمالي الحجوزات</span>
          <strong class="stat-value">{{ stats.total }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="pi pi-check-circle" /></div>
        <div class="stat-body">
          <span class="stat-label">تصاريح مؤكدة</span>
          <strong class="stat-value">{{ stats.confirmed }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber"><i class="pi pi-clock" /></div>
        <div class="stat-body">
          <span class="stat-label">قيد الانتظار</span>
          <strong class="stat-value">{{ stats.pending }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="pi pi-moon" /></div>
        <div class="stat-body">
          <span class="stat-label">إجمالي الليالي</span>
          <strong class="stat-value">{{ stats.nights }}</strong>
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
          <span class="bf-counter">{{ filteredRows.length }}</span>
        </h4>
      </div>

      <div v-if="loading" class="loading-inline">
        <i class="pi pi-spin pi-spinner" /> جاري التحميل...
      </div>

      <div v-else-if="!filteredRows.length" class="empty-state">
        <div class="empty-icon"><i class="pi pi-search" /></div>
        <h3>لا توجد نتائج</h3>
        <p v-if="hasActiveFilter">جرّب تعديل عوامل التصفية</p>
        <p v-else>لا توجد حجوزات حالياً</p>
        <RouterLink to="/admin/village-bookings/new" class="btn-confirm">
          <i class="pi pi-plus" /> إنشاء حجز جديد
        </RouterLink>
      </div>

      <div v-else class="row-list">
        <button
          v-for="row in filteredRows"
          :key="row.id"
          type="button"
          class="row-card"
          @click="openBooking(row.id)"
        >
          <div class="row-leading">
            <div class="row-avatar"><i class="pi pi-home" /></div>
            <div class="row-id">
              <span class="row-code">{{ row.booking_code }}</span>
              <span class="row-chalet">
                {{ row.chalet_name }}
                <small v-if="row.chalet_code" class="row-chalet-code">· {{ row.chalet_code }}</small>
              </span>
            </div>
          </div>

          <div class="row-meta">
            <span class="row-chip dates">
              <i class="pi pi-calendar" />
              {{ toDisplayDate(row.check_in) }}
              <i class="pi pi-arrow-left tiny" />
              {{ toDisplayDate(row.check_out) }}
            </span>
            <span class="row-chip nights">
              <i class="pi pi-moon" /> {{ row.nights }} {{ row.nights === 1 ? 'ليلة' : 'ليالٍ' }}
            </span>
            <span :class="['row-chip', 'permit', row.permit_exists ? 'ok' : 'pending']">
              <i :class="row.permit_exists ? 'pi pi-shield' : 'pi pi-clock'" />
              {{ row.permit_exists ? 'تصريح مؤكد' : 'تصريح قيد الانتظار' }}
            </span>
          </div>

          <i class="pi pi-chevron-left row-chev" />
        </button>
      </div>

      <!-- Pagination — always shown when there are rows. Internal & display
           values are both 1-based; the store applies the -1 offset to the wire
           request since the API page param is 0-based. -->
      <div v-if="!loading && filteredRows.length" class="pagination">
        <div class="pagination-info">
          عرض {{ rangeFrom }} – {{ rangeTo }} من {{ total }}
        </div>
        <div class="pagination-controls">
          <button
            class="page-btn nav"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
            aria-label="السابق"
          >
            <i class="pi pi-chevron-right" />
          </button>

          <button
            v-if="pageWindow[0] > 1"
            class="page-btn"
            @click="goToPage(1)"
          >1</button>
          <span v-if="pageWindow[0] > 2" class="page-ellipsis">…</span>

          <button
            v-for="p in pageWindow"
            :key="p"
            :class="['page-btn', { active: p === currentPage }]"
            @click="goToPage(p)"
          >{{ p }}</button>

          <span v-if="pageWindow[pageWindow.length - 1] < lastPage - 1" class="page-ellipsis">…</span>
          <button
            v-if="pageWindow[pageWindow.length - 1] < lastPage"
            class="page-btn"
            @click="goToPage(lastPage)"
          >{{ lastPage }}</button>

          <button
            class="page-btn nav"
            :disabled="currentPage === lastPage"
            @click="goToPage(currentPage + 1)"
            aria-label="التالي"
          >
            <i class="pi pi-chevron-left" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate } from '@/utils/date'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'

const router = useRouter()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

const loading = ref(true)
const filteredRows = ref([])
const filters = reactive({
  company_id: '',
  owner_id: '',
  group_id: '',
  check_in: '',
  check_out: '',
})

// Pagination — 1-indexed end-to-end. The Laravel paginator returns
// current_page/last_page as 1-based numbers and accepts `page` as 1-based,
// so we just mirror those values. `lastPage` is the TOTAL number of pages
// (e.g. 3 means pages 1, 2, 3; lastPage===1 means a single page → controls hidden).
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const perPage = ref(10)
const rangeFrom = ref(0)
const rangeTo = ref(0)

const hasActiveFilter = computed(() => Object.values(filters).some((v) => v))
const activeFilterCount = computed(() => Object.values(filters).filter((v) => !!v).length)

// Sliding window of 1-based page numbers around the current page.
const pageWindow = computed(() => {
  const last = lastPage.value
  const cur = currentPage.value
  const span = 2
  let start = Math.max(1, cur - span)
  let end = Math.min(last, cur + span)
  if (end - start < span * 2) {
    if (start === 1) end = Math.min(last, start + span * 2)
    else if (end === last) start = Math.max(1, end - span * 2)
  }
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const stats = computed(() => {
  const rows = filteredRows.value
  return {
    total: total.value, // server-provided across all pages
    confirmed: rows.filter((r) => r.permit_exists).length,
    pending: rows.filter((r) => !r.permit_exists).length,
    nights: rows.reduce((s, r) => s + Number(r.nights || 0), 0),
  }
})

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

// Pull the current page from the API. `resetPage=true` is used by filter
// handlers — any filter change should bring the user back to page 1 so they
// don't end up on a non-existent page after the result set shrinks.
async function reloadFiltered({ resetPage = false } = {}) {
  if (resetPage) currentPage.value = 1
  loading.value = true
  // The API uses 0-based `page` query params (page=0 is the first page) like its
  // sibling list endpoints. But the response is a Laravel paginator whose
  // current_page/last_page are 1-based by convention. So we keep the UI 1-based
  // and subtract 1 only when sending.
  const r = await csBookings.listBookingsSlim({ page: currentPage.value - 1, ...filters })
  loading.value = false
  if (r.ok) {
    filteredRows.value = r.data.rows
    // Trust the response (1-based current_page / last_page).
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

function onFilterChange() { reloadFiltered({ resetPage: true }) }

function goToPage(p) {
  if (p < 1 || p > lastPage.value || p === currentPage.value) return
  currentPage.value = p
  reloadFiltered()
}

function clearFilters() {
  filters.company_id = ''
  filters.owner_id = ''
  filters.group_id = ''
  filters.check_in = ''
  filters.check_out = ''
  currentPage.value = 1
  reloadFiltered({ resetPage: true })
}

function openBooking(id) {
  router.push({ name: 'admin-village-booking-details', params: { id } })
}

onMounted(async () => {
  await Promise.all([loadLookups(), reloadFiltered()])
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

/* ── Stats row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.stat-card:hover { border-color: #e2e8f0; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06); }
.stat-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-icon i { font-size: 17px; }
.stat-icon.orange { background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 191, 36, 0.14)); color: #ea580c; }
.stat-icon.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(52, 211, 153, 0.14)); color: #059669; }
.stat-icon.amber { background: linear-gradient(135deg, rgba(234, 179, 8, 0.14), rgba(251, 191, 36, 0.14)); color: #b45309; }
.stat-icon.blue { background: linear-gradient(135deg, rgba(14, 165, 233, 0.14), rgba(56, 189, 248, 0.14)); color: #0284c7; }
.stat-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.stat-label { font-size: 11.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }

/* ── Section card (matches BookingFormView convention) ── */
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
  grid-template-columns: 1fr 1fr 1fr 1.4fr;
  gap: 12px;
  align-items: end;
}
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.filter-field label { font-size: 11.5px; font-weight: 700; color: #64748b; }
.filter-field-range { min-width: 220px; }

/* ── Row list (replaces table) ── */
.row-list { display: flex; flex-direction: column; gap: 8px; }
.row-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  cursor: pointer;
  font-family: inherit;
  text-align: right;
  width: 100%;
  transition: all 0.15s;
}
.row-card:hover {
  border-color: #fed7aa;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.12);
  transform: translateY(-1px);
}

.row-leading { display: flex; align-items: center; gap: 12px; min-width: 0; flex-shrink: 0; }
.row-avatar {
  width: 40px; height: 40px;
  border-radius: 11px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.10), rgba(251, 191, 36, 0.10));
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.row-avatar i { font-size: 16px; }
.row-id { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.row-code { font-size: 14px; font-weight: 800; color: #0f172a; direction: ltr; }
.row-chalet { font-size: 12.5px; color: #64748b; font-weight: 600; }
.row-chalet-code { color: #94a3b8; direction: ltr; }

.row-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  flex: 1;
  justify-content: flex-end;
}

.row-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}
.row-chip i { font-size: 10.5px; }
.row-chip i.tiny { font-size: 9px; opacity: 0.6; }

.row-chip.dates {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  color: #475569;
}

.row-chip.nights {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border: 1px solid #ea580c;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}
.row-chip.nights i { color: #fff; }

.row-chip.permit.ok {
  background: rgba(16, 185, 129, 0.12);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.22);
}
.row-chip.permit.pending {
  background: rgba(234, 179, 8, 0.12);
  color: #b45309;
  border: 1px solid rgba(234, 179, 8, 0.22);
}

.row-chev { color: #cbd5e1; font-size: 14px; flex-shrink: 0; transition: transform 0.15s; }
.row-card:hover .row-chev { color: #f97316; transform: translateX(-3px); }

/* ── States ── */
.loading-inline {
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
  font-size: 13.5px;
}
.loading-inline i { font-size: 16px; margin-left: 8px; color: #f97316; }

.empty-state {
  padding: 50px 20px;
  text-align: center;
  color: #64748b;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.empty-icon {
  width: 60px; height: 60px;
  border-radius: 16px;
  background: #f1f5f9;
  color: #cbd5e1;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}
.empty-icon i { font-size: 24px; }
.empty-state h3 { font-size: 16px; font-weight: 800; color: #475569; margin: 0; }
.empty-state p { font-size: 13px; margin: 0; }
.empty-state .btn-confirm { margin-top: 8px; }

/* ── Pagination ── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.pagination-info {
  font-size: 12.5px;
  color: #64748b;
  font-weight: 600;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.active) {
  border-color: #fed7aa;
  color: #f97316;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-btn.active {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.page-btn.nav i { font-size: 12px; }
.page-ellipsis {
  padding: 0 4px;
  color: #cbd5e1;
  font-weight: 700;
}

@media (max-width: 900px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .row-card { flex-wrap: wrap; }
  .row-meta { justify-content: flex-start; }
}

@media (max-width: 540px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .row-meta .row-chip { font-size: 11px; }
}
</style>
