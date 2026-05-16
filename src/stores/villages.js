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

export const useVillagesStore = defineStore('villages', () => {
  // GET /v1/villages?page=0&limit=10 — Laravel paginator on the response,
  // 0-based page on the request (per spec). UI is 1-based.
  async function list({ page = 1, limit = 10, search } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/villages', {
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
      if (payload && Array.isArray(payload.content)) {
        return {
          ok: true,
          data: {
            rows: payload.content,
            page: 1, lastPage: 1, perPage: payload.content.length,
            total: payload.total ?? payload.content.length,
            from: payload.content.length ? 1 : 0, to: payload.content.length,
          },
        }
      }
      const rows = Array.isArray(payload) ? payload : []
      return { ok: true, data: { rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: rows.length ? 1 : 0, to: rows.length } }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب القرى') }
    }
  }

  async function getById(id) {
    try {
      const res = await api.get(`/v1/villages/${id}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب القرية') }
    }
  }

  async function create(payload) {
    try {
      const res = await api.post('/v1/villages', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء القرية') }
    }
  }

  async function update(id, payload) {
    try {
      const res = await api.put(`/v1/villages/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث القرية') }
    }
  }

  async function remove(id) {
    try {
      await api.delete(`/v1/villages/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف القرية') }
    }
  }

  // ─── Nested chalet tiers ───
  async function listTiers(villageId) {
    try {
      const res = await api.get(`/v1/villages/${villageId}/chalet-tiers`)
      const data = unwrap(res)
      return { ok: true, data: Array.isArray(data) ? data : (data?.content || []) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب فئات الشاليهات') }
    }
  }

  async function createTier(villageId, payload) {
    try {
      const res = await api.post(`/v1/villages/${villageId}/chalet-tiers`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء الفئة') }
    }
  }

  async function updateTier(villageId, tierId, payload) {
    try {
      const res = await api.put(`/v1/villages/${villageId}/chalet-tiers/${tierId}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث الفئة') }
    }
  }

  async function removeTier(villageId, tierId) {
    try {
      await api.delete(`/v1/villages/${villageId}/chalet-tiers/${tierId}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف الفئة') }
    }
  }

  // ─── Per-chalet pricing settings (Screen 3-C) ───
  async function getChaletSettings(chaletId) {
    try {
      const res = await api.get(`/v1/chalets/${chaletId}/settings`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب إعدادات الشاليه') }
    }
  }

  async function updateChaletSettings(chaletId, payload) {
    try {
      const res = await api.put(`/v1/chalets/${chaletId}/settings`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث الإعدادات') }
    }
  }

  return {
    list, getById, create, update, remove,
    listTiers, createTier, updateTier, removeTier,
    getChaletSettings, updateChaletSettings,
  }
})
