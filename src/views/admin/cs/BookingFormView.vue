<template>
  <div class="form-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/admin/village-bookings/new" class="crumb">حجز جديد</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">إتمام الحجز</span>
    </nav>

    <div class="sticky-hero">
      <div class="hero-avatar"><i class="pi pi-calendar-plus" /></div>
      <div class="hero-id">
        <h1 class="hero-name">إتمام الحجز</h1>
        <p class="hero-created">راجع البيانات وأكد عملية الحجز</p>
      </div>
      <div class="page-header-actions">
        <button
          v-if="bookingInfo"
          class="btn-confirm"
          :disabled="!canSubmit || submitting"
          @click="submitBooking()"
        >
          <i v-if="submitting" class="pi pi-spin pi-spinner" />
          <i v-else class="pi pi-check" />
          تأكيد الحجز
        </button>
      </div>
    </div>

    <div v-if="missingParams" class="card error-card">
      <i class="pi pi-exclamation-triangle" />
      <p>بيانات الحجز غير مكتملة. عد للتقويم واختر شاليه ونطاق التاريخ.</p>
      <RouterLink to="/admin/village-bookings/new" class="btn-primary">العودة للتقويم</RouterLink>
    </div>

    <template v-else>
      <div v-if="infoLoading" class="loading-state">
        <i class="pi pi-spin pi-spinner" /> جاري جلب بيانات الحجز...
      </div>

      <div v-else-if="!bookingInfo" class="card error-card">
        <i class="pi pi-exclamation-circle" />
        <p>تعذر جلب بيانات الحجز</p>
        <RouterLink to="/admin/village-bookings/new" class="btn-primary">العودة للتقويم</RouterLink>
      </div>

      <div v-else class="bf-form">
        <div v-if="submitError" class="bf-submit-error">
          <i class="pi pi-exclamation-triangle" /> {{ submitError }}
        </div>

        <!-- Trip summary hero -->
        <section class="trip-hero">
          <div class="bf-section-head">
            <h4 class="bf-section-title"><i class="pi pi-home" /> الإقامة والشاليه</h4>
          </div>
          <div class="trip-hero-body">
            <div class="trip-hero-main">
              <div class="trip-hero-id">
                <h3 class="trip-hero-name">{{ bookingInfo.name || '—' }}</h3>
                <div class="trip-tags">
                  <span class="trip-tag trip-tag-new">
                    <i class="pi pi-sparkles" /> كود الحجز: جديد
                  </span>
                  <span class="trip-nights">
                    <i class="pi pi-moon" /> {{ bookingInfo.nights }} {{ bookingInfo.nights === 1 ? 'ليلة' : 'ليالٍ' }}
                  </span>
                  <span v-if="auth.user?.name" class="trip-tag">
                    <i class="pi pi-user-plus" /> بواسطة {{ auth.user.name }}
                  </span>
                  <span v-if="bookingInfo.village" class="trip-tag">
                    <i class="pi pi-map-marker" /> {{ bookingInfo.village }}
                  </span>
                  <span v-if="bookingInfo.chalet_number" class="trip-tag">
                    <i class="pi pi-hashtag" /> {{ bookingInfo.chalet_number }}
                  </span>
                  <span v-if="bookingInfo.floor" class="trip-tag">
                    <i class="pi pi-building" /> {{ bookingInfo.floor }}
                  </span>
                  <span v-if="bookingInfo.area" class="trip-tag">
                    <i class="pi pi-arrows-alt" /> {{ bookingInfo.area }}
                  </span>
                  <span v-if="bookingInfo.owner" class="trip-tag">
                    <i class="pi pi-user" /> {{ bookingInfo.owner }}
                  </span>
                  <span class="trip-tag">
                    <i class="pi pi-users" /> أقصى {{ maxGuestsTotal }} ضيف
                  </span>
                </div>
              </div>

              <div class="trip-dates">
                <div class="trip-date">
                  <span class="trip-date-label"><i class="pi pi-sign-in" /> الدخول</span>
                  <strong class="trip-date-value">{{ toDisplayDate(checkIn) }}</strong>
                </div>
                <div class="trip-date-mid">
                  <i class="pi pi-arrow-left trip-date-arrow" aria-hidden="true" />
                </div>
                <div class="trip-date">
                  <span class="trip-date-label"><i class="pi pi-sign-out" /> الخروج</span>
                  <strong class="trip-date-value">{{ toDisplayDate(checkOut) }}</strong>
                </div>
              </div>
            </div>

            <div class="trip-hero-total">
              <span class="trip-hero-total-label">الإجمالي</span>
              <span class="trip-hero-total-value">
                {{ fmtNum(financial.total) }}<small>ج.م</small>
              </span>
            </div>
          </div>
        </section>

        <!-- Guests card — always visible, add/delete from card header & rows -->
        <section class="bf-section">
          <div class="bf-section-head">
            <h4 class="bf-section-title">
              <i class="pi pi-users" /> الضيوف
              <span class="bf-counter" :class="{ over: guestRows.length > maxGuestsTotal }">
                {{ guestRows.length }} / {{ maxGuestsTotal }}
              </span>
            </h4>
            <button
              type="button"
              class="bf-add-btn"
              :disabled="guestRows.length >= maxGuestsTotal"
              @click="addGuest"
            >
              <i class="pi pi-plus" /> إضافة ضيف
            </button>
          </div>
          <p v-if="guestsError" class="bf-row-error"><i class="pi pi-exclamation-circle" /> {{ guestsError }}</p>
          <div class="bf-rows-list">
            <div v-for="(g, i) in guestRows" :key="`g${i}`" class="bf-input-row bf-input-row-guest">
              <input v-model="g.name" type="text" :placeholder="i === 0 ? 'الاسم * (الضيف الأساسي)' : 'الاسم *'" class="bf-row-input" />
              <input v-model="g.national_id" type="text" placeholder="الرقم القومي" class="bf-row-input ltr" />
              <input v-model="g.role" type="text" placeholder="الصفة" class="bf-row-input" />
              <input v-model="g.phone" type="text" placeholder="الهاتف" class="bf-row-input ltr" />
              <AppDropdown v-model="g.type" :options="GUEST_TYPE_OPTIONS" />
              <button
                type="button"
                class="bf-del-btn"
                :disabled="i === 0"
                :title="i === 0 ? 'لا يمكن حذف الضيف الأساسي' : 'حذف'"
                @click="removeGuest(i)"
              >
                <i class="pi pi-times" />
              </button>
            </div>
          </div>
        </section>

        <!-- Cars card — always visible, add/delete from card header & rows -->
        <section class="bf-section">
          <div class="bf-section-head">
            <h4 class="bf-section-title">
              <i class="pi pi-car" /> السيارات
              <span class="bf-counter">{{ carRows.length }}</span>
            </h4>
            <button type="button" class="bf-add-btn" @click="addCar">
              <i class="pi pi-plus" /> إضافة سيارة
            </button>
          </div>
          <div v-if="!carRows.length" class="bf-section-empty">
            لم تتم إضافة سيارات بعد
          </div>
          <div v-else class="bf-rows-list">
            <div v-for="(c, i) in carRows" :key="`c${i}`" class="bf-input-row bf-input-row-car">
              <input v-model="c.plate_number" type="text" placeholder="رقم اللوحة *" class="bf-row-input ltr" />
              <button type="button" class="bf-del-btn" title="حذف" @click="removeCar(i)">
                <i class="pi pi-times" />
              </button>
            </div>
          </div>
        </section>

        <!-- Summary row — cost breakdown + payment type side by side -->
        <div class="bf-summary-row">
          <!-- Cost breakdown -->
          <section class="cost-card">
            <div class="bf-section-head">
              <h4 class="bf-section-title"><i class="pi pi-calculator" /> تفاصيل التكلفة</h4>
            </div>
            <div class="cost-lines">
              <div class="cost-line">
                <span class="cost-label">
                  سعر الليالى
                  <span class="cost-sub">{{ fmtNum(bookingInfo.price) }} × {{ bookingInfo.nights }}</span>
                </span>
                <span class="cost-value">{{ fmtNum(financial.nightlyTotal) }} ج.م</span>
              </div>
              <div class="cost-line">
                <span class="cost-label">رسوم القرية</span>
                <span class="cost-value">{{ fmtNum(bookingInfo.total_village_fee) }} ج.م</span>
              </div>
              <div class="cost-line">
                <span class="cost-label">تصريح أمني</span>
                <span class="cost-value">{{ fmtNum(bookingInfo.security_permit_price) }} ج.م</span>
              </div>
              <div class="cost-line">
                <span class="cost-label">تصريح إلكتروني</span>
                <span class="cost-value">{{ fmtNum(bookingInfo.electronic_permit_price) }} ج.م</span>
              </div>
              <div class="cost-line">
                <span class="cost-label">
                  أفراد إضافيين
                  <span v-if="extraPeople" class="cost-sub">× {{ extraPeople }}</span>
                </span>
                <span class="cost-value">{{ fmtNum(financial.extraPersonTotal) }} ج.م</span>
              </div>
              <div class="cost-line">
                <span class="cost-label">
                  رسوم سيارة
                  <span v-if="carCount" class="cost-sub">× {{ carCount }}</span>
                </span>
                <span class="cost-value">{{ fmtNum(financial.carTotal) }} ج.م</span>
              </div>
              <div class="cost-line cost-line-total">
                <span class="cost-label">الإجمالي</span>
                <span class="cost-value">{{ fmtNum(financial.total) }} ج.م</span>
              </div>
            </div>
          </section>

          <!-- Payment type — optional; omit to let backend auto-pick (WITHDRAW_BALANCE
               if the company balance covers the total, otherwise 422 →
               INSUFFICIENT_BALANCE_SELECT_CASH_OR_BANK → modal). -->
          <section class="bf-section">
            <div class="bf-section-head">
              <h4 class="bf-section-title"><i class="pi pi-credit-card" /> طريقة الدفع</h4>
              <button
                v-if="selectedPaymentType"
                type="button"
                class="bf-add-btn"
                @click="selectedPaymentType = ''"
              >
                <i class="pi pi-refresh" /> تلقائي
              </button>
            </div>
            <p class="bf-payment-hint">
              <i class="pi pi-info-circle" />
              اتركها بدون اختيار للاختيار التلقائي حسب رصيد الشركة.
            </p>
            <div class="bf-pay-options">
              <button
                type="button"
                :class="['bf-pay-option', { active: selectedPaymentType === 'WITHDRAW_BALANCE' }]"
                @click="selectedPaymentType = 'WITHDRAW_BALANCE'"
              >
                <i class="pi pi-wallet" />
                <span class="bf-pay-label">خصم من الرصيد</span>
              </button>
              <button
                type="button"
                :class="['bf-pay-option', { active: selectedPaymentType === 'CASH' }]"
                @click="selectedPaymentType = 'CASH'"
              >
                <i class="pi pi-money-bill" />
                <span class="bf-pay-label">نقدي</span>
              </button>
              <button
                type="button"
                :class="['bf-pay-option', { active: selectedPaymentType === 'BANK' }]"
                @click="selectedPaymentType = 'BANK'"
              >
                <i class="pi pi-building" />
                <span class="bf-pay-label">تحويل بنكي</span>
              </button>
            </div>
          </section>
        </div>

      </div>
    </template>

    <!-- Payment choice modal -->
    <AppModal
      v-model="paymentModalOpen"
      title="اختر طريقة الدفع"
      subtitle="الرصيد غير كافٍ — اختر طريقة دفع بديلة"
      size="sm"
      icon="pi pi-credit-card"
      icon-color="#f97316"
      icon-bg="rgba(249,115,22,0.08)"
    >
      <div class="pay-choice">
        <button class="pay-btn" :disabled="submitting" @click="submitBooking('CASH')">
          <i class="pi pi-money-bill" />
          <span>نقدي</span>
        </button>
        <button class="pay-btn" :disabled="submitting" @click="submitBooking('BANK')">
          <i class="pi pi-building" />
          <span>تحويل بنكي</span>
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCsBookingsStore, REASON_CODES } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate } from '@/utils/date'
import AppModal from '@/components/ui/AppModal.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const GUEST_TYPE_OPTIONS = [
  { value: 'ADULT', label: 'بالغ' },
  { value: 'CHILD', label: 'طفل' },
]

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

