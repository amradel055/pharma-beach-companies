<template>
  <div class="lp-form-content">
    <h1 class="lp-title lp-anim-r" style="--d:0.08s">نسيت كلمة المرور؟</h1>
    <p class="lp-subtitle lp-anim-r" style="--d:0.14s">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>

    <div class="lp-line"></div>

    <!-- Success message -->
    <Transition name="fade-msg">
      <div v-if="submitted" class="lp-success lp-anim-r" style="--d:0.18s">
        <i class="pi pi-check-circle" />
        إذا كان البريد مسجل لدينا سيتم إرسال رابط إعادة التعيين
      </div>
    </Transition>

    <!-- Mock reset link (dev mode) -->
    <Transition name="fade-msg">
      <div v-if="resetLink" class="lp-info">
        <i class="pi pi-info-circle" />
        <div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px; font-weight: 600">رابط إعادة التعيين (وضع التطوير):</div>
          <RouterLink :to="resetLink">اضغط هنا لإعادة تعيين كلمة المرور</RouterLink>
        </div>
      </div>
    </Transition>

    <form v-if="!submitted" class="lp-form" @submit.prevent="handleSubmit" novalidate>
      <!-- Email -->
      <div class="lp-field lp-anim-r" style="--d:0.22s">
        <label class="lp-label" for="email">البريد الإلكتروني</label>
        <input
          id="email"
          v-model="email"
          class="lp-input"
          type="email"
          placeholder="example@email.com"
          autocomplete="email"
          @blur="touched = true"
        />
        <Transition name="fade-msg">
          <span v-if="touched && !isEmailValid" class="lp-field-error">أدخل بريد إلكتروني صحيح</span>
        </Transition>
      </div>

      <!-- Submit -->
      <div class="lp-anim-r" style="--d:0.28s">
        <button type="submit" class="lp-btn" :disabled="!isEmailValid || loading">
          <span v-if="loading" class="lp-spinner"></span>
          <template v-else>إرسال الرابط</template>
        </button>
      </div>
    </form>

    <!-- Back to login -->
    <p class="lp-signup lp-anim-r" style="--d:0.34s">
      تذكرت كلمة المرور؟ <RouterLink to="/login">العودة لتسجيل الدخول</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const email = ref('')
const touched = ref(false)
const loading = ref(false)
const submitted = ref(false)
const resetLink = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isEmailValid = computed(() => emailRegex.test(email.value.trim()))

function handleSubmit() {
  if (!isEmailValid.value) return
  loading.value = true

  setTimeout(() => {
    const result = auth.requestPasswordReset(email.value)
    loading.value = false
    submitted.value = true

    if (result.token) {
      resetLink.value = `/reset-password?token=${result.token}`
    }
  }, 400)
}
</script>

<style scoped>
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
