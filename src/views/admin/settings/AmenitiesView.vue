<template>
  <div class="amenities-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">إدارة الكماليات</h1>
        <p class="page-desc">إضافة وإدارة الكماليات التي تظهر في تفاصيل الشاليهات</p>
      </div>
      <button class="btn-primary" @click="openAdd">
        <i class="pi pi-plus" /> إضافة كمالية
      </button>
    </div>

    <div class="amenities-grid">
      <div v-if="amenities.length === 0" class="empty-card">
        <div class="empty-icon"><i class="pi pi-sparkles" /></div>
        <h3>لا توجد كماليات</h3>
        <p>أضف كماليات جديدة لتظهر في تفاصيل الشاليهات</p>
      </div>

      <div v-for="a in amenities" :key="a.id" class="amenity-card">
        <div class="amenity-icon-wrap">
          <img v-if="a.customIcon" :src="a.customIcon" class="amenity-custom-img" />
          <i v-else :class="a.icon" />
        </div>
        <div class="amenity-info">
          <span class="amenity-name">{{ a.label }}</span>
          <span class="amenity-key">{{ a.key }}</span>
        </div>
        <div class="amenity-actions">
          <button class="item-btn" @click="openEdit(a)" title="تعديل"><i class="pi pi-pen-to-square" /></button>
          <button class="item-btn danger" @click="deleteTarget = a" title="حذف"><i class="pi pi-trash" /></button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <AppModal v-model="formOpen" :title="editing ? 'تعديل كمالية' : 'إضافة كمالية جديدة'" icon="pi pi-sparkles" size="sm" @close="resetForm">
      <div class="fields-stack">
        <div class="field">
          <label>المفتاح (بالإنجليزي) <span class="req">*</span></label>
          <input v-model="form.key" placeholder="مثال: wifi" dir="ltr" :disabled="!!editing" />
        </div>
        <div class="field">
          <label>الاسم بالعربي <span class="req">*</span></label>
          <input v-model="form.label" placeholder="مثال: واي فاي" />
        </div>
        <div class="field">
          <label>الأيقونة <span class="req">*</span></label>
          <div class="icon-tabs">
            <button type="button" class="icon-tab" :class="{ active: iconTab === 'picker' }" @click="iconTab = 'picker'">اختر أيقونة</button>
            <button type="button" class="icon-tab" :class="{ active: iconTab === 'upload' }" @click="iconTab = 'upload'">رفع صورة</button>
          </div>
          <div v-if="iconTab === 'picker'">
            <IconPicker v-model="form.icon" />
          </div>
          <div v-else class="upload-area">
            <input type="file" accept=".svg,.png,.jpg,.jpeg" @change="handleIconUpload" ref="fileInput" />
            <p class="upload-hint">الحد الأقصى 500KB — SVG, PNG, JPG</p>
          </div>
          <div v-if="form.customIcon || form.icon" class="icon-preview">
            <img v-if="form.customIcon" :src="form.customIcon" class="preview-img" />
            <i v-else :class="form.icon" />
            <span>{{ form.customIcon ? 'صورة مرفوعة' : form.icon }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="btn-cancel" @click="formOpen = false">إلغاء</button>
        <button class="btn-submit" :disabled="!isValid" @click="handleSubmit">
          <i :class="editing ? 'pi pi-check' : 'pi pi-plus'" /> {{ editing ? 'حفظ' : 'إضافة' }}
        </button>
      </template>
    </AppModal>

    <!-- Delete Modal -->
    <AppModal v-model="deleteOpen" title="حذف الكمالية" :subtitle="`حذف ${deleteTarget?.label}؟`" icon="pi pi-exclamation-triangle" icon-color="#ef4444" icon-bg="rgba(239,68,68,0.08)" size="sm">
      <p class="del-warn">سيتم إزالتها من جميع الشاليهات.</p>
      <template #footer>
        <button class="btn-cancel" @click="deleteOpen = false">إلغاء</button>
        <button class="btn-danger" @click="confirmDelete"><i class="pi pi-trash" /> حذف</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'
import IconPicker from '@/components/admin/shared/IconPicker.vue'

const toast = useToastStore()
const STORAGE_KEY = 'pb_amenities'

// Load amenities
function loadAmenities() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && saved.length > 0) return saved
  } catch { /* */ }
  // Default seed
  const defaults = [
    { id: 'am1', key: 'wifi', label: 'واي فاي', icon: 'pi pi-wifi' },
    { id: 'am2', key: 'ac', label: 'تكييف', icon: 'pi pi-snowflake' },
    { id: 'am3', key: 'kitchen', label: 'مطبخ مجهز', icon: 'pi pi-box' },
    { id: 'am4', key: 'parking', label: 'موقف سيارات', icon: 'pi pi-car' },
    { id: 'am5', key: 'pool', label: 'حمام سباحة', icon: 'pi pi-wave-pulse' },
    { id: 'am6', key: 'tv', label: 'تلفزيون', icon: 'pi pi-desktop' },
    { id: 'am7', key: 'washer', label: 'غسالة', icon: 'pi pi-sync' },
    { id: 'am8', key: 'balcony', label: 'شرفة خاصة', icon: 'pi pi-sun' },
    { id: 'am9', key: 'iron', label: 'مكواة', icon: 'pi pi-wrench' },
    { id: 'am10', key: 'bbq', label: 'شواية', icon: 'pi pi-fire' },
  ]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
  return defaults
}

