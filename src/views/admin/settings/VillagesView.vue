<template>
  <div class="villages-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-map-marker" /></div>
      <div class="page-header-text">
        <h1 class="page-title">القرى</h1>
        <p class="page-desc">إدارة القرى وفئات الشاليهات المرتبطة بكل قرية</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة قرية
      </button>
    </div>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-map" />
        <p>لا توجد قرى بعد</p>
      </div>
      <div v-else class="acc-list">
        <div
          v-for="row in rows"
          :key="row.id"
          :class="['acc-item', { open: expanded[row.id] }]"
        >
          <div class="acc-header" @click="toggleExpand(row)">
            <span class="acc-caret"><i class="pi pi-chevron-left" /></span>
            <span class="acc-avatar"><i class="pi pi-map-marker" /></span>
            <span class="acc-titles">
              <span class="acc-name">{{ row.name }}</span>
              <span class="acc-sub">
                <i class="pi pi-calendar" />
                {{ row.created_at ? toDisplayDate(row.created_at) : '—' }}
              </span>
            </span>
            <span v-if="tiers[row.id]" class="acc-count">{{ tiers[row.id].length }} فئة</span>
            <span class="acc-actions">
              <button class="icon-btn edit" @click.stop="openEdit(row)"><i class="pi pi-pencil" /></button>
              <button class="icon-btn delete" @click.stop="confirmDelete(row)"><i class="pi pi-trash" /></button>
            </span>
          </div>

          <div class="acc-panel">
            <div class="acc-panel-clip">
              <div class="acc-panel-body">
                <div class="tiers-head">
                  <div class="tiers-title">
                    <span class="tiers-title-icon"><i class="pi pi-th-large" /></span>
                    <span>فئات الشاليهات</span>
                    <span v-if="(tiers[row.id] || []).length" class="tiers-count">
                      {{ tiers[row.id].length }}
                    </span>
                  </div>
                  <button class="btn-primary btn-sm" @click.stop="openTierCreate(row)">
                    <i class="pi pi-plus" /> فئة جديدة
                  </button>
                </div>

                <div v-if="tiersLoading[row.id]" class="muted-row">
                  <i class="pi pi-spin pi-spinner" /> جاري تحميل الفئات...
                </div>
                <div v-else-if="!(tiers[row.id] || []).length" class="tiers-empty">
                  <div class="tiers-empty-icon"><i class="pi pi-inbox" /></div>
                  <p>لا توجد فئات لهذه القرية</p>
                  <button class="btn-primary btn-sm" @click.stop="openTierCreate(row)">
                    <i class="pi pi-plus" /> إضافة أول فئة
                  </button>
                </div>
                <table v-else class="tier-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>رسوم القرية</th>
                      <th>الحد الأقصى للضيوف</th>
                      <th>ضيوف إضافيون</th>
                      <th class="tier-actions-col"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="t in tiers[row.id]" :key="t.id" class="tier-row">
                      <td>
                        <span class="tier-name">{{ t.name || '—' }}</span>
                      </td>
                      <td><span class="tier-num">{{ fmt(t.village_fee) }}</span> <span class="tier-unit">ج.م</span></td>
                      <td><span class="tier-num">{{ t.max_guests ?? '—' }}</span></td>
                      <td><span class="tier-num">{{ t.max_extra_guest ?? '—' }}</span></td>
                      <td class="tier-actions-col">
                        <button class="icon-btn edit" @click.stop="openTierEdit(row, t)"><i class="pi pi-pencil" /></button>
                        <button class="icon-btn delete" @click.stop="confirmTierDelete(row, t)"><i class="pi pi-trash" /></button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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

    <!-- Village create/edit -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل القرية' : 'إضافة قرية'"
      icon="pi pi-map-marker"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="sm"
    >
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">الاسم <span class="req">*</span></span>
          <input v-model="form.name" type="text" class="field-input" required />
        </label>
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

    <!-- Village delete confirm -->
    <AppModal
      v-model="deleteOpen"
      title="حذف القرية؟"
      subtitle="سيتم حذف الفئات المرتبطة بها أيضاً"
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

    <!-- Tier create/edit -->
    <AppModal
      v-model="tierFormOpen"
      :title="tierEditing ? 'تعديل الفئة' : 'إضافة فئة'"
      icon="pi pi-th-large"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="md"
    >
      <form class="form-grid two-col" @submit.prevent="handleTierSubmit">
        <label class="field span-2">
          <span class="field-label">الاسم <span class="req">*</span></span>
          <input v-model="tierForm.name" type="text" class="field-input" required />
        </label>
        <label class="field">
          <span class="field-label">رسوم القرية (ج.م)</span>
          <input v-model.number="tierForm.village_fee" type="number" min="0" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">الحد الأقصى للضيوف</span>
          <input v-model.number="tierForm.max_guests" type="number" min="0" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">ضيوف إضافيون</span>
          <input v-model.number="tierForm.max_extra_guest" type="number" min="0" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">رسوم الأمن (ج.م)</span>
          <input v-model.number="tierForm.security_fee" type="number" min="0" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">الأفراد المصرح بهم</span>
          <input v-model.number="tierForm.authorized_persons" type="number" min="0" class="field-input ltr" />
        </label>
        <label class="field">
          <span class="field-label">عدد الأفراد الإضافيين المسموح</span>
          <input v-model.number="tierForm.additional_persons_allowed" type="number" min="0" class="field-input ltr" />
        </label>
        <div class="form-actions span-2">
          <button type="button" class="btn-cancel" @click="tierFormOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="tierSaving || !tierForm.name">
            <i v-if="tierSaving" class="pi pi-spin pi-spinner" />
            <i v-else :class="tierEditing ? 'pi pi-check' : 'pi pi-plus'" />
            {{ tierEditing ? 'حفظ' : 'إضافة' }}
          </button>
        </div>
      </form>
    </AppModal>

    <!-- Tier delete confirm -->
    <AppModal
      v-model="tierDeleteOpen"
      title="حذف الفئة؟"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">هل أنت متأكد من حذف الفئة <strong>{{ pendingTierDelete?.tier?.name }}</strong>؟</p>
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="tierDeleteOpen = false">إلغاء</button>
        <button type="button" class="btn-danger" :disabled="tierDeleting" @click="handleTierDelete">
          <i v-if="tierDeleting" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-trash" /> حذف
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useVillagesStore } from '@/stores/villages'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate } from '@/utils/date'
import AppModal from '@/components/ui/AppModal.vue'
import AppPagination from '@/components/ui/AppPagination.vue'

