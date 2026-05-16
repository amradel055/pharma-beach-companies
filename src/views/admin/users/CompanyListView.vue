<template>
  <div class="companies-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-briefcase" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الشركات</h1>
        <p class="page-desc">إدارة الشركات والأرصدة</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة شركة
      </button>
    </div>

    <section class="bf-section">
      <input
        v-model="searchInput"
        type="search"
        class="search-input"
        placeholder="ابحث باسم الشركة أو الهاتف..."
        @input="onSearch"
      />
    </section>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-briefcase" />
        <p>لا توجد شركات</p>
      </div>
      <div v-else class="row-list">
        <div
          v-for="row in rows"
          :key="row.id"
          class="row-card"
        >
          <button class="row-leading" @click="openDetail(row.id)">
            <div class="row-avatar"><i class="pi pi-briefcase" /></div>
            <div class="row-id">
              <span class="row-name">{{ row.name }}</span>
              <span class="row-phone ltr">{{ row.phone_number || '—' }}</span>
            </div>
          </button>
          <div class="row-meta">
            <span class="row-chip balance">
              <i class="pi pi-wallet" />
              {{ fmt(row.balance) }} ج.م
            </span>
            <span :class="['row-chip status', (row.account_status || 'ACTIVE').toLowerCase()]">
              <i :class="row.account_status === 'ACTIVE' ? 'pi pi-circle-fill tiny' : 'pi pi-circle tiny'" />
              {{ statusLabel(row.account_status) }}
            </span>
          </div>
          <div class="row-actions">
            <button class="icon-btn edit" @click="openEdit(row)"><i class="pi pi-pencil" /></button>
            <button class="icon-btn delete" @click="confirmDelete(row)"><i class="pi pi-trash" /></button>
          </div>
        </div>
      </div>

      <div v-if="!loading && rows.length && lastPage > 1" class="pagination">
        <div class="pagination-info">عرض {{ rangeFrom }} – {{ rangeTo }} من {{ total }}</div>
        <div class="pagination-controls">
          <button class="page-btn nav" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"><i class="pi pi-chevron-right" /></button>
          <button v-for="p in pageWindow" :key="p" :class="['page-btn', { active: p === currentPage }]" @click="goToPage(p)">{{ p }}</button>
          <button class="page-btn nav" :disabled="currentPage === lastPage" @click="goToPage(currentPage + 1)"><i class="pi pi-chevron-left" /></button>
        </div>
      </div>
    </section>

    <!-- Create / Edit -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل الشركة' : 'إضافة شركة'"
      icon="pi pi-briefcase"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="sm"
    >
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">الاسم <span class="req">*</span></span>
          <input v-model="form.name" type="text" class="field-input" required />
        </label>
        <label class="field">
          <span class="field-label">رقم الهاتف</span>
          <input v-model="form.phone_number" type="text" class="field-input ltr" />
        </label>
        <div class="field">
          <span class="field-label">الحالة</span>
          <AppDropdown v-model="form.account_status" :options="statusOptions" />
        </div>
        <div v-if="editing && willDeactivate" class="warning">
          <i class="pi pi-exclamation-triangle" />
          <span>تعطيل الشركة سيمنع ظهورها في قوائم الحجز الجديدة.</span>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="formOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.name">
            <i v-if="saving" class="pi pi-spin pi-spinner" />
            <i v-else :class="editing ? 'pi pi-check' : 'pi pi-plus'" />
            {{ editing ? 'حفظ' : 'إضافة' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Delete confirm -->
    <AppModal
      v-model="deleteOpen"
      title="حذف الشركة؟"
      subtitle="حذف ناعم — لن تظهر في القوائم النشطة"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">هل أنت متأكد من حذف <strong>{{ pendingDelete?.name }}</strong>؟</p>
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="deleteOpen = false">إلغاء</button>
        <button type="button" class="btn-danger" :disabled="deleting" @click="handleDelete">
          <i v-if="deleting" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-trash" /> حذف
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCompaniesStore } from '@/stores/companies'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const router = useRouter()
const companiesStore = useCompaniesStore()
const toast = useToastStore()

const rows = ref([])
const loading = ref(true)
const searchInput = ref('')
const search = ref('')
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const rangeFrom = ref(0)
const rangeTo = ref(0)

const statusOptions = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'SUSPENDED', label: 'موقوف' },
  { value: 'PERMANENT_SUSPENDED', label: 'موقوف نهائياً' },
]

function statusLabel(s) {
  return { ACTIVE: 'نشط', SUSPENDED: 'موقوف', PERMANENT_SUSPENDED: 'موقوف نهائياً' }[s] || s || '—'
}
function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

const pageWindow = computed(() => {
  const last = lastPage.value
  const cur = currentPage.value
  const span = 2
  const start = Math.max(1, cur - span)
  const end = Math.min(last, cur + span)
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

async function load() {
  loading.value = true
  const r = await companiesStore.list({ page: currentPage.value, limit: 10, search: search.value })
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

function goToPage(p) {
  if (p < 1 || p > lastPage.value || p === currentPage.value) return
  currentPage.value = p
  load()
}

let searchTimer = null
function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = searchInput.value.trim()
    currentPage.value = 1
    load()
  }, 300)
}

function openDetail(id) {
  router.push({ name: 'admin-company-detail', params: { id } })
}

// Form
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ name: '', phone_number: '', account_status: 'ACTIVE' })

const willDeactivate = computed(() =>
  editing.value && form.account_status !== 'ACTIVE' && editing.value.account_status === 'ACTIVE'
)

