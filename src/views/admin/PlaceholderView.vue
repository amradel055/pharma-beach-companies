<template>
  <div class="placeholder-page">
    <div class="placeholder-card">
      <div class="placeholder-icon">
        <i class="pi pi-wrench" />
      </div>
      <h2>{{ pageTitle }}</h2>
      <p>هذه الصفحة قيد التطوير وستكون متاحة قريباً</p>
      <RouterLink to="/admin" class="back-btn">
        <i class="pi pi-arrow-right" />
        العودة للوحة التحكم
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => route.meta?.title || 'قيد التطوير')
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
}

.placeholder-card {
  text-align: center;
  padding: 48px;
}

.placeholder-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: rgba(249, 115, 22, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.placeholder-icon i {
  font-size: 30px;
  color: #f97316;
}

.placeholder-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.placeholder-card p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 24px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 10px;
  background: #0f172a;
  color: #fff;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 600;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #1e293b;
  transform: translateY(-1px);
}
</style>
