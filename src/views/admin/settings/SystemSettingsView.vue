<template>
  <div class="ss-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-cog" /></div>
      <div class="page-header-text">
        <h1 class="page-title">إعدادات النظام</h1>
        <p class="page-desc">قائمة قيم الإعدادات العامة (key / value)</p>
      </div>
    </div>

    <section class="bf-section">
      <div v-if="loading" class="empty"><i class="pi pi-spin pi-spinner" /> جاري التحميل...</div>
      <div v-else-if="!rows.length" class="empty">
        <i class="pi pi-inbox" />
        <p>لا توجد إعدادات</p>
      </div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>المفتاح</th>
            <th>القيمة</th>
            <th>آخر تحديث</th>
            <th class="actions-col"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td class="ltr"><strong>{{ row.key }}</strong></td>
            <td>
              <input
                v-if="editing === row.key"
                v-model="draft"
                class="inline-input"
                :disabled="savingKey === row.key"
                @keyup.enter="save(row)"
                @keyup.esc="cancel"
              />
              <span v-else class="value-text">{{ row.value || '—' }}</span>
            </td>
            <td class="muted">{{ row.updated_at ? toDisplayDateTime(row.updated_at) : '—' }}</td>
            <td class="actions-col">
              <template v-if="editing === row.key">
                <button class="icon-btn save" :disabled="savingKey === row.key" @click="save(row)">
                  <i v-if="savingKey === row.key" class="pi pi-spin pi-spinner" />
                  <i v-else class="pi pi-check" />
                </button>
                <button class="icon-btn cancel" @click="cancel"><i class="pi pi-times" /></button>
              </template>
              <button v-else class="icon-btn edit" @click="startEdit(row)">
                <i class="pi pi-pencil" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSystemSettingsStore } from '@/stores/systemSettings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDateTime } from '@/utils/date'

const settings = useSystemSettingsStore()
const toast = useToastStore()

const rows = ref([])
const loading = ref(true)
const editing = ref(null)
const draft = ref('')
const savingKey = ref(null)

async function load() {
  loading.value = true
  const r = await settings.list()
  loading.value = false
  if (r.ok) rows.value = r.data
  else toast.error(r.error)
}

function startEdit(row) {
  editing.value = row.key
  draft.value = row.value ?? ''
}

function cancel() {
  editing.value = null
  draft.value = ''
}

async function save(row) {
  if (savingKey.value) return
  savingKey.value = row.key
  const r = await settings.update(row.key, draft.value)
  savingKey.value = null
  if (r.ok) {
    toast.success('تم التحديث')
    const idx = rows.value.findIndex((x) => x.key === row.key)
    if (idx !== -1) {
      rows.value[idx] = {
        ...rows.value[idx],
        value: draft.value,
        updated_at: r.data?.updated_at ?? new Date().toISOString(),
      }
    }
    cancel()
  } else {
    toast.error(r.error)
  }
}

onMounted(load)
</script>

<style scoped>
.ss-page { display: flex; flex-direction: column; gap: 16px; }
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

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  padding: 10px 12px; text-align: right;
  font-size: 11.5px; font-weight: 800; color: #64748b;
  background: #fafbfc; border-bottom: 1px solid #f1f5f9;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.data-table td { padding: 12px 12px; font-size: 13.5px; color: #0f172a; border-bottom: 1px solid #f8fafc; }
.data-table tr:last-child td { border-bottom: none; }
.ltr { direction: ltr; text-align: right; }
.muted { color: #94a3b8; font-size: 12.5px; }
.value-text { color: #0f172a; font-weight: 600; }
.actions-col { width: 100px; text-align: end; white-space: nowrap; }

.inline-input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #f97316;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
  color: #0f172a;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12);
}
.inline-input:focus { outline: none; }

.icon-btn {
  width: 32px; height: 32px; border-radius: 8px;
  background: #fff; border: 1px solid #e2e8f0; color: #64748b;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
  transition: all 0.15s; margin-inline-start: 4px;
}
.icon-btn.edit:hover { border-color: #fed7aa; color: #ea580c; }
.icon-btn.save { border-color: rgba(16, 185, 129, 0.40); color: #059669; }
.icon-btn.save:hover { background: rgba(16, 185, 129, 0.10); }
.icon-btn.cancel:hover { border-color: #fecaca; color: #ef4444; }
.icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.icon-btn i { font-size: 13px; }

.empty {
  padding: 40px 20px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty i.pi-spin { color: #f97316; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }
</style>
