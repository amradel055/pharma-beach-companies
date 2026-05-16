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

      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th class="idx-col">#</th>
              <th>اسم الشاليه</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ch, i) in chalets"
              :key="ch.id"
              class="p-row"
              @click="openChalet(ch.id)"
            >
              <td class="idx-col">{{ rangeFrom + i }}</td>
              <td>
                <div class="t-chalet">
                  <span class="t-chalet-avatar"><i class="pi pi-home" /></span>
                  <span class="t-chalet-name">{{ ch.name }}</span>
                </div>
              </td>
              <td class="act-col">
                <span class="t-open">
                  عرض التفاصيل <i class="pi pi-chevron-left" />
                </span>
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
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

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
  const r = await csBookings.listChalets({
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

function openChalet(id) {
  router.push({ name: 'admin-village-booking-chalet', params: { id } })
}

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


@media (max-width: 900px) {
  .filter-grid { grid-template-columns: 1fr 1fr; }
}
</style>
