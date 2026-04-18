<template>
  <div class="approvals-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">طلبات الاعتماد</h1>
        <p class="page-desc">مراجعة واعتماد أو رفض التعديلات المعلقة</p>
      </div>
      <div class="header-stats">
        <span class="hstat pending">{{ pendingCount }} معلق</span>
        <span class="hstat approved">{{ approvedCount }} معتمد</span>
        <span class="hstat rejected">{{ rejectedCount }} مرفوض</span>
      </div>
    </div>

    <!-- Filter -->
    <div class="filters-card">
      <div class="filters-row">
        <AppDropdown v-model="filterStatus" :options="statusOptions" placeholder="كل الحالات" />
        <AppDropdown v-model="filterType" :options="typeOptions" placeholder="كل الأنواع" />
      </div>
    </div>

    <!-- List -->
    <div v-if="filtered.length === 0" class="empty-card">
      <div class="empty-icon"><i class="pi pi-check-circle" /></div>
      <h3>لا توجد طلبات</h3>
      <p>{{ filterStatus || filterType ? 'لا توجد نتائج مطابقة' : 'لا توجد طلبات اعتماد حالياً' }}</p>
    </div>

    <div v-for="a in filtered" :key="a.id" class="approval-card">
      <div class="approval-header">
        <div class="approval-type">
          <i :class="typeIcon(a.type)" />
          <span>{{ typeLabel(a.type) }}</span>
        </div>
        <span :class="['approval-status', a.status]">{{ statusLabelMap[a.status] }}</span>
      </div>

      <div class="approval-body">
        <div class="approval-meta">
          <span><i class="pi pi-user" /> {{ a.submitterName || 'غير معروف' }}</span>
          <span><i class="pi pi-calendar" /> {{ formatDate(a.createdAt) }}</span>
        </div>

        <!-- Proposed Data Preview -->
        <div class="data-preview">
          <h5>البيانات المقترحة:</h5>
          <div class="data-grid">
            <div v-for="(val, key) in previewFields(a.proposedData)" :key="key" class="data-item">
              <span class="data-key">{{ key }}</span>
              <span class="data-val">{{ val }}</span>
            </div>
          </div>
        </div>

        <!-- Rejection Reason -->
        <div v-if="a.status === 'rejected' && a.rejectionReason" class="reject-reason">
          <i class="pi pi-info-circle" /> سبب الرفض: {{ a.rejectionReason }}
        </div>

        <!-- Review Info -->
        <div v-if="a.reviewedAt" class="review-info">
          <span>بواسطة: {{ a.reviewerName }}</span>
          <span>{{ formatDate(a.reviewedAt) }}</span>
        </div>
      </div>

      <!-- Actions (pending only) -->
      <div v-if="a.status === 'pending'" class="approval-actions">
        <button class="btn-approve" @click="handleApprove(a)">
          <i class="pi pi-check" /> اعتماد
        </button>
        <button class="btn-reject" @click="openReject(a)">
          <i class="pi pi-times" /> رفض
        </button>
      </div>
    </div>

    <!-- Reject Modal -->
    <AppModal v-model="rejectOpen" title="رفض الطلب" subtitle="هل أنت متأكد من رفض هذا الطلب؟" icon="pi pi-times-circle" icon-color="#ef4444" icon-bg="rgba(239,68,68,0.08)" size="sm">
      <div class="field">
        <label>سبب الرفض (اختياري)</label>
        <textarea v-model="rejectReason" rows="3" placeholder="اكتب سبب الرفض..." />
      </div>
      <template #footer>
        <button class="btn-cancel" @click="rejectOpen = false">إلغاء</button>
        <button class="btn-danger" @click="confirmReject"><i class="pi pi-times" /> رفض</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useApprovalsStore } from '@/stores/approvals'
import { useChaletsStore } from '@/stores/chalets'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppModal from '@/components/ui/AppModal.vue'

const approvalsStore = useApprovalsStore()
const chaletsStore = useChaletsStore()
const auth = useAuthStore()
const toast = useToastStore()

const filterStatus = ref('')
const filterType = ref('')

const statusOptions = [
  { value: '', label: 'كل الحالات' },
  { value: 'pending', label: 'معلق', dot: '#eab308' },
  { value: 'approved', label: 'معتمد', dot: '#10b981' },
  { value: 'rejected', label: 'مرفوض', dot: '#ef4444' },
]

const typeOptions = [
  { value: '', label: 'كل الأنواع' },
  { value: 'chalet_create', label: 'إنشاء شاليه' },
  { value: 'chalet_edit', label: 'تعديل شاليه' },
  { value: 'rating_change', label: 'تغيير تقييم' },
]

const statusLabelMap = { pending: 'معلق', approved: 'معتمد', rejected: 'مرفوض' }

const filtered = computed(() => approvalsStore.getAll({ status: filterStatus.value, type: filterType.value }))
const pendingCount = computed(() => approvalsStore.getAll({ status: 'pending' }).length)
const approvedCount = computed(() => approvalsStore.getAll({ status: 'approved' }).length)
const rejectedCount = computed(() => approvalsStore.getAll({ status: 'rejected' }).length)

