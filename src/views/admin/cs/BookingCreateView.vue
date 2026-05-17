<template>
  <div class="booking-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/admin/village-bookings" class="crumb">الحجوزات</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">حجز جديد</span>
    </nav>

    <div class="page-header">
      <div class="page-icon"><i class="pi pi-calendar-plus" /></div>
      <div class="page-header-text">
        <h1 class="page-title">حجز جديد</h1>
        <p class="page-desc">اختر الشاليه ثم نطاق التاريخ على التقويم لبدء حجز قرية</p>
      </div>

      <div class="page-header-actions">
        <Transition name="hdr-sel">
          <div v-if="selectionInfo" class="hdr-selection">
            <div class="hdr-sel-icon"><i class="pi pi-calendar-plus" /></div>
            <div class="hdr-sel-text">
              <strong>{{ selectedChaletName || 'تم اختيار الشاليه' }}</strong>
              <span class="hdr-sel-meta">
                {{ toDisplayDate(selectionInfo.startDate) }}
                <i class="pi pi-arrow-left" />
                {{ toDisplayDate(selectionInfo.endDate) }}
                <span class="hdr-dot">·</span>
                {{ selectionInfo.nights }} {{ selectionInfo.nights === 1 ? 'ليلة' : 'ليالٍ' }}
              </span>
            </div>
            <button class="hdr-clear" aria-label="إلغاء الاختيار" @click="clearSelection">
              <i class="pi pi-times" />
            </button>
          </div>
        </Transition>

        <button
          class="hdr-continue"
          :disabled="!selectionInfo"
          :title="selectionInfo ? 'متابعة الحجز' : 'اختر شاليه ونطاق تاريخ أولاً'"
          @click="continueBooking"
        >
          <span>متابعة الحجز</span>
          <i class="pi pi-arrow-left" />
        </button>
      </div>
    </div>

    <!-- Calendar card -->
    <div class="bk-card">
      <div class="bk-card-header">
        <div class="bk-filters">
          <div class="bk-filter">
            <label class="bk-filter-label">الشركة</label>
            <AppDropdown
              v-model="filters.company_id"
              :options="companyOptions"
              placeholder="كل الشركات"
              empty-text="لا توجد شركات"
              @change="reloadChalets"
            />
          </div>
          <div class="bk-filter">
            <label class="bk-filter-label">المالك</label>
            <AppDropdown
              v-model="filters.owner_id"
              :options="ownerOptions"
              placeholder="كل الملاك"
              empty-text="لا يوجد ملاك"
              @change="reloadChalets"
            />
          </div>
          <div class="bk-filter">
            <label class="bk-filter-label">المجموعة</label>
            <AppDropdown
              v-model="filters.group_id"
              :options="groupOptions"
              placeholder="كل المجموعات"
              empty-text="لا توجد مجموعات"
              @change="reloadChalets"
            />
          </div>
        </div>
      </div>

      <div class="bk-card-body">
        <div class="bk-nav">
          <button class="bk-nav-btn" @click="calMonth--" aria-label="السابق"><i class="pi pi-angle-right" /></button>
          <h3 class="bk-nav-title">{{ calMonthLabel }}</h3>
          <button class="bk-nav-btn" @click="calMonth++" aria-label="التالي"><i class="pi pi-angle-left" /></button>
        </div>

        <div v-if="chaletsLoading" class="bk-loading"><i class="pi pi-spin pi-spinner" /> جاري تحميل الشاليهات...</div>
        <div v-else-if="!calendarChalets.length" class="bk-empty">
          <i class="pi pi-inbox" />
          <span>لا توجد شاليهات متاحة بهذه المعايير</span>
        </div>

        <div v-else class="bk-scroll">
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
              <RouterLink
                :to="{ name: 'admin-village-booking-chalet', params: { id: ch.id } }"
                class="bk-cell bk-chalet-name"
                :style="{ gridRow: ci + 2 }"
                :title="ch.name"
              >
                <strong>{{ ch.name }}</strong>
                <span v-if="ch.chalet_code || ch.chalet_number" class="bk-chalet-code">
                  {{ ch.chalet_code || ch.chalet_number }}
                </span>
              </RouterLink>
              <div
                v-for="d in monthDays"
                :key="`c${ch.id}-${d.num}`"
                class="bk-cell bk-day-cell"
                :class="{
                  today: d.isToday,
                  'is-past': isPastDay(d.num),
                  'is-selectable': isSelectable(ch.id, d.num),
                  'is-selected': isInSelection(ch.id, d.num),
                  'is-sel-start': isSelectionEdge(ch.id, d.num, 'start'),
                  'is-sel-end': isSelectionEdge(ch.id, d.num, 'end'),
                  'is-preview': isInPreview(ch.id, d.num),
                  'is-error': isInError(ch.id, d.num),
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
              :title="`${bar.guestName} — ${bar.code}`"
            >
              <span class="bk-bar-guest">{{ bar.guestName }}</span>
              <span class="bk-bar-code">{{ bar.code }}</span>
            </button>
          </div>
        </div>

        <!-- Pagination — shown whenever any chalets are loaded. Internal &
             display values are 1-based; the store applies the -1 offset on
             the wire since the API page param is 0-based. -->
        <div v-if="!chaletsLoading && calendarChalets.length" class="bk-pagination">
          <div class="bk-pagination-info">
            عرض {{ chaletRangeFrom }} – {{ chaletRangeTo }} من {{ chaletTotal }} شاليه
          </div>
          <div class="bk-pagination-controls">
            <button
              class="bk-page-btn nav"
              :disabled="chaletPage === 1"
              @click="goToChaletPage(chaletPage - 1)"
              aria-label="السابق"
            >
              <i class="pi pi-chevron-right" />
            </button>

            <button
              v-if="chaletPageWindow[0] > 1"
              class="bk-page-btn"
              @click="goToChaletPage(1)"
            >1</button>
            <span v-if="chaletPageWindow[0] > 2" class="bk-page-ellipsis">…</span>

            <button
              v-for="p in chaletPageWindow"
              :key="p"
              :class="['bk-page-btn', { active: p === chaletPage }]"
              @click="goToChaletPage(p)"
            >{{ p }}</button>

            <span v-if="chaletPageWindow[chaletPageWindow.length - 1] < chaletLastPage - 1" class="bk-page-ellipsis">…</span>
            <button
              v-if="chaletPageWindow[chaletPageWindow.length - 1] < chaletLastPage"
              class="bk-page-btn"
              @click="goToChaletPage(chaletLastPage)"
            >{{ chaletLastPage }}</button>

            <button
              class="bk-page-btn nav"
              :disabled="chaletPage === chaletLastPage"
              @click="goToChaletPage(chaletPage + 1)"
              aria-label="التالي"
            >
              <i class="pi pi-chevron-left" />
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toApiDate, toDisplayDate, monthRange } from '@/utils/date'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const router = useRouter()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

