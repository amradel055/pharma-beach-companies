import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'pb_approvals'

export const useApprovalsStore = defineStore('approvals', () => {
  const approvals = ref([])

  function init() {
    try {
      approvals.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      approvals.value = []
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(approvals.value))
  }

  // type: 'chalet_create' | 'chalet_edit' | 'rating_change'
  function createApproval({ type, entityId, proposedData, previousData, submitterId, submitterName }) {
    const approval = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      type,
      entityId,
      proposedData,
      previousData: previousData || null,
      status: 'pending',
      submitterId,
      submitterName: submitterName || '',
      reviewerId: null,
      reviewerName: null,
      rejectionReason: '',
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    }

    approvals.value.unshift(approval)
    _persist()
    return { ok: true, approval }
  }

  function approve(id, reviewerId, reviewerName) {
    const item = approvals.value.find((a) => a.id === id)
    if (!item) return { ok: false, error: 'الطلب غير موجود' }
    if (item.status !== 'pending') return { ok: false, error: 'تم مراجعة هذا الطلب مسبقاً' }

    item.status = 'approved'
    item.reviewerId = reviewerId
    item.reviewerName = reviewerName || ''
    item.reviewedAt = new Date().toISOString()
    _persist()
    return { ok: true, approval: item }
  }

  function reject(id, reviewerId, reviewerName, reason = '') {
    const item = approvals.value.find((a) => a.id === id)
    if (!item) return { ok: false, error: 'الطلب غير موجود' }
    if (item.status !== 'pending') return { ok: false, error: 'تم مراجعة هذا الطلب مسبقاً' }

    item.status = 'rejected'
    item.reviewerId = reviewerId
    item.reviewerName = reviewerName || ''
    item.rejectionReason = reason
    item.reviewedAt = new Date().toISOString()
    _persist()
    return { ok: true, approval: item }
  }

  function getAll({ status = '', type = '' } = {}) {
    return approvals.value.filter((a) => {
      if (status && a.status !== status) return false
      if (type && a.type !== type) return false
      return true
    })
  }

  function getById(id) {
    return approvals.value.find((a) => a.id === id) || null
  }

  const pendingCount = computed(() => approvals.value.filter((a) => a.status === 'pending').length)

  init()

  return {
    approvals,
    pendingCount,
    getAll,
    getById,
    createApproval,
    approve,
    reject,
  }
})
