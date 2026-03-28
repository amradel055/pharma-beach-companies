<template>
  <div class="confirmation-page" v-if="booking">
    <!-- Background -->
    <div class="page-bg" />
    <div class="page-overlay" />

    <!-- Glass container -->
    <div class="glass-container">
      <!-- Success icon -->
      <div class="success-header anim-item" style="--i: 0">
        <div class="success-icon">
          <svg class="checkmark" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h1>شكراً لحضرتك على الحجز</h1>
        <p class="booking-id-label">رقم الحجز: <strong>{{ booking.id }}</strong></p>
      </div>

      <!-- Booking summary -->
      <div class="glass-card anim-item" style="--i: 1">
        <div class="summary-top">
          <img :src="booking.chaletImage" :alt="booking.chaletName" class="summary-img" />
          <div class="summary-info">
            <h3>{{ booking.chaletName }}</h3>
            <span class="chalet-num"><i class="pi pi-hashtag" /> شاليه {{ booking.chaletNumber }}</span>
          </div>
        </div>

        <div class="glass-divider" />

        <div class="summary-rows">
          <div class="summary-row">
            <span class="row-label"><i class="pi pi-calendar" /> تسجيل الوصول</span>
            <span class="row-value">{{ formatDate(booking.checkIn) }}</span>
          </div>
          <div class="summary-row">
            <span class="row-label"><i class="pi pi-calendar" /> تسجيل المغادرة</span>
            <span class="row-value">{{ formatDate(booking.checkOut) }}</span>
          </div>
          <div class="summary-row">
            <span class="row-label"><i class="pi pi-moon" /> عدد الليالي</span>
            <span class="row-value">{{ booking.nights }} {{ booking.nights === 1 ? 'ليلة' : 'ليالي' }}</span>
          </div>
        </div>

        <div class="glass-divider" />

        <div class="summary-rows">
          <div class="summary-row">
            <span class="row-label">سعر الليلة × {{ booking.nights }}</span>
            <span class="row-value">{{ booking.subtotal?.toLocaleString('ar-EG') }} ج.م</span>
          </div>
          <div class="summary-row">
            <span class="row-label">
              تأمين
              <span class="refund-badge">مسترد</span>
            </span>
            <span class="row-value">{{ booking.deposit?.toLocaleString('ar-EG') }} ج.م</span>
          </div>
          <!-- Coupon -->
          <CouponInput
            v-if="booking.status === 'PENDING' && !appliedCoupon"
            :booking-total="booking.total"
            :user-id="auth.user?.id"
            @apply="handleCouponApply"
          />
          <div v-if="appliedCoupon" class="summary-row discount">
            <span class="row-label">خصم كوبون ({{ appliedCoupon.couponCode }})</span>
            <span class="row-value">- {{ appliedCoupon.discountAmount?.toLocaleString('ar-EG') }} ج.م</span>
          </div>

          <div class="glass-divider thin" />
          <div class="summary-row total">
            <span class="row-label">الإجمالي</span>
            <span class="row-value">{{ finalTotal?.toLocaleString('ar-EG') }} ج.م</span>
          </div>
        </div>
      </div>

      <!-- Payment deadline -->
      <div class="glass-card deadline anim-item" style="--i: 2" v-if="booking.status === 'PENDING'">
        <div class="deadline-row">
          <div class="deadline-icon">
            <i class="pi pi-clock" />
          </div>
          <p class="deadline-text">
            في حالة عدم الدفع خلال <strong>{{ deadlineHours }} ساعة</strong> يُعتبر الحجز لاغياً
          </p>
        </div>
        <div class="countdown">
          <div class="countdown-block">
            <span class="countdown-num">{{ timeLeft.hours }}</span>
            <span class="countdown-label">ساعة</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-block">
            <span class="countdown-num">{{ timeLeft.minutes }}</span>
            <span class="countdown-label">دقيقة</span>
          </div>
          <span class="countdown-sep">:</span>
          <div class="countdown-block">
            <span class="countdown-num">{{ timeLeft.seconds }}</span>
            <span class="countdown-label">ثانية</span>
          </div>
        </div>
      </div>

      <!-- Expired notice -->
      <div class="glass-card expired anim-item" style="--i: 2" v-else-if="booking.status === 'EXPIRED'">
        <i class="pi pi-exclamation-triangle" />
        <span>انتهت صلاحية هذا الحجز</span>
      </div>

      <!-- Contact section -->
      <div class="glass-card contact anim-item" style="--i: 3">
        <div class="contact-header">
          <i class="pi pi-phone" />
          <h3>تواصل معنا لتأكيد الدفع</h3>
        </div>
        <p class="contact-phone" dir="ltr">{{ formattedPhone }}</p>
        <a :href="whatsappUrl" target="_blank" class="whatsapp-btn">
          <i class="pi pi-whatsapp" />
          تواصل عبر واتساب
        </a>
      </div>

      <!-- Entry permit link -->
      <RouterLink :to="`/entry-permit/${booking.id}`" class="permit-btn anim-item" style="--i: 3.5" v-if="booking.status === 'PENDING'">
        <i class="pi pi-qrcode" />
        عرض تصريح الدخول
      </RouterLink>

      <!-- Email notification -->
      <div class="glass-card notification anim-item" style="--i: 4">
        <i class="pi pi-bell" />
        <span>تم إرسال تأكيد الحجز على إيميلك</span>
      </div>

      <!-- Home button -->
      <RouterLink to="/" class="home-btn anim-item" style="--i: 5">
        <i class="pi pi-home" />
        العودة للرئيسية
      </RouterLink>
    </div>
  </div>

  <!-- Not found state -->
  <div class="not-found" v-else>
    <div class="nf-bg" />
    <div class="nf-overlay" />
    <div class="nf-content">
      <div class="nf-icon"><i class="pi pi-exclamation-triangle" /></div>
      <h2>الحجز غير موجود</h2>
      <p>لم نتمكن من العثور على الحجز المطلوب</p>
      <RouterLink to="/" class="nf-link">
        <i class="pi pi-arrow-right" />
        العودة للرئيسية
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBookingsStore } from '@/stores/bookings'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useCouponsStore } from '@/stores/coupons'
import CouponInput from '@/components/booking/CouponInput.vue'

