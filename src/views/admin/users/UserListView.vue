<template>
  <div class="users-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-users" /></div>
      <div class="page-header-text">
        <h1 class="page-title">المستخدمين</h1>
        <p class="page-desc">إدارة فريق العمل وأعضاء النظام</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة عضو
      </button>
    </div>

    <section class="bf-section">
      <div class="bf-section-head">
        <h4 class="bf-section-title">
          <i class="pi pi-search" /> البحث
        </h4>
      </div>
      <input
        v-model="searchInput"
        type="search"
        class="search-input"
        placeholder="ابحث بالاسم أو البريد أو الهاتف..."
        @input="onSearch"
      />
    </section>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-users" />
        <p>لا توجد نتائج</p>
      </div>

      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th>اسم المستخدم</th>
              <th>البريد الإلكتروني</th>
              <th>الهاتف</th>
              <th>الحالة</th>
              <th>الأدوار</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="p-row">
              <td><span class="t-strong">{{ row.user_name || '—' }}</span></td>
              <td class="t-ltr">{{ row.email || '—' }}</td>
              <td class="t-ltr">{{ row.phone_number || '—' }}</td>
              <td>
                <span :class="['t-status', statusTone(row.account_status)]">
                  {{ statusLabel(row.account_status) }}
                </span>
              </td>
              <td>
                <div class="role-chips">
                  <span v-for="r in row.roles || []" :key="r.code" class="role-chip">
                    {{ r.name || r.code }}
                  </span>
                  <span v-if="!(row.roles || []).length" class="t-dash">—</span>
                </div>
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

    <!-- Create modal -->
    <AppModal
      v-model="createOpen"
      title="إضافة عضو جديد"
      icon="pi pi-user-plus"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="md"
    >
      <form class="form-grid two-col" @submit.prevent="handleCreate">
        <label class="field">
          <span class="field-label">اسم المستخدم <span class="req">*</span></span>
          <input v-model="createForm.user_name" type="text" class="field-input" required minlength="2" maxlength="50" />
        </label>
        <label class="field">
          <span class="field-label">البريد الإلكتروني <span class="req">*</span></span>
          <input v-model="createForm.email" type="email" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">رقم الهاتف <span class="req">*</span></span>
          <input v-model="createForm.phone_number" type="text" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">كلمة المرور <span class="req">*</span></span>
          <input v-model="createForm.password" type="password" class="field-input ltr" required minlength="6" />
        </label>
        <div class="field">
          <span class="field-label">الحالة</span>
          <AppDropdown v-model="createForm.account_status" :options="statusOptions" />
        </div>
        <div class="field span-2">
          <span class="field-label">الدور <span class="req">*</span></span>
          <AppDropdown
            v-model="createForm.role_id"
            :options="roleOptions"
            placeholder="اختر دوراً"
            empty-text="لا توجد أدوار"
          />
          <small v-if="!createForm.role_id" class="hint-error">اختر دوراً</small>
        </div>
        <div class="form-actions span-2">
          <button type="button" class="btn-cancel" @click="createOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="createSaving || !canCreate">
            <i v-if="createSaving" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-plus" />
            إضافة
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Edit modal -->
    <AppModal
      v-model="editOpen"
      title="تعديل العضو"
      subtitle="تعديل بيانات العضو ودوره"
      icon="pi pi-user-edit"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="md"
    >
      <form class="form-grid two-col" @submit.prevent="handleEdit">
        <label class="field">
          <span class="field-label">اسم المستخدم <span class="req">*</span></span>
          <input v-model="editForm.user_name" type="text" class="field-input" required minlength="2" maxlength="50" />
        </label>
        <label class="field">
          <span class="field-label">البريد الإلكتروني <span class="req">*</span></span>
          <input v-model="editForm.email" type="email" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">رقم الهاتف <span class="req">*</span></span>
          <input v-model="editForm.phone_number" type="text" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">كلمة المرور</span>
          <input
            v-model="editForm.password"
            type="password"
            class="field-input ltr"
            minlength="6"
            placeholder="اتركه فارغاً لعدم التغيير"
          />
        </label>
        <div class="field">
          <span class="field-label">الحالة</span>
          <AppDropdown v-model="editForm.account_status" :options="statusOptions" />
        </div>
        <div class="field span-2">
          <span class="field-label">الدور <span class="req">*</span></span>
          <AppDropdown
            v-model="editForm.role_id"
            :options="roleOptions"
            placeholder="اختر دوراً"
            empty-text="لا توجد أدوار"
          />
          <small v-if="!editForm.role_id" class="hint-error">اختر دوراً</small>
        </div>
        <div class="form-actions span-2">
          <button type="button" class="btn-cancel" @click="editOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="editSaving || !canEdit">
            <i v-if="editSaving" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-check" />
            حفظ التغييرات
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Delete confirm -->
    <AppModal
      v-model="deleteOpen"
      title="حذف العضو؟"
      subtitle="لا يمكن التراجع عن هذا الإجراء"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">هل أنت متأكد من حذف <strong>{{ pendingDelete?.user_name || pendingDelete?.email }}</strong>؟</p>
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
import { useAdminMembersStore } from '@/stores/adminMembers'
import { useRolesStore } from '@/stores/roles'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const membersStore = useAdminMembersStore()
const rolesStore = useRolesStore()
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

const allRoles = ref([])

// Roles lookup is fetched lazily — only when a modal that needs it opens
// (not on page mount). Memoized so repeated opens don't refetch; a failed
// attempt clears the cache so the next open retries.
const rolesLoaded = ref(false)
let rolesInflight = null
async function ensureRoles() {
  if (rolesLoaded.value) return
  if (!rolesInflight) rolesInflight = rolesStore.listAll()
  const resp = await rolesInflight
  if (resp.ok) {
    allRoles.value = resp.data
    rolesLoaded.value = true
  } else {
    rolesInflight = null
    toast.error(resp.error)
  }
}

