import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

export const useChaletGroupsStore = defineStore('chaletGroups', () => {
  async function list() {
    try {
      const res = await api.get('/v1/chalet-groups')
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : (data?.content || []) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب المجموعات') }
    }
  }

  async function getById(id) {
    try {
      const res = await api.get(`/v1/chalet-groups/${id}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب المجموعة') }
    }
  }

  async function create(payload) {
    try {
      const res = await api.post('/v1/chalet-groups', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء المجموعة') }
    }
  }

  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/chalet-groups/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث المجموعة') }
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/v1/chalet-groups/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف المجموعة') }
    }
  }

  return { list, getById, create, update, remove }
})
