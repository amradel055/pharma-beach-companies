<template>
  <div class="detail-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/admin/village-bookings" class="crumb">الحجوزات</RouterLink>
      <i class="pi pi-angle-left crumb-sep" />
      <span class="crumb crumb-current" aria-current="page">
        {{ booking?.booking_code || 'تفاصيل الحجز' }}
      </span>
    </nav>

    <div v-if="loading" class="loading-state">
      <i class="pi pi-spin pi-spinner" /> جاري التحميل...
    </div>

    <div v-else-if="!booking" class="card error-card">
      <i class="pi pi-exclamation-triangle" />
      <p>الحجز غير موجود</p>
      <RouterLink to="/admin/village-bookings" class="btn-primary">العودة للقائمة</RouterLink>
    </div>

    <template v-else>
      <!-- Sticky hero bar — compact, not a data card -->
      <section class="sticky-hero">
        <div class="hero-avatar"><i class="pi pi-home" /></div>
        <div class="hero-id">
          <div class="hero-title-row">
            <h3 class="hero-name">{{ booking.chalet?.name || '—' }}</h3>
            <span class="hero-created">· أُنشئ {{ toDisplayDateTime(booking.created_at) }}</span>
          </div>
          <div class="hero-tags">
            <span class="booking-code">{{ booking.booking_code }}</span>
            <span v-if="booking.chalet?.chalet_number" class="chip neutral">
              <i class="pi pi-hashtag" /> رقم {{ booking.chalet.chalet_number }}
            </span>
            <span :class="['chip', 'status', booking.status?.toLowerCase()]">
              <i class="pi pi-circle-fill tiny" />
              {{ statusLabel(booking.status) }}
            </span>
            <span v-if="booking.payment_type" :class="['chip', 'pay', booking.payment_type?.toLowerCase()]">
              <i class="pi pi-credit-card" /> {{ paymentLabel(booking.payment_type) }}
            </span>
            <span :class="['chip', 'permit', booking.permit_exists ? 'ok' : 'warn']">
              <i :class="booking.permit_exists ? 'pi pi-shield' : 'pi pi-clock'" />
              {{ booking.permit_exists ? 'التصريح مؤكد' : 'التصريح قيد الانتظار' }}
            </span>
            <span v-if="booking.check_in_confirmed" class="chip ok">
              <i class="pi pi-sign-in" /> دخول مؤكد
            </span>
            <span v-if="booking.check_out_confirmed" class="chip ok">
              <i class="pi pi-sign-out" /> خروج مؤكد
            </span>
          </div>
        </div>
        <div class="page-header-actions">
          <button
            v-if="canManagePermit && !booking.permit_exists"
            class="btn-confirm"
            :disabled="confirmingPermit"
            @click="handleConfirmPermit"
          >
            <i v-if="confirmingPermit" class="pi pi-spin pi-spinner" />
            <i v-else class="pi pi-check" />
            تأكيد التصريح
          </button>
          <RouterLink
            v-else-if="canManagePermit && booking.permit_exists"
            :to="`/admin/village-bookings/${booking.id}/permit`"
            class="btn-secondary"
          >
            <i class="pi pi-print" /> عرض التصريح
          </RouterLink>
        </div>
      </section>

      <!-- Stay + headline money -->
      <section class="bf-section stay-card">
        <div class="bf-section-head">
          <h4 class="bf-section-title"><i class="pi pi-calendar" /> الإقامة</h4>
        </div>

        <div class="stay-band">
          <div class="stay-date">
            <span class="stay-date-label"><i class="pi pi-sign-in" /> الدخول</span>
            <strong class="stay-date-value">{{ toDisplayDate(booking.check_in) }}</strong>
          </div>
          <div class="stay-mid">
            <span class="stay-nights">
              <i class="pi pi-moon" /> {{ booking.nights }} {{ booking.nights === 1 ? 'ليلة' : 'ليالٍ' }}
            </span>
          </div>
          <div class="stay-date">
            <span class="stay-date-label"><i class="pi pi-sign-out" /> الخروج</span>
            <strong class="stay-date-value">{{ toDisplayDate(booking.check_out) }}</strong>
          </div>
        </div>

        <div class="money-row">
          <div class="money-card total">
            <span class="money-label">الإجمالي</span>
            <span class="money-value">{{ fmt(booking.total) }} <small>ج.م</small></span>
          </div>
          <div class="money-card paid">
            <span class="money-label">المدفوع</span>
            <span class="money-value">{{ fmt(booking.deposit) }} <small>ج.م</small></span>
          </div>
          <div class="money-card" :class="Number(booking.remaining_amount) === 0 ? 'done' : 'remaining'">
            <span class="money-label">المتبقي</span>
            <span class="money-value">{{ fmt(booking.remaining_amount) }} <small>ج.م</small></span>
          </div>
        </div>
      </section>

      <!-- Cost breakdown -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title"><i class="pi pi-calculator" /> تفاصيل التكلفة</h4>
        </div>
        <div class="cost-lines">
          <div class="cost-line">
            <span class="cost-label">
              إجمالي الليالي
              <span class="cost-sub">{{ fmt(pricePerNight) }} × {{ booking.nights }}</span>
            </span>
            <span class="cost-value">{{ fmt(booking.nights_total) }} ج.م</span>
          </div>
          <div class="cost-line">
            <span class="cost-label">
              رسوم القرية
              <span v-if="booking.nights" class="cost-sub">{{ fmt(booking.village_fee) }} × {{ booking.nights }}</span>
            </span>
            <span class="cost-value">{{ fmt(booking.total_village_fee) }} ج.م</span>
          </div>
          <div class="cost-line">
            <span class="cost-label">تصريح أمني</span>
            <span class="cost-value">{{ fmt(booking.security_permit_price) }} ج.م</span>
          </div>
          <div class="cost-line">
            <span class="cost-label">تصريح إلكتروني</span>
            <span class="cost-value">{{ fmt(booking.electronic_permit_price) }} ج.م</span>
          </div>
          <div v-if="booking.extra_guest_count" class="cost-line">
            <span class="cost-label">
              أفراد إضافيون
              <span class="cost-sub">{{ booking.extra_guest_count }} × {{ fmt(booking.additional_person_price) }}</span>
            </span>
            <span class="cost-value">{{ fmt(booking.extra_guest_total) }} ج.م</span>
          </div>
          <div v-if="booking.cars_count" class="cost-line">
            <span class="cost-label">
              السيارات
              <span class="cost-sub">{{ booking.cars_count }} سيارة</span>
            </span>
            <span class="cost-value">{{ fmt(booking.car_price_total) }} ج.م</span>
          </div>
          <div v-if="booking.discount_amount" class="cost-line discount">
            <span class="cost-label"><i class="pi pi-tag" /> الخصم</span>
            <span class="cost-value">− {{ fmt(booking.discount_amount) }} ج.م</span>
          </div>
          <div class="cost-line cost-line-total">
            <span class="cost-label">الإجمالي</span>
            <span class="cost-value">{{ fmt(booking.total) }} ج.م</span>
          </div>
        </div>
      </section>

      <!-- Guests -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-users" /> الضيوف
            <span class="bf-counter">{{ booking.guests?.length || 0 }}</span>
          </h4>
        </div>
        <div v-if="!booking.guests?.length" class="bf-section-empty">لا يوجد ضيوف مسجلين</div>
        <table v-else class="list-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>الرقم القومي</th>
              <th>الصفة</th>
              <th>النوع</th>
              <th>الهاتف</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in booking.guests" :key="g.id">
              <td>{{ g.name }}</td>
              <td class="ltr">{{ g.identity_number || '—' }}</td>
              <td>{{ g.role || '—' }}</td>
              <td>{{ g.type === 'ADULT' ? 'بالغ' : g.type === 'CHILD' ? 'طفل' : g.type }}</td>
              <td class="ltr">{{ g.phone || '—' }}</td>
              <td>{{ fmt(g.price) }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Cars -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-car" /> السيارات
            <span class="bf-counter">{{ booking.cars?.length || 0 }}</span>
          </h4>
        </div>
        <div v-if="!booking.cars?.length" class="bf-section-empty">لا توجد سيارات</div>
        <table v-else class="list-table">
          <thead>
            <tr>
              <th>رقم اللوحة</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in booking.cars" :key="c.id">
              <td class="ltr">{{ c.plate_number }}</td>
              <td>{{ fmt(c.price) }} ج.م</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Payments -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-wallet" /> الدفعات
            <span class="bf-counter">{{ booking.payments?.length || 0 }}</span>
          </h4>
        </div>
        <div v-if="!booking.payments?.length" class="bf-section-empty">لا توجد دفعات مسجلة</div>
        <table v-else class="list-table">
          <thead>
            <tr>
              <th>المبلغ</th>
              <th>الطريقة</th>
              <th>التاريخ</th>
              <th>ملاحظات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in booking.payments" :key="i">
              <td>{{ fmt(p.amount) }} ج.م</td>
              <td>{{ paymentLabel(p.method) }}</td>
              <td>{{ toDisplayDateTime(p.paid_at) }}</td>
              <td>{{ p.notes || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES } from '@/constants/roles'
import { toDisplayDate, toDisplayDateTime } from '@/utils/date'

const route = useRoute()
const csBookings = useCsBookingsStore()
const toast = useToastStore()
const { hasRole } = usePermissions()

const loading = ref(true)
const booking = ref(null)
const confirmingPermit = ref(false)

const canManagePermit = computed(() =>
  hasRole(ROLES.CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.FINANCIAL_MEMBER),
)

const pricePerNight = computed(() => {
  if (!booking.value?.nights) return 0
  return Math.round((booking.value.nights_total || 0) / booking.value.nights)
})

async function load() {
  loading.value = true
  const r = await csBookings.getBooking(route.params.id)
  loading.value = false
  if (r.ok) booking.value = r.data
  else toast.error(r.error)
}

async function handleConfirmPermit() {
  if (!booking.value) return
  confirmingPermit.value = true
  const r = await csBookings.confirmPermit(booking.value.id)
  confirmingPermit.value = false
  if (r.ok) {
    toast.success('تم تأكيد التصريح')
    if (r.data && typeof r.data === 'object') {
      booking.value = { ...booking.value, ...r.data, permit_exists: true }
    } else {
      booking.value.permit_exists = true
    }
  } else {
    toast.error(r.error)
  }
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

function paymentLabel(p) {
  return {
    CASH: 'نقدي',
    BANK: 'تحويل بنكي',
    WITHDRAW_BALANCE: 'خصم من الرصيد',
  }[p] || p || '—'
}

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

onMounted(load)
</script>

<style scoped>
.detail-page { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb (matches sub-page convention) */
.page-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
.crumb-current:hover { color: #0f172a; }
.crumb-sep { font-size: 12px; color: #cbd5e1; }

.page-header-actions { display: flex; gap: 10px; flex-shrink: 0; }

.btn-confirm {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: 1px solid #059669;
  color: #fff;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
  transition: all 0.15s;
}
.btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45); }
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-secondary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s;
}
.btn-secondary:hover { border-color: #f97316; color: #f97316; }

.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff; font-size: 13.5px; font-weight: 700;
  text-decoration: none;
}

/* Chalet hero (inside chalet card) */
/* Sticky hero — a slim bar, deliberately styled unlike the data cards
   (translucent, hairline border, no big shadow). Pins under the layout
   topbar (52px topbar + 14px×2 wrapper padding ≈ 80px). */
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
.hero-id { display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1; }
.hero-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.hero-name { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2; }
.booking-code {
  display: inline-flex; align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
  font-size: 11.5px; font-weight: 800;
  direction: ltr;
}
.hero-created { font-size: 11px; color: #94a3b8; font-weight: 600; }
.hero-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.hero-tags .chip { padding: 3px 9px; font-size: 10.5px; }

/* Unified chip system inside the chalet card */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
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
.chip.status.confirmed { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.status.expired,
.chip.status.cancelled { background: rgba(239, 68, 68, 0.10); color: #b91c1c; border-color: rgba(239, 68, 68, 0.22); }
.chip.status.completed { background: rgba(100, 116, 139, 0.12); color: #475569; border-color: rgba(100, 116, 139, 0.22); }

.chip.pay.cash { background: rgba(16, 185, 129, 0.12); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.pay.bank { background: rgba(14, 165, 233, 0.12); color: #0369a1; border-color: rgba(14, 165, 233, 0.22); }
.chip.pay.withdraw_balance { background: rgba(139, 92, 246, 0.12); color: #6d28d9; border-color: rgba(139, 92, 246, 0.22); }

.chip.permit.ok { background: rgba(16, 185, 129, 0.10); color: #047857; border-color: rgba(16, 185, 129, 0.22); }
.chip.permit.warn { background: rgba(234, 179, 8, 0.10); color: #b45309; border-color: rgba(234, 179, 8, 0.22); }

/* Cards (matches BookingFormView style) */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; }
.bf-section-title {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 800; color: #0f172a; margin: 0;
}
.bf-section-title i { color: #f97316; }
.bf-counter { margin-inline-start: 6px; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }
.bf-section-empty {
  padding: 18px;
  text-align: center;
  color: #94a3b8;
  font-size: 13px;
  background: #fafbfc;
  border: 1px dashed #e2e8f0;
  border-radius: 10px;
}

/* Stay band — dates + nights pill (matches BookingFormView trip-dates) */
.stay-card { display: flex; flex-direction: column; gap: 14px; }
.stay-band {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #fafbfc;
  border: 1px dashed #e2e8f0;
  border-radius: 14px;
}
.stay-date { display: flex; flex-direction: column; gap: 4px; }
.stay-date-label {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.stay-date-label i { font-size: 11px; }
.stay-date-value { font-size: 14.5px; font-weight: 800; color: #0f172a; }
.stay-mid { display: flex; justify-content: center; }
.stay-nights {
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
.stay-nights i { font-size: 11px; }

/* Money cards — three headline numbers */
.money-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.money-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 14px;
  border-radius: 14px;
  border: 1px solid #f1f5f9;
  background: #fff;
}
.money-label {
  font-size: 11.5px;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.money-value {
  font-size: 22px;
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
  border-color: rgba(249, 115, 22, 0.22);
}
.money-card.total .money-label { color: #c2410c; }
.money-card.total .money-value { color: #ea580c; }
.money-card.total .money-value small { color: #c2410c; }

.money-card.paid {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.08), rgba(56, 189, 248, 0.08));
  border-color: rgba(14, 165, 233, 0.22);
}
.money-card.paid .money-label { color: #0284c7; }
.money-card.paid .money-value { color: #0284c7; }
.money-card.paid .money-value small { color: #0369a1; }

.money-card.remaining {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(248, 113, 113, 0.08));
  border-color: rgba(239, 68, 68, 0.22);
}
.money-card.remaining .money-label { color: #b91c1c; }
.money-card.remaining .money-value { color: #b91c1c; }
.money-card.remaining .money-value small { color: #b91c1c; }

.money-card.done {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.10), rgba(52, 211, 153, 0.10));
  border-color: rgba(16, 185, 129, 0.22);
}
.money-card.done .money-label { color: #047857; }
.money-card.done .money-value { color: #059669; }
.money-card.done .money-value small { color: #047857; }

/* Cost breakdown line items (matches BookingFormView cost-card) */
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
.cost-label i { font-size: 11px; color: #94a3b8; }
.cost-sub { font-size: 11.5px; color: #94a3b8; font-weight: 500; }
.cost-value { color: #0f172a; font-weight: 700; }

.cost-line.discount .cost-label,
.cost-line.discount .cost-value { color: #047857; }
.cost-line.discount .cost-label i { color: #059669; }

.cost-line-total {
  margin-top: 6px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(251, 191, 36, 0.08));
  border: 1px solid rgba(249, 115, 22, 0.20);
  border-radius: 12px;
}
.cost-line-total .cost-label { color: #0f172a; font-weight: 800; font-size: 14px; }
.cost-line-total .cost-value { color: #ea580c; font-weight: 900; font-size: 16px; }

@media (max-width: 540px) {
  .stay-band { grid-template-columns: 1fr; text-align: center; }
  .money-row { grid-template-columns: 1fr; }
}

.list-table { width: 100%; border-collapse: collapse; }
.list-table th {
  padding: 10px 14px;
  text-align: right;
  font-size: 11.5px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: #fafbfc;
  border-bottom: 1px solid #f1f5f9;
}
.list-table td { padding: 11px 14px; font-size: 13px; color: #475569; border-bottom: 1px solid #f8fafc; }
.list-table tr:last-child td { border-bottom: none; }
.ltr { direction: ltr; text-align: right; }

/* States */
.loading-state { padding: 60px 20px; text-align: center; color: #64748b; font-size: 14px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }

.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; text-align: center; color: #b91c1c; }
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }
</style>
