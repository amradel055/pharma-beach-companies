<template>
  <div class="auth-split">
    <!-- Photo side -->
    <div class="auth-photo">
      <div class="photo-bg" />
      <div class="photo-overlay" />
      <div class="photo-content">
        <RouterLink to="/" class="photo-logo anim-item" style="--i: 0">
          <img :src="logo" alt="Pharma Beach" />
        </RouterLink>
        <h2 class="anim-item" style="--i: 1">مرحباً بك في فارما بيتش</h2>
        <p class="anim-item" style="--i: 2">اكتشف أفضل الشاليهات واحجز إقامتك المثالية على الساحل</p>
      </div>
    </div>

    <!-- Form side -->
    <div class="auth-form-side">
      <div class="auth-form-container">
        <!-- Mobile logo -->
        <RouterLink to="/" class="mobile-logo">
          <img :src="logo" alt="Pharma Beach" />
        </RouterLink>

        <h1 class="anim-item" style="--i: 0">تسجيل الدخول</h1>
        <p class="auth-subtitle anim-item" style="--i: 1">أهلاً بعودتك! سجّل دخولك للمتابعة</p>

        <!-- Error message -->
        <Transition name="fade-msg">
          <div v-if="errorMsg" class="auth-error">
            <i class="pi pi-exclamation-circle" />
            {{ errorMsg }}
          </div>
        </Transition>

        <form @submit.prevent="handleLogin" novalidate>
          <!-- Identifier (email or phone) -->
          <div class="field anim-item" style="--i: 2">
            <label for="identifier">البريد الإلكتروني أو رقم الهاتف</label>
            <div :class="['input-wrap', { error: touched.identifier && !isIdentifierValid, focus: focused === 'identifier' }]">
              <i :class="identifierLooksLikePhone ? 'pi pi-phone' : 'pi pi-envelope'" />
              <input
                id="identifier"
                v-model="form.identifier"
                type="text"
                placeholder="example@email.com أو 01xxxxxxxxx"
                autocomplete="username"
                @focus="focused = 'identifier'"
                @blur="focused = null; touched.identifier = true"
              />
            </div>
            <Transition name="fade-msg">
              <span v-if="touched.identifier && !isIdentifierValid" class="field-error">أدخل بريد إلكتروني أو رقم هاتف صحيح</span>
            </Transition>
          </div>

          <!-- Password -->
          <div class="field anim-item" style="--i: 3">
            <label for="password">كلمة المرور</label>
            <div :class="['input-wrap', { error: touched.password && !form.password, focus: focused === 'password' }]">
              <i class="pi pi-lock" />
              <input
                id="password"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                placeholder="••••••"
                autocomplete="current-password"
                @focus="focused = 'password'"
                @blur="focused = null; touched.password = true"
              />
              <button type="button" class="toggle-pass" @click="showPass = !showPass" tabindex="-1">
                <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'" />
              </button>
            </div>
          </div>

          <!-- Forgot password -->
          <RouterLink to="/forgot-password" class="forgot-link anim-item" style="--i: 4">نسيت كلمة المرور؟</RouterLink>

          <!-- Submit -->
          <button type="submit" class="auth-btn anim-item" style="--i: 5" :disabled="!isFormValid || loading">
            <i v-if="loading" class="pi pi-spin pi-spinner" />
            <template v-else>
              <i class="pi pi-sign-in" />
              تسجيل الدخول
            </template>
          </button>

          <div class="auth-divider">
            <span>أو</span>
          </div>

          <button type="button" class="google-btn" @click="handleGoogleLogin">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            تسجيل الدخول بـ Google
          </button>
        </form>

        <!-- Register link -->
        <p class="switch-link anim-item" style="--i: 6">
          ليس لديك حساب؟
          <RouterLink to="/register">سجل الآن</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { ADMIN_ROLES } from '@/constants/roles'
import logo from '@/assets/images/logo.jpeg'

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
const focused = ref(null)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^[+\d][\d\s\-]{7,}$/
const identifierLooksLikePhone = computed(() => /^[+\d]/.test(form.identifier.trim()) && !form.identifier.includes('@'))
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
/* ═══════════════════════════════════
   SPLIT LAYOUT
   ═══════════════════════════════════ */
.auth-split {
  display: flex;
  min-height: 100vh;
  direction: rtl;
}

/* ═══════════════════════════════════
   PHOTO SIDE
   ═══════════════════════════════════ */
.auth-photo {
  position: relative;
  flex: 1;
  display: flex;
  align-items: flex-end;
  padding: 3rem;
  overflow: hidden;
}

.photo-bg {
  position: absolute;
  inset: 0;
  background: url('@/assets/images/hero-bg.jpg') center/cover no-repeat;
  animation: kenBurns 25s ease-in-out infinite alternate;
}

@keyframes kenBurns {
  0% { transform: scale(1) translate(0, 0); }
  100% { transform: scale(1.1) translate(-2%, -1%); }
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.3) 0%,
    rgba(15, 23, 42, 0.5) 50%,
    rgba(15, 23, 42, 0.85) 100%
  );
  z-index: 1;
}

