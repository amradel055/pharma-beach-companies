<template>
  <div class="chalets-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">إدارة الشاليهات</h1>
        <p class="page-desc">إضافة وتعديل بيانات الشاليهات وإدارة التفاصيل</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> إضافة شاليه
      </button>
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
          <input v-model="search" type="text" placeholder="بحث بالاسم أو رقم الشاليه..." />
          <button v-if="search" class="search-clear" @click="search = ''"><i class="pi pi-times" /></button>
        </div>
        <div class="filter-group">
          <AppDropdown v-model="filterStatus" :options="statusOptions" placeholder="كل الحالات" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="filtered.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-building" /></div>
        <h3>لا يوجد شاليهات</h3>
        <p>{{ search || filterStatus ? 'لم يتم العثور على نتائج' : 'لم يتم إضافة شاليهات بعد' }}</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>الشاليه</th>
            <th>الدور</th>
            <th>الغرف</th>
            <th>السعر</th>
            <th>رسوم القرية</th>
            <th>الحد الأقصى</th>
            <th>المشغل</th>
            <th>الحالة</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in paginated" :key="c.id" class="table-row">
            <td>
              <div class="chalet-cell">
                <div class="chalet-thumb">
                  <img v-if="c.image" :src="c.image" :alt="c.name" />
                  <i v-else class="pi pi-image" />
                </div>
                <div>
                  <span class="chalet-name">{{ c.name }}</span>
                  <span class="chalet-num">{{ c.chaletNumber }}</span>
                </div>
              </div>
            </td>
            <td>{{ c.floor }}</td>
            <td>{{ c.rooms }}</td>
            <td class="cell-num">{{ c.price }} ج.م</td>
            <td class="cell-num">{{ c.rentalFee }} ج.م</td>
            <td>{{ c.maxPermitted }} فرد</td>
            <td>{{ getOperatorName(c.operatorId) }}</td>
            <td>
              <span :class="['status-badge', c.status]">
                {{ statusLabel(c.status) }}
              </span>
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

      <div v-if="filtered.length > 0" class="pagination">
        <button class="pag-btn" :disabled="page === 1" @click="page--"><i class="pi pi-angle-right" /></button>
        <button v-for="p in visiblePages" :key="p" :class="['pag-btn', { active: p === page }]" @click="page = p">{{ p }}</button>
        <button class="pag-btn" :disabled="page === totalPages" @click="page++"><i class="pi pi-angle-left" /></button>
        <span class="pag-info">{{ filtered.length }} شاليه</span>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <AppModal v-model="formOpen" :title="editing ? 'تعديل شاليه' : 'إضافة شاليه جديد'" :subtitle="editing ? 'تعديل بيانات الشاليه' : 'أدخل بيانات الشاليه الجديد'" :icon="editing ? 'pi pi-pen-to-square' : 'pi pi-building'" size="lg" @close="resetForm">
      <form @submit.prevent="handleSubmit" novalidate>
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-building" /> البيانات الأساسية</h4>
          <div class="fields-grid">
            <div class="field"><label>اسم الشاليه <span class="req">*</span></label>
              <input v-model="form.name" placeholder="مثال: شاليه النخيل" :class="{ error: t.name && !form.name.trim() }" @blur="t.name = true" />
            </div>
            <div class="field"><label>رقم الشاليه <span class="req">*</span></label>
              <input v-model="form.chaletNumber" placeholder="مثال: A-101" dir="ltr" :class="{ error: t.number && !form.chaletNumber.trim() }" @blur="t.number = true" />
            </div>
            <div class="field"><label>الدور</label>
              <AppDropdown v-model="form.floor" :options="floorOptions" placeholder="اختر الدور" />
            </div>
            <div class="field"><label>عدد الغرف</label>
              <input v-model.number="form.rooms" type="number" min="1" placeholder="2" />
            </div>
            <div class="field"><label>عدد الحمامات</label>
              <input v-model.number="form.bathrooms" type="number" min="1" placeholder="1" />
            </div>
            <div class="field"><label>المساحة (م²)</label>
              <input v-model.number="form.area" type="number" min="0" placeholder="95" />
            </div>
            <div class="field"><label>التشطيب</label>
              <AppDropdown v-model="form.finishing" :options="finishingOptions" placeholder="اختر التشطيب" />
            </div>
            <div class="field"><label>التصنيف</label>
              <AppDropdown v-model="form.category" :options="categoryOptions" placeholder="اختر التصنيف" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-wallet" /> البيانات المالية</h4>
          <div class="fields-grid">
            <div class="field"><label>السعر لليلة (ج.م) <span class="req">*</span></label>
              <input v-model.number="form.price" type="number" min="0" placeholder="2500" :class="{ error: t.price && !form.price }" @blur="t.price = true" />
            </div>
            <div class="field"><label>العربون (ج.م)</label>
              <input v-model.number="form.deposit" type="number" min="0" placeholder="500" />
            </div>
            <div class="field"><label>رسوم القرية (ج.م) <span class="req">*</span></label>
              <input v-model.number="form.rentalFee" type="number" min="0" placeholder="125" :class="{ error: t.rental && !form.rentalFee }" @blur="t.rental = true" />
            </div>
            <div class="field"><label>المالك</label>
              <AppDropdown v-model="form.ownerId" :options="ownerOptions" placeholder="اختر المالك" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-users" /> الإتاحة والسعة</h4>
          <div class="fields-grid">
            <div class="field"><label>الحد الأقصى للمصرح بهم <span class="req">*</span></label>
              <input v-model.number="form.maxPermitted" type="number" min="1" placeholder="6" />
            </div>
            <div class="field"><label>المبلغ الإضافي لكل فرد زائد (ج.م)</label>
              <input v-model.number="form.extraGuestCharge" type="number" min="0" placeholder="150" />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-star" /> التقييم والوصف</h4>
          <div class="fields-grid">
            <div class="field"><label>التقييم (0-5)</label>
              <input v-model.number="form.rating" type="number" min="0" max="5" step="0.1" placeholder="4.5" />
            </div>
            <div class="field"><label>رابط الصورة الرئيسية</label>
              <input v-model="form.image" placeholder="https://..." dir="ltr" />
              <span class="field-hint">
                <i class="pi pi-info-circle" />
                الصورة الرئيسية: 1920×1080 (16:9) — الصور الثانوية: 800×450 (16:9)
              </span>
            </div>
          </div>
          <div class="field" style="margin-top: 14px">
            <label>الوصف</label>
            <textarea v-model="form.description" rows="3" placeholder="وصف تفصيلي للشاليه..." />
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
    <AppModal v-model="deleteOpen" title="حذف الشاليه" :subtitle="`هل أنت متأكد من حذف ${deleteTarget?.name}؟`" icon="pi pi-exclamation-triangle" icon-color="#ef4444" icon-bg="rgba(239,68,68,0.08)" size="sm">
      <p class="del-warn">لا يمكن التراجع عن هذا الإجراء.</p>
      <template #footer>
        <button class="btn-cancel" @click="deleteOpen = false">إلغاء</button>
        <button class="btn-danger" @click="confirmDelete"><i class="pi pi-trash" /> حذف</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useChaletsStore } from '@/stores/chalets'
