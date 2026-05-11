<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">الملف الشخصي</h1>
      <p class="page-desc">بيانات حسابك من الخادم</p>
    </div>

    <!-- Identity card -->
    <div class="profile-card">
      <div class="profile-top">
        <div class="profile-avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="profile-info">
          <h2>{{ auth.user?.name || '—' }}</h2>
          <div class="profile-tags">
            <span class="profile-role">{{ roleLabel }}</span>
            <span v-if="auth.user?.user_type" class="profile-type">{{ auth.user.user_type }}</span>
          </div>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-envelope" /></div>
          <div class="detail-content">
            <span class="detail-label">البريد الإلكتروني</span>
            <span class="detail-value" dir="ltr">{{ auth.user?.email || '—' }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-user" /></div>
          <div class="detail-content">
            <span class="detail-label">الاسم الأول</span>
            <span class="detail-value">{{ auth.user?.first_name || '—' }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-user" /></div>
          <div class="detail-content">
            <span class="detail-label">الاسم الأخير</span>
            <span class="detail-value">{{ auth.user?.last_name || '—' }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-shield" /></div>
          <div class="detail-content">
            <span class="detail-label">الدور</span>
            <span class="detail-value">{{ roleLabel }}</span>
          </div>
        </div>

        <div class="detail-item detail-item--wide">
          <div class="detail-icon"><i class="pi pi-id-card" /></div>
          <div class="detail-content">
            <span class="detail-label">مُعرّف المستخدم</span>
            <span class="detail-value detail-value--mono" dir="ltr">{{ auth.user?.id || '—' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Permissions -->
    <div v-if="permissions.length" class="perms-card">
      <h3 class="card-title">
        <i class="pi pi-key" />
        الصلاحيات
        <span class="perms-count">{{ permissions.length }}</span>
      </h3>
      <div class="perms-grid">
        <span v-for="p in permissions" :key="p" class="perm-pill">
          <i class="pi pi-check" />
          {{ p }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/constants/roles'

const auth = useAuthStore()

const roleLabel = computed(() => ROLE_LABELS[auth.user?.role] || auth.user?.role || 'مستخدم')
const userInitial = computed(() => auth.user?.name?.charAt(0) || auth.user?.email?.charAt(0) || '?')
const permissions = computed(() => auth.user?.permissions || [])
</script>

<style scoped>
.page-header { margin-bottom: 24px; }
.page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.page-desc { font-size: 13.5px; color: #94a3b8; margin: 0; }

/* Profile Card */
.profile-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 16px;
  animation: cardIn 0.4s ease both;
}

.profile-top {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.25);
  text-transform: uppercase;
}

.profile-info h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px;
}

.profile-tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.profile-role {
  display: inline-flex;
  padding: 4px 14px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.08);
  color: #ea580c;
  font-size: 13px;
  font-weight: 600;
}

.profile-type {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 8px;
  background: rgba(14, 165, 233, 0.08);
  color: #0284c7;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.profile-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fafbfc;
  border: 1px solid #f1f5f9;
  transition: all 0.15s;
  min-width: 0;
}

.detail-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.detail-item--wide {
  grid-column: 1 / -1;
}

.detail-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-icon i {
  font-size: 16px;
  color: #f97316;
}

.detail-content {
  min-width: 0;
  flex: 1;
}

.detail-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  margin-bottom: 2px;
}

.detail-value {
  display: block;
  font-size: 14px;
  color: #1e293b;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.detail-value--mono {
  font-family: 'Courier New', monospace;
  font-size: 12.5px;
  letter-spacing: 0.01em;
}

/* Permissions card */
.perms-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 28px;
  animation: cardIn 0.4s ease both;
  animation-delay: 0.1s;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 20px;
}

.card-title i {
  font-size: 16px;
  color: #f97316;
}

.perms-count {
  margin-inline-start: auto;
  padding: 2px 10px;
  background: rgba(249, 115, 22, 0.08);
  color: #ea580c;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.perms-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.perm-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.02em;
}

.perm-pill i {
  font-size: 10px;
  color: #16a34a;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .profile-details { grid-template-columns: 1fr; }
  .profile-avatar { width: 56px; height: 56px; font-size: 22px; border-radius: 14px; }
  .profile-card, .perms-card { padding: 20px; }
}
</style>
