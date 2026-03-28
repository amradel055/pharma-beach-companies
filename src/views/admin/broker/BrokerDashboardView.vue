<template>
  <div class="broker-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">لوحة البروكر</h1>
        <p class="page-desc">متابعة أداء المناديب والتقارير المالية والعمولات</p>
      </div>
      <div v-if="brokerCommission" class="commission-badge">
        <i class="pi pi-percentage" />
        نسبة العمولة: {{ brokerCommission }}%
      </div>
    </div>

    <!-- Date Filter -->
    <div class="controls-card">
      <div class="controls-row">
        <DateRangeFilter :from="dateFrom" :to="dateTo" @update:from="dateFrom = $event" @update:to="dateTo = $event" @clear="dateFrom = ''; dateTo = ''" />
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-bar">
      <button v-for="t in tabs" :key="t.key" :class="['tab-btn', { active: activeTab === t.key }]" @click="activeTab = t.key">
        <i :class="t.icon" /> {{ t.label }}
      </button>
    </div>

    <!-- Tab: Agents -->
    <div v-if="activeTab === 'agents'" class="tab-content">
      <div class="agents-card">
        <div class="agents-header">
          <h3><i class="pi pi-users" /> المناديب التابعين</h3>
          <span class="agents-total">{{ agents.length }} مندوب</span>
        </div>

        <div v-if="agents.length === 0" class="agents-empty">
          <p>لا يوجد مناديب مرتبطين بحسابك</p>
        </div>

        <table v-else class="agents-table">
          <thead>
            <tr>
              <th>المندوب</th>
              <th>التليفون</th>
              <th>عدد الليالي</th>
              <th>عدد الحجوزات</th>
              <th>إجمالي القيمة</th>
              <th>عمولة البروكر</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in agentsWithStats" :key="a.id">
              <td>
                <div class="agent-cell">
                  <div class="agent-av">{{ a.name?.charAt(0) }}</div>
                  <span class="agent-name">{{ a.name }}</span>
                </div>
              </td>
              <td class="cell-phone">{{ a.phone }}</td>
              <td class="cell-center">{{ a.totalNights }}</td>
              <td class="cell-center">{{ a.bookingsCount }}</td>
              <td class="cell-center bold">{{ fmtNum(a.totalValue) }} <small>ج.م</small></td>
              <td class="cell-center green">{{ fmtNum(a.commission) }} <small>ج.م</small></td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="totals-row">
              <td colspan="2"><strong>الإجمالي العام</strong></td>
              <td class="cell-center bold">{{ agentsTotals.nights }}</td>
              <td class="cell-center bold">{{ agentsTotals.bookings }}</td>
              <td class="cell-center bold">{{ fmtNum(agentsTotals.value) }} <small>ج.م</small></td>
              <td class="cell-center green bold">{{ fmtNum(agentsTotals.commission) }} <small>ج.م</small></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Tab: Ranking -->
    <div v-if="activeTab === 'ranking'" class="tab-content">
      <ChaletRankingTable :rankings="rankings" />
    </div>

    <!-- Tab: KPIs -->
    <div v-if="activeTab === 'kpis'" class="tab-content">
      <FinancialKPIs :totals="financialData.totals" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useChaletsStore } from '@/stores/chalets'
import { useBookingsStore } from '@/stores/bookings'
import { usePermissions } from '@/composables/usePermissions'
import { useFinancials } from '@/composables/useFinancials'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { ROLES } from '@/constants/roles'
import DateRangeFilter from '@/components/admin/shared/DateRangeFilter.vue'
import FinancialKPIs from '@/components/admin/shared/FinancialKPIs.vue'
import ChaletRankingTable from '@/components/admin/shared/ChaletRankingTable.vue'

const auth = useAuthStore()
const usersStore = useUsersStore()
const chaletsStore = useChaletsStore()
const bookingsStore = useBookingsStore()
const { hasRole } = usePermissions()
const { aggregateFinancials, rankChalets } = useFinancials()
const { dateFrom, dateTo, filterByRange, setCurrentMonth } = useDateRangeFilter()

setCurrentMonth()

const activeTab = ref('agents')
const tabs = [
  { key: 'agents', label: 'المناديب', icon: 'pi pi-users' },
  { key: 'ranking', label: 'ترتيب الشاليهات', icon: 'pi pi-sort-amount-down' },
  { key: 'kpis', label: 'المؤشرات المالية', icon: 'pi pi-chart-bar' },
]

