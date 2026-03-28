<template>
  <div class="empty-state">
    <div class="empty-icon" :style="{ background: iconBg }">
      <i :class="icon" :style="{ color: iconColor }" />
    </div>
    <h3>{{ title }}</h3>
    <p v-if="message">{{ message }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'لا توجد بيانات' },
  message: { type: String, default: '' },
  icon: { type: String, default: 'pi pi-inbox' },
  iconColor: { type: String, default: '#94a3b8' },
  iconBg: { type: String, default: 'rgba(148, 163, 184, 0.08)' },
})
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-icon i {
  font-size: 28px;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px;
}

.empty-state p {
  font-size: 13.5px;
  color: #94a3b8;
  margin: 0 0 16px;
}
</style>
