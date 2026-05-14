import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

// 422 reason phrases the backend returns for the village booking flow.
export const REASON_CODES = {
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE_SELECT_CASH_OR_BANK',
  CHALET_UNAVAILABLE: 'CHALET_NOT_AVAILABLE_FOR_SELECTED_DATES',
  GUESTS_EXCEED_MAX: 'GUESTS_EXCEED_MAXIMUM_ALLOWED',
}

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

function reasonOf(error) {
  if (error?.response?.status !== 422) return null
  return error.response.statusText || error.response.data?.message || null
}

function cleanParams(params = {}) {
  const out = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = v
  }
  return out
}

export const useCsBookingsStore = defineStore('csBookings', () => {
  // Lookup caches — companies/owners/groups change rarely. We fetch once per
  // app session and reuse. The in-flight Promise is also memoized so concurrent
  // callers during page mount don't trigger duplicate requests.
  const _lookupCache = { companies: null, owners: null, groups: null }
  const _lookupInflight = { companies: null, owners: null, groups: null }

  function _cachedLookup(key, url, fallbackMsg) {
    if (_lookupCache[key]) {
      return Promise.resolve({ ok: true, data: _lookupCache[key] })
    }
    if (_lookupInflight[key]) {
      return _lookupInflight[key]
    }
    _lookupInflight[key] = api
      .get(url)
      .then((res) => {
        const data = unwrap(res) || []
        _lookupCache[key] = data
        _lookupInflight[key] = null
        return { ok: true, data }
      })
      .catch((error) => {
        _lookupInflight[key] = null
        return { ok: false, error: getErrorMessage(error, fallbackMsg) }
      })
    return _lookupInflight[key]
  }

  function listCompanies() { return _cachedLookup('companies', '/v1/companies/active', 'تعذر جلب الشركات') }
  function listOwners() { return _cachedLookup('owners', '/v1/owners/active', 'تعذر جلب الملاك') }
  function listGroups() { return _cachedLookup('groups', '/v1/chalet-groups/active', 'تعذر جلب المجموعات') }

  // Allow callers to bust the cache when needed (e.g. after admin adds a new
  // company/owner/group via another screen).
  function invalidateLookups() {
    _lookupCache.companies = null
    _lookupCache.owners = null
    _lookupCache.groups = null
  }

  // NEW: returns chalets + their booked dates in one call (replaces the
  // listAvailableChalets + fan-out getChaletBookings combo once we know the
  // shape). For now just exposes the raw response.
  async function listAvailableChaletsDetail({ page = 0, limit = 10, company_id, owner_id, group_id, delegator_id } = {}) {
    try {
      const res = await api.get('/v1/chalets/available-detail', {
        params: cleanParams({ page, limit, company_id, owner_id, group_id, delegator_id }),
      })
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب تفاصيل الشاليهات') }
    }
  }

  async function listAvailableChalets({ page = 0, limit = 50, company_id, owner_id, group_id, delegator_id } = {}) {
    try {
      const res = await api.get('/v1/chalets/available', {
        params: cleanParams({ page, limit, company_id, owner_id, group_id, delegator_id }),
      })
      const payload = unwrap(res) || {}
      return { ok: true, data: { content: payload.content || [], total: payload.total || 0 } }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الشاليهات المتاحة') }
    }
  }

  async function getChaletBookings(chaletId, { date_from, date_to } = {}) {
    try {
      const res = await api.get(`/v1/chalets/${chaletId}/bookings`, {
        params: cleanParams({ date_from, date_to }),
      })
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب حجوزات الشاليه') }
    }
  }

  async function getBookingInfo(chaletId, { check_in, check_out } = {}) {
    try {
      const res = await api.get(`/v1/chalets/${chaletId}/booking-info`, {
        params: cleanParams({ check_in, check_out }),
      })
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب بيانات الشاليه') }
    }
  }

  // POST /v1/bookings/village — accepts optional payment_type. On 422
  // INSUFFICIENT_BALANCE_SELECT_CASH_OR_BANK we surface a flag so the view
  // can show the cash/bank chooser modal.
  async function createVillageBooking(payload) {
    try {
      const res = await api.post('/v1/bookings/village', payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      const reason = reasonOf(error)
      const message = getErrorMessage(error, reason || 'تعذر إنشاء الحجز')
      return {
        ok: false,
        error: message,
        reason,
        needsPaymentChoice: reason === REASON_CODES.INSUFFICIENT_BALANCE,
      }
    }
  }

  // GET /v1/bookings?page=0&limit=10 — paginated quick list (Screen 2 tab 1).
  async function listBookings({ page = 0, limit = 10 } = {}) {
    try {
      const res = await api.get('/v1/bookings', { params: cleanParams({ page, limit }) })
      const payload = unwrap(res) || {}
      return { ok: true, data: { content: payload.content || [], total: payload.total || 0 } }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الحجوزات') }
    }
  }

  // GET /v1/bookings-list — slim list with optional filters (Screen 2 tab 2).
  async function listBookingsSlim({ company_id, owner_id, group_id, check_in, check_out } = {}) {
    try {
      const res = await api.get('/v1/bookings-list', {
        params: cleanParams({ company_id, owner_id, group_id, check_in, check_out }),
      })
      return { ok: true, data: unwrap(res) || [] }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب قائمة الحجوزات') }
    }
  }

  // GET /v1/bookings/{id} — full detail (Screen 4).
  async function getBooking(bookingId) {
    try {
      const res = await api.get(`/v1/bookings/${bookingId}`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الحجز') }
    }
  }

  // PUT /v1/bookings/{id}/confirm-permit — Screen 4 action.
  async function confirmPermit(bookingId) {
    try {
      const res = await api.put(`/v1/bookings/${bookingId}/confirm-permit`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تأكيد التصريح') }
    }
  }

  // GET /v1/bookings/{id}/permit — Screen 5 print payload.
  async function getPermit(bookingId) {
    try {
      const res = await api.get(`/v1/bookings/${bookingId}/permit`)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب التصريح') }
    }
  }

  return {
    listCompanies,
    listOwners,
    listGroups,
    invalidateLookups,
    listAvailableChalets,
    listAvailableChaletsDetail,
    getChaletBookings,
    getBookingInfo,
    createVillageBooking,
    listBookings,
    listBookingsSlim,
    getBooking,
    confirmPermit,
    getPermit,
  }
})
