<template>
  <div class="permit-page">
    <!-- Breadcrumb + action bar (hidden on print) -->
    <nav class="page-crumbs no-print" aria-label="مسار التنقل">
      <RouterLink to="/admin/village-bookings" class="crumb">الحجوزات</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <RouterLink :to="`/admin/village-bookings/${$route.params.id}`" class="crumb">
        {{ permit?.booking_code || 'الحجز' }}
      </RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">التصريح</span>
    </nav>

    <div v-if="!loading && permit" class="actions-bar no-print">
      <div class="actions-bar-text">
        <div class="page-icon"><i class="pi pi-id-card" /></div>
        <div>
          <h1 class="page-title">تصريح الأمن</h1>
          <p class="page-desc">جاهز للطباعة · {{ permit.booking_code }}</p>
        </div>
      </div>
      <button class="btn-print" @click="handlePrint">
        <i class="pi pi-print" /> طباعة التصريح
      </button>
    </div>

    <div v-if="loading" class="loading-state no-print">
      <i class="pi pi-spin pi-spinner" /> جاري التحميل...
    </div>

    <div v-else-if="!permit" class="card error-card no-print">
      <i class="pi pi-exclamation-triangle" />
      <p>التصريح غير متاح</p>
    </div>

    <!-- The printable permit document -->
    <article v-else class="permit-doc">
      <!-- Top band: org/title on the right, permit-number stamp on the left -->
      <header class="doc-header">
        <div class="doc-title">
          <div class="doc-emblem"><i class="pi pi-shield" /></div>
          <div>
            <h1 class="doc-name">التصريح الأمني</h1>
            <p class="doc-sub">Security Permit · القرية</p>
          </div>
        </div>
        <div class="doc-head-end">
          <span
            v-if="permit.status"
            :class="['chip', 'st-' + String(permit.status).toLowerCase()]"
          >
            <i class="pi pi-circle-fill" /> {{ permitStatusLabel(permit.status) }}
          </span>
          <div class="doc-stamp">
            <span class="stamp-label">رقم التصريح</span>
            <span class="stamp-num ltr">#{{ permit.permit_number }}</span>
          </div>
        </div>
      </header>

      <!-- Meta strip -->
      <div class="doc-meta">
        <div class="meta-cell">
          <span class="meta-label"><i class="pi pi-hashtag" /> كود الحجز</span>
          <span class="meta-value ltr">{{ permit.booking_code }}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label"><i class="pi pi-file" /> رقم الطلب</span>
          <span class="meta-value ltr">{{ permit.request_number }}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label"><i class="pi pi-calendar" /> تاريخ الإصدار</span>
          <span class="meta-value">{{ toDisplayDateTime(permit.created_at) }}</span>
        </div>
        <div class="meta-cell">
          <span class="meta-label"><i class="pi pi-user" /> المُؤكِّد</span>
          <span class="meta-value ltr">{{ permit.confirmed_by || '—' }}</span>
        </div>
        <div v-if="permit.original_permit_number || permit.original_permit_id" class="meta-cell">
          <span class="meta-label"><i class="pi pi-link" /> تصريح مرتبط</span>
          <span class="meta-value ltr">
            {{ permit.original_permit_number ? '#' + permit.original_permit_number : '#' + permit.original_permit_id }}
          </span>
        </div>
      </div>

      <!-- Stay band: check-in → nights pill → check-out -->
      <div class="stay-band">
        <div class="stay-date">
          <span class="stay-date-label"><i class="pi pi-sign-in" /> الدخول</span>
          <strong class="stay-date-value">{{ toDisplayDate(permit.financial?.check_in) }}</strong>
        </div>
        <div class="stay-mid">
          <span class="stay-nights">
            <i class="pi pi-moon" />
            {{ permit.financial?.nights || 0 }}
            {{ (permit.financial?.nights || 0) === 1 ? 'ليلة' : 'ليالٍ' }}
          </span>
        </div>
        <div class="stay-date">
          <span class="stay-date-label"><i class="pi pi-sign-out" /> الخروج</span>
          <strong class="stay-date-value">{{ toDisplayDate(permit.financial?.check_out) }}</strong>
        </div>
      </div>

      <!-- Body: two columns -->
      <div class="doc-grid">
        <!-- Chalet info -->
        <section class="doc-section">
          <h2 class="doc-section-title"><i class="pi pi-home" /> بيانات الشاليه</h2>
          <div class="kv-grid">
            <div class="kv">
              <span class="k">الكود</span>
              <span class="v ltr">{{ permit.chalet?.chalet_code || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الرقم</span>
              <span class="v ltr">{{ permit.chalet?.chalet_number || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الوحدة</span>
              <span class="v ltr">{{ permit.chalet?.unit_number || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الطابق</span>
              <span class="v">{{ permit.chalet?.floor || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">المساحة</span>
              <span class="v">{{ permit.chalet?.area || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الحد الأقصى للضيوف</span>
              <span class="v">{{ permit.chalet?.max_guests ?? '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">المجموعة</span>
              <span class="v">{{ permit.chalet?.group_name || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">المالك</span>
              <span class="v">{{ permit.chalet?.owner_name || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الشركة</span>
              <span class="v">{{ permit.chalet?.company_name || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الوسيط</span>
              <span class="v">{{ permit.chalet?.delegator_name || '—' }}</span>
            </div>
          </div>
        </section>

        <!-- Financial -->
        <section class="doc-section">
          <h2 class="doc-section-title"><i class="pi pi-calculator" /> الملخص المالي</h2>

          <!-- Hero total -->
          <div class="money-row">
            <div class="money-card total">
              <span class="money-label">الإجمالي</span>
              <span class="money-value">{{ fmt(permit.financial?.total) }} <small>ج.م</small></span>
            </div>
            <div v-if="permit.financial?.payment_type" class="money-card pay">
              <span class="money-label">طريقة الدفع</span>
              <span :class="['chip', 'pay', permit.financial.payment_type.toLowerCase()]">
                <i class="pi pi-credit-card" /> {{ paymentLabel(permit.financial.payment_type) }}
              </span>
            </div>
          </div>

          <!-- Cost breakdown lines -->
          <div class="cost-lines">
            <div class="cost-line">
              <span class="cost-label">إجمالي الليالي</span>
              <span class="cost-value">{{ fmt(permit.financial?.nights_total) }} ج.م</span>
            </div>
            <div class="cost-line">
              <span class="cost-label">تصريح أمني</span>
              <span class="cost-value">{{ fmt(permit.financial?.security_permit_price) }} ج.م</span>
            </div>
            <div class="cost-line">
              <span class="cost-label">تصريح إلكتروني</span>
              <span class="cost-value">{{ fmt(permit.financial?.electronic_permit_price) }} ج.م</span>
            </div>
            <div v-if="permit.financial?.extra_guest_count" class="cost-line">
              <span class="cost-label">
                أفراد إضافيون
                <span class="cost-sub">{{ permit.financial.extra_guest_count }} ضيف</span>
              </span>
              <span class="cost-value">{{ fmt(permit.financial.extra_guest_total) }} ج.م</span>
            </div>
            <div v-if="permit.financial?.cars_count" class="cost-line">
              <span class="cost-label">
                السيارات
                <span class="cost-sub">{{ permit.financial.cars_count }} سيارة</span>
              </span>
              <span class="cost-value">{{ fmt(permit.financial.car_price_total) }} ج.م</span>
            </div>
            <div v-if="permit.financial?.discount_amount" class="cost-line discount">
              <span class="cost-label"><i class="pi pi-tag" /> الخصم</span>
              <span class="cost-value">− {{ fmt(permit.financial.discount_amount) }} ج.م</span>
            </div>
          </div>

          <div v-if="additionalReceipts.length" class="receipts-block">
            <h3 class="receipts-title"><i class="pi pi-receipt" /> السندات الإضافية</h3>
            <table class="p-table">
              <thead>
                <tr>
                  <th>النوع</th>
                  <th>المبلغ</th>
                  <th>طريقة الدفع</th>
                  <th>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(r, i) in additionalReceipts" :key="r.id || i" class="p-row">
                  <td><span class="t-strong">{{ receiptTypeLabel(r.type) }}</span></td>
                  <td>{{ fmt(r.amount) }} ج.م</td>
                  <td>{{ paymentLabel(r.payment_type || r.method) }}</td>
                  <td class="ltr">{{ toDisplayDateTime(r.created_at || r.issued_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <!-- Guests -->
      <section class="doc-section full">
        <h2 class="doc-section-title">
          <i class="pi pi-users" /> الضيوف
          <span class="doc-counter">{{ permit.guests?.length || 0 }}</span>
        </h2>
        <div v-if="!permit.guests?.length" class="empty-mini">لا يوجد ضيوف مسجلين</div>
        <div v-else class="table-wrap">
          <table class="p-table">
            <thead>
              <tr>
                <th class="num-col">#</th>
                <th>الاسم</th>
                <th>الرقم القومي</th>
                <th>الصفة</th>
                <th>النوع</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(g, i) in permit.guests" :key="i" class="p-row">
                <td class="num-col">{{ i + 1 }}</td>
                <td><span class="t-strong">{{ g.name }}</span></td>
                <td class="t-ltr">{{ g.identity_number || '—' }}</td>
                <td>{{ g.role || '—' }}</td>
                <td>
                  <span :class="['type-pill', g.type?.toLowerCase()]">
                    {{ g.type === 'ADULT' ? 'بالغ' : g.type === 'CHILD' ? 'طفل' : g.type }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Cars -->
      <section class="doc-section full">
        <h2 class="doc-section-title">
          <i class="pi pi-car" /> السيارات
          <span class="doc-counter">{{ permit.cars?.length || 0 }}</span>
        </h2>
        <div v-if="!permit.cars?.length" class="empty-mini">لا توجد سيارات</div>
        <div v-else class="plate-grid">
          <div v-for="(c, i) in permit.cars" :key="i" class="plate">
            <span class="plate-idx">{{ i + 1 }}</span>
            <span class="plate-num ltr">{{ c.plate_number }}</span>
          </div>
        </div>
      </section>

      <!-- Scan QR — prints with the permit; security scans it to check in/out -->
      <section v-if="qrDataUrl" class="doc-section full doc-qr">
        <h2 class="doc-section-title"><i class="pi pi-qrcode" /> رمز التحقق</h2>
        <div class="qr-wrap">
          <img :src="qrDataUrl" alt="QR" class="qr-img" />
          <div class="qr-side">
            <p class="qr-hint">امسح الرمز لتسجيل الدخول / الخروج لهذا الحجز.</p>
            <div class="qr-actions no-print">
              <button class="qr-btn" @click="downloadQr">
                <i class="pi pi-download" /> تنزيل
              </button>
              <button class="qr-btn" @click="shareQr">
                <i class="pi pi-share-alt" /> مشاركة
              </button>
              <button class="qr-btn" @click="copyQr">
                <i class="pi pi-copy" /> نسخ
              </button>
            </div>
          </div>
        </div>
      </section>

      <div class="doc-watermark no-print" aria-hidden="true">
        التصريح الأمني
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import QRCode from 'qrcode'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate, toDisplayDateTime } from '@/utils/date'

const route = useRoute()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

const loading = ref(true)
const permit = ref(null)

const bookingId = String(route.params.id || '')

// The QR encodes a deep link to the in-app scanner so any phone camera (or the
// security scanner screen) lands straight on this booking's check-in/out flow.
const scanUrl = computed(() => {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  return `${window.location.origin}${base}/admin/qr-scan?code=${bookingId}`
})
const qrDataUrl = ref('')

async function genQr() {
  try {
    qrDataUrl.value = await QRCode.toDataURL(scanUrl.value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 220,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
  } catch {
    qrDataUrl.value = ''
  }
}

async function _qrBlob() {
  const res = await fetch(qrDataUrl.value)
  return res.blob()
}
function _qrFileName() {
  return `permit-${permit.value?.booking_code || bookingId}.png`
}

async function downloadQr() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  a.href = qrDataUrl.value
  a.download = _qrFileName()
  document.body.appendChild(a)
  a.click()
  a.remove()
}

async function shareQr() {
  if (!qrDataUrl.value) return
  try {
    const file = new File([await _qrBlob()], _qrFileName(), { type: 'image/png' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: `تصريح ${permit.value?.booking_code || ''}` })
      return
    }
    downloadQr() // no Web Share for files → fall back
  } catch (e) {
    if (e?.name !== 'AbortError') downloadQr()
  }
}

async function copyQr() {
  if (!qrDataUrl.value) return
  try {
    await navigator.clipboard.write([
      new window.ClipboardItem({ 'image/png': await _qrBlob() }),
    ])
    toast.success('تم نسخ رمز QR')
  } catch {
    toast.error('تعذّر النسخ — استخدم التنزيل')
  }
}

async function load() {
  loading.value = true
  const r = await csBookings.getPermit(route.params.id)
  loading.value = false
  if (r.ok) permit.value = r.data
  else toast.error(r.error)
}

function paymentLabel(p) {
  return {
    CASH: 'نقدي',
    BANK: 'تحويل بنكي',
    WITHDRAW_BALANCE: 'خصم من الرصيد',
  }[p] || p || '—'
}

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

function permitStatusLabel(s) {
  return { ACTIVE: 'ساري', EXPIRED: 'منتهي', CANCELLED: 'ملغى' }[s] || s
}
function receiptTypeLabel(t) {
  return {
    EDIT_DATA: 'تعديل بيانات',
    EXTENSION: 'تمديد',
    TRANSFER: 'نقل',
    TRANSFER_AND_EXTENSION: 'نقل وتمديد',
  }[t] || t || '—'
}

// Tolerant: receipts may sit on the permit or under its financial block.
const additionalReceipts = computed(() =>
  permit.value?.additional_receipts || permit.value?.financial?.additional_receipts || [],
)

function handlePrint() { window.print() }

onMounted(() => {
  load()
  genQr()
})
</script>

<style scoped>
.permit-page { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb */
.page-crumbs { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

/* Actions bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.actions-bar-text { display: flex; align-items: center; gap: 12px; }
.page-icon {
  width: 46px; height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.page-icon i { font-size: 20px; }
.page-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
.page-desc { font-size: 12.5px; color: #94a3b8; margin: 2px 0 0; }

.btn-print {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
  transition: all 0.15s;
}
.btn-print:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }

/* The document itself */
.permit-doc {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 32px;
  max-width: 980px;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
  position: relative;
  overflow: hidden;
}
.permit-doc::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(249, 115, 22, 0.05), transparent 45%),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.04), transparent 45%);
  pointer-events: none;
}
.permit-doc > * { position: relative; z-index: 1; }

/* Doc header */
.doc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 2px dashed #f1f5f9;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.doc-title { display: flex; align-items: center; gap: 14px; }
.doc-emblem {
  width: 56px; height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.30);
}
.doc-emblem i { font-size: 24px; }
.doc-name {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.doc-sub {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 700;
  margin: 4px 0 0;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.doc-stamp {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 22px;
  border: 2px solid #ea580c;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 191, 36, 0.06));
  transform: rotate(-3deg);
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.18);
}
.stamp-label {
  font-size: 10px;
  font-weight: 800;
  color: #c2410c;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stamp-num {
  font-size: 26px;
  font-weight: 900;
  color: #ea580c;
  line-height: 1;
}
.ltr { direction: ltr; text-align: right; }

/* Meta strip */
.doc-meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 18px;
}
.meta-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
}
.meta-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 10.5px;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.meta-label i { font-size: 10px; color: #cbd5e1; }
.meta-value { font-size: 13px; color: #0f172a; font-weight: 800; }

/* Stay band */
.stay-band {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.05), rgba(251, 191, 36, 0.05));
  border: 1px dashed rgba(249, 115, 22, 0.30);
  border-radius: 14px;
  margin-bottom: 18px;
}
.stay-date { display: flex; flex-direction: column; gap: 4px; }
.stay-date-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stay-date-label i { font-size: 11px; }
.stay-date-value { font-size: 15px; font-weight: 800; color: #0f172a; }
.stay-mid { display: flex; justify-content: center; }
.stay-nights {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.35);
  white-space: nowrap;
  border: 1px solid #ea580c;
}
.stay-nights i { font-size: 11px; }

/* Doc grid (two cols) */
.doc-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}
.doc-section {
  padding: 16px 18px;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  background: #fff;
}
.doc-section.full { grid-column: 1 / -1; margin-bottom: 14px; }
.doc-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 14px;
}
.doc-section-title i { color: #f97316; font-size: 14px; }
.doc-counter {
  margin-inline-start: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

/* KV grid for chalet info */
.kv-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.kv {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #fafbfc;
  border-radius: 8px;
  font-size: 12.5px;
}
.k { color: #64748b; font-weight: 600; }
.v { color: #0f172a; font-weight: 800; text-align: left; }
.v.ltr { direction: ltr; text-align: left; }

/* Money / cost */
.money-row { display: grid; grid-template-columns: 1.4fr 1fr; gap: 10px; margin-bottom: 14px; }
.money-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 12px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}
.money-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.money-value {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.money-value small { font-size: 11px; font-weight: 700; color: #94a3b8; }
.money-card.total {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.10), rgba(251, 191, 36, 0.10));
  border-color: rgba(249, 115, 22, 0.30);
}
.money-card.total .money-label { color: #c2410c; }
.money-card.total .money-value { color: #ea580c; }
.money-card.total .money-value small { color: #c2410c; }
.money-card.pay { background: #fafbfc; }

.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  border: 1px solid transparent;
}
.chip i { font-size: 11px; }
.chip.pay.cash { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.25); }
.chip.pay.bank { background: rgba(14, 165, 233, 0.12); color: #0369a1; border-color: rgba(14, 165, 233, 0.25); }
.chip.pay.withdraw_balance { background: rgba(139, 92, 246, 0.12); color: #6d28d9; border-color: rgba(139, 92, 246, 0.25); }
.chip.st-active { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.25); }
.chip.st-expired { background: rgba(100, 116, 139, 0.12); color: #475569; border-color: rgba(100, 116, 139, 0.25); }
.chip.st-cancelled { background: rgba(239, 68, 68, 0.12); color: #b91c1c; border-color: rgba(239, 68, 68, 0.25); }

/* Header right cluster: status chip + permit-number stamp */
.doc-head-end { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

/* Additional receipts block under the financial summary */
.receipts-block { margin-top: 16px; }
.receipts-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 8px;
}
.receipts-title i { color: #f97316; font-size: 12px; }

.cost-lines { display: flex; flex-direction: column; }
.cost-line {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  padding: 9px 4px;
  border-bottom: 1px dashed #f1f5f9;
  font-size: 13px;
}
.cost-line:last-child { border-bottom: none; }
.cost-label {
  display: inline-flex; align-items: center; gap: 8px;
  color: #475569; font-weight: 600;
}
.cost-label i { font-size: 11px; color: #94a3b8; }
.cost-sub { font-size: 11px; color: #94a3b8; font-weight: 500; }
.cost-value { color: #0f172a; font-weight: 800; }
.cost-line.discount .cost-label,
.cost-line.discount .cost-value { color: #047857; }

/* Guest table index column (used inside the shared .p-table) */
.num-col { width: 40px; text-align: center !important; color: #94a3b8; font-weight: 700; }

.type-pill {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  border: 1px solid;
}
.type-pill.adult { background: rgba(14, 165, 233, 0.10); color: #0369a1; border-color: rgba(14, 165, 233, 0.25); }
.type-pill.child { background: rgba(168, 85, 247, 0.10); color: #6d28d9; border-color: rgba(168, 85, 247, 0.25); }

/* Plate grid (cars) */
.plate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}
.plate {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}
.plate-idx {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 191, 36, 0.14));
  color: #ea580c;
  font-size: 12px;
  font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.plate-num {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.5px;
}

.empty-mini {
  padding: 18px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  background: #fafbfc;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
}

/* Scan QR block */
.doc-qr .qr-wrap {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.qr-img {
  width: 160px;
  height: 160px;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 8px;
  background: #fff;
  flex-shrink: 0;
}
.qr-side { display: flex; flex-direction: column; gap: 12px; min-width: 0; flex: 1; }
.qr-hint { margin: 0; font-size: 13px; color: #475569; font-weight: 600; line-height: 1.6; }
.qr-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.qr-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.qr-btn:hover { border-color: #fed7aa; color: #ea580c; background: #fff7ed; }
.qr-btn i { font-size: 12px; }


/* Watermark — visible on screen, hidden on print */
.doc-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  font-size: 120px;
  font-weight: 900;
  color: rgba(15, 23, 42, 0.025);
  letter-spacing: 4px;
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

/* States */
.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; text-align: center; color: #b91c1c; }
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }
.loading-state {
  padding: 60px 20px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
}
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }

@media (max-width: 900px) {
  .doc-grid { grid-template-columns: 1fr; }
  .doc-meta { grid-template-columns: repeat(2, 1fr); }
  .actions-bar { flex-direction: column; align-items: stretch; gap: 12px; }
  .btn-print { justify-content: center; }
}
@media (max-width: 540px) {
  .permit-doc { padding: 20px; }
  .stay-band { grid-template-columns: 1fr; text-align: center; }
  .money-row { grid-template-columns: 1fr; }
  .kv-grid { grid-template-columns: 1fr; }
  .doc-header { flex-direction: column; align-items: flex-start; }
  .doc-stamp { transform: rotate(0); align-self: flex-end; }
}

/* Print styles — hide chrome, render only the permit doc */
@media print {
  :global(.sidebar),
  :global(.topbar),
  :global(.edge-toggle),
  .no-print { display: none !important; }
  :global(body),
  :global(.dashboard-content),
  :global(.dashboard-main) {
    background: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .permit-page { gap: 0; padding: 0; }
  .permit-doc {
    border: 1px solid #0f172a;
    box-shadow: none;
    max-width: 100%;
    padding: 20px;
    border-radius: 0;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .permit-doc::before { display: none; }
  .doc-header { page-break-after: avoid; }
  .doc-section, .stay-band { page-break-inside: avoid; }
  .doc-stamp { transform: rotate(-3deg); }
}
</style>
