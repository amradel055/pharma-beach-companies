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

      <!-- Supervisor actions -->
      <section v-if="hasAnySupervisorAction" class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title"><i class="pi pi-bolt" /> إجراءات المشرف</h4>
        </div>
        <div class="sup-actions">
          <button v-if="canEditGuestsCars" class="sup-btn" @click="openEdit">
            <i class="pi pi-user-edit" /> تعديل الضيوف والسيارات
          </button>
          <button v-if="canExtend" class="sup-btn" @click="openExtend">
            <i class="pi pi-calendar-plus" /> تمديد الحجز
          </button>
          <button v-if="canTransfer" class="sup-btn" @click="openTransfer">
            <i class="pi pi-arrow-right-arrow-left" /> نقل الحجز
          </button>
          <button v-if="canTransferExtend" class="sup-btn" @click="openTransferExt">
            <i class="pi pi-sync" /> نقل وتمديد
          </button>
          <button v-if="canCancel" class="sup-btn danger" @click="cancelOpen = true">
            <i class="pi pi-times-circle" /> إلغاء الحجز
          </button>
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

    <!-- ── Supervisor action modals ── -->
    <AppModal v-model="editOpen" title="تعديل الضيوف والسيارات" icon="pi pi-user-edit" icon-color="#ea580c" icon-bg="rgba(249,115,22,0.08)" size="lg">
      <div class="sup-form">
        <div class="sup-block">
          <div class="sup-block-head">
            <h5>الضيوف</h5>
            <button type="button" class="sup-add" @click="addGuest"><i class="pi pi-plus" /> إضافة ضيف</button>
          </div>
          <div v-for="(g, i) in editForm.guests" :key="`g${i}`" class="sup-row">
            <input v-model="g.name" class="sup-input" placeholder="الاسم *" />
            <input v-model="g.national_id" class="sup-input ltr" placeholder="الرقم القومي" />
            <input v-model="g.role" class="sup-input" placeholder="الصفة" />
            <input v-model="g.phone" class="sup-input ltr" placeholder="الهاتف" />
            <AppDropdown v-model="g.type" :options="typeOptions" />
            <button type="button" class="sup-del" :disabled="editForm.guests.length === 1" @click="removeGuest(i)">
              <i class="pi pi-trash" />
            </button>
          </div>
        </div>

        <div class="sup-block">
          <div class="sup-block-head">
            <h5>السيارات</h5>
            <button type="button" class="sup-add" @click="addCar"><i class="pi pi-plus" /> إضافة سيارة</button>
          </div>
          <div v-if="!editForm.cars.length" class="sup-empty">لا توجد سيارات</div>
          <div v-for="(c, i) in editForm.cars" :key="`c${i}`" class="sup-row car">
            <input v-model="c.plate_number" class="sup-input ltr" placeholder="رقم اللوحة *" />
            <button type="button" class="sup-del" @click="removeCar(i)"><i class="pi pi-trash" /></button>
          </div>
        </div>

        <label class="sup-field">
          <span class="sup-label">طريقة الدفع</span>
          <AppDropdown v-model="editForm.payment_type" :options="PAYMENT_OPTIONS" />
        </label>

        <div class="sup-modal-actions">
          <button class="sup-cancel" @click="editOpen = false">إلغاء</button>
          <button class="sup-submit" :disabled="acting" @click="submitEdit">
            <i v-if="acting" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-check" /> حفظ
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="extendOpen" title="تمديد الحجز" icon="pi pi-calendar-plus" icon-color="#ea580c" icon-bg="rgba(249,115,22,0.08)" size="sm">
      <div class="sup-form">
        <label class="sup-field">
          <span class="sup-label">عدد الأيام الإضافية</span>
          <input v-model.number="extendForm.additional_days" type="number" min="1" class="sup-input ltr" />
        </label>
        <label class="sup-field">
          <span class="sup-label">طريقة الدفع</span>
          <AppDropdown v-model="extendForm.payment_type" :options="PAYMENT_OPTIONS" />
        </label>
        <div class="sup-modal-actions">
          <button class="sup-cancel" @click="extendOpen = false">إلغاء</button>
          <button class="sup-submit" :disabled="acting" @click="submitExtend">
            <i v-if="acting" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-check" /> تمديد
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="transferOpen" title="نقل الحجز" icon="pi pi-arrow-right-arrow-left" icon-color="#ea580c" icon-bg="rgba(249,115,22,0.08)" size="sm">
      <div class="sup-form">
        <label class="sup-field">
          <span class="sup-label">الشاليه الجديد</span>
          <AppDropdown v-model="transferForm.new_chalet_id" :options="chaletOptions" placeholder="اختر الشاليه" empty-text="لا توجد شاليهات" />
        </label>
        <label class="sup-field">
          <span class="sup-label">طريقة الدفع</span>
          <AppDropdown v-model="transferForm.payment_type" :options="PAYMENT_OPTIONS" />
        </label>
        <div class="sup-modal-actions">
          <button class="sup-cancel" @click="transferOpen = false">إلغاء</button>
          <button class="sup-submit" :disabled="acting" @click="submitTransfer">
            <i v-if="acting" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-check" /> نقل
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="transferExtOpen" title="نقل وتمديد الحجز" icon="pi pi-sync" icon-color="#ea580c" icon-bg="rgba(249,115,22,0.08)" size="sm">
      <div class="sup-form">
        <label class="sup-field">
          <span class="sup-label">الشاليه الجديد</span>
          <AppDropdown v-model="transferExtForm.new_chalet_id" :options="chaletOptions" placeholder="اختر الشاليه" empty-text="لا توجد شاليهات" />
        </label>
        <label class="sup-field">
          <span class="sup-label">عدد الأيام الإضافية</span>
          <input v-model.number="transferExtForm.additional_days" type="number" min="1" class="sup-input ltr" />
        </label>
        <label class="sup-field">
          <span class="sup-label">طريقة الدفع</span>
          <AppDropdown v-model="transferExtForm.payment_type" :options="PAYMENT_OPTIONS" />
        </label>
        <div class="sup-modal-actions">
          <button class="sup-cancel" @click="transferExtOpen = false">إلغاء</button>
          <button class="sup-submit" :disabled="acting" @click="submitTransferExt">
            <i v-if="acting" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-check" /> نقل وتمديد
          </button>
        </div>
      </div>
    </AppModal>

    <AppModal v-model="cancelOpen" title="إلغاء الحجز؟" subtitle="لا يمكن التراجع عن هذا الإجراء" icon="pi pi-exclamation-triangle" icon-color="#ef4444" icon-bg="rgba(239,68,68,0.08)" size="sm">
      <p class="sup-confirm">
        سيتم إلغاء الحجز <strong>{{ booking?.booking_code }}</strong> وإتاحة الشاليه. إذا كان الدفع بخصم من الرصيد سيُعاد الرصيد تلقائياً.
      </p>
      <div class="sup-modal-actions">
        <button class="sup-cancel" @click="cancelOpen = false">رجوع</button>
        <button class="sup-submit danger" :disabled="acting" @click="submitCancel">
          <i v-if="acting" class="pi pi-spin pi-spinner" /><i v-else class="pi pi-times-circle" /> تأكيد الإلغاء
        </button>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES } from '@/constants/roles'
