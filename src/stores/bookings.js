import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useSettingsStore } from './settings'

export const useBookingsStore = defineStore('bookings', () => {
  const bookings = ref([])

  function init() {
    const saved = localStorage.getItem('pb_bookings')
    if (saved) {
      try {
        bookings.value = JSON.parse(saved)
      } catch {
        bookings.value = []
      }
    }

    // Seed demo bookings if none exist or old format (no pending_ ids)
    const hasPendingOrders = bookings.value.some((b) => b.id?.startsWith('pending_'))
    if (bookings.value.length === 0 || !hasPendingOrders) {
      seedDemoBookings()
    }

    expireStaleBookings()
  }

  function _persist() {
    localStorage.setItem('pb_bookings', JSON.stringify(bookings.value))
  }

  function seedDemoBookings() {
    const now = new Date()
    const demos = []
    const chalets = [
      { id: 1, name: 'شاليه النخيل', number: 'A-101', image: '', price: 2500 },
      { id: 2, name: 'شاليه اللؤلؤة', number: 'B-205', image: '', price: 3200 },
      { id: 3, name: 'شاليه الموج', number: 'A-102', image: '', price: 1800 },
      { id: 4, name: 'شاليه الشروق', number: 'C-301', image: '', price: 1500 },
      { id: 5, name: 'شاليه الأمواج', number: 'B-401', image: '', price: 4000 },
    ]

    const guestNames = [
      { name: 'أحمد محمد', nationalId: '29901011234567', relation: 'صاحب الحجز', phone: '01012345678' },
      { name: 'سارة أحمد', nationalId: '29905051234567', relation: 'زوجة', phone: '01098765432' },
      { name: 'يوسف أحمد', nationalId: '30001011234567', relation: 'ابن', phone: '' },
      { name: 'فاطمة محمد', nationalId: '29803031234567', relation: 'أخت', phone: '01155544433' },
      { name: 'عمر خالد', nationalId: '29507071234567', relation: 'صديق', phone: '01222333444' },
    ]

    // Past confirmed bookings (with full financial data)
    for (let i = 0; i < 8; i++) {
      const ch = chalets[i % chalets.length]
      const daysAgo = Math.floor(Math.random() * 20) + 5
      const nights = Math.floor(Math.random() * 3) + 1
      const checkIn = new Date(now); checkIn.setDate(checkIn.getDate() - daysAgo)
      const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights)
      const total = ch.price * nights
      const hasBroker = i % 3 === 0
      const paidFull = i % 3 !== 0

      demos.push({
        id: `demo_${i + 1}`,
        chaletId: ch.id, userId: 'seed_owner_001',
        checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), nights,
        subtotal: total, deposit: Math.round(total * 0.2), total,
        chaletName: ch.name, chaletNumber: ch.number, chaletImage: ch.image,
        status: 'CONFIRMED',
        createdAt: new Date(checkIn.getTime() - 86400000).toISOString(),
        expiresAt: new Date(checkIn.getTime() + 7200000).toISOString(),
        brokerId: hasBroker ? 'seed_broker_001' : null,
        agentId: hasBroker ? 'seed_agent_001' : null,
        guests: guestNames.slice(0, Math.floor(Math.random() * 3) + 2).map((g, gi) => ({
          id: `g_${i}_${gi}`, ...g, isExtra: false,
        })),
        guestExtraTotal: 0, processingStartedAt: null,
        couponId: null, couponCode: null, discountAmount: 0, discountType: null,
        payments: [{ amount: paidFull ? total : Math.round(total * 0.5), date: checkIn.toISOString(), method: 'cash' }],
      })
    }

    // Recent PENDING orders (appear in queue with timer)
    const pendingTimes = [5, 18, 42, 95] // minutes ago
    for (let i = 0; i < 4; i++) {
      const ch = chalets[(i + 1) % chalets.length]
      const nights = Math.floor(Math.random() * 3) + 1
      const checkIn = new Date(now); checkIn.setDate(checkIn.getDate() + Math.floor(Math.random() * 7) + 1)
      const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights)
      const total = ch.price * nights
      const createdAt = new Date(now.getTime() - pendingTimes[i] * 60000)
      const hasBroker = i % 2 === 0

      demos.push({
        id: `pending_${i + 1}`,
        chaletId: ch.id, userId: 'seed_owner_001',
        checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), nights,
        subtotal: total, deposit: Math.round(total * 0.2), total,
        chaletName: ch.name, chaletNumber: ch.number, chaletImage: ch.image,
        status: 'PENDING',
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(createdAt.getTime() + 7200000).toISOString(),
        brokerId: hasBroker ? 'seed_broker_001' : null,
        agentId: hasBroker ? 'seed_agent_001' : null,
        guests: [], guestExtraTotal: 0, processingStartedAt: null,
        couponId: null, couponCode: null, discountAmount: 0, discountType: null,
        payments: [],
      })
    }

    // TEMPORARY bookings (partially processed)
    for (let i = 0; i < 2; i++) {
      const ch = chalets[(i + 3) % chalets.length]
      const nights = 2
      const checkIn = new Date(now); checkIn.setDate(checkIn.getDate() + 2 + i)
      const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights)
      const total = ch.price * nights
      const createdAt = new Date(now.getTime() - (120 + i * 30) * 60000)

      demos.push({
        id: `temp_${i + 1}`,
        chaletId: ch.id, userId: 'seed_owner_001',
        checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), nights,
        subtotal: total, deposit: Math.round(total * 0.2), total,
        chaletName: ch.name, chaletNumber: ch.number, chaletImage: ch.image,
        status: 'TEMPORARY',
        createdAt: createdAt.toISOString(),
        expiresAt: new Date(createdAt.getTime() + 7200000).toISOString(),
        brokerId: 'seed_broker_001', agentId: 'seed_agent_001',
        guests: guestNames.slice(0, 3).map((g, gi) => ({ id: `tg_${i}_${gi}`, ...g, isExtra: false })),
        guestExtraTotal: 0,
        processingStartedAt: new Date(createdAt.getTime() + 300000).toISOString(),
        couponId: null, couponCode: null, discountAmount: 0, discountType: null,
        payments: [{ amount: Math.round(total * 0.4), date: createdAt.toISOString(), method: 'cash' }],
      })
    }

    // Future confirmed bookings (for agent permits)
    for (let i = 0; i < 3; i++) {
      const ch = chalets[i % chalets.length]
      const nights = Math.floor(Math.random() * 3) + 1
      const checkIn = new Date(now); checkIn.setDate(checkIn.getDate() + 3 + i * 3)
      const checkOut = new Date(checkIn); checkOut.setDate(checkOut.getDate() + nights)
      const total = ch.price * nights

      demos.push({
        id: `future_${i + 1}`,
        chaletId: ch.id, userId: 'seed_owner_001',
        checkIn: checkIn.toISOString(), checkOut: checkOut.toISOString(), nights,
        subtotal: total, deposit: Math.round(total * 0.2), total,
        chaletName: ch.name, chaletNumber: ch.number, chaletImage: ch.image,
        status: 'CONFIRMED',
        createdAt: new Date(now.getTime() - 86400000 * (i + 1)).toISOString(),
        expiresAt: new Date(now.getTime() + 7200000).toISOString(),
        brokerId: 'seed_broker_001', agentId: 'seed_agent_001',
        guests: guestNames.slice(0, 4).map((g, gi) => ({ id: `fg_${i}_${gi}`, ...g, isExtra: false })),
        guestExtraTotal: 0, processingStartedAt: null,
        couponId: null, couponCode: null, discountAmount: 0, discountType: null,
        payments: [{ amount: total, date: now.toISOString(), method: 'cash' }],
      })
    }

    bookings.value = demos
    _persist()
  }

  function createBooking({ chaletId, userId, checkIn, checkOut, nights, subtotal, deposit, total, chaletName, chaletNumber, chaletImage, brokerId, agentId }) {
    const settings = useSettingsStore()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + settings.pendingDurationMinutes * 60 * 1000)

    const booking = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      chaletId,
      userId,
      checkIn,
      checkOut,
      nights,
      subtotal,
      deposit,
      total,
      chaletName: chaletName || '',
      chaletNumber: chaletNumber || '',
      chaletImage: chaletImage || '',
      status: 'PENDING',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      // Financial fields
      brokerId: brokerId || null,
      agentId: agentId || null,
      guests: [],
      guestExtraTotal: 0,
      processingStartedAt: null,
      couponId: null,
      couponCode: null,
      discountAmount: 0,
      discountType: null,
      payments: [],
      // R2 fields
      cars: [],
      carFeesTotal: 0,
      securityPermitFee: 0,
      securityPermitWaived: false,
      securityPermitWaivedBy: null,
      securityPermitWaiveReason: '',
      checkedInAt: null,
      checkedInBy: null,
      checkedOutAt: null,
      checkedOutBy: null,
    }

    bookings.value.push(booking)
    _persist()
    return booking
  }

  function updateBooking(id, data) {
    const booking = bookings.value.find((b) => b.id === id)
    if (!booking) return null
    Object.assign(booking, data)
    _persist()
    return booking
  }

  function addPayment(id, amount, method = 'cash') {
    const booking = bookings.value.find((b) => b.id === id)
    if (!booking) return null
    if (!booking.payments) booking.payments = []
    booking.payments.push({ amount: Number(amount), date: new Date().toISOString(), method })
    _persist()
    return booking
  }

  function cancelBooking(id) {
    const booking = bookings.value.find((b) => b.id === id)
    if (booking) {
      booking.status = 'CANCELLED'
      _persist()
    }
  }

  function confirmBooking(id) {
    const booking = bookings.value.find((b) => b.id === id)
    if (booking) {
      booking.status = 'CONFIRMED'
      _persist()
    }
  }

  function expireStaleBookings() {
    const now = new Date()
    let changed = false
    for (const b of bookings.value) {
      if (b.status === 'PENDING' && new Date(b.expiresAt) <= now) {
        b.status = 'EXPIRED'
        changed = true
      }
    }
    if (changed) _persist()
  }

  function isDateBlocked(chaletId, checkIn, checkOut) {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    return bookings.value.some((b) => {
      if (b.chaletId !== chaletId) return false
      if (b.status !== 'PENDING' && b.status !== 'CONFIRMED') return false
      const bStart = new Date(b.checkIn)
      const bEnd = new Date(b.checkOut)
      bStart.setHours(0, 0, 0, 0)
      bEnd.setHours(0, 0, 0, 0)
      return start < bEnd && end > bStart
    })
  }

  function getBookingById(id) {
    return bookings.value.find((b) => b.id === id) || null
  }

  function getUserBookings(userId) {
    return bookings.value.filter((b) => b.userId === userId)
  }

  function getBookingsByChaletId(chaletId) {
    return bookings.value.filter((b) => b.chaletId === chaletId && (b.status === 'CONFIRMED' || b.status === 'PENDING'))
  }

  function getBookingsByBroker(brokerId) {
    return bookings.value.filter((b) => b.brokerId === brokerId && (b.status === 'CONFIRMED' || b.status === 'PENDING'))
  }

  function getBlockedDatesForChalet(chaletId) {
    const dates = []
    for (const b of bookings.value) {
      if (b.chaletId !== chaletId) continue
      if (b.status !== 'PENDING' && b.status !== 'CONFIRMED') continue
      const start = new Date(b.checkIn)
      const end = new Date(b.checkOut)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      const d = new Date(start)
      while (d < end) {
        dates.push(new Date(d))
        d.setDate(d.getDate() + 1)
      }
    }
    return dates
  }

  function getAllConfirmedBookings() {
    return bookings.value.filter((b) => b.status === 'CONFIRMED')
  }

  // R2: Check-in / Check-out
  function checkIn(bookingId, securityMemberId) {
    const booking = bookings.value.find((b) => b.id === bookingId)
    if (!booking) return null
    booking.checkedInAt = new Date().toISOString()
    booking.checkedInBy = securityMemberId
    _persist()
    return booking
  }

  function checkOut(bookingId, securityMemberId) {
    const booking = bookings.value.find((b) => b.id === bookingId)
    if (!booking) return null
    booking.checkedOutAt = new Date().toISOString()
    booking.checkedOutBy = securityMemberId
    _persist()
    return booking
  }

  // R2: Car management
  function addCar(bookingId, carData, carFeePerVehicle = 0) {
    const booking = bookings.value.find((b) => b.id === bookingId)
    if (!booking) return null
    if (!booking.cars) booking.cars = []
    booking.cars.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      plateNumber: carData.plateNumber,
      brand: carData.brand || '',
      model: carData.model || '',
      color: carData.color || '',
      driverName: carData.driverName || '',
      driverPhone: carData.driverPhone || '',
    })
    booking.carFeesTotal = booking.cars.length * carFeePerVehicle
    _persist()
    return booking
  }

  function removeCar(bookingId, carId) {
    const booking = bookings.value.find((b) => b.id === bookingId)
    if (!booking || !booking.cars) return null
    booking.cars = booking.cars.filter((c) => c.id !== carId)
    _persist()
    return booking
  }

  init()

  return {
    bookings,
    createBooking,
    updateBooking,
    addPayment,
    cancelBooking,
    confirmBooking,
    expireStaleBookings,
    isDateBlocked,
    getBookingById,
    getUserBookings,
    getBookingsByChaletId,
    getBookingsByBroker,
    getBlockedDatesForChalet,
    getAllConfirmedBookings,
    checkIn,
    checkOut,
    addCar,
    removeCar,
  }
})
