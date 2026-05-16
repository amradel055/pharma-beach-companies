<template>
  <div class="lookups-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-sliders-h" /></div>
      <div class="page-header-text">
        <h1 class="page-title">القيم المرجعية</h1>
        <p class="page-desc">إدارة قوائم الأدوار، الغرف، الحمامات، المساحات، التشطيب، الإطلالة، التكييفات</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة عنصر
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="cat in categories"
        :key="cat.key"
        type="button"
        :class="['tab', { active: activeKey === cat.key }]"
        @click="activeKey = cat.key"
      >
        {{ cat.label_ar }}
        <span class="tab-count">{{ (items[cat.key] || []).length }}</span>
      </button>
    </div>

    <section class="bf-section">
      <div v-if="loading" class="empty">
        <i class="pi pi-spin pi-spinner" /> جاري التحميل...
      </div>
      <div v-else-if="!visibleItems.length" class="empty">
        <i class="pi pi-inbox" />
        <p>لا توجد عناصر في هذه القائمة</p>
        <button class="btn-primary" @click="openCreate">
          <i class="pi pi-plus" /> إضافة عنصر جديد
        </button>
      </div>

      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th v-if="shape === 'value'">القيمة</th>
              <template v-else-if="shape === 'range'">
                <th>أقل مساحة (م²)</th>
                <th>أقصى مساحة (م²)</th>
              </template>
              <th v-else-if="shape === 'code'">الكود</th>
              <th>الاسم بالعربية</th>
              <th>الاسم بالإنجليزية</th>
              <th>الترتيب</th>
              <th>نشط</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in visibleItems" :key="row.id" class="p-row">
              <td v-if="shape === 'value'" class="t-ltr">
                <span class="t-strong">{{ row.value ?? '—' }}</span>
              </td>
              <template v-else-if="shape === 'range'">
                <td class="t-ltr">{{ row.min_area ?? '—' }}</td>
                <td class="t-ltr">{{ row.max_area ?? '∞' }}</td>
              </template>
              <td v-else-if="shape === 'code'" class="t-ltr">
                <span class="t-strong">{{ row.code ?? '—' }}</span>
              </td>
              <td>{{ rowAr(row) || '—' }}</td>
              <td class="t-ltr">{{ rowEn(row) || '—' }}</td>
              <td>{{ row.sort_order ?? '—' }}</td>
              <td>
                <AppToggle
                  :model-value="!!row.is_active"
                  :disabled="togglingId === row.id"
                  @update:model-value="toggleActive(row, $event)"
                />
              </td>
              <td class="act-col">
                <span class="t-actions">
                  <button class="icon-btn edit" @click="openEdit(row)" aria-label="تعديل">
                    <i class="pi pi-pencil" />
                  </button>
                  <button class="icon-btn delete" @click="confirmDelete(row)" aria-label="حذف">
                    <i class="pi pi-trash" />
                  </button>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Create / Edit modal -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل العنصر' : 'إضافة عنصر'"
      icon="pi pi-pencil"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="sm"
    >
      <form class="form-grid" @submit.prevent="handleSubmit">
        <!-- Primary identifier — differs per category shape -->
        <label v-if="shape === 'value'" class="field">
          <span class="field-label">القيمة <span class="req">*</span></span>
          <input v-model="form.value" type="text" class="field-input ltr" required />
        </label>
        <template v-else-if="shape === 'range'">
          <label class="field">
            <span class="field-label">أقل مساحة (م²) <span class="req">*</span></span>
            <input v-model.number="form.min_area" type="number" min="0" class="field-input ltr" required />
          </label>
          <label class="field">
            <span class="field-label">أقصى مساحة (م²)</span>
            <input v-model.number="form.max_area" type="number" min="0" class="field-input ltr" placeholder="اتركه فارغاً لمساحة مفتوحة" />
          </label>
        </template>
        <label v-else-if="shape === 'code'" class="field">
          <span class="field-label">الكود <span class="req">*</span></span>
          <input v-model="form.code" type="text" class="field-input ltr" required />
        </label>

        <label class="field">
          <span class="field-label">الاسم بالعربية</span>
          <input v-model="form.name_ar" type="text" class="field-input" />
        </label>
        <label class="field">
          <span class="field-label">الاسم بالإنجليزية</span>
          <input v-model="form.name_en" type="text" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">الترتيب</span>
          <input v-model.number="form.sort_order" type="number" min="0" class="field-input ltr" />
        </label>
        <label class="field field-row">
          <AppToggle v-model="form.is_active">نشط</AppToggle>
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

    <!-- Delete confirm -->
    <AppModal
      v-model="deleteOpen"
      title="حذف العنصر؟"
      subtitle="لا يمكن التراجع عن هذا الإجراء"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">
        هل أنت متأكد من حذف
        <strong>{{ rowAr(pendingDelete) || pendingDelete?.value || pendingDelete?.code || '—' }}</strong>؟
      </p>
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="deleteOpen = false">إلغاء</button>
        <button type="button" class="btn-danger" :disabled="deleting" @click="handleDelete">
          <i v-if="deleting" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-trash" />
          حذف
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useLookupsStore, LOOKUP_CATEGORIES } from '@/stores/lookups'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'
import AppToggle from '@/components/ui/AppToggle.vue'

