import { ref, computed } from 'vue'

export function useDateRangeFilter() {
  const dateFrom = ref('')
  const dateTo = ref('')

  const isRangeSet = computed(() => !!dateFrom.value && !!dateTo.value)

  function filterByRange(items, getDate) {
    if (!isRangeSet.value) return items
    const from = new Date(dateFrom.value)
    from.setHours(0, 0, 0, 0)
    const to = new Date(dateTo.value)
    to.setHours(23, 59, 59, 999)

    return items.filter((item) => {
      const d = new Date(getDate(item))
      return d >= from && d <= to
    })
  }

  function clearRange() {
    dateFrom.value = ''
    dateTo.value = ''
  }

  // Set default range to current month
  function setCurrentMonth() {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    dateFrom.value = firstDay.toISOString().split('T')[0]
    dateTo.value = lastDay.toISOString().split('T')[0]
  }

  return {
    dateFrom,
    dateTo,
    isRangeSet,
    filterByRange,
    clearRange,
    setCurrentMonth,
  }
}