import { toDisplayDate, toDisplayDateTime } from '@/utils/date'
import AppModal from '@/components/ui/AppModal.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const route = useRoute()
const csBookings = useCsBookingsStore()
const toast = useToastStore()
const { hasRole, hasPermission } = usePermissions()

const loading = ref(true)
const booking = ref(null)
const confirmingPermit = ref(false)

const canManagePermit = computed(() =>
  hasRole(ROLES.CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.HEAD_CUSTOMER_SERVICE_VILLAGE) ||
  hasRole(ROLES.FINANCIAL_MEMBER),
)

// ── CS-Supervisor action gating (permission + booking state) ──
const PAYMENT_OPTIONS = [
  { value: 'CASH', label: 'نقدي' },
  { value: 'BANK', label: 'تحويل بنكي' },
  { value: 'WITHDRAW_BALANCE', label: 'خصم من الرصيد' },
]
const notCancelled = computed(() => booking.value && booking.value.status !== 'CANCELLED')
const notCheckedIn = computed(() => booking.value && !booking.value.check_in_confirmed)

const canEditGuestsCars = computed(() =>
  hasPermission('bookings.edit-guests-cars') && notCancelled.value && notCheckedIn.value)
const canExtend = computed(() =>
  hasPermission('bookings.extend') && notCancelled.value)
const canTransfer = computed(() =>
  hasPermission('bookings.transfer') && notCancelled.value)
const canTransferExtend = computed(() =>
  hasPermission('bookings.transfer-and-extend') && notCancelled.value)
