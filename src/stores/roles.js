import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

export const useRolesStore = defineStore('roles', () => {
  async function listAll() {
    try {
      const res = await api.get('/v1/role')
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : (data?.content || []) }
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

  return { listAll, listSystem, listBusiness, getById, create, update, remove }
})
