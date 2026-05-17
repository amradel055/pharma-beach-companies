<template>
  <div class="company-payments-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/admin/companies" class="crumb">الشركات</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">سندات القبض</span>
    </nav>

    <!-- Company picker -->
    <section class="bf-section picker-card">
      <label class="picker-label"><i class="pi pi-briefcase" /> اختر الشركة</label>
      <AppDropdown
        v-model="selectedCompanyId"
        :options="companyOptions"
        placeholder="اختر شركة لعرض سنداتها"
        empty-text="لا توجد شركات"
        @change="onCompanyChange"
      />
    </section>

    <div v-if="!selectedCompanyId" class="empty-state">
      اختر شركة لعرض سندات القبض الخاصة بها
    </div>

    <div v-else-if="loadingPayments" class="loading-inline">
      <i class="pi pi-spin pi-spinner" /> جاري التحميل...
    </div>

    <div v-else class="od-grid">
      <!-- ── Main column ── -->
      <div class="od-main">
        <header class="od-hero">
          <div class="od-hero-avatar"><i class="pi pi-briefcase" /></div>
          <div class="od-hero-body">
            <div class="od-hero-row">
              <h1 class="od-hero-name">{{ company?.name || '—' }}</h1>
            </div>
            <p class="od-hero-meta">
              <i class="pi pi-list" />
              {{ payments.length }} سند · {{ activeCount }} نشط · {{ cancelledCount }} ملغى
            </p>
          </div>
        </header>

        <section class="bf-section">
          <div class="bf-section-head">
            <h4 class="bf-section-title">
              <i class="pi pi-list" /> السندات
              <span class="bf-counter">{{ payments.length }}</span>
            </h4>
          </div>

          <div v-if="!payments.length" class="empty-state">لا توجد سندات لهذه الشركة</div>

          <div v-else class="table-wrap">
            <table class="p-table">
              <thead>
                <tr>
                  <th>الكود</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>الرصيد بعد</th>
                  <th>التاريخ</th>
                  <th class="act-col"></th>
                </tr>
              </thead>
              <tbody>
                <template v-for="p in payments" :key="p.id">
                  <tr class="p-row" :class="{ 'is-cancelled': p.status === 'CANCELLED' }">
                    <td class="t-ltr">
                      <button type="button" class="row-toggle" @click="toggleExpand(p)">
                        <i class="pi" :class="expanded[p.id] ? 'pi-chevron-down' : 'pi-chevron-left'" />
                      </button>
                      <span class="t-strong">{{ p.receipt_code || p.receipt_number || '—' }}</span>
                    </td>
                    <td><strong>{{ fmt(p.amount) }} <small>ج.م</small></strong></td>
                    <td>
                      <span :class="['t-status', p.status === 'CANCELLED' ? 'danger' : 'ok']">
                        {{ p.status === 'CANCELLED' ? 'ملغى' : 'نشط' }}
                      </span>
                    </td>
                    <td>{{ fmt(p.balance_after) }} <small>ج.م</small></td>
                    <td class="t-muted">{{ toDisplayDateTime(p.created_at) }}</td>
                    <td class="act-col">
                      <span v-if="canEdit && p.status === 'ACTIVE'" class="t-actions">
                        <button class="icon-btn edit" title="تعديل" @click="openEdit(p)">
                          <i class="pi pi-pencil" />
                        </button>
                        <button class="icon-btn cancel" title="إلغاء" @click="confirmCancel(p)">
                          <i class="pi pi-ban" />
                        </button>
                      </span>
                      <span v-else class="muted-sm">—</span>
                    </td>
                  </tr>
                  <tr class="hist-row">
                    <td colspan="6" class="hist-cell">
                      <div class="acc-panel" :class="{ open: expanded[p.id] }">
                        <div class="acc-panel-clip">
                          <div class="acc-panel-body">
                            <div v-if="!(p.history || []).length" class="hist-empty">
                              لا يوجد سجل لهذا السند
                            </div>
                            <ul v-else class="hist-timeline">
                              <li v-for="(h, i) in p.history" :key="i" class="hist-item">
                                <span class="hist-dot" :class="histClass(h.action)" />
                                <div class="hist-body">
                                  <div class="hist-line1">
                                    <span class="hist-action">{{ actionLabel(h.action) }}</span>
                                    <span class="hist-time">{{ toDisplayDateTime(h.created_at) }}</span>
                                  </div>
                                  <div class="hist-line2">
                                    <span v-if="h.old_amount != null || h.new_amount != null">
                                      المبلغ: {{ fmt(h.old_amount) }} ← {{ fmt(h.new_amount) }} ج.م
                                    </span>
                                    <span>
                                      الرصيد: {{ fmt(h.balance_before) }} ← {{ fmt(h.balance_after) }} ج.م
                                    </span>
                                  </div>
                                  <div class="hist-line3">
                                    <span v-if="h.performed_by"><i class="pi pi-user" /> {{ h.performed_by }}</span>
                                    <span v-if="h.notes" class="hist-notes">{{ h.notes }}</span>
                                  </div>
                                </div>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- ── Sticky rail ── -->
      <aside class="od-aside">
        <div class="od-rail">
          <div class="rail-card rail-money">
            <span class="rail-money-label">رصيد الشركة</span>
            <span class="rail-money-total">{{ fmt(selectedBalance) }} <small>ج.م</small></span>
          </div>

          <button v-if="canCreate" class="btn-primary rail-btn" @click="openCreate">
            <i class="pi pi-plus" /> إضافة سند جديد
          </button>
        </div>
      </aside>
    </div>

    <!-- Add / Edit modal -->
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
          <input
            v-model.number="form.amount"
            type="number"
            min="0.01"
            step="0.01"
            class="field-input ltr"
            required
          />
        </label>
        <label class="field">
          <span class="field-label">الملاحظات</span>
          <textarea v-model="form.notes" rows="3" class="field-input" />
        </label>
        <small v-if="editing && !amountChanged" class="hint">
          <i class="pi pi-info-circle" /> غيّر المبلغ لحفظ التعديل.
        </small>
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

    <!-- Cancel confirm -->
    <AppModal
      v-model="cancelOpen"
      title="إلغاء السند؟"
      subtitle="سيُخصم المبلغ من رصيد الشركة"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">
        سيُخصم <strong>{{ fmt(pendingCancel?.amount) }} ج.م</strong> من رصيد الشركة. هل تريد المتابعة؟
      </p>
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="cancelOpen = false">رجوع</button>
        <button type="button" class="btn-danger" :disabled="cancelling" @click="handleCancel">
          <i v-if="cancelling" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-ban" />
          إلغاء السند
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useCompanyPaymentsStore, PAYMENT_REASON_CODES } from '@/stores/companyPayments'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { toDisplayDateTime } from '@/utils/date'
import AppModal from '@/components/ui/AppModal.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const paymentsStore = useCompanyPaymentsStore()
const csBookings = useCsBookingsStore()
const toast = useToastStore()
const { hasPermission } = usePermissions()