// Query params drive everything on this page.
const chaletId = computed(() => String(route.query.chalet_id || ''))
const checkIn = computed(() => String(route.query.check_in || ''))
const checkOut = computed(() => String(route.query.check_out || ''))
const missingParams = computed(() => !chaletId.value || !checkIn.value || !checkOut.value)

const bookingInfo = ref(null)
const infoLoading = ref(true)
const submitting = ref(false)
const submitError = ref('')
const guestsError = ref('')
const paymentModalOpen = ref(false)

// Explicit payment type chosen by the user. Empty string = "auto" (don't send
// payment_type; backend picks WITHDRAW_BALANCE if possible, else 422).
const selectedPaymentType = ref('')

const guestRows = ref([{ name: '', national_id: '', role: '', phone: '', type: 'ADULT' }])
const carRows = ref([])

const maxGuestsTotal = computed(() => {
  if (!bookingInfo.value) return 0
  return Number(bookingInfo.value.max_guests || 0) + Number(bookingInfo.value.max_extra_guest || 0)
})

// Extra people = every guest beyond the main one (row 0).
const extraPeople = computed(() => Math.max(0, guestRows.value.length - 1))
const carCount = computed(() => carRows.value.length)

const financial = computed(() => {
  const info = bookingInfo.value
  if (!info) return { nightlyTotal: 0, extraPersonTotal: 0, carTotal: 0, total: 0 }
  const nights = Number(info.nights || 0)
  const price = Number(info.price || 0)
  const nightlyTotal = price * nights
  const extraPersonTotal = Number(info.additional_person_price || 0) * extraPeople.value * nights
  const firstCar = Number(info.first_car_price || 0)
  const addCar = Number(info.additional_car_price || firstCar)
  const carTotal = carCount.value === 0 ? 0 : firstCar + addCar * (carCount.value - 1)
  const securityPermit = Number(info.security_permit_price || 0)
  const electronicPermit = Number(info.electronic_permit_price || 0)
  const totalVillageFee = Number(info.total_village_fee || 0)
  const total = nightlyTotal + totalVillageFee + securityPermit + electronicPermit + extraPersonTotal + carTotal
  return { nightlyTotal, extraPersonTotal, carTotal, total }
})

