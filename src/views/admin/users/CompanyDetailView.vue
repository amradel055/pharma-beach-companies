<template>
  <div class="company-detail-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/admin/companies" class="crumb">الشركات</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">{{ company?.name || 'الشركة' }}</span>
    </nav>

    <div v-if="loading" class="loading-state"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>

    <div v-else-if="!company" class="card error-card">
      <i class="pi pi-exclamation-triangle" />
      <p>الشركة غير موجودة</p>
      <RouterLink to="/admin/companies" class="btn-primary">العودة للقائمة</RouterLink>
    </div>

    <template v-else>
      <!-- Page header -->
      <div class="page-header">
        <div class="page-icon"><i class="pi pi-briefcase" /></div>
        <div class="page-header-text">
          <h1 class="page-title">{{ company.name }}</h1>
          <p class="page-desc">إدارة سندات القبض ورصيد الشركة</p>
        </div>
      </div>

      <!-- Balance hero -->
      <section class="bf-section balance-hero">
        <div class="balance-row">
          <div class="balance-label">
            <i class="pi pi-wallet" /> الرصيد الحالي
          </div>
          <div class="balance-value">
            {{ fmt(company.balance) }}
            <small>ج.م</small>
          </div>
        </div>
        <div class="balance-actions">
          <button v-if="canCreate" class="btn-primary" @click="openCreate">
            <i class="pi pi-plus" /> سند قبض
          </button>
        </div>
      </section>

      <!-- Stats -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon orange"><i class="pi pi-bookmark" /></div>
          <div class="stat-body">
            <span class="stat-label">إجمالي السندات</span>
            <strong class="stat-value">{{ payments.length }}</strong>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="pi pi-check-circle" /></div>
          <div class="stat-body">
            <span class="stat-label">سندات نشطة</span>
            <strong class="stat-value">{{ activeCount }}</strong>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="pi pi-ban" /></div>
          <div class="stat-body">
            <span class="stat-label">سندات ملغاة</span>
            <strong class="stat-value">{{ cancelledCount }}</strong>
          </div>
        </div>
      </div>

      <!-- Payments list -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-list" /> السندات
            <span class="bf-counter">{{ payments.length }}</span>
          </h4>
        </div>

        <div v-if="!payments.length" class="empty">
          <i class="pi pi-inbox" />
          <p>لا توجد سندات بعد</p>
        </div>
        <div v-else class="table-wrap">
          <table class="p-table">
            <thead>
              <tr>
                <th>المبلغ</th>
                <th>الملاحظات</th>
                <th>الحالة</th>
                <th>تاريخ الإنشاء</th>
                <th class="act-col"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in payments" :key="p.id" class="p-row" :class="{ 'is-cancelled': p.status === 'CANCELLED' }">
                <td><strong>{{ fmt(p.amount) }} <small>ج.م</small></strong></td>
                <td>{{ p.notes || '—' }}</td>
                <td>
                  <span :class="['t-status', p.status === 'CANCELLED' ? 'danger' : 'ok']">
                    {{ p.status === 'CANCELLED' ? 'ملغى' : 'نشط' }}
                  </span>
                </td>
                <td class="t-muted">{{ p.created_at ? toDisplayDateTime(p.created_at) : '—' }}</td>
                <td class="act-col">
                  <span v-if="canEdit && p.status !== 'CANCELLED'" class="t-actions">
                    <button class="icon-btn edit" @click="openEdit(p)" :title="'تعديل'">
                      <i class="pi pi-pencil" />
                    </button>
                    <button class="icon-btn cancel" @click="confirmCancel(p)" :title="'إلغاء'">
                      <i class="pi pi-ban" />
                    </button>
                  </span>
                  <span v-else-if="p.status === 'CANCELLED'" class="muted-sm">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>

    <!-- Create / Edit receipt -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل السند' : 'سند قبض جديد'"
      icon="pi pi-wallet"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="sm"
    >
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">المبلغ <span class="req">*</span></span>
          <input v-model.number="form.amount" type="number" min="0.01" step="0.01" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">الملاحظات</span>
          <textarea v-model="form.notes" rows="3" class="field-input" />
        </label>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="formOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="saving || !canSubmit">
            <i v-if="saving" class="pi pi-spin pi-spinner" />
            <i v-else :class="editing ? 'pi pi-check' : 'pi pi-plus'" />
            {{ editing ? 'حفظ' : 'إضافة' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Cancel receipt confirm -->
    <AppModal
      v-model="cancelOpen"
      title="إلغاء السند؟"
      subtitle="سيُخصم المبلغ من الرصيد الحالي"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">
        هل أنت متأكد من إلغاء سند بقيمة
        <strong>{{ fmt(pendingCancel?.amount) }} ج.م</strong>؟
      </p>
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="cancelOpen = false">رجوع</button>
        <button type="button" class="btn-danger" :disabled="cancelling" @click="handleCancel">
          <i v-if="cancelling" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-ban" /> إلغاء السند
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCompanyPaymentsStore } from '@/stores/companyPayments'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { toDisplayDateTime } from '@/utils/date'
import AppModal from '@/components/ui/AppModal.vue'

const route = useRoute()
const paymentsStore = useCompanyPaymentsStore()
const toast = useToastStore()
const { hasPermission } = usePermissions()

const company = ref(null)
const payments = ref([])
const loading = ref(true)

const canCreate = computed(() => hasPermission('company_payments.create'))
const canEdit = computed(() => hasPermission('company_payments.edit'))

const activeCount = computed(() => payments.value.filter((p) => p.status !== 'CANCELLED').length)
const cancelledCount = computed(() => payments.value.filter((p) => p.status === 'CANCELLED').length)

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

async function load() {
  loading.value = true
  const r = await paymentsStore.getForCompany(route.params.id)
  loading.value = false
  if (r.ok) {
    company.value = r.data.company
    payments.value = r.data.payments
  } else {
    toast.error(r.error)
  }
}

// Form (create + edit)
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ amount: null, notes: '' })

