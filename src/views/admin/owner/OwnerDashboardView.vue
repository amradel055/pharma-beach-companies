<template>
  <div class="owner-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">تقويم الحجوزات</h1>
        <p class="page-desc">عرض الحجوزات على شكل تقويم — اضغط على أي يوم متاح لبدء حجز جديد</p>
      </div>
    </div>

    <!-- Single combined card: header has filter + legend, body has nav + grid -->
    <div class="bk-card">
      <div class="bk-card-header">
        <div class="bk-filter">
          <label class="bk-filter-label">اختر الشاليه</label>
          <AppDropdown v-model="selectedChaletId" :options="chaletOptions" placeholder="كل الشاليهات" />
        </div>
        <div class="bk-legend">
          <span class="legend-item"><span class="legend-dot confirmed" /> مؤكد</span>
          <span class="legend-item"><span class="legend-dot partial" /> مدفوع جزئياً</span>
          <span class="legend-item"><span class="legend-dot today-dot" /> اليوم</span>
        </div>
      </div>

      <div class="bk-card-body">
        <div class="bk-nav">
          <button class="bk-nav-btn" @click="calMonth--" aria-label="السابق"><i class="pi pi-angle-right" /></button>
          <h3 class="bk-nav-title">{{ calMonthLabel }}</h3>
          <button class="bk-nav-btn" @click="calMonth++" aria-label="التالي"><i class="pi pi-angle-left" /></button>
        </div>

        <div class="bk-scroll">
          <div class="bk-grid" :style="{ '--days': monthDays.length }">
            <!-- Header row -->
            <div class="bk-cell bk-h bk-chalet-header">اسم وكود الشاليه</div>
            <div
              v-for="d in monthDays"
              :key="`h-${d.num}`"
              class="bk-cell bk-h bk-day-header"
              :class="{ today: d.isToday }"
            >
              <span class="bk-weekday">{{ d.weekdayLabel }}</span>
              <span class="bk-daynum">{{ d.num }}</span>
            </div>

            <!-- Chalet rows -->
            <template v-for="(ch, ci) in calendarChalets" :key="ch.id">
              <div class="bk-cell bk-chalet-name" :style="{ gridRow: ci + 2 }">
                <strong>{{ ch.name }}</strong>
                <span v-if="ch.chaletNumber" class="bk-chalet-code">{{ ch.chaletNumber }}</span>
              </div>
              <div
                v-for="d in monthDays"
                :key="`c${ch.id}-${d.num}`"
                class="bk-cell bk-day-cell"
                :class="{
                  today: d.isToday,
                  'is-selectable': isFreeDay(ch.id, d.num),
                  'is-selected': isInSelection(ch.id, d.num),
                  'is-sel-start': isSelectionEdge(ch.id, d.num, 'start'),
                  'is-sel-end': isSelectionEdge(ch.id, d.num, 'end'),
                  'is-preview': isInPreview(ch.id, d.num),
                }"
                :style="{ gridRow: ci + 2, gridColumn: d.num + 1 }"
                @click="clickDay(ch.id, d.num)"
                @mouseenter="onHoverDay(ch.id, d.num)"
                @mouseleave="onLeaveDay"
              >
                <span v-if="showDayNumber(ch.id, d.num)" class="bk-day-num-inline">{{ d.num }}</span>
              </div>
            </template>

            <!-- Booking bars overlaid on the grid -->
            <button
              v-for="bar in bookingBars"
              :key="bar.key"
              :class="['bk-bar', bar.colorClass, bar.statusClass]"
              :style="{ gridRow: bar.row, gridColumn: `${bar.startCol} / ${bar.endCol}` }"
              :title="`${bar.guestName} — كود حجز ${bar.code}`"
              @click="openBooking(bar.booking)"
            >
              <span class="bk-bar-guest">{{ bar.guestName }}</span>
              <span class="bk-bar-code">كود حجز {{ bar.code }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Booking details panel — slides in from the inline-end (left in RTL).
           Calendar stays interactive behind it so the user can re-pick a range. -->
      <Teleport to="body">
        <Transition name="bk-panel">
          <aside v-if="selectionInfo && selectedChalet" class="bk-panel">
            <header class="bk-panel-head">
              <div class="bk-panel-head-content">
                <div class="bk-panel-icon"><i class="pi pi-calendar-plus" /></div>
                <div>
                  <h3 class="bk-panel-title">تفاصيل الحجز</h3>
                  <p class="bk-panel-subtitle">راجع البيانات وأكد عملية الحجز</p>
                </div>
              </div>
              <button class="bk-panel-close" @click="clearSelection" aria-label="إغلاق">
                <i class="pi pi-times" />
              </button>
            </header>

            <div class="bk-panel-body">
              <div class="bf-form">
          <!-- Top strip: booking code + broker name -->
          <div class="bf-strip">
            <div class="bf-strip-item">
              <span class="bf-strip-label">كود عملية الحجز</span>
              <strong class="bf-strip-value">{{ bookingCodePreview }}</strong>
            </div>
            <div class="bf-strip-item">
              <span class="bf-strip-label">إسم البروكر</span>
              <strong class="bf-strip-value bf-strip-broker">{{ auth.user?.name || '—' }}</strong>
            </div>
          </div>

          <!-- Two-column body -->
          <div class="bf-cols">
            <!-- Chalet info (right in RTL) -->
            <section class="bf-col">
              <h4 class="bf-col-title">بيانات الشاليه</h4>
              <div class="bf-rows">
                <div class="bf-row"><span class="bf-label">كود الشاليه</span><span class="bf-value bf-value-mono">{{ shortId(selectedChalet.id) }}</span></div>
                <div class="bf-row"><span class="bf-label">إسم القرية</span><span class="bf-value">{{ selectedChalet.villageName || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">إسم المالك</span><span class="bf-value">{{ selectedChalet.ownerName || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">رقم الشاليه</span><span class="bf-value">{{ selectedChalet.chaletNumber || selectedChalet.chalet_number || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">رقم المجموعة</span><span class="bf-value">{{ selectedChalet.groupNumber || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">الدور</span><span class="bf-value">{{ selectedChalet.floor?.label_ar || selectedChalet.floor || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">رقم الوحده</span><span class="bf-value">{{ selectedChalet.unitNumber || selectedChalet.chaletNumber || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">مساحة الشاليه</span><span class="bf-value">{{ selectedChalet.area_range?.label_ar || selectedChalet.area || '—' }}</span></div>
                <div class="bf-row"><span class="bf-label">عدد الأفراد</span><span class="bf-value">{{ selectedChalet.max_guests || selectedChalet.maxGuests || '—' }}</span></div>
              </div>
            </section>

            <!-- Financial details (left in RTL) -->
            <section class="bf-col">
              <h4 class="bf-col-title">التفاصيل المالية</h4>
              <div class="bf-rows">
                <div class="bf-row"><span class="bf-label">تاريخ الدخول</span><span class="bf-value">{{ fmtDate(selectionInfo.startDate) }}</span></div>
                <div class="bf-row"><span class="bf-label">تاريخ الخروج</span><span class="bf-value">{{ fmtDate(selectionInfo.endDate) }}</span></div>
                <div class="bf-row"><span class="bf-label">عدد الليالى</span><span class="bf-value">{{ selectionInfo.nights }}</span></div>
                <div class="bf-row"><span class="bf-label">سعر الليالى</span><span class="bf-value">{{ fmtNum(financial.nightlyTotal) }} ج.م</span></div>

                <div class="bf-row bf-row-accent-orange">
                  <span class="bf-label">رسوم القرية</span>
                  <span class="bf-value">{{ fmtNum(financial.villageFee) }} ج.م</span>
                </div>
                <div class="bf-row bf-row-accent-amber">
                  <span class="bf-label">رسوم تصاريح</span>
                  <span class="bf-value">{{ fmtNum(financial.permitFee) }} ج.م</span>
                </div>

                <div class="bf-row bf-row-accent-amber bf-row-stepper">
                  <span class="bf-label">أفراد إضافيين</span>
                  <div class="bf-stepper-group">
                    <span class="bf-unit-price">{{ fmtNum(financial.extraPersonUnitPrice) }}</span>
                    <div class="bf-stepper">
                      <button type="button" @click="extraPeople = Math.max(0, extraPeople - 1)" aria-label="نقص"><i class="pi pi-minus" /></button>
                      <span class="bf-stepper-val">{{ extraPeople }}</span>
                      <button type="button" @click="extraPeople++" aria-label="زيادة"><i class="pi pi-plus" /></button>
                    </div>
                    <span class="bf-value">{{ fmtNum(financial.extraPersonTotal) }}</span>
                  </div>
                </div>

                <div class="bf-row bf-row-accent-amber bf-row-stepper">
                  <span class="bf-label">رسوم سيارة</span>
                  <div class="bf-stepper-group">
                    <span class="bf-unit-price">{{ fmtNum(financial.carUnitPrice) }}</span>
                    <div class="bf-stepper">
                      <button type="button" @click="carCount = Math.max(0, carCount - 1)" aria-label="نقص"><i class="pi pi-minus" /></button>
                      <span class="bf-stepper-val">{{ carCount }}</span>
                      <button type="button" @click="carCount++" aria-label="زيادة"><i class="pi pi-plus" /></button>
                    </div>
                    <span class="bf-value">{{ fmtNum(financial.carTotal) }}</span>
                  </div>
                </div>

                <div class="bf-row"><span class="bf-label">التأمين</span><span class="bf-value">{{ fmtNum(financial.deposit) }} ج.م</span></div>

                <div class="bf-row bf-row-total">
                  <span class="bf-label">الإجمالي</span>
                  <span class="bf-value">{{ fmtNum(financial.total) }} ج.م</span>
                </div>

                <div class="bf-row bf-row-input">
                  <span class="bf-label">المدفوع</span>
                  <div class="bf-input-wrap">
                    <input v-model.number="paidAmount" type="number" min="0" :max="financial.total" class="bf-input" />
                    <span class="bf-input-suffix">ج.م</span>
                  </div>
                </div>

                <div class="bf-row bf-row-balance">
                  <span class="bf-label">المتبقى</span>
                  <span class="bf-value">{{ fmtNum(financial.balance) }} ج.م</span>
                </div>
              </div>
            </section>
          </div>
              </div>
            </div>

            <footer class="bk-panel-foot">
              <button class="bk-modal-cancel" @click="clearSelection">إلغاء</button>
              <button class="bk-modal-book" @click="confirmBooking">
                <i class="pi pi-check" />
                تأكيد الحجز
              </button>
            </footer>
          </aside>
        </Transition>
      </Teleport>

      <!-- Day Bookings Modal — lists every chalet booked on the selected day -->
      <AppModal v-model="dayDetailOpen" :title="dayModalTitle" icon="pi pi-calendar" size="md">
        <div v-if="selectedDay" class="day-bookings">
          <div class="day-summary">
            <i class="pi pi-info-circle" />
            <span>{{ selectedDay.bookings.length }} شاليه محجوز في هذا اليوم</span>
          </div>

          <div class="day-list">
            <div
              v-for="b in selectedDay.bookings"
              :key="b.id"
              :class="['day-item', bookingType(b)]"
            >
              <div class="di-head">
                <div class="di-chalet">
                  <i class="pi pi-home" />
                  <div>
                    <strong>{{ b.chaletName }}</strong>
                    <span class="di-chalet-num" v-if="b.chaletNumber">{{ b.chaletNumber }}</span>
                  </div>
                </div>
                <span :class="['status-tag', b.status.toLowerCase()]">{{ statusLabel(b.status) }}</span>
              </div>

              <div class="di-rows">
                <div class="di-row">
                  <span class="di-label"><i class="pi pi-sign-in" /> تسجيل الدخول</span>
                  <span>{{ fmtDate(b.checkIn) }}</span>
                </div>
                <div class="di-row">
                  <span class="di-label"><i class="pi pi-sign-out" /> تسجيل الخروج</span>
                  <span>{{ fmtDate(b.checkOut) }}</span>
                </div>
                <div class="di-row">
                  <span class="di-label"><i class="pi pi-moon" /> الليالي</span>
                  <span>{{ b.nights }}</span>
                </div>
                <div class="di-row">
                  <span class="di-label"><i class="pi pi-wallet" /> الإجمالي</span>
                  <span class="di-total">{{ fmtNum(b.total) }} ج.م</span>
                </div>
              </div>

              <div class="di-pay">
                <div class="di-pay-bar">
                  <div class="di-pay-fill" :style="{ width: paymentPercent(b) + '%' }" />
                </div>
                <span class="di-pay-text">
                  مدفوع {{ fmtNum(paymentAmount(b)) }} / {{ fmtNum(b.total) }} ج.م
                  ({{ paymentPercent(b) }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </AppModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChaletsStore } from '@/stores/chalets'
import { useBookingsStore } from '@/stores/bookings'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES } from '@/constants/roles'
import api from '@/lib/api'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppModal from '@/components/ui/AppModal.vue'

const auth = useAuthStore()
const chaletsStore = useChaletsStore()
const bookingsStore = useBookingsStore()
const { hasRole } = usePermissions()

const selectedChaletId = ref('')
const calMonth = ref(new Date().getMonth())
const calYear = ref(new Date().getFullYear())
const selectedDay = ref(null)
const dayDetailOpen = computed({ get: () => !!selectedDay.value, set: (v) => { if (!v) selectedDay.value = null } })

const dayModalTitle = computed(() => {
  if (!selectedDay.value?.date) return 'تفاصيل اليوم'
  return selectedDay.value.date.toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
})

function paymentAmount(b) {
  return (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
}
function paymentPercent(b) {
  if (!b.total) return 0
  return Math.min(100, Math.round((paymentAmount(b) / b.total) * 100))
}
function bookingType(b) {
  if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') return 'other'
  return paymentAmount(b) >= b.total ? 'confirmed' : 'partial'
}
function statusLabel(s) {
  const map = { CONFIRMED: 'مؤكد', PENDING: 'قيد الانتظار', PROCESSING: 'قيد المعالجة', TEMPORARY: 'مؤقت' }
  return map[s] || s
}

// Owner's chalets
const ownerChalets = computed(() => {
  if (hasRole(ROLES.SITE_ADMIN)) return chaletsStore.chalets
  return chaletsStore.getByOwner(auth.user?.id)
})

const chaletOptions = computed(() => [
  { value: '', label: 'كل الشاليهات' },
  ...ownerChalets.value.map((c) => ({ value: c.id, label: `${c.name} (${c.chaletNumber})` })),
])

// Calendar — Gantt-style: rows are chalets, columns are days of the month.

const SHORT_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const BAR_COLORS = ['bar-c0', 'bar-c1', 'bar-c2', 'bar-c3', 'bar-c4']

function _resolveMonthYear() {
  const realMonth = ((calMonth.value % 12) + 12) % 12
  const yearOffset = Math.floor(calMonth.value / 12)
  return { month: realMonth, year: calYear.value + yearOffset }
}

const calMonthLabel = computed(() => {
  const { month, year } = _resolveMonthYear()
  const d = new Date(year, month, 1)
  return d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
})

// YYYY-MM-DD formatter used for API date params.
function _fmtYmd(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Date range of the currently-displayed month, used by the chalets API call.
const monthRange = computed(() => {
  const { month, year } = _resolveMonthYear()
  return {
    dateFrom: _fmtYmd(new Date(year, month, 1)),
    dateTo: _fmtYmd(new Date(year, month + 1, 0)),
  }
})

// GET /v1/chalets?dateFrom=...&dateTo=... — wired up but the response is only
// logged for now while we figure out how to feed it into the calendar.
async function fetchChalets() {
  try {
    const { data } = await api.get('/v1/chalets', {
      params: { dateFrom: monthRange.value.dateFrom, dateTo: monthRange.value.dateTo },
    })
    console.log('[chalets] params:', monthRange.value, 'response:', data)
  } catch (error) {
    console.error('[chalets] error:', error?.response?.data || error?.message)
  }
}

onMounted(fetchChalets)
watch(() => `${monthRange.value.dateFrom}|${monthRange.value.dateTo}`, fetchChalets)

// Array of every day in the displayed month, with weekday metadata.
const monthDays = computed(() => {
  const { month, year } = _resolveMonthYear()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const days = []
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d)
    date.setHours(0, 0, 0, 0)
    const dow = date.getDay()
    days.push({
      num: d,
      date,
      weekdayLabel: SHORT_WEEKDAYS[dow],
      isToday: date.getTime() === today.getTime(),
      isWeekend: dow === 5 || dow === 6, // Fri / Sat in the Arab calendar week
    })
  }
  return days
})

// Chalets shown as rows. Filter by dropdown if set.
const calendarChalets = computed(() => {
  if (selectedChaletId.value) {
    return ownerChalets.value.filter((c) => c.id === Number(selectedChaletId.value))
  }
  return ownerChalets.value
})

// Booking bars: one positioned element per booking that overlaps the visible month.
const bookingBars = computed(() => {
  const { month, year } = _resolveMonthYear()
  const monthStart = new Date(year, month, 1); monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0); monthEnd.setHours(0, 0, 0, 0)
  const chalets = calendarChalets.value

  const bars = []
  chalets.forEach((ch, ci) => {
    const chBookings = bookingsStore.bookings.filter(
      (b) => b.chaletId === ch.id && (b.status === 'CONFIRMED' || b.status === 'PENDING'),
    )

    for (const b of chBookings) {
      const bStart = new Date(b.checkIn); bStart.setHours(0, 0, 0, 0)
      const bEnd = new Date(b.checkOut); bEnd.setHours(0, 0, 0, 0)
      // Convert to inclusive last-occupied-day (check-out morning = not occupied)
      const lastOccupied = new Date(bEnd); lastOccupied.setDate(lastOccupied.getDate() - 1)

      // Skip if outside the visible month
      if (lastOccupied < monthStart || bStart > monthEnd) continue

      const clampStart = bStart < monthStart ? monthStart : bStart
      const clampEnd = lastOccupied > monthEnd ? monthEnd : lastOccupied

      const startDay = clampStart.getDate()
      const endDay = clampEnd.getDate()

      const paid = (b.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
      const fullyPaid = paid >= (b.total || 0)

      const mainGuest = b.guests?.[0]?.name || 'ضيف'

      bars.push({
        key: `${ch.id}-${b.id}`,
        row: ci + 2,                          // +2 because row 1 is the header
        startCol: startDay + 1,               // +1 because column 1 is the chalet name
        endCol: endDay + 2,                   // grid-column end is exclusive
        guestName: mainGuest,
        code: b.id,
        booking: b,
        startDate: clampStart,
        colorClass: BAR_COLORS[_hashId(b.id) % BAR_COLORS.length],
        statusClass: fullyPaid ? 'is-paid' : 'is-partial',
      })
    }
  })
  return bars
})

function _hashId(id) {
  const s = String(id || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

function openBooking(b) {
  // Reuse the existing day-bookings modal with a single-booking list.
  selectedDay.value = { date: new Date(b.checkIn), bookings: [b] }
}

// ──────────────────────────────────────────────────────────────────────────
// Range selection — let the user click two free days in the same chalet row
// to mark a candidate booking range.
// ──────────────────────────────────────────────────────────────────────────
const selection = ref({ chaletId: null, startDay: null, endDay: null })

// Set<dayNum> per chalet ID of days that already have a booking this month.
const bookedDayMap = computed(() => {
  const { month, year } = _resolveMonthYear()
  const monthStart = new Date(year, month, 1); monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0); monthEnd.setHours(0, 0, 0, 0)

  const map = {}
  for (const ch of calendarChalets.value) map[ch.id] = new Set()

  for (const b of bookingsStore.bookings) {
    if (!map[b.chaletId]) continue
    if (b.status !== 'CONFIRMED' && b.status !== 'PENDING') continue
    const bStart = new Date(b.checkIn); bStart.setHours(0, 0, 0, 0)
    const bEnd = new Date(b.checkOut); bEnd.setHours(0, 0, 0, 0)
    const lastOccupied = new Date(bEnd); lastOccupied.setDate(lastOccupied.getDate() - 1)
    let cur = new Date(Math.max(bStart, monthStart))
    const stopAt = new Date(Math.min(lastOccupied, monthEnd))
    while (cur <= stopAt) {
      map[b.chaletId].add(cur.getDate())
      cur = new Date(cur); cur.setDate(cur.getDate() + 1)
    }
  }
  return map
})

function isFreeDay(chaletId, day) {
  return !bookedDayMap.value[chaletId]?.has(day)
}

function isInSelection(chaletId, day) {
  const s = selection.value
  if (s.chaletId !== chaletId || s.startDay === null) return false
  const min = s.endDay !== null ? Math.min(s.startDay, s.endDay) : s.startDay
  const max = s.endDay !== null ? Math.max(s.startDay, s.endDay) : s.startDay
  return day >= min && day <= max
}

function isSelectionEdge(chaletId, day, edge) {
  const s = selection.value
  if (s.chaletId !== chaletId || s.startDay === null) return false
  const min = s.endDay !== null ? Math.min(s.startDay, s.endDay) : s.startDay
  const max = s.endDay !== null ? Math.max(s.startDay, s.endDay) : s.startDay
  return edge === 'start' ? day === min : day === max
}

// Hover preview — show the candidate range live while the user picks the end day.
const hoveredDay = ref({ chaletId: null, day: null })
function onHoverDay(chaletId, day) { hoveredDay.value = { chaletId, day } }
function onLeaveDay() { hoveredDay.value = { chaletId: null, day: null } }

function isInPreview(chaletId, day) {
  const s = selection.value
  const h = hoveredDay.value
  // Only preview while a partial selection (start set, end not yet) exists
  // and the hover is on the same chalet row.
  if (s.startDay === null || s.endDay !== null) return false
  if (s.chaletId !== chaletId || h.chaletId !== chaletId || h.day === null) return false
  const min = Math.min(s.startDay, h.day)
  const max = Math.max(s.startDay, h.day)
  // Hide preview entirely if the hovered range would cross an existing booking
  for (let d = min; d <= max; d++) {
    if (!isFreeDay(chaletId, d)) return false
  }
  return day >= min && day <= max
}

// Show the day number INSIDE cells that are part of a selection or hover preview.
function showDayNumber(chaletId, day) {
  return isInSelection(chaletId, day) || isInPreview(chaletId, day)
}

function clickDay(chaletId, day) {
  if (!isFreeDay(chaletId, day)) return

  const s = selection.value

  // Starting fresh: no selection, switching chalet, or a completed range exists.
  if (!s.chaletId || s.chaletId !== chaletId || s.endDay !== null) {
    selection.value = { chaletId, startDay: day, endDay: null }
    return
  }

  // Completing the range — verify nothing in between is booked.
  const min = Math.min(s.startDay, day)
  const max = Math.max(s.startDay, day)
  for (let d = min; d <= max; d++) {
    if (!isFreeDay(chaletId, d)) {
      // A booking sits inside the proposed range — restart from this click.
      selection.value = { chaletId, startDay: day, endDay: null }
      return
    }
  }
  selection.value = { chaletId, startDay: min, endDay: max }
}

function clearSelection() {
  selection.value = { chaletId: null, startDay: null, endDay: null }
}

// Reset selection when navigating between months (day numbers wouldn't match).
watch(() => `${calMonth.value}|${calYear.value}`, clearSelection)

const selectionInfo = computed(() => {
  const s = selection.value
  if (!s.chaletId || s.startDay === null || s.endDay === null) return null
  const chalet = calendarChalets.value.find((c) => c.id === s.chaletId)
  if (!chalet) return null
  const { month, year } = _resolveMonthYear()
  const startDate = new Date(year, month, s.startDay)
  const endDate = new Date(year, month, s.endDay)
  return {
    chaletId: s.chaletId,
    chaletName: chalet.name,
    chaletNumber: chalet.chaletNumber,
    startDate,
    endDate,
    nights: s.endDay - s.startDay + 1,
  }
})

function weekdayLabel(date) {
  return date.toLocaleDateString('ar-EG', { weekday: 'long' })
}

// ──────────────────────────────────────────────────────────────────────────
// Booking form state — quantity steppers + paid amount
// ──────────────────────────────────────────────────────────────────────────
const extraPeople = ref(0)
const carCount = ref(0)
const paidAmount = ref(0)

// Reset the form whenever a new range is opened.
watch(() => selectionInfo.value?.chaletId + '|' + selectionInfo.value?.startDate, () => {
  extraPeople.value = 0
  carCount.value = 0
  paidAmount.value = 0
})

const selectedChalet = computed(() => {
  if (!selection.value.chaletId) return null
  return calendarChalets.value.find((c) => c.id === selection.value.chaletId) || null
})

const bookingCodePreview = computed(() => {
  // Real code is assigned by the API after creation; show "جديد" until then.
  return 'جديد'
})

function shortId(id) {
  if (!id) return '—'
  const s = String(id)
  return s.length > 12 ? s.slice(0, 8) + '…' : s
}

const financial = computed(() => {
  const ch = selectedChalet.value
  const info = selectionInfo.value
  if (!ch || !info) {
    return { nightlyRate: 0, nightlyTotal: 0, villageFee: 0, permitFee: 0,
      extraPersonUnitPrice: 0, extraPersonTotal: 0, carUnitPrice: 0, carTotal: 0,
      deposit: 0, total: 0, balance: 0 }
  }

  const nights = info.nights
  const nightlyRate = Number(ch.price || 0)
  const nightlyTotal = nightlyRate * nights

  const villageFeePerNight = Number(ch.villageFeePerNight || ch.rentalFee || 0)
  const villageFee = villageFeePerNight * nights

  const permitFee = Number(
    ch.settings?.electronic_permit_price ?? ch.settings?.security_permit_price ?? ch.permitFee ?? 0
  )

  const extraPersonUnitPrice = Number(
    ch.settings?.additional_person_price ?? ch.extraGuestCharge ?? 0
  )
  const extraPersonTotal = extraPersonUnitPrice * extraPeople.value * nights

  // First car uses first_car_price; subsequent cars use additional_car_price.
  const firstCarPrice = Number(ch.settings?.first_car_price ?? 0)
  const addCarPrice = Number(ch.settings?.additional_car_price ?? firstCarPrice)
  const carUnitPrice = firstCarPrice
  const carTotal = carCount.value === 0
    ? 0
    : firstCarPrice + addCarPrice * (carCount.value - 1)

  const deposit = Number(ch.settings?.deposit ?? ch.deposit ?? 0)

  const total = nightlyTotal + villageFee + permitFee + extraPersonTotal + carTotal + deposit
  const balance = Math.max(0, total - Number(paidAmount.value || 0))

  return {
    nightlyRate, nightlyTotal,
    villageFee, permitFee,
    extraPersonUnitPrice, extraPersonTotal,
    carUnitPrice, carTotal,
    deposit, total, balance,
  }
})

function confirmBooking() {
  // Placeholder — once the bookings POST endpoint is wired we'll send this
  // payload to the server. For now log it so the data flow is visible.
  const info = selectionInfo.value
  const f = financial.value
  console.log('[booking] proposed:', {
    chaletId: info.chaletId,
    chaletName: info.chaletName,
    chaletNumber: info.chaletNumber,
    startDate: info.startDate.toISOString(),
    endDate: info.endDate.toISOString(),
    nights: info.nights,
    extraPeople: extraPeople.value,
    carCount: carCount.value,
    financial: {
      nightlyTotal: f.nightlyTotal,
      villageFee: f.villageFee,
      permitFee: f.permitFee,
      extraPersonTotal: f.extraPersonTotal,
      carTotal: f.carTotal,
      deposit: f.deposit,
      total: f.total,
      paid: Number(paidAmount.value || 0),
      balance: f.balance,
    },
  })
  clearSelection()
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Booking Calendar (Gantt-style) — single combined card */
.bk-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  margin-bottom: 16px;
  overflow: hidden;
}

/* Card header — filter on the start side, legend on the end side */
.bk-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbfc;
  flex-wrap: wrap;
}

.bk-filter { display: flex; align-items: center; gap: 10px; min-width: 240px; }
.bk-filter-label {
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  white-space: nowrap;
}

.bk-card-body { padding: 16px; }

.bk-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 14px;
}
.bk-nav-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; min-width: 140px; text-align: center; }
.bk-nav-btn {
  width: 28px; height: 28px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #fff; color: #0284c7;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.bk-nav-btn:hover { background: #f0f9ff; border-color: #bae6fd; }
.bk-nav-btn i { font-size: 12px; }

.bk-scroll { overflow-x: auto; padding-bottom: 6px; }
.bk-scroll::-webkit-scrollbar { height: 8px; }
.bk-scroll::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
.bk-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

.bk-grid {
  display: grid;
  grid-template-columns: 130px repeat(var(--days, 31), minmax(28px, 1fr));
  border: 1px solid #e2e8f0;
  background: #fff;
  min-width: max-content;
  font-size: 11px;
  position: relative;
}

.bk-cell {
  border-inline-end: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  background: #fff;
}
.bk-cell:nth-last-child(-n + 32) { /* fallback: ensure consistent borders */ }

/* Header row */
.bk-h {
  background: #f8fafc;
  font-weight: 700;
  color: #475569;
  position: sticky;
  top: 0;
  z-index: 3;
}
.bk-chalet-header {
  font-size: 11.5px;
  background: #f1f5f9;
  color: #334155;
  padding: 6px;
  text-align: center;
  line-height: 1.3;
  position: sticky;
  inset-inline-start: 0;
  z-index: 5;
  grid-row: 1;
  grid-column: 1;
}
.bk-day-header {
  flex-direction: column;
  gap: 1px;
  padding: 4px 2px;
}
.bk-day-header.today { background: #fff7ed; color: #ea580c; box-shadow: inset 0 -2px 0 #f97316; }
.bk-weekday { font-size: 9px; color: #94a3b8; font-weight: 500; }
.bk-day-header.today .bk-weekday { color: #ea580c; }
.bk-daynum { font-size: 11.5px; font-weight: 700; }

/* Chalet name column (sticky on right edge in RTL) */
.bk-chalet-name {
  font-size: 11.5px;
  color: #0f172a;
  background: #fafbfc;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px;
  text-align: center;
  position: sticky;
  inset-inline-start: 0;
  z-index: 4;
  grid-column: 1;
  border-inline-end: 2px solid #e2e8f0;
  box-shadow: 2px 0 4px -2px rgba(15, 23, 42, 0.08);
}
.bk-chalet-name strong { font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.2; }
.bk-chalet-code { font-size: 9.5px; color: #94a3b8; font-weight: 600; letter-spacing: 0.02em; }

/* Day cells */
.bk-day-cell {
  background: #fff;
  transition: background 0.15s, box-shadow 0.15s;
}
.bk-day-cell.today { background: rgba(249, 115, 22, 0.04); }

/* Free, clickable day cells */
.bk-day-cell.is-selectable { cursor: pointer; }
.bk-day-cell.is-selectable:hover {
  background: rgba(249, 115, 22, 0.08);
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.25);
}

/* Selected range — middle cells */
.bk-day-cell.is-selected {
  background: rgba(249, 115, 22, 0.18) !important;
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.35);
}
/* Selected range — start / end cells get a stronger fill */
.bk-day-cell.is-sel-start,
.bk-day-cell.is-sel-end {
  background: rgba(249, 115, 22, 0.32) !important;
  box-shadow: inset 0 0 0 1.5px #f97316;
}

/* Live hover preview — lighter dashed orange tint */
.bk-day-cell.is-preview {
  background: rgba(249, 115, 22, 0.1) !important;
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.25);
}

/* Day number rendered inside selected / preview cells */
.bk-day-num-inline {
  font-size: 10.5px;
  font-weight: 700;
  color: #ea580c;
  line-height: 1;
}
.bk-day-cell.is-sel-start .bk-day-num-inline,
.bk-day-cell.is-sel-end .bk-day-num-inline {
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}
.bk-day-cell.is-sel-start,
.bk-day-cell.is-sel-end {
  /* Make the start/end edges richer when they hold a number inside */
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  box-shadow: 0 1px 4px rgba(249, 115, 22, 0.35);
}

/* Booking bars — overlay the day cells */
.bk-bar {
  position: relative;
  z-index: 1;
  margin: 3px 1px;
  border: 1px solid;
  border-radius: 5px;
  padding: 2px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  cursor: pointer;
  font-family: inherit;
  text-align: center;
  line-height: 1.15;
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
  min-width: 0;
}
.bk-bar:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12); z-index: 2; }
.bk-bar-guest {
  font-size: 10.5px;
  font-weight: 700;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bk-bar-code {
  font-size: 9px;
  font-weight: 500;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* Pastel color variants — assigned deterministically per booking */
.bk-bar.bar-c0 { background: #fce7f3; border-color: #f9a8d4; color: #9d174d; }
.bk-bar.bar-c1 { background: #dbeafe; border-color: #93c5fd; color: #1e40af; }
.bk-bar.bar-c2 { background: #dcfce7; border-color: #86efac; color: #166534; }
.bk-bar.bar-c3 { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
.bk-bar.bar-c4 { background: #ede9fe; border-color: #c4b5fd; color: #5b21b6; }

/* Status indicator: dashed border for partially-paid bookings */
.bk-bar.is-partial { border-style: dashed; }

/* ─── Booking details side panel ─── */
.bk-panel {
  position: fixed;
  top: 0;
  bottom: 0;
  inset-inline-end: 0; /* RTL: pins to the LEFT edge of the viewport */
  width: 560px;
  max-width: 100vw;
  background: #fff;
  box-shadow: -12px 0 40px -8px rgba(15, 23, 42, 0.18), -4px 0 12px -4px rgba(15, 23, 42, 0.08);
  z-index: 100;
  display: flex;
  flex-direction: column;
  font-family: inherit;
}

.bk-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  background: #fff;
  border-bottom: 1px solid #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 1;
}
.bk-panel-head-content { display: flex; align-items: center; gap: 12px; min-width: 0; }
.bk-panel-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #f97316;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.bk-panel-icon i { font-size: 16px; }
.bk-panel-title { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 2px; }
.bk-panel-subtitle { font-size: 12px; color: #94a3b8; margin: 0; font-weight: 500; }

.bk-panel-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}
.bk-panel-close:hover { background: #f8fafc; color: #ef4444; border-color: #fecaca; }
.bk-panel-close i { font-size: 11px; }

.bk-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.bk-panel-body::-webkit-scrollbar { width: 6px; }
.bk-panel-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
.bk-panel-body::-webkit-scrollbar-track { background: transparent; }

.bk-panel-foot {
  display: flex;
  gap: 10px;
  padding: 12px 18px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
  position: sticky;
  bottom: 0;
}
.bk-panel-foot .bk-modal-cancel,
.bk-panel-foot .bk-modal-book { flex: 1; justify-content: center; }

/* Slide-in transition (from the inline-end edge, which is the LEFT in RTL) */
.bk-panel-enter-active, .bk-panel-leave-active {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s;
}
.bk-panel-enter-from, .bk-panel-leave-to {
  transform: translateX(-100%);
  opacity: 0.4;
}

/* Compact two-column → single-column inside the panel */
.bk-panel .bf-cols { grid-template-columns: 1fr; }
.bk-panel .bf-col:not(:last-child) {
  border-inline-start: none;
  border-bottom: 1px solid #e2e8f0;
}
.bk-panel .bf-col { padding: 14px; }
.bk-panel .bf-col-title { margin-bottom: 10px; padding-bottom: 8px; font-size: 13.5px; }
.bk-panel .bf-row { padding: 6px 4px; font-size: 12.5px; min-height: 30px; }
.bk-panel .bf-row-total { padding: 8px 10px; }
.bk-panel .bf-stepper button { width: 20px; height: 20px; }
.bk-panel .bf-input { width: 95px; height: 30px; }

@media (max-width: 520px) {
  .bk-panel { width: 100%; }
}

/* ─── Booking form (shared by panel) ─── */
.bf-form { display: flex; flex-direction: column; gap: 16px; }

/* Top strip */
.bf-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #475569, #334155);
  border-radius: 10px;
  color: #fff;
}
.bf-strip-item { display: flex; align-items: center; gap: 8px; }
.bf-strip-label { font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; }
.bf-strip-value { font-size: 13.5px; font-weight: 700; }
.bf-strip-broker { color: #38bdf8; }

/* Two columns */
.bf-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.bf-col { padding: 16px 18px; min-width: 0; }
.bf-col:not(:last-child) { border-inline-start: 1px solid #e2e8f0; }

.bf-col-title {
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
}

/* Generic row */
.bf-rows { display: flex; flex-direction: column; gap: 4px; }
.bf-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 7px 4px;
  font-size: 13px;
  min-height: 32px;
}
.bf-label { color: #475569; font-weight: 600; }
.bf-value { color: #0f172a; font-weight: 600; }
.bf-value-mono { font-family: 'Courier New', monospace; font-size: 11.5px; color: #64748b; }

/* Accent row labels */
.bf-row-accent-orange .bf-label { color: #ea580c; }
.bf-row-accent-amber .bf-label { color: #b45309; }

/* Stepper rows */
.bf-row-stepper { align-items: center; }
.bf-stepper-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bf-unit-price {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
  min-width: 28px;
  text-align: center;
}

.bf-stepper {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}
.bf-stepper button {
  width: 22px;
  height: 22px;
  border: none;
  background: #f8fafc;
  color: #475569;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.bf-stepper button:hover { background: #f1f5f9; color: #f97316; }
.bf-stepper button i { font-size: 10px; }
.bf-stepper-val {
  min-width: 28px;
  text-align: center;
  font-size: 12.5px;
  font-weight: 700;
  color: #0f172a;
  padding: 0 4px;
  border-inline: 1px solid #e2e8f0;
}

/* Total row */
.bf-row-total {
  margin-top: 6px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 191, 36, 0.06));
  border-radius: 8px;
  border: 1px solid rgba(249, 115, 22, 0.18);
}
.bf-row-total .bf-label { color: #0f172a; font-weight: 800; font-size: 13.5px; }
.bf-row-total .bf-value { color: #ea580c; font-weight: 800; font-size: 15px; }

/* Paid input row */
.bf-row-input { padding-top: 4px; }
.bf-input-wrap { display: inline-flex; align-items: center; gap: 6px; }
.bf-input {
  width: 110px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  font-weight: 700;
  color: #0f172a;
  text-align: end;
  background: #fff;
  outline: none;
  transition: all 0.15s;
}
.bf-input:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.bf-input-suffix { font-size: 12px; color: #94a3b8; font-weight: 600; }

/* Balance row */
.bf-row-balance {
  margin-top: 4px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #cbd5e1;
}
.bf-row-balance .bf-label { color: #475569; font-weight: 700; }
.bf-row-balance .bf-value { color: #b91c1c; font-weight: 800; font-size: 14px; }

@media (max-width: 720px) {
  .bf-cols { grid-template-columns: 1fr; }
  .bf-col:not(:last-child) { border-inline-start: none; border-bottom: 1px solid #e2e8f0; }
  .bf-strip { flex-direction: column; align-items: stretch; gap: 6px; text-align: center; }
}

/* ─── Old confirmation modal (kept for fallback class name compatibility) ─── */
.bk-confirm { display: flex; flex-direction: column; gap: 18px; }

/* Chalet header card */
.bk-confirm-chalet {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 191, 36, 0.06));
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-radius: 14px;
}
.bk-confirm-chalet-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
}
.bk-confirm-chalet-icon i { font-size: 18px; }
.bk-confirm-chalet-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bk-confirm-chalet-info strong { font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.2; }
.bk-confirm-chalet-info span { font-size: 12.5px; color: #94a3b8; font-weight: 600; letter-spacing: 0.02em; }

/* Date range — two cards with a center divider holding the nights pill */
.bk-confirm-dates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0;
  align-items: stretch;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}
.bk-confirm-date {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  background: #fafbfc;
  text-align: center;
  min-width: 0;
}
.bk-confirm-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 600;
}
.bk-confirm-label i { font-size: 12px; color: #f97316; }
.bk-confirm-date-main { font-size: 15px; font-weight: 800; color: #0f172a; }
.bk-confirm-weekday { font-size: 12px; color: #64748b; font-weight: 500; }

.bk-confirm-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  background: #fff;
  position: relative;
}
.bk-confirm-divider::before,
.bk-confirm-divider::after {
  content: '';
  position: absolute;
  inset-block: 0;
  width: 1px;
  background: #e2e8f0;
}
.bk-confirm-divider::before { inset-inline-start: 0; }
.bk-confirm-divider::after { inset-inline-end: 0; }
.bk-confirm-nights-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 700;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.35);
  white-space: nowrap;
}
.bk-confirm-nights-pill i { font-size: 12px; }

/* Modal footer buttons */
.bk-modal-cancel,
.bk-modal-book {
  padding: 10px 20px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid;
}
.bk-modal-cancel {
  background: #fff;
  border-color: #e2e8f0;
  color: #64748b;
}
.bk-modal-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
.bk-modal-book {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: #ea580c;
  color: #fff;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
}
.bk-modal-book:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }
.bk-modal-book:active { transform: translateY(0); }
.bk-modal-book i { font-size: 12px; }

@media (max-width: 540px) {
  .bk-confirm-dates { grid-template-columns: 1fr; }
  .bk-confirm-divider {
    padding: 10px 0;
  }
  .bk-confirm-divider::before,
  .bk-confirm-divider::after {
    inset-block: auto;
    inset-inline: 0;
    height: 1px;
    width: auto;
  }
  .bk-confirm-divider::before { top: 0; }
  .bk-confirm-divider::after { bottom: 0; }
}

/* Legend — sits inside the card header */
.bk-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; }
.legend-dot { width: 14px; height: 9px; border-radius: 3px; background: #dcfce7; border: 1px solid #86efac; }
.legend-dot.confirmed { background: #dcfce7; border-color: #86efac; }
.legend-dot.partial { background: #fef3c7; border-color: #fcd34d; border-style: dashed; }
.legend-dot.today-dot { background: rgba(249, 115, 22, 0.15); border-color: #f97316; }

/* Day-bookings list (modal) */
.day-bookings { display: flex; flex-direction: column; gap: 14px; }
.day-summary {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(14, 165, 233, 0.06);
  border: 1px solid rgba(14, 165, 233, 0.18);
  border-radius: 10px;
  font-size: 13px; font-weight: 600; color: #0369a1;
}
.day-summary i { font-size: 14px; }

.day-list { display: flex; flex-direction: column; gap: 12px; max-height: 60vh; overflow-y: auto; padding-inline-end: 4px; }

.day-item {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.15s;
}
.day-item:hover { border-color: #e2e8f0; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05); }
.day-item.confirmed { border-inline-start: 3px solid #10b981; }
.day-item.partial { border-inline-start: 3px solid #eab308; }

.di-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.di-chalet { display: flex; align-items: center; gap: 10px; min-width: 0; }
.di-chalet > i { font-size: 18px; color: #f97316; flex-shrink: 0; }
.di-chalet strong { display: block; font-size: 14.5px; font-weight: 700; color: #0f172a; }
.di-chalet-num { display: block; font-size: 11.5px; color: #94a3b8; font-weight: 500; margin-top: 2px; }

.di-rows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}
.di-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #1e293b; }
.di-label { display: inline-flex; align-items: center; gap: 6px; color: #94a3b8; font-weight: 500; font-size: 12px; }
.di-label i { font-size: 12px; color: #94a3b8; }
.di-total { font-weight: 700; color: #f97316; }

.di-pay { display: flex; flex-direction: column; gap: 5px; padding-top: 8px; border-top: 1px solid #f8fafc; }
.di-pay-bar { width: 100%; height: 5px; background: #f1f5f9; border-radius: 999px; overflow: hidden; }
.di-pay-fill { height: 100%; background: linear-gradient(90deg, #f97316, #fbbf24); border-radius: 999px; transition: width 0.3s ease; }
.di-pay-text { font-size: 11.5px; color: #64748b; font-weight: 500; }

.status-tag { padding: 3px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 700; white-space: nowrap; }
.status-tag.confirmed { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-tag.pending { background: rgba(234, 179, 8, 0.1); color: #a16207; }
.status-tag.processing { background: rgba(14, 165, 233, 0.1); color: #0284c7; }
.status-tag.temporary { background: rgba(168, 85, 247, 0.1); color: #7c3aed; }

@media (max-width: 768px) {
  .bk-card-header { flex-direction: column; align-items: stretch; gap: 12px; padding: 12px; }
  .bk-filter { width: 100%; min-width: 0; }
  .bk-card-body { padding: 12px; }
  .bk-grid { font-size: 10.5px; }
  .bk-nav-title { font-size: 13.5px; }
  .bk-bar-guest { font-size: 9.5px; }
  .bk-bar-code { font-size: 8.5px; }
}
</style>