import { useUsersStore } from '@/stores/users'
import { useApprovalsStore } from '@/stores/approvals'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { useLookupsStore } from '@/stores/lookups'
import { ROLES } from '@/constants/roles'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppModal from '@/components/ui/AppModal.vue'

const chaletsStore = useChaletsStore()
const usersStore = useUsersStore()
const approvalsStore = useApprovalsStore()
const auth = useAuthStore()
const toast = useToastStore()
const { hasRole } = usePermissions()
const lookupsStore = useLookupsStore()
const floorLookups = ref([])
const finishingLookups = ref([])

onMounted(async () => {
  const [floors, finishing] = await Promise.all([
    lookupsStore.list('floors'),
    lookupsStore.list('finishing_types'),
  ])
  if (floors.ok) floorLookups.value = floors.data
  if (finishing.ok) finishingLookups.value = finishing.data
})

const search = ref('')
const filterStatus = ref('')
const page = ref(1)
const perPage = 8

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'published', label: 'منشور', dot: '#10b981' },
  { value: 'draft', label: 'مسودة', dot: '#eab308' },
  { value: 'pending', label: 'قيد الاعتماد', dot: '#0ea5e9' },
]

const floorOptions = computed(() => floorLookups.value.filter((f) => f.is_active).map((f) => ({ value: f.label_ar || f.value, label: f.label_ar || f.value })))
const finishingOptions = computed(() => finishingLookups.value.filter((f) => f.is_active).map((f) => ({ value: f.name_ar || f.label_ar || f.value, label: f.name_ar || f.label_ar || f.value })))
const categoryOptions = [
  { value: 'بحري', label: 'بحري' },
  { value: 'حدائق', label: 'حدائق' },
  { value: 'اقتصادي', label: 'اقتصادي' },
]

const ownerOptions = computed(() =>
  usersStore.getByRole(ROLES.ADMIN_COMPANY).map((o) => ({ value: o.id, label: `${o.name} (${o.phone})` }))
)