const canCancel = computed(() =>
  hasPermission('bookings.cancel') && notCancelled.value && notCheckedIn.value)
const hasAnySupervisorAction = computed(() =>
  canEditGuestsCars.value || canExtend.value || canTransfer.value ||
  canTransferExtend.value || canCancel.value)

// Chalet options for the transfer dropdowns (loaded lazily on mount).
const chaletOptions = ref([])
async function loadChaletOptions() {
  const r = await csBookings.listChalets({ page: 1, limit: 200 })
  if (r.ok) {
    chaletOptions.value = (r.data.rows || []).map((c) => ({
      value: c.id,
      label: c.chalet_code ? `${c.name} · ${c.chalet_code}` : c.name,
    }))
  }
}

// ── Modals + forms ──
const editOpen = ref(false)
const extendOpen = ref(false)
const transferOpen = ref(false)
const transferExtOpen = ref(false)
const cancelOpen = ref(false)
const acting = ref(false)

const blankGuest = () => ({ name: '', national_id: '', role: '', phone: '', type: 'ADULT' })
const editForm = reactive({ guests: [], cars: [], payment_type: 'CASH' })
const extendForm = reactive({ additional_days: 1, payment_type: 'CASH' })
const transferForm = reactive({ new_chalet_id: '', payment_type: 'CASH' })
const transferExtForm = reactive({ new_chalet_id: '', additional_days: 1, payment_type: 'CASH' })

const typeOptions = [
  { value: 'ADULT', label: 'بالغ' },
  { value: 'CHILD', label: 'طفل' },
]

function openEdit() {
  editForm.guests = (booking.value?.guests || []).map((g) => ({
    name: g.name || '',
    national_id: g.identity_number || g.national_id || '',
    role: g.role || '',
    phone: g.phone || '',
    type: g.type || 'ADULT',
  }))
  if (!editForm.guests.length) editForm.guests = [blankGuest()]
  editForm.cars = (booking.value?.cars || []).map((c) => ({ plate_number: c.plate_number || '' }))
  editForm.payment_type = booking.value?.payment_type || 'CASH'
  editOpen.value = true
}
function addGuest() { editForm.guests.push(blankGuest()) }
function removeGuest(i) { editForm.guests.splice(i, 1) }
function addCar() { editForm.cars.push({ plate_number: '' }) }
function removeCar(i) { editForm.cars.splice(i, 1) }

function openExtend() { extendForm.additional_days = 1; extendForm.payment_type = 'CASH'; extendOpen.value = true }
function openTransfer() { transferForm.new_chalet_id = ''; transferForm.payment_type = 'CASH'; transferOpen.value = true }
function openTransferExt() {
  transferExtForm.new_chalet_id = ''
  transferExtForm.additional_days = 1
  transferExtForm.payment_type = 'CASH'
  transferExtOpen.value = true
}

async function _runAction(promise, successMsg) {
  acting.value = true
  const r = await promise
  acting.value = false
  if (r.ok) {
    toast.success(successMsg)
    await load()
    return true
  }
  toast.error(r.error)
  return false
}

async function submitEdit() {
  if (!editForm.guests.some((g) => g.name.trim())) {
    toast.error('أضف ضيفاً واحداً على الأقل باسم صحيح')
    return
  }
  const payload = {
    guests: editForm.guests
      .filter((g) => g.name.trim())
      .map((g) => ({
        name: g.name.trim(),
        national_id: g.national_id || null,
        role: g.role || null,
        phone: g.phone || null,
        type: g.type || null,
      })),
    cars: editForm.cars.filter((c) => c.plate_number.trim()).map((c) => ({ plate_number: c.plate_number.trim() })),
    payment_type: editForm.payment_type,
  }
  if (await _runAction(csBookings.editGuestsCars(booking.value.id, payload), 'تم تحديث بيانات الضيوف والسيارات بنجاح')) {
    editOpen.value = false
  }
}
async function submitExtend() {
  if (Number(extendForm.additional_days) < 1) { toast.error('أدخل عدد أيام صحيح'); return }
  const payload = { additional_days: Number(extendForm.additional_days), payment_type: extendForm.payment_type }
  if (await _runAction(csBookings.extendBooking(booking.value.id, payload), 'تم تمديد الحجز بنجاح')) {
    extendOpen.value = false
  }
}
async function submitTransfer() {
  if (!transferForm.new_chalet_id) { toast.error('اختر الشاليه الجديد'); return }
  const payload = { new_chalet_id: transferForm.new_chalet_id, payment_type: transferForm.payment_type }
  if (await _runAction(csBookings.transferBooking(booking.value.id, payload), 'تم نقل الحجز بنجاح')) {
    transferOpen.value = false
  }
}
async function submitTransferExt() {
  if (!transferExtForm.new_chalet_id) { toast.error('اختر الشاليه الجديد'); return }
  if (Number(transferExtForm.additional_days) < 1) { toast.error('أدخل عدد أيام صحيح'); return }
  const payload = {
    new_chalet_id: transferExtForm.new_chalet_id,
    additional_days: Number(transferExtForm.additional_days),
    payment_type: transferExtForm.payment_type,
  }
  if (await _runAction(csBookings.transferAndExtend(booking.value.id, payload), 'تم نقل وتمديد الحجز بنجاح')) {
    transferExtOpen.value = false
  }
}
async function submitCancel() {
  if (await _runAction(csBookings.cancelBooking(booking.value.id), 'تم إلغاء الحجز بنجاح')) {
    cancelOpen.value = false
  }
}

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
    toast.success('تم تأكيد التصريح بنجاح')
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

