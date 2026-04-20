import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'pb_notifications'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([])

  function init() {
    try {
      notifications.value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      notifications.value = []
    }
  }

  function _persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
  }

  function send({ toUserId, title, body, type = 'booking', meta = {} }) {
    notifications.value.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      toUserId,
      title,
      body,
      type,
      meta,
      read: false,
      createdAt: new Date().toISOString(),
    })
    _persist()
  }

  function getForUser(userId) {
    return notifications.value.filter(n => n.toUserId === userId)
  }

  function unreadCount(userId) {
    return notifications.value.filter(n => n.toUserId === userId && !n.read).length
  }

  function markAsRead(id) {
    const notif = notifications.value.find(n => n.id === id)
    if (notif) { notif.read = true; _persist() }
  }

  function markAllRead(userId) {
    notifications.value.forEach(n => {
      if (n.toUserId === userId && !n.read) n.read = true
    })
    _persist()
  }

  // Seed test notifications if empty
  function seedIfEmpty() {
    if (notifications.value.length > 0) return
    const now = Date.now()
    const seeds = [
      { toUserId: 'seed_admin_001', title: 'حجز جديد', body: 'حجز جديد — شاليه A-101 من 20/4 إلى 23/4', type: 'booking', read: false, createdAt: new Date(now - 300000).toISOString() },
      { toUserId: 'seed_admin_001', title: 'تسجيل دخول', body: 'تم تسجيل دخول الضيف لشاليه B-205', type: 'checkin', read: false, createdAt: new Date(now - 1800000).toISOString() },
      { toUserId: 'seed_admin_001', title: 'طلب جديد', body: 'طلب حجز جديد بانتظار المراجعة — شاليه A-102', type: 'booking', read: true, createdAt: new Date(now - 7200000).toISOString() },
      { toUserId: 'seed_owner_001', title: 'حجز جديد على شاليهك', body: 'حجز جديد — شاليه النخيل من 22/4 إلى 25/4', type: 'booking', read: false, createdAt: new Date(now - 600000).toISOString() },
      { toUserId: 'seed_owner_001', title: 'دفعة مالية', body: 'تم استلام دفعة 2,500 ج.م لشاليه اللؤلؤة', type: 'payment', read: false, createdAt: new Date(now - 3600000).toISOString() },
      { toUserId: 'seed_operator_001', title: 'حجز جديد على شاليه تشغيلك', body: 'حجز جديد — شاليه A-101 من 20/4 إلى 23/4', type: 'booking', read: false, createdAt: new Date(now - 900000).toISOString() },
      { toUserId: 'seed_operator_001', title: 'Check-out اليوم', body: 'شاليه B-205 — موعد الخروج اليوم الساعة 12:00', type: 'checkout', read: false, createdAt: new Date(now - 5400000).toISOString() },
      { toUserId: 'seed_villageadmin_001', title: 'طلب جديد', body: 'طلب حجز جديد بانتظار المراجعة — شاليه C-301', type: 'booking', read: false, createdAt: new Date(now - 1200000).toISOString() },
    ]
    seeds.forEach(s => {
      notifications.value.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        meta: {},
        ...s,
      })
    })
    _persist()
  }

  init()
  seedIfEmpty()

  return {
    notifications,
    send,
    getForUser,
    unreadCount,
    markAsRead,
    markAllRead,
  }
})