const lookups = useLookupsStore()
const toast = useToastStore()

const categories = LOOKUP_CATEGORIES
const activeKey = ref(categories[0].key)
const items = ref({}) // { [key]: option[] }
const loading = ref(true)
const togglingId = ref(null)

const visibleItems = computed(() => {
  const list = items.value[activeKey.value] || []
  return [...list].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
})

const activeCategory = computed(
  () => categories.find((c) => c.key === activeKey.value) || categories[0],
)
const shape = computed(() => activeCategory.value.shape)

// The Arabic / English label lives under different keys depending on the
// category schema (label_* for value/range, name_* for code). Read both.
function rowAr(row) { return row?.label_ar ?? row?.name_ar ?? '' }
function rowEn(row) { return row?.label_en ?? row?.name_en ?? '' }

async function loadAll() {
  loading.value = true
  const r = await lookups.listAll()
  loading.value = false
  if (r.ok) {
    const next = {}
    for (const cat of categories) {
      next[cat.key] = r.data[cat.key]?.options || []
    }
    items.value = next
  } else {
    toast.error(r.error)
  }
}

async function reloadCurrent() {
  const r = await lookups.list(activeKey.value)
  if (r.ok) items.value = { ...items.value, [activeKey.value]: r.data }
  else toast.error(r.error)
}

// Form state
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
// One flat form holding every possible field; buildPayload() picks the
// right subset for the active shape. `name_ar`/`name_en` are the unified
// label inputs (mapped to label_* or name_* per shape on submit).
const form = reactive({
  value: '', code: '', min_area: '', max_area: '',
  name_ar: '', name_en: '', sort_order: 0, is_active: true,
})

function resetForm() {
  form.value = ''
  form.code = ''
  form.min_area = ''
  form.max_area = ''
  form.name_ar = ''
  form.name_en = ''
  form.sort_order = 0
  form.is_active = true
}

const canSubmit = computed(() => {
  if (shape.value === 'range') return form.min_area !== '' && form.min_area !== null
  if (shape.value === 'code') return !!String(form.code).trim()
  return form.value !== '' && form.value !== null
})

function openCreate() {
  editing.value = null
  resetForm()
  formOpen.value = true
}

function openEdit(row) {
  editing.value = row
  form.value = row.value ?? ''
  form.code = row.code ?? ''
  form.min_area = row.min_area ?? ''
  form.max_area = row.max_area ?? ''
  form.name_ar = rowAr(row)
  form.name_en = rowEn(row)
  form.sort_order = row.sort_order ?? 0
  form.is_active = !!row.is_active
  formOpen.value = true
}

