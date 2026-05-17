<template>
  <div class="ops-page">
    <!-- Page header -->
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-desktop" /></div>
      <div class="page-header-text">
        <h1 class="page-title">لوحة التشغيل</h1>
        <p class="page-desc">حركة الشاليهات اليوم</p>
      </div>
      <div class="page-header-actions">
        <span class="today-chip"><i class="pi pi-calendar" /> {{ today }}</span>
        <button class="refresh-btn" :disabled="loading" @click="reload">
          <i :class="['pi', loading ? 'pi-spin pi-spinner' : 'pi-refresh']" /> تحديث
        </button>
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

    <!-- Board -->
    <div class="ops-board">
      <section
        v-for="col in columns"
        :key="col.key"
        class="ops-col"
        :class="col.key"
      >
        <header class="ops-col-head">
          <span class="ops-col-icon"><i :class="col.icon" /></span>
          <div class="ops-col-meta">
            <span class="ops-col-count">{{ lists[col.key].length }}</span>
            <span class="ops-col-label">{{ col.label }}</span>
          </div>
        </header>

        <div class="ops-col-body">
          <div v-if="loading" class="loading-inline">
            <i class="pi pi-spin pi-spinner" /> جاري التحميل...
          </div>
          <div v-else-if="!lists[col.key].length" class="ops-empty">
            <i class="pi pi-inbox" />
            <span>لا يوجد</span>
          </div>
          <div v-else class="ops-cards">
            <article
              v-for="item in lists[col.key]"
              :key="`${col.key}-${item.booking_id}`"
              class="ops-card"
            >
              <div class="ops-card-top">
                <span class="t-code">{{ item.booking_code }}</span>
                <span :class="['t-status', statusClass(item.status)]">
                  {{ statusLabel(item.status) }}
                </span>
              </div>
              <div class="ops-chalet">
                <i class="pi pi-home" />
                <span class="ops-chalet-name">{{ item.chalet_name || '—' }}</span>
                <small v-if="item.chalet_code" class="ltr">{{ item.chalet_code }}</small>
              </div>
              <div class="ops-stay">
                <span class="ops-dates">
                  {{ toDisplayDate(item.check_in) }}
                  <i class="pi pi-arrow-left" />
                  {{ toDisplayDate(item.check_out) }}
                </span>
                <span class="ops-nights">
                  <i class="pi pi-moon" /> {{ item.nights }} {{ item.nights === 1 ? 'ليلة' : 'ليالٍ' }}
                </span>
              </div>
              <div class="ops-chips">
                <span :class="['chip', item.permit_exists ? 'ok' : 'muted']">
                  <i :class="item.permit_exists ? 'pi pi-shield' : 'pi pi-clock'" />
                  {{ item.permit_exists ? 'تصريح' : 'بدون تصريح' }}
                </span>
                <span v-if="item.check_in_confirmed" class="chip ok">
                  <i class="pi pi-sign-in" /> دخول مؤكد
                </span>
                <span v-if="item.check_out_confirmed" class="chip info">
                  <i class="pi pi-sign-out" /> خروج مؤكد
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>

    <p class="ops-note">
      <i class="pi pi-info-circle" />
      قد يظهر الحجز نفسه في أكثر من عمود حسب حالته اليوم.
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate } from '@/utils/date'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const csBookings = useCsBookingsStore()
const toast = useToastStore()

const today = toDisplayDate(new Date())

const loading = ref(true)
const lists = reactive({ booked_today: [], check_in_today: [], check_out_today: [] })
const filters = reactive({ company_id: '', owner_id: '', group_id: '' })

const companies = ref([])
const owners = ref([])
const groups = ref([])

const columns = [
  { key: 'booked_today', label: 'محجوزة اليوم', icon: 'pi pi-calendar-plus' },
  { key: 'check_in_today', label: 'تسجيل دخول اليوم', icon: 'pi pi-sign-in' },
  { key: 'check_out_today', label: 'تسجيل خروج اليوم', icon: 'pi pi-sign-out' },
]

const hasActiveFilter = computed(() => Object.values(filters).some((v) => v))
const activeFilterCount = computed(() => Object.values(filters).filter((v) => !!v).length)

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

const STATUS_LABELS = {
  CONFIRMED: 'مؤكد',
  PENDING: 'قيد الانتظار',
  PROCESSING: 'قيد المعالجة',
  TEMPORARY: 'مؤقت',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغى',
  CHECKED_IN: 'مُسجَّل دخول',
  CHECKED_OUT: 'مُسجَّل خروج',
}
function statusLabel(s) { return STATUS_LABELS[s] || s || '—' }
function statusClass(s) {
  if (s === 'CONFIRMED' || s === 'CHECKED_IN' || s === 'COMPLETED') return 'ok'
  if (s === 'PENDING' || s === 'PROCESSING' || s === 'TEMPORARY') return 'pending'
  if (s === 'CANCELLED') return 'danger'
  return 'neutral'
}

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

async function reload() {
  loading.value = true
  const r = await csBookings.getOperations({ ...filters })
  loading.value = false
  if (r.ok) {
    lists.booked_today = r.data.booked_today
    lists.check_in_today = r.data.check_in_today
    lists.check_out_today = r.data.check_out_today
  } else {
    toast.error(r.error)
  }
}

function onFilterChange() { reload() }
function clearFilters() {
  filters.company_id = ''
  filters.owner_id = ''
  filters.group_id = ''
  reload()
}