.photo-content {
  position: relative;
  z-index: 2;
  max-width: 440px;
}

.photo-logo {
  display: inline-block;
  margin-bottom: 1.5rem;
}

.photo-logo img {
  height: 56px;
  border-radius: 6px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25); }
  50% { transform: translateY(-6px); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); }
}

.photo-content h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.photo-content p {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.7;
}

/* ═══════════════════════════════════
   FORM SIDE
   ═══════════════════════════════════ */
.auth-form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  background: #fff;
  max-width: 580px;
}

.auth-form-container {
  width: 100%;
  max-width: 400px;
}

/* ═══════════════════════════════════
   STAGGER ANIMATIONS
   ═══════════════════════════════════ */
.anim-item {
  opacity: 0;
  animation: staggerIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: calc(var(--i, 0) * 100ms + 200ms);
}

@keyframes staggerIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Mobile logo ── */
.mobile-logo {
  display: none;
}

/* ── Typography ── */
.auth-form-container h1 {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.3rem;
}

.auth-subtitle {
  font-size: 0.88rem;
  color: #64748b;
  margin-bottom: 2rem;
}

/* ═══════════════════════════════════
   FORM FIELDS
   ═══════════════════════════════════ */
.field {
  margin-bottom: 1.25rem;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 0.45rem;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0 1rem;
  height: 50px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  transition: all 0.25s ease;
}

.input-wrap.focus {
  border-color: var(--primary, #f97316);
  background: #fff;
  box-shadow: 0 0 0 3.5px rgba(249, 115, 22, 0.1);
}

.input-wrap.error {
  border-color: #fca5a5;
  background: #fef2f2;
}

.input-wrap i {
  font-size: 0.92rem;
  color: #94a3b8;
  flex-shrink: 0;
  transition: color 0.25s;
}

.input-wrap.focus i {
  color: var(--primary, #f97316);
}

.input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  font-family: 'Cairo', sans-serif;
  color: #0f172a;
  height: 100%;
}

.input-wrap input::placeholder {
  color: #cbd5e1;
}

.toggle-pass {
  border: none;
  background: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #94a3b8;
  font-size: 0.92rem;
  transition: color 0.2s;
}

.toggle-pass:hover {
  color: #64748b;
}

.field-error {
  display: block;
  font-size: 0.72rem;
  color: #ef4444;
  margin-top: 0.35rem;
  font-weight: 600;
}

/* ═══════════════════════════════════
   ERROR / SUCCESS MESSAGES
   ═══════════════════════════════════ */
.auth-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  border: 1px solid #fecaca;
}

/* ═══════════════════════════════════
   FORGOT LINK
   ═══════════════════════════════════ */
.forgot-link {
  display: block;
  color: var(--primary, #f97316);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  margin-bottom: 1.5rem;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: var(--primary-dark, #ea580c);
  text-decoration: underline;
}

/* ═══════════════════════════════════
   SUBMIT BUTTON
   ═══════════════════════════════════ */
.auth-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--primary, #f97316), var(--primary-dark, #ea580c));
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
}

.auth-btn:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(249, 115, 22, 0.4);
  transform: translateY(-2px);
}

.auth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  cursor: not-allowed;
}

/* ═══════════════════════════════════
   AUTH DIVIDER & GOOGLE BUTTON
   ═══════════════════════════════════ */
.auth-divider {
  display: flex;
  align-items: center;
  margin: 1.25rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
}

.auth-divider span {
  padding: 0 0.75rem;
  font-size: 0.8rem;
  color: #94a3b8;
  font-weight: 600;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s ease;
}

.google-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* ═══════════════════════════════════
   SWITCH LINK
   ═══════════════════════════════════ */
.switch-link {
  text-align: center;
  font-size: 0.84rem;
  color: #64748b;
  margin-top: 2rem;
}

.switch-link a {
  color: var(--primary, #f97316);
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}

.switch-link a:hover {
  color: var(--primary-dark, #ea580c);
  text-decoration: underline;
}

/* ═══════════════════════════════════
   TRANSITIONS
   ═══════════════════════════════════ */
.fade-msg-enter-active,
.fade-msg-leave-active {
  transition: all 0.3s ease;
}

.fade-msg-enter-from,
.fade-msg-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 900px) {
  .auth-photo {
    display: none;
  }

  .auth-form-side {
    max-width: 100%;
    padding: 2rem 1.5rem;
  }

  .mobile-logo {
    display: flex;
    justify-content: center;
    margin-bottom: 2rem;
  }

  .mobile-logo img {
    height: 60px;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    animation: logoFloat 3s ease-in-out infinite;
  }

  .auth-form-container h1 {
    text-align: center;
  }

  .auth-subtitle {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .auth-form-side {
    padding: 1.5rem 1.25rem;
  }

  .auth-form-container h1 {
    font-size: 1.4rem;
  }
}
</style>
