<template>
  <div class="permits-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">تصاريحي</h1>
        <p class="page-desc">عرض التصاريح الخاصة بحجوزاتك</p>
      </div>
    </div>

    <div class="table-card">
      <div v-if="permits.length === 0" class="empty-state">
        <div class="empty-icon"><i class="pi pi-id-card" /></div>
        <h3>لا توجد تصاريح</h3>
        <p>لا توجد تصاريح مرتبطة بحجوزاتك حالياً</p>
      </div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th>رقم الطلب</th>
            <th>الشاليه</th>
            <th>تسجيل الدخول</th>
            <th>تسجيل الخروج</th>
            <th>الليالي</th>
            <th>الحالة</th>
            <th>التصريح</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in permits" :key="p.id" class="table-row">
            <td><span class="order-id">#{{ p.id.slice(-6).toUpperCase() }}</span></td>
            <td>
              <div class="chalet-cell">
                <span class="ch-name">{{ p.chaletName }}</span>
                <span class="ch-num">{{ p.chaletNumber }}</span>
              </div>
            </td>
            <td>{{ fmtDate(p.checkIn) }}</td>
            <td>{{ fmtDate(p.checkOut) }}</td>
            <td>{{ p.nights }}</td>
            <td>
              <span :class="['status-badge', p.status.toLowerCase()]">
                {{ statusLabel(p.status) }}
              </span>
            </td>
            <td>
              <button v-if="p.status === 'CONFIRMED'" class="qr-btn" @click="showPermit(p)">
                <i class="pi pi-qrcode" /> عرض التصريح
              </button>
              <span v-else class="no-permit">غير متاح</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Permit Modal -->
    <AppModal v-model="permitModalOpen" title="تصريح الدخول" icon="pi pi-qrcode" icon-color="#10b981" icon-bg="rgba(16,185,129,0.08)" size="sm">
      <div v-if="selectedPermit" class="permit-content">
        <div class="permit-info">
          <div class="pi-row"><span class="pi-label">الشاليه</span><span>{{ selectedPermit.chaletName }}</span></div>
          <div class="pi-row"><span class="pi-label">الرقم</span><span>{{ selectedPermit.chaletNumber }}</span></div>
          <div class="pi-row"><span class="pi-label">الدخول</span><span>{{ fmtDate(selectedPermit.checkIn) }}</span></div>
          <div class="pi-row"><span class="pi-label">الخروج</span><span>{{ fmtDate(selectedPermit.checkOut) }}</span></div>
        </div>
        <div class="permit-qr">
          <img v-if="permitQr" :src="permitQr" alt="QR" class="permit-qr-img" />
          <div v-else class="qr-loading"><i class="pi pi-spin pi-spinner" /></div>
        </div>
      </div>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'
import { usePermissions } from '@/composables/usePermissions'
import { ROLES } from '@/constants/roles'
import QRCode from 'qrcode'
import AppModal from '@/components/ui/AppModal.vue'

const auth = useAuthStore()
const bookingsStore = useBookingsStore()
const { hasRole } = usePermissions()

const permits = computed(() => {
  if (hasRole(ROLES.SITE_ADMIN) || hasRole(ROLES.VILLAGE_ADMIN) || hasRole(ROLES.VILLAGE_CS)) {
    // Admin/CS see all confirmed bookings as permits
    return bookingsStore.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'TEMPORARY' || b.status === 'PENDING')
  }
  // Agent sees only their bookings
  return bookingsStore.bookings.filter((b) => b.agentId === auth.user?.id)
})

const selectedPermit = ref(null)
const permitModalOpen = computed({ get: () => !!selectedPermit.value, set: (v) => { if (!v) selectedPermit.value = null } })
const permitQr = ref('')

async function showPermit(booking) {
  selectedPermit.value = booking
  permitQr.value = ''
  try {
    const data = JSON.stringify({
      bookingId: booking.id,
      chalet: booking.chaletName,
      chaletNumber: booking.chaletNumber,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    })
    permitQr.value = await QRCode.toDataURL(data, { width: 220, margin: 2 })
  } catch { /* */ }
}

function statusLabel(s) {
  return { PENDING: 'مؤقت', PROCESSING: 'قيد المعالجة', TEMPORARY: 'مؤقت', CONFIRMED: 'مؤكد' }[s] || s
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

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

.status-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.status-badge.pending, .status-badge.temporary { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.status-badge.processing { background: rgba(14, 165, 233, 0.08); color: #0ea5e9; }
.status-badge.confirmed { background: rgba(16, 185, 129, 0.08); color: #10b981; }

.qr-btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; background: rgba(16, 185, 129, 0.08); color: #10b981; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.qr-btn:hover { background: rgba(16, 185, 129, 0.15); }
.no-permit { font-size: 12.5px; color: #94a3b8; }

.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-state h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-state p { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Permit Modal */
.permit-content { text-align: center; }
.permit-info { margin-bottom: 20px; }
.pi-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f8fafc; font-size: 13.5px; }
.pi-row:last-child { border-bottom: none; }
.pi-label { color: #94a3b8; }
.permit-qr { margin-top: 16px; }
.permit-qr-img { width: 180px; height: 180px; border-radius: 12px; border: 1px solid #f1f5f9; }
.qr-loading { padding: 40px; color: #94a3b8; font-size: 20px; }
</style>
