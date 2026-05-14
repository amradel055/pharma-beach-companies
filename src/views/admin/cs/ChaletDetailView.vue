<template>
  <div class="chalet-page">
    <nav class="page-crumbs" aria-label="مسار التنقل">
      <RouterLink to="/admin/village-bookings" class="crumb">الحجوزات</RouterLink>
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
      <RouterLink to="/admin/village-bookings" class="btn-primary">العودة للقائمة</RouterLink>
    </div>

    <template v-else>
      <!-- Page header -->
      <div class="page-header">
        <div class="page-icon"><i class="pi pi-home" /></div>
        <div class="page-header-text">
          <h1 class="page-title">{{ chalet.name }}</h1>
          <p class="page-desc">
            {{ chalet.village?.name || '—' }} · رقم {{ chalet.chalet_number || '—' }}
          </p>
        </div>
        <span :class="['status-badge', chalet.status?.toLowerCase()]">{{ statusLabel(chalet.status) }}</span>
      </div>

      <!-- Media gallery -->
      <section v-if="chalet.media?.length" class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title"><i class="pi pi-images" /> الصور</h4>
        </div>
        <div class="gallery">
          <div v-for="m in chalet.media" :key="m.id" class="gallery-item">
            <img :src="m.url" :alt="chalet.name" loading="lazy" />
          </div>
        </div>
      </section>

      <!-- Chalet info -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title"><i class="pi pi-info-circle" /> بيانات الشاليه</h4>
        </div>
        <div class="kv-row">
          <div class="kv"><span class="k">الكود</span><span class="v ltr">{{ chalet.chalet_code || '—' }}</span></div>
          <div class="kv"><span class="k">الرقم</span><span class="v ltr">{{ chalet.chalet_number || '—' }}</span></div>
          <div class="kv"><span class="k">الوحدة</span><span class="v ltr">{{ chalet.unit_number || '—' }}</span></div>
          <div class="kv"><span class="k">الطابق</span><span class="v">{{ chalet.floor?.label_ar || '—' }}</span></div>
          <div class="kv"><span class="k">الغرف</span><span class="v">{{ chalet.rooms?.label_ar || '—' }}</span></div>
          <div class="kv"><span class="k">الحمامات</span><span class="v">{{ chalet.bathrooms?.label_ar || '—' }}</span></div>
          <div class="kv"><span class="k">المساحة</span><span class="v">{{ chalet.area_range?.label_ar || '—' }}</span></div>
          <div class="kv"><span class="k">التشطيب</span><span class="v">{{ chalet.finishing?.name_ar || '—' }}</span></div>
          <div class="kv"><span class="k">الإطلالة</span><span class="v">{{ chalet.the_view?.label_ar || '—' }}</span></div>
          <div class="kv"><span class="k">سعر الليلة</span><span class="v">{{ fmt(chalet.price) }} ج.م</span></div>
          <div class="kv"><span class="k">المالك</span><span class="v">{{ chalet.owner?.name || '—' }}</span></div>
          <div class="kv"><span class="k">حالة الوحدة</span><span class="v">{{ chalet.unit_status || '—' }}</span></div>
          <div class="kv"><span class="k">تصريح إلكتروني</span><span class="v">{{ chalet.has_electronic_permit ? 'نعم' : 'لا' }}</span></div>
        </div>

        <div v-if="chalet.chalet_tier" class="sub-section">
          <h5 class="sub-title">الفئة</h5>
          <div class="kv-row">
            <div class="kv"><span class="k">الاسم</span><span class="v">{{ chalet.chalet_tier.name }}</span></div>
            <div class="kv"><span class="k">الحد الأقصى للضيوف</span><span class="v">{{ chalet.chalet_tier.max_guests }}</span></div>
            <div class="kv"><span class="k">ضيوف إضافيون</span><span class="v">{{ chalet.chalet_tier.max_extra_guest }}</span></div>
            <div class="kv"><span class="k">رسوم القرية</span><span class="v">{{ fmt(chalet.chalet_tier.village_fee) }} ج.م</span></div>
          </div>
        </div>

        <div v-if="chalet.settings" class="sub-section">
          <h5 class="sub-title">الأسعار التفصيلية</h5>
          <div class="kv-row">
            <div class="kv"><span class="k">تصريح أمني</span><span class="v">{{ fmt(chalet.settings.security_permit_price) }} ج.م</span></div>
            <div class="kv"><span class="k">تصريح إلكتروني</span><span class="v">{{ fmt(chalet.settings.electronic_permit_price) }} ج.م</span></div>
            <div class="kv"><span class="k">السيارة الأولى</span><span class="v">{{ fmt(chalet.settings.first_car_price) }} ج.م</span></div>
            <div class="kv"><span class="k">سيارة إضافية</span><span class="v">{{ fmt(chalet.settings.additional_car_price) }} ج.م</span></div>
            <div class="kv"><span class="k">فرد إضافي</span><span class="v">{{ fmt(chalet.settings.additional_person_price) }} ج.م</span></div>
          </div>
        </div>

        <div v-if="chalet.amenities?.length" class="sub-section">
          <h5 class="sub-title">الكماليات</h5>
          <div class="chips">
            <span v-for="a in chalet.amenities" :key="a.id" class="chip">
              <i v-if="a.icon" :class="a.icon" />
              {{ a.name_ar || a.name_en }}
            </span>
          </div>
        </div>
      </section>

      <!-- Bookings -->
      <section class="bf-section">
        <div class="bf-section-head">
          <h4 class="bf-section-title">
            <i class="pi pi-calendar" /> الحجوزات
            <span class="bf-counter">{{ bookings.length }}</span>
          </h4>
          <div class="date-filters">
            <div class="filter-field">
              <label>من</label>
              <input v-model="dateRange.date_from" type="date" class="date-input" @change="reloadBookings" />
            </div>
            <div class="filter-field">
              <label>إلى</label>
              <input v-model="dateRange.date_to" type="date" class="date-input" @change="reloadBookings" />
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
                  <RouterLink :to="`/admin/village-bookings/${row.id}`" class="row-link" @click.stop>
                    {{ row.booking_code }}
                  </RouterLink>
                </td>
                <td><span :class="['status-badge', row.status?.toLowerCase()]">{{ statusLabel(row.status) }}</span></td>
                <td>{{ paymentLabel(row.payment_type) }}</td>
                <td>{{ toDisplayDate(row.check_in) }}</td>
                <td>{{ toDisplayDate(row.check_out) }}</td>
                <td>{{ row.nights }}</td>
                <td>
                  {{ row.guests?.length || 0 }}
                  <small v-if="row.extra_guest_count">(+{{ row.extra_guest_count }})</small>
                </td>
                <td>{{ row.cars_count }}</td>
                <td>{{ fmt(row.total) }}</td>
                <td>{{ fmt(row.remaining_amount) }}</td>
                <td>
                  <span :class="['permit-badge', row.permit_exists ? 'ok' : 'pending']">
                    <i :class="row.permit_exists ? 'pi pi-check' : 'pi pi-clock'" />
                  </span>
                </td>
              </tr>
              <tr v-if="expanded[row.id]" class="expand-row">
                <td colspan="12">
                  <div class="expand-grid">
                    <div v-if="row.guests?.length" class="expand-block">
                      <h6>الضيوف</h6>
                      <ul>
                        <li v-for="g in row.guests" :key="g.id">
                          <strong>{{ g.name }}</strong>
                          <small>· {{ g.role || '—' }} · {{ g.type === 'ADULT' ? 'بالغ' : 'طفل' }}</small>
                        </li>
                      </ul>
                    </div>
                    <div v-if="row.cars?.length" class="expand-block">
                      <h6>السيارات</h6>
                      <ul>
                        <li v-for="c in row.cars" :key="c.id" class="ltr">{{ c.plate_number }}</li>
                      </ul>
                    </div>
                    <div v-if="row.payments?.length" class="expand-block">
                      <h6>الدفعات</h6>
                      <ul>
                        <li v-for="(p, i) in row.payments" :key="i">{{ fmt(p.amount) }} ج.م <small>· {{ paymentLabel(p.method) }}</small></li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate } from '@/utils/date'

