import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useBookingsStore } from './bookings'
import { useChaletsStore } from './chalets'

export const useOrdersStore = defineStore('orders', () => {
  const bookingsStore = useBookingsStore()
  const chaletsStore = useChaletsStore()

  // Orders are bookings in actionable states
  const queue = computed(() => {
    return bookingsStore.bookings
      .filter((b) => b.status === 'PENDING' || b.status === 'CONFIRMED' || b.status === 'PROCESSING' || b.status === 'TEMPORARY')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  })

  const pendingQueue = computed(() => {
    return bookingsStore.bookings
      .filter((b) => b.status === 'PENDING' || b.status === 'PROCESSING' || b.status === 'TEMPORARY')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  })

  function startProcessing(bookingId) {
    const booking = bookingsStore.getBookingById(bookingId)
    if (!booking) return { ok: false, error: 'الطلب غير موجود' }
    booking.status = 'PROCESSING'
    booking.processingStartedAt = new Date().toISOString()
    bookingsStore.updateBooking(bookingId, {
      status: 'PROCESSING',
      processingStartedAt: booking.processingStartedAt,
    })
    return { ok: true }
  }

  function setTemporary(bookingId) {
    return bookingsStore.updateBooking(bookingId, { status: 'TEMPORARY' })
  }

  function confirmOrder(bookingId) {
    const booking = bookingsStore.getBookingById(bookingId)
    if (!booking) return { ok: false, error: 'الطلب غير موجود' }

    const totalPaid = (booking.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0)
    if (totalPaid < booking.total) {
      return { ok: false, error: 'لا يمكن التأكيد - المبلغ المتبقي أكبر من صفر' }
    }

    bookingsStore.updateBooking(bookingId, { status: 'CONFIRMED' })
    return { ok: true }
  }

  // Guest management
  function addGuest(bookingId, guest) {
    const booking = bookingsStore.getBookingById(bookingId)
    if (!booking) return { ok: false }
    if (!booking.guests) booking.guests = []

    const chalet = chaletsStore.getById(booking.chaletId)
    const maxPermitted = chalet?.maxPermitted || chalet?.maxGuests || 6
    const extraCharge = chalet?.extraGuestCharge || 150
    const isChild = guest.isChild || false
    const adultCount = booking.guests.filter((g) => !g.isChild).length
    const isExtra = !isChild && adultCount >= maxPermitted

    booking.guests.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
      name: guest.name,
      nationalId: guest.nationalId || '',
      relation: guest.relation || '',
      phone: guest.phone || '',
      isChild,
      isExtra,
    })

    // Recalculate extra guest total
    const extraCount = booking.guests.filter((g) => g.isExtra).length
    booking.guestExtraTotal = extraCount * extraCharge
    booking.total = Number(booking.subtotal || 0) + booking.guestExtraTotal - Number(booking.discountAmount || 0)

    bookingsStore.updateBooking(bookingId, {
      guests: booking.guests,
      guestExtraTotal: booking.guestExtraTotal,
      total: booking.total,
    })

    return { ok: true, isExtra, extraCharge }
  }

  function removeGuest(bookingId, guestId) {
    const booking = bookingsStore.getBookingById(bookingId)
    if (!booking) return { ok: false }

    booking.guests = (booking.guests || []).filter((g) => g.id !== guestId)

    const chalet = chaletsStore.getById(booking.chaletId)
    const maxPermitted = chalet?.maxPermitted || 6
    const extraCharge = chalet?.extraGuestCharge || 150

    // Recalculate isExtra flags (only adults count toward capacity)
    let adultIdx = 0
    booking.guests.forEach((g) => {
      if (g.isChild) { g.isExtra = false }
      else { g.isExtra = adultIdx >= maxPermitted; adultIdx++ }
    })
    const extraCount = booking.guests.filter((g) => g.isExtra).length
    booking.guestExtraTotal = extraCount * extraCharge
    booking.total = Number(booking.subtotal || 0) + booking.guestExtraTotal - Number(booking.discountAmount || 0)

    bookingsStore.updateBooking(bookingId, {
      guests: booking.guests,
      guestExtraTotal: booking.guestExtraTotal,
      total: booking.total,
    })

    return { ok: true }
  }

  // Payment
  function addPayment(bookingId, amount) {
    return bookingsStore.addPayment(bookingId, amount)
  }

  function getOrderById(id) {
    return bookingsStore.getBookingById(id)
  }

  return {
    queue,
    pendingQueue,
    startProcessing,
    setTemporary,
    confirmOrder,
    addGuest,
    removeGuest,
    addPayment,
    getOrderById,
  }
})
