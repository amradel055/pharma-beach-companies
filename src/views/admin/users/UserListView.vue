<template>
  <div class="users-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">إدارة المستخدمين</h1>
        <p class="page-desc">إنشاء وإدارة حسابات المستخدمين الداخليين للنظام</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" />
        إضافة مستخدم
      </button>
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
          <input v-model="search" type="text" placeholder="بحث بالاسم أو التليفون..." />
          <button v-if="search" class="search-clear" @click="search = ''">
            <i class="pi pi-times" />
          </button>
        </div>

        <div class="filter-group">
          <AppDropdown
            v-model="filterRole"
            :options="[{ value: '', label: 'كل الأدوار' }, ...filterableRoles]"
            placeholder="كل الأدوار"
          />
          <AppDropdown
            v-model="filterStatus"
            :options="statusOptions"
            placeholder="كل الحالات"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="paginatedUsers.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-users" /></div>
        <h3>لا يوجد مستخدمين</h3>
        <p>{{ search || filterRole || filterStatus ? 'لم يتم العثور على نتائج مطابقة' : 'لم يتم إضافة مستخدمين بعد' }}</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>المستخدم</th>
            <th>التليفون</th>
            <th>الدور</th>
            <th>الحالة</th>
            <th>تاريخ الإنشاء</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id" class="table-row">
            <td>
              <div class="user-cell">
                <div class="user-cell-avatar" :style="{ background: avatarColor(user.role) }">
                  {{ user.name?.charAt(0) }}
                </div>
                <div class="user-cell-info">
                  <span class="user-cell-name">{{ user.name }}</span>
                  <span class="user-cell-email">{{ user.email || '—' }}</span>
                </div>
              </div>
            </td>
            <td class="cell-phone">{{ user.phone }}</td>
            <td>
              <span class="role-tag" :style="{ '--tag-color': roleColorMap(user.role) }">
                {{ roleLabel(user.role) }}
              </span>
            </td>
            <td>
              <button
                :class="['status-toggle', user.active !== false ? 'active' : 'inactive']"
                @click="handleToggle(user)"
              >
                <span class="toggle-dot" />
                <span>{{ user.active !== false ? 'نشط' : 'معطل' }}</span>
              </button>
            </td>
            <td class="cell-date">{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="actions-cell">
                <button class="action-btn edit" title="تعديل" @click="openEdit(user)">
                  <i class="pi pi-pen-to-square" />
                </button>
                <button class="action-btn delete" title="حذف" @click="deleteTarget = user">
                  <i class="pi pi-trash" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="filteredUsers.length > 0" class="pagination">
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
        <span class="pag-info">{{ filteredUsers.length }} مستخدم</span>
      </div>
    </div>

    <!-- ═══════════════════════════════════
         CREATE / EDIT MODAL
         ═══════════════════════════════════ -->
    <AppModal
      v-model="formModal"
      :title="editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'"
      :subtitle="editingUser ? 'تعديل بيانات الحساب' : 'إنشاء حساب داخلي جديد للنظام'"
      :icon="editingUser ? 'pi pi-pen-to-square' : 'pi pi-user-plus'"
      size="lg"
      @close="resetForm"
    >
      <form @submit.prevent="handleSubmit" novalidate>
        <!-- Basic Info -->
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-user" /> البيانات الأساسية</h4>
          <div class="fields-grid">
            <div class="field">
              <label>الاسم <span class="req">*</span></label>
              <input v-model="form.name" type="text" placeholder="اسم المستخدم"
                :class="{ error: touched.name && !form.name.trim() }" @blur="touched.name = true" />
              <span v-if="touched.name && !form.name.trim()" class="field-error">الاسم مطلوب</span>
            </div>

            <div class="field">
              <label>التليفون <span class="req">*</span></label>
              <input v-model="form.phone" type="tel" placeholder="01xxxxxxxxx" dir="ltr"
                :class="{ error: touched.phone && !isPhoneValid }" @blur="touched.phone = true" />
              <span v-if="touched.phone && !isPhoneValid" class="field-error">أدخل رقم تليفون صحيح</span>
            </div>

            <div class="field">
              <label>كلمة المرور <span class="req">*</span></label>
              <div class="password-wrap">
                <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••"
                  :class="{ error: touched.password && !isPasswordValid }" @blur="touched.password = true" />
                <button type="button" class="pass-toggle" @click="showPass = !showPass">
                  <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                </button>
              </div>
              <span v-if="touched.password && !isPasswordValid" class="field-error">كلمة المرور (6 أحرف على الأقل)</span>
            </div>

            <div class="field">
              <label>البريد الإلكتروني</label>
              <input v-model="form.email" type="email" placeholder="example@email.com" dir="ltr" />
            </div>
          </div>
        </div>

        <!-- Role & Status -->
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-shield" /> الدور والصلاحيات</h4>
          <div class="fields-grid">
            <div class="field">
              <label>الدور <span class="req">*</span></label>
              <AppDropdown
                v-model="form.role"
                :options="creatableRoleOptions"
                placeholder="اختر الدور"
                :error="touched.role && !form.role"
                :disabled="!!editingUser"
                @change="touched.role = true"
              />
              <span v-if="touched.role && !form.role" class="field-error">الدور مطلوب</span>
            </div>

            <div class="field">
              <label>الحالة</label>
              <div class="status-switch">
                <button type="button" :class="['sw-opt', form.active ? 'on' : '']" @click="form.active = true">
                  <i class="pi pi-check-circle" /> نشط
                </button>
                <button type="button" :class="['sw-opt', !form.active ? 'on off' : '']" @click="form.active = false">
                  <i class="pi pi-ban" /> معطل
                </button>
              </div>
            </div>
          </div>

          <!-- Broker Commission -->
          <Transition name="slide">
            <div v-if="isBrokerRole(form.role)" class="fields-grid cond-fields">
              <div class="field">
                <label>نسبة البروكر (%) <span class="req">*</span></label>
                <input v-model.number="form.commissionPercent" type="number" min="0" max="100" placeholder="مثال: 10"
                  :class="{ error: touched.commission && !isCommissionValid }" @blur="touched.commission = true" />
                <span v-if="touched.commission && !isCommissionValid" class="field-error">نسبة البروكر مطلوبة (0-100)</span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Error -->
        <Transition name="slide">
          <div v-if="errorMsg" class="form-error">
            <i class="pi pi-exclamation-circle" /> {{ errorMsg }}
          </div>
        </Transition>
      </form>

      <template #footer>
        <button class="btn-cancel" @click="formModal = false">إلغاء</button>
        <button class="btn-submit" :disabled="!isFormValid || loading" @click="handleSubmit">
          <i v-if="loading" class="pi pi-spin pi-spinner" />
          <template v-else>
            <i :class="editingUser ? 'pi pi-check' : 'pi pi-plus'" />
            {{ editingUser ? 'حفظ التعديلات' : 'إنشاء المستخدم' }}
          </template>
        </button>
      </template>
    </AppModal>

    <!-- ═══════════════════════════════════
         DELETE CONFIRM MODAL
         ═══════════════════════════════════ -->
    <AppModal
      v-model="deleteModalOpen"
      title="حذف المستخدم"
      :subtitle="`هل أنت متأكد من حذف ${deleteTarget?.name}؟`"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239, 68, 68, 0.08)"
      size="sm"
    >
      <p class="delete-warn">لا يمكن التراجع عن هذا الإجراء بعد التأكيد.</p>

      <template #footer>
        <button class="btn-cancel" @click="deleteModalOpen = false">إلغاء</button>
        <button class="btn-danger" @click="confirmDelete">
          <i class="pi pi-trash" /> حذف
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES, ROLE_LABELS, CREATABLE_ROLES } from '@/constants/roles'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppModal from '@/components/ui/AppModal.vue'

