<template>
  <div class="terms-page">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">شروط وأحكام القرية</h1>
        <p class="page-desc">تعديل الشروط والأحكام الخاصة بالقرية</p>
      </div>
      <div class="header-status">
        <span :class="['publish-badge', currentStatus]">
          <i :class="currentStatus === 'published' ? 'pi pi-check-circle' : 'pi pi-file-edit'" />
          {{ currentStatus === 'published' ? 'منشور' : 'مسودة' }}
        </span>
      </div>
    </div>

    <!-- Language Tabs -->
    <div class="tabs-card">
      <div class="tabs-row">
        <button :class="['tab-btn', { active: activeTab === 'ar' }]" @click="activeTab = 'ar'">
          <i class="pi pi-flag" /> العربية
        </button>
        <button :class="['tab-btn', { active: activeTab === 'en' }]" @click="activeTab = 'en'">
          <i class="pi pi-globe" /> English
        </button>
      </div>

      <!-- Arabic Tab -->
      <div v-show="activeTab === 'ar'" class="tab-content">
        <div class="field">
          <label>المحتوى (عربي)</label>
          <textarea
            v-model="arContent"
            rows="14"
            placeholder="أدخل شروط وأحكام القرية بالعربية..."
            class="terms-textarea"
          />
        </div>
      </div>

      <!-- English Tab -->
      <div v-show="activeTab === 'en'" class="tab-content">
        <div class="field">
          <label>Content (English)</label>
          <textarea
            v-model="enContent"
            rows="14"
            placeholder="Enter village terms and conditions in English..."
            class="terms-textarea"
            dir="ltr"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button class="btn-draft" @click="saveAs('draft')">
          <i class="pi pi-file-edit" />
          حفظ كمسودة
        </button>
        <button class="btn-submit" @click="saveAs('published')">
          <i class="pi pi-check" />
          نشر
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useToastStore } from '@/stores/toast'

const settings = useSettingsStore()
const toast = useToastStore()

const activeTab = ref('ar')
const arContent = ref(settings.villageTerms.ar?.content || '')
const enContent = ref(settings.villageTerms.en?.content || '')

const currentStatus = computed(() => settings.villageTerms.ar?.status || 'draft')

function saveAs(status) {
  settings.villageTerms = {
    ar: { content: arContent.value, status },
    en: { content: enContent.value, status },
  }
  settings.save()
  toast.success(status === 'published' ? 'تم نشر شروط وأحكام القرية' : 'تم حفظ المسودة')
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

.publish-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
.publish-badge.published { background: rgba(16, 185, 129, 0.08); color: #10b981; }
.publish-badge.draft { background: rgba(234, 179, 8, 0.08); color: #eab308; }

.tabs-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 24px; }

.tabs-row { display: flex; gap: 8px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
.tab-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; border-radius: 10px; border: 1px solid #e2e8f0; background: #fafbfc; color: #64748b; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; }
.tab-btn.active { background: rgba(249, 115, 22, 0.06); border-color: #f97316; color: #f97316; }
.tab-btn:hover:not(.active) { background: #f1f5f9; }

.tab-content { margin-bottom: 20px; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 13px; font-weight: 600; color: #475569; }

.terms-textarea { width: 100%; padding: 14px; border: 1px solid #e2e8f0; border-radius: 10px; font-size: 14px; font-family: inherit; color: #1e293b; background: #fafbfc; outline: none; transition: all 0.2s; resize: vertical; line-height: 1.8; }
.terms-textarea:focus { border-color: #f97316; background: #fff; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08); }
.terms-textarea::placeholder { color: #94a3b8; }

.form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 20px; border-top: 1px solid #f1f5f9; }

.btn-draft { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; background: #f1f5f9; color: #475569; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.15s; }
.btn-draft:hover { background: #e2e8f0; }

.btn-submit { display: inline-flex; align-items: center; gap: 8px; padding: 10px 28px; background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; border-radius: 10px; font-size: 13.5px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25); }
.btn-submit:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35); }

@media (max-width: 768px) {
  .page-header { flex-direction: column; gap: 12px; }
  .tabs-card { padding: 16px; }
}
</style>
