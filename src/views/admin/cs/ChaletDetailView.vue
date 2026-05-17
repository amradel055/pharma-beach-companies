<template>
  <div class="detail-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/village-chalets" class="crumb">الشاليهات</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">
        {{ chalet?.name || 'تفاصيل الشاليه' }}
      </span>
    </nav>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" /> جاري التحميل...
    </div>

    <div v-else-if="!chalet" class="card error-card">
      <i class="pi pi-exclamation-triangle" />
      <p>الشاليه غير موجود</p>
      <RouterLink to="/village-chalets" class="btn-primary">العودة للقائمة</RouterLink>
    </div>

    <template v-else>
      <!-- Page header -->
      <div class="page-header">
        <div class="page-icon"><i class="pi pi-home" /></div>
        <div class="page-header-text">
          <h1 class="page-title">{{ chalet.name }}</h1>
          <p class="page-desc">
            <i class="pi pi-map-marker" />
            {{ chalet.village?.name || '—' }}
            <span class="page-desc-sep">·</span>
            <i class="pi pi-hashtag" />
            رقم {{ chalet.chalet_number || '—' }}
          </p>
        </div>
      </div>

      <!-- Two-column grid: main content (left) + sticky calendar (right) -->
      <div class="page-grid">
        <div class="page-main">

      <!-- Chalet hero card -->
      <section class="bf-section chalet-card">
        <div class="chalet-hero">
          <div class="chalet-avatar"><i class="pi pi-home" /></div>
          <div class="chalet-id">
            <h3 class="chalet-name">{{ chalet.name }}</h3>
            <div class="chalet-tags">
              <span class="chip neutral">
                <i class="pi pi-hashtag" /> رقم {{ chalet.chalet_number || '—' }}
              </span>
              <span :class="['chip', 'status', chalet.status?.toLowerCase()]">
                <i class="pi pi-circle-fill tiny" />
                {{ chaletStatusLabel(chalet.status) }}
              </span>
              <span v-if="chalet.village?.name" class="chip neutral">
                <i class="pi pi-map-marker" /> {{ chalet.village.name }}
              </span>
              <span v-if="chalet.owner?.name" class="chip neutral">
                <i class="pi pi-user" /> {{ chalet.owner.name }}
              </span>
              <span v-if="chalet.group?.name" class="chip neutral">
                <i class="pi pi-folder" /> {{ chalet.group.name }}
              </span>
              <span v-if="chalet.has_electronic_permit" class="chip ok">
                <i class="pi pi-shield" /> تصريح إلكتروني
              </span>
              <span class="chip pay cash">
                <i class="pi pi-money-bill" /> {{ fmt(chalet.price) }} ج.م / ليلة
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Media gallery -->
      <section v-if="hasMedia" class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-images" /> الصور
            <span class="bf-counter">{{ chalet.media.length }}</span>
          </h4>
        </div>
        <div class="gallery">
          <div v-for="m in chalet.media" :key="m.id" class="gallery-item">
            <img :src="m.url" :alt="chalet.name" loading="lazy" @error="onImgError" />
          </div>
        </div>
      </section>

      <!-- Two-column: specifications + pricing -->
      <div class="info-grid">
        <section class="bf-section">
          <div class="bf-section-head">
            <h4 class="bf-section-title"><i class="pi pi-info-circle" /> المواصفات</h4>
          </div>
          <div class="kv-row">
            <div class="kv">
              <span class="k">الكود</span>
              <span class="v ltr">{{ chalet.chalet_code || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الوحدة</span>
              <span class="v ltr">{{ chalet.unit_number || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الطابق</span>
              <span class="v">{{ chalet.floor?.label_ar || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الغرف</span>
              <span class="v">{{ chalet.rooms?.label_ar || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الحمامات</span>
              <span class="v">{{ chalet.bathrooms?.label_ar || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">المساحة</span>
              <span class="v">{{ chalet.area_range?.label_ar || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">التشطيب</span>
              <span class="v">{{ chalet.finishing?.name_ar || '—' }}</span>
            </div>
            <div class="kv">
              <span class="k">الإطلالة</span>
              <span class="v">{{ chalet.the_view?.label_ar || '—' }}</span>
            </div>
            <div v-if="chalet.chalet_tier" class="kv">
              <span class="k">الحد الأقصى للضيوف</span>
              <span class="v">{{ chalet.chalet_tier.max_guests }}</span>
            </div>
            <div v-if="chalet.chalet_tier" class="kv">
              <span class="k">ضيوف إضافيون</span>
              <span class="v">{{ chalet.chalet_tier.max_extra_guest }}</span>
            </div>
            <div v-if="chalet.ac_count != null" class="kv">
              <span class="k">عدد المكيفات</span>
              <span class="v">{{ chalet.ac_count }}</span>
            </div>
            <div class="kv">
              <span class="k">نوع الوحدة</span>
              <span class="v">{{ unitTypeLabel(chalet.unit_type) }}</span>
            </div>
          </div>

          <!-- Amenities (sub-section inside specifications) -->
          <div v-if="chalet.amenities?.length" class="sub-section">
            <h5 class="sub-section-title">
              <i class="pi pi-sparkles" /> الكماليات
              <span class="sub-counter">{{ chalet.amenities.length }}</span>
            </h5>
            <div class="amenities">
              <span v-for="a in chalet.amenities" :key="a.id" class="amenity-chip">
                <i :class="a.icon || 'pi pi-check'" />
                {{ a.name_ar || a.name_en }}
              </span>
            </div>
          </div>
        </section>

        <section class="bf-section">
          <div class="bf-section-head">
            <h4 class="bf-section-title"><i class="pi pi-tag" /> الأسعار</h4>
          </div>
          <div class="cost-lines">
            <div class="cost-line">
              <span class="cost-label">سعر الليلة</span>
              <span class="cost-value">{{ fmt(chalet.price) }} ج.م</span>
            </div>
            <div v-if="chalet.chalet_tier" class="cost-line">
              <span class="cost-label">رسوم القرية</span>
              <span class="cost-value">{{ fmt(chalet.chalet_tier.village_fee) }} ج.م</span>
            </div>
            <div v-if="chalet.settings" class="cost-line">
              <span class="cost-label">تصريح أمني</span>
              <span class="cost-value">{{ fmt(chalet.settings.security_permit_price) }} ج.م</span>
            </div>
            <div v-if="chalet.settings" class="cost-line">
              <span class="cost-label">تصريح إلكتروني</span>
              <span class="cost-value">{{ fmt(chalet.settings.electronic_permit_price) }} ج.م</span>
            </div>
            <div v-if="chalet.settings" class="cost-line">
              <span class="cost-label">السيارة الأولى</span>
              <span class="cost-value">{{ fmt(chalet.settings.first_car_price) }} ج.م</span>
            </div>
            <div v-if="chalet.settings" class="cost-line">
              <span class="cost-label">سيارة إضافية</span>
              <span class="cost-value">{{ fmt(chalet.settings.additional_car_price) }} ج.م</span>
            </div>
            <div v-if="chalet.settings" class="cost-line">
              <span class="cost-label">فرد إضافي</span>
              <span class="cost-value">{{ fmt(chalet.settings.additional_person_price) }} ج.م</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Bookings table card (left side) -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-list" /> الحجوزات في {{ monthLabel }}
            <span class="bf-counter">{{ bookings.length }}</span>
          </h4>
          <div class="bk-legend">
            <span class="legend-item"><span class="legend-dot pending" /> في الانتظار</span>
            <span class="legend-item"><span class="legend-dot confirmed" /> مؤكد</span>
            <span class="legend-item"><span class="legend-dot temporary" /> مؤقت</span>
            <span class="legend-item"><span class="legend-dot processing" /> قيد المعالجة</span>
            <span class="legend-item"><span class="legend-dot completed" /> مكتمل</span>
            <span class="legend-item"><span class="legend-dot cancelled" /> ملغي</span>
          </div>
        </div>

        <!-- Stats summary for the displayed month -->
        <div class="bk-stats">
          <div class="stat-tile total">
            <div class="stat-icon"><i class="pi pi-calendar-check" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ monthStats.total }}</span>
              <span class="stat-label">إجمالي الحجوزات</span>
            </div>
          </div>
          <div class="stat-tile confirmed">
            <div class="stat-icon"><i class="pi pi-check-circle" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ monthStats.confirmed }}</span>
              <span class="stat-label">مؤكدة</span>
            </div>
          </div>
          <div class="stat-tile pending">
            <div class="stat-icon"><i class="pi pi-clock" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ monthStats.pending }}</span>
              <span class="stat-label">في الانتظار</span>
            </div>
          </div>
          <div class="stat-tile occupancy">
            <div class="stat-icon"><i class="pi pi-percentage" /></div>
            <div class="stat-body">
              <span class="stat-num">{{ monthStats.occupancyPct }}%</span>
              <span class="stat-label">نسبة الإشغال</span>
            </div>
          </div>
        </div>

        <div v-if="bookingsLoading" class="bf-section-empty">
          <i class="pi pi-spin pi-spinner" /> جاري التحميل...
        </div>
        <div v-else-if="!bookings.length" class="bf-section-empty">
          لا توجد حجوزات في هذه الفترة
        </div>
        <table v-else class="list-table">
          <thead>
            <tr>
              <th></th>
              <th>الكود</th>
              <th>الحالة</th>
              <th>الدفع</th>
              <th>الدخول</th>
              <th>الخروج</th>
              <th>الليالي</th>
              <th>الضيوف</th>
              <th>السيارات</th>
              <th>الإجمالي</th>
              <th>المتبقي</th>
              <th>التصريح</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in bookings" :key="row.id">
              <tr class="row clickable" @click="toggleExpand(row.id)">
                <td><i :class="['pi', expanded[row.id] ? 'pi-chevron-down' : 'pi-chevron-left']" /></td>
                <td>
                  <RouterLink :to="`/village-bookings/${row.id}`" class="row-link" @click.stop>
                    {{ row.booking_code }}
                  </RouterLink>
                </td>
                <td>
                  <span :class="['chip', 'status', row.status?.toLowerCase()]">
                    <i class="pi pi-circle-fill tiny" /> {{ statusLabel(row.status) }}
                  </span>
                </td>
                <td>
                  <span v-if="row.payment_type" :class="['chip', 'pay', row.payment_type?.toLowerCase()]">
                    <i class="pi pi-credit-card" /> {{ paymentLabel(row.payment_type) }}
                  </span>
                  <span v-else class="dash">—</span>
                </td>
                <td>{{ toDisplayDate(row.check_in) }}</td>
                <td>{{ toDisplayDate(row.check_out) }}</td>
                <td>{{ row.nights }}</td>
                <td>
                  {{ row.guests?.length || 0 }}
                  <small v-if="row.extra_guest_count">(+{{ row.extra_guest_count }})</small>
                </td>
                <td>{{ row.cars_count }}</td>
                <td><strong>{{ fmt(row.total) }}</strong></td>
                <td>
                  <span :class="Number(row.remaining_amount) === 0 ? 'amount-done' : 'amount-due'">
                    {{ fmt(row.remaining_amount) }}
                  </span>
                </td>
                <td>
                  <span :class="['chip', 'permit', row.permit_exists ? 'ok' : 'warn']">
                    <i :class="row.permit_exists ? 'pi pi-shield' : 'pi pi-clock'" />
                  </span>
                </td>
              </tr>
              <tr v-if="expanded[row.id]" class="expand-row">
                <td colspan="12">
                  <div class="expand-grid">
                    <div class="expand-block">
                      <h6><i class="pi pi-users" /> الضيوف ({{ row.guests?.length || 0 }})</h6>
                      <ul v-if="row.guests?.length">
                        <li v-for="g in row.guests" :key="g.id">
                          <strong>{{ g.name }}</strong>
                          <small>· {{ g.role || '—' }} · {{ g.type === 'ADULT' ? 'بالغ' : 'طفل' }}</small>
                        </li>
                      </ul>
                      <p v-else class="dash">لا يوجد</p>
                    </div>
                    <div class="expand-block">
                      <h6><i class="pi pi-car" /> السيارات ({{ row.cars?.length || 0 }})</h6>
                      <ul v-if="row.cars?.length">
                        <li v-for="c in row.cars" :key="c.id" class="ltr">{{ c.plate_number }}</li>
                      </ul>
                      <p v-else class="dash">لا يوجد</p>
                    </div>
                    <div class="expand-block">
                      <h6><i class="pi pi-wallet" /> الدفعات ({{ row.payments?.length || 0 }})</h6>
                      <ul v-if="row.payments?.length">
                        <li v-for="(p, i) in row.payments" :key="i">
                          {{ fmt(p.amount) }} ج.م
                          <small>· {{ paymentLabel(p.method) }}</small>
                        </li>
                      </ul>
                      <p v-else class="dash">لا يوجد</p>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>

        </div><!-- /.page-main -->

        <!-- Right aside: sticky calendar -->
        <aside class="page-aside">
          <section class="bf-section bookings-card calendar-card">
            <div class="bf-section-head">
              <h4 class="bf-section-title">
                <i class="pi pi-calendar" /> التقويم
                <span class="bf-counter">{{ bookings.length }}</span>
              </h4>
            </div>

            <!-- Month nav (own row, full width inside the narrow card) -->
            <div class="bk-nav-row">
              <button class="bk-nav-btn" :disabled="bookingsLoading" @click="shiftMonth(-1)" aria-label="السابق">
                <i class="pi pi-angle-right" />
              </button>
              <span class="bk-nav-title">{{ monthLabel }}</span>
              <button class="bk-nav-btn" :disabled="bookingsLoading" @click="shiftMonth(1)" aria-label="التالي">
                <i class="pi pi-angle-left" />
              </button>
              <button
                v-if="!isCurrentMonth"
                class="bk-today-btn"
                :disabled="bookingsLoading"
                @click="jumpToToday"
              >اليوم</button>
            </div>

            <!-- Month grid (7 cols × 6 rows) -->
            <div class="bk-month" :class="{ 'is-loading': bookingsLoading }">
              <div class="bk-weekdays-row">
                <span v-for="w in WEEKDAYS" :key="w">{{ w }}</span>
              </div>
              <div class="bk-days-grid">
                <button
                  v-for="day in calendarGrid"
                  :key="day.key"
                  type="button"
                  class="bk-month-cell"
                  :class="{
                    'is-other-month': !day.inMonth,
                    'is-past': day.inMonth && day.isPast,
                    'is-today': day.isToday,
                    'is-booked': day.inMonth && !!day.booking,
                    'is-selectable': day.inMonth && !day.isPast && !day.booking && canCreateBooking,
                    'is-selected': day.inMonth && isInSelection(day.dayNum),
                    'is-sel-start': day.inMonth && isSelectionEdge(day.dayNum, 'start'),
                    'is-sel-end': day.inMonth && isSelectionEdge(day.dayNum, 'end'),
                    'is-preview': day.inMonth && isInPreview(day.dayNum),
                  }"
                  :data-status="day.booking?.status?.toLowerCase()"
                  :disabled="!day.inMonth"
                  :title="day.booking ? `${day.booking.booking_code} · ${statusLabel(day.booking.status)}` : ''"
                  @click="onMonthCellClick(day)"
                  @mouseenter="day.inMonth && onHoverDay(day.dayNum)"
                  @mouseleave="onLeaveDay"
                >
                  <span class="bk-month-num">{{ day.dayNum }}</span>
                  <span v-if="day.booking && day.inMonth" class="bk-month-dot" />
                </button>
              </div>
            </div>

            <!-- Always-visible selection panel — placeholder before pick, dates once a range is chosen -->
            <div class="sel-strip" :class="{ 'is-empty': !selectionInfo }">
              <div class="sel-strip-info">
                <div class="sel-strip-icon"><i class="pi pi-calendar-plus" /></div>
                <div class="sel-strip-text">
                  <strong class="sel-strip-title">تم اختيار التاريخ</strong>
                  <span v-if="selectionInfo" class="sel-strip-dates">
                    {{ toDisplayDate(selectionInfo.startDate) }}
                    <i class="pi pi-arrow-left" />
                    {{ toDisplayDate(selectionInfo.endDate) }}
                    <span class="sel-strip-dot">·</span>
                    <strong>{{ selectionInfo.nights }} {{ selectionInfo.nights === 1 ? 'ليلة' : 'ليالٍ' }}</strong>
                  </span>
                  <span v-else class="sel-strip-empty">
                    اختر تاريخ بداية ونهاية على التقويم
                  </span>
                </div>
              </div>
              <div v-if="selectionInfo" class="sel-strip-actions">
                <button class="btn-sel-cancel" @click="clearSelection">إلغاء</button>
                <button class="btn-sel-go" @click="continueBooking">
                  <i class="pi pi-arrow-left" /> متابعة الحجز
                </button>
              </div>
            </div>
          </section>
        </aside>
      </div><!-- /.page-grid -->
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { toDisplayDate, toApiDate } from '@/utils/date'

const route = useRoute()
const router = useRouter()
const csBookings = useCsBookingsStore()
const toast = useToastStore()
const { hasPermission } = usePermissions()

const loading = ref(true)
const bookingsLoading = ref(false)
const chalet = ref(null)
const bookings = ref([])
const expanded = reactive({})

// Calendar state — month being viewed
const calMonth = ref(new Date().getMonth())
const calYear = ref(new Date().getFullYear())

const dateRange = reactive({ date_from: '', date_to: '' })

const canCreateBooking = computed(() => hasPermission('manage_orders'))
const hasMedia = computed(() => Array.isArray(chalet.value?.media) && chalet.value.media.length > 0)

// Saturday-first weekday labels for the month grid header
const WEEKDAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']

const monthLabel = computed(() => {
  return new Date(calYear.value, calMonth.value, 1)
    .toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })
})

// Map of YYYY-MM-DD → first booking covering that day.
// Span: check_in (inclusive) .. check_out (exclusive).
const bookingByDay = computed(() => {
  const map = {}
  for (const b of bookings.value) {
    if (!b.check_in || !b.check_out) continue
    const start = new Date(b.check_in)
    const end = new Date(b.check_out)
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    while (cursor < end) {
      const k = toApiDate(cursor)
      if (!map[k]) map[k] = b
      cursor.setDate(cursor.getDate() + 1)
    }
  }
  return map
})

// 42-cell month grid (6 weeks × 7 days) starting on Saturday.
const calendarGrid = computed(() => {
  const year = calYear.value
  const month = calMonth.value
  const firstOfMonth = new Date(year, month, 1)
  // Convert Sunday-first (Sun=0..Sat=6) to Saturday-first (Sat=0, Sun=1, ..., Fri=6)
  const startOffset = (firstOfMonth.getDay() + 1) % 7
  const gridStart = new Date(year, month, 1 - startOffset)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i)
    d.setHours(0, 0, 0, 0)
    const key = toApiDate(d)
    days.push({
      key,
      dayNum: d.getDate(),
      date: d,
      inMonth: d.getMonth() === month && d.getFullYear() === year,
      isToday: d.getTime() === today.getTime(),
      isPast: d.getTime() < today.getTime(),
      booking: bookingByDay.value[key] || null,
    })
  }
  return days
})

function shiftMonth(delta) {
  if (bookingsLoading.value) return
  const next = new Date(calYear.value, calMonth.value + delta, 1)
  calMonth.value = next.getMonth()
  calYear.value = next.getFullYear()
  clearSelection()
  const first = new Date(calYear.value, calMonth.value, 1)
  const last = new Date(calYear.value, calMonth.value + 1, 0)
  dateRange.date_from = toApiDate(first)
  dateRange.date_to = toApiDate(last)
  reloadBookings()
}

const isCurrentMonth = computed(() => {
  const now = new Date()
  return calMonth.value === now.getMonth() && calYear.value === now.getFullYear()
})

function jumpToToday() {
  if (bookingsLoading.value || isCurrentMonth.value) return
  const now = new Date()
  shiftMonth((now.getFullYear() - calYear.value) * 12 + (now.getMonth() - calMonth.value))
}

function jumpToBooking(b) {
  if (!b?.id) return
  router.push({ name: 'admin-village-booking-details', params: { id: b.id } })
}

// Month-grid cell click handler: booked → open booking; free → range selection.
function onMonthCellClick(day) {
  if (!day.inMonth) return
  if (day.booking) {
    jumpToBooking(day.booking)
    return
  }
  clickDay(day.dayNum)
}

// ──────────────────────────────────────────────────────────────────────────
// Range selection — two-click pick within the displayed month
// ──────────────────────────────────────────────────────────────────────────
const OCCUPIED_STATUSES = new Set(['CONFIRMED', 'PENDING', 'PROCESSING', 'TEMPORARY'])

// Set of day-of-month numbers that are occupied (in the visible month).
const bookedDayMap = computed(() => {
  const year = calYear.value
  const month = calMonth.value
  const monthStart = new Date(year, month, 1); monthStart.setHours(0, 0, 0, 0)
  const monthEnd = new Date(year, month + 1, 0); monthEnd.setHours(0, 0, 0, 0)
  const set = new Set()
  for (const b of bookings.value) {
    if (!OCCUPIED_STATUSES.has(b.status)) continue
    if (!b.check_in || !b.check_out) continue
    const bStart = new Date(b.check_in); bStart.setHours(0, 0, 0, 0)
    const bEnd = new Date(b.check_out); bEnd.setHours(0, 0, 0, 0)
    const lastOccupied = new Date(bEnd); lastOccupied.setDate(lastOccupied.getDate() - 1)
    let cur = new Date(Math.max(bStart, monthStart))
    const stopAt = new Date(Math.min(lastOccupied, monthEnd))
    while (cur <= stopAt) {
      set.add(cur.getDate())
      cur = new Date(cur); cur.setDate(cur.getDate() + 1)
    }
  }
  return set
})

function isBookedDay(day) { return bookedDayMap.value.has(day) }

function isPastDay(day) {
  const cell = new Date(calYear.value, calMonth.value, day); cell.setHours(0, 0, 0, 0)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return cell.getTime() < today.getTime()
}

function isSelectable(day) {
  return !isBookedDay(day) && !isPastDay(day)
}

// Selection state
const selection = ref({ startDay: null, endDay: null })
const hoveredDay = ref(null)

function isInSelection(day) {
  const s = selection.value
  if (s.startDay === null) return false
  const min = s.endDay !== null ? Math.min(s.startDay, s.endDay) : s.startDay
  const max = s.endDay !== null ? Math.max(s.startDay, s.endDay) : s.startDay
  return day >= min && day <= max
}

function isSelectionEdge(day, edge) {
  const s = selection.value
  if (s.startDay === null) return false
  const min = s.endDay !== null ? Math.min(s.startDay, s.endDay) : s.startDay
  const max = s.endDay !== null ? Math.max(s.startDay, s.endDay) : s.startDay
  return edge === 'start' ? day === min : day === max
}

function onHoverDay(day) { hoveredDay.value = day }
function onLeaveDay() { hoveredDay.value = null }

function isInPreview(day) {
  const s = selection.value
  if (s.startDay === null || s.endDay !== null) return false
  if (hoveredDay.value === null) return false
  const min = Math.min(s.startDay, hoveredDay.value)
  const max = Math.max(s.startDay, hoveredDay.value)
  for (let d = min; d <= max; d++) {
    if (!isSelectable(d)) return false
  }
  return day >= min && day <= max
}

function showDayNumber(day) {
  return isInSelection(day) || isInPreview(day)
}

function clickDay(day) {
  if (!canCreateBooking.value) return
  if (!isSelectable(day)) return

  const s = selection.value
  if (s.startDay === null || s.endDay !== null) {
    selection.value = { startDay: day, endDay: null }
    return
  }
  const min = Math.min(s.startDay, day)
  const max = Math.max(s.startDay, day)
  for (let d = min; d <= max; d++) {
    if (!isSelectable(d)) {
      selection.value = { startDay: day, endDay: null }
      return
    }
  }
  selection.value = { startDay: min, endDay: max }
}

function clearSelection() {
  selection.value = { startDay: null, endDay: null }
  hoveredDay.value = null
}

const selectionInfo = computed(() => {
  const s = selection.value
  if (s.startDay === null || s.endDay === null) return null
  const startDate = new Date(calYear.value, calMonth.value, s.startDay)
  // check_out = day AFTER the last selected day (backend convention)
  const endDate = new Date(calYear.value, calMonth.value, s.endDay + 1)
  return {
    startDate,
    endDate,
    nights: s.endDay - s.startDay + 1,
  }
})

function continueBooking() {
  const info = selectionInfo.value
  if (!info) return
  router.push({
    name: 'admin-village-booking-form',
    query: {
      chalet_id: route.params.id,
      check_in: toApiDate(info.startDate),
      check_out: toApiDate(info.endDate),
    },
  })
}

// ──────────────────────────────────────────────────────────────────────────
// Month stats for the summary tiles
// ──────────────────────────────────────────────────────────────────────────
const monthStats = computed(() => {
  const list = bookings.value
  const total = list.length
  const confirmed = list.filter((b) => b.status === 'CONFIRMED').length
  const pending = list.filter((b) => b.status === 'PENDING').length
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const occupiedDays = bookedDayMap.value.size
  const occupancyPct = daysInMonth ? Math.round((occupiedDays / daysInMonth) * 100) : 0
  return { total, confirmed, pending, occupancyPct }
})

function currentMonthDates() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return { date_from: toApiDate(first), date_to: toApiDate(last) }
}

