<template>
  <div class="chalets-page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-home" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الشاليهات</h1>
        <p class="page-desc">قائمة شاليهات القرية</p>
      </div>
    </div>

    <!-- Filters -->
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
      </div>
    </section>

    <!-- List -->
    <section class="bf-section">
      <div class="bf-section-head">
        <h4 class="bf-section-title">
          <i class="pi pi-list" /> النتائج
          <span class="bf-counter">{{ total }}</span>
        </h4>
      </div>

      <div v-if="loading" class="loading-inline">
        <i class="pi pi-spin pi-spinner" /> جاري التحميل...
      </div>

      <div v-else-if="!chalets.length" class="empty-state">
        <div class="empty-icon"><i class="pi pi-inbox" /></div>
        <h3>لا توجد شاليهات</h3>
        <p v-if="hasActiveFilter">جرّب تعديل عوامل التصفية</p>
      </div>

      <div v-else class="row-list">
        <button
          v-for="ch in chalets"
          :key="ch.id"
          type="button"
          class="row-card"
          @click="openChalet(ch.id)"
        >
          <div class="row-leading">
            <div class="row-avatar"><i class="pi pi-home" /></div>
            <div class="row-id">
              <span class="row-name">{{ ch.name }}</span>
              <span class="row-sub">
                <span v-if="ch.chalet_number">رقم {{ ch.chalet_number }}</span>
                <span v-if="ch.chalet_code" class="ltr"> · {{ ch.chalet_code }}</span>
              </span>
            </div>
          </div>

          <div class="row-meta">
            <span v-if="ch.village?.name" class="row-chip village">
              <i class="pi pi-map-marker" /> {{ ch.village.name }}
            </span>
            <span class="row-chip price">
              <i class="pi pi-tag" /> {{ fmtNum(ch.price) }} ج.م / ليلة
            </span>
            <span :class="['row-chip', 'status', ch.status?.toLowerCase()]">
              <i :class="ch.status === 'AVAILABLE' ? 'pi pi-check-circle' : 'pi pi-ban'" />
              {{ statusLabel(ch.status) }}
            </span>
          </div>

          <i class="pi pi-chevron-left row-chev" />
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="!loading && chalets.length" class="pagination">
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

          <button v-if="pageWindow[0] > 1" class="page-btn" @click="goToPage(1)">1</button>
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
import AppDropdown from '@/components/ui/AppDropdown.vue'

const router = useRouter()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

const loading = ref(true)
const chalets = ref([])
const filters = reactive({
  company_id: '',
  owner_id: '',
  group_id: '',
})

const hasActiveFilter = computed(() => Object.values(filters).some((v) => v))
const activeFilterCount = computed(() => Object.values(filters).filter((v) => !!v).length)

// Pagination — 1-based UI; store handles the -1 conversion to the API.
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const rangeFrom = ref(0)
const rangeTo = ref(0)
const PAGE_SIZE = 10

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

async function reload({ resetPage = false } = {}) {
  if (resetPage) currentPage.value = 1
  loading.value = true
  const r = await csBookings.listAvailableChaletsDetail({
    page: currentPage.value,
    limit: PAGE_SIZE,
    company_id: filters.company_id,
    owner_id: filters.owner_id,
    group_id: filters.group_id,
  })
  loading.value = false
  if (r.ok) {
    chalets.value = r.data?.rows || []
    currentPage.value = r.data?.page ?? 1
    lastPage.value = r.data?.lastPage ?? 1
    total.value = r.data?.total ?? chalets.value.length
    rangeFrom.value = r.data?.from ?? 0
    rangeTo.value = r.data?.to ?? chalets.value.length
  } else {
    toast.error(r.error)
  }
}

function onFilterChange() { reload({ resetPage: true }) }

function goToPage(p) {
  if (p < 1 || p > lastPage.value || p === currentPage.value) return
  currentPage.value = p
  reload()
}

function clearFilters() {
  filters.company_id = ''
  filters.owner_id = ''
  filters.group_id = ''
  reload({ resetPage: true })
}

function statusLabel(s) {
  return {
    AVAILABLE: 'متاح',
    UNAVAILABLE: 'غير متاح',
    SOLD: 'مباع',
    RESERVED: 'محجوز',
  }[s] || s || '—'
}

function openChalet(id) {
  router.push({ name: 'admin-village-booking-chalet', params: { id } })
}

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }

onMounted(async () => {
  await Promise.all([loadLookups(), reload()])
})
</script>

<style scoped>
.chalets-page { display: flex; flex-direction: column; gap: 16px; }

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

/* Section card */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; }
.bf-section-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; }
.bf-section-title i { color: #f97316; }
.bf-counter { margin-inline-start: 6px; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }

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
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  align-items: end;
}
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.filter-field label { font-size: 11.5px; font-weight: 700; color: #64748b; }

/* Row list */
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
.row-name { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.row-sub { font-size: 12.5px; color: #64748b; font-weight: 600; display: inline-flex; gap: 4px; align-items: center; }
.row-sub .ltr { direction: ltr; color: #94a3b8; }

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
  border: 1px solid transparent;
}
.row-chip i { font-size: 10.5px; }

.row-chip.village { background: #f8fafc; border-color: #f1f5f9; color: #475569; }
.row-chip.village i { color: #94a3b8; }

.row-chip.price {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 191, 36, 0.08));
  color: #c2410c;
  border-color: rgba(249, 115, 22, 0.22);
}
.row-chip.price i { color: #ea580c; }

.row-chip.status.available { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.row-chip.status.unavailable { background: rgba(239, 68, 68, 0.10); color: #b91c1c; border-color: rgba(239, 68, 68, 0.22); }
.row-chip.status.sold,
.row-chip.status.reserved { background: rgba(100, 116, 139, 0.12); color: #475569; border-color: rgba(100, 116, 139, 0.22); }

.row-chev { color: #cbd5e1; font-size: 14px; flex-shrink: 0; transition: transform 0.15s; }
.row-card:hover .row-chev { color: #f97316; transform: translateX(-3px); }

/* Loading + empty */
.loading-inline { padding: 40px 20px; text-align: center; color: #64748b; font-size: 13.5px; }
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

/* Pagination */
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
.pagination-info { font-size: 12.5px; color: #64748b; font-weight: 600; }
.pagination-controls { display: flex; align-items: center; gap: 4px; }
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
.page-btn:hover:not(:disabled):not(.active) { border-color: #fed7aa; color: #f97316; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn.active {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.page-btn.nav i { font-size: 12px; }
.page-ellipsis { padding: 0 4px; color: #cbd5e1; font-weight: 700; }

@media (max-width: 900px) {
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .row-card { flex-wrap: wrap; }
  .row-meta { justify-content: flex-start; }
}
</style>
