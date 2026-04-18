<template>
  <div class="permit-page" v-if="booking">
    <!-- Background -->
    <div class="page-bg" />
    <div class="page-overlay" />

    <!-- Glass container -->
    <div class="glass-container">
      <!-- Header -->
      <div class="permit-header anim-item" style="--i: 0">
        <div class="permit-icon">
          <i class="pi pi-verified" />
        </div>
        <h1>تصريح الدخول</h1>
        <span class="booking-id-badge">{{ booking.id }}</span>
      </div>

      <!-- QR Code Card (only after full payment) -->
      <div class="glass-card qr-card anim-item" style="--i: 1" v-if="isFullyPaid">
        <img v-if="qrDataUrl" :src="qrDataUrl" alt="QR Code" class="qr-image" />
        <div v-else class="qr-placeholder">
          <i class="pi pi-spin pi-spinner" />
        </div>
        <p class="qr-caption">امسح الكود عند بوابة الدخول</p>
      </div>

      <!-- Payment Required Card -->
      <div class="glass-card payment-required anim-item" style="--i: 1"
           v-if="(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && !isFullyPaid">
        <div class="payment-required-icon">
          <i class="pi pi-lock" />
        </div>
        <p class="payment-required-text">سيظهر QR Code بعد اكتمال الدفع</p>
        <RouterLink :to="`/booking-confirmation/${booking.id}`" class="complete-payment-btn">
          <i class="pi pi-wallet" />
          إكمال الدفع
        </RouterLink>
      </div>

      <!-- Preliminary Booking Notice -->
      <div class="glass-card notice anim-item" style="--i: 2" v-if="booking.status === 'PENDING'">
        <div class="notice-row">
          <div class="notice-icon">
            <i class="pi pi-info-circle" />
          </div>
          <p class="notice-text">
            تم الحجز بشكل مبدئي لمدة <strong>{{ deadlineHours }} ساعة</strong>، لاستكمال الحجز برجاء التواصل على الرقم <strong dir="ltr">{{ formattedPhone }}</strong>
          </p>
        </div>
      </div>

      <!-- Validity / Countdown (PENDING) -->
      <div class="glass-card deadline anim-item" style="--i: 3" v-if="booking.status === 'PENDING'">
        <p class="expiry-label">
          <i class="pi pi-clock" />
          صالح حتى: {{ formatDateTime(booking.expiresAt) }}
        </p>
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

      <!-- Invalid permit (EXPIRED / CANCELLED) -->
      <div class="glass-card expired anim-item" style="--i: 1" v-if="booking.status === 'EXPIRED' || booking.status === 'CANCELLED'">
        <i class="pi pi-exclamation-triangle" />
        <span>التصريح غير صالح</span>
      </div>

      <!-- Contact Section -->
      <div class="glass-card contact anim-item" style="--i: 4">
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

      <!-- Entry Instructions -->
      <div class="glass-card instructions anim-item" style="--i: 5">
        <div class="instructions-header">
          <i class="pi pi-list" />
          <h3>تعليمات الدخول</h3>
        </div>
        <ul class="instructions-list">
          <li v-for="(line, idx) in instructionLines" :key="idx">{{ line }}</li>
        </ul>
      </div>

      <!-- Back Button -->
      <RouterLink :to="`/booking-confirmation/${booking.id}`" class="back-btn anim-item" style="--i: 6">
        <i class="pi pi-arrow-right" />
        العودة لتفاصيل الحجز
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
import { useRoute, useRouter } from 'vue-router'
import { useBookingsStore } from '@/stores/bookings'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import QRCode from 'qrcode'

const route = useRoute()
const router = useRouter()
const bookingsStore = useBookingsStore()
const settings = useSettingsStore()
const auth = useAuthStore()

const booking = computed(() => bookingsStore.getBookingById(route.params.id))
const deadlineHours = computed(() => settings.pendingDurationMinutes / 60)

