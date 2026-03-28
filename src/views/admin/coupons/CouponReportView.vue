<template>
  <div class="report-page">
    <div class="page-header">
      <div class="page-header-right">
        <RouterLink to="/admin/coupons" class="back-link"><i class="pi pi-arrow-right" /></RouterLink>
        <div>
          <h1 class="page-title">تقرير استخدام الكوبونات</h1>
          <p class="page-desc">متابعة أداء الكوبونات وإجمالي الخصومات المطبقة</p>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="stats-row">
      <div class="mini-stat" style="--accent: #8b5cf6">
        <div class="mini-stat-icon"><i class="pi pi-tag" /></div>
        <div class="mini-stat-info">
          <span class="mini-stat-value">{{ couponsStore.coupons.length }}</span>
          <span class="mini-stat-label">إجمالي الكوبونات</span>
        </div>
      </div>
      <div class="mini-stat" style="--accent: #f97316">
        <div class="mini-stat-icon"><i class="pi pi-chart-bar" /></div>
        <div class="mini-stat-info">
          <span class="mini-stat-value">{{ couponsStore.totalUsage }}</span>
          <span class="mini-stat-label">إجمالي الاستخدام</span>
        </div>
      </div>
      <div class="mini-stat" style="--accent: #10b981">
        <div class="mini-stat-icon"><i class="pi pi-wallet" /></div>
        <div class="mini-stat-info">
          <span class="mini-stat-value">{{ fmtNum(totalDiscounts) }}</span>
          <span class="mini-stat-label">إجمالي الخصومات (ج.م)</span>
        </div>
      </div>
      <div class="mini-stat" style="--accent: #0ea5e9">
        <div class="mini-stat-icon"><i class="pi pi-percentage" /></div>
        <div class="mini-stat-info">
          <span class="mini-stat-value">{{ avgDiscount }}%</span>
          <span class="mini-stat-label">متوسط نسبة الخصم</span>
        </div>
      </div>
    </div>

    <!-- Per-Coupon Breakdown -->
    <div class="table-card">
      <div class="table-header">
        <h3><i class="pi pi-list" /> تفصيل الكوبونات</h3>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>الكود</th>
            <th>النوع</th>
            <th>القيمة</th>
            <th>عدد الاستخدام</th>
            <th>إجمالي الخصومات</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in reportRows" :key="r.id" class="table-row">
            <td><span class="coupon-code">{{ r.code }}</span></td>
            <td>{{ r.type === 'percent' ? 'نسبة' : 'ثابت' }}</td>
            <td class="cell-val">{{ r.type === 'percent' ? r.value + '%' : fmtNum(r.value) + ' ج.م' }}</td>
            <td class="cell-center">
              <span class="usage-pill">{{ r.usageCount }}</span>
            </td>
            <td class="cell-val green">{{ fmtNum(r.totalDiscount) }} ج.م</td>
            <td>
              <span :class="['status-tag', r.statusClass]">{{ r.statusLabel }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Bookings with coupons -->
    <div class="table-card" style="margin-top: 16px">
      <div class="table-header">
        <h3><i class="pi pi-calendar" /> الحجوزات التي استخدمت كوبونات</h3>
      </div>

      <div v-if="couponBookings.length === 0" class="empty-msg">لا توجد حجوزات مرتبطة بكوبونات</div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>رقم الحجز</th>
            <th>الشاليه</th>
            <th>الكوبون</th>
            <th>قيمة الخصم</th>
            <th>إجمالي الحجز</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in couponBookings" :key="b.id" class="table-row">
            <td><span class="order-id">#{{ b.id.slice(-6).toUpperCase() }}</span></td>
            <td>{{ b.chaletName }}</td>
            <td><span class="coupon-code sm">{{ b.couponCode }}</span></td>
            <td class="cell-val green">{{ fmtNum(b.discountAmount) }} ج.م</td>
            <td class="cell-val">{{ fmtNum(b.total) }} ج.م</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCouponsStore } from '@/stores/coupons'
import { useBookingsStore } from '@/stores/bookings'

const couponsStore = useCouponsStore()
const bookingsStore = useBookingsStore()

const couponBookings = computed(() =>
  bookingsStore.bookings.filter((b) => b.couponId || b.couponCode)
)

const totalDiscounts = computed(() =>
  couponBookings.value.reduce((s, b) => s + Number(b.discountAmount || 0), 0)
)

const avgDiscount = computed(() => {
  const percents = couponsStore.coupons.filter((c) => c.type === 'percent' && c.usageCount > 0)
  if (percents.length === 0) return 0
  return Math.round(percents.reduce((s, c) => s + c.value, 0) / percents.length)
})

const reportRows = computed(() => {
  return couponsStore.coupons.map((c) => {
    const bookings = couponBookings.value.filter((b) => b.couponId === c.id || b.couponCode === c.code)
    const totalDiscount = bookings.reduce((s, b) => s + Number(b.discountAmount || 0), 0)
    const isExpired = new Date(c.endDate) < new Date()
    return {
      ...c,
      totalDiscount,
      statusClass: isExpired ? 'expired' : (c.active ? 'active' : 'inactive'),
      statusLabel: isExpired ? 'منتهي' : (c.active ? 'مفعل' : 'معطل'),
    }
  })
})

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-header-right { display: flex; align-items: center; gap: 14px; }
.back-link { width: 40px; height: 40px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fff; display: flex; align-items: center; justify-content: center; color: #475569; text-decoration: none; transition: all 0.15s; flex-shrink: 0; }
.back-link:hover { background: #f8fafc; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
.mini-stat { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; }
.mini-stat-icon { width: 40px; height: 40px; border-radius: 10px; background: color-mix(in srgb, var(--accent) 10%, transparent); display: flex; align-items: center; justify-content: center; }
.mini-stat-icon i { font-size: 18px; color: var(--accent); }
.mini-stat-value { display: block; font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1; }
.mini-stat-label { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }

.table-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
.table-header { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.table-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.table-header h3 i { color: #f97316; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 12px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.data-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.table-row:hover { background: #fafbfc; }
.table-row:last-child td { border-bottom: none; }

.coupon-code { font-weight: 700; color: #1e293b; background: rgba(249, 115, 22, 0.06); padding: 4px 10px; border-radius: 6px; font-size: 13px; direction: ltr; display: inline-block; letter-spacing: 0.5px; }
.coupon-code.sm { font-size: 12px; padding: 3px 8px; }
.order-id { font-weight: 700; color: #1e293b; font-size: 13px; direction: ltr; display: inline-block; }
.cell-val { font-weight: 600; }
.cell-center { text-align: center; }
.green { color: #10b981; }

.usage-pill { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 24px; padding: 0 8px; border-radius: 6px; background: rgba(249, 115, 22, 0.08); color: #f97316; font-weight: 700; font-size: 13px; }

.status-tag { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.status-tag.active { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.status-tag.inactive { background: rgba(239, 68, 68, 0.08); color: #ef4444; }
.status-tag.expired { background: rgba(148, 163, 184, 0.08); color: #94a3b8; }

.empty-msg { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; }

@media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .stats-row { grid-template-columns: 1fr 1fr; gap: 8px; } }
</style>
