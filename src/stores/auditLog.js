import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'pb_audit_log'

export const useAuditLogStore = defineStore('auditLog', () => {
  const logs = ref([])

  function init() {
    try {
      logs.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      logs.value = []
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs.value))
  }

  function logAction({ bookingId, action, securityMemberId, securityMemberName, qrState }) {
    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      bookingId,
      action,
      securityMemberId,
      securityMemberName: securityMemberName || '',
      qrState: qrState || null,
      timestamp: new Date().toISOString(),
    }
    logs.value.push(entry)
    _persist()
    return entry
  }

  function getLogsByBooking(bookingId) {
    return logs.value.filter((l) => l.bookingId === bookingId)
  }

  function getLogsByMember(memberId) {
    return logs.value.filter((l) => l.securityMemberId === memberId)
  }

  init()

  return {
    logs,
    logAction,
    getLogsByBooking,
    getLogsByMember,
  }
})
