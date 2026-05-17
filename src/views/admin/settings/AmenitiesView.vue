<template>
  <div class="amenities-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-sparkles" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الكماليات</h1>
        <p class="page-desc">إدارة قائمة الكماليات المرتبطة بالشاليهات</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة كمالية
      </button>
    </div>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-inbox" />
        <p>لا توجد كماليات بعد</p>
      </div>
      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th>الأيقونة</th>
              <th>الاسم بالعربية</th>
              <th>الاسم بالإنجليزية</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" class="p-row">
              <td>
                <span class="amenity-tile" :class="{ 'amenity-tile--empty': iconKind(row) === 'empty' }">
                  <img
                    v-if="iconKind(row) === 'img'"
                    :src="row.icon"
                    :alt="row.name_ar || ''"
                    @error="markIconBroken(row.id)"
                  />
                  <i v-else-if="iconKind(row) === 'class'" :class="row.icon" />
                  <i v-else class="pi pi-sparkles" />
                </span>
              </td>
              <td><span class="t-strong">{{ row.name_ar || '—' }}</span></td>
              <td class="t-ltr">{{ row.name_en || '—' }}</td>
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

    <!-- Create / Edit modal -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل كمالية' : 'إضافة كمالية'"
      icon="pi pi-sparkles"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="sm"
    >
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">الاسم بالعربية <span class="req">*</span></span>
          <input v-model="form.name_ar" type="text" class="field-input" required />
        </label>
        <label class="field">
          <span class="field-label">الاسم بالإنجليزية</span>
          <input v-model="form.name_en" type="text" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">الأيقونة (رابط أو فئة PrimeIcon)</span>
          <input v-model="form.icon" type="text" class="field-input ltr" placeholder="https://... أو pi pi-star" />
          <small v-if="form.icon" class="field-hint">
            <span v-if="isImageUrl(form.icon)"><img :src="form.icon" alt="preview" class="amenity-icon-img" /></span>
            <span v-else><i :class="form.icon" class="amenity-icon-class" /></span>
          </small>
        </label>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="formOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.name_ar">
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
      title="حذف الكمالية؟"
      subtitle="لا يمكن التراجع عن هذا الإجراء"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">هل أنت متأكد من حذف <strong>{{ pendingDelete?.name_ar }}</strong>؟</p>
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
import { ref, reactive, onMounted } from 'vue'
import { useAmenitiesStore } from '@/stores/amenities'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const amenities = useAmenitiesStore()
const toast = useToastStore()

const rows = ref([])
const loading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const rangeFrom = ref(0)
const rangeTo = ref(0)

function isImageUrl(s) { return /^https?:\/\//i.test(s) || /\.(png|jpe?g|svg|webp|gif)$/i.test(s) }
// Looks like an icon-font class (PrimeIcons, FontAwesome, Bootstrap, MDI).
function isIconClass(s) { return /(^|\s)(pi|fa[srlb]?|bi|mdi)-[a-z0-9-]+/i.test(s) }

// Track image URLs that fail to load so we fall back to the placeholder.
const brokenIcons = reactive(new Set())
function markIconBroken(id) { brokenIcons.add(id) }

// Classify a row's icon so the cell renders one consistent tile:
//   'img'   → a real image URL        'class' → an icon-font class
//   'empty' → missing / unrecognized (e.g. the literal "string" test value)
function iconKind(row) {
  const s = (row.icon || '').trim()
  if (!s) return 'empty'
  if (isImageUrl(s)) return brokenIcons.has(row.id) ? 'empty' : 'img'
  if (isIconClass(s)) return 'class'
  return 'empty'
}

async function load() {
  loading.value = true
  const r = await amenities.list({ page: currentPage.value, limit: 10 })
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

// Form
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ name_ar: '', name_en: '', icon: '' })

function resetForm() { form.name_ar = ''; form.name_en = ''; form.icon = '' }

function openCreate() { editing.value = null; resetForm(); formOpen.value = true }

function openEdit(row) {
  editing.value = row
  form.name_ar = row.name_ar || ''
  form.name_en = row.name_en || ''
  form.icon = row.icon || ''
  formOpen.value = true
}

async function handleSubmit() {
  if (!form.name_ar) return
  saving.value = true
  const payload = { name_ar: form.name_ar, name_en: form.name_en, icon: form.icon || null }
  const r = editing.value
    ? await amenities.update(editing.value.id, payload)
    : await amenities.create(payload)
  saving.value = false
  if (r.ok) {
    editing.value ? toast.updated('الكمالية') : toast.created('الكمالية')
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
  const r = await amenities.remove(pendingDelete.value.id)
  deleting.value = false
  if (r.ok) {
    toast.deleted('الكمالية')
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
.amenities-page { display: flex; flex-direction: column; gap: 16px; }
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
/* Unified icon tile — same footprint for every row so the column stays
   aligned whether the amenity has an image, an icon class, or nothing. */
.amenity-tile {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: inline-flex; align-items: center; justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  border: 1px solid rgba(249, 115, 22, 0.20);
  color: #ea580c;
  transition: transform 0.15s;
}
.p-row:hover .amenity-tile { transform: scale(1.06); }
.amenity-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.amenity-tile i { font-size: 18px; }
.amenity-tile--empty {
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  color: #cbd5e1;
}
.amenity-tile--empty i { font-size: 16px; }

/* Form-modal live preview keeps its own compact swatch. */
.amenity-icon-img {
  width: 34px; height: 34px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #f1f5f9;
}
.amenity-icon-class {
  width: 34px; height: 34px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.08);
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 16px;
}

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
.field-hint { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8; margin-top: 4px; }
.field-hint .amenity-icon-img, .field-hint .amenity-icon-class { width: 28px; height: 28px; font-size: 14px; }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }
</style>