onMounted(async () => {
  await load()
  if (canTransfer.value || canTransferExtend.value) loadChaletOptions()
})
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

/* ── Supervisor actions ── */
.sup-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.sup-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 10px 16px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.sup-btn i { font-size: 13px; color: #ea580c; }
.sup-btn:hover { border-color: #fed7aa; background: #fff7ed; color: #c2410c; }
.sup-btn.danger { color: #b91c1c; }
.sup-btn.danger i { color: #ef4444; }
.sup-btn.danger:hover { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }

/* Modal forms */
.sup-form { display: flex; flex-direction: column; gap: 16px; }
.sup-block { display: flex; flex-direction: column; gap: 10px; }
.sup-block-head { display: flex; align-items: center; justify-content: space-between; }
.sup-block-head h5 { margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; }
.sup-add {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  background: rgba(249, 115, 22, 0.10); border: 1px solid rgba(249, 115, 22, 0.25);
  color: #c2410c; font-family: inherit; font-size: 12px; font-weight: 700; cursor: pointer;
}
.sup-add:hover { background: rgba(249, 115, 22, 0.18); }
.sup-row {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr 110px 36px;
  gap: 8px;
  align-items: center;
}
.sup-row.car { grid-template-columns: 1fr 36px; }
.sup-input {
  padding: 9px 11px; border-radius: 9px; border: 1px solid #e2e8f0;
  background: #fff; font-size: 13px; font-family: inherit; color: #0f172a; min-width: 0;
}
.sup-input:focus { outline: none; border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.12); }
.sup-input.ltr { direction: ltr; text-align: right; }
.sup-del {
  width: 36px; height: 36px; border-radius: 8px;
  background: #fff; border: 1px solid #e2e8f0; color: #94a3b8;
  cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
}
.sup-del:hover:not(:disabled) { border-color: #fecaca; color: #ef4444; }
.sup-del:disabled { opacity: 0.4; cursor: not-allowed; }
.sup-empty { font-size: 12.5px; color: #94a3b8; padding: 6px 2px; }
.sup-field { display: flex; flex-direction: column; gap: 6px; }
.sup-label { font-size: 12px; font-weight: 700; color: #64748b; }
.sup-modal-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 6px; }
.sup-cancel {
  padding: 9px 18px; border-radius: 9px; background: #fff; border: 1px solid #e2e8f0;
  color: #64748b; font-family: inherit; font-size: 13px; font-weight: 700; cursor: pointer;
}
.sup-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
.sup-submit {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 20px; border-radius: 9px;
  background: linear-gradient(135deg, #f97316, #ea580c); border: 1px solid #ea580c; color: #fff;
  font-family: inherit; font-size: 13px; font-weight: 800; cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.30);
}
.sup-submit:hover:not(:disabled) { transform: translateY(-1px); }
.sup-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.sup-submit.danger { background: linear-gradient(135deg, #ef4444, #dc2626); border-color: #dc2626; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.30); }
.sup-confirm { font-size: 14px; color: #475569; margin: 0 0 16px; line-height: 1.7; }
.sup-confirm strong { color: #0f172a; direction: ltr; }

@media (max-width: 640px) {
  .sup-row { grid-template-columns: 1fr 1fr; }
  .sup-row.car { grid-template-columns: 1fr 36px; }
}
</style>