onMounted(async () => {
  await Promise.all([loadLookups(), reload()])
})
</script>

<style scoped>
.ops-page { display: flex; flex-direction: column; gap: 16px; }

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

.page-header-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.today-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 13px; border-radius: 999px;
  background: #f1f5f9; color: #475569;
  font-size: 12.5px; font-weight: 700; white-space: nowrap;
}
.today-chip i { font-size: 12px; color: #94a3b8; }
.refresh-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c; color: #fff;
  font-family: inherit; font-size: 13px; font-weight: 700;
  cursor: pointer; box-shadow: 0 2px 10px rgba(249, 115, 22, 0.30);
  transition: all 0.15s;
}
.refresh-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.40); }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.refresh-btn i { font-size: 12px; }

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
  padding: 8px 14px; border-radius: 9px;
  background: #fff; border: 1px solid #fecaca; color: #ef4444;
  font-size: 12.5px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.clear-btn:hover { background: #fef2f2; }

.filter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; align-items: end; }
.filter-field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.filter-field label { font-size: 11.5px; font-weight: 700; color: #64748b; }

/* ── Kanban board ── */
.ops-board { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start; }
.ops-col {
  --c: #64748b;
  --ct: rgba(100, 116, 139, 0.10);
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}
.ops-col.booked_today { --c: #ea580c; --ct: rgba(249, 115, 22, 0.12); }
.ops-col.check_in_today { --c: #059669; --ct: rgba(16, 185, 129, 0.12); }
.ops-col.check_out_today { --c: #0284c7; --ct: rgba(14, 165, 233, 0.12); }

.ops-col-head {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 16px 14px;
  background: var(--ct);
  border-bottom: 1px solid #f1f5f9;
}
.ops-col-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: inline-flex; align-items: center; justify-content: center;
  background: #fff;
  color: var(--c);
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
}
.ops-col-icon i { font-size: 17px; }
.ops-col-meta { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ops-col-count { font-size: 22px; font-weight: 900; color: var(--c); line-height: 1.1; }
.ops-col-label { font-size: 12px; font-weight: 700; color: #64748b; }

.ops-col-body { padding: 14px; max-height: 62vh; overflow-y: auto; scrollbar-width: thin; }
.ops-col-body::-webkit-scrollbar { width: 4px; }
.ops-col-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

.loading-inline { padding: 30px 12px; text-align: center; color: #64748b; font-size: 13px; }
.loading-inline i { margin-left: 6px; color: #f97316; }
.ops-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 30px 12px; text-align: center; color: #94a3b8; font-size: 13px;
  background: #fafbfc; border: 1px dashed #e2e8f0; border-radius: 12px;
}
.ops-empty i { font-size: 24px; color: #cbd5e1; }

.ops-cards { display: flex; flex-direction: column; gap: 10px; }
.ops-card {
  border: 1px solid #f1f5f9;
  border-inline-start: 3px solid var(--c);
  border-radius: 12px;
  padding: 12px 14px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 9px;
  transition: box-shadow 0.15s, transform 0.15s;
}
.ops-card:hover { box-shadow: 0 4px 14px rgba(15, 23, 42, 0.07); transform: translateY(-1px); }
.ops-card-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.t-code { font-size: 14px; font-weight: 900; color: #0f172a; direction: ltr; }
.t-status {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 999px;
  font-size: 11px; font-weight: 800; white-space: nowrap;
}
.t-status.ok { background: rgba(16, 185, 129, 0.10); color: #047857; }
.t-status.pending { background: rgba(234, 179, 8, 0.12); color: #b45309; }
.t-status.danger { background: rgba(239, 68, 68, 0.10); color: #b91c1c; }
.t-status.neutral { background: rgba(100, 116, 139, 0.12); color: #475569; }

.ops-chalet { display: flex; align-items: center; gap: 7px; min-width: 0; }
.ops-chalet i { font-size: 12px; color: #94a3b8; flex-shrink: 0; }
.ops-chalet-name { font-weight: 800; color: #0f172a; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ops-chalet small { font-size: 11px; color: #94a3b8; font-weight: 700; flex-shrink: 0; }
.ltr { direction: ltr; text-align: start; }

.ops-stay { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
.ops-dates {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; color: #475569;
}
.ops-dates i { font-size: 10px; color: var(--c); }
.ops-nights {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px;
  background: var(--ct); color: var(--c);
  font-size: 11px; font-weight: 800; white-space: nowrap;
}
.ops-nights i { font-size: 10px; }

.ops-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px;
  font-size: 10.5px; font-weight: 700; border: 1px solid transparent;
}
.chip i { font-size: 10px; }
.chip.ok { background: rgba(16, 185, 129, 0.10); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.info { background: rgba(14, 165, 233, 0.12); color: #0369a1; border-color: rgba(14, 165, 233, 0.22); }
.chip.muted { background: #f8fafc; color: #94a3b8; border-color: #f1f5f9; }

.ops-note {
  display: inline-flex; align-items: center; gap: 6px;
  margin: 0; font-size: 12px; color: #94a3b8; font-weight: 600;
}
.ops-note i { font-size: 12px; color: #cbd5e1; }

@media (max-width: 900px) {
  .filter-grid { grid-template-columns: 1fr 1fr; }
  .ops-board { grid-template-columns: 1fr; }
  .ops-col-body { max-height: none; }
  .page-header { flex-wrap: wrap; }
}
</style>
