<template>
  <div class="lp-form-content">
    <h1 class="lp-title lp-anim-r" style="--d:0.08s">مرحباً بعودتك</h1>
    <p class="lp-subtitle lp-anim-r" style="--d:0.14s">سجّل دخولك للمتابعة إلى حسابك</p>

    <div class="lp-line"></div>

    <!-- Error message -->
    <Transition name="fade-msg">
      <div v-if="errorMsg" class="lp-error lp-anim-r" style="--d:0.18s">
        <i class="pi pi-exclamation-circle" />
        {{ errorMsg }}
      </div>
    </Transition>

    <form class="lp-form" @submit.prevent="handleLogin" novalidate>
      <!-- Identifier (email or phone) -->
      <div class="lp-field lp-anim-r" style="--d:0.2s">
        <label class="lp-label" for="identifier">البريد الإلكتروني أو رقم الهاتف</label>
        <input
          id="identifier"
          v-model="form.identifier"
          class="lp-input"
          type="text"
          placeholder="example@email.com أو 01xxxxxxxxx"
          autocomplete="username"
          @blur="touched.identifier = true"
        />
        <Transition name="fade-msg">
          <span v-if="touched.identifier && !isIdentifierValid" class="lp-field-error">أدخل بريد إلكتروني أو رقم هاتف صحيح</span>
        </Transition>
      </div>

      <!-- Password -->
      <div class="lp-field lp-anim-r" style="--d:0.26s">
        <div class="lp-label-row">
          <label class="lp-label" for="password">كلمة المرور</label>
          <RouterLink to="/forgot-password" class="lp-forgot">نسيت كلمة المرور؟</RouterLink>
        </div>
        <div class="lp-input-group">
          <input
            id="password"
            v-model="form.password"
            class="lp-input lp-input--has-eye"
            :type="showPass ? 'text' : 'password'"
            placeholder="••••••"
            autocomplete="current-password"
            @blur="touched.password = true"
          />
          <button type="button" class="lp-eye" @click="showPass = !showPass" tabindex="-1">
            <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
      </div>

      <!-- Submit -->
      <div class="lp-anim-r" style="--d:0.32s">
        <button type="submit" class="lp-btn" :disabled="!isFormValid || loading">
          <span v-if="loading" class="lp-spinner"></span>
          <template v-else>تسجيل الدخول</template>
        </button>
      </div>

      <!-- Divider -->
      <div class="lp-or lp-anim-r" style="--d:0.36s"><span>أو</span></div>

      <!-- Google -->
      <div class="lp-anim-r" style="--d:0.4s">
        <button type="button" class="lp-google" @click="handleGoogleLogin">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          تسجيل الدخول بـ Google
        </button>
      </div>
    </form>

    <p class="lp-signup lp-anim-r" style="--d:0.44s">
      ليس لديك حساب؟ <RouterLink to="/register">سجل الآن</RouterLink>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { ADMIN_ROLES } from '@/constants/roles'

const router = useRouter()
const auth = useAuthStore()
const toast = useToastStore()

const form = reactive({
  identifier: '',
  password: '',
})

const touched = reactive({ identifier: false, password: false })
const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d\s\-]{7,}$/
const isIdentifierValid = computed(() => {
  const v = form.identifier.trim()
  return emailRegex.test(v) || phoneRegex.test(v)
})
const isFormValid = computed(() => isIdentifierValid.value && form.password.length > 0)

function handleGoogleLogin() {
  toast.info('تسجيل الدخول عبر Google غير متاح حالياً في النسخة التجريبية')
}

function handleLogin() {
  if (!isFormValid.value) return
  loading.value = true
  errorMsg.value = ''

  setTimeout(() => {
    const result = auth.login(form.identifier, form.password)
    loading.value = false

    if (result.ok) {
      toast.success('تم تسجيل الدخول بنجاح')
      const isAdminUser = ADMIN_ROLES.includes(auth.user?.role)
      const redirect = auth.returnUrl || (isAdminUser ? '/admin' : '/')
      auth.returnUrl = null
      router.push(redirect)
    } else {
      errorMsg.value = result.error
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
