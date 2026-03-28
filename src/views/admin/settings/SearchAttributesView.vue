<template>
  <div class="attributes-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">خيارات البحث</h1>
        <p class="page-desc">إدارة قيم البحث: الدور، عدد الغرف، التشطيب، الإطلالة</p>
      </div>
    </div>

    <div class="categories-grid">
      <div v-for="cat in categories" :key="cat.key" class="cat-card">
        <div class="cat-header">
          <div class="cat-title">
            <i :class="cat.icon" :style="{ color: cat.color }" />
            <h3>{{ cat.label }}</h3>
          </div>
          <button class="cat-add-btn" @click="openAdd(cat.key)">
            <i class="pi pi-plus" />
          </button>
        </div>

        <div class="cat-items">
          <div v-if="getItems(cat.key).length === 0" class="cat-empty">
            <span>لا توجد قيم</span>
          </div>
          <div v-for="item in getItems(cat.key)" :key="item.id" class="cat-item">
            <div class="item-info">
              <span :class="['item-dot', { active: item.active }]" />
              <span v-if="!item._editing" class="item-name">{{ item.name }}</span>
              <input v-else v-model="item._editValue" class="item-edit-input" @keyup.enter="saveEdit(cat.key, item)" @keyup.escape="cancelEdit(item)" ref="editInputs" />
            </div>
            <div class="item-actions">
              <button v-if="!item._editing" class="item-btn" @click="startEdit(item)" title="تعديل">
                <i class="pi pi-pen-to-square" />
              </button>
              <button v-if="item._editing" class="item-btn save" @click="saveEdit(cat.key, item)" title="حفظ">
                <i class="pi pi-check" />
              </button>
              <button v-if="item._editing" class="item-btn" @click="cancelEdit(item)" title="إلغاء">
                <i class="pi pi-times" />
              </button>
              <button class="item-btn" :class="item.active ? 'warn' : 'ok'" @click="toggleItem(cat.key, item)" :title="item.active ? 'تعطيل' : 'تفعيل'">
                <i :class="item.active ? 'pi pi-eye-slash' : 'pi pi-eye'" />
              </button>
              <button class="item-btn danger" @click="removeItem(cat.key, item)" title="حذف">
                <i class="pi pi-trash" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <AppModal v-model="addOpen" title="إضافة قيمة جديدة" :subtitle="`إضافة قيمة لـ${addCategoryLabel}`" icon="pi pi-plus" size="sm">
      <div class="field">
        <label>القيمة <span class="req">*</span></label>
        <input v-model="addValue" placeholder="أدخل القيمة..." @keyup.enter="confirmAdd" />
      </div>
      <Transition name="slide">
        <div v-if="addError" class="form-error"><i class="pi pi-exclamation-circle" /> {{ addError }}</div>
      </Transition>
      <template #footer>
        <button class="btn-cancel" @click="addOpen = false">إلغاء</button>
        <button class="btn-submit" :disabled="!addValue.trim()" @click="confirmAdd"><i class="pi pi-plus" /> إضافة</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useSearchAttributesStore, CATEGORY_LABELS } from '@/stores/searchAttributes'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'

const store = useSearchAttributesStore()
const toast = useToastStore()

const categories = [
  { key: 'floor', label: 'الدور', icon: 'pi pi-building', color: '#8b5cf6' },
  { key: 'rooms', label: 'عدد الغرف', icon: 'pi pi-th-large', color: '#0ea5e9' },
  { key: 'finishing', label: 'التشطيب', icon: 'pi pi-sparkles', color: '#f97316' },
  { key: 'view', label: 'الإطلالة', icon: 'pi pi-eye', color: '#10b981' },
]

function getItems(cat) {
  return store.getCategory(cat).map((i) => reactive({ ...i, _editing: false, _editValue: i.name }))
}

function startEdit(item) { item._editing = true; item._editValue = item.name }
function cancelEdit(item) { item._editing = false }
function saveEdit(cat, item) {
  if (!item._editValue.trim()) return
  store.updateItem(cat, item.id, { name: item._editValue.trim() })
  item._editing = false
  toast.success('تم التحديث')
}
function toggleItem(cat, item) {
  const r = store.toggleItem(cat, item.id)
  if (r.ok) toast.success(r.active ? 'تم التفعيل' : 'تم التعطيل')
}
function removeItem(cat, item) {
  store.deleteItem(cat, item.id)
  toast.success('تم الحذف')
}

// Add modal
const addOpen = ref(false)
const addCategory = ref('')
const addValue = ref('')
const addError = ref('')
const addCategoryLabel = ref('')

function openAdd(cat) {
  addCategory.value = cat
  addCategoryLabel.value = CATEGORY_LABELS[cat] || cat
  addValue.value = ''
  addError.value = ''
  addOpen.value = true
}

function confirmAdd() {
  if (!addValue.value.trim()) return
  const r = store.addItem(addCategory.value, addValue.value)
  if (r.ok) {
    toast.success('تمت الإضافة')
    addOpen.value = false
  } else {
    addError.value = r.error
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.categories-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.cat-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
.cat-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.cat-title { display: flex; align-items: center; gap: 10px; }
.cat-title i { font-size: 18px; }
.cat-title h3 { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.cat-add-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px dashed #cbd5e1; background: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.15s; }
.cat-add-btn:hover { border-color: #f97316; color: #f97316; background: rgba(249, 115, 22, 0.04); }

.cat-items { padding: 8px; }
.cat-empty { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; }

.cat-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 10px; transition: background 0.15s; }
.cat-item:hover { background: #f8fafc; }
.item-info { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.item-dot { width: 7px; height: 7px; border-radius: 50%; background: #cbd5e1; flex-shrink: 0; }
.item-dot.active { background: #10b981; }
.item-name { font-size: 14px; color: #1e293b; font-weight: 500; }
.item-edit-input { height: 32px; padding: 0 10px; border: 1px solid #f97316; border-radius: 8px; font-size: 13px; font-family: inherit; color: #1e293b; outline: none; background: #fff; width: 120px; }

.item-actions { display: flex; gap: 2px; opacity: 0; transition: opacity 0.15s; }
.cat-item:hover .item-actions { opacity: 1; }
.item-btn { width: 28px; height: 28px; border-radius: 6px; border: none; background: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.12s; }
.item-btn:hover { background: #f1f5f9; color: #475569; }
.item-btn.save { color: #10b981; }
.item-btn.save:hover { background: rgba(16, 185, 129, 0.08); }
.item-btn.warn { color: #eab308; }
.item-btn.warn:hover { background: rgba(234, 179, 8, 0.08); }
.item-btn.ok { color: #10b981; }
.item-btn.ok:hover { background: rgba(16, 185, 129, 0.08); }
.item-btn.danger { color: #ef4444; }
.item-btn.danger:hover { background: rgba(239, 68, 68, 0.08); }

/* Modal form */
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }
.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.form-error { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; color: #ef4444; font-size: 13.5px; font-weight: 500; margin-top: 12px; }
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

@media (max-width: 768px) { .categories-grid { grid-template-columns: 1fr; } }
</style>
