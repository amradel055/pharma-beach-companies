<template>
  <div class="drp" ref="rootRef">
    <button type="button" class="drp-trigger" :class="{ active: open }" @click="toggle">
      <i class="pi pi-calendar" />
      <span class="drp-trigger-content">
        <strong class="drp-trigger-preset">{{ activePresetLabel }}</strong>
        <span v-if="rangeLabel" class="drp-trigger-range">{{ rangeLabel }}</span>
      </span>
      <i class="pi pi-chevron-down drp-trigger-chev" :class="{ flipped: open }" />
    </button>

    <Transition name="drp">
      <div v-if="open" class="drp-pop" @click.stop>
        <!-- Presets (right in RTL) -->
        <div class="drp-presets">
          <button
            v-for="p in presets"
            :key="p.key"
            type="button"
            :class="['drp-preset', { active: activePreset === p.key }]"
            @click="applyPreset(p.key)"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Calendar -->
        <div class="drp-cal">
          <div class="drp-cal-nav">
            <button type="button" @click="shiftMonth(-1)" aria-label="السابق">
              <i class="pi pi-chevron-right" />
            </button>
            <h4>{{ monthLabel }}</h4>
            <button type="button" @click="shiftMonth(1)" aria-label="التالي">
              <i class="pi pi-chevron-left" />
            </button>
          </div>

          <div class="drp-cal-grid">
            <div v-for="d in WEEKDAYS" :key="d" class="drp-cal-wd">{{ d }}</div>
            <button
              v-for="(day, i) in days"
              :key="i"
              type="button"
              :class="[
                'drp-cal-day',
                {
                  outside: day.outside,
                  'in-range': isInDraftRange(day.date),
                  'is-start': isStart(day.date),
                  'is-end': isEnd(day.date),
                  'is-today': day.isToday,
                },
              ]"
              @click="pickDay(day.date)"
              @mouseenter="hoverDate = day.date"
              @mouseleave="hoverDate = null"
            >
              {{ day.date.getDate() }}
            </button>
          </div>

          <div class="drp-cal-foot">
            <div class="drp-inputs">
              <input :value="fmtInput(draftFrom)" readonly placeholder="من" />
              <input :value="fmtInput(draftTo)" readonly placeholder="إلى" />
            </div>
            <div class="drp-actions">
              <button type="button" class="drp-btn-cancel" @click="cancel">إلغاء</button>
              <button type="button" class="drp-btn-apply" @click="apply">تطبيق</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  from: { type: String, default: '' }, // YYYY-MM-DD
  to: { type: String, default: '' },
})
const emit = defineEmits(['update:from', 'update:to', 'change'])

const WEEKDAYS = ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']

const presets = [
  { key: 'all', label: 'كل الأيام' },
  { key: 'today', label: 'اليوم' },
  { key: 'yesterday', label: 'أمس' },
  { key: 'last7', label: 'آخر 7 أيام' },
  { key: 'thisWeek', label: 'هذا الأسبوع' },
  { key: 'thisMonth', label: 'هذا الشهر' },
  { key: 'last30', label: 'آخر 30 يوم' },
  { key: 'thisYear', label: 'هذا العام' },
]

const rootRef = ref(null)
const open = ref(false)
const draftFrom = ref(null) // Date or null
const draftTo = ref(null)
const hoverDate = ref(null)
const viewMonth = ref(new Date().getMonth())
const viewYear = ref(new Date().getFullYear())

function parseISO(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
function toISO(date) {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function fmtInput(date) {
  if (!date) return ''
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
function sameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Calendar grid — always 42 cells (6 weeks × 7) so it doesn't jump.
const days = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1)
  const startDow = first.getDay() // 0 = Sunday (matches WEEKDAYS array starting with أحد)
  const gridStart = new Date(first)
  gridStart.setDate(gridStart.getDate() - startDow)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(d.getDate() + i)
    d.setHours(0, 0, 0, 0)
    cells.push({
      date: d,
      outside: d.getMonth() !== viewMonth.value,
      isToday: sameDay(d, today),
    })
  }
  return cells
})

const monthLabel = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 1).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
})

function shiftMonth(delta) {
  let m = viewMonth.value + delta
  let y = viewYear.value
  while (m < 0) { m += 12; y-- }
  while (m > 11) { m -= 12; y++ }
  viewMonth.value = m
  viewYear.value = y
}

function isStart(d) { return draftFrom.value && sameDay(d, draftFrom.value) }
function isEnd(d) { return draftTo.value && sameDay(d, draftTo.value) }