const amenities = ref(loadAmenities())
function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(amenities.value)) }

// Form
const formOpen = ref(false)
const editing = ref(null)
const form = reactive({ key: '', label: '', icon: '', customIcon: '' })
const iconTab = ref('picker')
const fileInput = ref(null)
const isValid = computed(() => form.key.trim() && form.label.trim() && (form.icon.trim() || form.customIcon))

function openAdd() { resetForm(); editing.value = null; formOpen.value = true }
function openEdit(a) { resetForm(); editing.value = a; form.key = a.key; form.label = a.label; form.icon = a.icon; form.customIcon = a.customIcon || ''; iconTab.value = a.customIcon ? 'upload' : 'picker'; formOpen.value = true }
function resetForm() { Object.assign(form, { key: '', label: '', icon: '', customIcon: '' }); iconTab.value = 'picker' }

function handleIconUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 500 * 1024) {
    toast.error('حجم الملف يتجاوز 500KB')
    e.target.value = ''
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    form.customIcon = reader.result
    form.icon = ''
  }
  reader.readAsDataURL(file)
}

function handleSubmit() {
  if (!isValid.value) return
  if (editing.value) {
    const idx = amenities.value.findIndex((a) => a.id === editing.value.id)
    if (idx !== -1) {
      amenities.value[idx] = { ...amenities.value[idx], label: form.label, icon: form.icon, customIcon: form.customIcon || '' }
    }
    toast.success('تم التحديث')
  } else {
    if (amenities.value.find((a) => a.key === form.key.trim())) {
      toast.error('هذا المفتاح موجود بالفعل')
      return
    }
    amenities.value.push({
      id: Date.now().toString(36),
      key: form.key.trim(),
      label: form.label.trim(),
      icon: form.icon.trim(),
      customIcon: form.customIcon || '',
    })
    toast.success('تمت الإضافة')
  }
  persist()
  formOpen.value = false
  resetForm()
}

// Delete
const deleteTarget = ref(null)
const deleteOpen = computed({ get: () => !!deleteTarget.value, set: (v) => { if (!v) deleteTarget.value = null } })
function confirmDelete() {
  if (!deleteTarget.value) return
  amenities.value = amenities.value.filter((a) => a.id !== deleteTarget.value.id)
  persist()
  toast.success('تم الحذف')
  deleteTarget.value = null
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-primary:hover { transform: translateY(-1px); }

.amenities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }

.amenity-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 14px; transition: all 0.15s; }
.amenity-card:hover { border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }

.amenity-icon-wrap { width: 42px; height: 42px; border-radius: 10px; background: rgba(249, 115, 22, 0.06); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.amenity-icon-wrap i { font-size: 20px; color: #f97316; }

.amenity-info { flex: 1; min-width: 0; }
.amenity-name { display: block; font-size: 14px; font-weight: 600; color: #1e293b; }
.amenity-key { display: block; font-size: 12px; color: #94a3b8; direction: ltr; }

.amenity-actions { display: flex; gap: 2px; opacity: 0; transition: opacity 0.15s; }
.amenity-card:hover .amenity-actions { opacity: 1; }
.item-btn { width: 30px; height: 30px; border-radius: 6px; border: none; background: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.12s; }
.item-btn:hover { background: #f1f5f9; color: #475569; }
.item-btn.danger { color: #ef4444; }
.item-btn.danger:hover { background: rgba(239, 68, 68, 0.08); }

.empty-card { grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-card p { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Form */
.fields-stack { display: flex; flex-direction: column; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }
.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.field input:disabled { opacity: 0.6; cursor: not-allowed; }
.field input::placeholder { color: #94a3b8; }

.icon-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
.icon-tab { padding: 6px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 12.5px; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.icon-tab.active { background: #f97316; color: #fff; border-color: #f97316; }
.icon-tab:hover:not(.active) { border-color: #f97316; color: #f97316; }

.upload-area { margin-top: 4px; }
.upload-area input[type="file"] { font-size: 13px; font-family: inherit; }
.upload-hint { font-size: 11px; color: #94a3b8; margin: 4px 0 0; }

.icon-preview { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 8px; margin-top: 4px; }
.icon-preview i { font-size: 18px; color: #f97316; }
.icon-preview span { font-size: 12px; color: #64748b; direction: ltr; }
.preview-img { width: 24px; height: 24px; object-fit: contain; }

.amenity-custom-img { width: 22px; height: 22px; object-fit: contain; }

.del-warn { font-size: 13.5px; color: #64748b; margin: 0; }
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #ef4444; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-danger:hover { background: #dc2626; }
</style>