// ──────────────────────────────────────────────────────────────────────────
// Filters (Company / Owner / Group) — drive the chalet list
// ──────────────────────────────────────────────────────────────────────────
const companies = ref([])
const owners = ref([])
const groups = ref([])

const filters = reactive({
  company_id: '',
  owner_id: '',
  group_id: '',
})

const companyOptions = computed(() => [
  { value: '', label: 'كل الشركات' },
  ...companies.value.map((c) => ({ value: c.id, label: c.name })),
])
const ownerOptions = computed(() => [
  { value: '', label: 'كل الملاك' },
  ...owners.value.map((o) => ({ value: o.id, label: o.name })),
])
const groupOptions = computed(() => [
  { value: '', label: 'كل المجموعات' },
  ...groups.value.map((g) => ({ value: g.id, label: g.name })),
])

// ──────────────────────────────────────────────────────────────────────────
// Calendar — month state
// ──────────────────────────────────────────────────────────────────────────
const SHORT_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const BAR_COLORS = ['bar-c0', 'bar-c1', 'bar-c2', 'bar-c3', 'bar-c4']

const calMonth = ref(new Date().getMonth())
const calYear = ref(new Date().getFullYear())

function _resolveMonthYear() {
  const realMonth = ((calMonth.value % 12) + 12) % 12
  const yearOffset = Math.floor(calMonth.value / 12)
  return { month: realMonth, year: calYear.value + yearOffset }
}