const route = useRoute()
const bookingsStore = useBookingsStore()
const settings = useSettingsStore()
const auth = useAuthStore()
const couponsStore = useCouponsStore()

const booking = computed(() => bookingsStore.getBookingById(route.params.id))
const appliedCoupon = ref(null)

const finalTotal = computed(() => {
  if (!booking.value) return 0
  const discount = appliedCoupon.value?.discountAmount || booking.value.discountAmount || 0
  return booking.value.total - discount
})

function handleCouponApply(couponData) {
  appliedCoupon.value = couponData
  // Update booking with coupon info
  if (booking.value) {
    bookingsStore.updateBooking(booking.value.id, {
      couponId: couponData.couponId,
      couponCode: couponData.couponCode,
      discountAmount: couponData.discountAmount,
      discountType: couponData.discountType,
    })
    couponsStore.recordUsage(couponData.couponId, auth.user?.id)
  }
}
const deadlineHours = computed(() => settings.pendingDurationMinutes / 60)

// Countdown timer
const now = ref(new Date())
let timer = null

onMounted(() => {
  timer = setInterval(() => {
    now.value = new Date()
    bookingsStore.expireStaleBookings()
  }, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

const timeLeft = computed(() => {
  if (!booking.value || booking.value.status !== 'PENDING') {
    return { hours: '00', minutes: '00', seconds: '00' }
  }
  const expires = new Date(booking.value.expiresAt)
  const diff = Math.max(0, expires - now.value)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formattedPhone = computed(() => {
  const phone = settings.contactPhone
  return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 9)} ${phone.slice(9)}`
})

const whatsappUrl = computed(() => {
  if (!booking.value) return '#'
  let msg = settings.contactMessage
    .replace('{chaletNumber}', booking.value.chaletNumber)
    .replace('{checkIn}', formatDate(booking.value.checkIn))
    .replace('{checkOut}', formatDate(booking.value.checkOut))
    .replace('{bookingId}', booking.value.id)
  return `https://wa.me/${settings.contactPhone}?text=${encodeURIComponent(msg)}`
})
</script>

<style scoped>
/* ═══════════════════════════════════
   PAGE & BACKGROUND
   ═══════════════════════════════════ */
.confirmation-page {
  position: relative;
  min-height: 100vh;
}

.page-bg {
  position: absolute;
  inset: 0;
  background: url('@/assets/images/hero-bg.jpg') center/cover no-repeat;
  z-index: 0;
}

.page-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    160deg,
    rgba(15, 23, 42, 0.6) 0%,
    rgba(15, 23, 42, 0.45) 40%,
    rgba(15, 23, 42, 0.6) 100%
  );
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1;
}

/* ═══════════════════════════════════
   GLASS CONTAINER
   ═══════════════════════════════════ */
.glass-container {
  position: relative;
  z-index: 2;
  max-width: 540px;
  margin: 0 auto;
  padding: 6rem 1.5rem 3rem;
}

/* ═══════════════════════════════════
   STAGGER ANIMATIONS
   ═══════════════════════════════════ */
.anim-item {
  opacity: 0;
  animation: staggerIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--i, 0) * 120ms + 300ms);
}

