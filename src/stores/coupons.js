import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'pb_coupons'

export const useCouponsStore = defineStore('coupons', () => {
  const coupons = ref([])

  function init() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (saved && saved.length > 0) {
        coupons.value = saved
      } else {
        seedDemo()
      }
    } catch {
      seedDemo()
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons.value))
  }

  function seedDemo() {
    const now = new Date()
    const future30 = new Date(now); future30.setDate(future30.getDate() + 30)
    const past10 = new Date(now); past10.setDate(past10.getDate() - 10)

    coupons.value = [
      {
        id: 'cpn_1', code: 'BEACH20', type: 'percent', value: 20,
        startDate: now.toISOString().split('T')[0],
        endDate: future30.toISOString().split('T')[0],
        maxUsage: 50, perUserLimit: 2, minBookingValue: 2000,
        active: true, usageCount: 8, usedBy: [],
        createdAt: past10.toISOString(),
      },
      {
        id: 'cpn_2', code: 'SUMMER500', type: 'fixed', value: 500,
        startDate: now.toISOString().split('T')[0],
        endDate: future30.toISOString().split('T')[0],
        maxUsage: 100, perUserLimit: 1, minBookingValue: 3000,
        active: true, usageCount: 3, usedBy: [],
        createdAt: past10.toISOString(),
      },
      {
        id: 'cpn_3', code: 'VIP50', type: 'percent', value: 50,
        startDate: past10.toISOString().split('T')[0],
        endDate: past10.toISOString().split('T')[0],
        maxUsage: 5, perUserLimit: 1, minBookingValue: 0,
        active: false, usageCount: 5, usedBy: [],
        createdAt: new Date(now.getTime() - 86400000 * 20).toISOString(),
      },
    ]
    _persist()
  }

  function getAll({ status = '', search = '' } = {}) {
    return coupons.value.filter((c) => {
      if (search) {
        const q = search.trim().toLowerCase()
        if (!c.code.toLowerCase().includes(q)) return false
      }
      if (status === 'active' && !c.active) return false
      if (status === 'inactive' && c.active) return false
      if (status === 'expired') {
        const isExpired = new Date(c.endDate) < new Date()
        if (!isExpired) return false
      }
      return true
    })
  }

  function getById(id) {
    return coupons.value.find((c) => c.id === id) || null
  }

  function getByCode(code) {
    return coupons.value.find((c) => c.code.toLowerCase() === code.trim().toLowerCase()) || null
  }

  function create(data) {
    const exists = coupons.value.find((c) => c.code.toLowerCase() === data.code.trim().toLowerCase())
    if (exists) return { ok: false, error: 'كود الكوبون موجود بالفعل' }

    const coupon = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      code: data.code.trim().toUpperCase(),
      type: data.type, // 'percent' | 'fixed'
      value: Number(data.value) || 0,
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      maxUsage: Number(data.maxUsage) || 0, // 0 = unlimited
      perUserLimit: Number(data.perUserLimit) || 0, // 0 = unlimited
      minBookingValue: Number(data.minBookingValue) || 0,
      active: data.active !== false,
      usageCount: 0,
      usedBy: [],
      createdAt: new Date().toISOString(),
    }

    coupons.value.push(coupon)
    _persist()
    return { ok: true, coupon }
  }

  function update(id, data) {
    const idx = coupons.value.findIndex((c) => c.id === id)
    if (idx === -1) return { ok: false, error: 'الكوبون غير موجود' }

    const coupon = coupons.value[idx]
    if (data.code !== undefined) {
      const dup = coupons.value.find((c) => c.code.toLowerCase() === data.code.trim().toLowerCase() && c.id !== id)
      if (dup) return { ok: false, error: 'كود الكوبون موجود بالفعل' }
      coupon.code = data.code.trim().toUpperCase()
    }
    if (data.type !== undefined) coupon.type = data.type
    if (data.value !== undefined) coupon.value = Number(data.value)
    if (data.startDate !== undefined) coupon.startDate = data.startDate
    if (data.endDate !== undefined) coupon.endDate = data.endDate
    if (data.maxUsage !== undefined) coupon.maxUsage = Number(data.maxUsage)
    if (data.perUserLimit !== undefined) coupon.perUserLimit = Number(data.perUserLimit)
    if (data.minBookingValue !== undefined) coupon.minBookingValue = Number(data.minBookingValue)
    if (data.active !== undefined) coupon.active = data.active

    _persist()
    return { ok: true, coupon }
  }

  function deleteCoupon(id) {
    const idx = coupons.value.findIndex((c) => c.id === id)
    if (idx === -1) return { ok: false }
    coupons.value.splice(idx, 1)
    _persist()
    return { ok: true }
  }

  function toggleActive(id) {
    const coupon = coupons.value.find((c) => c.id === id)
    if (!coupon) return { ok: false }
    coupon.active = !coupon.active
    _persist()
    return { ok: true, active: coupon.active }
  }

  /**
   * Validate a coupon code for a booking
   * Returns { ok, error, coupon, discount }
   */
  function validate(code, bookingTotal, userId) {
    const coupon = getByCode(code)
    if (!coupon) return { ok: false, error: 'كود الكوبون غير موجود' }
    if (!coupon.active) return { ok: false, error: 'الكوبون غير مفعل' }

    const now = new Date()
    now.setHours(0, 0, 0, 0)
    if (coupon.startDate && new Date(coupon.startDate) > now) return { ok: false, error: 'الكوبون لم يبدأ بعد' }
    if (coupon.endDate && new Date(coupon.endDate) < now) return { ok: false, error: 'الكوبون منتهي الصلاحية' }

    if (coupon.maxUsage > 0 && coupon.usageCount >= coupon.maxUsage) {
      return { ok: false, error: 'تم الوصول للحد الأقصى لاستخدام الكوبون' }
    }

    if (coupon.perUserLimit > 0 && userId) {
      const userUsage = coupon.usedBy.filter((uid) => uid === userId).length
      if (userUsage >= coupon.perUserLimit) {
        return { ok: false, error: 'تم الوصول للحد الأقصى لاستخدامك لهذا الكوبون' }
      }
    }

    if (coupon.minBookingValue > 0 && bookingTotal < coupon.minBookingValue) {
      return { ok: false, error: `الحد الأدنى لقيمة الحجز ${coupon.minBookingValue} ج.م` }
    }

    let discount = 0
    if (coupon.type === 'percent') {
      discount = Math.round(bookingTotal * coupon.value / 100)
    } else {
      discount = Math.min(coupon.value, bookingTotal)
    }

    return { ok: true, coupon, discount }
  }

  /**
   * Record coupon usage after booking confirmation
   */
  function recordUsage(couponId, userId) {
    const coupon = coupons.value.find((c) => c.id === couponId)
    if (!coupon) return
    coupon.usageCount++
    if (userId) coupon.usedBy.push(userId)
    _persist()
  }

  const totalActive = computed(() => coupons.value.filter((c) => c.active).length)
  const totalExpired = computed(() => coupons.value.filter((c) => new Date(c.endDate) < new Date()).length)
  const totalUsage = computed(() => coupons.value.reduce((s, c) => s + c.usageCount, 0))

  init()

  return {
    coupons,
    totalActive,
    totalExpired,
    totalUsage,
    getAll,
    getById,
    getByCode,
    create,
    update,
    deleteCoupon,
    toggleActive,
    validate,
    recordUsage,
  }
})