const calMonthLabel = computed(() => {
  const { month, year } = _resolveMonthYear()
  return new Date(year, month, 1).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
})

const currentMonthApiRange = computed(() => {
  const { month, year } = _resolveMonthYear()
  return monthRange(year, month)
})

const monthDays = computed(() => {
  const { month, year } = _resolveMonthYear()
  const lastDate = new Date(year, month + 1, 0).getDate()
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const days = []
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d)
    date.setHours(0, 0, 0, 0)
    days.push({
      num: d,
      date,
      weekdayLabel: SHORT_WEEKDAYS[date.getDay()],
      isToday: date.getTime() === today.getTime(),
    })
  }
  return days
})

// ──────────────────────────────────────────────────────────────────────────
// Chalets (rows) + their bookings (bars) — both loaded from API
// ──────────────────────────────────────────────────────────────────────────
const chalets = ref([])
const chaletTotal = ref(0)
// Pagination — 1-indexed (UI-friendly); store handles the -1 conversion to the
// API's 0-based page param. `lastPage` is the count of pages (1 = single page).
const chaletPage = ref(1)
const chaletLastPage = ref(1)
const chaletRangeFrom = ref(0)
const chaletRangeTo = ref(0)
const CHALET_PAGE_SIZE = 10
// Start in loading state so the spinner shows on first paint — otherwise the
// empty-state message flashes for one frame before the mount fetch kicks in.
const chaletsLoading = ref(true)
// keyed by chalet.id → array of bookings from /v1/chalets/{id}/bookings
const chaletBookings = ref({})

const calendarChalets = computed(() => chalets.value)