function addGuest() {
  if (guestRows.value.length >= maxGuestsTotal.value) return
  guestRows.value.push({ name: '', national_id: '', role: '', phone: '', type: 'ADULT' })
}
function removeGuest(i) {
  if (i === 0) return // main guest is required
  guestRows.value.splice(i, 1)
}
function addCar() {
  carRows.value.push({ plate_number: '' })
}
function removeCar(i) {
  carRows.value.splice(i, 1)
}

const canSubmit = computed(() => {
  if (!bookingInfo.value) return false
  if (!guestRows.value.length) return false
  if (guestRows.value.some((g) => !g.name?.trim())) return false
  if (guestRows.value.length > maxGuestsTotal.value) return false
  if (carRows.value.some((c) => !c.plate_number?.trim())) return false
  return true
})

async function submitBooking(paymentType) {
  if (!bookingInfo.value) return

  submitError.value = ''
  guestsError.value = ''

  const payload = {
    chalet_id: chaletId.value,
    check_in: checkIn.value,
    check_out: checkOut.value,
    guests_data: guestRows.value.map((g) => ({
      name: g.name.trim(),
      national_id: g.national_id?.trim() || '',
      role: g.role?.trim() || '',
      phone: g.phone?.trim() || '',
      type: g.type || 'ADULT',
    })),
    cars_data: carRows.value
      .filter((c) => c.plate_number?.trim())
      .map((c) => ({ plate_number: c.plate_number.trim() })),
  }
  // Explicit arg (from the cash/bank modal) wins; otherwise fall back to
  // the user's pre-selected payment type from the form. Empty = auto.
  const finalPaymentType = paymentType || selectedPaymentType.value
  if (finalPaymentType) payload.payment_type = finalPaymentType

  submitting.value = true
  const r = await csBookings.createVillageBooking(payload)
  submitting.value = false

  if (r.ok) {
    paymentModalOpen.value = false
    toast.success('تم إنشاء الحجز بنجاح')
    router.push('/admin/village-bookings/new')
    return
  }

  if (r.needsPaymentChoice) {
    paymentModalOpen.value = true
    return
  }
  if (r.reason === REASON_CODES.CHALET_UNAVAILABLE) {
    submitError.value = r.error || 'الشاليه غير متاح في هذه التواريخ'
    return
  }
  if (r.reason === REASON_CODES.GUESTS_EXCEED_MAX) {
    guestsError.value = r.error || 'عدد الضيوف يتجاوز الحد المسموح'
    return
  }
  submitError.value = r.error
  toast.error(r.error)
}

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }

