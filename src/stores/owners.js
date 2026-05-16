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

export const useOwnersStore = defineStore('owners', () => {
  // GET /v1/owners?page=&limit=&search=
  // Response is a Laravel paginator nested under `data`:
  //   { current_page, data:[...], last_page, per_page, total, from, to }
  // Same mixed indexing as the bookings-list page: caller passes a 1-based
  // UI `page`, we send it 0-based on the wire (page-1); the response's
  // current_page/last_page stay 1-based and are mirrored as-is.
  async function list({ page = 1, limit = 10, search } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/owners', { params: cleanParams({ page: apiPage, limit, search }) })
      const payload = unwrap(res)

      // Laravel paginator shape
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
      // Flat array
      const rows = Array.isArray(payload) ? payload : []
      return {
        ok: true,
        data: {
          rows,
          page,
          lastPage: 1,
          perPage: limit,
          total: rows.length,
          from: rows.length ? 1 : 0,
          to: rows.length,
        },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الملاك') }
    }
  }

  async function getById(id) {
    try {
      const res = await api.get(`/v1/owners/${id}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب المالك') }
    }
  }

  async function create(payload) {
    try {
      const res = await api.post('/v1/owners', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء المالك') }
    }
  }

  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/owners/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث المالك') }
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/v1/owners/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف المالك') }
    }
  }

  return { list, getById, create, update, remove }
})
