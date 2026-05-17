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
      <div v-else class="table-wrap">
        <table class="p-table">
          <thead>
            <tr>
              <th>الإعداد</th>
              <th>النطاق</th>
              <th>القيمة</th>
              <th>آخر تحديث</th>
              <th class="act-col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.key" class="p-row">
              <td>
                <div class="setting-key">
                  <span class="t-strong">{{ keyLabel(row.key) }}</span>
                  <code class="key-code">{{ row.key }}</code>
                </div>
              </td>
              <td>
                <span :class="['t-status', scopeTone(row.scope)]">{{ scopeLabel(row.scope) }}</span>
              </td>
              <td>
                <textarea
                  v-if="editing === row.key && isLong(row.key)"
                  v-model="draft"
                  class="inline-input inline-area"
                  rows="4"
                  :disabled="savingKey === row.key"
                  @keyup.esc="cancel"
                />
                <input
                  v-else-if="editing === row.key"
                  v-model="draft"
                  class="inline-input"
                  :disabled="savingKey === row.key"
                  @keyup.enter="save(row)"
                  @keyup.esc="cancel"
                />
                <span v-else :class="['value-text', { 'value-empty': !row.value, 'value-clamp': isLong(row.key) }]">
                  {{ row.value || '— غير محدد' }}
                </span>
              </td>
              <td class="t-muted">{{ row.updated_at ? toDisplayDateTime(row.updated_at) : '—' }}</td>
              <td class="act-col">
                <span class="t-actions">
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
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

// Human-readable labels for the known setting keys (falls back to the raw
// key for any new key the backend introduces).
const KEY_LABELS = {
  site_name: 'اسم الموقع',
  contact_email: 'البريد الإلكتروني للتواصل',
  contact_phone: 'هاتف التواصل',
  site_terms: 'شروط وأحكام الموقع',
  village_terms: 'شروط وأحكام القرية',
}
// Keys whose value is long-form text → edited via a textarea.
const LONG_KEYS = new Set(['site_terms', 'village_terms'])

function keyLabel(k) { return KEY_LABELS[k] || k }
function isLong(k) { return LONG_KEYS.has(k) }
function scopeLabel(s) { return { SITE: 'الموقع', VILLAGE: 'القرية' }[s] || s || '—' }
function scopeTone(s) { return { SITE: 'info', VILLAGE: 'neutral' }[s] || 'neutral' }

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
    toast.saved('الإعداد')
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

.setting-key { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.key-code {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  /* Keep the key's characters in LTR order, but anchor the block to the
     column's start (right edge in this RTL table) so it lines up under
     the label above instead of drifting to the far (left) side. */
  direction: ltr;
  text-align: right;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.value-text { color: #0f172a; font-weight: 600; }
.value-empty { color: #cbd5e1; font-weight: 700; }
.value-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 500;
  color: #475569;
  max-width: 420px;
}

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
.inline-area { resize: vertical; line-height: 1.6; min-width: 280px; }

.empty {
  padding: 40px 20px; text-align: center; color: #94a3b8;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.empty i { font-size: 28px; color: #cbd5e1; }
.empty i.pi-spin { color: #f97316; }
.empty p { margin: 0; font-size: 14px; font-weight: 600; }
</style>
