import { defineStore } from 'pinia'
import api, { getErrorMessage } from '@/lib/api'

function unwrap(response) {
  const data = response?.data
  return data?.data ?? data
}

// Spec key → URL segment under /v1/lookups/*
// The bulk /v1/lookups response key is on the LEFT (snake_case plural);
// the per-category REST path on the RIGHT (kebab-case, sometimes singular).
//
// `shape` describes the option schema, which differs per category:
//   'value' → { value, label_ar, label_en, sort_order, is_active }
//   'range' → { min_area, max_area, label_ar, label_en, sort_order, is_active }
//   'code'  → { code, name_ar, name_en, sort_order, is_active }
export const LOOKUP_CATEGORIES = [
  { key: 'floors', path: 'floors', label_ar: 'الأدوار', label_en: 'Floors', shape: 'value' },
  { key: 'rooms', path: 'rooms', label_ar: 'الغرف', label_en: 'Rooms', shape: 'value' },
  { key: 'bathrooms', path: 'bathrooms', label_ar: 'الحمامات', label_en: 'Bathrooms', shape: 'value' },
  { key: 'area_ranges', path: 'area-ranges', label_ar: 'المساحات', label_en: 'Area Ranges', shape: 'range' },
  { key: 'finishing_types', path: 'finishing-types', label_ar: 'مستوى التشطيب', label_en: 'Finishing', shape: 'code' },
  { key: 'the_views', path: 'the-view', label_ar: 'الإطلالة', label_en: 'View', shape: 'value' },
  { key: 'ac_counts', path: 'ac-count', label_ar: 'عدد التكييفات', label_en: 'AC Count', shape: 'value' },
]

export const useLookupsStore = defineStore('lookups', () => {
  // GET /v1/lookups — fetch ALL categories in one shot.
  async function listAll() {
    try {
      const res = await api.get('/v1/lookups')
      return { ok: true, data: unwrap(res) || {} }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب القيم المرجعية') }
    }
  }

  function _path(category) {
    const entry = LOOKUP_CATEGORIES.find((c) => c.key === category || c.path === category)
    return entry ? entry.path : category
  }

  // GET /v1/lookups/{path} — list options for one category.
  async function list(category) {
    try {
      const res = await api.get(`/v1/lookups/${_path(category)}`)
      const data = unwrap(res)
      // Server might return { options: [...] } or a bare array.
      const options = Array.isArray(data) ? data : (data?.options || [])
      return { ok: true, data: options }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر جلب القائمة') }
    }
  }

  // POST /v1/lookups/{path} — create option.
  async function create(category, payload) {
    try {
      const res = await api.post(`/v1/lookups/${_path(category)}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر إنشاء العنصر') }
    }
  }

  // PUT /v1/lookups/{path}/{id} — partial update (all fields optional).
  async function update(category, id, payload) {
    try {
      const res = await api.put(`/v1/lookups/${_path(category)}/${id}`, payload)
      return { ok: true, data: unwrap(res) }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر تحديث العنصر') }
    }
  }

  // DELETE /v1/lookups/{path}/{id}
  async function remove(category, id) {
    try {
      await api.delete(`/v1/lookups/${_path(category)}/${id}`)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: getErrorMessage(error, 'تعذر حذف العنصر') }
    }
  }

  return { listAll, list, create, update, remove }
})