const filtered = computed(() => chaletsStore.getAll({ search: search.value, status: filterStatus.value }))
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage)))
const paginated = computed(() => { const s = (page.value - 1) * perPage; return filtered.value.slice(s, s + perPage) })
const visiblePages = computed(() => { const p = []; for (let i = Math.max(1, page.value - 2); i <= Math.min(totalPages.value, page.value + 2); i++) p.push(i); return p })
watch([search, filterStatus], () => { page.value = 1 })

const stats = computed(() => [
  { label: 'إجمالي الشاليهات', value: chaletsStore.chalets.length, icon: 'pi pi-building', color: '#8b5cf6' },
  { label: 'منشور', value: chaletsStore.totalPublished, icon: 'pi pi-check-circle', color: '#10b981' },
  { label: 'مسودة', value: chaletsStore.totalDraft, icon: 'pi pi-file', color: '#eab308' },
  { label: 'قيد الاعتماد', value: chaletsStore.totalPending, icon: 'pi pi-clock', color: '#0ea5e9' },
])

function statusLabel(s) {
  return { published: 'منشور', draft: 'مسودة', pending: 'قيد الاعتماد' }[s] || s
}

function getOperatorName(operatorId) {
  if (!operatorId) return '—'
  const user = usersStore.getById(operatorId)
  return user?.name || '—'
}

// Delete
const deleteTarget = ref(null)
const deleteOpen = computed({ get: () => !!deleteTarget.value, set: (v) => { if (!v) deleteTarget.value = null } })
function confirmDelete() {
  if (!deleteTarget.value) return
  chaletsStore.deleteChalet(deleteTarget.value.id)
  toast.success('تم حذف الشاليه')
  deleteTarget.value = null
}

// Form
const formOpen = ref(false)
const editing = ref(null)
const loading = ref(false)
const errorMsg = ref('')
const form = reactive({
  name: '', chaletNumber: '', floor: '', rooms: 2, bathrooms: 1, area: 0,
  finishing: '', category: '', price: 0, deposit: 0, rentalFee: 0,
  ownerId: '', maxPermitted: 6, extraGuestCharge: 150, rating: 0,
  image: '', description: '',
})
const t = reactive({ name: false, number: false, price: false, rental: false })

const isValid = computed(() => form.name.trim() && form.chaletNumber.trim() && form.price > 0 && form.rentalFee >= 0)

function openCreate() {
  resetForm(); editing.value = null; formOpen.value = true
}
function openEdit(c) {
  resetForm(); editing.value = c
  Object.keys(form).forEach((k) => { if (c[k] !== undefined) form[k] = c[k] })
  formOpen.value = true
}
function resetForm() {
  Object.assign(form, { name: '', chaletNumber: '', floor: '', rooms: 2, bathrooms: 1, area: 0, finishing: '', category: '', price: 0, deposit: 0, rentalFee: 0, ownerId: '', maxPermitted: 6, extraGuestCharge: 150, rating: 0, image: '', description: '' })
  Object.assign(t, { name: false, number: false, price: false, rental: false })
  errorMsg.value = ''; loading.value = false
}