onMounted(async () => {
  if (missingParams.value) {
    infoLoading.value = false
    return
  }
  const r = await csBookings.getBookingInfo(chaletId.value, {
    check_in: checkIn.value,
    check_out: checkOut.value,
  })
  infoLoading.value = false
  if (r.ok) {
    bookingInfo.value = r.data
  } else {
    toast.error(r.error)
  }
})
</script>

<style scoped>
.form-page { display: flex; flex-direction: column; gap: 16px; padding-bottom: 40px; }

/* Sub-page breadcrumb */
.page-crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 13px;
  font-weight: 600;
}
.crumb {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.15s;
}
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-current:hover { color: #0f172a; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

/* Sticky hero bar — same compact frosted pattern as the booking detail page.
   Pins under the layout topbar (52px + 14px×2 padding ≈ 80px). */
.sticky-hero {
  position: sticky;
  top: 80px;
  z-index: 50;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.85);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid #e9eef3;
}
.hero-avatar {
  width: 38px; height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px -4px rgba(249, 115, 22, 0.55);
}
.hero-avatar i { font-size: 16px; }
.hero-id { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.hero-name { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
.hero-created { font-size: 11.5px; color: #94a3b8; font-weight: 600; margin: 0; }
.page-header-actions { display: flex; gap: 10px; flex-shrink: 0; }

.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; text-align: center; color: #b91c1c; }
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }

.loading-state { padding: 60px 20px; text-align: center; color: #64748b; font-size: 14px; }
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }

.bf-form { display: flex; flex-direction: column; gap: 16px; }

@media (max-width: 540px) {
  .sticky-hero { flex-wrap: wrap; }
  .page-header-actions { width: 100%; }
  .page-header-actions .btn-confirm { width: 100%; justify-content: center; }
}

.bf-submit-error {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  color: #b91c1c;
  font-size: 13px;
  font-weight: 600;
}

/* ───── Trip summary hero ───── */
.trip-hero {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 18px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}
.trip-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at top right, rgba(249, 115, 22, 0.08), transparent 60%);
  pointer-events: none;
}
.trip-hero-body {
  position: relative;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 24px;
  align-items: stretch;
}
.trip-hero-main { display: flex; flex-direction: column; gap: 16px; min-width: 0; position: relative; }
.trip-hero-id { display: flex; flex-direction: column; gap: 10px; min-width: 0; }
.trip-hero-name {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  line-height: 1.2;
}
.trip-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.trip-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 999px;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.trip-tag i { font-size: 11px; color: #94a3b8; }
.trip-tag-new {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(52, 211, 153, 0.14));
  border-color: rgba(16, 185, 129, 0.28);
  color: #059669;
  font-weight: 800;
}
.trip-tag-new i { color: #059669; }

.trip-dates {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fafbfc;
  border: 1px dashed #e2e8f0;
  border-radius: 14px;
}
.trip-date { display: flex; flex-direction: column; gap: 4px; }
.trip-date-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.trip-date-label i { font-size: 11px; }
.trip-date-value { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.trip-date-mid { display: flex; justify-content: center; align-items: center; }
.trip-date-arrow { font-size: 18px; color: #cbd5e1; }

/* Nights pill — sits inside the trip-tags row, brand-orange so it pops */
.trip-nights {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 999px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  font-size: 11.5px;
  font-weight: 800;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.35);
  white-space: nowrap;
  border: 1px solid #ea580c;
}
.trip-nights i { font-size: 11px; color: #fff; }

.trip-hero-total {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 160px;
  padding: 16px 22px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.10), rgba(251, 191, 36, 0.10));
  border: none;
  border-radius: 16px;
}
.trip-hero-total-label {
  font-size: 11.5px;
  color: #c2410c;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}
.trip-hero-total-value {
  font-size: 28px;
  font-weight: 900;
  color: #ea580c;
  line-height: 1;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.trip-hero-total-value small {
  font-size: 13px;
  font-weight: 700;
  color: #c2410c;
}

/* ───── Cost breakdown card ───── */
.cost-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.cost-card .bf-section-head { margin-bottom: 8px; }
.cost-lines { display: flex; flex-direction: column; }
.cost-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 4px;
  border-bottom: 1px dashed #f1f5f9;
  font-size: 13.5px;
}
.cost-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-weight: 600;
}
.cost-sub { font-size: 11.5px; color: #94a3b8; font-weight: 500; }
.cost-value { color: #0f172a; font-weight: 700; }
.cost-line-total {
  margin-top: 6px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 191, 36, 0.08));
  border: none;
  border-radius: 12px;
}
.cost-line-total .cost-label { color: #0f172a; font-weight: 800; font-size: 14px; }
.cost-line-total .cost-value { color: #ea580c; font-weight: 900; font-size: 16px; }

.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #f1f5f9;
}
.bf-section-title {
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 14.5px; font-weight: 800; color: #0f172a; margin: 0;
}
.bf-section-title i {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(251, 191, 36, 0.12));
  color: #ea580c;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
}
.bf-counter { margin-inline-start: 6px; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }
.bf-counter.over { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }

.bf-add-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #f97316;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.bf-add-btn:hover:not(:disabled) { background: rgba(249, 115, 22, 0.06); border-color: #fed7aa; }
.bf-add-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.bf-add-btn i { font-size: 11px; }

.bf-del-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid #fecaca;
  background: #fff;
  color: #ef4444;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  align-self: center;
  transition: all 0.15s;
}
.bf-del-btn:hover:not(:disabled) { background: #fef2f2; }
.bf-del-btn:disabled { opacity: 0.25; cursor: not-allowed; border-color: #e2e8f0; color: #94a3b8; }
.bf-del-btn i { font-size: 11px; }

.bf-section-empty {
  padding: 18px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  background: #fafbfc;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
}

/* Summary row — cost breakdown + payment type side by side, equal height */
.bf-summary-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 14px;
  align-items: stretch;
}
.bf-summary-row > section {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
/* Let the payment options fill remaining vertical space so the right card
   visually matches the taller cost-breakdown card on its left. */
.bf-summary-row .bf-pay-options { flex: 1; }
.bf-summary-row .bf-pay-option { flex: 1; }
/* Cost-card: keep the total pinned to the bottom by stretching the lines. */
.bf-summary-row .cost-lines { flex: 1; }

/* Payment type chooser */
.bf-payment-hint {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 0 12px;
  padding: 10px 12px;
  background: rgba(14, 165, 233, 0.06);
  border: 1px solid rgba(14, 165, 233, 0.18);
  border-radius: 10px;
  color: #0369a1;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.55;
}
.bf-payment-hint i { font-size: 13px; flex-shrink: 0; margin-top: 1px; }

.bf-pay-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bf-pay-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-family: inherit;
  cursor: pointer;
  text-align: right;
  transition: all 0.15s;
}
.bf-pay-option > i {
  font-size: 18px;
  color: #94a3b8;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
  transition: color 0.15s;
}
.bf-pay-option:hover {
  border-color: #fed7aa;
  background: rgba(249, 115, 22, 0.04);
}
.bf-pay-option:hover > i { color: #f97316; }
.bf-pay-option.active {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 191, 36, 0.08));
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.18);
}
.bf-pay-option.active > i { color: #ea580c; }
.bf-pay-label { font-size: 13.5px; font-weight: 800; color: #0f172a; }

@media (max-width: 900px) {
  .bf-summary-row { grid-template-columns: 1fr; }
}

.bf-row-error {
  display: flex; align-items: center; gap: 6px;
  margin: 0 0 8px;
  color: #b91c1c;
  font-size: 12px;
  font-weight: 600;
}

.bf-rows-list { display: flex; flex-direction: column; gap: 8px; }
.bf-input-row {
  display: grid;
  gap: 8px;
  align-items: center;
}
.bf-input-row-guest { grid-template-columns: 1.4fr 1fr 0.8fr 1fr 0.8fr 32px; }
.bf-input-row-car { grid-template-columns: 1fr 32px; }
.bf-row-input {
  padding: 9px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: #fff;
}
.bf-row-input:focus { outline: none; border-color: #f97316; }
.bf-row-input.ltr { direction: ltr; text-align: right; }

.btn-confirm {
  padding: 10px 24px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border: 1px solid #ea580c;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.35);
}
.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(249, 115, 22, 0.45); }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-confirm i { font-size: 12px; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff; font-size: 13.5px; font-weight: 700;
  text-decoration: none;
}
.btn-primary:hover { transform: translateY(-1px); }

.pay-choice { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.pay-btn {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 22px 16px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.pay-btn:hover:not(:disabled) { border-color: #f97316; color: #f97316; transform: translateY(-2px); }
.pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pay-btn i { font-size: 24px; }

@media (max-width: 720px) {
  .trip-hero-body { grid-template-columns: 1fr; }
  .trip-hero-total { width: 100%; min-width: 0; flex-direction: row; justify-content: space-between; gap: 12px; padding: 14px 18px; }
  .trip-hero-total-value { font-size: 22px; }
  .bf-input-row-guest { grid-template-columns: 1fr 1fr 32px; }
}
</style>
