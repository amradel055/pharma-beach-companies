<template>
  <div class="coupons-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">كوبونات الخصم</h1>
        <p class="page-desc">إنشاء وإدارة كوبونات الخصم والعروض</p>
      </div>
      <div class="header-actions">
        <RouterLink to="/admin/coupons/report" class="btn-secondary"><i class="pi pi-chart-bar" /> تقرير الاستخدام</RouterLink>
        <button class="btn-primary" @click="openCreate"><i class="pi pi-plus" /> إنشاء كوبون</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="mini-stat" v-for="(s, i) in stats" :key="i" :style="{ '--accent': s.color }">
        <div class="mini-stat-icon"><i :class="s.icon" /></div>
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
          <input v-model="search" type="text" placeholder="بحث بكود الكوبون..." />
          <button v-if="search" class="search-clear" @click="search = ''"><i class="pi pi-times" /></button>
        </div>
        <AppDropdown v-model="filterStatus" :options="statusOptions" placeholder="كل الحالات" />
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="filtered.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-tag" /></div>
        <h3>لا توجد كوبونات</h3>
        <p>{{ search || filterStatus ? 'لا توجد نتائج مطابقة' : 'لم يتم إنشاء كوبونات بعد' }}</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>نوع الخصم</th>
            <th>القيمة</th>
            <th>الصلاحية</th>
            <th>الاستخدام</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id" class="table-row">
            <td><span class="coupon-code">{{ c.code }}</span></td>
            <td>{{ c.type === 'percent' ? 'نسبة مئوية' : 'مبلغ ثابت' }}</td>
            <td class="cell-val">{{ c.type === 'percent' ? c.value + '%' : fmtNum(c.value) + ' ج.م' }}</td>
            <td>
              <div class="date-range-cell">
                <span>{{ fmtDate(c.startDate) }}</span>
                <span class="date-sep">←</span>
                <span>{{ fmtDate(c.endDate) }}</span>
              </div>
            </td>
            <td>
              <span class="usage-count">{{ c.usageCount }}<span v-if="c.maxUsage > 0">/{{ c.maxUsage }}</span></span>
            </td>
            <td>
              <button :class="['status-toggle', couponStatus(c)]" @click="handleToggle(c)">
                <span class="toggle-dot" />
                {{ couponStatusLabel(c) }}
              </button>
            </td>
            <td>
              <div class="actions-cell">
                <button class="action-btn edit" @click="openEdit(c)"><i class="pi pi-pen-to-square" /></button>
                <button class="action-btn delete" @click="deleteTarget = c"><i class="pi pi-trash" /></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <AppModal v-model="formOpen" :title="editing ? 'تعديل كوبون' : 'إنشاء كوبون جديد'" :icon="editing ? 'pi pi-pen-to-square' : 'pi pi-tag'" size="lg" @close="resetForm">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-tag" /> بيانات الكوبون</h4>
          <div class="fields-grid">
            <div class="field">
              <label>كود الكوبون <span class="req">*</span></label>
              <input v-model="form.code" placeholder="مثال: SUMMER20" dir="ltr" :class="{ error: t.code && !form.code.trim() }" @blur="t.code = true" />
            </div>
            <div class="field">
              <label>نوع الخصم <span class="req">*</span></label>
              <AppDropdown v-model="form.type" :options="typeOptions" placeholder="اختر النوع" :error="t.type && !form.type" @change="t.type = true" />
            </div>
            <div class="field">
              <label>قيمة الخصم <span class="req">*</span></label>
              <input v-model.number="form.value" type="number" min="0" :placeholder="form.type === 'percent' ? 'مثال: 20' : 'مثال: 500'" />
            </div>
            <div class="field">
              <label>الحالة</label>
              <div class="status-switch">
                <button type="button" :class="['sw-opt', form.active ? 'on' : '']" @click="form.active = true"><i class="pi pi-check-circle" /> مفعل</button>
                <button type="button" :class="['sw-opt', !form.active ? 'on off' : '']" @click="form.active = false"><i class="pi pi-ban" /> معطل</button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-calendar" /> الصلاحية والحدود</h4>
          <div class="fields-grid">
            <div class="field">
              <label>تاريخ البداية <span class="req">*</span></label>
              <input v-model="form.startDate" type="date" />
            </div>
            <div class="field">
              <label>تاريخ الانتهاء <span class="req">*</span></label>
              <input v-model="form.endDate" type="date" />
            </div>
            <div class="field">
              <label>الحد الأقصى للاستخدام</label>
              <input v-model.number="form.maxUsage" type="number" min="0" placeholder="0 = بدون حد" />
            </div>
            <div class="field">
              <label>الحد لكل مستخدم</label>
              <input v-model.number="form.perUserLimit" type="number" min="0" placeholder="0 = بدون حد" />
            </div>
            <div class="field">
              <label>الحد الأدنى لقيمة الحجز (ج.م)</label>
              <input v-model.number="form.minBookingValue" type="number" min="0" placeholder="0 = بدون حد أدنى" />
            </div>
          </div>
        </div>

        <Transition name="slide">
          <div v-if="errorMsg" class="form-error"><i class="pi pi-exclamation-circle" /> {{ errorMsg }}</div>
        </Transition>
      </form>

      <template #footer>
        <button class="btn-cancel" @click="formOpen = false">إلغاء</button>
        <button class="btn-submit" :disabled="!isValid || loading" @click="handleSubmit">
          <i v-if="loading" class="pi pi-spin pi-spinner" />
          <template v-else><i :class="editing ? 'pi pi-check' : 'pi pi-plus'" /> {{ editing ? 'حفظ' : 'إنشاء' }}</template>
        </button>
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-model="deleteOpen" title="حذف الكوبون" :subtitle="`حذف الكوبون ${deleteTarget?.code}؟`" icon="pi pi-exclamation-triangle" icon-color="#ef4444" icon-bg="rgba(239,68,68,0.08)" size="sm">
      <p class="del-warn">لا يمكن التراجع عن هذا الإجراء.</p>
      <template #footer>
        <button class="btn-cancel" @click="deleteOpen = false">إلغاء</button>
        <button class="btn-danger" @click="confirmDelete"><i class="pi pi-trash" /> حذف</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useCouponsStore } from '@/stores/coupons'