const route = useRoute()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

const loading = ref(true)
const bookingsLoading = ref(false)
const chalet = ref(null)
const bookings = ref([])
const expanded = reactive({})

const dateRange = reactive({ date_from: '', date_to: '' })

// utils/date.js has monthRange(year, month) but we want a current-month
// helper. Build it inline since currentMonthRange may not exist.
function currentMonthDates() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    date_from: `${first.getFullYear()}-${String(first.getMonth() + 1).padStart(2, '0')}-${String(first.getDate()).padStart(2, '0')}`,
    date_to: `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`,
  }
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

function statusLabel(s) {
  return {
    PENDING: 'في الانتظار',
    PROCESSING: 'قيد المعالجة',
    TEMPORARY: 'مؤقت',
    CONFIRMED: 'مؤكد',
    EXPIRED: 'منتهي',
    COMPLETED: 'مكتمل',
    CANCELLED: 'ملغي',
    AVAILABLE: 'متاح',
    UNAVAILABLE: 'غير متاح',
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

onMounted(() => {
  Object.assign(dateRange, currentMonthDates())
  load()
})
</script>

<style scoped>
.chalet-page { display: flex; flex-direction: column; gap: 16px; }

/* Breadcrumb */
.page-crumbs { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-size: 13px; font-weight: 600; }
.crumb { color: #94a3b8; text-decoration: none; transition: color 0.15s; }
.crumb:hover { color: #f97316; }
.crumb-current { color: #0f172a; font-weight: 700; cursor: default; }
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
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.status-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 13px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
}
.status-badge.pending { background: rgba(234, 179, 8, 0.12); color: #b45309; }
.status-badge.processing { background: rgba(14, 165, 233, 0.12); color: #0369a1; }
.status-badge.temporary { background: rgba(249, 115, 22, 0.12); color: #c2410c; }
.status-badge.confirmed, .status-badge.available { background: rgba(16, 185, 129, 0.12); color: #047857; }
.status-badge.cancelled, .status-badge.unavailable, .status-badge.expired { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
.status-badge.completed { background: rgba(100, 116, 139, 0.12); color: #475569; }

.permit-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}
.permit-badge.ok { background: rgba(16, 185, 129, 0.12); color: #047857; }
.permit-badge.pending { background: rgba(234, 179, 8, 0.12); color: #b45309; }

/* Sections */
.bf-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
.bf-section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 10px; flex-wrap: wrap; }
.bf-section-title { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; }
.bf-section-title i { color: #f97316; }
.bf-counter { margin-inline-start: 6px; padding: 3px 10px; border-radius: 999px; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; }
.bf-section-empty {
  padding: 22px; text-align: center; color: #94a3b8; font-size: 13px;
  background: #fafbfc; border: 1px dashed #e2e8f0; border-radius: 10px;
}
.bf-section-empty i { color: #f97316; margin-left: 6px; }

.sub-section { margin-top: 16px; }
.sub-title { font-size: 12.5px; font-weight: 800; color: #0f172a; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.4px; color: #475569; }

.kv-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px; }
.kv { display: flex; flex-direction: column; gap: 4px; padding: 10px 12px; background: #fafbfc; border-radius: 10px; }
.k { font-size: 11px; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.v { font-size: 13.5px; color: #0f172a; font-weight: 700; }
.v.ltr { direction: ltr; text-align: right; }

.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.gallery-item { aspect-ratio: 4 / 3; border-radius: 12px; overflow: hidden; background: #f1f5f9; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.22);
  color: #c2410c;
  font-size: 12px;
  font-weight: 700;
}

.date-filters { display: flex; gap: 10px; }
.filter-field { display: flex; flex-direction: column; gap: 5px; }
.filter-field label { font-size: 11px; font-weight: 700; color: #64748b; }
.date-input { padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 12.5px; font-family: inherit; }
.date-input:focus { outline: none; border-color: #f97316; }

.list-table { width: 100%; border-collapse: collapse; }
.list-table th { padding: 10px 12px; text-align: right; font-size: 11.5px; font-weight: 700; color: #64748b; background: #fafbfc; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; letter-spacing: 0.4px; }
.list-table td { padding: 11px 12px; font-size: 13px; color: #475569; border-bottom: 1px solid #f8fafc; }
.row.clickable { cursor: pointer; }
.row:hover { background: #fafbfc; }
.row-link { color: #0f172a; font-weight: 800; text-decoration: none; direction: ltr; display: inline-block; }
.row-link:hover { color: #f97316; }
.ltr { direction: ltr; text-align: right; }

.expand-row td { background: #fafbfc; padding: 16px; }
.expand-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 18px; }
.expand-block h6 { font-size: 12px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
.expand-block ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.expand-block li { font-size: 12.5px; color: #475569; }
.expand-block small { color: #94a3b8; }

.loading-state { padding: 60px 20px; text-align: center; color: #64748b; font-size: 14px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }

.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; text-align: center; color: #b91c1c; }
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff; font-size: 13.5px; font-weight: 700;
  text-decoration: none;
}
</style>