async function load() {
  loading.value = true
  const r = await csBookings.getChaletBookings(route.params.id, dateRange)
  loading.value = false
  if (r.ok) {
    chalet.value = r.data?.chalet || null
    bookings.value = r.data?.bookings || []
  } else {
    toast.error(r.error)
  }
}

async function reloadBookings() {
  bookingsLoading.value = true
  const r = await csBookings.getChaletBookings(route.params.id, dateRange)
  bookingsLoading.value = false
  if (r.ok) bookings.value = r.data?.bookings || []
  else toast.error(r.error)
}

function toggleExpand(id) { expanded[id] = !expanded[id] }

function onImgError(e) {
  e.target.style.display = 'none'
}

function statusLabel(s) {
  return {
    PENDING: 'في الانتظار',
    PROCESSING: 'قيد المعالجة',
    TEMPORARY: 'مؤقت',
    CONFIRMED: 'مؤكد',
    EXPIRED: 'منتهي',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
  }[s] || s || '—'
}

function chaletStatusLabel(s) {
  return {
    AVAILABLE: 'متاح',
    UNAVAILABLE: 'غير متاح',
    SOLD: 'مباع',
    RESERVED: 'محجوز',
  }[s] || s || '—'
}

function unitTypeLabel(t) {
  return { SELL: 'للبيع', RENT: 'للإيجار' }[t] || t || '—'
}