import { useToastStore } from '@/stores/toast'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppModal from '@/components/ui/AppModal.vue'

const couponsStore = useCouponsStore()
const toast = useToastStore()

const search = ref('')
const filterStatus = ref('')

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'active', label: 'مفعل', dot: '#10b981' },
  { value: 'inactive', label: 'معطل', dot: '#ef4444' },
  { value: 'expired', label: 'منتهي', dot: '#94a3b8' },
]

const typeOptions = [
  { value: 'percent', label: 'نسبة مئوية (%)' },
  { value: 'fixed', label: 'مبلغ ثابت (ج.م)' },
]

const filtered = computed(() => couponsStore.getAll({ search: search.value, status: filterStatus.value }))

const stats = computed(() => [
  { label: 'إجمالي الكوبونات', value: couponsStore.coupons.length, icon: 'pi pi-tag', color: '#8b5cf6' },
  { label: 'مفعل', value: couponsStore.totalActive, icon: 'pi pi-check-circle', color: '#10b981' },
  { label: 'منتهي', value: couponsStore.totalExpired, icon: 'pi pi-clock', color: '#94a3b8' },
  { label: 'إجمالي الاستخدام', value: couponsStore.totalUsage, icon: 'pi pi-chart-bar', color: '#f97316' },
])

function couponStatus(c) {
  if (new Date(c.endDate) < new Date()) return 'expired'
  return c.active ? 'active' : 'inactive'
}

function couponStatusLabel(c) {
  const s = couponStatus(c)
  return { active: 'مفعل', inactive: 'معطل', expired: 'منتهي' }[s]
}

function handleToggle(c) {
  if (couponStatus(c) === 'expired') return
  const r = couponsStore.toggleActive(c.id)
  if (r.ok) toast.success(r.active ? 'تم تفعيل الكوبون' : 'تم تعطيل الكوبون')
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }

// Delete
const deleteTarget = ref(null)
const deleteOpen = computed({ get: () => !!deleteTarget.value, set: (v) => { if (!v) deleteTarget.value = null } })
function confirmDelete() {
  if (!deleteTarget.value) return
  couponsStore.deleteCoupon(deleteTarget.value.id)
  toast.success('تم حذف الكوبون')
  deleteTarget.value = null
}

// Form
const formOpen = ref(false)
const editing = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const form = reactive({
  code: '', type: '', value: 0, startDate: '', endDate: '',
  maxUsage: 0, perUserLimit: 0, minBookingValue: 0, active: true,
})
const t = reactive({ code: false, type: false })

const isValid = computed(() => form.code.trim() && form.type && form.value > 0 && form.startDate && form.endDate)

function openCreate() {
  resetForm(); editing.value = null; formOpen.value = true
}

function openEdit(c) {
  resetForm(); editing.value = c
  Object.keys(form).forEach((k) => { if (c[k] !== undefined) form[k] = c[k] })
  formOpen.value = true
}