function openCreate() {
  editing.value = null
  form.name = ''
  form.phone_number = ''
  form.account_status = 'ACTIVE'
  formOpen.value = true
}

function openEdit(row) {
  editing.value = row
  form.name = row.name || ''
  form.phone_number = row.phone_number || ''
  form.account_status = row.account_status || 'ACTIVE'
  formOpen.value = true
}

async function handleSubmit() {
  if (!form.name) return
  saving.value = true
  const payload = { ...form }
  const r = editing.value
    ? await companiesStore.update(editing.value.id, payload)
    : await companiesStore.create(payload)
  saving.value = false
  if (r.ok) {
    toast.success(editing.value ? 'تم التحديث' : 'تمت الإضافة')
    formOpen.value = false
    await load()
  } else {
    toast.error(r.error)
  }
}

// Delete
const deleteOpen = ref(false)
const pendingDelete = ref(null)
const deleting = ref(false)

function confirmDelete(row) { pendingDelete.value = row; deleteOpen.value = true }

async function handleDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  const r = await companiesStore.remove(pendingDelete.value.id)
  deleting.value = false
  if (r.ok) {
    toast.success('تم الحذف')
    deleteOpen.value = false
    pendingDelete.value = null
    await load()
  } else {
    toast.error(r.error)
  }
}

onMounted(load)
</script>

<style scoped>
.companies-page { display: flex; flex-direction: column; gap: 16px; }
.page-header { display: flex; align-items: center; gap: 14px; }
.page-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.page-icon i { font-size: 22px; }
.page-header-text { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c; color: #fff;
  font-family: inherit; font-size: 13.5px; font-weight: 700;
  cursor: pointer; box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35); transition: all 0.15s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { padding: 9px 18px; border-radius: 9px; background: #fff; border: 1px solid #e2e8f0; color: #64748b; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
.btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-danger {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 9px;
  background: linear-gradient(135deg, #ef4444, #dc2626); border: 1px solid #dc2626; color: #fff;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.30);
}
.btn-danger:hover:not(:disabled) { transform: translateY(-1px); }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.bf-section {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.search-input {
  width: 100%; padding: 10px 14px;
  border-radius: 10px; border: 1px solid #e2e8f0; background: #fafbfc;
  font-size: 13.5px; font-family: inherit; color: #0f172a;
}
.search-input:focus { outline: none; border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }

.row-list { display: flex; flex-direction: column; gap: 8px; }
.row-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
  transition: all 0.15s;
}
.row-card:hover { border-color: #fed7aa; box-shadow: 0 4px 14px rgba(249, 115, 22, 0.10); }

.row-leading {
  display: flex; align-items: center; gap: 12px;
  flex: 1; min-width: 0;
  background: none; border: none; cursor: pointer; text-align: right;
  font-family: inherit; padding: 0;
}
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
.row-name { font-size: 14px; font-weight: 800; color: #0f172a; }
.row-phone { font-size: 12.5px; color: #64748b; }
.row-leading:hover .row-name { color: #ea580c; }

.row-meta { display: flex; flex-wrap: wrap; gap: 6px; }
.row-chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px; font-weight: 700;
  border: 1px solid;
}
.row-chip i { font-size: 10.5px; }
.row-chip i.tiny { font-size: 7px; }
.row-chip.balance {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.10), rgba(251, 191, 36, 0.10));
  border-color: rgba(249, 115, 22, 0.30); color: #c2410c;
}
.row-chip.status.active { background: rgba(16, 185, 129, 0.10); color: #047857; border-color: rgba(16, 185, 129, 0.25); }
.row-chip.status.suspended { background: rgba(249, 115, 22, 0.10); color: #c2410c; border-color: rgba(249, 115, 22, 0.25); }
.row-chip.status.permanent_suspended { background: rgba(239, 68, 68, 0.10); color: #b91c1c; border-color: rgba(239, 68, 68, 0.25); }

.row-actions { display: flex; gap: 4px; }
.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: #fff; border: 1px solid #e2e8f0; color: #64748b;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.icon-btn.edit:hover { border-color: #fed7aa; color: #ea580c; }
.icon-btn.delete:hover { border-color: #fecaca; color: #ef4444; }
.icon-btn i { font-size: 13px; }

.empty {
  padding: 40px 20px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty i.pi-spin { color: #f97316; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }

.form-grid { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: #64748b; }
.field-label .req { color: #ef4444; }
.field-input {
  padding: 10px 12px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff;
  font-size: 13.5px; font-family: inherit; color: #0f172a;
}
.field-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }

.warning {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(234, 179, 8, 0.10);
  border: 1px solid rgba(234, 179, 8, 0.30);
  color: #b45309;
  border-radius: 10px;
  font-size: 12.5px; font-weight: 600;
}
.warning i { font-size: 13px; }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }

.pagination {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  margin-top: 14px; padding-top: 14px; border-top: 1px solid #f1f5f9; flex-wrap: wrap;
}
.pagination-info { font-size: 12.5px; color: #64748b; font-weight: 600; }
.pagination-controls { display: flex; align-items: center; gap: 4px; }
.page-btn {
  min-width: 34px; height: 34px; padding: 0 10px; border-radius: 9px;
  border: 1px solid #e2e8f0; background: #fff; color: #475569;
  font-size: 13px; font-weight: 700; font-family: inherit;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.page-btn:hover:not(:disabled):not(.active) { border-color: #fed7aa; color: #f97316; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn.active {
  background: linear-gradient(135deg, #f97316, #ea580c); border-color: transparent;
  color: #fff; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.page-btn.nav i { font-size: 12px; }
</style>