@keyframes staggerIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ═══════════════════════════════════
   SUCCESS HEADER
   ═══════════════════════════════════ */
.success-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.25rem;
}

.checkmark {
  width: 80px;
  height: 80px;
  display: block;
  stroke-width: 2;
  stroke: #4ade80;
  stroke-miterlimit: 10;
  filter: drop-shadow(0 6px 24px rgba(74, 222, 128, 0.4));
}

.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke: #4ade80;
  fill: rgba(74, 222, 128, 0.12);
  animation: circleStroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
}

.checkmark-check {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: checkStroke 0.35s cubic-bezier(0.65, 0, 0.45, 1) 0.9s forwards;
}

@keyframes circleStroke { to { stroke-dashoffset: 0; } }
@keyframes checkStroke { to { stroke-dashoffset: 0; } }

.success-header h1 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.35rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.booking-id-label {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.6);
}

.booking-id-label strong {
  color: #fbbf24;
  font-weight: 700;
  background: rgba(251, 191, 36, 0.12);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
}

/* ═══════════════════════════════════
   GLASS CARD (base)
   ═══════════════════════════════════ */
.glass-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 1.35rem;
  margin-bottom: 1.15rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.glass-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
  margin: 1rem 0;
}

.glass-divider.thin {
  margin: 0.5rem 0;
}

/* ═══════════════════════════════════
   SUMMARY
   ═══════════════════════════════════ */
.summary-top {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.summary-img {
  width: 80px;
  height: 80px;
  border-radius: 14px;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.summary-info h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.25rem;
}

.chalet-num {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.chalet-num i { font-size: 0.7rem; }

.summary-rows {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.row-label {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
}

.row-label i {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.4);
}

.row-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: #fff;
}

.summary-row.total .row-label {
  font-size: 0.95rem;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.85);
}

.summary-row.total .row-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: #fbbf24;
  text-shadow: 0 0 12px rgba(251, 191, 36, 0.3);
}

.summary-row.discount .row-label {
  color: #10b981;
}

.summary-row.discount .row-value {
  color: #10b981;
  font-weight: 700;
}

.refund-badge {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  font-size: 0.6rem;
  font-weight: 700;
  margin-right: 0.25rem;
  border: 1px solid rgba(74, 222, 128, 0.2);
}

/* ═══════════════════════════════════
   DEADLINE
   ═══════════════════════════════════ */
.glass-card.deadline {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
}

