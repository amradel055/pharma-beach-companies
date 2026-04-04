<template>
  <div class="booking-page">
    <div class="chat-container" ref="chatContainer">
      <TransitionGroup name="chat-msg" tag="div" class="chat-messages">
        <div
          v-for="msg in chatMessages"
          :key="msg.id"
          :class="['chat-row', msg.type]"
        >
          <!-- Bot message -->
          <template v-if="msg.type === 'bot'">
            <div class="bot-avatar">
              <i class="pi pi-building" />
            </div>
            <div class="bubble bot-bubble">
              <p v-html="msg.text" />
            </div>
          </template>

          <!-- Typing indicator -->
          <template v-else-if="msg.type === 'typing'">
            <div class="bot-avatar">
              <i class="pi pi-building" />
            </div>
            <div class="bubble bot-bubble typing-bubble">
              <span class="dot" />
              <span class="dot" />
              <span class="dot" />
            </div>
          </template>

          <!-- User message -->
          <template v-else-if="msg.type === 'user'">
            <div class="user-avatar">
              <i class="pi pi-user" />
            </div>
            <div
              :class="['bubble user-bubble', { 'skip-bubble': msg.isSkip, editable: msg.stepIndex !== undefined }]"
              @click="onEditAnswer(msg)"
            >
              {{ msg.text }}
              <i v-if="msg.stepIndex !== undefined" class="pi pi-pencil bubble-edit" />
            </div>
          </template>

          <!-- Options (multi-select chips) -->
          <template v-else-if="msg.type === 'options'">
            <div class="options-container">
              <span class="options-hint">يمكنك اختيار أكثر من خيار</span>
              <div class="chips-grid">
                <button
                  v-for="opt in msg.options"
                  :key="opt.label"
                  :class="['chip', { active: pendingSelections.includes(opt.label) }]"
                  @click="toggleOption(opt.label)"
                >
                  <i :class="opt.icon" />
                  <span>{{ opt.label }}</span>
                  <i v-if="pendingSelections.includes(opt.label)" class="pi pi-check chip-check" />
                </button>
              </div>
              <div class="options-actions">
                <button
                  v-if="pendingSelections.length > 0"
                  class="confirm-btn"
                  @click="confirmSelection(msg.step)"
                >
                  <i class="pi pi-check" />
                  تأكيد ({{ pendingSelections.length }})
                </button>
                <button class="skip-btn" @click="skipStep(msg.step)">
                  تخطي
                </button>
              </div>
            </div>
          </template>

          <!-- Date picker -->
          <template v-else-if="msg.type === 'datepicker'">
            <div class="options-container">
              <div class="datepicker-wrap">
                <div class="date-selected-hint" v-if="dateRange && dateRange[0]">
                  <i class="pi pi-calendar" />
                  <span v-if="dateRange[1]">
                    {{ dateRange[0].toLocaleDateString('ar-EG') }} → {{ dateRange[1].toLocaleDateString('ar-EG') }}
                  </span>
                  <span v-else>اختار تاريخ النهاية</span>
                </div>
                <DatePicker
                  v-model="dateRange"
                  selectionMode="range"
                  :inline="true"
                  :minDate="minDate"
                  dateFormat="yy/mm/dd"
                  :numberOfMonths="1"
                  :manualInput="false"
                />
              </div>
              <div class="options-actions">
                <button
                  v-if="dateRange && dateRange[0] && dateRange[1]"
                  class="confirm-btn"
                  @click="confirmDate(msg.step)"
                >
                  <i class="pi pi-check" />
                  تأكيد
                </button>
                <button class="skip-btn" @click="skipStep(msg.step)">
                  تخطي
                </button>
              </div>
            </div>
          </template>

          <!-- Results -->
          <template v-else-if="msg.type === 'results'">
            <div class="results-container" ref="resultsRef">
              <div class="results-header">
                <span class="results-count" v-if="filteredChalets.length">
                  <i class="pi pi-check-circle" />
                  تم العثور على {{ filteredChalets.length }} شاليه
                </span>
                <button class="reset-btn-sm" @click="resetWizard" v-if="filteredChalets.length">
                  <i class="pi pi-refresh" />
                  بحث جديد
                </button>
              </div>
              <div v-if="filteredChalets.length" class="results-grid">
                <RouterLink
                  v-for="chalet in filteredChalets"
                  :key="chalet.id"
                  :to="getChaletLink(chalet.id)"
                  class="result-card"
                >
                  <div class="result-img">
                    <img :src="chalet.image" :alt="chalet.name" />
                    <span class="result-badge">{{ chalet.finishing }}</span>
                  </div>
                  <div class="result-body">
                    <div class="result-top">
                      <h3>{{ chalet.name }}</h3>
                      <div class="result-price">
                        <span class="price-amount">{{ chalet.price }}</span>
                        <span class="price-unit">ج.م / ليلة</span>
                      </div>
                    </div>
                    <div class="result-details">
                      <span class="detail"><i class="pi pi-building" /> {{ chalet.floor }}</span>
                      <span class="detail"><i class="pi pi-th-large" /> {{ chalet.rooms }} غرف</span>
                      <span class="detail" v-for="v in chalet.views" :key="v"><i class="pi pi-eye" /> {{ v }}</span>
                    </div>
                  </div>
                </RouterLink>
              </div>
              <div v-else class="no-results">
                <div class="no-results-icon">
                  <i class="pi pi-search" />
                </div>
                <p>لم نجد شاليهات تطابق اختياراتك</p>
                <span class="no-results-hint">جرب تغيير بعض الاختيارات للحصول على نتائج أكثر</span>
                <button class="reset-btn" @click="resetWizard">
                  <i class="pi pi-refresh" />
                  إعادة البحث
                </button>
              </div>
            </div>
          </template>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DatePicker from 'primevue/datepicker'