const canCreate = computed(() => hasPermission('company_payments.create'))
const canEdit = computed(() => hasPermission('company_payments.edit'))

const companies = ref([])
const selectedCompanyId = ref('')
const company = ref(null)
const payments = ref([])
const loadingPayments = ref(false)
const expanded = reactive({})

const companyOptions = computed(() =>
  companies.value.map((c) => ({ value: c.id, label: c.name })),
)
const selectedBalance = computed(() =>
  company.value?.balance ??
  companies.value.find((c) => c.id === selectedCompanyId.value)?.balance ??
  0,
)
const activeCount = computed(() => payments.value.filter((p) => p.status !== 'CANCELLED').length)
const cancelledCount = computed(() => payments.value.filter((p) => p.status === 'CANCELLED').length)

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }
function actionLabel(a) {
  return { CREATED: 'تم الإنشاء', UPDATED: 'تم تعديل المبلغ', CANCELLED: 'تم الإلغاء' }[a] || a || '—'
}
function histClass(a) {
  return { CREATED: 'ok', UPDATED: 'info', CANCELLED: 'danger' }[a] || 'neutral'
}
function toggleExpand(p) { expanded[p.id] = !expanded[p.id] }

async function loadCompanies() {
  const r = await csBookings.listCompanies()
  if (r.ok) companies.value = r.data
  else toast.error(r.error)
}