const isFullyPaid = computed(() => {
  if (!booking.value) return false
  const totalPaid = (booking.value.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
  return totalPaid >= booking.value.total && booking.value.total > 0
})

const qrDataUrl = ref('')

// Countdown timer
const now = ref(new Date())
let timer = null

onMounted(async () => {
  // Security checks
  if (!auth.isAuthenticated) {
    router.replace({ name: 'login' })
    return
  }

  const b = bookingsStore.getBookingById(route.params.id)
  if (!b) return

  if (b.userId !== auth.user.id) {
    router.replace({ name: 'home' })
    return
  }

  // Expire stale bookings
  bookingsStore.expireStaleBookings()

  // Generate QR code
  try {
    const totalPaid = (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
    const qrContent = JSON.stringify({
      bookingId: b.id,
      chaletNumber: b.chaletNumber,
      chaletName: b.chaletName,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      expiresAt: b.expiresAt,
      userId: b.userId,
      paymentStatus: totalPaid >= b.total ? 'fully_paid' : totalPaid > 0 ? 'partially_paid' : 'unpaid',
    })
    qrDataUrl.value = await QRCode.toDataURL(qrContent, { width: 280, margin: 2 })
  } catch {
    /* QR generation failed silently */
  }

  // Start countdown
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

function formatDateTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
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
    .replace('{checkIn}', formatDateTime(booking.value.checkIn))
    .replace('{checkOut}', formatDateTime(booking.value.checkOut))
    .replace('{bookingId}', booking.value.id)
  return `https://wa.me/${settings.contactPhone}?text=${encodeURIComponent(msg)}`
})

const instructionLines = computed(() => {
  return settings.entryInstructions
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
})
</script>

<style scoped>
/* ═══════════════════════════════════
   PAGE & BACKGROUND
   ═══════════════════════════════════ */
.permit-page {
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
   PERMIT HEADER
   ═══════════════════════════════════ */
.permit-header {
  text-align: center;
  margin-bottom: 1.75rem;
}

.permit-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(96, 165, 250, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  animation: iconPulse 2s ease-in-out infinite;
  border: 2px solid rgba(96, 165, 250, 0.25);
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

.permit-icon i {
  font-size: 2rem;
  color: #60a5fa;
  filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.4));
}

.permit-header h1 {
  font-size: 1.45rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.booking-id-badge {
  display: inline-block;
  color: #fbbf24;
  font-weight: 700;
  background: rgba(251, 191, 36, 0.12);
  padding: 0.25rem 0.75rem;
  border-radius: 8px;
  font-size: 0.82rem;
  border: 1px solid rgba(251, 191, 36, 0.2);
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

/* ═══════════════════════════════════
   QR CODE CARD
   ═══════════════════════════════════ */
.glass-card.qr-card {
  text-align: center;
  padding: 1.75rem 1.35rem;
}

.qr-image {
  width: 200px;
  height: 200px;
  border-radius: 16px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  margin-bottom: 1rem;
}

.qr-placeholder {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 2px dashed rgba(255, 255, 255, 0.15);
}

.qr-placeholder i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.4);
}

.qr-caption {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

/* ═══════════════════════════════════
   PAYMENT REQUIRED
   ═══════════════════════════════════ */
.glass-card.payment-required {
  text-align: center;
  padding: 2rem 1.35rem;
  background: rgba(251, 146, 60, 0.1);
  border-color: rgba(251, 146, 60, 0.25);
}

.payment-required-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(251, 146, 60, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  border: 2px solid rgba(251, 146, 60, 0.25);
}

.payment-required-icon i {
  font-size: 1.8rem;
  color: #fb923c;
}

.payment-required-text {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.complete-payment-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(249, 115, 22, 0.35);
}

.complete-payment-btn:hover {
  box-shadow: 0 6px 28px rgba(249, 115, 22, 0.5);
  transform: translateY(-2px);
}

/* ═══════════════════════════════════
   PRELIMINARY NOTICE
   ═══════════════════════════════════ */
.glass-card.notice {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
}

.notice-row {
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
}

.notice-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(251, 191, 36, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notice-icon i {
  font-size: 1.2rem;
  color: #fbbf24;
}

.notice-text {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.7;
}

.notice-text strong {
  color: #fbbf24;
}

/* ═══════════════════════════════════
   VALIDITY / COUNTDOWN
   ═══════════════════════════════════ */
.glass-card.deadline {
  background: rgba(251, 191, 36, 0.1);
  border-color: rgba(251, 191, 36, 0.2);
  text-align: center;
}

.expiry-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
  font-weight: 600;
}

.expiry-label i {
  font-size: 1rem;
  color: #fbbf24;
}

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
   ENTRY INSTRUCTIONS
   ═══════════════════════════════════ */
.glass-card.instructions {
  padding-bottom: 1rem;
}

.instructions-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.instructions-header i {
  font-size: 1rem;
  color: #60a5fa;
}

.instructions-header h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #fff;
}

.instructions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.instructions-list li {
  font-size: 0.84rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  padding-right: 0.25rem;
}

/* ═══════════════════════════════════
   BACK BUTTON
   ═══════════════════════════════════ */
.back-btn {
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

.back-btn:hover {
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

  .permit-icon {
    width: 68px;
    height: 68px;
  }

  .permit-icon i {
    font-size: 1.7rem;
  }

  .permit-header h1 {
    font-size: 1.25rem;
  }

  .qr-image {
    width: 180px;
    height: 180px;
  }

  .qr-placeholder {
    width: 180px;
    height: 180px;
  }

  .countdown-num {
    font-size: 1.25rem;
    min-width: 44px;
  }
}
</style>