const villagesStore = useVillagesStore()
const toast = useToastStore()

// Villages list
const rows = ref([])
const loading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)
const total = ref(0)
const rangeFrom = ref(0)
const rangeTo = ref(0)

async function load() {
  loading.value = true
  const r = await villagesStore.list({ page: currentPage.value, limit: 10 })
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

// Village form
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ name: '' })

function openCreate() { editing.value = null; form.name = ''; formOpen.value = true }
function openEdit(row) { editing.value = row; form.name = row.name || ''; formOpen.value = true }

async function handleSubmit() {
  if (!form.name) return
  saving.value = true
  const payload = { name: form.name }
  const r = editing.value
    ? await villagesStore.update(editing.value.id, payload)
    : await villagesStore.create(payload)
  saving.value = false
  if (r.ok) {
    editing.value ? toast.updated('القرية') : toast.created('القرية')
    formOpen.value = false
    await load()
  } else {
    toast.error(r.error)
  }
}

// Village delete
const deleteOpen = ref(false)
const pendingDelete = ref(null)
const deleting = ref(false)

function confirmDelete(row) { pendingDelete.value = row; deleteOpen.value = true }

async function handleDelete() {
  if (!pendingDelete.value) return
  deleting.value = true
  const r = await villagesStore.remove(pendingDelete.value.id)
  deleting.value = false
  if (r.ok) {
    toast.deleted('القرية')
    deleteOpen.value = false
    pendingDelete.value = null
    await load()
  } else {
    toast.error(r.error)
  }
}

