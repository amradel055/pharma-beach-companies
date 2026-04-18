<template>
  <div class="operator-dashboard">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">لوحة المشغل</h1>
        <p class="page-desc">عرض حجوزات الشاليهات المسندة إليك</p>
      </div>
    </div>

    <!-- Booked Chalets -->
    <div class="section-card">
      <h3 class="card-title"><i class="pi pi-building" /> الشاليهات المحجوزة</h3>
      <div v-if="bookedChalets.length === 0" class="empty-mini">
        <i class="pi pi-inbox" />
        <span>لا توجد حجوزات حالية</span>
      </div>
      <div v-else class="booking-list">
        <div v-for="b in bookedChalets" :key="b.id" class="booking-item">
          <div class="booking-item-head">
            <span class="chalet-name">{{ b.chaletName }} ({{ b.chaletNumber }})</span>
            <span class="booking-status-tag" :class="b.status.toLowerCase()">{{ statusLabel(b.status) }}</span>
          </div>
          <div class="booking-item-meta">
            <span><i class="pi pi-calendar" /> {{ formatDate(b.checkIn) }} - {{ formatDate(b.checkOut) }}</span>
            <span><i class="pi pi-moon" /> {{ b.nights }} ليلة</span>
            <span><i class="pi pi-users" /> {{ b.guests?.length || 0 }} ضيف</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Today Check-ins -->
    <div class="section-card">
      <h3 class="card-title"><i class="pi pi-sign-in" /> تسجيلات الدخول اليوم</h3>
      <div v-if="todayCheckIns.length === 0" class="empty-mini">
        <i class="pi pi-inbox" />
        <span>لا توجد تسجيلات دخول اليوم</span>
      </div>
      <div v-else class="booking-list">
        <div v-for="b in todayCheckIns" :key="b.id" class="booking-item checkin">
          <div class="booking-item-head">
            <span class="chalet-name">{{ b.chaletName }} ({{ b.chaletNumber }})</span>
            <span class="time-tag"><i class="pi pi-clock" /> {{ formatTime(b.checkIn) }}</span>
          </div>
          <div class="booking-item-meta">
            <span><i class="pi pi-users" /> {{ b.guests?.length || 0 }} ضيف</span>
            <span v-if="b.checkedInAt" class="done-tag"><i class="pi pi-check" /> تم الدخول</span>
            <span v-else class="pending-tag"><i class="pi pi-clock" /> في الانتظار</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Today Check-outs -->
    <div class="section-card">
      <h3 class="card-title"><i class="pi pi-sign-out" /> تسجيلات الخروج اليوم</h3>
      <div v-if="todayCheckOuts.length === 0" class="empty-mini">
        <i class="pi pi-inbox" />
        <span>لا توجد تسجيلات خروج اليوم</span>
      </div>
      <div v-else class="booking-list">
        <div v-for="b in todayCheckOuts" :key="b.id" class="booking-item checkout">
          <div class="booking-item-head">
            <span class="chalet-name">{{ b.chaletName }} ({{ b.chaletNumber }})</span>
            <span class="time-tag"><i class="pi pi-clock" /> {{ formatTime(b.checkOut) }}</span>
          </div>
          <div class="booking-item-meta">
            <span><i class="pi pi-users" /> {{ b.guests?.length || 0 }} ضيف</span>
            <span v-if="b.checkedOutAt" class="done-tag"><i class="pi pi-check" /> تم الخروج</span>
            <span v-else class="pending-tag"><i class="pi pi-clock" /> في الانتظار</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBookingsStore } from '@/stores/bookings'
import { useAuthStore } from '@/stores/auth'

const bookingsStore = useBookingsStore()
const auth = useAuthStore()

const assignedChaletIds = computed(() => auth.user?.assignedChaletIds || [])

const myBookings = computed(() => {
  return bookingsStore.bookings.filter((b) => {
    if (assignedChaletIds.value.length === 0) return true
    return assignedChaletIds.value.includes(b.chaletId)
  })
})

const bookedChalets = computed(() => {
  return myBookings.value.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
})

const today = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

const todayCheckIns = computed(() => {
  return myBookings.value.filter((b) => {
    if (b.status !== 'CONFIRMED') return false
    const ci = new Date(b.checkIn)
    ci.setHours(0, 0, 0, 0)
    return ci.getTime() === today.value.getTime()
  })
})

const todayCheckOuts = computed(() => {
  return myBookings.value.filter((b) => {
    if (b.status !== 'CONFIRMED') return false
    const co = new Date(b.checkOut)
    co.setHours(0, 0, 0, 0)
    return co.getTime() === today.value.getTime()
  })
})

function statusLabel(status) {
  return { CONFIRMED: 'مؤكد', PENDING: 'معلق', CANCELLED: 'ملغي', EXPIRED: 'منتهي', TEMPORARY: 'مؤقت' }[status] || status
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.section-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.card-title { display: flex; align-items: center; gap: 8px; font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
.card-title i { color: #f97316; font-size: 18px; }

.empty-mini { display: flex; align-items: center; gap: 8px; padding: 20px; color: #94a3b8; font-size: 13.5px; justify-content: center; }
.empty-mini i { font-size: 16px; }

.booking-list { display: flex; flex-direction: column; gap: 10px; }
.booking-item { padding: 14px 16px; border: 1px solid #f1f5f9; border-radius: 10px; transition: all 0.15s; }
.booking-item:hover { background: #fafbfc; }

.booking-item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.chalet-name { font-size: 14px; font-weight: 700; color: #1e293b; }

.booking-status-tag { display: inline-flex; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
.booking-status-tag.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.booking-status-tag.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }

.time-tag { font-size: 12px; color: #64748b; display: flex; align-items: center; gap: 4px; }

.booking-item-meta { display: flex; gap: 16px; font-size: 12.5px; color: #64748b; flex-wrap: wrap; }
.booking-item-meta span { display: flex; align-items: center; gap: 4px; }
.booking-item-meta i { font-size: 12px; }

.done-tag { color: #10b981 !important; font-weight: 600; }
.pending-tag { color: #eab308 !important; font-weight: 600; }

@media (max-width: 768px) {
  .booking-item-head { flex-direction: column; align-items: flex-start; gap: 6px; }
  .booking-item-meta { flex-direction: column; gap: 6px; }
}
</style>
