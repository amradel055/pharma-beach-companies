import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { chalets as seedChalets } from '@/data/chalets.js'

const STORAGE_KEY = 'pb_admin_chalets'

export const useChaletsStore = defineStore('chalets', () => {
  const chalets = ref([])

  function init() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      if (saved.length > 0) {
        chalets.value = saved
      } else {
        // Seed from static data with admin fields
        chalets.value = seedChalets.map((c) => ({
          ...c,
          ownerId: c.ownerId || 'seed_owner_001',
          rentalFee: c.rentalFee || Math.round(c.price * 0.05),
          maxPermitted: c.maxPermitted || c.maxGuests || 6,
          extraGuestCharge: c.extraGuestCharge || 150,
          status: 'published',
          createdAt: new Date().toISOString(),
          // R2 fields
          hidden: false,
          siteFee: 5,
          siteFeeType: 'percentage',
          residentsCount: c.maxGuests || 6,
          coverIndex: 0,
          externalLinks: [],
          operatorId: null,
          pricePeriods: [],
          securityDeposit: 0,
        }))
        _persist()
      }
    } catch {
      chalets.value = []
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chalets.value))
  }

  function getAll({ search = '', status = '', ownerId = '', includeHidden = false } = {}) {
    return chalets.value.filter((c) => {
      if (!includeHidden && c.hidden) return false
      if (search) {
        const q = search.trim().toLowerCase()
        const matchName = c.name?.toLowerCase().includes(q)
        const matchNumber = c.chaletNumber?.toLowerCase().includes(q)
        if (!matchName && !matchNumber) return false
      }
      if (status && c.status !== status) return false
      if (ownerId && c.ownerId !== ownerId) return false
      return true
    })
  }

  function getById(id) {
    return chalets.value.find((c) => c.id === id) || null
  }

  function getByOwner(ownerId) {
    return chalets.value.filter((c) => c.ownerId === ownerId && c.status === 'published')
  }

  function create(data) {
    const newChalet = {
      id: Date.now(),
      chaletNumber: data.chaletNumber,
      name: data.name,
      floor: data.floor,
      rooms: Number(data.rooms) || 1,
      bathrooms: Number(data.bathrooms) || 1,
      area: Number(data.area) || 0,
      finishing: data.finishing,
      views: data.views || [],
      price: Number(data.price) || 0,
      image: data.image || '',
      images: data.images || [],
      videos: data.videos || [],
      description: data.description || '',
      rating: Number(data.rating) || 0,
      reviewCount: 0,
      deposit: Number(data.deposit) || 0,
      category: data.category || '',
      amenities: data.amenities || [],
      maxGuests: Number(data.maxPermitted) || 6,
      maxPermitted: Number(data.maxPermitted) || 6,
      extraGuestCharge: Number(data.extraGuestCharge) || 150,
      rentalFee: Number(data.rentalFee) || 0,
      ownerId: data.ownerId || '',
      status: data.status || 'draft',
      bookedDates: [],
      createdAt: new Date().toISOString(),
      // R2 fields
      hidden: data.hidden || false,
      siteFee: Number(data.siteFee) || 0,
      siteFeeType: data.siteFeeType || 'percentage',
      residentsCount: Number(data.residentsCount) || 6,
      coverIndex: Number(data.coverIndex) || 0,
      externalLinks: data.externalLinks || [],
      operatorId: data.operatorId || null,
      pricePeriods: data.pricePeriods || [],
      securityDeposit: Number(data.securityDeposit) || 0,
    }

    chalets.value.push(newChalet)
    _persist()
    return { ok: true, chalet: newChalet }
  }

  function update(id, data) {
    const index = chalets.value.findIndex((c) => c.id === id)
    if (index === -1) return { ok: false, error: 'الشاليه غير موجود' }

    const updated = { ...chalets.value[index] }
    const fields = [
      'chaletNumber', 'name', 'floor', 'finishing', 'views', 'image',
      'images', 'videos', 'description', 'category', 'amenities',
      'ownerId', 'status', 'siteFeeType', 'externalLinks', 'operatorId',
      'pricePeriods', 'hidden',
    ]
    fields.forEach((f) => { if (data[f] !== undefined) updated[f] = data[f] })

    const numFields = [
      'rooms', 'bathrooms', 'area', 'price', 'deposit', 'rating',
      'maxPermitted', 'extraGuestCharge', 'rentalFee', 'siteFee',
      'residentsCount', 'coverIndex', 'securityDeposit',
    ]
    numFields.forEach((f) => { if (data[f] !== undefined) updated[f] = Number(data[f]) })

    if (data.maxPermitted !== undefined) updated.maxGuests = Number(data.maxPermitted)

    chalets.value[index] = updated
    _persist()
    return { ok: true, chalet: updated }
  }

  function deleteChalet(id) {
    const index = chalets.value.findIndex((c) => c.id === id)
    if (index === -1) return { ok: false, error: 'الشاليه غير موجود' }
    chalets.value.splice(index, 1)
    _persist()
    return { ok: true }
  }

  function updateStatus(id, status) {
    const chalet = chalets.value.find((c) => c.id === id)
    if (!chalet) return { ok: false }
    chalet.status = status
    _persist()
    return { ok: true }
  }

  // R2: Toggle hidden
  function toggleHidden(id) {
    const chalet = chalets.value.find((c) => c.id === id)
    if (!chalet) return { ok: false }
    chalet.hidden = !chalet.hidden
    _persist()
    return { ok: true, hidden: chalet.hidden }
  }

  // R2: Get price for a specific date based on price periods
  function getPriceForDate(chalet, date) {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    if (chalet.pricePeriods && chalet.pricePeriods.length > 0) {
      for (const period of chalet.pricePeriods) {
        const start = new Date(period.startDate)
        const end = new Date(period.endDate)
        start.setHours(0, 0, 0, 0)
        end.setHours(0, 0, 0, 0)
        if (d >= start && d <= end) return Number(period.dailyPrice) || chalet.price
      }
    }
    return chalet.price
  }

  // R2: Calculate total for multi-period booking
  function calculateMultiPeriodTotal(chalet, checkIn, checkOut) {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    let total = 0
    const dailyPrices = []
    const d = new Date(start)
    while (d < end) {
      const price = getPriceForDate(chalet, d)
      dailyPrices.push({ date: new Date(d).toISOString(), price })
      total += price
      d.setDate(d.getDate() + 1)
    }
    return { total, dailyPrices }
  }

  // R2: Bulk update prices by percentage
  const bulkUndoData = ref(null)

  function bulkUpdatePrices(chaletIds, percentChange, scope = 'all') {
    const snapshot = []
    for (const id of chaletIds) {
      const chalet = chalets.value.find((c) => c.id === id)
      if (!chalet) continue
      snapshot.push({ id, price: chalet.price, pricePeriods: JSON.parse(JSON.stringify(chalet.pricePeriods || [])) })
      const factor = 1 + percentChange / 100
      if (scope === 'all' || scope === 'default') {
        chalet.price = Math.round(chalet.price * factor)
      }
      if (scope === 'all' && chalet.pricePeriods) {
        chalet.pricePeriods.forEach((p) => {
          p.dailyPrice = Math.round(Number(p.dailyPrice) * factor)
        })
      }
    }
    bulkUndoData.value = { snapshot, timestamp: Date.now() }
    _persist()
    return { ok: true, count: snapshot.length }
  }

  function undoBulkUpdate() {
    if (!bulkUndoData.value) return { ok: false }
    if (Date.now() - bulkUndoData.value.timestamp > 600000) {
      bulkUndoData.value = null
      return { ok: false, error: 'انتهت مهلة التراجع (10 دقائق)' }
    }
    for (const snap of bulkUndoData.value.snapshot) {
      const chalet = chalets.value.find((c) => c.id === snap.id)
      if (!chalet) continue
      chalet.price = snap.price
      chalet.pricePeriods = snap.pricePeriods
    }
    bulkUndoData.value = null
    _persist()
    return { ok: true }
  }

  const canUndoBulk = computed(() => {
    if (!bulkUndoData.value) return false
    return Date.now() - bulkUndoData.value.timestamp < 600000
  })

  const totalPublished = computed(() => chalets.value.filter((c) => c.status === 'published').length)
  const totalDraft = computed(() => chalets.value.filter((c) => c.status === 'draft').length)
  const totalPending = computed(() => chalets.value.filter((c) => c.status === 'pending').length)
  const totalHidden = computed(() => chalets.value.filter((c) => c.hidden).length)

  init()

  return {
    chalets,
    totalPublished,
    totalDraft,
    totalPending,
    totalHidden,
    canUndoBulk,
    getAll,
    getById,
    getByOwner,
    create,
    update,
    deleteChalet,
    updateStatus,
    toggleHidden,
    getPriceForDate,
    calculateMultiPeriodTotal,
    bulkUpdatePrices,
    undoBulkUpdate,
  }
})
