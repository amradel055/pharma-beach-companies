<template>
  <div class="owners-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-user" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الملاك</h1>
        <p class="page-desc">إدارة قائمة الملاك وحالاتهم</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة مالك
      </button>
    </div>

    <section class="bf-section">
      <input
        v-model="searchInput"
        type="search"
        class="search-input"
        placeholder="ابحث بالاسم أو الهاتف..."
        @input="onSearch"
      />
    </section>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-user" />
        <p>لا توجد نتائج</p>
      </div>
      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الهاتف</th>
              <th>هاتف بديل</th>
              <th>الحالة</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="p-row">
              <td><span class="t-strong">{{ row.name }}</span></td>
              <td class="t-ltr">{{ row.phone || '—' }}</td>
              <td class="t-ltr">{{ row.alternative_phone || '—' }}</td>
              <td>
                <span :class="['t-status', statusTone(row.account_status)]">
                  {{ statusLabel(row.account_status) }}
                </span>
              </td>
              <td class="act-col">
                <span class="t-actions">
                  <button class="icon-btn edit" @click="openEdit(row)"><i class="pi pi-pencil" /></button>
                  <button class="icon-btn delete" @click="confirmDelete(row)"><i class="pi pi-trash" /></button>
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

    <!-- Create/Edit -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل المالك' : 'إضافة مالك'"
      icon="pi pi-user"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="md"
    >
      <form class="form-grid two-col" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">الاسم <span class="req">*</span></span>
          <input v-model="form.name" type="text" class="field-input" required />
        </label>
        <label class="field">
          <span class="field-label">الهاتف <span class="req">*</span></span>
          <input v-model="form.phone" type="text" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">هاتف بديل</span>
          <input v-model="form.alternative_phone" type="text" class="field-input ltr" />
        </label>
        <div class="field">
          <span class="field-label">الحالة</span>
          <AppDropdown v-model="form.account_status" :options="statusOptions" />
        </div>
        <label class="field span-2">
          <span class="field-label">العنوان</span>
          <input v-model="form.address" type="text" class="field-input" />
        </label>
        <div v-if="editing && willSuspend" class="warning span-2">
          <i class="pi pi-exclamation-triangle" />
          <span>إيقاف هذا المالك سيمنع ظهوره في قوائم الحجز الجديدة.</span>
        </div>
        <div class="form-actions span-2">
          <button type="button" class="btn-cancel" @click="formOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.name || !form.phone">
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
      title="حذف المالك؟"
      subtitle="حذف ناعم — لن يظهر في القوائم النشطة"
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
import { useOwnersStore } from '@/stores/owners'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const ownersStore = useOwnersStore()
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
function statusTone(s) {
  return { ACTIVE: 'ok', SUSPENDED: 'pending', PERMANENT_SUSPENDED: 'danger' }[s] || 'neutral'
}

async function load() {
  loading.value = true
  const r = await ownersStore.list({ page: currentPage.value, limit: 10, search: search.value })
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

// Form
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({
  name: '', phone: '', alternative_phone: '', address: '', account_status: 'ACTIVE',
})

const willSuspend = computed(() =>
  editing.value && form.account_status !== 'ACTIVE' && editing.value.account_status === 'ACTIVE'
)

function resetForm() {
  form.name = ''
  form.phone = ''
  form.alternative_phone = ''
  form.address = ''
  form.account_status = 'ACTIVE'
}

function openCreate() { editing.value = null; resetForm(); formOpen.value = true }

function openEdit(row) {
  editing.value = row
  form.name = row.name || ''
  form.phone = row.phone || ''
  form.alternative_phone = row.alternative_phone || ''
  form.address = row.address || ''
  form.account_status = row.account_status || 'ACTIVE'
  formOpen.value = true
}

async function handleSubmit() {
  if (!form.name || !form.phone) return
  saving.value = true
  const payload = { ...form }
  const r = editing.value
    ? await ownersStore.update(editing.value.id, payload)
    : await ownersStore.create(payload)
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
  const r = await ownersStore.remove(pendingDelete.value.id)
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
.owners-page { display: flex; flex-direction: column; gap: 16px; }
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
  cursor: pointer; box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
  transition: all 0.15s;
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

.empty {
  padding: 40px 20px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty i.pi-spin { color: #f97316; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }

.form-grid { display: flex; flex-direction: column; gap: 12px; }
.form-grid.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-grid.two-col .field.span-2, .form-grid.two-col .form-actions.span-2, .form-grid.two-col .warning.span-2 { grid-column: 1 / -1; }
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
</style>
