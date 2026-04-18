import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const pendingDurationMinutes = ref(120)
  const contactPhone = ref('201234567890')
  const contactMessage = ref(
    'مرحباً، أريد تأكيد حجز شاليه رقم {chaletNumber} من {checkIn} إلى {checkOut}. رقم الحجز: {bookingId}',
  )
  const entryInstructions = ref(
    '1. يُرجى إبراز هذا التصريح عند بوابة الدخول\n2. التصريح صالح فقط خلال المدة المحددة\n3. يُمنع دخول الحيوانات الأليفة\n4. يُرجى الحفاظ على نظافة المكان\n5. الالتزام بأوقات الهدوء بعد الساعة 11 مساءً',
  )

  // R2: Financial fees
  const carFee = ref(50)
  const securityPermitFee = ref(100)

  // R2: Child age threshold
  const childAgeThreshold = ref(12)

  // R2: CS Timer thresholds (minutes)
  const csTimerGreenMax = ref(15)
  const csTimerOrangeMax = ref(30)

  // R2: Terms & Conditions
  const siteTerms = ref({ ar: { content: '', status: 'draft' }, en: { content: '', status: 'draft' } })
  const villageTerms = ref({ ar: { content: '', status: 'draft' }, en: { content: '', status: 'draft' } })

  function init() {
    const saved = localStorage.getItem('pb_settings')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.pendingDurationMinutes) pendingDurationMinutes.value = data.pendingDurationMinutes
        if (data.contactPhone) contactPhone.value = data.contactPhone
        if (data.contactMessage) contactMessage.value = data.contactMessage
        if (data.entryInstructions) entryInstructions.value = data.entryInstructions
        if (data.carFee !== undefined) carFee.value = data.carFee
        if (data.securityPermitFee !== undefined) securityPermitFee.value = data.securityPermitFee
        if (data.childAgeThreshold !== undefined) childAgeThreshold.value = data.childAgeThreshold
        if (data.csTimerGreenMax !== undefined) csTimerGreenMax.value = data.csTimerGreenMax
        if (data.csTimerOrangeMax !== undefined) csTimerOrangeMax.value = data.csTimerOrangeMax
        if (data.siteTerms) siteTerms.value = data.siteTerms
        if (data.villageTerms) villageTerms.value = data.villageTerms
      } catch {
        /* ignore */
      }
    }
  }

  function save() {
    localStorage.setItem(
      'pb_settings',
      JSON.stringify({
        pendingDurationMinutes: pendingDurationMinutes.value,
        contactPhone: contactPhone.value,
        contactMessage: contactMessage.value,
        entryInstructions: entryInstructions.value,
        carFee: carFee.value,
        securityPermitFee: securityPermitFee.value,
        childAgeThreshold: childAgeThreshold.value,
        csTimerGreenMax: csTimerGreenMax.value,
        csTimerOrangeMax: csTimerOrangeMax.value,
        siteTerms: siteTerms.value,
        villageTerms: villageTerms.value,
      }),
    )
  }

  init()

  return {
    pendingDurationMinutes,
    contactPhone,
    contactMessage,
    entryInstructions,
    carFee,
    securityPermitFee,
    childAgeThreshold,
    csTimerGreenMax,
    csTimerOrangeMax,
    siteTerms,
    villageTerms,
    save,
  }
})
