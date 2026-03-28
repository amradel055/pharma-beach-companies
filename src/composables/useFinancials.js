import { computed } from 'vue'
import { useUsersStore } from '@/stores/users'
import { ROLES } from '@/constants/roles'

// Village commission % for direct bookings (no broker)
const VILLAGE_COMMISSION_PERCENT = 10
const OPERATING_PERCENT = 17

export function useFinancials() {
  const usersStore = useUsersStore()

  /**
   * Calculate financial breakdown for a single booking
   */
  function calcBookingFinancials(booking, chalet) {
    const rentalValue = Number(booking.total || booking.subtotal || 0)
    const rentalFee = Number(chalet?.rentalFee || 0) * Number(booking.nights || 1)
    const operatingFee = Math.round(rentalValue * OPERATING_PERCENT / 100)

    let brokerCommission = 0
    let villageCommission = 0

    if (booking.brokerId) {
      const broker = usersStore.getById(booking.brokerId)
      const percent = broker?.commissionPercent || 0
      brokerCommission = Math.round(rentalValue * percent / 100)
    } else {
      villageCommission = Math.round(rentalValue * VILLAGE_COMMISSION_PERCENT / 100)
    }

    const netOwner = rentalValue - rentalFee - operatingFee - brokerCommission - villageCommission
    const totalPaid = (booking.payments || []).reduce((sum, p) => sum + Number(p.amount || 0), 0)
    const remaining = rentalValue - totalPaid

    let paymentStatus = 'unpaid'
    if (totalPaid >= rentalValue) paymentStatus = 'full'
    else if (totalPaid > 0) paymentStatus = 'partial'

    return {
      rentalValue,
      rentalFee,
      operatingFee,
      operatingPercent: OPERATING_PERCENT,
      brokerCommission,
      villageCommission,
      netOwner,
      totalPaid,
      remaining,
      paymentStatus,
    }
  }

  /**
   * Aggregate financials for an array of bookings
   */
  function aggregateFinancials(bookings, chaletsMap) {
    let totalRentalValue = 0
    let totalRentalFee = 0
    let totalOperatingFee = 0
    let totalBrokerCommission = 0
    let totalVillageCommission = 0
    let totalNetOwner = 0
    let totalPaid = 0
    let totalNights = 0
    let fullPaidCount = 0
    let partialPaidCount = 0
    let unpaidCount = 0

    const details = bookings.map((b) => {
      const chalet = chaletsMap[b.chaletId] || null
      const fin = calcBookingFinancials(b, chalet)

      totalRentalValue += fin.rentalValue
      totalRentalFee += fin.rentalFee
      totalOperatingFee += fin.operatingFee
      totalBrokerCommission += fin.brokerCommission
      totalVillageCommission += fin.villageCommission
      totalNetOwner += fin.netOwner
      totalPaid += fin.totalPaid
      totalNights += Number(b.nights || 0)

      if (fin.paymentStatus === 'full') fullPaidCount++
      else if (fin.paymentStatus === 'partial') partialPaidCount++
      else unpaidCount++

      return { booking: b, chalet, financials: fin }
    })

    return {
      details,
      totals: {
        rentalValue: totalRentalValue,
        rentalFee: totalRentalFee,
        operatingFee: totalOperatingFee,
        brokerCommission: totalBrokerCommission,
        villageCommission: totalVillageCommission,
        netOwner: totalNetOwner,
        totalPaid,
        totalNights,
        bookingsCount: bookings.length,
        fullPaidCount,
        partialPaidCount,
        unpaidCount,
      },
    }
  }

  /**
   * Rank chalets by income/bookings for a given array of booking details
   */
  function rankChalets(details, sortBy = 'income_desc') {
    // Group by chalet
    const map = {}
    details.forEach(({ booking, chalet, financials }) => {
      const cid = booking.chaletId
      if (!map[cid]) {
        map[cid] = {
          chaletId: cid,
          chaletName: chalet?.name || booking.chaletName || '—',
          chaletNumber: chalet?.chaletNumber || booking.chaletNumber || '—',
          totalIncome: 0,
          totalNights: 0,
          bookingsCount: 0,
          netOwner: 0,
        }
      }
      map[cid].totalIncome += financials.rentalValue
      map[cid].totalNights += Number(booking.nights || 0)
      map[cid].bookingsCount++
      map[cid].netOwner += financials.netOwner
    })

    const list = Object.values(map)

    if (sortBy === 'income_desc') list.sort((a, b) => b.totalIncome - a.totalIncome)
    else if (sortBy === 'income_asc') list.sort((a, b) => a.totalIncome - b.totalIncome)
    else if (sortBy === 'bookings_desc') list.sort((a, b) => b.bookingsCount - a.bookingsCount)

    return list
  }

  return {
    calcBookingFinancials,
    aggregateFinancials,
    rankChalets,
    OPERATING_PERCENT,
    VILLAGE_COMMISSION_PERCENT,
  }
}
