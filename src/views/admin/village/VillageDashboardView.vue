<template>
  <div class="village-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">إدارة القرية</h1>
        <p class="page-desc">تقارير شاملة عن الحجوزات والأداء المالي للقرية</p>
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

    <!-- Tab: KPIs -->
    <div v-if="activeTab === 'kpis'" class="tab-content">
      <FinancialKPIs :totals="financialData.totals" />

      <!-- Per-chalet breakdown -->
      <div class="breakdown-card">
        <div class="breakdown-header">
          <h3><i class="pi pi-list" /> تفصيل الشاليهات</h3>
        </div>
        <div v-if="chaletBreakdown.length === 0" class="breakdown-empty">لا توجد بيانات للفترة المحددة</div>
        <table v-else class="breakdown-table">
          <thead>
            <tr>
              <th>الشاليه</th>
              <th>القيمة الإيجارية</th>
              <th>رسم الإيجار</th>
              <th>التشغيل (17%)</th>
              <th>نسبة البروكر</th>
              <th>نسبة القرية</th>
              <th>صافي المالك</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in chaletBreakdown" :key="row.chaletId">
              <td><span class="bd-name">{{ row.chaletName }}</span> <span class="bd-num">{{ row.chaletNumber }}</span></td>
              <td class="bd-val">{{ fmtNum(row.rentalValue) }}</td>
              <td class="bd-val">{{ fmtNum(row.rentalFee) }}</td>
              <td class="bd-val">{{ fmtNum(row.operatingFee) }}</td>
              <td class="bd-val">{{ fmtNum(row.brokerCommission) }}</td>
              <td class="bd-val">{{ fmtNum(row.villageCommission) }}</td>
              <td class="bd-val green">{{ fmtNum(row.netOwner) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab: Ranking -->
    <div v-if="activeTab === 'ranking'" class="tab-content">
      <ChaletRankingTable :rankings="rankings" />
    </div>

    <!-- Tab: Payment -->
    <div v-if="activeTab === 'payment'" class="tab-content">
      <PaymentStatusTable :details="financialData.details" />
    </div>

    <!-- Tab: Folders -->
    <div v-if="activeTab === 'folders'" class="tab-content">
      <div class="folders-header">
        <h3>ملفات الشاليهات</h3>
        <button class="btn-sm" @click="folderModalOpen = true"><i class="pi pi-plus" /> إنشاء ملف</button>
      </div>

      <div v-if="foldersStore.folders.length === 0" class="folders-empty">
        <div class="empty-icon"><i class="pi pi-folder" /></div>
        <p>لا توجد ملفات بعد — أنشئ ملفاً لتجميع الشاليهات</p>
      </div>

      <div v-for="folder in foldersStore.folders" :key="folder.id" class="folder-card">
        <div class="folder-top">
          <div class="folder-info">
            <i class="pi pi-folder-open" />
            <div>
              <span class="folder-name">{{ folder.name }}</span>
              <span class="folder-meta">{{ folder.chaletIds.length }} شاليه · {{ folderStats(folder).bookings }} حجز · {{ fmtNum(folderStats(folder).value) }} ج.م</span>
            </div>
          </div>
          <div class="folder-actions">
            <button class="item-btn" @click="openEditFolder(folder)" title="إدارة الشاليهات"><i class="pi pi-cog" /></button>
            <button class="item-btn danger" @click="handleDeleteFolder(folder)" title="حذف"><i class="pi pi-trash" /></button>
          </div>
        </div>

        <!-- Expanded chalets -->
        <div v-if="folder.chaletIds.length > 0" class="folder-chalets">
          <div v-for="cid in folder.chaletIds" :key="cid" class="folder-chalet-item">
            <span class="fc-name">{{ getChaletName(cid) }}</span>
            <span class="fc-stats">{{ getChaletBookingCount(cid) }} حجز · {{ fmtNum(getChaletIncome(cid)) }} ج.م</span>
          </div>
        </div>
      </div>

      <!-- Create Folder Modal -->
      <AppModal v-model="folderModalOpen" title="إنشاء ملف جديد" icon="pi pi-folder" size="sm" @close="folderName = ''">
        <div class="field">
          <label>اسم الملف <span class="req">*</span></label>
          <input v-model="folderName" placeholder="مثال: شاليهات VIP" @keyup.enter="createFolder" />
        </div>
        <template #footer>
          <button class="btn-cancel" @click="folderModalOpen = false">إلغاء</button>
          <button class="btn-submit" :disabled="!folderName.trim()" @click="createFolder"><i class="pi pi-plus" /> إنشاء</button>
        </template>
      </AppModal>

      <!-- Edit Folder (manage chalets) Modal -->
      <AppModal v-model="editFolderOpen" :title="`إدارة ملف: ${editingFolder?.name || ''}`" icon="pi pi-cog" size="md" @close="editingFolder = null">
        <div class="manage-chalets">
          <p class="manage-hint">اختر الشاليهات لإضافتها إلى هذا الملف</p>
          <div class="chalet-checks">
            <label v-for="c in allChalets" :key="c.id" class="chalet-check">
              <input type="checkbox" :checked="editFolderIds.includes(c.id)" @change="toggleFolderChalet(c.id)" />
              <span class="check-label">{{ c.name }} <small>({{ c.chaletNumber }})</small></span>
            </label>
          </div>
        </div>
        <template #footer>
          <button class="btn-cancel" @click="editFolderOpen = false">إغلاق</button>
        </template>
      </AppModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useChaletsStore } from '@/stores/chalets'
import { useBookingsStore } from '@/stores/bookings'
import { useChaletFoldersStore } from '@/stores/chaletFolders'
import { useFinancials } from '@/composables/useFinancials'
import { useDateRangeFilter } from '@/composables/useDateRangeFilter'
import { useToastStore } from '@/stores/toast'
import DateRangeFilter from '@/components/admin/shared/DateRangeFilter.vue'
import FinancialKPIs from '@/components/admin/shared/FinancialKPIs.vue'
import ChaletRankingTable from '@/components/admin/shared/ChaletRankingTable.vue'
import PaymentStatusTable from '@/components/admin/shared/PaymentStatusTable.vue'
import AppModal from '@/components/ui/AppModal.vue'

const chaletsStore = useChaletsStore()
const bookingsStore = useBookingsStore()
const foldersStore = useChaletFoldersStore()
const toast = useToastStore()
const { aggregateFinancials, rankChalets, calcBookingFinancials } = useFinancials()
const { dateFrom, dateTo, filterByRange, setCurrentMonth } = useDateRangeFilter()

setCurrentMonth()

const activeTab = ref('kpis')
const tabs = [
  { key: 'kpis', label: 'المؤشرات المالية', icon: 'pi pi-chart-bar' },
  { key: 'ranking', label: 'ترتيب الشاليهات', icon: 'pi pi-sort-amount-down' },
  { key: 'payment', label: 'حالة الدفع', icon: 'pi pi-credit-card' },
  { key: 'folders', label: 'ملفات الشاليهات', icon: 'pi pi-folder' },
]

// All village bookings filtered by date
const filteredBookings = computed(() => {
  const all = bookingsStore.bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING')
  return filterByRange(all, (b) => b.checkIn)
})

const chaletsMap = computed(() => {
  const map = {}
  chaletsStore.chalets.forEach((c) => { map[c.id] = c })
  return map
})

const financialData = computed(() => aggregateFinancials(filteredBookings.value, chaletsMap.value))
const rankings = computed(() => rankChalets(financialData.value.details))

// Per-chalet breakdown for KPIs tab
const chaletBreakdown = computed(() => {
  const map = {}
  financialData.value.details.forEach(({ booking, chalet, financials }) => {
    const cid = booking.chaletId
    if (!map[cid]) {
      map[cid] = { chaletId: cid, chaletName: chalet?.name || booking.chaletName, chaletNumber: chalet?.chaletNumber || booking.chaletNumber, rentalValue: 0, rentalFee: 0, operatingFee: 0, brokerCommission: 0, villageCommission: 0, netOwner: 0 }
    }
    map[cid].rentalValue += financials.rentalValue
    map[cid].rentalFee += financials.rentalFee
    map[cid].operatingFee += financials.operatingFee
    map[cid].brokerCommission += financials.brokerCommission
    map[cid].villageCommission += financials.villageCommission
    map[cid].netOwner += financials.netOwner
  })
  return Object.values(map).sort((a, b) => b.rentalValue - a.rentalValue)
})

// Folders
const folderModalOpen = ref(false)
const folderName = ref('')
const editingFolder = ref(null)
const editFolderOpen = computed({ get: () => !!editingFolder.value, set: (v) => { if (!v) editingFolder.value = null } })
const editFolderIds = computed(() => editingFolder.value?.chaletIds || [])
const allChalets = computed(() => chaletsStore.chalets.filter((c) => c.status === 'published'))

function createFolder() {
  if (!folderName.value.trim()) return
  const r = foldersStore.create(folderName.value)
  r.ok ? toast.success('تم إنشاء الملف') : toast.error(r.error)
  folderName.value = ''
  folderModalOpen.value = false
}

function openEditFolder(folder) {
  editingFolder.value = folder
}

function toggleFolderChalet(chaletId) {
  if (!editingFolder.value) return
  const f = editingFolder.value
  if (f.chaletIds.includes(chaletId)) {
    foldersStore.removeChalet(f.id, chaletId)
  } else {
    foldersStore.addChalet(f.id, chaletId)
  }
}

function handleDeleteFolder(folder) {
  foldersStore.deleteFolder(folder.id)
  toast.success('تم حذف الملف')
}

function folderStats(folder) {
  const cids = folder.chaletIds
  const bookings = filteredBookings.value.filter((b) => cids.includes(b.chaletId))
  const value = bookings.reduce((s, b) => s + Number(b.total || 0), 0)
  return { bookings: bookings.length, value }
}

function getChaletName(cid) {
  const c = chaletsMap.value[cid]
  return c ? `${c.name} (${c.chaletNumber})` : `شاليه #${cid}`
}

function getChaletBookingCount(cid) {
  return filteredBookings.value.filter((b) => b.chaletId === cid).length
}

function getChaletIncome(cid) {
  return filteredBookings.value.filter((b) => b.chaletId === cid).reduce((s, b) => s + Number(b.total || 0), 0)
}

function fmtNum(n) { return Number(n || 0).toLocaleString('ar-EG') }
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.controls-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
.controls-row { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }

.tabs-bar { display: flex; gap: 6px; margin-bottom: 16px; background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 6px; }
.tab-btn { display: flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 8px; border: none; background: none; font-size: 13px; font-weight: 600; font-family: inherit; color: #64748b; cursor: pointer; transition: all 0.15s; }
.tab-btn:hover { background: #f8fafc; color: #475569; }
.tab-btn.active { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.tab-btn i { font-size: 14px; }

/* Breakdown Table */
.breakdown-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; overflow: hidden; }
.breakdown-header { padding: 18px 20px; border-bottom: 1px solid #f1f5f9; }
.breakdown-header h3 { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; }
.breakdown-header h3 i { color: #f97316; }
.breakdown-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; }
.breakdown-table { width: 100%; border-collapse: collapse; }
.breakdown-table th { padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; background: #fafbfc; border-bottom: 1px solid #f1f5f9; }
.breakdown-table td { padding: 14px 16px; font-size: 13px; color: #475569; border-bottom: 1px solid #f8fafc; }
.breakdown-table tr:last-child td { border-bottom: none; }
.breakdown-table tr:hover { background: #fafbfc; }
.bd-name { font-weight: 600; color: #1e293b; }
.bd-num { font-size: 12px; color: #94a3b8; margin-right: 6px; }
.bd-val { text-align: center; font-weight: 600; font-size: 12.5px; }
.bd-val.green { color: #10b981; }

/* Folders */
.folders-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.folders-header h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0; }
.btn-sm { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 8px; font-size: 12.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-sm:hover { transform: translateY(-1px); }

.folders-empty { text-align: center; padding: 48px 20px; background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; }
.folders-empty .empty-icon { width: 56px; height: 56px; border-radius: 14px; background: rgba(148, 163, 184, 0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.folders-empty .empty-icon i { font-size: 24px; color: #94a3b8; }
.folders-empty p { color: #94a3b8; font-size: 13.5px; margin: 0; }

.folder-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; margin-bottom: 12px; overflow: hidden; }
.folder-top { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; }
.folder-info { display: flex; align-items: center; gap: 12px; }
.folder-info > i { font-size: 22px; color: #f97316; }
.folder-name { display: block; font-size: 14px; font-weight: 600; color: #1e293b; }
.folder-meta { display: block; font-size: 12px; color: #94a3b8; margin-top: 2px; }
.folder-actions { display: flex; gap: 4px; }
.item-btn { width: 30px; height: 30px; border-radius: 6px; border: none; background: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 13px; transition: all 0.12s; }
.item-btn:hover { background: #f1f5f9; color: #475569; }
.item-btn.danger { color: #ef4444; }
.item-btn.danger:hover { background: rgba(239, 68, 68, 0.08); }

.folder-chalets { border-top: 1px solid #f1f5f9; padding: 8px 12px; }
.folder-chalet-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; }
.folder-chalet-item:hover { background: #f8fafc; }
.fc-name { font-size: 13px; font-weight: 500; color: #1e293b; }
.fc-stats { font-size: 12px; color: #94a3b8; }

/* Manage chalets in folder */
.manage-hint { font-size: 13.5px; color: #64748b; margin: 0 0 14px; }
.chalet-checks { display: flex; flex-direction: column; gap: 6px; }
.chalet-check { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; cursor: pointer; transition: background 0.12s; }
.chalet-check:hover { background: #f8fafc; }
.chalet-check input[type="checkbox"] { width: 18px; height: 18px; accent-color: #f97316; cursor: pointer; flex-shrink: 0; }
.check-label { font-size: 13.5px; color: #1e293b; }
.check-label small { color: #94a3b8; }

/* Modal form fields */
.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.req { color: #ef4444; }
.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.btn-cancel { padding: 10px 24px; border-radius: 10px; background: #f1f5f9; color: #475569; font-size: 13.5px; font-weight: 600; border: none; cursor: pointer; font-family: inherit; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 768px) {
  .controls-row { flex-direction: column; }
  .tabs-bar { overflow-x: auto; }
  .tab-btn { white-space: nowrap; }
  .breakdown-table th:nth-child(n+4), .breakdown-table td:nth-child(n+4) { display: none; }
}
</style>