const usersStore = useUsersStore()
const toast = useToastStore()
const { userRole } = usePermissions()

// ── Filters ──
const search = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const perPage = 8

function isBrokerRole(role) {
  return role === ROLES.BROKER_COMPANY || role === ROLES.BROKER_VILLAGE
}

const filterableRoles = Object.values(ROLES)
  .filter((r) => r !== ROLES.CLIENT)
  .map((r) => ({ value: r, label: ROLE_LABELS[r] || r }))

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'active', label: 'نشط', dot: '#10b981' },
  { value: 'inactive', label: 'معطل', dot: '#ef4444' },
]

const filteredUsers = computed(() =>
  usersStore.getAll({ search: search.value, role: filterRole.value, status: filterStatus.value })
)

const totalPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / perPage)))
const paginatedUsers = computed(() => {
  const s = (currentPage.value - 1) * perPage
  return filteredUsers.value.slice(s, s + perPage)
})
const visiblePages = computed(() => {
  const pages = []
  const c = currentPage.value
  const t = totalPages.value
  for (let i = Math.max(1, c - 2); i <= Math.min(t, c + 2); i++) pages.push(i)
  return pages
})

watch([search, filterRole, filterStatus], () => { currentPage.value = 1 })

// ── Stats ──
const stats = computed(() => {
  const all = usersStore.getAll()
  return [
    { label: 'إجمالي المستخدمين', value: all.length, icon: 'pi pi-users', color: '#8b5cf6' },
    { label: 'نشط', value: all.filter((u) => u.active !== false).length, icon: 'pi pi-check-circle', color: '#10b981' },
    { label: 'معطل', value: all.filter((u) => u.active === false).length, icon: 'pi pi-ban', color: '#ef4444' },
    { label: 'بروكر', value: all.filter((u) => isBrokerRole(u.role)).length, icon: 'pi pi-briefcase', color: '#f97316' },
  ]
})