function isInDraftRange(d) {
  if (!draftFrom.value) return false
  // If both ends fixed, fill between them
  if (draftTo.value) {
    return d >= draftFrom.value && d <= draftTo.value
  }
  // Only start set — preview to hovered cell
  if (hoverDate.value) {
    const min = hoverDate.value < draftFrom.value ? hoverDate.value : draftFrom.value
    const max = hoverDate.value < draftFrom.value ? draftFrom.value : hoverDate.value
    return d >= min && d <= max
  }
  return false
}

function pickDay(d) {
  // Start fresh or replace selection
  if (!draftFrom.value || draftTo.value) {
    draftFrom.value = d
    draftTo.value = null
    return
  }
  // Choosing the end day — auto-sort
  if (d < draftFrom.value) {
    draftTo.value = draftFrom.value
    draftFrom.value = d
  } else {
    draftTo.value = d
  }
}

// Active preset detection — match the current draft range against each preset.
const activePreset = computed(() => {
  if (!draftFrom.value && !draftTo.value) return 'all'
  for (const p of presets) {
    if (p.key === 'all') continue
    const r = presetRange(p.key)
    if (r && sameDay(r.from, draftFrom.value) && sameDay(r.to, draftTo.value)) return p.key
  }
  return null
})
const activePresetLabel = computed(() => {
  if (!props.from && !props.to) return 'كل الأيام'
  // When closed, label reflects the COMMITTED range, not the draft.
  const committedFrom = parseISO(props.from)
  const committedTo = parseISO(props.to)
  for (const p of presets) {
    if (p.key === 'all') continue
    const r = presetRange(p.key)
    if (r && sameDay(r.from, committedFrom) && sameDay(r.to, committedTo)) return p.label
  }
  return 'فترة مخصصة'
})

const rangeLabel = computed(() => {
  const f = parseISO(props.from)
  const t = parseISO(props.to)
  if (!f && !t) return ''
  const sFmt = (d) => d ? d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }) : '—'
  return `${sFmt(f)} — ${sFmt(t)}`
})

function presetRange(key) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  switch (key) {
    case 'today': return { from: today, to: today }
    case 'yesterday': {
      const y = new Date(today); y.setDate(today.getDate() - 1)
      return { from: y, to: y }
    }
    case 'last7': {
      const from = new Date(today); from.setDate(today.getDate() - 6)
      return { from, to: today }
    }
    case 'thisWeek': {
      const dow = today.getDay() // 0 = Sunday
      const from = new Date(today); from.setDate(today.getDate() - dow)
      const to = new Date(from); to.setDate(from.getDate() + 6)
      return { from, to }
    }
    case 'thisMonth': {
      const from = new Date(today.getFullYear(), today.getMonth(), 1)
      const to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { from, to }
    }
    case 'last30': {
      const from = new Date(today); from.setDate(today.getDate() - 29)
      return { from, to: today }
    }
    case 'thisYear': {
      const from = new Date(today.getFullYear(), 0, 1)
      const to = new Date(today.getFullYear(), 11, 31)
      return { from, to }
    }
    default: return null
  }
}

function applyPreset(key) {
  if (key === 'all') {
    draftFrom.value = null
    draftTo.value = null
  } else {
    const r = presetRange(key)
    draftFrom.value = r.from
    draftTo.value = r.to
    viewMonth.value = r.from.getMonth()
    viewYear.value = r.from.getFullYear()
  }
}

function apply() {
  emit('update:from', toISO(draftFrom.value))
  emit('update:to', toISO(draftTo.value))
  emit('change', { from: toISO(draftFrom.value), to: toISO(draftTo.value) })
  open.value = false
}

function cancel() {
  // Restore from committed props
  draftFrom.value = parseISO(props.from)
  draftTo.value = parseISO(props.to)
  open.value = false
}

function toggle() {
  if (open.value) {
    cancel()
    return
  }
  // Hydrate draft from props
  draftFrom.value = parseISO(props.from)
  draftTo.value = parseISO(props.to)
  // Position calendar on the from-date (or today)
  const anchor = draftFrom.value || new Date()
  viewMonth.value = anchor.getMonth()
  viewYear.value = anchor.getFullYear()
  open.value = true
}

function onOutsideClick(e) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(e.target)) {
    cancel()
  }
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick))

// Sync draft when props change externally
watch(() => `${props.from}|${props.to}`, () => {
  draftFrom.value = parseISO(props.from)
  draftTo.value = parseISO(props.to)
})
</script>