import { chalets as mockChalets } from '@/data/chalets'

// ── Chat State ──
const chatContainer = ref(null)
const resultsRef = ref(null)
const chatMessages = ref([])
const pendingSelections = ref([])
const dateRange = ref(null)
const minDate = new Date()
let msgId = 0

const selections = reactive({
  floor: null,
  rooms: null,
  finishing: null,
  view: null,
  date: null,
})

// ── Mock data imported from @/data/chalets ──

// ── Wizard Steps ──
const steps = [
  {
    key: 'floor',
    question: 'ما الدور المفضل لك؟',
    type: 'multi',
    options: [
      { label: 'الأرضي', icon: 'pi pi-home' },
      { label: 'الأول', icon: 'pi pi-building' },
      { label: 'الثاني', icon: 'pi pi-building' },
      { label: 'الثالث', icon: 'pi pi-building' },
    ],
  },
  {
    key: 'rooms',
    question: 'كم عدد الغرف اللي تحتاجها؟',
    type: 'multi',
    options: [
      { label: '1 غرف', icon: 'pi pi-th-large' },
      { label: '2 غرف', icon: 'pi pi-th-large' },
      { label: '3 غرف', icon: 'pi pi-th-large' },
      { label: '4 غرف', icon: 'pi pi-th-large' },
    ],
  },
  {
    key: 'finishing',
    question: 'ما مستوى التشطيب المطلوب؟',
    type: 'multi',
    options: [
      { label: 'فاخر', icon: 'pi pi-star' },
      { label: 'متوسط', icon: 'pi pi-star-half-fill' },
      { label: 'اقتصادي', icon: 'pi pi-wallet' },
    ],
  },
  {
    key: 'view',
    question: 'ما الإطلالة اللي تفضلها؟',
    type: 'multi',
    options: [
      { label: 'بحر', icon: 'pi pi-sun' },
      { label: 'حمام سباحة', icon: 'pi pi-wave-pulse' },
      { label: 'حديقة', icon: 'pi pi-objects-column' },
      { label: 'شارع', icon: 'pi pi-map' },
    ],
  },
  {
    key: 'date',
    question: 'اختار تاريخ الحجز المناسب ليك',
    type: 'date',
  },
]

let currentStepIndex = -1
let resolveUserAction = null
let wizardAbort = null

// ── Helpers ──
function addMessage(msg) {
  chatMessages.value.push({ ...msg, id: ++msgId })
  scrollToBottom()
}

function removeLastMessage() {
  chatMessages.value.pop()
}

async function scrollToBottom() {
  await nextTick()
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  })
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function showTypingThenMessage(text) {
  addMessage({ type: 'typing' })
  await sleep(600)
  removeLastMessage()
  addMessage({ type: 'bot', text })
}

// ── Filter Logic ──
const filteredChalets = ref([])

function getChaletLink(id) {
  const link = { name: 'chalet-details', params: { id } }
  if (selections.date && selections.date[0] && selections.date[1]) {
    link.query = {
      checkIn: selections.date[0].toISOString().split('T')[0],
      checkOut: selections.date[1].toISOString().split('T')[0],
    }
  }
  return link
}