// ── Helpers ──
function roleLabel(role) { return ROLE_LABELS[role] || role }
function roleColorMap(role) {
  return {
    [ROLES.SUPER_ADMIN]: '#8b5cf6',
    [ROLES.ADMIN_COMPANY]: '#7c3aed',
    [ROLES.ADMIN_VILLAGE]: '#14b8a6',
    [ROLES.CUSTOMER_SERVICE_COMPANY]: '#0ea5e9',
    [ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE]: '#0284c7',
    [ROLES.CUSTOMER_SERVICE_VILLAGE]: '#06b6d4',
    [ROLES.BROKER_COMPANY]: '#eab308',
    [ROLES.BROKER_VILLAGE]: '#facc15',
    [ROLES.FINANCIAL_MEMBER]: '#10b981',
    [ROLES.OPERATION]: '#f97316',
    [ROLES.SECURITY]: '#ef4444',
    [ROLES.CLIENT]: '#64748b',
  }[role] || '#94a3b8'
}
function avatarColor(role) { return `linear-gradient(135deg, ${roleColorMap(role)}, ${roleColorMap(role)}dd)` }
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
function handleToggle(user) {
  const r = usersStore.toggleActive(user.id)
  if (r.ok) toast.success(r.active ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب')
}

// ── Delete ──
const deleteTarget = ref(null)
const deleteModalOpen = computed({
  get: () => !!deleteTarget.value,
  set: (v) => { if (!v) deleteTarget.value = null },
})

function confirmDelete() {
  if (!deleteTarget.value) return
  const r = usersStore.deleteUser(deleteTarget.value.id)
  r.ok ? toast.success('تم حذف المستخدم') : toast.error(r.error)
  deleteTarget.value = null
}

// ── Create / Edit Modal ──
const formModal = ref(false)
const editingUser = ref(null)
const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const form = reactive({
  name: '', phone: '', password: '', email: '',
  role: '', active: true, commissionPercent: '', brokerId: '',
})
const touched = reactive({
  name: false, phone: false, password: false, role: false, commission: false, broker: false,
})

const creatableRoleOptions = computed(() => {
  const allowed = CREATABLE_ROLES[userRole.value] || []
  return allowed.map((r) => ({ value: r, label: ROLE_LABELS[r] || r }))
})

const isPhoneValid = computed(() => form.phone.trim().length >= 8)
const isPasswordValid = computed(() => editingUser.value ? (!form.password || form.password.length >= 6) : form.password.length >= 6)
const isCommissionValid = computed(() => {
  if (!isBrokerRole(form.role)) return true
  const v = Number(form.commissionPercent)
  return v > 0 && v <= 100
})
const isFormValid = computed(() => {
  if (!form.name.trim() || !isPhoneValid.value || !isPasswordValid.value || !form.role) return false
  if (isBrokerRole(form.role) && !isCommissionValid.value) return false
  return true
})

function openCreate() {
  resetForm()
  editingUser.value = null
  formModal.value = true
}

function openEdit(user) {
  resetForm()
  editingUser.value = user
  form.name = user.name || ''
  form.phone = user.phone || ''
  form.email = user.email || ''
  form.role = user.role || ''
  form.active = user.active !== false
  form.commissionPercent = user.commissionPercent || ''
  form.brokerId = user.brokerId || ''
  form.password = ''
  formModal.value = true
}

function resetForm() {
  Object.assign(form, { name: '', phone: '', password: '', email: '', role: '', active: true, commissionPercent: '', brokerId: '' })
  Object.assign(touched, { name: false, phone: false, password: false, role: false, commission: false, broker: false })
  showPass.value = false
  errorMsg.value = ''
  loading.value = false
}

function handleSubmit() {
  if (!isFormValid.value) return
  loading.value = true
  errorMsg.value = ''

  setTimeout(() => {
    let result
    if (editingUser.value) {
      const data = { ...form }
      if (!data.password) delete data.password
      result = usersStore.update(editingUser.value.id, data)
    } else {
      result = usersStore.create(form)
    }
    loading.value = false
    if (result.ok) {
      toast.success(editingUser.value ? 'تم تحديث المستخدم' : 'تم إنشاء المستخدم بنجاح')
      formModal.value = false
      resetForm()
    } else {
      errorMsg.value = result.error
    }
  }, 300)
}
</script>

<style scoped>
/* ═══════════════════════════════════
   PAGE HEADER
   ═══════════════════════════════════ */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.page-desc {
  font-size: 13.5px;
  color: #94a3b8;
  margin: 0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
}

/* ═══════════════════════════════════
   MINI STATS
   ═══════════════════════════════════ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.mini-stat {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-stat-icon i { font-size: 18px; color: var(--accent); }
.mini-stat-value { display: block; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }
.mini-stat-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }

/* ═══════════════════════════════════
   FILTERS
   ═══════════════════════════════════ */
.filters-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.filters-row { display: flex; align-items: center; gap: 12px; }
.search-box { position: relative; flex: 1; max-width: 360px; }
.search-box i.pi-search { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #94a3b8; }
.search-box input { width: 100%; height: 40px; padding: 0 40px 0 14px; padding-right: 40px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #f8fafc; transition: all 0.2s; outline: none; }
.search-box input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.search-box input::placeholder { color: #94a3b8; }
.search-clear { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 12px; }
.filter-group { display: flex; gap: 8px; }

/* ═══════════════════════════════════
   TABLE
   ═══════════════════════════════════ */
.table-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 14px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.data-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.table-row { transition: background 0.15s; }
.table-row:hover { background: #fafbfc; }
.table-row:last-child td { border-bottom: none; }

.user-cell { display: flex; align-items: center; gap: 12px; }
.user-cell-avatar { width: 36px; height: 36px; border-radius: 10px; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
.user-cell-name { display: block; font-weight: 600; color: #1e293b; font-size: 13.5px; }
.user-cell-email { display: block; font-size: 12px; color: #94a3b8; }
.cell-phone { direction: ltr; text-align: right; font-weight: 500; }
.cell-date { font-size: 12.5px; color: #94a3b8; }

.role-tag { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--tag-color); background: color-mix(in srgb, var(--tag-color) 8%, transparent); }

.status-toggle { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px 5px 8px; border-radius: 20px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.2s; }
.status-toggle.active { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-toggle.inactive { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
.toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
.status-toggle:hover { opacity: 0.8; }

.actions-cell { display: flex; align-items: center; gap: 4px; }
.action-btn { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.15s; text-decoration: none; }
.action-btn.edit { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
.action-btn.edit:hover { background: rgba(14, 165, 233, 0.15); }
.action-btn.delete { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
.action-btn.delete:hover { background: rgba(239, 68, 68, 0.15); }

/* ═══════════════════════════════════
   EMPTY STATE
   ═══════════════════════════════════ */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-state p { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* ═══════════════════════════════════
   PAGINATION
   ═══════════════════════════════════ */
.pagination { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 16px; border-top: 1px solid #f1f5f9; }
.pag-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #475569; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.pag-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
.pag-btn.active { background: #f97316; border-color: #f97316; color: #fff; }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { font-size: 12.5px; color: #94a3b8; margin-right: 12px; }

/* ═══════════════════════════════════
   MODAL FORM
   ═══════════════════════════════════ */
.form-section { margin-bottom: 24px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
.section-label i { font-size: 15px; color: #f97316; }

.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.cond-fields { margin-top: 14px; padding-top: 14px; border-top: 1px dashed #e2e8f0; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }

.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.field input.error { border-color: #ef4444; background: #fef2f2; }
.field input::placeholder { color: #94a3b8; }
.field-error { font-size: 12px; color: #ef4444; font-weight: 500; }

.password-wrap { position: relative; }
.password-wrap input { width: 100%; padding-left: 42px; }
.pass-toggle { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 15px; padding: 4px; }

.status-switch { display: flex; gap: 8px; }
.sw-opt { flex: 1; height: 42px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 600; font-family: inherit; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
.sw-opt.on { border-color: #10b981; background: rgba(16, 185, 129, 0.06); color: #10b981; }
.sw-opt.off { border-color: #ef4444; background: rgba(239, 68, 68, 0.06); color: #ef4444; }

.form-error { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #ef4444; font-size: 13.5px; font-weight: 500; margin-bottom: 8px; }

.delete-warn { font-size: 13.5px; color: #64748b; margin: 0; }

/* Footer Buttons */
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.btn-cancel:hover { background: #e2e8f0; }

.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #ef4444; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-danger:hover { background: #dc2626; }

/* Transitions */
.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .btn-primary { width: 100%; justify-content: center; }
  .filters-row { flex-direction: column; }
  .search-box { max-width: 100%; }
  .filter-group { width: 100%; }
  .stats-row { grid-template-columns: 1fr 1fr; gap: 8px; }
  .mini-stat { padding: 12px; }
  .mini-stat-value { font-size: 18px; }
  .table-card { overflow-x: auto; }
  .data-table { min-width: 600px; }
  .data-table th, .data-table td { padding: 10px 12px; font-size: 12.5px; }
  .data-table th:nth-child(5), .data-table td:nth-child(5) { display: none; }
  .fields-grid { grid-template-columns: 1fr; }
  .pagination { padding: 12px; }
  .pag-btn { width: 32px; height: 32px; font-size: 12px; }
}
</style>