function paymentLabel(p) {
  return {
    CASH: 'نقدي',
    BANK: 'تحويل بنكي',
    WITHDRAW_BALANCE: 'خصم من الرصيد',
  }[p] || p || '—'
}

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

onMounted(() => {
  Object.assign(dateRange, currentMonthDates())
  load()
})
</script>

<style scoped>
.detail-page { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb */
.page-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-current:hover { color: #0f172a; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

/* Page header */
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
.page-desc {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  font-size: 13.5px; color: #94a3b8; margin: 0;
}
.page-desc i { font-size: 12px; color: #cbd5e1; }
.page-desc-sep { color: #cbd5e1; }
.page-header-actions { display: flex; gap: 10px; flex-shrink: 0; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
  transition: all 0.15s;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }
.btn-primary.btn-sm {
  padding: 7px 14px;
  font-size: 12.5px;
  border-radius: 9px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.btn-primary.btn-sm i { font-size: 11px; }
.btn-primary.btn-block {
  display: flex;
  width: 100%;
  justify-content: center;
  padding: 12px 18px;
  font-size: 14px;
}

/* Two-column page layout in RTL:
   - col 1 (right side, 1fr)   → .page-main (scrolling content)
   - col 2 (left side, 380px)  → .page-aside (sticky calendar, vertically centered)
   Explicit grid-column placement so DOM order doesn't matter. */
.page-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 16px;
  align-items: start;
}
.page-main { grid-column: 1; display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.page-aside {
  grid-column: 2;
  position: sticky;
  /* Anchored just below the navbar so it tracks the page as you scroll
     instead of floating in the viewport center. */
  top: 80px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}
.page-aside::-webkit-scrollbar { width: 6px; }
.page-aside::-webkit-scrollbar-track { background: transparent; }
.page-aside::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.25); border-radius: 4px; }
.page-aside .calendar-card { padding: 16px; }
@media (max-width: 1180px) {
  .page-grid { grid-template-columns: 1fr; }
  .page-main, .page-aside { grid-column: auto; }
  .page-aside { position: static; transform: none; max-height: none; overflow: visible; }
}

/* Sections (shared) */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px; gap: 10px; flex-wrap: wrap;
}
.bf-section-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 800; color: #0f172a; margin: 0;
}
.bf-section-title i { color: #f97316; }
.bf-counter {
  margin-inline-start: 6px;
  padding: 3px 10px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}
.bf-section-empty {
  padding: 22px; text-align: center; color: #94a3b8; font-size: 13px;
  background: #fafbfc; border: 1px dashed #e2e8f0; border-radius: 10px;
}
.bf-section-empty i { color: #f97316; margin-left: 6px; }

/* Chalet hero */
.chalet-card { position: relative; overflow: hidden; }
.chalet-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.06), transparent 55%);
  pointer-events: none;
}
.chalet-hero { position: relative; display: flex; align-items: center; gap: 16px; padding: 4px 0; }
.chalet-avatar {
  width: 56px; height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.14), rgba(251, 191, 36, 0.14));
  color: #ea580c;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(249, 115, 22, 0.18);
}
.chalet-avatar i { font-size: 22px; }
.chalet-id { display: flex; flex-direction: column; gap: 10px; min-width: 0; flex: 1; }
.chalet-name { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
.chalet-tags { display: flex; flex-wrap: wrap; gap: 6px; }

/* Unified chip system */
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px; font-weight: 700;
  border: 1px solid transparent;
  white-space: nowrap;
}
.chip i { font-size: 10.5px; }
.chip i.tiny { font-size: 7px; }