<style scoped>
.drp { position: relative; display: inline-block; }

/* Trigger button */
.drp-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #fff;
  color: #0f172a;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  min-width: 220px;
}
.drp-trigger:hover { border-color: #cbd5e1; background: #fafbfc; }
.drp-trigger.active { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.drp-trigger > i.pi-calendar { font-size: 14px; color: #f97316; flex-shrink: 0; }

.drp-trigger-content { display: flex; flex-direction: column; align-items: flex-start; flex: 1; min-width: 0; line-height: 1.2; }
.drp-trigger-preset { font-size: 13px; font-weight: 700; color: #0f172a; }
.drp-trigger-range { font-size: 11.5px; color: #64748b; font-weight: 500; margin-top: 2px; }

.drp-trigger-chev { font-size: 10px; color: #94a3b8; transition: transform 0.2s; flex-shrink: 0; }
.drp-trigger-chev.flipped { transform: rotate(180deg); }

/* Popover */
.drp-pop {
  position: absolute;
  top: calc(100% + 6px);
  inset-inline-end: 0; /* RTL → opens to the LEFT side of the trigger */
  z-index: 50;
  display: grid;
  grid-template-columns: 140px 1fr;
  min-width: 480px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  box-shadow: 0 16px 40px -8px rgba(15, 23, 42, 0.18), 0 4px 12px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

/* Presets sidebar */
.drp-presets {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 8px;
  background: #fafbfc;
  border-inline-end: 1px solid #f1f5f9;
}
.drp-preset {
  padding: 9px 12px;
  border: none;
  background: none;
  text-align: start;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.12s;
}
.drp-preset:hover { background: rgba(249, 115, 22, 0.08); color: #ea580c; }
.drp-preset.active {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}

/* Calendar */
.drp-cal { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }

.drp-cal-nav { display: flex; align-items: center; justify-content: space-between; }
.drp-cal-nav h4 { font-size: 14px; font-weight: 800; color: #0f172a; margin: 0; }
.drp-cal-nav button {
  width: 28px; height: 28px; border-radius: 7px;
  border: 1px solid #e2e8f0; background: #fff; color: #475569;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.drp-cal-nav button:hover { background: #f8fafc; border-color: #cbd5e1; color: #f97316; }
.drp-cal-nav button i { font-size: 11px; }

.drp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.drp-cal-wd {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-align: center;
  padding: 6px 0;
}
.drp-cal-day {
  height: 32px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.12s;
  position: relative;
}
.drp-cal-day:hover { background: rgba(249, 115, 22, 0.1); color: #ea580c; }
.drp-cal-day.outside { color: #cbd5e1; }
.drp-cal-day.is-today { box-shadow: inset 0 0 0 1.5px rgba(249, 115, 22, 0.4); }

.drp-cal-day.in-range {
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
  border-radius: 0;
}
.drp-cal-day.is-start, .drp-cal-day.is-end {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}
.drp-cal-day.is-start { border-radius: 8px 0 0 8px; }
.drp-cal-day.is-end { border-radius: 0 8px 8px 0; }
.drp-cal-day.is-start.is-end { border-radius: 8px; }

/* Footer */
.drp-cal-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}
.drp-inputs { display: flex; gap: 6px; }
.drp-inputs input {
  width: 90px;
  height: 30px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  color: #1e293b;
  background: #fafbfc;
  outline: none;
  text-align: center;
}
.drp-inputs input::placeholder { color: #94a3b8; }

.drp-actions { display: flex; gap: 6px; }
.drp-btn-cancel, .drp-btn-apply {
  padding: 7px 16px;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.15s;
}
.drp-btn-cancel {
  background: #fff;
  border-color: #e2e8f0;
  color: #64748b;
}
.drp-btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; }
.drp-btn-apply {
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-color: #ea580c;
  color: #fff;
  box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
}
.drp-btn-apply:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }

/* Transition */
.drp-enter-active, .drp-leave-active {
  transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
.drp-enter-from, .drp-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

@media (max-width: 640px) {
  .drp-pop { grid-template-columns: 1fr; min-width: 320px; }
  .drp-presets { flex-direction: row; flex-wrap: wrap; border-inline-end: none; border-bottom: 1px solid #f1f5f9; }
  .drp-cal-foot { flex-direction: column; align-items: stretch; }
  .drp-actions { justify-content: flex-end; }
}
</style>
