<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">الإعدادات العامة</h1>
        <p class="page-desc">إدارة الإعدادات الأساسية للنظام</p>
      </div>
    </div>

    <!-- Settings Form -->
    <div class="settings-card">
      <form @submit.prevent="handleSave" novalidate>
        <!-- Financial Settings -->
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-wallet" /> الرسوم المالية</h4>
          <div class="fields-grid">
            <div class="field">
              <label>رسوم السيارة (جنيه)</label>
              <input v-model.number="form.carFee" type="number" min="0" placeholder="50" />
            </div>
            <div class="field">
              <label>رسوم تصريح الأمن (جنيه)</label>
              <input v-model.number="form.securityPermitFee" type="number" min="0" placeholder="100" />
            </div>
          </div>
        </div>

        <!-- Booking Settings -->
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-clock" /> إعدادات الحجز</h4>
          <div class="fields-grid">
            <div class="field">
              <label>مدة الانتظار (بالدقائق)</label>
              <input v-model.number="form.pendingDurationMinutes" type="number" min="1" placeholder="120" />
              <span class="field-hint">المدة المسموحة قبل انتهاء صلاحية الحجز المعلق</span>
            </div>
            <div class="field">
              <label>رقم التواصل</label>
              <input v-model="form.contactPhone" type="tel" placeholder="201234567890" dir="ltr" />
            </div>
          </div>
        </div>

        <!-- Child & Timer Settings -->
        <div class="form-section">
          <h4 class="section-label"><i class="pi pi-cog" /> إعدادات إضافية</h4>
          <div class="fields-grid">
            <div class="field">
              <label>الحد الأقصى لسن الطفل</label>
              <input v-model.number="form.childAgeThreshold" type="number" min="0" max="18" placeholder="12" />
              <span class="field-hint">السن الذي يُعتبر فوقه بالغ</span>
            </div>
            <div class="field">
              <label>حد المؤقت الأخضر (دقائق)</label>
              <input v-model.number="form.csTimerGreenMax" type="number" min="1" placeholder="15" />
              <span class="field-hint">المدة القصوى للون الأخضر في مؤقت خدمة العملاء</span>
            </div>
            <div class="field">
              <label>حد المؤقت البرتقالي (دقائق)</label>
              <input v-model.number="form.csTimerOrangeMax" type="number" min="1" placeholder="30" />
              <span class="field-hint">المدة القصوى للون البرتقالي قبل التحول للأحمر</span>
            </div>
          </div>
        </div>

        <!-- Save -->
        <div class="form-actions">
          <button type="submit" class="btn-submit">
            <i class="pi pi-check" />
            حفظ الإعدادات
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'

const settings = useSettingsStore()
const toast = useToastStore()

const form = reactive({
  carFee: settings.carFee,
  securityPermitFee: settings.securityPermitFee,
  pendingDurationMinutes: settings.pendingDurationMinutes,
  contactPhone: settings.contactPhone,
  childAgeThreshold: settings.childAgeThreshold,
  csTimerGreenMax: settings.csTimerGreenMax,
  csTimerOrangeMax: settings.csTimerOrangeMax,
})

function handleSave() {
  settings.carFee = Number(form.carFee) || 0
  settings.securityPermitFee = Number(form.securityPermitFee) || 0
  settings.pendingDurationMinutes = Number(form.pendingDurationMinutes) || 120
  settings.contactPhone = form.contactPhone || ''
  settings.childAgeThreshold = Number(form.childAgeThreshold) || 12
  settings.csTimerGreenMax = Number(form.csTimerGreenMax) || 15
  settings.csTimerOrangeMax = Number(form.csTimerOrangeMax) || 30
  settings.save()
  toast.success('تم حفظ الإعدادات بنجاح')
}
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.settings-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 28px; }

.form-section { margin-bottom: 28px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
.section-label i { font-size: 15px; color: #f97316; }

.fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }
.field input { height: 42px; padding: 0 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 13.5px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; }
.field input:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.field input::placeholder { color: #94a3b8; }
.field-hint { font-size: 11.5px; color: #94a3b8; }

.form-actions { display: flex; justify-content: flex-end; padding-top: 20px; border-top: 1px solid #f1f5f9; }

.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35); }

@media (max-width: 768px) {
  .fields-grid { grid-template-columns: 1fr; }
  .settings-card { padding: 20px; }
}
</style>