// Sliding window of page numbers around the current page (1-indexed).
const chaletPageWindow = computed(() => {
  const last = chaletLastPage.value
  const cur = chaletPage.value
  const span = 2
  let start = Math.max(1, cur - span)
  let end = Math.min(last, cur + span)
  if (end - start < span * 2) {
    if (start === 1) end = Math.min(last, start + span * 2)
    else if (end === last) start = Math.max(1, end - span * 2)
  }
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

// Single API call that returns chalets + their bookings together.
async function loadChalets() {
  chaletsLoading.value = true
  const r = await csBookings.listAvailableChaletsDetail({
    page: chaletPage.value,
    limit: CHALET_PAGE_SIZE,
    company_id: filters.company_id,
    owner_id: filters.owner_id,
    group_id: filters.group_id,
    // Availability depends on the visible month — send its date range.
    check_in: currentMonthApiRange.value.date_from,
    check_out: currentMonthApiRange.value.date_to,
  })
  chaletsLoading.value = false
  if (r.ok) {
    const rows = r.data?.rows || r.data?.content || []
    chalets.value = rows
    chaletTotal.value = r.data?.total ?? rows.length
    chaletPage.value = r.data?.page ?? 1
    chaletLastPage.value = r.data?.lastPage ?? 1
    chaletRangeFrom.value = r.data?.from ?? 0
    chaletRangeTo.value = r.data?.to ?? rows.length
    // Pull each chalet's bookings out of the same response — keyed by id.
    const next = {}
    for (const c of rows) next[c.id] = c.bookings || []
    chaletBookings.value = next
  } else {
    toast.error(r.error)
    chalets.value = []
    chaletTotal.value = 0
    chaletLastPage.value = 1
    chaletBookings.value = {}
  }
}

// Filter change → reset to page 1.
async function reloadChalets() {
  clearSelection()
  chaletPage.value = 1
  await loadChalets()
}

// Page change — used by pagination controls.
function goToChaletPage(p) {
  if (p < 1 || p > chaletLastPage.value || p === chaletPage.value) return
  clearSelection()
  chaletPage.value = p
  loadChalets()
}

// Refresh just one chalet — used after confirming a new booking.
async function refreshChaletBookings(chaletId) {
  const range = currentMonthApiRange.value
  const r = await csBookings.getChaletBookings(chaletId, {
    date_from: range.date_from,
    date_to: range.date_to,
  })
  if (r.ok) {
    chaletBookings.value = { ...chaletBookings.value, [chaletId]: r.data?.bookings || [] }
  }
}

// Navigating months: clear the in-progress selection (day numbers belong to
// a different month now) and refetch — availability is date-dependent, so a
// new month means a new /chalets/available-detail query for that range.
watch(() => `${calMonth.value}|${calYear.value}`, () => {
  clearSelection()
  chaletPage.value = 1
  loadChalets()
})

// ──────────────────────────────────────────────────────────────────────────
// Booking bars + occupied-day map (mirrors OwnerDashboardView)
// ──────────────────────────────────────────────────────────────────────────
const OCCUPIED_STATUSES = new Set(['CONFIRMED', 'PENDING', 'PROCESSING', 'TEMPORARY'])

const bookingBars = computed(() => {
  const { month, year } = _resolveMonthYear()
  const monthStart = new Date(year, month, 1); monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0); monthEnd.setHours(0, 0, 0, 0)

  const bars = []
  chalets.value.forEach((ch, ci) => {
    const list = chaletBookings.value[ch.id] || []
    for (const b of list) {
      if (!OCCUPIED_STATUSES.has(b.status)) continue
      const bStart = new Date(b.check_in); bStart.setHours(0, 0, 0, 0)
      const bEnd = new Date(b.check_out); bEnd.setHours(0, 0, 0, 0)
      const lastOccupied = new Date(bEnd); lastOccupied.setDate(lastOccupied.getDate() - 1)
      if (lastOccupied < monthStart || bStart > monthEnd) continue

      const clampStart = bStart < monthStart ? monthStart : bStart
      const clampEnd = lastOccupied > monthEnd ? monthEnd : lastOccupied
      const startDay = clampStart.getDate()
      const endDay = clampEnd.getDate()

      const fullyPaid = b.status === 'CONFIRMED'
      const guest = b.guests?.[0]?.name || 'ضيف'

      bars.push({
        key: `${ch.id}-${b.id}`,
        row: ci + 2,
        startCol: startDay + 1,
        endCol: endDay + 2,
        guestName: guest,
        code: b.booking_code || `#${b.code || ''}`,
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

const bookedDayMap = computed(() => {
  const { month, year } = _resolveMonthYear()
  const monthStart = new Date(year, month, 1); monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0); monthEnd.setHours(0, 0, 0, 0)

  const map = {}
  for (const ch of chalets.value) map[ch.id] = new Set()

  for (const ch of chalets.value) {
    const list = chaletBookings.value[ch.id] || []
    for (const b of list) {
      if (!OCCUPIED_STATUSES.has(b.status)) continue
      const bStart = new Date(b.check_in); bStart.setHours(0, 0, 0, 0)
      const bEnd = new Date(b.check_out); bEnd.setHours(0, 0, 0, 0)
      const lastOccupied = new Date(bEnd); lastOccupied.setDate(lastOccupied.getDate() - 1)
      let cur = new Date(Math.max(bStart, monthStart))
      const stopAt = new Date(Math.min(lastOccupied, monthEnd))
      while (cur <= stopAt) {
        map[ch.id].add(cur.getDate())
        cur = new Date(cur); cur.setDate(cur.getDate() + 1)
      }
    }
  }
  return map
})

function isFreeDay(chaletId, day) {
  return !bookedDayMap.value[chaletId]?.has(day)
}

// True if the day in the visible month is strictly before today. Used to
// block past-date selection (backend rejects check_in < today).
function isPastDay(day) {
  const { month, year } = _resolveMonthYear()
  const cell = new Date(year, month, day); cell.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return cell.getTime() < today.getTime()
}

// Combined predicate — a day is selectable iff it's not booked AND not past.
function isSelectable(chaletId, day) {
  return isFreeDay(chaletId, day) && !isPastDay(day)
}

// ──────────────────────────────────────────────────────────────────────────
// Range selection — two-click range pick within the same chalet row
// ──────────────────────────────────────────────────────────────────────────
const selection = ref({ chaletId: null, startDay: null, endDay: null })
const hoveredDay = ref({ chaletId: null, day: null })
const errorRange = ref({ chaletId: null, startDay: null, endDay: null })

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

function onHoverDay(chaletId, day) { hoveredDay.value = { chaletId, day } }
function onLeaveDay() { hoveredDay.value = { chaletId: null, day: null } }

function isInPreview(chaletId, day) {
  const s = selection.value
  const h = hoveredDay.value
  if (s.startDay === null || s.endDay !== null) return false
  if (s.chaletId !== chaletId || h.chaletId !== chaletId || h.day === null) return false
  const min = Math.min(s.startDay, h.day)
  const max = Math.max(s.startDay, h.day)
  for (let d = min; d <= max; d++) {
    if (!isSelectable(chaletId, d)) return false
  }
  return day >= min && day <= max
}

function isInError(chaletId, day) {
  const e = errorRange.value
  if (e.chaletId !== chaletId || e.startDay === null || e.endDay === null) return false
  return day >= e.startDay && day <= e.endDay
}

function showDayNumber(chaletId, day) {
  return isInSelection(chaletId, day) || isInPreview(chaletId, day)
}

function clickDay(chaletId, day) {
  if (!isSelectable(chaletId, day)) return
  errorRange.value = { chaletId: null, startDay: null, endDay: null }

  const s = selection.value
  if (!s.chaletId || s.chaletId !== chaletId || s.endDay !== null) {
    selection.value = { chaletId, startDay: day, endDay: null }
    return
  }
  const min = Math.min(s.startDay, day)
  const max = Math.max(s.startDay, day)
  for (let d = min; d <= max; d++) {
    if (!isSelectable(chaletId, d)) {
      selection.value = { chaletId, startDay: day, endDay: null }
      return
    }
  }
  selection.value = { chaletId, startDay: min, endDay: max }
}

function clearSelection() {
  selection.value = { chaletId: null, startDay: null, endDay: null }
  errorRange.value = { chaletId: null, startDay: null, endDay: null }
}

const selectionInfo = computed(() => {
  const s = selection.value
  if (!s.chaletId || s.startDay === null || s.endDay === null) return null
  const { month, year } = _resolveMonthYear()
  // check_in = first selected day; check_out = day AFTER the last selected day
  // (backend convention: check-out morning = checkout-day, not occupied).
  const startDate = new Date(year, month, s.startDay)
  const endDate = new Date(year, month, s.endDay + 1)
  return {
    chaletId: s.chaletId,
    startDate,
    endDate,
    nights: s.endDay - s.startDay + 1,
  }
})

// Label shown on the floating selection bar.
const selectedChaletName = computed(() => {
  const id = selection.value.chaletId
  if (!id) return ''
  const ch = chalets.value.find((c) => c.id === id)
  return ch?.name || ''
})

// Continue → navigate to the form page with the selection in the query string.
function continueBooking() {
  const info = selectionInfo.value
  if (!info) return
  router.push({
    name: 'admin-village-booking-form',
    query: {
      chalet_id: info.chaletId,
      check_in: toApiDate(info.startDate),
      check_out: toApiDate(info.endDate),
    },
  })
}

// ──────────────────────────────────────────────────────────────────────────
// Mount
// ──────────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [c, o, g] = await Promise.all([
    csBookings.listCompanies(),
    csBookings.listOwners(),
    csBookings.listGroups(),
  ])
  if (c.ok) companies.value = c.data
  if (o.ok) owners.value = o.data
  if (g.ok) groups.value = g.data
  await loadChalets()
})
</script>

<style scoped>
.booking-page { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb */
.page-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 0; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-current:hover { color: #0f172a; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

/* Page header (icon + title + desc) */
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

/* Calendar card (Gantt) — visual identical to OwnerDashboardView */
.bk-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  margin-bottom: 16px;
  overflow: hidden;
}

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

.bk-filters { display: flex; gap: 14px; flex-wrap: wrap; }
.bk-filter { display: flex; flex-direction: column; gap: 6px; min-width: 180px; }
.bk-filter-label { font-size: 11.5px; font-weight: 700; color: #64748b; }

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

.bk-loading, .bk-empty {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 40px 20px; color: #64748b; font-size: 13.5px;
}
.bk-empty i { font-size: 22px; color: #cbd5e1; }
.bk-loading i { color: #f97316; font-size: 16px; }

.bk-scroll { overflow-x: auto; padding-bottom: 6px; }
.bk-scroll::-webkit-scrollbar { height: 8px; }
.bk-scroll::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
.bk-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }

/* Pagination — placed under the calendar grid */
.bk-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  flex-wrap: wrap;
}
.bk-pagination-info { font-size: 12.5px; color: #64748b; font-weight: 600; }
.bk-pagination-controls { display: flex; align-items: center; gap: 4px; }
.bk-page-btn {
  min-width: 34px;
  height: 34px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.bk-page-btn:hover:not(:disabled):not(.active) { border-color: #fed7aa; color: #f97316; }
.bk-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.bk-page-btn.active {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.bk-page-btn.nav i { font-size: 12px; }
.bk-page-ellipsis { padding: 0 4px; color: #cbd5e1; font-weight: 700; }

.bk-grid {
  display: grid;
  grid-template-columns: 140px repeat(var(--days, 31), minmax(28px, 1fr));
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
.bk-day-header { flex-direction: column; gap: 1px; padding: 4px 2px; }
.bk-day-header.today { background: #fff7ed; color: #ea580c; box-shadow: inset 0 -2px 0 #f97316; }
.bk-weekday { font-size: 9px; color: #94a3b8; font-weight: 500; }
.bk-day-header.today .bk-weekday { color: #ea580c; }
.bk-daynum { font-size: 11.5px; font-weight: 700; }

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
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.bk-chalet-name:hover { background: #fff7ed; }
.bk-chalet-name:hover strong { color: #ea580c; }
.bk-chalet-name strong { font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.2; transition: color 0.15s; }
.bk-chalet-code { font-size: 9.5px; color: #94a3b8; font-weight: 600; letter-spacing: 0.02em; direction: ltr; }

.bk-day-cell { background: #fff; transition: background 0.15s, box-shadow 0.15s; }
.bk-day-cell.today { background: rgba(249, 115, 22, 0.04); }
.bk-day-cell.is-selectable { cursor: pointer; }
.bk-day-cell.is-selectable:hover {
  background: rgba(249, 115, 22, 0.08);
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.25);
}
/* Past day — visually muted, not clickable. */
.bk-day-cell.is-past {
  background: repeating-linear-gradient(45deg, #fafbfc, #fafbfc 4px, #f1f5f9 4px, #f1f5f9 8px);
  cursor: not-allowed;
  opacity: 0.55;
}
.bk-day-cell.is-selected {
  background: rgba(249, 115, 22, 0.18) !important;
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.35);
}
.bk-day-cell.is-sel-start,
.bk-day-cell.is-sel-end {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  box-shadow: 0 1px 4px rgba(249, 115, 22, 0.35);
}
.bk-day-cell.is-preview {
  background: rgba(249, 115, 22, 0.1) !important;
  box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.25);
}
.bk-day-cell.is-error {
  background: rgba(239, 68, 68, 0.18) !important;
  box-shadow: inset 0 0 0 1.5px #ef4444;
}
.bk-day-num-inline { font-size: 10.5px; font-weight: 700; color: #ea580c; line-height: 1; }
.bk-day-cell.is-sel-start .bk-day-num-inline,
.bk-day-cell.is-sel-end .bk-day-num-inline { color: #fff; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); }

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
  cursor: default;
  font-family: inherit;
  text-align: center;
  line-height: 1.15;
  overflow: hidden;
  min-width: 0;
}
.bk-bar-guest { font-size: 10.5px; font-weight: 700; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bk-bar-code { font-size: 9px; font-weight: 500; opacity: 0.85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.bk-bar.bar-c0 { background: #fce7f3; border-color: #f9a8d4; color: #9d174d; }
.bk-bar.bar-c1 { background: #dbeafe; border-color: #93c5fd; color: #1e40af; }
.bk-bar.bar-c2 { background: #dcfce7; border-color: #86efac; color: #166534; }
.bk-bar.bar-c3 { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
.bk-bar.bar-c4 { background: #ede9fe; border-color: #c4b5fd; color: #5b21b6; }
.bk-bar.is-partial { border-style: dashed; }

/* Header actions — always-visible "متابعة" + live selection summary */
.page-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.hdr-selection {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 10px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 191, 36, 0.07));
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-radius: 12px;
  min-width: 0;
}
.hdr-sel-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: #fff;
  color: #ea580c;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
.hdr-sel-icon i { font-size: 15px; }
.hdr-sel-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.hdr-sel-text strong {
  font-size: 13px; font-weight: 800; color: #0f172a;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;
}
.hdr-sel-meta {
  font-size: 11.5px; color: #64748b; font-weight: 600;
  display: flex; align-items: center; gap: 5px; white-space: nowrap;
}
.hdr-sel-meta i { font-size: 9px; color: #f97316; }
.hdr-dot { color: #cbd5e1; }
.hdr-clear {
  width: 26px; height: 26px;
  border-radius: 8px;
  border: none;
  background: rgba(15, 23, 42, 0.05);
  color: #64748b;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.hdr-clear:hover { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
.hdr-clear i { font-size: 11px; }

.hdr-continue {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.32);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}
.hdr-continue i { font-size: 12px; transition: transform 0.18s ease; }
.hdr-continue:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(249, 115, 22, 0.42);
}
.hdr-continue:hover:not(:disabled) i { transform: translateX(-4px); }
.hdr-continue:disabled {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  box-shadow: none;
}

/* Selection chip transition */
.hdr-sel-enter-active { transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
.hdr-sel-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.hdr-sel-enter-from, .hdr-sel-leave-to { opacity: 0; transform: translateX(16px) scale(0.95); }

@media (prefers-reduced-motion: reduce) {
  .hdr-continue, .hdr-continue i,
  .hdr-sel-enter-active, .hdr-sel-leave-active { transition: none; }
}

/* Legend (header) */
@media (max-width: 768px) {
  .bk-card-header { flex-direction: column; align-items: stretch; gap: 12px; padding: 12px; }
  .bk-filters { width: 100%; }
  .bk-filter { min-width: 0; }
  .bk-card-body { padding: 12px; }
  .bk-grid { font-size: 10.5px; }
  .bk-nav-title { font-size: 13.5px; }
  .bk-bar-guest { font-size: 9.5px; }
  .page-header { flex-wrap: wrap; }
  .page-header-actions { width: 100%; justify-content: space-between; }
  .hdr-selection { flex: 1; min-width: 0; }
  .hdr-sel-text strong { max-width: 140px; }
}
</style>
