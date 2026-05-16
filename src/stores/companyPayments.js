import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

// Backend reason phrase the spec calls out for cancelled receipts.
export const PAYMENT_REASON_CODES = {
  ALREADY_CANCELLED: 'PAYMENT_ALREADY_CANCELLED',
}

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

function reasonOf(error) {
  if (error?.response?.status !== 422) return null
  return error.response.statusText || error.response.data?.message || null
}

export const useCompanyPaymentsStore = defineStore('companyPayments', () => {
  // GET /v1/company-payments/{companyId} → { company: { id, name, balance }, payments: [...] }
  async function getForCompany(companyId) {
    try {
      const res = await api.get(`/v1/company-payments/${companyId}`)
      const data = unwrap(res) || {}
      return { ok: true, data: { company: data.company || null, payments: data.payments || [] } }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الدفعات') }
    }
  }

  // POST /v1/company-payments — body: { company_id, amount, notes }
  async function create(payload) {
    try {
      const res = await api.post('/v1/company-payments', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إضافة السند') }
    }
  }

  // PUT /v1/company-payments/{id} — body: { amount, notes }
  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/company-payments/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      const reason = reasonOf(error)
      return {
        ok: false,
        reason,
        error: reason === PAYMENT_REASON_CODES.ALREADY_CANCELLED
          ? 'هذا السند ملغى فلا يمكن تعديله'
          : getErrorMessage(error, 'تعذر تحديث السند'),
      }
    }
  }

  // PUT /v1/company-payments/{id}/cancel — soft cancel; reduces balance.
  async function cancel(id) {
    try {
      const res = await api.put(`/v1/company-payments/${id}/cancel`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      const reason = reasonOf(error)
      return {
        ok: false,
        reason,
        error: reason === PAYMENT_REASON_CODES.ALREADY_CANCELLED
          ? 'السند ملغى بالفعل'
          : getErrorMessage(error, 'تعذر إلغاء السند'),
      }
    }
  }

  return { getForCompany, create, update, cancel }
})
