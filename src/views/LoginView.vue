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
          <RouterLink :to="{ name: 'forgot-password' }" class="lp-forgot">نسيت كلمة المرور؟</RouterLink>
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
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
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
const errorMsg = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d\s\-]{7,}$/
const isIdentifierValid = computed(() => {
  const v = form.identifier.trim()
  return emailRegex.test(v) || phoneRegex.test(v)
})
const isFormValid = computed(() => isIdentifierValid.value && form.password.length > 0)

function handleLogin() {
  if (!isFormValid.value) return
  loading.value = true
  errorMsg.value = ''

  setTimeout(() => {
    const result = auth.login(form.identifier, form.password)
    loading.value = false

    if (result.ok) {
      toast.success('تم تسجيل الدخول بنجاح')
      const redirect = auth.returnUrl || '/admin'
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
