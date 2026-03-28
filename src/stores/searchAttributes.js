import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'pb_search_attributes'

const DEFAULT_ATTRIBUTES = {
  floor: [
    { id: 'f1', name: 'الأرضي', order: 1, active: true },
    { id: 'f2', name: 'الأول', order: 2, active: true },
    { id: 'f3', name: 'الثاني', order: 3, active: true },
    { id: 'f4', name: 'الثالث', order: 4, active: true },
  ],
  rooms: [
    { id: 'r1', name: '1', order: 1, active: true },
    { id: 'r2', name: '2', order: 2, active: true },
    { id: 'r3', name: '3', order: 3, active: true },
    { id: 'r4', name: '4', order: 4, active: true },
  ],
  finishing: [
    { id: 'fn1', name: 'فاخر', order: 1, active: true },
    { id: 'fn2', name: 'متوسط', order: 2, active: true },
    { id: 'fn3', name: 'اقتصادي', order: 3, active: true },
  ],
  view: [
    { id: 'v1', name: 'بحر', order: 1, active: true },
    { id: 'v2', name: 'حمام سباحة', order: 2, active: true },
    { id: 'v3', name: 'حديقة', order: 3, active: true },
    { id: 'v4', name: 'شارع', order: 4, active: true },
  ],
}

export const CATEGORY_LABELS = {
  floor: 'الدور',
  rooms: 'عدد الغرف',
  finishing: 'التشطيب',
  view: 'الإطلالة',
}

export const useSearchAttributesStore = defineStore('searchAttributes', () => {
  const attributes = ref({})

  function init() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (saved && Object.keys(saved).length > 0) {
        attributes.value = saved
      } else {
        attributes.value = JSON.parse(JSON.stringify(DEFAULT_ATTRIBUTES))
        _persist()
      }
    } catch {
      attributes.value = JSON.parse(JSON.stringify(DEFAULT_ATTRIBUTES))
      _persist()
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attributes.value))
  }

  function getCategory(category) {
    return (attributes.value[category] || []).sort((a, b) => a.order - b.order)
  }

  function getActiveValues(category) {
    return getCategory(category).filter((a) => a.active)
  }

  function addItem(category, name) {
    if (!attributes.value[category]) attributes.value[category] = []
    const list = attributes.value[category]
    const exists = list.find((i) => i.name === name.trim())
    if (exists) return { ok: false, error: 'هذه القيمة موجودة بالفعل' }

    list.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      name: name.trim(),
      order: list.length + 1,
      active: true,
    })
    _persist()
    return { ok: true }
  }

  function updateItem(category, id, data) {
    const list = attributes.value[category]
    if (!list) return { ok: false }
    const item = list.find((i) => i.id === id)
    if (!item) return { ok: false }

    if (data.name !== undefined) item.name = data.name.trim()
    if (data.order !== undefined) item.order = Number(data.order)
    if (data.active !== undefined) item.active = data.active

    _persist()
    return { ok: true }
  }

  function deleteItem(category, id) {
    const list = attributes.value[category]
    if (!list) return { ok: false }
    const index = list.findIndex((i) => i.id === id)
    if (index === -1) return { ok: false }
    list.splice(index, 1)
    _persist()
    return { ok: true }
  }

  function toggleItem(category, id) {
    const list = attributes.value[category]
    if (!list) return { ok: false }
    const item = list.find((i) => i.id === id)
    if (!item) return { ok: false }
    item.active = !item.active
    _persist()
    return { ok: true, active: item.active }
  }

  init()

  return {
    attributes,
    getCategory,
    getActiveValues,
    addItem,
    updateItem,
    deleteItem,
    toggleItem,
  }
})
