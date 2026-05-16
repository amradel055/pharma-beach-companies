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

// Pull a rows array out of a paginator object, a { content } wrapper, or a
// bare array — whichever shape the endpoint returns.
function rowsOf(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.data)) return payload.data
  if (payload && Array.isArray(payload.content)) return payload.content
  return []
}

// The API row is { code, name_ar, name_en, is_business_role, scope, ... }.
// The UI expects `name` and a `type` (SYSTEM read-only / BUSINESS editable).
function normalizeRole(r = {}) {
  return {
    ...r,
    name: r.name || r.name_ar || r.name_en || r.code || '',
    type: r.is_business_role ? 'BUSINESS' : 'SYSTEM',
  }
}

export const useRolesStore = defineStore('roles', () => {
  // GET /v1/role — paginated (Laravel paginator nested under `data`).
  // Request `page` is 0-based on the wire (caller passes 1-based UI page);
  // response current_page / last_page are 1-based and mirrored back.
  async function list({ page = 1, limit = 10 } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/role', { params: cleanParams({ page: apiPage, limit }) })
      const payload = unwrap(res)
      if (payload && Array.isArray(payload.data)) {
        return {
          ok: true,
          data: {
            rows: payload.data.map(normalizeRole),
            page: payload.current_page ?? 1,
            lastPage: payload.last_page ?? 1,
            perPage: payload.per_page || limit,
            total: payload.total ?? payload.data.length,
            from: payload.from || 0,
            to: payload.to || payload.data.length,
          },
        }
      }
      const rows = rowsOf(payload).map(normalizeRole)
      return {
        ok: true,
        data: { rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: rows.length ? 1 : 0, to: rows.length },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الأدوار') }
    }
  }

  // Flat list of EVERY role (for role pickers). The endpoint is paginated,
  // so request a large page to get them all in one shot.
  async function listAll() {
    try {
      const res = await api.get('/v1/role', { params: { page: 0, limit: 1000 } })
      const payload = unwrap(res)
      return { ok: true, data: rowsOf(payload).map(normalizeRole) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الأدوار') }
    }
  }

  async function listSystem() {
    try {
      const res = await api.get('/v1/role/system-roles')
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : [] }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب أدوار النظام') }
    }
  }

  async function listBusiness() {
    try {
      const res = await api.get('/v1/role/business-roles')
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : [] }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب أدوار العمل') }
    }
  }

  async function getById(id) {
    try {
      const res = await api.get(`/v1/role/${id}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الدور') }
    }
  }

  async function create(payload) {
    try {
      const res = await api.post('/v1/role', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء الدور') }
    }
  }

  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/role/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث الدور') }
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/v1/role/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف الدور') }
    }
  }

  return { list, listAll, listSystem, listBusiness, getById, create, update, remove }
})