// Expand → fetch tiers
const expanded = reactive({})
const tiers = ref({}) // { [villageId]: tier[] }
const tiersLoading = reactive({})

async function toggleExpand(row) {
  if (expanded[row.id]) {
    expanded[row.id] = false
    return
  }
  expanded[row.id] = true
  if (!tiers.value[row.id]) {
    tiersLoading[row.id] = true
    const r = await villagesStore.listTiers(row.id)
    tiersLoading[row.id] = false
    if (r.ok) tiers.value = { ...tiers.value, [row.id]: r.data }
    else toast.error(r.error)
  }
}

async function reloadTiers(villageId) {
  const r = await villagesStore.listTiers(villageId)
  if (r.ok) tiers.value = { ...tiers.value, [villageId]: r.data }
}

// Tier form
const tierFormOpen = ref(false)
const tierEditing = ref(null)
const tierContextVillage = ref(null)
const tierSaving = ref(false)
const tierForm = reactive({
  name: '', village_fee: 0, max_guests: 0, max_extra_guest: 0,
  security_fee: 0, authorized_persons: 0, additional_persons_allowed: 0,
})

function resetTierForm() {
  tierForm.name = ''
  tierForm.village_fee = 0
  tierForm.max_guests = 0
  tierForm.max_extra_guest = 0
  tierForm.security_fee = 0
  tierForm.authorized_persons = 0
  tierForm.additional_persons_allowed = 0
}

function openTierCreate(village) {
  tierEditing.value = null
  tierContextVillage.value = village
  resetTierForm()
  tierFormOpen.value = true
}

function openTierEdit(village, tier) {
  tierEditing.value = tier
  tierContextVillage.value = village
  tierForm.name = tier.name || ''
  tierForm.village_fee = tier.village_fee || 0
  tierForm.max_guests = tier.max_guests || 0
  tierForm.max_extra_guest = tier.max_extra_guest || 0
  tierForm.security_fee = tier.security_fee || 0
  tierForm.authorized_persons = tier.authorized_persons || 0
  tierForm.additional_persons_allowed = tier.additional_persons_allowed || 0
  tierFormOpen.value = true
}

async function handleTierSubmit() {
  const village = tierContextVillage.value
  if (!village || !tierForm.name) return
  tierSaving.value = true
  const payload = { ...tierForm }
  const r = tierEditing.value
    ? await villagesStore.updateTier(village.id, tierEditing.value.id, payload)
    : await villagesStore.createTier(village.id, payload)
  tierSaving.value = false
  if (r.ok) {
    tierEditing.value ? toast.updated('الفئة') : toast.created('الفئة')
    tierFormOpen.value = false
    await reloadTiers(village.id)
  } else {
    toast.error(r.error)
  }
}

// Tier delete
const tierDeleteOpen = ref(false)
const pendingTierDelete = ref(null)
const tierDeleting = ref(false)

function confirmTierDelete(village, tier) {
  pendingTierDelete.value = { village, tier }
  tierDeleteOpen.value = true
}

async function handleTierDelete() {
  const p = pendingTierDelete.value
  if (!p) return
  tierDeleting.value = true
  const r = await villagesStore.removeTier(p.village.id, p.tier.id)
  tierDeleting.value = false
  if (r.ok) {
    toast.deleted('الفئة')
    tierDeleteOpen.value = false
    await reloadTiers(p.village.id)
    pendingTierDelete.value = null
  } else {
    toast.error(r.error)
  }
}

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

onMounted(load)
</script>

