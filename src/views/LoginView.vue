<template>
  <div class="lp-form-content" :class="{ 'is-shaking': shaking }">
    <h1 class="lp-title lp-anim-r" style="--d:0.08s">مرحباً بعودتك</h1>
    <p class="lp-subtitle lp-anim-r" style="--d:0.14s">سجّل دخولك للمتابعة إلى لوحة التحكم</p>

    <div class="lp-line"></div>

    <form class="lp-form" @submit.prevent="handleLogin" novalidate>
      <!-- Identifier (email or phone) -->
      <div class="lp-field lp-anim-r" style="--d:0.2s">
        <label class="lp-label" for="identifier">البريد الإلكتروني أو رقم الهاتف</label>
        <div class="lp-input-group">
          <span class="lp-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </span>
          <input
            id="identifier"
            v-model="form.identifier"
            class="lp-input lp-input--has-icon"
            type="text"
            placeholder="example@email.com أو 01xxxxxxxxx"
            autocomplete="username"
            @blur="touched.identifier = true"
          />
        </div>
        <Transition name="fade-msg">
          <span v-if="touched.identifier && !isIdentifierValid" class="lp-field-error">أدخل بريد إلكتروني أو رقم هاتف صحيح</span>
        </Transition>
      </div>

      <!-- Password -->
      <div class="lp-field lp-anim-r" style="--d:0.26s">
        <label class="lp-label" for="password">كلمة المرور</label>
        <div class="lp-input-group">
          <span class="lp-input-icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </span>
          <input
            id="password"
            v-model="form.password"
            class="lp-input lp-input--has-icon lp-input--has-eye"
            :type="showPass ? 'text' : 'password'"
            placeholder="••••••"
            autocomplete="current-password"
            @blur="touched.password = true"
            @keyup="detectCapsLock"
            @keydown="detectCapsLock"
          />
          <button type="button" class="lp-eye" @click="showPass = !showPass" tabindex="-1">
            <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </button>
        </div>
        <Transition name="fade-msg">
          <div v-if="capsLockOn" class="lp-caps-warn">
            <i class="pi pi-info-circle" />
            مفتاح Caps Lock مفعل
          </div>
        </Transition>
      </div>

      <!-- Submit -->
      <div class="lp-anim-r" style="--d:0.32s">
        <button type="submit" class="lp-btn" :disabled="!isFormValid || loading">
          <template v-if="loading">
            <span class="lp-spinner"></span>
            <span>جاري التحقق…</span>
          </template>
          <template v-else>
            <span>تسجيل الدخول</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </template>
        </button>
      </div>
    </form>

    <p class="lp-card-foot lp-anim-r" style="--d:0.4s">© 2026 فارما بيتش — جميع الحقوق محفوظة</p>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'

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
const shaking = ref(false)

// Map backend auth codes to friendly Arabic. If the backend already sent an
// Arabic message, show it as-is; an English code falls back to a generic line.
const AUTH_ERROR_AR = {
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  INVALID_EMAIL_OR_PASSWORD: 'بيانات الدخول غير صحيحة',
  USER_NOT_FOUND: 'الحساب غير موجود',
  ACCOUNT_SUSPENDED: 'تم إيقاف هذا الحساب',
  ACCOUNT_PERMANENT_SUSPENDED: 'تم إيقاف هذا الحساب نهائياً',
  TOO_MANY_ATTEMPTS: 'محاولات كثيرة، حاول لاحقاً',
}
function authErrorMessage(err) {
  if (!err) return 'تعذر تسجيل الدخول'
  if (AUTH_ERROR_AR[err]) return AUTH_ERROR_AR[err]
  return /[؀-ۿ]/.test(err) ? err : 'بيانات الدخول غير صحيحة'
}
const capsLockOn = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d\s\-]{7,}$/
const isIdentifierValid = computed(() => {
  const v = form.identifier.trim()
  return emailRegex.test(v) || phoneRegex.test(v)
})
const isFormValid = computed(() => isIdentifierValid.value && form.password.length > 0)

function detectCapsLock(e) {
  if (typeof e.getModifierState === 'function') {
    capsLockOn.value = e.getModifierState('CapsLock')
  }
}

function triggerShake() {
  shaking.value = false
  requestAnimationFrame(() => {
    shaking.value = true
    setTimeout(() => { shaking.value = false }, 500)
  })
}

async function handleLogin() {
  if (!isFormValid.value) return
  loading.value = true

  const result = await auth.login(form.identifier, form.password)
  loading.value = false

  if (result.ok) {
    toast.success('تم تسجيل الدخول بنجاح')
    const redirect = auth.returnUrl || '/'
    auth.returnUrl = null
    router.push(redirect)
  } else {
    toast.error(authErrorMessage(result.error))
    triggerShake()
  }
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