async function loadPayments() {
  if (!selectedCompanyId.value) return
  loadingPayments.value = true
  const r = await paymentsStore.getForCompany(selectedCompanyId.value)
  loadingPayments.value = false
  if (r.ok) {
    company.value = r.data.company
    payments.value = r.data.payments
  } else {
    toast.error(r.error)
  }
}

function onCompanyChange() {
  company.value = null
  payments.value = []
  for (const k in expanded) delete expanded[k]
  loadPayments()
}

async function refreshAfterWrite() {
  await loadPayments()
  csBookings.invalidateLookups()
  await loadCompanies()
}

// ── Add / Edit ──
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ amount: null, notes: '' })

const amountChanged = computed(
  () => !editing.value || Number(form.amount) !== Number(editing.value.amount),
)
const canSubmit = computed(() => Number(form.amount) > 0 && amountChanged.value)

function openCreate() {
  editing.value = null
  form.amount = null
  form.notes = ''
  formOpen.value = true
}
function openEdit(p) {
  editing.value = p
  form.amount = Number(p.amount)
  form.notes = p.notes || ''
  formOpen.value = true
}

async function handleSubmit() {
  if (!canSubmit.value || saving.value) return
  saving.value = true
  const payload = editing.value
    ? { amount: Number(form.amount), notes: form.notes }
    : { company_id: selectedCompanyId.value, amount: Number(form.amount), notes: form.notes }
  const r = editing.value
    ? await paymentsStore.update(editing.value.id, payload)
    : await paymentsStore.create(payload)
  saving.value = false
  if (r.ok) {
    editing.value ? toast.updated('السند') : toast.created('السند')
    formOpen.value = false
    await refreshAfterWrite()
    return
  }
  if (r.reason === PAYMENT_REASON_CODES.ALREADY_CANCELLED) {
    toast.error(r.error)
    formOpen.value = false
    await loadPayments()
    return
  }
  toast.error(r.error)
}

// ── Cancel ──
const cancelOpen = ref(false)
const pendingCancel = ref(null)
const cancelling = ref(false)

function confirmCancel(p) { pendingCancel.value = p; cancelOpen.value = true }

async function handleCancel() {
  if (!pendingCancel.value || cancelling.value) return
  cancelling.value = true
  const r = await paymentsStore.cancel(pendingCancel.value.id)
  cancelling.value = false
  if (r.ok) {
    toast.success('تم إلغاء السند بنجاح')
    cancelOpen.value = false
    pendingCancel.value = null
    await refreshAfterWrite()
    return
  }
  if (r.reason === PAYMENT_REASON_CODES.ALREADY_CANCELLED) {
    toast.error(r.error)
    cancelOpen.value = false
    pendingCancel.value = null
    await loadPayments()
    return
  }
  toast.error(r.error)
}

onMounted(loadCompanies)
</script>

