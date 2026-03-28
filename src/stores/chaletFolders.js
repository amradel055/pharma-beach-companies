import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'pb_chalet_folders'

export const useChaletFoldersStore = defineStore('chaletFolders', () => {
  const folders = ref([])

  function init() {
    try {
      folders.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      folders.value = []
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(folders.value))
  }

  function create(name) {
    const exists = folders.value.find((f) => f.name === name.trim())
    if (exists) return { ok: false, error: 'اسم الملف موجود بالفعل' }

    const folder = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      name: name.trim(),
      chaletIds: [],
      createdAt: new Date().toISOString(),
    }
    folders.value.push(folder)
    _persist()
    return { ok: true, folder }
  }

  function rename(id, name) {
    const folder = folders.value.find((f) => f.id === id)
    if (!folder) return { ok: false, error: 'الملف غير موجود' }
    const dup = folders.value.find((f) => f.name === name.trim() && f.id !== id)
    if (dup) return { ok: false, error: 'اسم الملف موجود بالفعل' }
    folder.name = name.trim()
    _persist()
    return { ok: true }
  }

  function deleteFolder(id) {
    const idx = folders.value.findIndex((f) => f.id === id)
    if (idx === -1) return { ok: false }
    folders.value.splice(idx, 1)
    _persist()
    return { ok: true }
  }

  function addChalet(folderId, chaletId) {
    const folder = folders.value.find((f) => f.id === folderId)
    if (!folder) return { ok: false }
    if (!folder.chaletIds.includes(chaletId)) {
      folder.chaletIds.push(chaletId)
      _persist()
    }
    return { ok: true }
  }

  function removeChalet(folderId, chaletId) {
    const folder = folders.value.find((f) => f.id === folderId)
    if (!folder) return { ok: false }
    folder.chaletIds = folder.chaletIds.filter((id) => id !== chaletId)
    _persist()
    return { ok: true }
  }

  function setChalets(folderId, chaletIds) {
    const folder = folders.value.find((f) => f.id === folderId)
    if (!folder) return { ok: false }
    folder.chaletIds = [...chaletIds]
    _persist()
    return { ok: true }
  }

  function getById(id) {
    return folders.value.find((f) => f.id === id) || null
  }

  init()

  return {
    folders,
    create,
    rename,
    deleteFolder,
    addChalet,
    removeChalet,
    setChalets,
    getById,
  }
})