// Map the flat form to the backend payload for the active category shape.
function buildPayload() {
  const common = { sort_order: Number(form.sort_order) || 0, is_active: form.is_active }
  if (shape.value === 'range') {
    return {
      ...common,
      min_area: Number(form.min_area) || 0,
      max_area: form.max_area === '' || form.max_area === null ? null : Number(form.max_area),
      label_ar: form.name_ar,
      label_en: form.name_en,
    }
  }
  if (shape.value === 'code') {
    return { ...common, code: String(form.code).trim(), name_ar: form.name_ar, name_en: form.name_en }
  }
  return { ...common, value: form.value, label_ar: form.name_ar, label_en: form.name_en }
}

async function handleSubmit() {
  if (!canSubmit.value) return
  saving.value = true
  const payload = buildPayload()
  const r = editing.value
    ? await lookups.update(activeKey.value, editing.value.id, payload)
    : await lookups.create(activeKey.value, payload)
  saving.value = false
  if (r.ok) {
    toast.success(editing.value ? 'تم التحديث' : 'تمت الإضافة')
    formOpen.value = false
    await reloadCurrent()
  } else {
    toast.error(r.error)
  }
}

// Inline is_active toggle
async function toggleActive(row, next) {
  togglingId.value = row.id
  const r = await lookups.update(activeKey.value, row.id, { is_active: next })
  togglingId.value = null
  if (r.ok) {
    const list = items.value[activeKey.value] || []
    const idx = list.findIndex((x) => x.id === row.id)
    if (idx !== -1) {
      const updated = [...list]
      updated[idx] = { ...updated[idx], is_active: next }
      items.value = { ...items.value, [activeKey.value]: updated }
    }
  } else {
    toast.error(r.error)
  }
}

// Delete confirm
const deleteOpen = ref(false)
const pendingDelete = ref(null)
const deleting = ref(false)

function confirmDelete(row) {
  pendingDelete.value = row
  deleteOpen.value = true
}

async function handleDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  const r = await lookups.remove(activeKey.value, pendingDelete.value.id)
  deleting.value = false
  if (r.ok) {
    toast.success('تم الحذف')
    deleteOpen.value = false
    pendingDelete.value = null
    await reloadCurrent()
  } else {
    toast.error(r.error)
  }
}

// When the tab changes and we have no data yet for it, fetch.
watch(activeKey, async (key) => {
  if (!items.value[key]) {
    const r = await lookups.list(key)
    if (r.ok) items.value = { ...items.value, [key]: r.data }
  }
})

onMounted(loadAll)
</script>

<style scoped>
.lookups-page { display: flex; flex-direction: column; gap: 16px; }

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
  padding: 10px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
  transition: all 0.15s;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-cancel {
  padding: 9px 18px;
  border-radius: 9px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }

.btn-danger {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  border-radius: 9px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: 1px solid #dc2626;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.30);
}
.btn-danger:hover:not(:disabled) { transform: translateY(-1px); }
.btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }

/* Tabs */
.tabs {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 8px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}
.tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #64748b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.tab:hover { background: #f1f5f9; color: #475569; }
.tab.active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #c2410c;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.15);
}
.tab-count {
  padding: 2px 8px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
}
.tab.active .tab-count { background: #fff; color: #c2410c; }

/* Section */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

/* States */
.empty {
  padding: 40px 20px;
  text-align: center;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty i.pi-spin { color: #f97316; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }

/* Form modal */
.form-grid { display: flex; flex-direction: column; gap: 12px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 700; color: #64748b; }
.field-label .req { color: #ef4444; }
.field-input {
  padding: 10px 12px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13.5px;
  font-family: inherit;
  color: #0f172a;
}
.field-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
.field-row { flex-direction: row; align-items: center; gap: 10px; }

.form-actions {
  display: flex; gap: 10px; justify-content: flex-end;
  padding-top: 8px;
  margin-top: 6px;
}

.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }
</style>
