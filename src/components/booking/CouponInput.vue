<template>
  <div class="coupon-input">
    <div v-if="!applied" class="coupon-form">
      <div class="coupon-field">
        <i class="pi pi-tag" />
        <input
          v-model="code"
          type="text"
          placeholder="أدخل كود الكوبون"
          dir="ltr"
          @keyup.enter="handleApply"
        />
      </div>
      <button class="coupon-apply-btn" :disabled="!code.trim() || loading" @click="handleApply">
        <i v-if="loading" class="pi pi-spin pi-spinner" />
        <template v-else>تطبيق</template>
      </button>
    </div>

    <!-- Applied state -->
    <div v-else class="coupon-applied">
      <div class="applied-info">
        <div class="applied-icon"><i class="pi pi-check-circle" /></div>
        <div>
          <span class="applied-code">{{ appliedCode }}</span>
          <span class="applied-discount">خصم {{ discountDisplay }}</span>
        </div>
      </div>
      <button class="coupon-remove-btn" @click="handleRemove">
        <i class="pi pi-times" /> إزالة
      </button>
    </div>

    <!-- Error -->
    <Transition name="fade">
      <div v-if="error" class="coupon-error">
        <i class="pi pi-exclamation-circle" /> {{ error }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCouponsStore } from '@/stores/coupons'

const props = defineProps({
  bookingTotal: { type: Number, default: 0 },
  userId: { type: String, default: '' },
})

const emit = defineEmits(['apply', 'remove'])

const couponsStore = useCouponsStore()

const code = ref('')
const loading = ref(false)
const error = ref('')
const applied = ref(false)
const appliedCode = ref('')
const appliedCouponId = ref('')
const appliedDiscount = ref(0)
const appliedType = ref('')

const discountDisplay = computed(() => {
  if (appliedType.value === 'percent') return `${appliedDiscount.value}%`
  return `${Number(appliedDiscount.value).toLocaleString('ar-EG')} ج.م`
})

function handleApply() {
  if (!code.value.trim()) return
  loading.value = true
  error.value = ''

  setTimeout(() => {
    const result = couponsStore.validate(code.value, props.bookingTotal, props.userId)
    loading.value = false

    if (result.ok) {
      applied.value = true
      appliedCode.value = result.coupon.code
      appliedCouponId.value = result.coupon.id
      appliedDiscount.value = result.coupon.type === 'percent' ? result.coupon.value : result.discount
      appliedType.value = result.coupon.type
      error.value = ''

      emit('apply', {
        couponId: result.coupon.id,
        couponCode: result.coupon.code,
        discountAmount: result.discount,
        discountType: result.coupon.type,
      })
    } else {
      error.value = result.error
    }
  }, 300)
}

function handleRemove() {
  applied.value = false
  appliedCode.value = ''
  appliedCouponId.value = ''
  appliedDiscount.value = 0
  appliedType.value = ''
  code.value = ''
  error.value = ''
  emit('remove')
}
</script>

<style scoped>
.coupon-input {
  margin: 12px 0;
}

.coupon-form {
  display: flex;
  gap: 8px;
}

.coupon-field {
  position: relative;
  flex: 1;
}

.coupon-field i {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #94a3b8;
}

.coupon-field input {
  width: 100%;
  height: 42px;
  padding: 0 14px 0 14px;
  padding-right: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  color: #1e293b;
  background: #fafbfc;
  outline: none;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.coupon-field input:focus {
  border-color: #f97316;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08);
}

.coupon-field input::placeholder {
  color: #94a3b8;
  text-transform: none;
  letter-spacing: normal;
}

.coupon-apply-btn {
  height: 42px;
  padding: 0 20px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.coupon-apply-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.coupon-apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Applied */
.coupon-applied {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 10px;
}

.applied-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.applied-icon {
  color: #10b981;
  font-size: 20px;
}

.applied-code {
  display: block;
  font-weight: 700;
  color: #1e293b;
  font-size: 14px;
  direction: ltr;
  letter-spacing: 0.5px;
}

.applied-discount {
  display: block;
  font-size: 12.5px;
  color: #10b981;
  font-weight: 600;
}

.coupon-remove-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: none;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border-radius: 8px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}

.coupon-remove-btn:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* Error */
.coupon-error {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12.5px;
  color: #ef4444;
  font-weight: 500;
}

.coupon-error i {
  font-size: 13px;
}

.fade-enter-active { transition: all 0.2s ease; }
.fade-leave-active { transition: all 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