const statusOptions = [
  { value: 'ACTIVE', label: 'نشط' },
  { value: 'SUSPENDED', label: 'موقوف' },
  { value: 'PERMANENT_SUSPENDED', label: 'موقوف نهائياً' },
]

const roleOptions = computed(() => allRoles.value.map((r) => ({ value: r.id, label: r.name || r.code })))

function statusLabel(s) {
  return { ACTIVE: 'نشط', SUSPENDED: 'موقوف', PERMANENT_SUSPENDED: 'موقوف نهائياً' }[s] || s || '—'
}
function statusTone(s) {
  return { ACTIVE: 'ok', SUSPENDED: 'pending', PERMANENT_SUSPENDED: 'danger' }[s] || 'neutral'
}

async function load() {
  loading.value = true
  const r = await membersStore.list({ page: currentPage.value, limit: 10, search: search.value })
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

// Debounced search (300ms per spec)
let searchTimer = null
function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    search.value = searchInput.value.trim()
    currentPage.value = 1
    load()
  }, 300)
}

// Create form
const createOpen = ref(false)
const createSaving = ref(false)
const createForm = reactive({
  user_name: '', email: '', phone_number: '', password: '',
  account_status: 'ACTIVE', role_id: '',
})
const canCreate = computed(() =>
  createForm.user_name && createForm.email && createForm.phone_number && createForm.password && createForm.role_id
)

function resetCreate() {
  createForm.user_name = ''
  createForm.email = ''
  createForm.phone_number = ''
  createForm.password = ''
  createForm.account_status = 'ACTIVE'
  createForm.role_id = ''
}

function openCreate() {
  resetCreate()
  createOpen.value = true
  ensureRoles()
}


async function handleCreate() {
  if (!canCreate.value) return
  createSaving.value = true
  const payload = {
    user_name: createForm.user_name,
    email: createForm.email,
    phone_number: createForm.phone_number,
    password: createForm.password,
    account_status: createForm.account_status,
    role_ids: [createForm.role_id],
  }
  const r = await membersStore.create(payload)
  createSaving.value = false
  if (r.ok) {
    toast.created('العضو')
    createOpen.value = false
    await load()
  } else {
    toast.error(r.error)
  }
}

// Edit form — mirrors the create form's elements. A member has a single
// role; password is optional here (blank = keep current password).
const editOpen = ref(false)
const editSaving = ref(false)
const editTarget = ref(null)
const editForm = reactive({
  user_name: '', email: '', phone_number: '', password: '',
  account_status: 'ACTIVE', role_id: '',
})

const canEdit = computed(() =>
  editForm.user_name && editForm.email && editForm.phone_number && editForm.role_id,
)

async function openEdit(row) {
  editTarget.value = row
  editForm.user_name = row.user_name || ''
  editForm.email = row.email || ''
  editForm.phone_number = row.phone_number || ''
  editForm.password = ''
  editForm.account_status = row.account_status || 'ACTIVE'
  editForm.role_id = ''
  editOpen.value = true
  // List rows carry role codes (no UUID); resolve the real role id from the
  // roles lookup by matching the first role's code/name. Load it lazily.
  await ensureRoles()
  const first = (row.roles || [])[0]
  if (first?.id) {
    editForm.role_id = first.id
  } else {
    const code = String(first?.code || first?.name || '').toUpperCase()
    const match = allRoles.value.find(
      (x) =>
        String(x.code || '').toUpperCase() === code ||
        String(x.name || '').toUpperCase() === code,
    )
    editForm.role_id = match?.id || ''
  }
}

async function handleEdit() {
  if (!editTarget.value || !canEdit.value) return
  editSaving.value = true
  const payload = {
    user_name: editForm.user_name,
    email: editForm.email,
    phone_number: editForm.phone_number,
    account_status: editForm.account_status,
    role_id: editForm.role_id,
  }
  if (editForm.password) payload.password = editForm.password
  const r = await membersStore.update(editTarget.value.id, payload)
  editSaving.value = false
  if (r.ok) {
    toast.updated('العضو')
    editOpen.value = false
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
  const r = await membersStore.remove(pendingDelete.value.id)
  deleting.value = false
  if (r.ok) {
    toast.deleted('العضو')
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
.users-page { display: flex; flex-direction: column; gap: 16px; }
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
.bf-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; }
.bf-section-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; }
.bf-section-title i { color: #f97316; }

.search-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fafbfc;
  font-size: 13.5px;
  font-family: inherit;
  color: #0f172a;
}
.search-input:focus { outline: none; border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }

.role-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.role-chip {
  display: inline-flex; padding: 3px 9px;
  background: rgba(14, 165, 233, 0.08);
  color: #0369a1;
  border: 1px solid rgba(14, 165, 233, 0.22);
  border-radius: 999px;
  font-size: 11px; font-weight: 700;
}

.empty {
  padding: 40px 20px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty i.pi-spin { color: #f97316; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }

.form-grid { display: flex; flex-direction: column; gap: 12px; }
.form-grid.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-grid.two-col .field.span-2 { grid-column: 1 / -1; }
.form-grid.two-col .form-actions.span-2 { grid-column: 1 / -1; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: #64748b; }
.field-label .req { color: #ef4444; }
.field-input {
  padding: 10px 12px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff;
  font-size: 13.5px; font-family: inherit; color: #0f172a;
}
.field-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
.hint { font-size: 11.5px; color: #94a3b8; }
.hint-error { font-size: 11.5px; color: #ef4444; }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }
</style>