function computeFilteredChalets() {
  let results = [...mockChalets]

  if (selections.floor) {
    results = results.filter((c) => selections.floor.includes(c.floor))
  }
  if (selections.rooms) {
    const nums = selections.rooms.map((r) => parseInt(r))
    results = results.filter((c) => nums.includes(c.rooms))
  }
  if (selections.finishing) {
    results = results.filter((c) => selections.finishing.includes(c.finishing))
  }
  if (selections.view) {
    results = results.filter((c) =>
      c.views.some((v) => selections.view.includes(v)),
    )
  }

  filteredChalets.value = results
}

// ── User Actions ──
function toggleOption(opt) {
  const idx = pendingSelections.value.indexOf(opt)
  if (idx === -1) {
    pendingSelections.value.push(opt)
  } else {
    pendingSelections.value.splice(idx, 1)
  }
}

function confirmSelection(stepKey) {
  const selected = [...pendingSelections.value]
  selections[stepKey] = selected
  pendingSelections.value = []

  // Remove interactive message, add user bubble
  removeLastMessage()
  addMessage({ type: 'user', text: selected.join('، '), stepIndex: currentStepIndex })

  if (resolveUserAction) resolveUserAction()
}

function skipStep(stepKey) {
  selections[stepKey] = null
  pendingSelections.value = []

  removeLastMessage()
  addMessage({ type: 'user', text: 'تخطي', isSkip: true, stepIndex: currentStepIndex })

  if (resolveUserAction) resolveUserAction()
}

function confirmDate(stepKey) {
  if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
    const fmt = (d) => d.toLocaleDateString('ar-EG')
    const text = `${fmt(dateRange.value[0])} → ${fmt(dateRange.value[1])}`
    selections[stepKey] = dateRange.value
  } else {
    selections[stepKey] = null
  }

  removeLastMessage()
  if (selections[stepKey]) {
    const fmt = (d) => d.toLocaleDateString('ar-EG')
    addMessage({
      type: 'user',
      text: `${fmt(dateRange.value[0])} → ${fmt(dateRange.value[1])}`,
      stepIndex: currentStepIndex,
    })
  } else {
    addMessage({ type: 'user', text: 'تخطي', isSkip: true, stepIndex: currentStepIndex })
  }

  if (resolveUserAction) resolveUserAction()
}

// ── Wizard Engine ──
function waitForUser() {
  return new Promise((resolve) => {
    resolveUserAction = resolve
  })
}

function onEditAnswer(msg) {
  if (msg.stepIndex === undefined) return

  // Abort current wizard if running
  if (wizardAbort) wizardAbort()
  if (resolveUserAction) {
    resolveUserAction()
    resolveUserAction = null
  }

  // Find the user message for this step
  const msgIndex = chatMessages.value.findIndex(
    (m) => m.type === 'user' && m.stepIndex === msg.stepIndex,
  )
  if (msgIndex === -1) return

  // Find the bot question before the user answer
  let trimFrom = msgIndex
  for (let i = msgIndex - 1; i >= 0; i--) {
    if (chatMessages.value[i].type === 'bot') {
      trimFrom = i
      break
    }
  }
  chatMessages.value = chatMessages.value.slice(0, trimFrom)

  // Restore old selection as pending so chips appear pre-selected
  const stepKey = steps[msg.stepIndex].key
  const oldSelection = selections[stepKey]
  if (Array.isArray(oldSelection)) {
    pendingSelections.value = [...oldSelection]
  } else {
    pendingSelections.value = []
  }

  // Clear selections from this step onward
  for (let i = msg.stepIndex; i < steps.length; i++) {
    selections[steps[i].key] = null
  }
  dateRange.value = null
  filteredChalets.value = []

  // Restart wizard from this step — skip typing for the first step
  runWizardFrom(msg.stepIndex, true)
}

