<template>
  <div class="scanner-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">ماسح QR</h1>
        <p class="page-desc">مسح رمز QR أو إدخال رقم الحجز للتحقق</p>
      </div>
    </div>

    <!-- Search Card -->
    <div class="search-card">
      <div class="search-section">
        <h4 class="section-label"><i class="pi pi-qrcode" /> البحث عن حجز</h4>
        <div class="search-row">
          <div class="search-input-wrap">
            <i class="pi pi-search" />
            <input
              v-model="searchInput"
              type="text"
              placeholder="أدخل رقم الحجز أو بيانات QR..."
              dir="ltr"
              @keyup.enter="lookupBooking"
            />
          </div>
          <button class="btn-primary" @click="lookupBooking" :disabled="!searchInput.trim()">
            <i class="pi pi-search" />
            بحث
          </button>
        </div>
      </div>
    </div>

    <!-- Booking Details Card -->
    <Transition name="slide">
      <div v-if="booking" class="booking-card" :class="statusClass">
        <div class="booking-header">
          <div class="booking-status-badge" :class="statusClass">
            <i :class="statusIcon" />
            {{ statusLabel }}
          </div>
          <span class="booking-id">{{ booking.id }}</span>
        </div>

        <div class="booking-details">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">الشاليه</span>
              <span class="detail-value">{{ booking.chaletName }} ({{ booking.chaletNumber }})</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تسجيل الدخول</span>
              <span class="detail-value">{{ formatDate(booking.checkIn) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">تسجيل الخروج</span>
              <span class="detail-value">{{ formatDate(booking.checkOut) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">عدد الليالي</span>
              <span class="detail-value">{{ booking.nights }} ليلة</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">عدد الضيوف</span>
              <span class="detail-value">{{ booking.guests?.length || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">الحالة</span>
              <span class="detail-value">{{ booking.status }}</span>
            </div>
          </div>

          <!-- Check-in/out info -->
          <div v-if="booking.checkedInAt" class="checkin-info">
            <i class="pi pi-sign-in" />
            تم تسجيل الدخول: {{ formatDateTime(booking.checkedInAt) }}
          </div>
          <div v-if="booking.checkedOutAt" class="checkout-info">
            <i class="pi pi-sign-out" />
            تم تسجيل الخروج: {{ formatDateTime(booking.checkedOutAt) }}
          </div>
        </div>

        <!-- Actions -->
        <div class="booking-actions">
          <button
            v-if="canCheckIn"
            class="btn-checkin"
            @click="handleCheckIn"
          >
            <i class="pi pi-sign-in" />
            تسجيل دخول
          </button>
          <button
            v-if="canCheckOut"
            class="btn-checkout"
            @click="handleCheckOut"
          >
            <i class="pi pi-sign-out" />
            تسجيل خروج
          </button>
        </div>
      </div>
    </Transition>

    <!-- Error State -->
    <Transition name="slide">
      <div v-if="errorMsg" class="error-card">
        <i class="pi pi-exclamation-triangle" />
        <span>{{ errorMsg }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookingsStore } from '@/stores/bookings'
import { useAuditLogStore } from '@/stores/auditLog'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const bookingsStore = useBookingsStore()
const auditLogStore = useAuditLogStore()
const auth = useAuthStore()
const toast = useToastStore()

const searchInput = ref('')
const booking = ref(null)
const errorMsg = ref('')

function lookupBooking() {
  errorMsg.value = ''
  booking.value = null

  const raw = searchInput.value.trim()
  if (!raw) return

  // Try to parse as JSON (QR data)
  let bookingId = raw
  try {
    const parsed = JSON.parse(raw)
    if (parsed.bookingId) bookingId = parsed.bookingId
    else if (parsed.id) bookingId = parsed.id
  } catch {
    // Not JSON, treat as plain booking ID
  }

  const found = bookingsStore.getBookingById(bookingId)
  if (!found) {
    errorMsg.value = 'لم يتم العثور على حجز بهذا الرقم'
    return
  }
  booking.value = found
}

const qrState = computed(() => {
  if (!booking.value) return 'not_started'
  const b = booking.value
  if (b.status !== 'CONFIRMED') return 'invalid'
  if (b.checkedOutAt) return 'completed'
  if (b.checkedInAt) return 'valid'
  return 'not_started'
})

const statusClass = computed(() => ({
  'status-not-started': qrState.value === 'not_started',
  'status-valid': qrState.value === 'valid',
  'status-invalid': qrState.value === 'invalid',
  'status-completed': qrState.value === 'completed',
}))

const statusLabel = computed(() => ({
  not_started: 'لم يبدأ',
  valid: 'ساري',
  invalid: 'غير صالح',
  completed: 'مكتمل',
}[qrState.value]))

const statusIcon = computed(() => ({
  not_started: 'pi pi-clock',
  valid: 'pi pi-check-circle',
  invalid: 'pi pi-times-circle',
  completed: 'pi pi-flag',
}[qrState.value]))

const canCheckIn = computed(() => {
  if (!booking.value) return false
  return booking.value.status === 'CONFIRMED' && !booking.value.checkedInAt
})

const canCheckOut = computed(() => {
  if (!booking.value) return false
  return booking.value.status === 'CONFIRMED' && booking.value.checkedInAt && !booking.value.checkedOutAt
})

function handleCheckIn() {
  const memberId = auth.user?.id || 'unknown'
  const memberName = auth.user?.name || 'غير معروف'
  const result = bookingsStore.checkIn(booking.value.id, memberId)
  if (result) {
    booking.value = result
    auditLogStore.logAction({
      bookingId: booking.value.id,
      action: 'check_in',
      securityMemberId: memberId,
      securityMemberName: memberName,
      qrState: 'valid',
    })
    toast.success('تم تسجيل الدخول بنجاح')
  }
}

function handleCheckOut() {
  const memberId = auth.user?.id || 'unknown'
  const memberName = auth.user?.name || 'غير معروف'
  const result = bookingsStore.checkOut(booking.value.id, memberId)
  if (result) {
    booking.value = result
    auditLogStore.logAction({
      bookingId: booking.value.id,
      action: 'check_out',
      securityMemberId: memberId,
      securityMemberName: memberName,
      qrState: 'completed',
    })
    toast.success('تم تسجيل الخروج بنجاح')
  }
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.search-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 20px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
.section-label i { font-size: 15px; color: #f97316; }

.search-row { display: flex; gap: 12px; align-items: center; }
.search-input-wrap { position: relative; flex: 1; }
.search-input-wrap i { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 14px; color: #94a3b8; }
.search-input-wrap input { width: 100%; height: 44px; padding: 0 40px 0 14px; padding-right: 40px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit; color: #1e293b; background: #f8fafc; outline: none; transition: all 0.2s; }
.search-input-wrap input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.search-input-wrap input::placeholder { color: #94a3b8; }

.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* Booking Card */
.booking-card { background: #fff; border: 2px solid #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 20px; transition: border-color 0.3s; }
.booking-card.status-not-started { border-color: #eab308; }
.booking-card.status-valid { border-color: #10b981; }
.booking-card.status-invalid { border-color: #ef4444; }
.booking-card.status-completed { border-color: #94a3b8; }

.booking-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.booking-id { font-size: 13px; color: #94a3b8; direction: ltr; font-family: monospace; }

.booking-status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; }
.booking-status-badge.status-not-started { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.booking-status-badge.status-valid { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.booking-status-badge.status-invalid { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
.booking-status-badge.status-completed { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

.detail-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.detail-item { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 12px; color: #94a3b8; font-weight: 600; }
.detail-value { font-size: 14px; color: #1e293b; font-weight: 600; }

.checkin-info, .checkout-info { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; margin-bottom: 8px; }
.checkin-info { background: rgba(16, 185, 129, 0.06); color: #10b981; }
.checkout-info { background: rgba(99, 102, 241, 0.06); color: #6366f1; }

.booking-actions { display: flex; gap: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9; }

.btn-checkin { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25); }
.btn-checkin:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(16, 185, 129, 0.35); }

.btn-checkout { display: inline-flex; align-items: center; gap: 8px; padding: 12px 28px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25); }
.btn-checkout:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35); }

.error-card { display: flex; align-items: center; gap: 10px; padding: 16px 20px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; color: #ef4444; font-size: 14px; font-weight: 600; }

.slide-enter-active { transition: all 0.3s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 768px) {
  .search-row { flex-direction: column; }
  .btn-primary { width: 100%; justify-content: center; }
  .detail-grid { grid-template-columns: 1fr 1fr; }
  .booking-actions { flex-direction: column; }
  .btn-checkin, .btn-checkout { width: 100%; justify-content: center; }
}
</style>
