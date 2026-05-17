import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function show(message, type = 'success', duration = 3000) {
    if (!message) return
    // Collapse duplicates: if an identical toast (same message + type) is
    // still on screen, don't stack another. This lets the global API-error
    // handler and a view's own toast.error(...) coexist without doubling.
    if (toasts.value.some((t) => t.message === message && t.type === type)) {
      return
    }
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id) {
    const idx = toasts.value.findIndex((t) => t.id === id)
    if (idx > -1) toasts.value.splice(idx, 1)
  }

  function success(message) {
    show(message, 'success')
  }

  function error(message) {
    show(message, 'error')
  }

  function info(message) {
    show(message, 'info')
  }

  function warning(message) {
    show(message, 'warning')
  }

  // Consistent CRUD success phrasing. Pass the entity in its definite form
  // (e.g. 'الشركة', 'العضو', 'الفئة'); falls back to a neutral word.
  function created(entity = 'العنصر') {
    show(`تمت إضافة ${entity} بنجاح`, 'success')
  }
  function updated(entity = 'العنصر') {
    show(`تم تحديث ${entity} بنجاح`, 'success')
  }
  function deleted(entity = 'العنصر') {
    show(`تم حذف ${entity} بنجاح`, 'success')
  }
  function saved(entity = 'التغييرات') {
    show(`تم حفظ ${entity} بنجاح`, 'success')
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    info,
    warning,
    created,
    updated,
    deleted,
    saved,
  }
})