async function runWizardFrom(startIndex, skipFirstTyping = false) {
  let aborted = false
  wizardAbort = () => { aborted = true }

  if (!skipFirstTyping) await sleep(300)

  for (let i = startIndex; i < steps.length; i++) {
    if (aborted) return
    currentStepIndex = i
    const step = steps[i]

    if (skipFirstTyping && i === startIndex) {
      addMessage({ type: 'bot', text: step.question })
    } else {
      await showTypingThenMessage(step.question)
      if (aborted) return
      await sleep(200)
    }

    if (step.type === 'multi') {
      addMessage({ type: 'options', options: step.options, step: step.key })
    } else if (step.type === 'date') {
      dateRange.value = null
      addMessage({ type: 'datepicker', step: step.key })
    }

    if (aborted) return
    await waitForUser()
    if (aborted) return
    await sleep(300)
  }

  if (aborted) return
  await showTypingThenMessage('تم! خليني أعرض لك النتائج... 🔍')
  await sleep(400)
  computeFilteredChalets()
  addMessage({ type: 'results' })
  await nextTick()
  await sleep(100)
  if (resultsRef.value) {
    resultsRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  wizardAbort = null
}

async function runWizard() {
  // Welcome
  await showTypingThenMessage(
    'أهلاً بيك في فارما بيتش! 🏖️<br>هساعدك تلاقي الشاليه المثالي ليك.',
  )
  await sleep(400)
  runWizardFrom(0)
}

async function resetWizard() {
  chatMessages.value = []
  pendingSelections.value = []
  dateRange.value = null
  filteredChalets.value = []
  currentStepIndex = -1
  selections.floor = null
  selections.rooms = null
  selections.finishing = null
  selections.view = null
  selections.date = null

  await nextTick()
  runWizard()
}

// ── Init ──
onMounted(() => {
  runWizard()
})
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  flex-direction: column;
}

.chat-container {
  flex: 1;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 7rem 2rem 2rem;
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
  justify-content: flex-end;
}

/* ── Chat Row ── */
.chat-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.chat-row.bot,
.chat-row.typing {
  flex-direction: row;
  justify-content: flex-start;
}

.chat-row.user {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

.chat-row.options,
.chat-row.single-options,
.chat-row.datepicker,
.chat-row.results {
  justify-content: center;
}

/* ── Bot Avatar ── */
.bot-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 2px 10px rgba(var(--primary-rgb), 0.25);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 2px 10px rgba(var(--secondary-rgb), 0.25);
}

/* ── Bubbles ── */
.bubble {
  max-width: 75%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
  line-height: 1.6;
  font-size: 0.92rem;
}

.bot-bubble {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px 4px 16px 16px;
  color: #1e293b;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.user-bubble {
  background: linear-gradient(135deg, var(--secondary), var(--secondary-dark));
  color: #fff;
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 2px 12px rgba(var(--secondary-rgb), 0.25);
}

.skip-bubble {
  background: linear-gradient(135deg, #94a3b8, #64748b);
  box-shadow: 0 2px 12px rgba(100, 116, 139, 0.25);
}

.user-bubble.editable {
  cursor: pointer;
}

.user-bubble.editable:hover {
  filter: brightness(1.1);
}

.bubble-edit {
  font-size: 0.65rem;
  opacity: 0.5;
  margin-right: 0.3rem;
  transition: opacity 0.2s ease;
}

.user-bubble:hover .bubble-edit {
  opacity: 1;
}

/* ── Typing Indicator ── */
.typing-bubble {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.85rem 1.2rem;
}

.typing-bubble .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  animation: bounce-dot 1.4s ease-in-out infinite;
}

.typing-bubble .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce-dot {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-6px);
  }
}

/* ── Options ── */
.options-container {
  width: 100%;
  max-width: 520px;
}

.options-hint {
  display: block;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.6rem;
  padding-right: 0.25rem;
}

.chips-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.1rem;
  border-radius: 14px;
  border: 1.5px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #334155;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.04);
  position: relative;
}

.chip i:first-child {
  font-size: 0.8rem;
  opacity: 0.6;
}

.chip-check {
  font-size: 0.7rem;
  margin-right: -0.15rem;
}

.chip:hover {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 3px 12px rgba(var(--primary-rgb), 0.12);
  transform: translateY(-1px);
}

.chip.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 3px 14px rgba(var(--primary-rgb), 0.35);
  transform: translateY(-1px);
}

.chip.active i:first-child {
  opacity: 1;
}

.options-actions {
  display: flex;
  gap: 0.5rem;
}

.confirm-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 1.5rem;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.3);
}

.confirm-btn i {
  font-size: 0.8rem;
}

.confirm-btn:hover {
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.45);
  transform: translateY(-1px);
}