const brokerId = computed(() => {
  if (hasRole(ROLES.SITE_ADMIN)) return 'seed_broker_001' // admin sees demo broker
  return auth.user?.id
})

const brokerUser = computed(() => usersStore.getById(brokerId.value))
const brokerCommission = computed(() => brokerUser.value?.commissionPercent || 0)

// Broker's agents
const agents = computed(() => usersStore.getBrokerAgents(brokerId.value))

// All broker's bookings (via broker or agents)
const brokerBookings = computed(() => {
  let all = bookingsStore.bookings.filter((b) =>
    b.brokerId === brokerId.value && (b.status === 'CONFIRMED' || b.status === 'PENDING')
  )
  return filterByRange(all, (b) => b.checkIn)
})

const chaletsMap = computed(() => {
  const map = {}
  chaletsStore.chalets.forEach((c) => { map[c.id] = c })
  return map
})

const financialData = computed(() => aggregateFinancials(brokerBookings.value, chaletsMap.value))
const rankings = computed(() => rankChalets(financialData.value.details))

// Agents with stats
const agentsWithStats = computed(() => {
  const commPercent = brokerCommission.value
  return agents.value.map((agent) => {
    const agentBookings = brokerBookings.value.filter((b) => b.agentId === agent.id)
    const totalNights = agentBookings.reduce((s, b) => s + Number(b.nights || 0), 0)
    const totalValue = agentBookings.reduce((s, b) => s + Number(b.total || 0), 0)
    const commission = Math.round(totalValue * commPercent / 100)
    return {
      ...agent,
      bookingsCount: agentBookings.length,
      totalNights,
      totalValue,
      commission,
    }
  })
})

const agentsTotals = computed(() => {
  const a = agentsWithStats.value
  return {
    nights: a.reduce((s, x) => s + x.totalNights, 0),
    bookings: a.reduce((s, x) => s + x.bookingsCount, 0),
    value: a.reduce((s, x) => s + x.totalValue, 0),
    commission: a.reduce((s, x) => s + x.commission, 0),
  }
})

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.commission-badge { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(249, 115, 22, 0.06); border: 1px solid rgba(249, 115, 22, 0.15); border-radius: 12px; font-size: 14px; font-weight: 700; color: #f97316; }
.commission-badge i { font-size: 16px; }

.controls-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
.controls-row { display: flex; align-items: flex-end; gap: 16px; }

.tabs-bar { display: flex; gap: 6px; margin-bottom: 16px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 6px; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; border: none; background: none; font-size: 13px; font-weight: 600; font-family: inherit; color: #64748b; cursor: pointer; transition: all 0.15s; }
.tab-btn:hover { background: #f8fafc; color: #475569; }
.tab-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.tab-btn i { font-size: 14px; }

/* Agents Table */
.agents-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
.agents-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.agents-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.agents-header h3 i { color: #f97316; font-size: 16px; }
.agents-total { font-size: 12.5px; color: #94a3b8; font-weight: 600; }
.agents-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; }

.agents-table { width: 100%; border-collapse: collapse; }
.agents-table th { padding: 12px 18px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.agents-table td { padding: 14px 18px; font-size: 13.5px; color: #475569; border-bottom: 1px solid #f8fafc; }
.agents-table tr:hover { background: #fafbfc; }

.agent-cell { display: flex; align-items: center; gap: 10px; }
.agent-av { width: 34px; height: 34px; border-radius: 10px; background: linear-gradient(135deg, #64748b, #475569); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
.agent-name { font-weight: 600; color: #1e293b; }

.cell-phone { direction: ltr; text-align: right; font-weight: 500; }
.cell-center { text-align: center; font-weight: 600; }
.bold { font-weight: 700; }
.green { color: #10b981; }
.cell-center small { font-size: 11px; color: #94a3b8; font-weight: 500; }

.totals-row { background: #fafbfc; }
.totals-row td { border-top: 2px solid #f1f5f9; border-bottom: none !important; font-size: 14px; padding: 16px 18px; }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .commission-badge { width: 100%; justify-content: center; }
  .controls-row { flex-direction: column; gap: 12px; }
  .tabs-bar { overflow-x: auto; scrollbar-width: none; padding: 4px; }
  .tabs-bar::-webkit-scrollbar { display: none; }
  .tab-btn { white-space: nowrap; font-size: 12px; padding: 8px 14px; }
  .agents-card { overflow-x: auto; }
  .agents-table { min-width: 550px; }
  .agents-table th, .agents-table td { padding: 10px 12px; font-size: 12.5px; }
}
</style>
