<template>
  <div class="permits-page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-id-card" /></div>
      <div class="page-header-text">
        <h1 class="page-title">التصاريح</h1>
        <p class="page-desc">إدارة تصاريح دخول حجوزات القرية</p>
      </div>
    </div>

    <!-- Stats row — from GET /v1/bookings/stats, filtered same as the table -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon orange"><i class="pi pi-bookmark" /></div>
        <div class="stat-body">
          <span class="stat-label">إجمالي الحجوزات</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ stats.total_bookings }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon amber"><i class="pi pi-clock" /></div>
        <div class="stat-body">
          <span class="stat-label">قيد الانتظار</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ stats.pending }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i class="pi pi-check-circle" /></div>
        <div class="stat-body">
          <span class="stat-label">تصاريح مؤكدة</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ stats.confirmed_permits }}</strong>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i class="pi pi-moon" /></div>
        <div class="stat-body">
          <span class="stat-label">إجمالي الليالي</span>
          <span v-if="statsLoading" class="stat-skeleton" />
          <strong v-else class="stat-value">{{ stats.total_nights }}</strong>
        </div>
      </div>
    </div>

    <!-- Filter section — matches Screen 2 spec for /v1/bookings-list -->
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

        <!-- Permit-status filter — sent to the API as ?status= -->
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
          <i class="pi pi-id-card" /> النتائج
          <span class="bf-counter">{{ visibleRows.length }}</span>
        </h4>
      </div>

      <div v-if="loading" class="loading-inline">
        <i class="pi pi-spin pi-spinner" /> جاري التحميل...
      </div>

      <div v-else-if="!visibleRows.length" class="empty-state">
        <div class="empty-icon"><i class="pi pi-search" /></div>
        <h3>لا توجد تصاريح</h3>
        <p v-if="hasActiveFilter || permitFilter !== ''">جرّب تعديل عوامل التصفية</p>
        <p v-else>لا توجد حجوزات حالياً</p>
      </div>

      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th>كود الحجز</th>
              <th>الشاليه</th>
              <th>الإقامة</th>
              <th>الحالة</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in visibleRows"
              :key="row.id"
              class="p-row"
              @click="openBooking(row.id)"
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
                <span :class="['t-status', row.permit_exists ? 'ok' : 'pending']">
                  <i :class="row.permit_exists ? 'pi pi-check-circle' : 'pi pi-clock'" />
                  {{ row.permit_exists ? 'تصريح مؤكد' : 'قيد الانتظار' }}
                </span>
              </td>
              <td class="act-col" @click.stop>
                <RouterLink
                  v-if="row.permit_exists && canViewPermit"
                  :to="{ name: 'admin-village-booking-permit', params: { id: row.id } }"
                  class="t-btn view"
                >
                  <i class="pi pi-print" /> عرض التصريح
                </RouterLink>
                <button
                  v-else-if="!row.permit_exists && canConfirmPermit"
                  type="button"
                  class="t-btn confirm"
                  :disabled="confirmingId === row.id"
                  @click="handleConfirmPermit(row)"
                >
                  <i v-if="confirmingId === row.id" class="pi pi-spin pi-spinner" />
                  <i v-else class="pi pi-check" />
                  تأكيد التصريح
                </button>
                <RouterLink
                  v-else
                  :to="{ name: 'admin-village-booking-details', params: { id: row.id } }"
                  class="t-btn ghost"
                >
                  فتح <i class="pi pi-chevron-left" />
                </RouterLink>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES } from '@/constants/roles'
import { toDisplayDate } from '@/utils/date'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import DateRangePicker from '@/components/ui/DateRangePicker.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const router = useRouter()
const csBookings = useCsBookingsStore()
const toast = useToastStore()
const { hasRole } = usePermissions()