.deadline-row {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.deadline-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.deadline-icon i {
  font-size: 1.2rem;
  color: #fbbf24;
}

.deadline-text {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
}

.deadline-text strong {
  color: #fbbf24;
}

/* ── Countdown ── */
.countdown {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.countdown-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
}

.countdown-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: #fbbf24;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 0.35rem 0.65rem;
  min-width: 50px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(251, 191, 36, 0.15);
  text-shadow: 0 0 10px rgba(251, 191, 36, 0.25);
}

.countdown-label {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.45);
  font-weight: 600;
  margin-top: 0.25rem;
}

.countdown-sep {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 1rem;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ═══════════════════════════════════
   EXPIRED
   ═══════════════════════════════════ */
.glass-card.expired {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  font-size: 0.88rem;
  font-weight: 700;
  color: #fca5a5;
}

.glass-card.expired i {
  font-size: 1.2rem;
}

/* ═══════════════════════════════════
   CONTACT
   ═══════════════════════════════════ */
.glass-card.contact {
  text-align: center;
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.18);
}

.contact-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.85rem;
}

.contact-header i {
  font-size: 1rem;
  color: #4ade80;
}

.contact-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #4ade80;
}

.contact-phone {
  font-size: 1.15rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 1rem;
  letter-spacing: 0.04em;
}

.whatsapp-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2.25rem;
  border-radius: 50px;
  background: linear-gradient(135deg, #25d366, #128c7e);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(37, 211, 102, 0.35);
}

.whatsapp-btn:hover {
  box-shadow: 0 6px 28px rgba(37, 211, 102, 0.5);
  transform: translateY(-2px);
}

.whatsapp-btn i {
  font-size: 1.15rem;
}

/* ═══════════════════════════════════
   PERMIT BUTTON
   ═══════════════════════════════════ */
.permit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  border-radius: 14px;
  background: rgba(96, 165, 250, 0.15);
  border: 1px solid rgba(96, 165, 250, 0.25);
  color: #60a5fa;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.1);
  margin-bottom: 1.15rem;
}

.permit-btn:hover {
  background: rgba(96, 165, 250, 0.22);
  box-shadow: 0 6px 28px rgba(96, 165, 250, 0.2);
  transform: translateY(-2px);
}

.permit-btn i {
  font-size: 1.1rem;
}

/* ═══════════════════════════════════
   NOTIFICATION
   ═══════════════════════════════════ */
.glass-card.notification {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.84rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(96, 165, 250, 0.1);
  border-color: rgba(96, 165, 250, 0.18);
  padding: 0.9rem;
}

.glass-card.notification i {
  font-size: 1rem;
  color: #60a5fa;
  animation: bellRing 3s ease-in-out infinite;
}

@keyframes bellRing {
  0%, 100% { transform: rotate(0); }
  5% { transform: rotate(12deg); }
  10% { transform: rotate(-10deg); }
  15% { transform: rotate(8deg); }
  20% { transform: rotate(-6deg); }
  25% { transform: rotate(0); }
}

/* ═══════════════════════════════════
   HOME BUTTON
   ═══════════════════════════════════ */
.home-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.85rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  font-size: 0.92rem;
  font-weight: 800;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.home-btn:hover {
  background: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* ═══════════════════════════════════
   NOT FOUND
   ═══════════════════════════════════ */
.not-found {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.nf-bg {
  position: absolute;
  inset: 0;
  background: url('@/assets/images/hero-bg.jpg') center/cover no-repeat;
  z-index: 0;
}

.nf-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1;
}

.nf-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.nf-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}

.nf-icon i {
  font-size: 1.8rem;
  color: #fca5a5;
}

.not-found h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.4rem;
}

.not-found p {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1.5rem;
}

.nf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f172a;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  transition: all 0.3s ease;
}

.nf-link:hover {
  background: #fff;
  transform: translateY(-1px);
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 640px) {
  .glass-container {
    padding: 5rem 1rem 2rem;
  }

  .success-icon,
  .checkmark {
    width: 68px;
    height: 68px;
  }

  .success-header h1 {
    font-size: 1.25rem;
  }

  .countdown-num {
    font-size: 1.25rem;
    min-width: 44px;
  }

  .summary-img {
    width: 70px;
    height: 70px;
  }
}
</style>
