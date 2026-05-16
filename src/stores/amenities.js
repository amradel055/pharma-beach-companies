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

export const useAmenitiesStore = defineStore('amenities', () => {
  // GET /v1/amenities?page=0&limit=10 — paginated list (Laravel paginator).
  // UI is 1-based; we send page-1 on the wire.
  async function list({ page = 1, limit = 10, search } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/amenities', {
        params: cleanParams({ page: apiPage, limit, search }),
      })
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
      // Legacy { content, total } shape
      if (payload && Array.isArray(payload.content)) {
        return {
          ok: true,
          data: {
            rows: payload.content,
            page: 1,
            lastPage: 1,
            perPage: payload.content.length,
            total: payload.total ?? payload.content.length,
            from: payload.content.length ? 1 : 0,
            to: payload.content.length,
          },
        }
      }
      const rows = Array.isArray(payload) ? payload : []
      return {
        ok: true,
        data: { rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: 1, to: rows.length },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الكماليات') }
    }
  }

  // GET /v1/amenities/all — flat array, used for chalet detail amenity chips.
  async function listAll() {
    try {
      const res = await api.get('/v1/amenities/all')
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : [] }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الكماليات') }
    }
  }

  async function create(payload) {
    try {
      const res = await api.post('/v1/amenities', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء الكمالية') }
    }
  }

  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/amenities/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث الكمالية') }
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/v1/amenities/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف الكمالية') }
    }
  }

  return { list, listAll, create, update, remove }
})
