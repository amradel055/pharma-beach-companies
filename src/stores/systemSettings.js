import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

export const useSystemSettingsStore = defineStore('systemSettings', () => {
  // GET /v1/settings — flat array of { key, value, updated_at }
  async function list() {
    try {
      const res = await api.get('/v1/settings')
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : [] }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الإعدادات') }
    }
  }

  // PUT /v1/settings/{key} — body: { value }
  async function update(key, value) {
    try {
      const res = await api.put(`/v1/settings/${encodeURIComponent(key)}`, { value })
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث الإعداد') }
    }
  }

  return { list, update }
})
