<template>
  <div class="order-details-page">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-right">
        <RouterLink to="/admin/orders" class="back-link"><i class="pi pi-arrow-right" /></RouterLink>
        <div>
          <h1 class="page-title">تفاصيل الطلب <span class="order-id-title">#{{ shortId }}</span></h1>
          <p class="page-desc">{{ order?.chaletName }} — {{ order?.chaletNumber }}</p>
        </div>
      </div>
      <span :class="['status-badge lg', order?.status?.toLowerCase()]">{{ statusLabel(order?.status) }}</span>
    </div>

    <div v-if="!order" class="empty-state">
      <div class="empty-icon"><i class="pi pi-exclamation-triangle" /></div>
      <h3>الطلب غير موجود</h3>
    </div>

    <template v-else>
      <div class="details-grid">
        <!-- Booking Info Card -->
        <div class="info-card">
          <h3 class="card-title"><i class="pi pi-calendar" /> بيانات الحجز</h3>
          <div class="info-rows">
            <div class="info-row"><span class="info-label">تسجيل الدخول</span><span>{{ fmtDate(order.checkIn) }}</span></div>
            <div class="info-row"><span class="info-label">تسجيل الخروج</span><span>{{ fmtDate(order.checkOut) }}</span></div>
            <div class="info-row"><span class="info-label">عدد الليالي</span><span>{{ order.nights }}</span></div>
            <div class="info-row"><span class="info-label">الوقت المنقضي</span><OrderTimer :created-at="order.createdAt" /></div>
          </div>
        </div>

        <!-- Payment Card -->
        <div class="info-card">
          <h3 class="card-title"><i class="pi pi-wallet" /> إدارة الدفع</h3>
          <div class="payment-summary">
            <div class="pay-row"><span>سعر الليالي</span><span class="pay-val">{{ fmtNum(order.subtotal) }} ج.م</span></div>
            <div v-if="order.guestExtraTotal > 0" class="pay-row extra"><span>رسوم أعضاء إضافيين</span><span class="pay-val">+ {{ fmtNum(order.guestExtraTotal) }} ج.م</span></div>
            <div v-if="order.discountAmount > 0" class="pay-row discount"><span>خصم كوبون</span><span class="pay-val">- {{ fmtNum(order.discountAmount) }} ج.م</span></div>
            <div class="pay-row total"><span>الإجمالي</span><span class="pay-val">{{ fmtNum(order.total) }} ج.م</span></div>
            <div class="pay-divider" />
            <div class="pay-row"><span>المدفوع</span><span class="pay-val green">{{ fmtNum(totalPaid) }} ج.م</span></div>
            <div class="pay-row"><span>المتبقي</span><span class="pay-val" :class="remaining > 0 ? 'red' : 'green'">{{ fmtNum(remaining) }} ج.م</span></div>
          </div>

          <!-- Add Payment -->
          <div v-if="order.status !== 'CONFIRMED'" class="add-payment">
            <input v-model.number="paymentAmount" type="number" min="1" :max="remaining" placeholder="المبلغ المدفوع" />
            <button class="pay-btn" :disabled="!paymentAmount || paymentAmount <= 0 || paymentAmount > remaining" @click="handleAddPayment">
              <i class="pi pi-plus" /> إضافة دفعة
            </button>
          </div>

          <!-- Payment History -->
          <div v-if="order.payments?.length" class="pay-history">
            <h5>سجل الدفعات</h5>
            <div v-for="(p, i) in order.payments" :key="i" class="pay-entry">
              <span>{{ fmtNum(p.amount) }} ج.م</span>
              <span class="pay-date">{{ fmtDate(p.date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Guests Section -->
      <div class="guests-card">
        <div class="guests-header">
          <h3 class="card-title"><i class="pi pi-users" /> الأعضاء ({{ guestCount }}/{{ maxPermitted }})</h3>
          <button v-if="order.status !== 'CONFIRMED'" class="btn-sm" @click="guestModalOpen = true"><i class="pi pi-plus" /> إضافة عضو</button>
        </div>

        <!-- Extra warning -->
        <div v-if="order.guestExtraTotal > 0" class="extra-warn">
          <i class="pi pi-exclamation-triangle" />
          تم تجاوز الحد المسموح — سيتم احتساب {{ fmtNum(chaletExtraCharge) }} ج.م لكل فرد زائد ({{ extraGuestCount }} فرد إضافي = {{ fmtNum(order.guestExtraTotal) }} ج.م)
        </div>

        <div v-if="!order.guests?.length" class="guests-empty">لم يتم إضافة أعضاء بعد</div>

        <div v-else class="guests-list">
          <div v-for="g in order.guests" :key="g.id" :class="['guest-item', { extra: g.isExtra }]">
            <div class="guest-info">
              <div class="guest-av"><i class="pi pi-user" /></div>
              <div>
                <span class="guest-name">{{ g.name }} <span v-if="g.isExtra" class="extra-tag">إضافي</span></span>
                <span class="guest-meta">{{ g.nationalId }} · {{ g.relation }} · {{ g.phone }}</span>
              </div>
            </div>
            <button v-if="order.status !== 'CONFIRMED'" class="item-btn danger" @click="handleRemoveGuest(g.id)"><i class="pi pi-trash" /></button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="order.status !== 'CONFIRMED'" class="action-bar">
        <button class="btn-temp" @click="handleSetTemporary" :disabled="order.status === 'TEMPORARY'">
          <i class="pi pi-clock" /> حجز مؤقت
        </button>
        <button class="btn-confirm" :disabled="remaining > 0" @click="handleConfirm">
          <i class="pi pi-check-circle" /> تم الحجز
        </button>
        <span v-if="remaining > 0" class="confirm-hint">يجب سداد المبلغ كاملاً قبل التأكيد</span>
      </div>

      <!-- QR & WhatsApp (after confirmation) -->
      <div v-if="order.status === 'CONFIRMED'" class="confirmed-section">
        <div class="qr-card">
          <h3 class="card-title"><i class="pi pi-qrcode" /> تصريح الدخول</h3>
          <div class="qr-content">
            <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="qr-img" />
            <div v-else class="qr-loading"><i class="pi pi-spin pi-spinner" /></div>
          </div>
          <a :href="whatsappLink" target="_blank" class="whatsapp-btn">
            <i class="pi pi-whatsapp" /> إرسال التصريح عبر واتساب
          </a>
        </div>
      </div>
    </template>

    <!-- Add Guest Modal -->
    <AppModal v-model="guestModalOpen" title="إضافة عضو" icon="pi pi-user-plus" size="md" @close="resetGuestForm">
      <div class="fields-grid">
        <div class="field">
          <label>الاسم <span class="req">*</span></label>
          <input v-model="guestForm.name" placeholder="اسم العضو" />
        </div>
        <div class="field">
          <label>الرقم القومي <span class="req">*</span></label>
          <input v-model="guestForm.nationalId" placeholder="رقم الهوية" dir="ltr" />
        </div>
        <div class="field">
          <label>الصفة</label>
          <input v-model="guestForm.relation" placeholder="مثال: زوجة، ابن، صديق" />
        </div>
        <div class="field">
          <label>رقم الموبايل</label>
          <input v-model="guestForm.phone" placeholder="01xxxxxxxxx" dir="ltr" />
        </div>
      </div>
      <div v-if="willBeExtra" class="extra-notice">
        <i class="pi pi-info-circle" /> هذا العضو سيكون إضافياً — سيتم احتساب {{ fmtNum(chaletExtraCharge) }} ج.م
      </div>
      <template #footer>
        <button class="btn-cancel" @click="guestModalOpen = false">إلغاء</button>
        <button class="btn-submit" :disabled="!guestForm.name.trim() || !guestForm.nationalId.trim()" @click="handleAddGuest">
          <i class="pi pi-plus" /> إضافة
        </button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrdersStore } from '@/stores/orders'
import { useChaletsStore } from '@/stores/chalets'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'
import QRCode from 'qrcode'
import AppModal from '@/components/ui/AppModal.vue'
import OrderTimer from '@/components/admin/cs/OrderTimer.vue'

const route = useRoute()
const router = useRouter()
const ordersStore = useOrdersStore()
const chaletsStore = useChaletsStore()
const settings = useSettingsStore()
const toast = useToastStore()

const order = computed(() => ordersStore.getOrderById(route.params.id))
const shortId = computed(() => order.value?.id?.slice(-6).toUpperCase() || '')

const chalet = computed(() => order.value ? chaletsStore.getById(order.value.chaletId) : null)
const maxPermitted = computed(() => chalet.value?.maxPermitted || chalet.value?.maxGuests || 6)
const chaletExtraCharge = computed(() => chalet.value?.extraGuestCharge || 150)
const guestCount = computed(() => order.value?.guests?.length || 0)
const extraGuestCount = computed(() => (order.value?.guests || []).filter((g) => g.isExtra).length)

const totalPaid = computed(() => (order.value?.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0))
const remaining = computed(() => Math.max(0, Number(order.value?.total || 0) - totalPaid.value))

// Start processing on first visit
onMounted(() => {
  if (order.value && order.value.status === 'PENDING') {
    ordersStore.startProcessing(order.value.id)
  }
})

// Payment
const paymentAmount = ref(null)
function handleAddPayment() {
  if (!paymentAmount.value || paymentAmount.value <= 0) return
  ordersStore.addPayment(order.value.id, paymentAmount.value)
  toast.success('تم إضافة الدفعة')
  paymentAmount.value = null
}

// Status
function handleSetTemporary() {
  ordersStore.setTemporary(order.value.id)
  toast.success('تم تعيين الحجز كمؤقت')
}

function handleConfirm() {
  const r = ordersStore.confirmOrder(order.value.id)
  if (r.ok) {
    toast.success('تم تأكيد الحجز بنجاح')
    generateQR()
  } else {
    toast.error(r.error)
  }
}

// Guests
const guestModalOpen = ref(false)
const guestForm = reactive({ name: '', nationalId: '', relation: '', phone: '' })
const willBeExtra = computed(() => guestCount.value >= maxPermitted.value)

function resetGuestForm() {
  Object.assign(guestForm, { name: '', nationalId: '', relation: '', phone: '' })
}

function handleAddGuest() {
  if (!guestForm.name.trim() || !guestForm.nationalId.trim()) return
  const r = ordersStore.addGuest(order.value.id, { ...guestForm })
  if (r.ok) {
    if (r.isExtra) toast.info(`تم إضافة عضو إضافي — ${fmtNum(r.extraCharge)} ج.م رسوم إضافية`)
    else toast.success('تم إضافة العضو')
    guestModalOpen.value = false
    resetGuestForm()
  }
}

function handleRemoveGuest(guestId) {
  ordersStore.removeGuest(order.value.id, guestId)
  toast.success('تم حذف العضو')
}

// QR Code
const qrDataUrl = ref('')

async function generateQR() {
  if (!order.value) return
  try {
    const data = JSON.stringify({
      bookingId: order.value.id,
      chalet: order.value.chaletName,
      chaletNumber: order.value.chaletNumber,
      checkIn: order.value.checkIn,
      checkOut: order.value.checkOut,
      guests: order.value.guests?.length || 0,
    })
    qrDataUrl.value = await QRCode.toDataURL(data, { width: 250, margin: 2 })
  } catch { /* */ }
}

onMounted(() => {
  if (order.value?.status === 'CONFIRMED') generateQR()
})

// WhatsApp
const whatsappLink = computed(() => {
  if (!order.value) return '#'
  const phone = settings.contactPhone || '201234567890'
  const msg = `تصريح دخول - ${order.value.chaletName} (${order.value.chaletNumber})\nالحجز: #${shortId.value}\nالدخول: ${fmtDate(order.value.checkIn)}\nالخروج: ${fmtDate(order.value.checkOut)}`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
})

// Helpers
function statusLabel(s) {
  return { PENDING: 'في الانتظار', PROCESSING: 'قيد المعالجة', TEMPORARY: 'حجز مؤقت', CONFIRMED: 'مؤكد' }[s] || s
}
function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-header-right { display: flex; align-items: center; gap: 14px; }
.back-link { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; color: #475569; text-decoration: none; transition: all 0.15s; flex-shrink: 0; }
.back-link:hover { background: #f8fafc; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.order-id-title { color: #f97316; direction: ltr; display: inline-block; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.status-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.status-badge.lg { padding: 8px 18px; font-size: 13px; border-radius: 10px; }
.status-badge.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.status-badge.processing { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
.status-badge.temporary { background: rgba(249, 115, 22, 0.08); color: #f97316; }
.status-badge.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }

/* Details Grid */
.details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

.info-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; margin: 0 0 16px; }
.card-title i { color: #f97316; font-size: 16px; }

.info-rows { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; padding: 6px 0; border-bottom: 1px solid #f8fafc; }
.info-row:last-child { border-bottom: none; }
.info-label { color: #94a3b8; font-weight: 500; }

/* Payment */
.payment-summary { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.pay-row { display: flex; justify-content: space-between; font-size: 13.5px; padding: 4px 0; }
.pay-row.total { font-weight: 700; font-size: 15px; color: #0f172a; padding: 8px 0; }
.pay-row.extra { color: #eab308; }
.pay-row.discount { color: #10b981; }
.pay-val { font-weight: 600; }
.pay-val.green { color: #10b981; }
.pay-val.red { color: #ef4444; }
.pay-divider { height: 1px; background: #f1f5f9; margin: 6px 0; }

.add-payment { display: flex; gap: 8px; margin-bottom: 14px; }
.add-payment input { flex: 1; height: 40px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; }
.add-payment input:focus { border-color: #f97316; background: #fff; }
.pay-btn { display: flex; align-items: center; gap: 6px; padding: 0 16px; height: 40px; background: #10b981; color: #fff; border: none; border-radius: 10px; font-size: 12.5px; font-weight: 600; font-family: inherit; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
.pay-btn:hover:not(:disabled) { background: #059669; }
.pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.pay-history { border-top: 1px solid #f1f5f9; padding-top: 12px; }
.pay-history h5 { font-size: 12.5px; font-weight: 600; color: #64748b; margin: 0 0 8px; }
.pay-entry { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f8fafc; }
.pay-entry:last-child { border-bottom: none; }
.pay-date { font-size: 12px; color: #94a3b8; }

/* Guests */
.guests-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 20px; margin-bottom: 16px; }
.guests-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.btn-sm { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-sm:hover { transform: translateY(-1px); }

.extra-warn { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(234, 179, 8, 0.06); border: 1px solid rgba(234, 179, 8, 0.15); border-radius: 10px; font-size: 13px; color: #a16207; margin-bottom: 14px; }
.extra-warn i { font-size: 16px; color: #eab308; flex-shrink: 0; }

.guests-empty { padding: 24px; text-align: center; color: #94a3b8; font-size: 13.5px; }

.guests-list { display: flex; flex-direction: column; gap: 6px; }
.guest-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border-radius: 10px; border: 1px solid #f1f5f9; transition: all 0.15s; }
.guest-item:hover { background: #fafbfc; }
.guest-item.extra { border-color: rgba(234, 179, 8, 0.2); background: rgba(234, 179, 8, 0.02); }
.guest-info { display: flex; align-items: center; gap: 12px; }
.guest-av { width: 36px; height: 36px; border-radius: 10px; background: #f1f5f9; display: flex; align-items: center; justify-content: center; color: #94a3b8; flex-shrink: 0; }
.guest-name { display: block; font-weight: 600; color: #1e293b; font-size: 13.5px; }
.extra-tag { font-size: 10.5px; padding: 2px 7px; border-radius: 4px; background: rgba(234, 179, 8, 0.1); color: #eab308; font-weight: 600; margin-right: 4px; }
.guest-meta { display: block; font-size: 12px; color: #94a3b8; direction: ltr; text-align: right; }
.item-btn { width: 30px; height: 30px; border-radius: 6px; border: none; background: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; }
.item-btn.danger { color: #ef4444; }
.item-btn.danger:hover { background: rgba(239, 68, 68, 0.08); }

/* Action Bar */
.action-bar { display: flex; align-items: center; gap: 10px; padding: 20px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; margin-bottom: 16px; }
.btn-temp { display: inline-flex; align-items: center; gap: 6px; padding: 10px 24px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; color: #f97316; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-temp:hover:not(:disabled) { background: rgba(249, 115, 22, 0.04); border-color: #f97316; }
.btn-temp:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-confirm { display: inline-flex; align-items: center; gap: 6px; padding: 10px 28px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); }
.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); }
.btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.confirm-hint { font-size: 12.5px; color: #94a3b8; }

/* Confirmed Section */
.confirmed-section { margin-bottom: 16px; }
.qr-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 24px; text-align: center; }
.qr-content { margin: 20px 0; }
.qr-img { width: 200px; height: 200px; border-radius: 12px; border: 1px solid #f1f5f9; }
.qr-loading { padding: 60px; color: #94a3b8; font-size: 24px; }

.whatsapp-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: #25d366; color: #fff; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.whatsapp-btn:hover { background: #20bd5a; transform: translateY(-1px); }
.whatsapp-btn i { font-size: 18px; }

/* Modal form */
.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }
.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; }
.field input::placeholder { color: #94a3b8; }
.extra-notice { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: rgba(234, 179, 8, 0.06); border: 1px solid rgba(234, 179, 8, 0.15); border-radius: 10px; font-size: 13px; color: #a16207; margin-top: 14px; }
.extra-notice i { color: #eab308; }
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.empty-state { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .details-grid { grid-template-columns: 1fr; }
  .action-bar { flex-wrap: wrap; }
  .fields-grid { grid-template-columns: 1fr; }
}
</style>
