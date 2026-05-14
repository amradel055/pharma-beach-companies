<template>
  <div class="permit-page">
    <div class="actions-bar no-print">
      <RouterLink :to="`/admin/village-bookings/${$route.params.id}`" class="back-link">
        <i class="pi pi-arrow-right" /> العودة للحجز
      </RouterLink>
      <button v-if="permit" class="btn-primary" @click="handlePrint">
        <i class="pi pi-print" /> طباعة
      </button>
    </div>

    <div v-if="loading" class="loading-state no-print">
      <i class="pi pi-spin pi-spinner" /> جاري التحميل...
    </div>

    <div v-else-if="!permit" class="card error-card no-print">
      <i class="pi pi-exclamation-triangle" />
      <p>التصريح غير متاح</p>
    </div>

    <div v-else class="permit-card">
      <header class="permit-header">
        <h1>التصريح الأمني</h1>
        <div class="header-meta">
          <div><span class="label">رقم التصريح</span><span class="value ltr">{{ permit.permit_number }}</span></div>
          <div><span class="label">رقم الطلب</span><span class="value ltr">{{ permit.request_number }}</span></div>
          <div><span class="label">كود الحجز</span><span class="value ltr">{{ permit.booking_code }}</span></div>
        </div>
        <div class="header-meta">
          <div><span class="label">التاريخ</span><span class="value">{{ toDisplayDateTime(permit.created_at) }}</span></div>
          <div><span class="label">المُؤكِّد</span><span class="value">{{ permit.confirmed_by || '—' }}</span></div>
        </div>
      </header>

      <section class="two-col">
        <div class="info-block">
          <h2>بيانات الشاليه</h2>
          <table class="info-table">
            <tbody>
              <tr><td>الكود</td><td class="ltr">{{ permit.chalet?.chalet_code || '—' }}</td></tr>
              <tr><td>الرقم</td><td class="ltr">{{ permit.chalet?.chalet_number || '—' }}</td></tr>
              <tr><td>رقم الوحدة</td><td class="ltr">{{ permit.chalet?.unit_number || '—' }}</td></tr>
              <tr><td>الطابق</td><td>{{ permit.chalet?.floor || '—' }}</td></tr>
              <tr><td>المساحة</td><td>{{ permit.chalet?.area || '—' }}</td></tr>
              <tr><td>المجموعة</td><td>{{ permit.chalet?.group_name || '—' }}</td></tr>
              <tr><td>المالك</td><td>{{ permit.chalet?.owner_name || '—' }}</td></tr>
              <tr><td>الشركة</td><td>{{ permit.chalet?.company_name || '—' }}</td></tr>
              <tr><td>الوسيط</td><td>{{ permit.chalet?.delegator_name || '—' }}</td></tr>
              <tr><td>الحد الأقصى للضيوف</td><td>{{ permit.chalet?.max_guests || '—' }}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="info-block">
          <h2>الملخص المالي</h2>
          <table class="info-table">
            <tbody>
              <tr><td>الدخول</td><td>{{ toDisplayDate(permit.financial?.check_in) }}</td></tr>
              <tr><td>الخروج</td><td>{{ toDisplayDate(permit.financial?.check_out) }}</td></tr>
              <tr><td>الليالي</td><td>{{ permit.financial?.nights || 0 }}</td></tr>
              <tr><td>إجمالي الليالي</td><td>{{ fmt(permit.financial?.nights_total) }} ج.م</td></tr>
              <tr><td>تصريح أمني</td><td>{{ fmt(permit.financial?.security_permit_price) }} ج.م</td></tr>
              <tr><td>تصريح إلكتروني</td><td>{{ fmt(permit.financial?.electronic_permit_price) }} ج.م</td></tr>
              <tr><td>أفراد إضافيون</td><td>{{ permit.financial?.extra_guest_count || 0 }} = {{ fmt(permit.financial?.extra_guest_total) }} ج.م</td></tr>
              <tr><td>السيارات</td><td>{{ permit.financial?.cars_count || 0 }} = {{ fmt(permit.financial?.car_price_total) }} ج.م</td></tr>
              <tr><td>الخصم</td><td>{{ fmt(permit.financial?.discount_amount) }} ج.م</td></tr>
              <tr class="total"><td>الإجمالي</td><td>{{ fmt(permit.financial?.total) }} ج.م</td></tr>
              <tr><td>طريقة الدفع</td><td>{{ paymentLabel(permit.financial?.payment_type) }}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="block">
        <h2>الضيوف ({{ permit.guests?.length || 0 }})</h2>
        <div v-if="!permit.guests?.length" class="empty-mini">لا يوجد ضيوف</div>
        <table v-else class="list-table">
          <thead>
            <tr><th>الاسم</th><th>الرقم القومي</th><th>الصفة</th><th>النوع</th></tr>
          </thead>
          <tbody>
            <tr v-for="(g, i) in permit.guests" :key="i">
              <td>{{ g.name }}</td>
              <td class="ltr">{{ g.identity_number || '—' }}</td>
              <td>{{ g.role || '—' }}</td>
              <td>{{ g.type === 'ADULT' ? 'بالغ' : g.type === 'CHILD' ? 'طفل' : g.type }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="block">
        <h2>السيارات ({{ permit.cars?.length || 0 }})</h2>
        <div v-if="!permit.cars?.length" class="empty-mini">لا توجد سيارات</div>
        <table v-else class="list-table">
          <thead><tr><th>رقم اللوحة</th></tr></thead>
          <tbody>
            <tr v-for="(c, i) in permit.cars" :key="i">
              <td class="ltr">{{ c.plate_number }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <footer class="permit-footer">
        <div class="sig">
          <div class="sig-line"></div>
          <span>توقيع المسؤول</span>
        </div>
        <div class="sig">
          <div class="sig-line"></div>
          <span>توقيع الأمن</span>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCsBookingsStore } from '@/stores/csBookings'
import { useToastStore } from '@/stores/toast'
import { toDisplayDate, toDisplayDateTime } from '@/utils/date'

const route = useRoute()
const csBookings = useCsBookingsStore()
const toast = useToastStore()

const loading = ref(true)
const permit = ref(null)

async function load() {
  loading.value = true
  const r = await csBookings.getPermit(route.params.id)
  loading.value = false
  if (r.ok) permit.value = r.data
  else toast.error(r.error)
}

function paymentLabel(p) {
  return {
    CASH: 'نقدي',
    BANK: 'تحويل بنكي',
    WITHDRAW_BALANCE: 'خصم من الرصيد',
  }[p] || p || '—'
}

function fmt(n) { return Number(n || 0).toLocaleString('ar-EG') }

function handlePrint() { window.print() }

onMounted(load)
</script>

<style scoped>
.permit-page { display: flex; flex-direction: column; gap: 16px; }

.actions-bar { display: flex; justify-content: space-between; align-items: center; }
.back-link { display: inline-flex; align-items: center; gap: 6px; color: #64748b; font-size: 13px; font-weight: 700; text-decoration: none; }
.back-link:hover { color: #f97316; }
.btn-primary {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff; font-size: 13.5px; font-weight: 700;
  border: none; cursor: pointer;
  box-shadow: 0 2px 10px rgba(14, 165, 233, 0.35);
}
.btn-primary:hover { transform: translateY(-1px); }

.permit-card {
  background: #fff; border: 2px solid #0f172a; border-radius: 14px;
  padding: 28px; max-width: 900px; margin: 0 auto; width: 100%;
}

.permit-header { text-align: center; padding-bottom: 18px; border-bottom: 2px solid #0f172a; margin-bottom: 20px; }
.permit-header h1 { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 14px; }
.header-meta { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 14px; margin-top: 8px; }
.header-meta > div { display: flex; flex-direction: column; gap: 2px; }
.header-meta .label { font-size: 11px; color: #64748b; font-weight: 700; }
.header-meta .value { font-size: 13.5px; color: #0f172a; font-weight: 800; }
.ltr { direction: ltr; }

.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 18px; }
.info-block, .block { padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; }
.info-block h2, .block h2 { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }

.info-table { width: 100%; border-collapse: collapse; }
.info-table td { padding: 7px 0; font-size: 12.5px; }
.info-table td:first-child { color: #64748b; font-weight: 500; width: 50%; }
.info-table td:last-child { color: #0f172a; font-weight: 700; text-align: left; }
.info-table tr.total td { font-size: 14px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
.info-table tr.total td:last-child { color: #ea580c; }

.block { margin-bottom: 14px; }
.list-table { width: 100%; border-collapse: collapse; }
.list-table th { padding: 8px 10px; text-align: right; font-size: 11.5px; font-weight: 700; color: #64748b; background: #fafbfc; border: 1px solid #e2e8f0; }
.list-table td { padding: 8px 10px; font-size: 12.5px; color: #0f172a; border: 1px solid #e2e8f0; }

.empty-mini { padding: 12px; text-align: center; color: #94a3b8; font-size: 13px; }

.permit-footer { display: flex; justify-content: space-around; gap: 60px; margin-top: 40px; padding-top: 24px; }
.sig { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }
.sig-line { width: 100%; max-width: 220px; height: 1px; background: #0f172a; margin-bottom: 4px; }
.sig span { font-size: 12px; color: #475569; font-weight: 700; }

.card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 18px; }
.error-card { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 20px; text-align: center; color: #b91c1c; }
.error-card i { font-size: 28px; }
.error-card p { margin: 0; font-size: 14px; }

.loading-state { padding: 60px 20px; text-align: center; color: #64748b; font-size: 14px; }
.loading-state i { font-size: 18px; margin-left: 8px; color: #f97316; }

@media (max-width: 720px) {
  .two-col { grid-template-columns: 1fr; }
}

/* Print styles — hide chrome, render only the permit card */
@media print {
  :global(.sidebar),
  :global(.topbar),
  :global(.edge-toggle),
  .no-print { display: none !important; }
  :global(body),
  :global(.dashboard-content),
  :global(.dashboard-main) {
    background: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  .permit-page { gap: 0; padding: 0; }
  .permit-card {
    border: 1px solid #0f172a;
    box-shadow: none;
    max-width: 100%;
    padding: 16px;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  .permit-header { page-break-after: avoid; }
  .block, .info-block { page-break-inside: avoid; }
}
</style>