<style scoped>
.company-payments-page { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb */
.page-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

/* Cards */
.bf-section {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; }
.bf-section-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; }
.bf-section-title i { color: #f97316; }
.bf-counter { margin-inline-start: 6px; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }

.picker-card { display: flex; flex-direction: column; gap: 10px; }
.picker-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12px; font-weight: 800; color: #c2410c;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.picker-label i { font-size: 14px; }

.loading-inline { padding: 40px 20px; text-align: center; color: #64748b; font-size: 13.5px; }
.loading-inline i { font-size: 16px; margin-left: 8px; color: #f97316; }
.empty-state {
  padding: 44px 20px; text-align: center; color: #94a3b8;
  font-size: 14px; font-weight: 600;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
}

/* ── Nested-page pattern (scoped) ── */
.od-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; }
.od-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.od-rail { position: sticky; top: 80px; display: flex; flex-direction: column; gap: 12px; }

.od-hero {
  position: relative; display: flex; align-items: center; gap: 16px;
  padding: 18px 20px; border-radius: 16px; background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.od-hero-avatar {
  width: 54px; height: 54px; border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #ea580c; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.od-hero-avatar i { font-size: 22px; color: #ea580c; }
.od-hero-body { display: flex; flex-direction: column; gap: 9px; min-width: 0; flex: 1; }
.od-hero-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.od-hero-name { font-size: 20px; font-weight: 800; margin: 0; line-height: 1.2; color: #0f172a; }
.od-hero-meta { display: inline-flex; align-items: center; gap: 6px; margin: 0; font-size: 12px; font-weight: 600; color: #94a3b8; }
.od-hero-meta i { font-size: 11px; }

.rail-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 16px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.rail-money {
  display: flex; flex-direction: column; gap: 4px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.10), rgba(251, 191, 36, 0.10));
  border-color: rgba(249, 115, 22, 0.22);
}
.rail-money-label {
  font-size: 11px; font-weight: 800; color: #c2410c;
  text-transform: uppercase; letter-spacing: 0.6px;
}
.rail-money-total { font-size: 28px; font-weight: 900; color: #ea580c; line-height: 1.1; }
.rail-money-total small { font-size: 12px; font-weight: 800; color: #c2410c; }
.rail-btn { width: 100%; justify-content: center; }

@media (max-width: 980px) {
  .od-grid { grid-template-columns: 1fr; }
  .od-aside { order: -1; }
  .od-rail { position: static; }
  .rail-money-total { font-size: 24px; }
}
@media (max-width: 560px) {
  .od-hero { flex-direction: column; align-items: flex-start; text-align: start; }
  .od-hero-name { font-size: 18px; }
}

/* Table bits (global .p-table provides the rest) */
.t-ltr { direction: ltr; text-align: right; }
.muted-sm { font-size: 11.5px; color: #94a3b8; }
.p-table td strong small { font-size: 11px; font-weight: 700; color: #94a3b8; }
.p-table tbody tr.is-cancelled td { text-decoration: line-through; color: #94a3b8; }
.p-table tbody tr.is-cancelled strong { color: #94a3b8; }
.row-toggle {
  background: none; border: none; cursor: pointer; color: #94a3b8;
  padding: 0 2px 0 8px; vertical-align: middle;
}
.row-toggle i { font-size: 11px; transition: transform 0.2s; }

/* History accordion (grid-rows trick) */
.hist-row td { padding: 0 !important; border: none !important; background: transparent !important; }
.acc-panel { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.3s ease; }
.acc-panel.open { grid-template-rows: 1fr; }
.acc-panel-clip { overflow: hidden; min-height: 0; }
.acc-panel-body {
  padding: 4px 16px 14px;
  opacity: 0; transition: opacity 0.25s ease;
}
.acc-panel.open .acc-panel-body { opacity: 1; }
.hist-empty { padding: 14px; text-align: center; color: #94a3b8; font-size: 12.5px; }
.hist-timeline { list-style: none; margin: 0; padding: 6px 0 0; display: flex; flex-direction: column; gap: 12px; }
.hist-item { display: flex; gap: 10px; }
.hist-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; background: #cbd5e1; }
.hist-dot.ok { background: #10b981; }
.hist-dot.info { background: #0ea5e9; }
.hist-dot.danger { background: #ef4444; }
.hist-body { display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; color: #475569; }
.hist-line1 { display: flex; gap: 10px; align-items: center; }
.hist-action { font-weight: 800; color: #0f172a; }
.hist-time { font-size: 11px; color: #94a3b8; }
.hist-line2, .hist-line3 { display: flex; flex-wrap: wrap; gap: 12px; }
.hist-line3 i { font-size: 11px; color: #94a3b8; }
.hist-notes { color: #94a3b8; }

/* Buttons + modal form */
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
.btn-cancel {
  padding: 9px 18px; border-radius: 9px; background: #fff;
  border: 1px solid #e2e8f0; color: #64748b;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
}
.btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-danger {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px; border-radius: 9px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid #dc2626; color: #fff;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.30);
}
.btn-danger:hover:not(:disabled) { transform: translateY(-1px); }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

.form-grid { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: #64748b; }
.field-label .req { color: #ef4444; }
.field-input {
  padding: 10px 12px; border-radius: 9px; border: 1px solid #e2e8f0;
  background: #fff; font-size: 13.5px; font-family: inherit; color: #0f172a; resize: vertical;
}
.field-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
.field-input.ltr { direction: ltr; text-align: right; }
.hint { display: inline-flex; align-items: center; gap: 5px; font-size: 11.5px; color: #94a3b8; }
.hint i { font-size: 12px; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }
</style>