function typeLabel(t) {
  return { chalet_create: 'إنشاء شاليه', chalet_edit: 'تعديل شاليه', rating_change: 'تغيير تقييم' }[t] || t
}
function typeIcon(t) {
  return { chalet_create: 'pi pi-plus-circle', chalet_edit: 'pi pi-pen-to-square', rating_change: 'pi pi-star' }[t] || 'pi pi-file'
}
function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function previewFields(data) {
  if (!data) return {}
  const pick = {}
  if (data.name) pick['الاسم'] = data.name
  if (data.chaletNumber) pick['الرقم'] = data.chaletNumber
  if (data.price) pick['السعر'] = `${data.price} ج.م`
  if (data.rentalFee) pick['رسوم القرية'] = `${data.rentalFee} ج.م`
  if (data.floor) pick['الدور'] = data.floor
  if (data.rating) pick['التقييم'] = data.rating
  return pick
}

function handleApprove(a) {
  const result = approvalsStore.approve(a.id, auth.user?.id, auth.user?.name)
  if (result.ok) {
    if (a.type === 'chalet_create' || a.type === 'chalet_edit') {
      chaletsStore.updateStatus(a.entityId, 'published')
      if (a.proposedData) chaletsStore.update(a.entityId, a.proposedData)
    } else if (a.type === 'rating_change') {
      // Apply rating change (Story H4)
      if (a.proposedData?.rating !== undefined) {
        chaletsStore.update(a.entityId, { rating: a.proposedData.rating })
      }
    }
    toast.success('تم الاعتماد بنجاح')
  }
}

// Reject
const rejectTarget = ref(null)
const rejectOpen = computed({ get: () => !!rejectTarget.value, set: (v) => { if (!v) rejectTarget.value = null } })
const rejectReason = ref('')

function openReject(a) { rejectTarget.value = a; rejectReason.value = '' }
function confirmReject() {
  if (!rejectTarget.value) return
  const result = approvalsStore.reject(rejectTarget.value.id, auth.user?.id, auth.user?.name, rejectReason.value)
  if (result.ok) {
    chaletsStore.updateStatus(rejectTarget.value.entityId, 'draft')
    toast.success('تم رفض الطلب')
  }
  rejectTarget.value = null
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }
.header-stats { display: flex; gap: 8px; }
.hstat { padding: 6px 14px; border-radius: 8px; font-size: 12.5px; font-weight: 600; }
.hstat.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.hstat.approved { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.hstat.rejected { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

.filters-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; margin-bottom: 16px; }
.filters-row { display: flex; gap: 12px; }

.empty-card { text-align: center; padding: 60px 20px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.empty-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
.empty-icon i { font-size: 28px; color: #94a3b8; }
.empty-card h3 { font-size: 16px; font-weight: 700; color: #1e293b; margin: 0 0 6px; }
.empty-card p { font-size: 13.5px; color: #94a3b8; margin: 0; }

.approval-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; margin-bottom: 12px; overflow: hidden; transition: all 0.15s; }
.approval-card:hover { border-color: #e2e8f0; }

.approval-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f8fafc; }
.approval-type { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: #1e293b; }
.approval-type i { font-size: 16px; color: #f97316; }
.approval-status { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.approval-status.pending { background: rgba(234, 179, 8, 0.08); color: #eab308; }
.approval-status.approved { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.approval-status.rejected { background: rgba(239, 68, 68, 0.08); color: #ef4444; }

.approval-body { padding: 16px 20px; }
.approval-meta { display: flex; gap: 20px; margin-bottom: 14px; font-size: 13px; color: #64748b; }
.approval-meta i { font-size: 13px; margin-left: 4px; }

.data-preview { margin-bottom: 12px; }
.data-preview h5 { font-size: 12.5px; font-weight: 600; color: #64748b; margin: 0 0 8px; }
.data-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.data-item { background: #f8fafc; border-radius: 8px; padding: 6px 12px; display: flex; gap: 6px; font-size: 12.5px; }
.data-key { color: #94a3b8; font-weight: 500; }
.data-val { color: #1e293b; font-weight: 600; }

.reject-reason { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #ef4444; margin-top: 8px; }
.reject-reason i { margin-left: 4px; }
.review-info { display: flex; gap: 16px; font-size: 12px; color: #94a3b8; margin-top: 8px; }

.approval-actions { display: flex; gap: 8px; padding: 14px 20px; border-top: 1px solid #f8fafc; }
.btn-approve { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; background: #10b981; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-approve:hover { background: #059669; }
.btn-reject { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; background: rgba(239, 68, 68, 0.08); color: #ef4444; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-reject:hover { background: rgba(239, 68, 68, 0.15); }

/* Modal */
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.field textarea { padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; resize: vertical; transition: all 0.2s; }
.field textarea:focus { border-color: #f97316; background: #fff; }
.field textarea::placeholder { color: #94a3b8; }
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-danger { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #ef4444; color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-danger:hover { background: #dc2626; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .header-stats { flex-wrap: wrap; }
  .filters-row { flex-direction: column; }
  .approval-meta { flex-direction: column; gap: 6px; }
}
</style>