function resetForm() {
  Object.assign(form, { code: '', type: '', value: 0, startDate: '', endDate: '', maxUsage: 0, perUserLimit: 0, minBookingValue: 0, active: true })
  Object.assign(t, { code: false, type: false })
  errorMsg.value = ''; loading.value = false
}

function handleSubmit() {
  if (!isValid.value) return
  loading.value = true; errorMsg.value = ''

  setTimeout(() => {
    let result
    if (editing.value) {
      result = couponsStore.update(editing.value.id, { ...form })
    } else {
      result = couponsStore.create({ ...form })
    }
    loading.value = false
    if (result.ok) {
      toast.success(editing.value ? 'تم تحديث الكوبون' : 'تم إنشاء الكوبون')
      formOpen.value = false; resetForm()
    } else {
      errorMsg.value = result.error
    }
  }, 300)
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }
.header-actions { display: flex; gap: 8px; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-primary:hover { transform: translateY(-1px); }
.btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-weight: 600; color: #475569; text-decoration: none; transition: all 0.15s; }
.btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.mini-stat { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
.mini-stat-icon { width: 40px; height: 40px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 10%, transparent); display: flex; align-items: center; justify-content: center; }
.mini-stat-icon i { font-size: 18px; color: var(--accent); }
.mini-stat-value { display: block; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }
.mini-stat-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }

.filters-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.filters-row { display: flex; align-items: center; gap: 12px; }
.search-box { position: relative; flex: 1; max-width: 300px; }
.search-box i.pi-search { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #94a3b8; }
.search-box input { width: 100%; height: 40px; padding: 0 40px 0 14px; padding-right: 40px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; }
.search-box input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.search-box input::placeholder { color: #94a3b8; }
.search-clear { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 12px; }

.table-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 14px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.data-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.table-row { transition: background 0.15s; }
.table-row:hover { background: #fafbfc; }
.table-row:last-child td { border-bottom: none; }

.coupon-code { font-weight: 700; color: #1e293b; background: rgba(249, 115, 22, 0.06); padding: 4px 10px; border-radius: 6px; font-size: 13px; direction: ltr; display: inline-block; letter-spacing: 0.5px; }
.cell-val { font-weight: 600; }
.date-range-cell { display: flex; align-items: center; gap: 6px; font-size: 12.5px; }
.date-sep { color: #cbd5e1; }
.usage-count { font-weight: 700; color: #1e293b; }
.usage-count span { color: #94a3b8; font-weight: 500; }

.status-toggle { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px 5px 8px; border-radius: 20px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; font-family: inherit; transition: all 0.2s; }
.status-toggle.active { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-toggle.inactive { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
.status-toggle.expired { background: rgba(148, 163, 184, 0.08); color: #94a3b8; cursor: default; }
.toggle-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }

.actions-cell { display: flex; gap: 4px; }
.action-btn { width: 34px; height: 34px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: all 0.15s; }
.action-btn.edit { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
.action-btn.edit:hover { background: rgba(14, 165, 233, 0.15); }
.action-btn.delete { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
.action-btn.delete:hover { background: rgba(239, 68, 68, 0.15); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-state p { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Form */
.form-section { margin-bottom: 24px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
.section-label i { font-size: 15px; color: #f97316; }
.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }
.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.field input.error { border-color: #ef4444; }
.field input::placeholder { color: #94a3b8; }
.status-switch { display: flex; gap: 8px; }
.sw-opt { flex: 1; height: 42px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fafbfc; display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 13px; font-weight: 600; font-family: inherit; color: #94a3b8; cursor: pointer; transition: all 0.2s; }
.sw-opt.on { border-color: #10b981; background: rgba(16, 185, 129, 0.06); color: #10b981; }
.sw-opt.off { border-color: #ef4444; background: rgba(239, 68, 68, 0.06); color: #ef4444; }
.form-error { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #ef4444; font-size: 13.5px; font-weight: 500; }
.del-warn { font-size: 13.5px; color: #64748b; margin: 0; }
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #ef4444; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-danger:hover { background: #dc2626; }
.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .header-actions { width: 100%; flex-direction: column; }
  .header-actions .btn-primary, .header-actions .btn-secondary { width: 100%; justify-content: center; }
  .filters-row { flex-direction: column; }
  .search-box { max-width: 100%; }
  .stats-row { gap: 8px; }
  .table-card { overflow-x: auto; }
  .data-table { min-width: 650px; }
  .data-table th, .data-table td { padding: 10px 12px; font-size: 12.5px; }
  .fields-grid { grid-template-columns: 1fr; }
}
</style>