// Per spec, "Confirm Permit" is gated to CS_VILLAGE / HEAD_CS_VILLAGE / FINANCIAL_MEMBER.
// "View Permit" uses the same role gate as the PermitView route.
const canConfirmPermit = computed(() =>
  hasRole(ROLES.CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.FINANCIAL_MEMBER),
)
const canViewPermit = computed(() =>
  hasRole(ROLES.CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.FINANCIAL_MEMBER),
)

const loading = ref(true)
const rows = ref([])
const confirmingId = ref('')

// API filters — match the /v1/bookings-list query params from the spec.
const filters = reactive({
  company_id: '',
  owner_id: '',
  group_id: '',
  check_in: '',
  check_out: '',
})

// Permit status filter — booking status codes: 0 انتظار / 1 مؤكد / 2 منهي / 3 ملغى
const permitFilter = ref('')
const permitOptions = [
  { value: '', label: 'الكل' },
  { value: 0, label: 'انتظار' },
  { value: 1, label: 'مؤكد' },
  { value: 2, label: 'منهي' },
  { value: 3, label: 'ملغى' },
]

const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const rangeFrom = ref(0)
const rangeTo = ref(0)

const hasActiveFilter = computed(() => Object.values(filters).some((v) => v))
const activeFilterCount = computed(() => Object.values(filters).filter((v) => !!v).length)

// Status filtering is done server-side (sent as ?status=); the table just
// renders whatever the API returns.
const visibleRows = computed(() => rows.value)

// Stats come from GET /v1/bookings/stats with the same filters as the table.
const statsLoading = ref(false)
const stats = ref({ total_bookings: 0, pending: 0, confirmed_permits: 0, total_nights: 0 })

async function loadStats() {
  statsLoading.value = true
  const r = await csBookings.getBookingStats({
    company_id: filters.company_id,
    owner_id: filters.owner_id,
    group_id: filters.group_id,
    check_in: filters.check_in,
    check_out: filters.check_out,
    status: permitFilter.value,
  })
  statsLoading.value = false
  if (r.ok) stats.value = r.data
}

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

async function reloadList({ resetPage = false } = {}) {
  if (resetPage) currentPage.value = 1
  loading.value = true
  const r = await csBookings.listBookingsSlim({ page: currentPage.value, ...filters, status: permitFilter.value })
  loading.value = false
  if (r.ok) {
    rows.value = r.data.rows
    currentPage.value = r.data.page || 1
    lastPage.value = r.data.lastPage || 1
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

function openBooking(id) {
  router.push({ name: 'admin-village-booking-details', params: { id } })
}

// Inline permit confirmation — same call as the booking-detail screen, so
// users don't have to open every row to confirm.
async function handleConfirmPermit(row) {
  if (!row?.id || confirmingId.value) return
  confirmingId.value = row.id
  const r = await csBookings.confirmPermit(row.id)
  confirmingId.value = ''
  if (r.ok) {
    toast.success('تم تأكيد التصريح')
    const idx = rows.value.findIndex((x) => x.id === row.id)
    if (idx !== -1) rows.value[idx] = { ...rows.value[idx], permit_exists: true }
  } else {
    toast.error(r.error)
  }
}

onMounted(async () => {
  await Promise.all([loadLookups(), reloadList(), loadStats()])
})
</script>

<style scoped>
.permits-page { display: flex; flex-direction: column; gap: 16px; }

/* Page header */
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

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

/* Skeleton shown in place of the value while stats refetch */
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
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
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

/* Section */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 14px; gap: 10px;
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

/* Filter grid */
.filter-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.4fr auto;
  gap: 12px;
  align-items: end;
}
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.filter-field label { font-size: 11.5px; font-weight: 700; color: #64748b; }
.filter-field-range { min-width: 220px; }
.filter-field-pills { min-width: 0; }


@media (max-width: 900px) {
  .stats-row { grid-template-columns: 1fr 1fr; }
  .filter-grid { grid-template-columns: 1fr 1fr; }
}
</style>
