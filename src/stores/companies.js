import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

function cleanParams(params = {}) {
  const out = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = v
  }
  return out
}

export const useCompaniesStore = defineStore('companies', () => {
  // GET /v1/companies?page=0&limit=10&search=
  async function list({ page = 1, limit = 10, search } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/companies', { params: cleanParams({ page: apiPage, limit, search }) })
      const payload = unwrap(res)
      if (payload && Array.isArray(payload.data)) {
        return {
          ok: true,
          data: {
            rows: payload.data,
            page: payload.current_page ?? 1,
            lastPage: payload.last_page ?? 1,
            perPage: payload.per_page || limit,
            total: payload.total ?? payload.data.length,
            from: payload.from || 0,
            to: payload.to || payload.data.length,
          },
        }
      }
      const rows = Array.isArray(payload) ? payload : []
      return {
        ok: true,
        data: { rows, page, lastPage: 1, perPage: limit, total: rows.length, from: rows.length ? 1 : 0, to: rows.length },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الشركات') }
    }
  }

  async function getById(id) {
    try {
      const res = await api.get(`/v1/companies/${id}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الشركة') }
    }
  }

  async function create(payload) {
    try {
      const res = await api.post('/v1/companies', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء الشركة') }
    }
  }

  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/companies/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث الشركة') }
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/v1/companies/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف الشركة') }
    }
  }

  return { list, getById, create, update, remove }
})
