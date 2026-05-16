<template>
  <div class="roles-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-key" /></div>
      <div class="page-header-text">
        <h1 class="page-title">الأدوار</h1>
        <p class="page-desc">أدوار النظام للقراءة فقط، وأدوار العمل قابلة للتعديل</p>
      </div>
      <button class="btn-primary" @click="openCreate">
        <i class="pi pi-plus" /> دور جديد
      </button>
    </div>

    <!-- Type tabs -->
    <div class="tabs">
      <button :class="['tab', { active: typeFilter === 'all' }]" @click="typeFilter = 'all'">
        الكل <span class="tab-count">{{ rows.length }}</span>
      </button>
      <button :class="['tab', { active: typeFilter === 'SYSTEM' }]" @click="typeFilter = 'SYSTEM'">
        أدوار النظام <span class="tab-count">{{ systemRows.length }}</span>
      </button>
      <button :class="['tab', { active: typeFilter === 'BUSINESS' }]" @click="typeFilter = 'BUSINESS'">
        أدوار العمل <span class="tab-count">{{ businessRows.length }}</span>
      </button>
    </div>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!visibleRows.length" class="empty">
        <i class="pi pi-key" />
        <p>لا توجد أدوار في هذا القسم</p>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>الاسم</th>
            <th>النوع</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in visibleRows" :key="row.id">
            <td class="ltr"><strong>{{ row.code }}</strong></td>
            <td>{{ row.name || '—' }}</td>
            <td>
              <span :class="['type-badge', (row.type || 'BUSINESS').toLowerCase()]">
                <i :class="row.type === 'SYSTEM' ? 'pi pi-lock' : 'pi pi-briefcase'" />
                {{ row.type === 'SYSTEM' ? 'نظام' : 'عمل' }}
              </span>
            </td>
            <td class="actions-col">
              <template v-if="row.type === 'BUSINESS'">
                <button class="icon-btn edit" @click="openEdit(row)"><i class="pi pi-pencil" /></button>
                <button class="icon-btn delete" @click="confirmDelete(row)"><i class="pi pi-trash" /></button>
              </template>
              <span v-else class="muted-sm">للقراءة فقط</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- Create / Edit -->
    <AppModal
      v-model="formOpen"
      :title="editing ? 'تعديل الدور' : 'إضافة دور عمل'"
      icon="pi pi-key"
      icon-color="#ea580c"
      icon-bg="rgba(249,115,22,0.08)"
      size="sm"
    >
      <form class="form-grid" @submit.prevent="handleSubmit">
        <label class="field">
          <span class="field-label">الكود <span class="req">*</span></span>
          <input v-model="form.code" type="text" class="field-input ltr" required />
        </label>
        <label class="field">
          <span class="field-label">الاسم</span>
          <input v-model="form.name" type="text" class="field-input" />
        </label>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="formOpen = false">إلغاء</button>
          <button type="submit" class="btn-primary" :disabled="saving || !form.code">
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
      title="حذف الدور؟"
      icon="pi pi-exclamation-triangle"
      icon-color="#ef4444"
      icon-bg="rgba(239,68,68,0.08)"
      size="sm"
    >
      <p class="confirm-text">هل أنت متأكد من حذف <strong>{{ pendingDelete?.name || pendingDelete?.code }}</strong>؟</p>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRolesStore } from '@/stores/roles'
import { useToastStore } from '@/stores/toast'
import AppModal from '@/components/ui/AppModal.vue'

const rolesStore = useRolesStore()
const toast = useToastStore()

const rows = ref([])
const loading = ref(true)
const typeFilter = ref('all')

const systemRows = computed(() => rows.value.filter((r) => r.type === 'SYSTEM'))
const businessRows = computed(() => rows.value.filter((r) => r.type === 'BUSINESS'))
const visibleRows = computed(() => {
  if (typeFilter.value === 'SYSTEM') return systemRows.value
  if (typeFilter.value === 'BUSINESS') return businessRows.value
  return rows.value
})

async function load() {
  loading.value = true
  const r = await rolesStore.listAll()
  loading.value = false
  if (r.ok) rows.value = r.data
  else toast.error(r.error)
}

// Form
const formOpen = ref(false)
const editing = ref(null)
const saving = ref(false)
const form = reactive({ code: '', name: '' })

function openCreate() {
  editing.value = null
  form.code = ''
  form.name = ''
  formOpen.value = true
}

function openEdit(row) {
  editing.value = row
  form.code = row.code || ''
  form.name = row.name || ''
  formOpen.value = true
}

async function handleSubmit() {
  if (!form.code) return
  saving.value = true
  const payload = { code: form.code, name: form.name }
  const r = editing.value
    ? await rolesStore.update(editing.value.id, payload)
    : await rolesStore.create(payload)
  saving.value = false
  if (r.ok) {
    toast.success(editing.value ? 'تم التحديث' : 'تمت الإضافة')
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
  const r = await rolesStore.remove(pendingDelete.value.id)
  deleting.value = false
  if (r.ok) {
    toast.success('تم الحذف')
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
.roles-page { display: flex; flex-direction: column; gap: 16px; }
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
  background: linear-gradient(135deg, #f97316, #ea580c); border: 1px solid #ea580c; color: #fff;
  font-family: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35); transition: all 0.15s;
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

.tabs {
  display: flex; flex-wrap: wrap; gap: 6px;
  padding: 8px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px;
}
.tab {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 8px;
  background: transparent; border: none;
  color: #64748b; font-family: inherit; font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.15s;
}
.tab:hover { background: #f1f5f9; color: #475569; }
.tab.active {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #c2410c;
}
.tab-count {
  padding: 2px 8px; border-radius: 999px;
  background: #f1f5f9; color: #94a3b8;
  font-size: 11px; font-weight: 800;
}
.tab.active .tab-count { background: #fff; color: #c2410c; }

.bf-section {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 10px 12px; text-align: right; font-size: 11.5px; font-weight: 800; color: #64748b;
  background: #fafbfc; border-bottom: 1px solid #f1f5f9;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.data-table td { padding: 12px; font-size: 13.5px; color: #0f172a; border-bottom: 1px solid #f8fafc; }
.data-table tr:last-child td { border-bottom: none; }
.ltr { direction: ltr; text-align: right; }
.actions-col { width: 140px; text-align: end; white-space: nowrap; }
.muted-sm { font-size: 11.5px; color: #94a3b8; }

.type-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 12px; border-radius: 999px;
  font-size: 11.5px; font-weight: 800; border: 1px solid;
}
.type-badge i { font-size: 10.5px; }
.type-badge.system { background: rgba(100, 116, 139, 0.10); color: #475569; border-color: rgba(100, 116, 139, 0.25); }
.type-badge.business { background: rgba(14, 165, 233, 0.10); color: #0369a1; border-color: rgba(14, 165, 233, 0.25); }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: #fff; border: 1px solid #e2e8f0; color: #64748b;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s; margin-inline-start: 4px;
}
.icon-btn.edit:hover { border-color: #fed7aa; color: #ea580c; }
.icon-btn.delete:hover { border-color: #fecaca; color: #ef4444; }
.icon-btn i { font-size: 13px; }

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

.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; margin-top: 6px; }
.confirm-text { font-size: 14px; color: #475569; margin: 0 0 14px; line-height: 1.6; }
.confirm-text strong { color: #0f172a; }
</style>
