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

export const useAdminMembersStore = defineStore('adminMembers', () => {
  // GET /v1/admin/members?page=0&limit=10&search=
  // Spec uses { content, total } shape on the response. UI is 1-based.
  async function list({ page = 1, limit = 10, search } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/admin/members', {
        params: cleanParams({ page: apiPage, limit, search }),
      })
      const payload = unwrap(res)

      if (payload && Array.isArray(payload.content)) {
        const rows = payload.content
        const total = payload.total ?? rows.length
        const lastPage = Math.max(1, Math.ceil(total / (limit || 10)))
        return {
          ok: true,
          data: {
            rows,
            page: page,
            lastPage,
            perPage: limit,
            total,
            from: rows.length ? (apiPage * limit) + 1 : 0,
            to: (apiPage * limit) + rows.length,
          },
        }
      }
      // Laravel paginator fallback
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
      return { ok: true, data: { rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: rows.length ? 1 : 0, to: rows.length } }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الأعضاء') }
    }
  }

  // GET /v1/admin/members/{userId}
  async function getById(id) {
    try {
      const res = await api.get(`/v1/admin/members/${id}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب العضو') }
    }
  }

  // GET /v1/admin/members/by-role/{roleCode} → [{ id, user_name }]
  async function listByRole(roleCode) {
    try {
      const res = await api.get(`/v1/admin/members/by-role/${roleCode}`)
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : [] }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الأعضاء حسب الدور') }
    }
  }

  // POST /v1/admin/members — body: { email, user_name, phone_number, password, account_status, role_ids: [] }
  async function create(payload) {
    try {
      const res = await api.post('/v1/admin/members', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء العضو') }
    }
  }

  // PUT /v1/admin/members/{userId} — body: { user_name, phone_code, phone_number, role_id }
  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/admin/members/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث العضو') }
    }
  }

  // DELETE /v1/admin/members/{userId}
  async function remove(id) {
    try {
      await api.delete(`/v1/admin/members/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف العضو') }
    }
  }

  return { list, getById, listByRole, create, update, remove }
})
