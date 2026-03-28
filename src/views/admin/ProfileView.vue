<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">الملف الشخصي</h1>
      <p class="page-desc">عرض وتعديل بيانات حسابك</p>
    </div>

    <!-- Profile Card -->
    <div class="profile-card">
      <div class="profile-top">
        <div class="profile-avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="profile-info">
          <h2>{{ auth.user?.name }}</h2>
          <span class="profile-role">{{ roleLabel }}</span>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-envelope" /></div>
          <div class="detail-content">
            <span class="detail-label">البريد الإلكتروني</span>
            <span class="detail-value">{{ auth.user?.email || '—' }}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-phone" /></div>
          <div class="detail-content">
            <span class="detail-label">رقم التليفون</span>
            <span class="detail-value" dir="ltr">{{ auth.user?.phone || '—' }}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-shield" /></div>
          <div class="detail-content">
            <span class="detail-label">الدور</span>
            <span class="detail-value">{{ roleLabel }}</span>
          </div>
        </div>
        <div class="detail-item">
          <div class="detail-icon"><i class="pi pi-calendar" /></div>
          <div class="detail-content">
            <span class="detail-label">تاريخ الإنشاء</span>
            <span class="detail-value">{{ fmtDate(auth.user?.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile -->
    <div class="edit-card">
      <h3 class="card-title"><i class="pi pi-pen-to-square" /> تعديل البيانات</h3>

      <div class="fields-grid">
        <div class="field">
          <label>الاسم</label>
          <input v-model="form.name" type="text" placeholder="اسمك" />
        </div>
        <div class="field">
          <label>التليفون</label>
          <input v-model="form.phone" type="tel" placeholder="01xxxxxxxxx" dir="ltr" />
        </div>
        <div class="field">
          <label>البريد الإلكتروني</label>
          <input v-model="form.email" type="email" placeholder="example@email.com" dir="ltr" />
        </div>
      </div>

      <button class="btn-save" :disabled="!hasChanges" @click="saveProfile">
        <i class="pi pi-check" /> حفظ التعديلات
      </button>
    </div>

    <!-- Change Password -->
    <div class="edit-card">
      <h3 class="card-title"><i class="pi pi-lock" /> تغيير كلمة المرور</h3>

      <div class="fields-grid">
        <div class="field">
          <label>كلمة المرور الجديدة</label>
          <div class="password-wrap">
            <input v-model="passForm.newPassword" :type="showPass ? 'text' : 'password'" placeholder="••••••" />
            <button type="button" class="pass-toggle" @click="showPass = !showPass">
              <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'" />
            </button>
          </div>
        </div>
        <div class="field">
          <label>تأكيد كلمة المرور</label>
          <input v-model="passForm.confirmPassword" :type="showPass ? 'text' : 'password'" placeholder="••••••" />
        </div>
      </div>

      <Transition name="slide">
        <div v-if="passError" class="form-error"><i class="pi pi-exclamation-circle" /> {{ passError }}</div>
      </Transition>

      <button class="btn-save" :disabled="!passForm.newPassword || passForm.newPassword.length < 6" @click="changePassword">
        <i class="pi pi-lock" /> تغيير كلمة المرور
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import { useToastStore } from '@/stores/toast'
import { ROLE_LABELS } from '@/constants/roles'

const auth = useAuthStore()
const usersStore = useUsersStore()
const toast = useToastStore()

const roleLabel = computed(() => ROLE_LABELS[auth.user?.role] || 'مستخدم')
const userInitial = computed(() => auth.user?.name?.charAt(0) || '?')

const form = reactive({ name: '', phone: '', email: '' })
const passForm = reactive({ newPassword: '', confirmPassword: '' })
const showPass = ref(false)
const passError = ref('')

onMounted(() => {
  form.name = auth.user?.name || ''
  form.phone = auth.user?.phone || ''
  form.email = auth.user?.email || ''
})

const hasChanges = computed(() => {
  return form.name !== (auth.user?.name || '') ||
    form.phone !== (auth.user?.phone || '') ||
    form.email !== (auth.user?.email || '')
})

function saveProfile() {
  if (!hasChanges.value) return

  // Update in users store
  const result = usersStore.update(auth.user.id, {
    name: form.name,
    phone: form.phone,
    email: form.email,
  })

  if (result.ok) {
    // Update current session
    auth.user.name = form.name.trim()
    auth.user.phone = form.phone.trim()
    auth.user.email = form.email.trim()
    localStorage.setItem('pb_user', JSON.stringify(auth.user))
    toast.success('تم تحديث البيانات بنجاح')
  } else {
    toast.error(result.error || 'حدث خطأ')
  }
}

function changePassword() {
  passError.value = ''

  if (passForm.newPassword.length < 6) {
    passError.value = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    return
  }

  if (passForm.newPassword !== passForm.confirmPassword) {
    passError.value = 'كلمة المرور وتأكيدها غير متطابقين'
    return
  }

  const result = usersStore.update(auth.user.id, { password: passForm.newPassword })
  if (result.ok) {
    toast.success('تم تغيير كلمة المرور بنجاح')
    passForm.newPassword = ''
    passForm.confirmPassword = ''
  } else {
    passError.value = result.error || 'حدث خطأ'
  }
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
}
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
}

.profile-info h2 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}

.profile-role {
  display: inline-flex;
  padding: 4px 14px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.06);
  color: #f97316;
  font-size: 13px;
  font-weight: 600;
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
}

.detail-item:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.detail-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-icon i {
  font-size: 16px;
  color: #f97316;
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
}

/* Edit Cards */
.edit-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 16px;
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

.fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
  max-width: 600px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.field input {
  height: 42px;
  padding: 0 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  color: #1e293b;
  background: #fafbfc;
  outline: none;
  transition: all 0.2s;
}

.field input:focus {
  border-color: #f97316;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08);
}

.field input::placeholder {
  color: #94a3b8;
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  width: 100%;
  padding-left: 42px;
}

.pass-toggle {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  font-size: 15px;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #ef4444;
  font-size: 13.5px;
  font-weight: 500;
  margin-bottom: 16px;
  max-width: 600px;
}

.slide-enter-active { transition: all 0.25s ease; }
.slide-leave-active { transition: all 0.2s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .profile-details { grid-template-columns: 1fr; }
  .fields-grid { grid-template-columns: 1fr; }
  .profile-avatar { width: 56px; height: 56px; font-size: 22px; border-radius: 14px; }
}
</style>
