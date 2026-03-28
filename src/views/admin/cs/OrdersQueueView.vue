<template>
  <div class="orders-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">الطلبات</h1>
        <p class="page-desc">استقبال ومعالجة طلبات الحجز</p>
      </div>
      <div class="queue-stats">
        <span class="qs pending"><i class="pi pi-clock" /> {{ pendingCount }} في الانتظار</span>
        <span class="qs processing"><i class="pi pi-spin pi-spinner" /> {{ processingCount }} قيد المعالجة</span>
        <span class="qs confirmed"><i class="pi pi-check" /> {{ confirmedCount }} مؤكد</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="orders.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-inbox" /></div>
        <h3>لا توجد طلبات</h3>
        <p>لا توجد طلبات حجز حالياً</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>الشاليه</th>
            <th>المدة</th>
            <th>القيمة الإيجارية</th>
            <th>الحالة</th>
            <th>الوقت المنقضي</th>
            <th>الإجراء</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="table-row">
            <td><span class="order-id">#{{ order.id.slice(-6).toUpperCase() }}</span></td>
            <td>
              <div class="chalet-cell">
                <span class="ch-name">{{ order.chaletName }}</span>
                <span class="ch-num">{{ order.chaletNumber }}</span>
              </div>
            </td>
            <td>{{ order.nights }} ليلة</td>
            <td class="cell-val">{{ fmtNum(order.total) }} <small>ج.م</small></td>
            <td>
              <span :class="['status-badge', order.status.toLowerCase()]">{{ statusLabel(order.status) }}</span>
            </td>
            <td>
              <OrderTimer :created-at="order.createdAt" />
            </td>
            <td>
              <RouterLink v-if="order.status !== 'CONFIRMED'" :to="`/admin/orders/${order.id}`" class="start-btn">
                <i class="pi pi-play" /> {{ order.status === 'PENDING' ? 'ابدأ' : 'متابعة' }}
              </RouterLink>
              <RouterLink v-else :to="`/admin/orders/${order.id}`" class="view-btn">
                <i class="pi pi-eye" /> عرض
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useOrdersStore } from '@/stores/orders'
import OrderTimer from '@/components/admin/cs/OrderTimer.vue'

const ordersStore = useOrdersStore()

const orders = computed(() => ordersStore.queue)
const pendingCount = computed(() => orders.value.filter((o) => o.status === 'PENDING').length)
const processingCount = computed(() => orders.value.filter((o) => o.status === 'PROCESSING' || o.status === 'TEMPORARY').length)
const confirmedCount = computed(() => orders.value.filter((o) => o.status === 'CONFIRMED').length)

function statusLabel(s) {
  return { PENDING: 'في الانتظار', PROCESSING: 'قيد المعالجة', TEMPORARY: 'حجز مؤقت', CONFIRMED: 'مؤكد' }[s] || s
}

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.queue-stats { display: flex; gap: 8px; }
.qs { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 10px; font-size: 12.5px; font-weight: 600; }
.qs.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.qs.processing { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
.qs.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.qs i { font-size: 13px; }

.table-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { padding: 14px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.data-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.table-row { transition: background 0.15s; }
.table-row:hover { background: #fafbfc; }
.table-row:last-child td { border-bottom: none; }

.order-id { font-weight: 700; color: #1e293b; font-size: 13px; direction: ltr; display: inline-block; }
.chalet-cell { display: flex; flex-direction: column; gap: 2px; }
.ch-name { font-weight: 600; color: #1e293b; }
.ch-num { font-size: 12px; color: #94a3b8; }
.cell-val { font-weight: 600; }
.cell-val small { font-size: 11px; color: #94a3b8; }

.status-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.status-badge.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.status-badge.processing { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
.status-badge.temporary { background: rgba(249, 115, 22, 0.08); color: #f97316; }
.status-badge.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }

.start-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border-radius: 8px; font-size: 12.5px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.start-btn:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(249, 115, 22, 0.25); }
.start-btn i { font-size: 11px; }

.view-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; background: rgba(16, 185, 129, 0.08); color: #10b981; border-radius: 8px; font-size: 12.5px; font-weight: 600; text-decoration: none; transition: all 0.15s; }
.view-btn:hover { background: rgba(16, 185, 129, 0.15); }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-state p { font-size: 13.5px; color: #94a3b8; margin: 0; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .queue-stats { flex-wrap: wrap; }
  .table-card { overflow-x: auto; }
  .data-table { min-width: 650px; }
  .data-table th, .data-table td { padding: 10px 12px; font-size: 12.5px; }
}
</style>