function handleSubmit() {
  if (!isValid.value) return
  loading.value = true; errorMsg.value = ''
  const isAdmin = hasRole(ROLES.SUPER_ADMIN) || hasRole(ROLES.ADMIN_COMPANY)

  setTimeout(() => {
    let result
    if (editing.value) {
      // Check if rating changed — needs separate approval (Story H4)
      const ratingChanged = editing.value.rating !== form.rating
      if (ratingChanged && !isAdmin) {
        approvalsStore.createApproval({ type: 'rating_change', entityId: editing.value.id, proposedData: { rating: form.rating }, previousData: { rating: editing.value.rating }, submitterId: auth.user?.id, submitterName: auth.user?.name })
        toast.info('تم إرسال تغيير التقييم للاعتماد')
      }

      if (isAdmin) {
        result = chaletsStore.update(editing.value.id, { ...form, status: 'published' })
      } else {
        // Save without the rating change (rating waits for approval)
        const formWithoutRating = { ...form, rating: editing.value.rating }
        approvalsStore.createApproval({ type: 'chalet_edit', entityId: editing.value.id, proposedData: { ...form }, previousData: { ...editing.value }, submitterId: auth.user?.id, submitterName: auth.user?.name })
        chaletsStore.update(editing.value.id, { ...formWithoutRating, status: 'pending' })
        result = { ok: true }
      }
    } else {
      if (isAdmin) {
        result = chaletsStore.create({ ...form, status: 'published' })
      } else {
        // Create without rating (rating needs approval)
        const formData = { ...form, rating: 0 }
        result = chaletsStore.create({ ...formData, status: 'pending' })
        if (result.ok) {
          approvalsStore.createApproval({ type: 'chalet_create', entityId: result.chalet.id, proposedData: { ...form }, submitterId: auth.user?.id, submitterName: auth.user?.name })
          if (form.rating > 0) {
            approvalsStore.createApproval({ type: 'rating_change', entityId: result.chalet.id, proposedData: { rating: form.rating }, previousData: { rating: 0 }, submitterId: auth.user?.id, submitterName: auth.user?.name })
          }
        }
      }
    }
    loading.value = false
    if (result.ok) {
      toast.success(editing.value ? (isAdmin ? 'تم تحديث الشاليه' : 'تم إرسال التعديلات للاعتماد') : (isAdmin ? 'تم إنشاء الشاليه' : 'تم إرسال الشاليه للاعتماد'))
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
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35); }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.mini-stat { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
.mini-stat-icon { width: 40px; height: 40px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 10%, transparent); display: flex; align-items: center; justify-content: center; }
.mini-stat-icon i { font-size: 18px; color: var(--accent); }
.mini-stat-value { display: block; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }
.mini-stat-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }

.filters-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.filters-row { display: flex; align-items: center; gap: 12px; }
.search-box { position: relative; flex: 1; max-width: 360px; }
.search-box i.pi-search { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #94a3b8; }
.search-box input { width: 100%; height: 40px; padding: 0 40px 0 14px; padding-right: 40px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #f8fafc; transition: all 0.2s; outline: none; }
.search-box input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.search-box input::placeholder { color: #94a3b8; }
.search-clear { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; font-size: 12px; }
.filter-group { display: flex; gap: 8px; }

.table-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 14px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.data-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.table-row { transition: background 0.15s; }
.table-row:hover { background: #fafbfc; }
.table-row:last-child td { border-bottom: none; }

.chalet-cell { display: flex; align-items: center; gap: 12px; }
.chalet-thumb { width: 42px; height: 42px; border-radius: 10px; overflow: hidden; background: #f1f5f9; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.chalet-thumb img { width: 100%; height: 100%; object-fit: cover; }
.chalet-thumb i { font-size: 18px; color: #94a3b8; }
.chalet-name { display: block; font-weight: 600; color: #1e293b; font-size: 13.5px; }
.chalet-num { display: block; font-size: 12px; color: #94a3b8; direction: ltr; }
.cell-num { font-weight: 600; }

.status-badge { display: inline-flex; padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.status-badge.published { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-badge.draft { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.status-badge.pending { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }

.actions-cell { display: flex; align-items: center; gap: 4px; }
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

.pagination { display: flex; align-items: center; justify-content: center; gap: 4px; padding: 16px; border-top: 1px solid #f1f5f9; }
.pag-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #475569; cursor: pointer; font-size: 13px; font-weight: 600; font-family: inherit; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.pag-btn:hover:not(:disabled) { background: #f8fafc; }
.pag-btn.active { background: #f97316; border-color: #f97316; color: #fff; }
.pag-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pag-info { font-size: 12.5px; color: #94a3b8; margin-right: 12px; }

/* Modal Form */
.form-section { margin-bottom: 24px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
.section-label i { font-size: 15px; color: #f97316; }
.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }
.field input, .field textarea { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field textarea { height: auto; padding: 10px 14px; resize: vertical; }
.field input:focus, .field textarea:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.field-hint { display: flex; align-items: center; gap: 4px; font-size: 11.5px; color: #94a3b8; }
.field-hint i { font-size: 11px; }
.field input.error { border-color: #ef4444; background: #fef2f2; }
.field input::placeholder, .field textarea::placeholder { color: #94a3b8; }
.form-error { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #ef4444; font-size: 13.5px; font-weight: 500; margin-bottom: 8px; }
.del-warn { font-size: 13.5px; color: #64748b; margin: 0; }

.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #ef4444; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-danger:hover { background: #dc2626; }

.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .btn-primary { width: 100%; justify-content: center; }
  .filters-row { flex-direction: column; }
  .search-box { max-width: 100%; }
  .stats-row { gap: 8px; }
  .mini-stat { padding: 12px; }
  .table-card { overflow-x: auto; }
  .data-table { min-width: 700px; }
  .data-table th, .data-table td { padding: 10px 12px; font-size: 12.5px; }
  .fields-grid { grid-template-columns: 1fr; }
}
</style>