const canSubmit = computed(() => Number(form.amount) > 0)

function openCreate() {
  editing.value = null
  form.amount = null
  form.notes = ''
  formOpen.value = true
}

function openEdit(p) {
  editing.value = p
  form.amount = Number(p.amount) || null
  form.notes = p.notes || ''
  formOpen.value = true
}

async function handleSubmit() {
  if (!canSubmit.value) return
  saving.value = true
  const payload = editing.value
    ? { amount: Number(form.amount), notes: form.notes }
    : { company_id: route.params.id, amount: Number(form.amount), notes: form.notes }
  const r = editing.value
    ? await paymentsStore.update(editing.value.id, payload)
    : await paymentsStore.create(payload)
  saving.value = false
  if (r.ok) {
    editing.value ? toast.updated('السند') : toast.created('السند')
    formOpen.value = false
    await load()
  } else {
    toast.error(r.error)
  }
}

// Cancel
const cancelOpen = ref(false)
const pendingCancel = ref(null)
const cancelling = ref(false)

function confirmCancel(p) { pendingCancel.value = p; cancelOpen.value = true }

async function handleCancel() {
  if (!pendingCancel.value) return
  cancelling.value = true
  const r = await paymentsStore.cancel(pendingCancel.value.id)
  cancelling.value = false
  if (r.ok) {
    toast.success('تم إلغاء السند بنجاح')
    cancelOpen.value = false
    pendingCancel.value = null
    await load()
  } else {
    toast.error(r.error)
  }
}

onMounted(load)
</script>

<style scoped>
.company-detail-page { display: flex; flex-direction: column; gap: 16px; }

.page-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 0; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

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

.bf-section {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
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
  border-radius: 999px; background: #f1f5f9;
  color: #475569; font-size: 11px; font-weight: 700;
}

/* Balance hero */
.balance-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 191, 36, 0.06));
  border-color: rgba(249, 115, 22, 0.25);
}
.balance-row { display: flex; flex-direction: column; gap: 6px; }
.balance-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 800;
  color: #c2410c;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.balance-label i { font-size: 14px; }
.balance-value {
  font-size: 36px; font-weight: 900; color: #ea580c;
  line-height: 1; letter-spacing: -1px;
}
.balance-value small { font-size: 14px; font-weight: 700; color: #c2410c; margin-inline-start: 4px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c); border: 1px solid #ea580c; color: #fff;
  font-family: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35); transition: all 0.15s;
  text-decoration: none;
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

/* Stats */
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.stat-card {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}
.stat-icon {
  width: 44px; height: 44px; border-radius: 12px;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.stat-icon i { font-size: 17px; }
.stat-icon.orange { background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 191, 36, 0.14)); color: #ea580c; }
.stat-icon.green { background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(52, 211, 153, 0.14)); color: #059669; }
.stat-icon.red { background: linear-gradient(135deg, rgba(239, 68, 68, 0.14), rgba(248, 113, 113, 0.14)); color: #dc2626; }
.stat-body { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.stat-label { font-size: 11.5px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }

/* Payments table — uses global .p-table; keep cancelled-row + small bits local */
.p-table tbody tr.is-cancelled td { text-decoration: line-through; color: #94a3b8; }
.p-table tbody tr.is-cancelled strong { color: #94a3b8; }
.p-table td strong small { font-size: 11px; font-weight: 700; color: #94a3b8; }
.muted-sm { font-size: 11.5px; color: #94a3b8; }
.ltr { direction: ltr; text-align: right; }

.empty {
  padding: 40px 20px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }

.form-grid { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: #64748b; }
.field-label .req { color: #ef4444; }
.field-input {
  padding: 10px 12px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff;
  font-size: 13.5px; font-family: inherit; color: #0f172a; resize: vertical;
}
.field-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }

.loading-state { padding: 60px 20px; text-align: center; color: #64748b; font-size: 14px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }
.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; text-align: center; color: #b91c1c; }
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }

@media (max-width: 720px) {
  .balance-hero { flex-direction: column; align-items: flex-start; }
  .stats-row { grid-template-columns: 1fr; }
}
</style>