.chip.neutral { background: #f8fafc; border-color: #f1f5f9; color: #475569; }
.chip.neutral i { color: #94a3b8; }
.chip.ok { background: rgba(16, 185, 129, 0.10); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.warn { background: rgba(234, 179, 8, 0.10); color: #b45309; border-color: rgba(234, 179, 8, 0.22); }

.chip.status.pending { background: rgba(234, 179, 8, 0.12); color: #b45309; border-color: rgba(234, 179, 8, 0.22); }
.chip.status.processing { background: rgba(14, 165, 233, 0.12); color: #0369a1; border-color: rgba(14, 165, 233, 0.22); }
.chip.status.temporary { background: rgba(249, 115, 22, 0.12); color: #c2410c; border-color: rgba(249, 115, 22, 0.22); }
.chip.status.confirmed,
.chip.status.available { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.status.expired,
.chip.status.cancelled,
.chip.status.unavailable { background: rgba(239, 68, 68, 0.10); color: #b91c1c; border-color: rgba(239, 68, 68, 0.22); }
.chip.status.completed,
.chip.status.sold { background: rgba(100, 116, 139, 0.12); color: #475569; border-color: rgba(100, 116, 139, 0.22); }
.chip.status.reserved { background: rgba(249, 115, 22, 0.12); color: #c2410c; border-color: rgba(249, 115, 22, 0.22); }

.chip.pay.cash { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.pay.bank { background: rgba(14, 165, 233, 0.12); color: #0369a1; border-color: rgba(14, 165, 233, 0.22); }
.chip.pay.withdraw_balance { background: rgba(139, 92, 246, 0.12); color: #6d28d9; border-color: rgba(139, 92, 246, 0.22); }

.chip.permit.ok { background: rgba(16, 185, 129, 0.10); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.permit.warn { background: rgba(234, 179, 8, 0.10); color: #b45309; border-color: rgba(234, 179, 8, 0.22); }

/* Gallery */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
}
.gallery-item {
  aspect-ratio: 4 / 3;
  border-radius: 12px;
  overflow: hidden;
  background: #f1f5f9;
  border: 1px solid #f1f5f9;
}
.gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* Bookings card (calendar + table merged) */
.bookings-card { display: flex; flex-direction: column; gap: 14px; }

/* Month nav (own row inside the calendar card) */
.bk-nav-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  margin-bottom: 12px;
}
.bk-nav { display: inline-flex; align-items: center; gap: 8px; }
.bk-nav-btn {
  width: 30px; height: 30px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: inline-flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}
.bk-nav-btn:hover:not(:disabled) { border-color: #f97316; color: #f97316; }
.bk-nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.bk-nav-btn i { font-size: 12px; }
.bk-nav-title {
  font-size: 13.5px; font-weight: 800; color: #0f172a;
  min-width: 130px; text-align: center;
}
.bk-today-btn {
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #fed7aa;
  background: rgba(249, 115, 22, 0.08);
  color: #c2410c;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
}
.bk-today-btn:hover:not(:disabled) { background: rgba(249, 115, 22, 0.15); border-color: #f97316; }
.bk-today-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Stats tiles — 2×2 grid inside the narrow sticky panel */
.bk-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 14px;
}
.stat-tile {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid;
  background: #fff;
}
.stat-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon i { font-size: 16px; }
.stat-body { display: flex; flex-direction: column; gap: 0; min-width: 0; }
.stat-num { font-size: 20px; font-weight: 900; color: #0f172a; line-height: 1.1; }
.stat-label { font-size: 11.5px; font-weight: 700; color: #64748b; }

.stat-tile.total { border-color: rgba(249, 115, 22, 0.22); background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 191, 36, 0.06)); }
.stat-tile.total .stat-icon { background: rgba(249, 115, 22, 0.15); color: #ea580c; }
.stat-tile.total .stat-num { color: #ea580c; }

.stat-tile.confirmed { border-color: rgba(16, 185, 129, 0.22); background: linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(52, 211, 153, 0.06)); }
.stat-tile.confirmed .stat-icon { background: rgba(16, 185, 129, 0.15); color: #047857; }
.stat-tile.confirmed .stat-num { color: #047857; }

.stat-tile.pending { border-color: rgba(234, 179, 8, 0.22); background: linear-gradient(135deg, rgba(234, 179, 8, 0.06), rgba(250, 204, 21, 0.06)); }
.stat-tile.pending .stat-icon { background: rgba(234, 179, 8, 0.15); color: #b45309; }
.stat-tile.pending .stat-num { color: #b45309; }

.stat-tile.occupancy { border-color: rgba(14, 165, 233, 0.22); background: linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(56, 189, 248, 0.06)); }
.stat-tile.occupancy .stat-icon { background: rgba(14, 165, 233, 0.15); color: #0369a1; }
.stat-tile.occupancy .stat-num { color: #0369a1; }

@media (max-width: 900px) {
  .bk-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Helper tip */
.bk-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 10px;
  background: rgba(14, 165, 233, 0.06);
  border: 1px dashed rgba(14, 165, 233, 0.30);
  color: #0369a1;
  font-size: 12.5px;
  font-weight: 600;
}
.bk-tip i { font-size: 13px; }

/* Month grid (7 cols × 6 rows, like a phone date picker) */
.bk-month {
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: opacity 0.15s;
}
.bk-month.is-loading { opacity: 0.5; pointer-events: none; }

.bk-weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}
.bk-weekdays-row span {
  text-align: center;
  padding: 6px 2px;
  font-size: 10.5px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.bk-days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.bk-month-cell {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  cursor: default;
  transition: all 0.15s;
  overflow: hidden;
}
.bk-month-num { position: relative; z-index: 2; line-height: 1; }
.bk-month-dot {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px; height: 5px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.65;
  z-index: 2;
}

.bk-month-cell.is-other-month {
  color: #cbd5e1;
  background: transparent;
  border-color: transparent;
}
.bk-month-cell.is-past {
  background: repeating-linear-gradient(45deg, #fafbfc, #fafbfc 4px, #f1f5f9 4px, #f1f5f9 8px);
  cursor: not-allowed;
  opacity: 0.55;
}
.bk-month-cell.is-today {
  border-color: #f97316;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.18);
}
.bk-month-cell.is-selectable { cursor: pointer; }
.bk-month-cell.is-selectable:hover {
  background: rgba(249, 115, 22, 0.10);
  border-color: rgba(249, 115, 22, 0.30);
}
.bk-month-cell.is-booked { cursor: pointer; }
.bk-month-cell.is-booked:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.10);
}

/* Booked day — single distinct slate color so it stays visually different from
   the orange selection. Status detail lives on the bookings table chips. */
.bk-month-cell.is-booked {
  background: rgba(100, 116, 139, 0.18);
  border-color: rgba(100, 116, 139, 0.42);
  color: #334155;
}
.bk-month-cell.is-booked .bk-month-dot { background: #475569; }

/* Selection states override booked colors */
.bk-month-cell.is-selected {
  background: rgba(249, 115, 22, 0.20) !important;
  border-color: rgba(249, 115, 22, 0.45) !important;
  color: #c2410c !important;
}
.bk-month-cell.is-sel-start,
.bk-month-cell.is-sel-end {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  border-color: #ea580c !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.40);
  z-index: 3;
}
.bk-month-cell.is-preview {
  background: rgba(249, 115, 22, 0.10) !important;
  border-color: rgba(249, 115, 22, 0.28) !important;
}

/* Selection strip (appears below the calendar when a range is picked) */
.sel-strip {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), rgba(251, 191, 36, 0.06));
  border: 1px solid rgba(249, 115, 22, 0.28);
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.10);
}
.sel-strip-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
.sel-strip-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.sel-strip-icon i { font-size: 16px; }
.sel-strip-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.sel-strip-title { font-size: 12.5px; font-weight: 800; color: #c2410c; text-transform: uppercase; letter-spacing: 0.4px; }
.sel-strip-dates {
  display: inline-flex; align-items: center; flex-wrap: wrap; gap: 6px;
  font-size: 13.5px; color: #0f172a; font-weight: 700;
}
.sel-strip-dates i { font-size: 11px; color: #94a3b8; }
.sel-strip-dates strong { color: #ea580c; font-weight: 800; }
.sel-strip-dot { color: #cbd5e1; }
.sel-strip-empty { font-size: 12.5px; color: #94a3b8; font-weight: 600; }

/* Empty state — muted colors so the panel doesn't shout when nothing is picked */
.sel-strip.is-empty {
  background: #fafbfc;
  border-color: #f1f5f9;
  box-shadow: none;
}
.sel-strip.is-empty .sel-strip-icon {
  background: #f1f5f9;
  color: #94a3b8;
  box-shadow: none;
}
.sel-strip.is-empty .sel-strip-title { color: #64748b; }
.sel-strip-actions { display: flex; gap: 8px; justify-content: flex-end; }
.sel-strip-actions .btn-sel-go { flex: 1; justify-content: center; }
.btn-sel-cancel {
  padding: 9px 16px;
  border-radius: 9px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-sel-cancel:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
.btn-sel-go {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 9px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
  transition: all 0.15s;
}
.btn-sel-go:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }
.btn-sel-go i { font-size: 11px; }

.sel-strip-enter-active, .sel-strip-leave-active {
  transition: opacity 0.25s, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.sel-strip-enter-from, .sel-strip-leave-to { opacity: 0; transform: translateY(-8px); }

/* Legend */
.bk-legend {
  display: flex; flex-wrap: wrap; gap: 10px 16px;
  padding: 0 4px;
}
.legend-item {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 11.5px; font-weight: 700; color: #64748b;
}
.legend-dot { width: 12px; height: 12px; border-radius: 4px; border: 1px solid; }
.legend-dot.pending { background: rgba(234, 179, 8, 0.30); border-color: rgba(234, 179, 8, 0.55); }
.legend-dot.processing { background: rgba(14, 165, 233, 0.30); border-color: rgba(14, 165, 233, 0.55); }
.legend-dot.temporary { background: rgba(249, 115, 22, 0.30); border-color: rgba(249, 115, 22, 0.55); }
.legend-dot.confirmed { background: rgba(16, 185, 129, 0.30); border-color: rgba(16, 185, 129, 0.55); }
.legend-dot.completed { background: rgba(100, 116, 139, 0.30); border-color: rgba(100, 116, 139, 0.55); }
.legend-dot.cancelled { background: rgba(239, 68, 68, 0.30); border-color: rgba(239, 68, 68, 0.55); }

/* Sub-title row above the table */
.sub-title-row {
  padding: 8px 0 0;
  border-top: 1px dashed #f1f5f9;
}
.sub-title {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 800;
  color: #475569;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.sub-title i { font-size: 11px; color: #f97316; }

/* Info grid: two columns on wide screens */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  align-items: stretch;
}
.info-grid > .bf-section { display: flex; flex-direction: column; }
/* Two-up only when the content column has room (very wide screens). */
@media (min-width: 1500px) {
  .info-grid { grid-template-columns: 1.4fr 1fr; }
}

.kv-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 10px;
}
.kv {
  display: flex; flex-direction: column; gap: 4px;
  padding: 10px 12px;
  background: #fafbfc;
  border-radius: 10px;
}
.k { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.v { font-size: 13.5px; color: #0f172a; font-weight: 700; }
.v.ltr { direction: ltr; text-align: right; }

/* Pricing lines (matches OrderDetailsView cost-card) */
.cost-lines { display: flex; flex-direction: column; }
.cost-line {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px;
  padding: 11px 4px;
  border-bottom: 1px dashed #f1f5f9;
  font-size: 13.5px;
}
.cost-line:last-child { border-bottom: none; }
.cost-label { display: inline-flex; align-items: center; gap: 8px; color: #475569; font-weight: 600; }
.cost-value { color: #0f172a; font-weight: 800; }

/* Sub-section inside a card (e.g. amenities inside specifications) */
.sub-section {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px dashed #f1f5f9;
}
.sub-section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  font-size: 12.5px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.sub-section-title i { color: #f97316; font-size: 12px; }
.sub-counter {
  margin-inline-start: 4px;
  padding: 2px 9px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10.5px;
  font-weight: 700;
}

/* Amenities chips */
.amenities { display: flex; flex-wrap: wrap; gap: 8px; }
.amenity-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 13px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.22);
  color: #c2410c;
  font-size: 12.5px; font-weight: 700;
}
.amenity-chip i { font-size: 11px; }

/* Bookings table */
.list-table { width: 100%; border-collapse: collapse; }
.list-table th {
  padding: 10px 12px; text-align: right;
  font-size: 11.5px; font-weight: 700; color: #64748b;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.list-table td {
  padding: 11px 12px; font-size: 13px;
  color: #475569; border-bottom: 1px solid #f8fafc;
}
.row.clickable { cursor: pointer; }
.row:hover { background: #fafbfc; }
.row-link {
  color: #0f172a; font-weight: 800; text-decoration: none;
  direction: ltr; display: inline-block;
}
.row-link:hover { color: #f97316; }
.ltr { direction: ltr; text-align: right; }
.dash { color: #cbd5e1; font-weight: 700; }
.amount-done { color: #047857; font-weight: 800; }
.amount-due { color: #b91c1c; font-weight: 700; }

.expand-row td { background: #fafbfc; padding: 16px; }
.expand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 18px;
}
.expand-block h6 {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 800; color: #0f172a;
  margin: 0 0 8px;
}
.expand-block h6 i { color: #f97316; font-size: 11px; }
.expand-block ul {
  margin: 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 4px;
}
.expand-block li { font-size: 12.5px; color: #475569; }
.expand-block small { color: #94a3b8; }

.loading-state {
  padding: 60px 20px; text-align: center;
  color: #64748b; font-size: 14px;
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
}
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }

.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 40px 20px; text-align: center; color: #b91c1c;
}
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }
</style>
