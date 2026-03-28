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

  function getAll({ search = '', status = '', ownerId = '' } = {}) {
    return chalets.value.filter((c) => {
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
      'ownerId', 'status',
    ]
    fields.forEach((f) => { if (data[f] !== undefined) updated[f] = data[f] })

    const numFields = ['rooms', 'bathrooms', 'area', 'price', 'deposit', 'rating', 'maxPermitted', 'extraGuestCharge', 'rentalFee']
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

  const totalPublished = computed(() => chalets.value.filter((c) => c.status === 'published').length)
  const totalDraft = computed(() => chalets.value.filter((c) => c.status === 'draft').length)
  const totalPending = computed(() => chalets.value.filter((c) => c.status === 'pending').length)

  init()

  return {
    chalets,
    totalPublished,
    totalDraft,
    totalPending,
    getAll,
    getById,
    getByOwner,
    create,
    update,
    deleteChalet,
    updateStatus,
  }
})