<style scoped>
.villages-page { display: flex; flex-direction: column; gap: 16px; }
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
.btn-primary.btn-sm { padding: 7px 14px; font-size: 12.5px; border-radius: 9px; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
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

/* ── Accordion list ── */
.acc-list { display: flex; flex-direction: column; gap: 10px; }

.acc-item {
  background: #fff;
  border: 1px solid #eef2f6;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.acc-item:hover { border-color: #e2e8f0; }
.acc-item.open {
  border-color: #fed7aa;
  box-shadow: 0 8px 24px rgba(249, 115, 22, 0.08);
}

.acc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}
.acc-header:hover { background: #fcfcfd; }
.acc-item.open .acc-header {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.07), rgba(251, 191, 36, 0.07));
}

.acc-caret {
  width: 28px; height: 28px;
  border-radius: 8px;
  flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: #f1f5f9;
  color: #94a3b8;
  transition: background 0.2s, color 0.2s;
}
.acc-caret i { font-size: 11px; transition: transform 0.25s ease; }
.acc-header:hover .acc-caret { background: #fed7aa; color: #ea580c; }
.acc-item.open .acc-caret { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; }
.acc-item.open .acc-caret i { transform: rotate(-90deg); }

.acc-avatar {
  width: 38px; height: 38px;
  border-radius: 10px;
  flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(249, 115, 22, 0.10);
  color: #ea580c;
  font-size: 15px;
}

.acc-titles { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.acc-name { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.acc-sub {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: #94a3b8; font-weight: 600;
}
.acc-sub i { font-size: 11px; }

.acc-count {
  padding: 4px 11px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11.5px;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
}
.acc-item.open .acc-count { background: #ffedd5; color: #c2410c; }

.acc-actions { display: inline-flex; gap: 6px; flex-shrink: 0; }

/* Height accordion via the grid-rows trick: 0fr → 1fr animates to the
   content's real height (no magic max-height, no <tr> animation). */
.acc-panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}
.acc-item.open .acc-panel { grid-template-rows: 1fr; }
.acc-panel-clip { overflow: hidden; min-height: 0; }
.acc-panel-body {
  padding: 6px 16px 16px;
  border-top: 1px solid #f4ede4;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.acc-item.open .acc-panel-body { opacity: 1; }

.tiers-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 10px 0 12px; }
.tiers-title {
  display: inline-flex; align-items: center; gap: 9px;
  font-size: 13.5px; font-weight: 800; color: #0f172a;
}
.tiers-title-icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: inline-flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 191, 36, 0.14));
  color: #ea580c;
  font-size: 12px;
}
.tiers-count {
  padding: 2px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 800;
}
.muted-row { padding: 18px; text-align: center; color: #94a3b8; font-size: 13px; }

.tiers-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 26px 16px;
}
.tiers-empty-icon {
  width: 48px; height: 48px;
  border-radius: 14px;
  background: #f8fafc;
  color: #cbd5e1;
  display: inline-flex; align-items: center; justify-content: center;
}
.tiers-empty-icon i { font-size: 20px; }
.tiers-empty p { margin: 0; font-size: 13px; font-weight: 600; color: #94a3b8; }

/* Compact inner tiers sub-table — card rows like the main table */
.tier-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
.tier-table th {
  padding: 4px 12px 6px; text-align: right; font-size: 11px; font-weight: 800; color: #94a3b8;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.tier-row td {
  padding: 12px; font-size: 13.5px; color: #475569;
  background: #fafbfc;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}
.tier-row td:first-child { border-right: 1px solid #f1f5f9; border-top-right-radius: 10px; border-bottom-right-radius: 10px; }
.tier-row td:last-child { border-left: 1px solid #f1f5f9; border-top-left-radius: 10px; border-bottom-left-radius: 10px; }
.tier-name { font-weight: 800; color: #0f172a; }
.tier-num { font-weight: 800; color: #0f172a; }
.tier-unit { font-size: 11px; color: #94a3b8; font-weight: 700; }
.tier-actions-col { width: 100px; text-align: end; white-space: nowrap; }
.tier-table .icon-btn { margin-inline-start: 4px; }

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
.ltr { direction: ltr; text-align: right; }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }
</style>
