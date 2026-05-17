<template>
  <div class="qr-page">
    <div class="page-header">
      <div class="page-icon"><i class="pi pi-qrcode" /></div>
      <div class="page-header-text">
        <h1 class="page-title">مسح QR</h1>
        <p class="page-desc">امسح رمز الحجز أو أدخل كود الحجز يدويًا</p>
      </div>
    </div>

    <!-- Scanner -->
    <section v-if="mode === 'scan'" class="bf-section qr-scan-card">
      <div id="qr-reader" class="qr-reader"></div>

      <div class="qr-scan-actions">
        <button class="btn-confirm" :disabled="busy" @click="toggleScanner">
          <i :class="scanning ? 'pi pi-stop-circle' : 'pi pi-camera'" />
          {{ scanning ? 'إيقاف الكاميرا' : 'بدء المسح' }}
        </button>
        <button class="btn-secondary" :disabled="busy" @click="pickImage">
          <i v-if="busy" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-image" />
          رفع صورة
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="qr-file"
          @change="onPickFile"
        />
      </div>

      <p v-if="cameraError" class="qr-notice warn">
        <i class="pi pi-exclamation-triangle" />
        تعذّر تشغيل الكاميرا — استخدم الإدخال اليدوي بالأسفل.
      </p>

      <div class="qr-manual">
        <span class="qr-manual-label">إدخال يدوي</span>
        <div class="qr-manual-row">
          <input
            v-model.trim="manualCode"
            type="text"
            class="qr-input ltr"
            placeholder="كود الحجز"
            @keyup.enter="resolve(manualCode)"
          />
          <button class="btn-secondary" :disabled="!manualCode || busy" @click="resolve(manualCode)">
            <i v-if="busy" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-search" />
            بحث
          </button>
        </div>
      </div>
    </section>

    <!-- Result -->
    <section v-else-if="result" :class="['qr-result', stateClass]">
      <div class="qr-result-head">
        <span class="t-code">{{ result.booking_code }}</span>
        <span :class="['t-status', statusClass(result.status)]">{{ statusLabel(result.status) }}</span>
      </div>

      <!-- Banner per state -->
      <div :class="['qr-banner', stateClass]">
        <i :class="bannerIcon" />
        <span>{{ bannerText }}</span>
      </div>

      <template v-if="state !== 'EXPIRED'">
        <!-- Summary -->
        <div class="qr-summary">
          <div class="qr-sum-cell">
            <span class="qr-sum-label"><i class="pi pi-home" /> الشاليه</span>
            <strong>{{ result.chalet?.name || '—' }}</strong>
            <small v-if="result.chalet?.chalet_code" class="ltr">{{ result.chalet.chalet_code }}</small>
          </div>
          <div class="qr-sum-cell">
            <span class="qr-sum-label"><i class="pi pi-sign-in" /> الدخول</span>
            <strong>{{ toDisplayDate(result.check_in) }}</strong>
          </div>
          <div class="qr-sum-cell">
            <span class="qr-sum-label"><i class="pi pi-sign-out" /> الخروج</span>
            <strong>{{ toDisplayDate(result.check_out) }}</strong>
          </div>
          <div class="qr-sum-cell">
            <span class="qr-sum-label"><i class="pi pi-moon" /> الليالي</span>
            <strong>{{ result.nights }}</strong>
          </div>
        </div>

        <!-- Guests -->
        <div class="bf-block">
          <h4 class="bf-block-title">
            <i class="pi pi-users" /> الضيوف
            <span class="bf-counter">{{ result.guests?.length || 0 }}</span>
          </h4>
          <div v-if="!result.guests?.length" class="bf-section-empty">لا يوجد ضيوف مسجلين</div>
          <table v-else class="list-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الرقم القومي</th>
                <th>الصفة</th>
                <th>النوع</th>
                <th>الهاتف</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(g, i) in result.guests" :key="i">
                <td>{{ g.name }}</td>
                <td class="ltr">{{ g.identity_number || '—' }}</td>
                <td>{{ g.role || '—' }}</td>
                <td>{{ g.type === 'ADULT' ? 'بالغ' : g.type === 'CHILD' ? 'طفل' : g.type }}</td>
                <td class="ltr">{{ g.phone || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cars -->
        <div class="bf-block">
          <h4 class="bf-block-title">
            <i class="pi pi-car" /> السيارات
            <span class="bf-counter">{{ result.cars?.length || 0 }}</span>
          </h4>
          <div v-if="!result.cars?.length" class="bf-section-empty">لا توجد سيارات</div>
          <table v-else class="list-table">
            <thead><tr><th>رقم اللوحة</th></tr></thead>
            <tbody>
              <tr v-for="(c, i) in result.cars" :key="i">
                <td class="ltr">{{ c.plate_number }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Action -->
        <div v-if="state === 'READY_FOR_CHECK_IN' && !result.check_in_confirmed" class="qr-action">
          <button class="btn-confirm" :disabled="busy" @click="doCheckIn">
            <i v-if="busy" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-sign-in" />
            تأكيد تسجيل الدخول
          </button>
        </div>
        <div v-else-if="state === 'READY_FOR_CHECK_OUT' && !result.check_out_confirmed" class="qr-action">
          <button class="btn-confirm blue" :disabled="busy" @click="doCheckOut">
            <i v-if="busy" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-sign-out" />
            تأكيد تسجيل الخروج
          </button>
        </div>
      </template>

      <div class="qr-result-foot">
        <button class="btn-secondary" @click="resetScan">
          <i class="pi pi-refresh" /> مسح جديد
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate } from '@/utils/date'

const route = useRoute()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

const QR_ID = 'qr-reader'
const mode = ref('scan') // 'scan' | 'result'
const result = ref(null)
const busy = ref(false)
const scanning = ref(false)
const cameraError = ref(false)
const manualCode = ref('')
const fileInput = ref(null)

// Plain (non-reactive) — html5-qrcode mutates internal DOM/state.
let html5 = null

const state = computed(() => String(result.value?.scan_state || '').toUpperCase())
const stateClass = computed(() => ({
  BEFORE_BOOKING: 'warn',
  READY_FOR_CHECK_IN: 'ok',
  READY_FOR_CHECK_OUT: 'info',
  EXPIRED: 'danger',
}[state.value] || 'neutral'))
const bannerIcon = computed(() => ({
  BEFORE_BOOKING: 'pi pi-exclamation-triangle',
  READY_FOR_CHECK_IN: 'pi pi-check-circle',
  READY_FOR_CHECK_OUT: 'pi pi-sign-out',
  EXPIRED: 'pi pi-ban',
}[state.value] || 'pi pi-info-circle'))
const bannerText = computed(() => {
  if (state.value === 'BEFORE_BOOKING') {
    return `لم يحن موعد الحجز بعد — يبدأ من ${toDisplayDate(result.value?.check_in)}`
  }
  if (state.value === 'READY_FOR_CHECK_IN') {
    return result.value?.check_in_confirmed ? 'تم تسجيل الدخول بنجاح' : 'التصريح صالح — جاهز لتسجيل الدخول'
  }
  if (state.value === 'READY_FOR_CHECK_OUT') {
    return result.value?.check_out_confirmed ? 'تم تسجيل الخروج بنجاح' : 'المستأجر سجّل دخوله — جاهز لتسجيل الخروج'
  }
  if (state.value === 'EXPIRED') return 'هذا الحجز منتهٍ — لا يمكن استخدام هذا التصريح'
  return 'تعذّر تحديد حالة الحجز'
})

const STATUS_LABELS = {
  CONFIRMED: 'مؤكد', PENDING: 'قيد الانتظار', PROCESSING: 'قيد المعالجة',
  TEMPORARY: 'مؤقت', COMPLETED: 'مكتمل', CANCELLED: 'ملغى',
}
function statusLabel(s) { return STATUS_LABELS[s] || s || '—' }
function statusClass(s) {
  if (s === 'CONFIRMED' || s === 'COMPLETED') return 'ok'
  if (s === 'PENDING' || s === 'PROCESSING' || s === 'TEMPORARY') return 'pending'
  if (s === 'CANCELLED') return 'danger'
  return 'neutral'
}

async function startScanner() {
  cameraError.value = false
  try {
    await nextTick()
    if (!document.getElementById(QR_ID)) return
    if (!html5) html5 = new Html5Qrcode(QR_ID)
    await html5.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (decodedText) => onDecode(decodedText),
      () => {}, // per-frame decode failure — ignore (noisy)
    )
    scanning.value = true
  } catch {
    cameraError.value = true
    scanning.value = false
    toast.warning('تعذّر تشغيل الكاميرا — استخدم الإدخال اليدوي')
  }
}

async function stopScanner() {
  if (html5 && scanning.value) {
    try { await html5.stop() } catch { /* already stopped */ }
  }
  scanning.value = false
}

async function clearScanner() {
  await stopScanner()
  if (html5) {
    try { html5.clear() } catch { /* noop */ }
    html5 = null
  }
}

function toggleScanner() {
  if (scanning.value) stopScanner()
  else startScanner()
}

function pickImage() {
  if (busy.value) return
  fileInput.value?.click()
}

// Decode a QR out of an uploaded image (no camera needed).
async function onPickFile(e) {
  const file = e.target.files?.[0]
  e.target.value = '' // allow re-picking the same file
  if (!file || busy.value) return
  busy.value = true
  try {
    await stopScanner()
    await nextTick()
    if (!document.getElementById(QR_ID)) { busy.value = false; return }
    if (!html5) html5 = new Html5Qrcode(QR_ID)
    const text = await html5.scanFile(file, false)
    busy.value = false
    if (text) resolve(text)
    else toast.error('لم يتم العثور على رمز QR في الصورة')
  } catch {
    busy.value = false
    toast.error('لم يتم العثور على رمز QR في الصورة')
  }
}

async function onDecode(text) {
  if (busy.value) return
  await stopScanner()
  resolve(text)
}

// The QR encodes a full deep-link URL (…/qr-scan?code=<bookingId>).
// A scan/upload yields that whole string, so pull out the actual booking id
// (the `code` param) — never send the URL itself to the API.
function extractCode(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  const m = s.match(/[?&]code=([^&\s#]+)/)
  if (m) return decodeURIComponent(m[1])
  try {
    const c = new URL(s).searchParams.get('code')
    if (c) return c
  } catch { /* not a URL — treat as a bare code */ }
  return s
}

async function resolve(idOrCode) {
  const code = extractCode(idOrCode)
  if (!code) { toast.error('أدخل كود الحجز'); return }
  if (busy.value) return
  busy.value = true
  const r = await csBookings.getQrScan(code)
  busy.value = false
  if (r.ok) {
    result.value = r.data
    mode.value = 'result'
  } else {
    toast.error(r.error)
  }
}

async function doCheckIn() {
  if (busy.value || !result.value) return
  busy.value = true
  const r = await csBookings.confirmCheckIn(result.value.booking_id)
  busy.value = false
  if (r.ok) {
    result.value = { ...result.value, ...r.data }
    toast.success('تم تأكيد تسجيل الدخول')
  } else {
    toast.error(r.error)
  }
}

async function doCheckOut() {
  if (busy.value || !result.value) return
  busy.value = true
  const r = await csBookings.confirmCheckOut(result.value.booking_id)
  busy.value = false
  if (r.ok) {
    result.value = { ...result.value, ...r.data }
    toast.success('تم تأكيد تسجيل الخروج')
  } else {
    toast.error(r.error)
  }
}

async function resetScan() {
  result.value = null
  manualCode.value = ''
  mode.value = 'scan'
  await clearScanner()
  await startScanner()
}

onMounted(() => {
  // Deep link from a scanned permit QR (…/qr-scan?code=<booking_id>):
  // resolve it straight away instead of opening the camera.
  const code = route.query.code
  if (code) { resolve(String(code)); return }
  startScanner()
})
onBeforeUnmount(() => { clearScanner() })
</script>

<style scoped>
.qr-page { display: flex; flex-direction: column; gap: 16px; }

.page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
.page-icon {
  width: 52px; height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.page-icon i { font-size: 22px; }
.page-header-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.bf-section {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.qr-scan-card { max-width: 520px; margin-inline: auto; width: 100%; display: flex; flex-direction: column; gap: 14px; }
.qr-reader {
  width: 100%; max-width: 420px; margin-inline: auto;
  border-radius: 12px; overflow: hidden; background: #0f172a; min-height: 60px;
}
.qr-reader :deep(video) { width: 100% !important; height: auto !important; display: block; }
.qr-scan-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; }
.qr-file { display: none; }

.qr-notice {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 10px;
  font-size: 12.5px; font-weight: 600;
}
.qr-notice.warn { background: rgba(234, 179, 8, 0.10); border: 1px solid rgba(234, 179, 8, 0.28); color: #b45309; }

.qr-manual { display: flex; flex-direction: column; gap: 8px; border-top: 1px dashed #f1f5f9; padding-top: 14px; }
.qr-manual-label { font-size: 11.5px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
.qr-manual-row { display: flex; gap: 8px; }
.qr-input {
  flex: 1; padding: 10px 12px; border-radius: 9px; border: 1px solid #e2e8f0;
  background: #fff; font-size: 13.5px; font-family: inherit; color: #0f172a;
}
.qr-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
.ltr { direction: ltr; text-align: right; }

.btn-confirm {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 24px; border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: 1px solid #059669; color: #fff;
  font-family: inherit; font-size: 13.5px; font-weight: 800;
  cursor: pointer; box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
  transition: all 0.15s;
}
.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45); }
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-confirm.blue { background: linear-gradient(135deg, #0ea5e9, #0284c7); border-color: #0284c7; box-shadow: 0 2px 10px rgba(14, 165, 233, 0.35); }
.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-radius: 10px;
  background: #fff; border: 1px solid #e2e8f0; color: #475569;
  font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.15s;
}
.btn-secondary:hover:not(:disabled) { border-color: #f97316; color: #f97316; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Result */
.qr-result {
  max-width: 620px; margin-inline: auto; width: 100%;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 18px 20px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  display: flex; flex-direction: column; gap: 14px;
  border-top: 4px solid #cbd5e1;
}
.qr-result.ok { border-top-color: #10b981; }
.qr-result.warn { border-top-color: #f59e0b; }
.qr-result.info { border-top-color: #0ea5e9; }
.qr-result.danger { border-top-color: #ef4444; }
.qr-result-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.t-code { font-size: 16px; font-weight: 900; color: #0f172a; direction: ltr; }
.t-status { display: inline-flex; align-items: center; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; }
.t-status.ok { background: rgba(16, 185, 129, 0.10); color: #047857; }
.t-status.pending { background: rgba(234, 179, 8, 0.12); color: #b45309; }
.t-status.danger { background: rgba(239, 68, 68, 0.10); color: #b91c1c; }
.t-status.neutral { background: rgba(100, 116, 139, 0.12); color: #475569; }

.qr-banner {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 12px;
  font-size: 13.5px; font-weight: 700;
}
.qr-banner i { font-size: 18px; }
.qr-banner.ok { background: rgba(16, 185, 129, 0.10); color: #047857; border: 1px solid rgba(16, 185, 129, 0.22); }
.qr-banner.warn { background: rgba(245, 158, 11, 0.10); color: #b45309; border: 1px solid rgba(245, 158, 11, 0.25); }
.qr-banner.info { background: rgba(14, 165, 233, 0.10); color: #0369a1; border: 1px solid rgba(14, 165, 233, 0.22); }
.qr-banner.danger { background: rgba(239, 68, 68, 0.10); color: #b91c1c; border: 1px solid rgba(239, 68, 68, 0.22); }
.qr-banner.neutral { background: rgba(100, 116, 139, 0.10); color: #475569; border: 1px solid rgba(100, 116, 139, 0.22); }

.qr-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.qr-sum-cell {
  display: flex; flex-direction: column; gap: 3px;
  padding: 10px 12px; background: #fafbfc; border: 1px solid #f1f5f9; border-radius: 10px;
}
.qr-sum-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10.5px; color: #94a3b8; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.4px;
}
.qr-sum-label i { font-size: 10px; }
.qr-sum-cell strong { font-size: 13.5px; font-weight: 800; color: #0f172a; }
.qr-sum-cell small { font-size: 11px; color: #94a3b8; font-weight: 700; }

.bf-block { display: flex; flex-direction: column; gap: 10px; }
.bf-block-title { display: inline-flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 800; color: #0f172a; margin: 0; }
.bf-block-title i { color: #f97316; font-size: 13px; }
.bf-counter { margin-inline-start: 6px; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }
.bf-section-empty {
  padding: 16px; text-align: center; color: #94a3b8; font-size: 13px;
  background: #fafbfc; border: 1px dashed #e2e8f0; border-radius: 10px;
}
.list-table { width: 100%; border-collapse: collapse; }
.list-table th {
  padding: 10px 14px; text-align: right; font-size: 11.5px; font-weight: 700;
  color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;
  background: #fafbfc; border-bottom: 1px solid #f1f5f9;
}
.list-table td { padding: 11px 14px; font-size: 13px; color: #475569; border-bottom: 1px solid #f8fafc; }
.list-table tr:last-child td { border-bottom: none; }

.qr-action { display: flex; justify-content: center; padding-top: 4px; }
.qr-action .btn-confirm { width: 100%; max-width: 320px; justify-content: center; }
.qr-result-foot { display: flex; justify-content: center; border-top: 1px dashed #f1f5f9; padding-top: 14px; }

@media (max-width: 900px) {
  .qr-summary { grid-template-columns: 1fr 1fr; }
}
</style>
