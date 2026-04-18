<template>
  <div class="terms-public-page">
    <div class="terms-container">
      <div class="terms-card">
        <div class="terms-header">
          <h1 class="terms-title">الشروط والأحكام</h1>
        </div>
        <div class="terms-body">
          <div v-if="content" v-html="content" class="terms-content" />
          <div v-else class="terms-empty">
            <i class="pi pi-file" />
            <p>لا توجد شروط وأحكام متاحة حالياً</p>
          </div>
        </div>
        <div class="terms-footer">
          <RouterLink to="/" class="back-link">
            <i class="pi pi-arrow-right" />
            العودة للرئيسية
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()

const content = computed(() => settings.siteTerms?.ar?.content || '')
</script>

<style scoped>
.terms-public-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 40px 20px;
  direction: rtl;
}

.terms-container {
  max-width: 800px;
  margin: 0 auto;
}

.terms-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
}

.terms-header {
  padding: 28px 32px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
}

.terms-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.terms-body {
  padding: 32px;
}

.terms-content {
  font-size: 15px;
  line-height: 2;
  color: #334155;
}

.terms-content :deep(h1),
.terms-content :deep(h2),
.terms-content :deep(h3) {
  color: #0f172a;
  margin-top: 24px;
  margin-bottom: 12px;
}

.terms-content :deep(p) {
  margin-bottom: 12px;
}

.terms-content :deep(ul),
.terms-content :deep(ol) {
  padding-right: 20px;
  margin-bottom: 12px;
}

.terms-empty {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}

.terms-empty i {
  font-size: 40px;
  margin-bottom: 12px;
  display: block;
}

.terms-empty p {
  font-size: 15px;
  margin: 0;
}

.terms-footer {
  padding: 20px 32px;
  border-top: 1px solid #f1f5f9;
  text-align: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #f97316;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.back-link:hover {
  opacity: 0.8;
}

@media (max-width: 768px) {
  .terms-public-page { padding: 20px 12px; }
  .terms-header { padding: 20px; }
  .terms-body { padding: 20px; }
  .terms-title { font-size: 20px; }
}
</style>
