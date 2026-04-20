<template>
  <div class="lp-form-content">
    <!-- Token invalid / expired -->
    <template v-if="tokenError">
      <h1 class="lp-title lp-anim-r" style="--d:0.08s">رابط غير صالح</h1>
      <p class="lp-subtitle lp-anim-r" style="--d:0.14s">هذا الرابط لم يعد صالحاً</p>

      <div class="lp-line"></div>

      <div class="lp-error lp-anim-r" style="--d:0.2s">
        <i class="pi pi-exclamation-circle" />
        {{ tokenError }}
      </div>

      <p class="lp-signup lp-anim-r" style="--d:0.26s">
        <RouterLink to="/forgot-password">طلب رابط جديد</RouterLink>
      </p>
    </template>

    <!-- Reset form -->
    <template v-else-if="tokenValid">
      <h1 class="lp-title lp-anim-r" style="--d:0.08s">كلمة مرور جديدة</h1>
      <p class="lp-subtitle lp-anim-r" style="--d:0.14s">اختر كلمة مرور قوية لحسابك</p>

      <div class="lp-line"></div>

      <!-- Error message -->
      <Transition name="fade-msg">
        <div v-if="errorMsg" class="lp-error lp-anim-r" style="--d:0.18s">
          <i class="pi pi-exclamation-circle" />
          {{ errorMsg }}
        </div>
      </Transition>

      <form class="lp-form" @submit.prevent="handleReset" novalidate>
        <!-- New password -->
        <div class="lp-field lp-anim-r" style="--d:0.22s">
          <label class="lp-label" for="password">كلمة المرور الجديدة</label>
          <div class="lp-input-group">
            <input
              id="password"
              v-model="form.password"
              class="lp-input lp-input--has-eye"
              :type="showPass ? 'text' : 'password'"
              placeholder="6 أحرف على الأقل"
              autocomplete="new-password"
              @blur="touched.password = true"
            />
            <button type="button" class="lp-eye" @click="showPass = !showPass" tabindex="-1">
              <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <Transition name="fade-msg">
            <span v-if="touched.password && !isPasswordValid" class="lp-field-error">كلمة المرور يجب أن تكون 6 أحرف على الأقل</span>
          </Transition>
        </div>

        <!-- Confirm password -->
        <div class="lp-field lp-anim-r" style="--d:0.28s">
          <label class="lp-label" for="confirm">تأكيد كلمة المرور</label>
          <div class="lp-input-group">
            <input
              id="confirm"
              v-model="form.confirm"
              class="lp-input lp-input--has-eye"
              :type="showConfirm ? 'text' : 'password'"
              placeholder="أعد كتابة كلمة المرور"
              autocomplete="new-password"
              @blur="touched.confirm = true"
            />
            <button type="button" class="lp-eye" @click="showConfirm = !showConfirm" tabindex="-1">
              <svg v-if="!showConfirm" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
          <Transition name="fade-msg">
            <span v-if="touched.confirm && !isConfirmValid" class="lp-field-error">كلمتا المرور غير متطابقتين</span>
          </Transition>
        </div>

        <!-- Submit -->
        <div class="lp-anim-r" style="--d:0.34s">
          <button type="submit" class="lp-btn" :disabled="!isFormValid || loading">
            <span v-if="loading" class="lp-spinner"></span>
            <template v-else>حفظ كلمة المرور</template>
          </button>
        </div>
      </form>

      <p class="lp-signup lp-anim-r" style="--d:0.4s">
        <RouterLink to="/login">العودة لتسجيل الدخول</RouterLink>
      </p>
    </template>

    <!-- Loading state -->
    <template v-else>
      <div class="loading-state">
        <span class="lp-spinner" style="width: 28px; height: 28px; border-color: #e2e8f0; border-top-color: #f97316"></span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToastStore()

const tokenValid = ref(false)
const tokenError = ref('')
const errorMsg = ref('')
const loading = ref(false)
const showPass = ref(false)
const showConfirm = ref(false)

const form = reactive({
  password: '',
  confirm: '',
})

const touched = reactive({ password: false, confirm: false })

const isPasswordValid = computed(() => form.password.length >= 6)
const isConfirmValid = computed(() => form.confirm.length > 0 && form.confirm === form.password)
const isFormValid = computed(() => isPasswordValid.value && isConfirmValid.value)

onMounted(() => {
  const token = route.query.token
  if (!token) {
    tokenError.value = 'الرابط غير صالح أو منتهي'
    return
  }

  const result = auth.validateResetToken(token)
  if (result.ok) {
    tokenValid.value = true
  } else {
    tokenError.value = result.error
  }
})

function handleReset() {
  if (!isFormValid.value) return
  loading.value = true
  errorMsg.value = ''

  setTimeout(() => {
    const token = route.query.token
    const result = auth.resetPassword(token, form.password)
    loading.value = false

    if (result.ok) {
      toast.success('تم تغيير كلمة المرور بنجاح')
      router.push('/login')
    } else {
      errorMsg.value = result.error
    }
  }, 400)
}
</script>

<style scoped>
.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.fade-msg-enter-active,
.fade-msg-leave-active {
  transition: all 0.3s ease;
}
.fade-msg-enter-from,
.fade-msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