.skip-btn {
  padding: 0.55rem 1.5rem;
  border-radius: 50px;
  border: none;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.skip-btn:hover {
  background: #94a3b8;
  color: #fff;
}

/* ── Date Picker ── */
.datepicker-wrap {
  margin-bottom: 0.75rem;
  background: #fff;
  border-radius: 18px;
  padding: 1.15rem;
  border: 1px solid #e8e8e8;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.06);
}

.date-selected-hint {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  margin-bottom: 0.85rem;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 700;
  color: #166534;
}

.date-selected-hint i {
  font-size: 0.82rem;
  color: #16a34a;
}

.datepicker-wrap :deep(.p-datepicker) {
  border: none;
  background: transparent;
  width: 100%;
  font-family: 'Cairo', sans-serif;
}

.datepicker-wrap :deep(.p-datepicker-header) {
  padding: 0.25rem 0 0.6rem;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 0.4rem;
}

.datepicker-wrap :deep(.p-datepicker-title) {
  font-weight: 800;
  font-size: 0.92rem;
  color: #111;
  gap: 0.4rem;
}

.datepicker-wrap :deep(.p-datepicker-prev-button),
.datepicker-wrap :deep(.p-datepicker-next-button) {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  color: #444;
  transition: all 0.15s ease;
}

.datepicker-wrap :deep(.p-datepicker-prev-button:hover),
.datepicker-wrap :deep(.p-datepicker-next-button:hover) {
  background: #e8f5e9;
  color: #2e7d32;
}

.datepicker-wrap :deep(.p-datepicker-day-cell) {
  padding: 2px;
}

.datepicker-wrap :deep(.p-datepicker-day) {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.datepicker-wrap :deep(.p-datepicker-day:not(.p-disabled):not(.p-datepicker-day-selected):hover) {
  background: #e8f5e9;
  color: #2e7d32;
}

.datepicker-wrap :deep(.p-datepicker-day.p-datepicker-day-selected) {
  background: #16a34a;
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(22, 163, 74, 0.3);
  font-weight: 700;
}

.datepicker-wrap :deep(.p-datepicker-day.p-datepicker-day-selected-range) {
  background: #dcfce7;
  color: #166534;
  border-radius: 0;
}


.datepicker-wrap :deep(.p-datepicker-weekday-cell) {
  padding: 0.35rem 0;
}

.datepicker-wrap :deep(.p-datepicker-weekday) {
  font-size: 0.72rem;
  font-weight: 800;
  color: #aaa;
  text-transform: uppercase;
}

.datepicker-wrap :deep(.p-datepicker-day.p-disabled) {
  opacity: 0.25;
}

/* ── Results ── */
.results-container {
  width: 100%;
  min-height: 100vh;
  padding-top: 8rem;
  margin-top: -8rem;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.results-count {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.88rem;
  font-weight: 700;
  color: #16a34a;
}

.results-count i {
  font-size: 1rem;
}

.reset-btn-sm {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 1rem;
  border-radius: 50px;
  border: 1.5px solid rgba(var(--secondary-rgb), 0.3);
  background: rgba(255, 255, 255, 0.7);
  color: var(--secondary);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.reset-btn-sm:hover {
  background: var(--secondary);
  color: #fff;
  border-color: var(--secondary);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

a.result-card {
  text-decoration: none;
  color: inherit;
  display: block;
}

.result-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.result-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.result-img {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.result-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.result-card:hover .result-img img {
  transform: scale(1.05);
}

.result-badge {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  padding: 0.2rem 0.65rem;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 600;
}

.result-body {
  padding: 0.85rem;
}

.result-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.result-top h3 {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
}

.result-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}

.price-amount {
  font-size: 1rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}

.price-unit {
  font-size: 0.65rem;
  color: #94a3b8;
  font-weight: 600;
}

.result-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.55rem;
  border-radius: 50px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 600;
}

.detail i {
  font-size: 0.65rem;
  color: #94a3b8;
}

/* ── No Results ── */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.no-results-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #94a3b8;
}

.no-results p {
  color: #334155;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.no-results-hint {
  display: block;
  color: #94a3b8;
  font-size: 0.82rem;
  margin-bottom: 1.25rem;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 2rem;
  border-radius: 50px;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.3);
}

.reset-btn:hover {
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.45);
  transform: translateY(-1px);
}

/* ── Transitions ── */
.chat-msg-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chat-msg-leave-active {
  transition: all 0.15s ease-in;
}

.chat-msg-enter-from {
  opacity: 0;
  transform: translateY(16px);
}

.chat-msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .chat-container {
    padding: 1rem 0.75rem 1.5rem;
  }

  .bubble {
    max-width: 90%;
    font-size: 0.88rem;
  }

  .bot-avatar,
  .user-avatar {
    width: 32px;
    height: 32px;
  }

  .user-avatar {
    font-size: 0.75rem;
  }

  .results-grid {
    grid-template-columns: 1fr;
  }

  .result-img {
    height: 150px;
  }

  .chips-grid {
    gap: 0.4rem;
  }

  .chip {
    padding: 0.5rem 0.85rem;
    font-size: 0.8rem;
    border-radius: 12px;
  }
}
</style>
