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

  // Returns chalets + their bookings in one call.
  //
  // Mixed indexing on this endpoint (same pattern as /v1/bookings-list):
  //   • REQUEST: `?page=` is 0-based.
  //   • RESPONSE: Laravel paginator with 1-based current_page / last_page.
  //
  // Caller passes `page` as 1-based (UI-friendly); we subtract 1 on the wire.
  // We also tolerate the legacy `{ content: [...], total }` shape so older
  // callers don't break.
  async function listAvailableChaletsDetail({ page = 1, limit = 10, company_id, owner_id, group_id, delegator_id } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/chalets/available-detail', {
        params: cleanParams({ page: apiPage, limit, company_id, owner_id, group_id, delegator_id }),
      })
      const payload = unwrap(res)

      // Laravel paginator: { current_page, data: [...rows], last_page, per_page, total, from, to }
      if (payload && Array.isArray(payload.data)) {
        return {
          ok: true,
          data: {
            rows: payload.data,
            // legacy alias so existing callers using `.content` keep working
            content: payload.data,
            page: payload.current_page ?? 1,
            lastPage: payload.last_page ?? 1,
            perPage: payload.per_page || (payload.data?.length ?? limit),
            total: payload.total ?? payload.data.length,
            from: payload.from || 0,
            to: payload.to || payload.data.length,
          },
        }
      }

      // Legacy shape: { content: [...], total }
      if (payload && Array.isArray(payload.content)) {
        const rows = payload.content
        return {
          ok: true,
          data: {
            rows,
            content: rows,
            page: 1,
            lastPage: 1,
            perPage: rows.length,
            total: payload.total ?? rows.length,
            from: rows.length ? 1 : 0,
            to: rows.length,
          },
        }
      }

      // Defensive fallback.
      const rows = Array.isArray(payload) ? payload : []
      return {
        ok: true,
        data: { rows, content: rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: 1, to: rows.length },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب تفاصيل الشاليهات') }
    }
  }

  // GET /v1/chalets — full chalet list (not the booking-availability view).
  // Same mixed indexing as the other list endpoints: request `page` is 0-based
  // (caller passes 1-based UI page, we subtract 1), response is a 1-based
  // Laravel paginator. Rows are thin: { id, chalet_code, name }.
  async function listChalets({ page = 1, limit = 10, company_id, owner_id, group_id, delegator_id } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/chalets', {
        params: cleanParams({ page: apiPage, limit, company_id, owner_id, group_id, delegator_id }),
      })
      const payload = unwrap(res)

      if (payload && Array.isArray(payload.data)) {
        return {
          ok: true,
          data: {
            rows: payload.data,
            content: payload.data,
            page: payload.current_page ?? 1,
            lastPage: payload.last_page ?? 1,
            perPage: payload.per_page || (payload.data?.length ?? limit),
            total: payload.total ?? payload.data.length,
            from: payload.from || 0,
            to: payload.to || payload.data.length,
          },
        }
      }

      if (payload && Array.isArray(payload.content)) {
        const rows = payload.content
        return {
          ok: true,
          data: {
            rows,
            content: rows,
            page: 1,
            lastPage: 1,
            perPage: rows.length,
            total: payload.total ?? rows.length,
            from: rows.length ? 1 : 0,
            to: rows.length,
          },
        }
      }

      const rows = Array.isArray(payload) ? payload : []
      return {
        ok: true,
        data: { rows, content: rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: rows.length ? 1 : 0, to: rows.length },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الشاليهات') }
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

  // GET /v1/bookings/stats — summary counters. Accepts the same optional
  // filters as /v1/bookings-list so the cards stay in sync with the table.
  // Response: { total_bookings, pending, confirmed_permits, total_nights }
  async function getBookingStats({ company_id, owner_id, group_id, check_in, check_out, status } = {}) {
    try {
      const res = await api.get('/v1/bookings/stats', {
        params: cleanParams({ company_id, owner_id, group_id, check_in, check_out, status }),
      })
      const data = unwrap(res) || {}
      return {
        ok: true,
        data: {
          total_bookings: data.total_bookings ?? 0,
          pending: data.pending ?? 0,
          confirmed_permits: data.confirmed_permits ?? 0,
          total_nights: data.total_nights ?? 0,
        },
      }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب الإحصائيات') }
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

  // GET /v1/bookings-list — slim list with optional filters + pagination.
  //
  // Mixed indexing on this endpoint:
  //   • REQUEST: `?page=` is 0-based (page=0 → first page, page=1 → second).
  //     Matches its sibling list endpoints.
  //   • RESPONSE: Laravel paginator's current_page / last_page are 1-based
  //     (last_page=1 means one page total).
  //
  // To keep callers sane, this method accepts `page` as **1-based** (UI-friendly)
  // and converts to 0-based when sending. Returned `page`/`lastPage` stay 1-based
  // since they mirror the response directly.
  // Response: { current_page, data: [...rows], last_page, per_page, total, from, to, ... }
  async function listBookingsSlim({ page = 1, per_page, company_id, owner_id, group_id, check_in, check_out, status } = {}) {
    try {
      const apiPage = Math.max(0, Number(page) - 1)
      const res = await api.get('/v1/bookings-list', {
        params: cleanParams({ page: apiPage, per_page, company_id, owner_id, group_id, check_in, check_out, status }),
      })
      const payload = unwrap(res)
      if (payload && Array.isArray(payload.data)) {
        return {
          ok: true,
          data: {
            rows: payload.data,
            page: payload.current_page ?? 1,
            lastPage: payload.last_page ?? 1,
            perPage: payload.per_page || (payload.data?.length ?? 10),
            total: payload.total ?? payload.data.length,
            from: payload.from || 0,
            to: payload.to || payload.data.length,
          },
        }
      }
      // Fallback for older flat-array responses (single page).
      const rows = Array.isArray(payload) ? payload : []
      return {
        ok: true,
        data: { rows, page: 1, lastPage: 1, perPage: rows.length, total: rows.length, from: 1, to: rows.length },
      }
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
    listChalets,
    listAvailableChalets,
    listAvailableChaletsDetail,
    getChaletBookings,
    getBookingInfo,
    createVillageBooking,
    listBookings,
    listBookingsSlim,
    getBookingStats,
    getBooking,
    confirmPermit,
    getPermit,
  }
})
