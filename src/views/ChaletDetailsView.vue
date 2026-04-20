<template>
  <div class="chalet-details" v-if="chalet">
    <!-- ══════════════════════════════════════════════
         PHOTO MOSAIC GRID (Airbnb-style 1+4 layout)
         ══════════════════════════════════════════════ -->
    <section class="photo-mosaic" @click="openGallery(0)">
      <div class="mosaic-main">
        <img :src="chalet.images[0]" :alt="chalet.name" />
      </div>
      <div class="mosaic-grid">
        <div v-for="i in 4" :key="i" class="mosaic-cell" @click.stop="openGallery(i)">
          <img
            v-if="chalet.images[i]"
            :src="chalet.images[i]"
            :alt="`${chalet.name} ${i + 1}`"
          />
          <div v-else class="mosaic-placeholder">
            <i class="pi pi-image" />
          </div>
        </div>
      </div>
      <button class="show-all-btn" @click.stop="openGallery(0)">
        <i class="pi pi-th-large" />
        عرض كل الصور ({{ chalet.images.length }})
      </button>
    </section>

    <!-- ══════════════════════════════════════════════
         FULLSCREEN GALLERY MODAL
         ══════════════════════════════════════════════ -->
    <Teleport to="body">
      <Transition name="gallery-modal">
        <div v-if="galleryOpen" class="gallery-overlay" @click.self="galleryOpen = false">
          <button class="gallery-close" @click="galleryOpen = false">
            <i class="pi pi-times" />
          </button>
          <div class="gallery-counter">
            {{ galleryIndex + 1 }} / {{ chalet.images.length }}
          </div>
          <Swiper
            :modules="[Navigation]"
            :navigation="true"
            :initial-slide="galleryIndex"
            :loop="chalet.images.length > 1"
            class="gallery-swiper"
            @slideChange="(s) => (galleryIndex = s.realIndex)"
          >
            <SwiperSlide v-for="(img, i) in chalet.images" :key="i">
              <div class="gallery-slide">
                <img :src="img" :alt="`${chalet.name} ${i + 1}`" />
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════
         MAIN CONTENT + STICKY SIDEBAR
         ══════════════════════════════════════════════ -->
    <div class="page-body">
      <main class="main-col">

        <!-- ── Title + Meta Row ── -->
        <section class="title-section">
          <div class="title-top">
            <div>
              <h1>{{ chalet.name }}</h1>
              <div class="title-meta">
                <span class="meta-item rating-badge">
                  <i class="pi pi-star-fill" />
                  {{ chalet.rating }}
                  <span class="review-count">({{ chalet.reviewCount }} تقييم)</span>
                </span>
                <span class="meta-dot" />
                <span class="meta-item"><i class="pi pi-hashtag" /> {{ chalet.chaletNumber }}</span>
                <span class="meta-dot" />
                <span class="meta-item"><i class="pi pi-building" /> الدور {{ chalet.floor }}</span>
              </div>
            </div>
            <div class="title-actions">
              <button class="action-btn" @click="shareSheet = !shareSheet">
                <i class="pi pi-share-alt" />
                <span>مشاركة</span>
              </button>
              <button class="action-btn" @click="liked = !liked">
                <i :class="liked ? 'pi pi-heart-fill' : 'pi pi-heart'" :style="liked ? 'color: #ef4444' : ''" />
                <span>حفظ</span>
              </button>
            </div>
          </div>

          <!-- Share dropdown -->
          <Transition name="dropdown">
            <div v-if="shareSheet" class="share-dropdown">
              <button class="share-item" @click="shareWhatsApp"><i class="pi pi-whatsapp" /> واتساب</button>
              <button class="share-item" @click="shareFacebook"><i class="pi pi-facebook" /> فيسبوك</button>
              <button class="share-item" @click="copyLink"><i class="pi pi-copy" /> {{ copied ? 'تم النسخ!' : 'نسخ الرابط' }}</button>
            </div>
          </Transition>
        </section>

        <div class="divider" />

        <!-- ── Quick Stats ── -->
        <section class="quick-stats">
          <div class="stat-card">
            <div class="stat-icon"><i class="pi pi-th-large" /></div>
            <div class="stat-info">
              <span class="stat-val">{{ chalet.rooms }}</span>
              <span class="stat-label">غرف نوم</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="pi pi-wrench" /></div>
            <div class="stat-info">
              <span class="stat-val">{{ chalet.bathrooms }}</span>
              <span class="stat-label">حمامات</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="pi pi-users" /></div>
            <div class="stat-info">
              <span class="stat-val">{{ chalet.maxGuests }}</span>
              <span class="stat-label">ضيوف</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="pi pi-arrows-alt" /></div>
            <div class="stat-info">
              <span class="stat-val">{{ chalet.area }}</span>
              <span class="stat-label">م²</span>
            </div>
          </div>
        </section>

        <div class="divider" />

        <!-- ── Highlights ── -->
        <section class="highlights">
          <div class="highlight-row" v-if="chalet.finishing === 'فاخر'">
            <div class="highlight-icon"><i class="pi pi-star" /></div>
            <div>
              <strong>تشطيب فاخر</strong>
              <p>من أفضل الشاليهات تقييماً في فارما بيتش</p>
            </div>
          </div>
          <div class="highlight-row" v-if="chalet.views.includes('بحر')">
            <div class="highlight-icon"><i class="pi pi-sun" /></div>
            <div>
              <strong>إطلالة بحرية</strong>
              <p>استمتع بإطلالة مباشرة على البحر من شاليهك</p>
            </div>
          </div>
          <div class="highlight-row">
            <div class="highlight-icon"><i class="pi pi-shield" /></div>
            <div>
              <strong>إلغاء مجاني</strong>
              <p>إلغاء مجاني قبل 48 ساعة من موعد الحجز</p>
            </div>
          </div>
        </section>

        <div class="divider" />

        <!-- ── Description ── -->
        <section class="desc-section">
          <h2>عن الشاليه</h2>
          <p :class="['desc-text', { collapsed: !showFullDesc }]">{{ chalet.description }}</p>
          <button
            v-if="chalet.description.length > 120"
            class="show-more"
            @click="showFullDesc = !showFullDesc"
          >
            {{ showFullDesc ? 'عرض أقل' : 'عرض المزيد' }}
            <i :class="showFullDesc ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
          </button>
        </section>

        <div class="divider" />

        <!-- ── Amenities Grid ── -->
        <section class="amenities-section">
          <h2>ما يقدمه الشاليه</h2>
          <div class="amenities-grid">
            <div v-for="key in chalet.amenities" :key="key" class="amenity-item">
              <img v-if="getAmenity(key).customIcon" :src="getAmenity(key).customIcon" class="amenity-custom-img" />
              <i v-else :class="getAmenity(key).icon" />
              <span>{{ getAmenity(key).label }}</span>
            </div>
          </div>
        </section>

        <div class="divider" />

        <!-- ── Views ── -->
        <section class="views-section">
          <h2>الإطلالة</h2>
          <div class="views-tags">
            <span class="view-tag" v-for="v in chalet.views" :key="v">
              <i class="pi pi-eye" />
              {{ v }}
            </span>
          </div>
        </section>

        <!-- ── Videos ── -->
        <template v-if="chalet.videos.length">
          <div class="divider" />
          <section class="videos-section">
            <h2>جولة فيديو</h2>
            <div class="video-wrapper">
              <iframe
                v-for="(video, i) in chalet.videos"
                :key="i"
                :src="video"
                allowfullscreen
                loading="lazy"
                frameborder="0"
              />
            </div>
          </section>
        </template>

        <!-- ── Similar Chalets ── -->
        <template v-if="similarChalets.length">
          <div class="divider" />
          <section class="similar-section">
            <h2>شاليهات مشابهة</h2>
            <div class="similar-scroll">
              <RouterLink
                v-for="s in similarChalets"
                :key="s.id"
                :to="{ name: 'chalet-details', params: { id: s.id } }"
                class="similar-card"
              >
                <div class="similar-img-wrap">
                  <img :src="s.image" :alt="s.name" />
                  <span class="similar-badge">{{ s.finishing }}</span>
                </div>
                <div class="similar-body">
                  <h4>{{ s.name }}</h4>
                  <div class="similar-meta">
                    <span><i class="pi pi-star-fill" /> {{ s.rating }}</span>
                    <span>{{ s.rooms }} غرف</span>
                  </div>
                  <div class="similar-price-row">
                    <span class="similar-price">{{ s.price }} ج.م</span>
                    <span class="similar-unit">/ ليلة</span>
                  </div>
                </div>
              </RouterLink>
            </div>
          </section>
        </template>

      </main>

      <!-- ══════════════════════════════════════════════
           STICKY BOOKING SIDEBAR
           ══════════════════════════════════════════════ -->
      <aside class="sidebar-col" ref="sidebarRef">
        <div class="booking-card">
          <!-- Price header -->
          <div class="card-header">
            <div class="card-price-block">
              <span class="card-price-num">{{ chalet.price.toLocaleString('ar-EG') }}</span>
              <span class="card-price-currency">ج.م</span>
              <span class="card-price-per">/ ليلة</span>
            </div>
            <div class="card-rating-pill">
              <i class="pi pi-star-fill" />
              <span>{{ chalet.rating }}</span>
              <span class="card-review-dot">·</span>
              <span class="card-review-count">{{ chalet.reviewCount }} تقييم</span>
            </div>
          </div>

          <!-- Nights badge -->
          <div class="nights-badge" v-if="nights > 0">
            <i class="pi pi-moon" />
            <span>{{ nights }} {{ nights === 1 ? 'ليلة' : 'ليالي' }}</span>
          </div>

          <!-- Calendar -->
          <div class="calendar-card">
            <DatePicker
              v-model="sidebarDateRange"
              selectionMode="range"
              :inline="true"
              :minDate="minDate"
              :disabledDates="disabledDates"
              dateFormat="yy/mm/dd"
              :numberOfMonths="1"
              :manualInput="false"
            />
            <div class="calendar-legend">
              <span class="legend-item"><span class="legend-dot legend-selected" /> المحدد</span>
              <span class="legend-item"><span class="legend-dot legend-booked" /> محجوز</span>
              <span class="legend-item"><span class="legend-dot legend-available" /> متاح</span>
            </div>
          </div>

          <!-- Price breakdown -->
          <Transition name="fade-bd">
            <div v-if="nights > 0" class="price-breakdown">
              <div class="bd-row">
                <span>{{ chalet.price.toLocaleString('ar-EG') }} ج.م × {{ nights }} {{ nights === 1 ? 'ليلة' : 'ليالي' }}</span>
                <span>{{ subtotal.toLocaleString('ar-EG') }} ج.م</span>
              </div>
              <div class="bd-row">
                <span class="deposit-label">
                  تأمين
                  <span class="refund-badge">مسترد</span>
                </span>
                <span>{{ chalet.deposit.toLocaleString('ar-EG') }} ج.م</span>
              </div>
              <div class="bd-divider" />
              <div class="bd-row bd-total">
                <span>الإجمالي</span>
                <span>{{ total.toLocaleString('ar-EG') }} ج.م</span>
              </div>
            </div>
          </Transition>

          <!-- Date blocked error -->
          <Transition name="fade-bd">
            <div v-if="dateBlockedError" class="date-blocked-error">
              <i class="pi pi-exclamation-triangle" />
              هذه التواريخ محجوزة بالفعل
            </div>
          </Transition>

          <!-- Booking terms checkbox -->
          <div class="booking-terms" v-if="nights > 0 && canBook">
            <label class="terms-check">
              <input type="checkbox" v-model="bookingTermsAccepted" />
              <span>أوافق على <button type="button" class="terms-link" @click="showTermsModal = true">شروط حجز القرية</button></span>
            </label>
          </div>

          <!-- Book button -->
          <button class="book-btn" :disabled="nights === 0 || !canBook || !bookingTermsAccepted" @click="handleBook"
                  :title="!canBook ? 'صلاحيات الحجز متاحة للمستخدمين والمناديب فقط' : ''">
            <i :class="nights > 0 ? 'pi pi-check' : 'pi pi-calendar'" />
            {{ !canBook ? 'غير مصرح لك بالحجز' : nights > 0 ? 'احجز الآن' : 'اختر تواريخ الحجز' }}
          </button>

          <!-- Info notice -->
          <p class="card-notice">
            <i class="pi pi-lock" />
            لن يتم خصم أي مبلغ الآن
          </p>
        </div>

        <!-- Scarcity signal -->
        <div class="scarcity-banner" v-if="chalet.rating >= 4.5">
          <div class="scarcity-pulse" />
          <i class="pi pi-bolt" />
          <span>نادراً ما يتوفر — يُحجز بسرعة</span>
        </div>
      </aside>
    </div>

    <!-- Terms Modal -->
    <Teleport to="body">
      <Transition name="gallery-modal">
        <div v-if="showTermsModal" class="terms-overlay" @click.self="showTermsModal = false">
          <div class="terms-modal">
            <div class="terms-modal-header">
              <h3>شروط حجز القرية</h3>
              <button @click="showTermsModal = false"><i class="pi pi-times" /></button>
            </div>
            <div class="terms-modal-body" v-html="settings.villageTerms?.ar?.content || 'لا توجد شروط حالياً'"></div>
            <div class="terms-modal-footer">
              <button class="terms-accept-btn" @click="bookingTermsAccepted = true; showTermsModal = false">
                <i class="pi pi-check" /> أوافق
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ══════════════════════════════════════════════
         MOBILE STICKY BOTTOM BAR
         ══════════════════════════════════════════════ -->
    <div class="mobile-bar">
      <div class="mobile-bar-price">
        <span class="mb-price">{{ chalet.price.toLocaleString('ar-EG') }} <small>ج.م</small></span>
        <span class="mb-unit">/ ليلة</span>
        <span class="mb-rating"><i class="pi pi-star-fill" /> {{ chalet.rating }}</span>
      </div>
      <button class="mb-book" :disabled="!canBook" @click="handleMobileBook"
              :title="!canBook ? 'صلاحيات الحجز متاحة للمستخدمين والمناديب فقط' : ''">
        {{ canBook ? 'احجز الآن' : 'غير مصرح لك بالحجز' }}
      </button>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════
       NOT FOUND STATE
       ══════════════════════════════════════════════ -->
  <div class="not-found" v-else>
    <div class="nf-icon"><i class="pi pi-exclamation-triangle" /></div>
    <h2>الشاليه غير موجود</h2>
    <p>لم نتمكن من العثور على الشاليه المطلوب</p>
    <RouterLink :to="{ name: 'booking' }" class="nf-link">
      <i class="pi pi-arrow-right" />
      العودة للبحث
    </RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import DatePicker from 'primevue/datepicker'
import { chalets, amenityMap } from '@/data/chalets'
import { useAuthStore } from '@/stores/auth'
import { useBookingsStore } from '@/stores/bookings'
import { useToastStore } from '@/stores/toast'
import { useSettingsStore } from '@/stores/settings'
import { BOOKING_ROLES } from '@/constants/roles'

import 'swiper/css'
import 'swiper/css/navigation'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const bookingsStore = useBookingsStore()
const toast = useToastStore()
const settings = useSettingsStore()

// Booking permission check
const canBook = computed(() => {
  if (!auth.isAuthenticated) return true
  return BOOKING_ROLES.includes(auth.user?.role)
})
const dateBlockedError = ref(false)
const bookingTermsAccepted = ref(false)
const showTermsModal = ref(false)

// ── Chalet Data ──
const chalet = computed(() => {
  const id = Number(route.params.id)
  return chalets.find((c) => c.id === id) || null
})

// ── Gallery Modal ──
const galleryOpen = ref(false)
const galleryIndex = ref(0)

function openGallery(idx) {
  galleryIndex.value = idx
  galleryOpen.value = true
}

// ── Description ──
const showFullDesc = ref(false)

// ── Like / Share ──
const liked = ref(false)
const shareSheet = ref(false)
const copied = ref(false)

function shareWhatsApp() {
  const url = window.location.href
  const text = `${chalet.value.name} — ${chalet.value.price} ج.م / ليلة`
  window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
  shareSheet.value = false
}

function shareFacebook() {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')
  shareSheet.value = false
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* clipboard unavailable */ }
  shareSheet.value = false
}

// ── Amenities ──
function getAmenity(key) {
  try {
    const saved = JSON.parse(localStorage.getItem('pb_amenities') || '[]')
    const found = saved.find((a) => a.key === key)
    if (found) return found
  } catch { /* */ }
  return amenityMap[key] || { label: key, icon: 'pi pi-check' }
}

// ── Similar Chalets ──
const similarChalets = computed(() => {
  if (!chalet.value) return []
  return chalets
    .filter((c) => c.id !== chalet.value.id && c.category === chalet.value.category)
    .slice(0, 4)
})

// ── Sidebar Booking ──
const sidebarDateRange = ref(null)
const minDate = new Date()
const sidebarRef = ref(null)

// ── Booked (disabled) dates ── (mock bookedDates + store PENDING/CONFIRMED)
const disabledDates = computed(() => {
  if (!chalet.value) return []
  const dates = []
  // From mock data
  if (chalet.value.bookedDates) {
    for (const [start, end] of chalet.value.bookedDates) {
      const d = new Date(start)
      while (d <= end) {
        dates.push(new Date(d))
        d.setDate(d.getDate() + 1)
      }
    }
  }
  // From store (PENDING + CONFIRMED bookings)
  const storeDates = bookingsStore.getBlockedDatesForChalet(chalet.value.id)
  dates.push(...storeDates)
  return dates
})

// ── Pre-fill dates from query params ──
function initDatesFromQuery() {
  const { checkIn, checkOut } = route.query
  if (checkIn && checkOut) {
    const start = new Date(checkIn + 'T00:00:00')
    const end = new Date(checkOut + 'T00:00:00')
    if (!isNaN(start) && !isNaN(end) && end > start) {
      sidebarDateRange.value = [start, end]
    }
  }
}

onMounted(() => {
  initDatesFromQuery()
})

const nights = computed(() => {
  if (!sidebarDateRange.value?.[0] || !sidebarDateRange.value?.[1]) return 0
  return Math.round((sidebarDateRange.value[1] - sidebarDateRange.value[0]) / 86400000)
})

const subtotal = computed(() => (chalet.value?.price || 0) * nights.value)
const total = computed(() => subtotal.value + (chalet.value?.deposit || 0))

// ── Booking flow ──
async function handleBook() {
  if (nights.value === 0 || !chalet.value) return
  dateBlockedError.value = false

  if (!bookingTermsAccepted.value) {
    toast.error('يجب الموافقة على شروط حجز القرية')
    return
  }

  // Check booking role permission
  if (auth.isAuthenticated && !BOOKING_ROLES.includes(auth.user?.role)) {
    toast.error('غير مصرح لك بالحجز. الحجز متاح للعملاء والمناديب فقط')
    return
  }

  // Check auth
  if (!auth.isAuthenticated) {
    const checkIn = sidebarDateRange.value[0].toISOString().split('T')[0]
    const checkOut = sidebarDateRange.value[1].toISOString().split('T')[0]
    auth.returnUrl = `/booking/${chalet.value.id}?checkIn=${checkIn}&checkOut=${checkOut}`
    router.push('/login')
    return
  }

  // Check date conflicts in store
  const checkIn = sidebarDateRange.value[0].toISOString()
  const checkOut = sidebarDateRange.value[1].toISOString()
  if (bookingsStore.isDateBlocked(chalet.value.id, checkIn, checkOut)) {
    dateBlockedError.value = true
    setTimeout(() => { dateBlockedError.value = false }, 4000)
    return
  }

  // Create booking
  const booking = bookingsStore.createBooking({
    chaletId: chalet.value.id,
    userId: auth.user.id,
    checkIn,
    checkOut,
    nights: nights.value,
    subtotal: subtotal.value,
    deposit: chalet.value.deposit,
    total: total.value,
    chaletName: chalet.value.name,
    chaletNumber: chalet.value.chaletNumber,
    chaletImage: chalet.value.image,
  })

  // Send booking notifications to owner and operator
  try {
    const { useNotificationsStore } = await import('@/stores/notifications')
    const { useChaletsStore } = await import('@/stores/chalets')
    const notifStore = useNotificationsStore()
    const chaletsStore = useChaletsStore()
    const chaletData = chaletsStore.getById(chalet.value.id)
    const notifBody = `حجز جديد — شاليه ${chalet.value.chaletNumber} من ${new Date(checkIn).toLocaleDateString('ar-EG')} إلى ${new Date(checkOut).toLocaleDateString('ar-EG')}`

    // Notify owner
    if (chaletData?.ownerId) {
      notifStore.send({ toUserId: chaletData.ownerId, title: 'حجز جديد على شاليهك', body: notifBody, type: 'booking', meta: { bookingId: booking.id, chaletNumber: chalet.value.chaletNumber } })
    }
    // Notify operator
    if (chaletData?.operatorId) {
      notifStore.send({ toUserId: chaletData.operatorId, title: 'حجز جديد على شاليه تشغيلك', body: notifBody, type: 'booking', meta: { bookingId: booking.id, chaletNumber: chalet.value.chaletNumber } })
    }
  } catch {}

  toast.success('تم إنشاء الحجز بنجاح')
  router.push(`/booking-confirmation/${booking.id}`)
}

function handleMobileBook() {
  if (nights.value > 0) {
    handleBook()
  } else {
    scrollToSidebar()
  }
}

// ── Mobile ──
function scrollToSidebar() {
  sidebarRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── Mark booked dates with red styling after render ──
function markBookedDates() {
  nextTick(() => {
    const cal = document.querySelector('.calendar-dropdown')
    if (!cal || !chalet.value?.bookedDates) return
    const allDayCells = cal.querySelectorAll('[data-p-datepicker-day-cell]')
    // PrimeVue renders disabled days with specific classes, we add our own via CSS
  })
}

watch(() => chalet.value?.id, () => markBookedDates(), { immediate: true })

// ── Reset on ID change ──
watch(() => route.params.id, () => {
  showFullDesc.value = false
  sidebarDateRange.value = null
  galleryOpen.value = false
  galleryIndex.value = 0
  liked.value = false
  shareSheet.value = false
  copied.value = false
  initDatesFromQuery()
  window.scrollTo({ top: 0 })
})
</script>

<style scoped>
/* ═══════════════════════════════════
   PAGE
   ═══════════════════════════════════ */
.chalet-details {
  min-height: 100vh;
  background: #fff;
  padding-bottom: 1rem;
}

/* ═══════════════════════════════════
   PHOTO MOSAIC (Airbnb 1+4 Grid)
   ═══════════════════════════════════ */
.photo-mosaic {
  max-width: 1280px;
  margin: 0 auto;
  padding: 5.5rem 2rem 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto;
  gap: 6px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.mosaic-main {
  grid-row: 1;
  grid-column: 1;
  aspect-ratio: 1/1;
}

.mosaic-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: filter 0.3s;
}

.photo-mosaic:hover img {
  filter: brightness(0.92);
}

.mosaic-grid {
  grid-row: 1;
  grid-column: 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
}

.mosaic-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mosaic-cell {
  overflow: hidden;
}

.mosaic-placeholder {
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e1;
  font-size: 2rem;
}

.show-all-btn {
  position: absolute;
  bottom: 1.25rem;
  left: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1.1rem;
  border-radius: 8px;
  border: 1px solid #222;
  background: #fff;
  color: #222;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  z-index: 2;
}

.show-all-btn:hover {
  background: #f1f5f9;
}

.show-all-btn i {
  font-size: 0.75rem;
}

/* ═══════════════════════════════════
   FULLSCREEN GALLERY MODAL
   ═══════════════════════════════════ */
.gallery-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-close {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.gallery-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.gallery-counter {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
}

.gallery-swiper {
  width: 100%;
  max-width: 900px;
  height: 80vh;
}

.gallery-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.gallery-slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.gallery-swiper :deep(.swiper-button-next),
.gallery-swiper :deep(.swiper-button-prev) {
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  transition: background 0.2s;
}

.gallery-swiper :deep(.swiper-button-next):hover,
.gallery-swiper :deep(.swiper-button-prev):hover {
  background: rgba(255, 255, 255, 0.25);
}

.gallery-swiper :deep(.swiper-button-next)::after,
.gallery-swiper :deep(.swiper-button-prev)::after {
  font-size: 18px;
  font-weight: 700;
}

.gallery-modal-enter-active,
.gallery-modal-leave-active {
  transition: opacity 0.25s ease;
}

.gallery-modal-enter-from,
.gallery-modal-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════
   PAGE BODY (content + sidebar)
   ═══════════════════════════════════ */
.page-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem 2rem 0;
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: 5rem;
  align-items: start;
}

.main-col {
  min-width: 0;
}

/* ── Divider ── */
.divider {
  height: 1px;
  background: #ebebeb;
  margin: 2rem 0;
}

/* ═══════════════════════════════════
   TITLE SECTION
   ═══════════════════════════════════ */
.title-section {
  position: relative;
}

.title-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.title-section h1 {
  font-size: 1.65rem;
  font-weight: 800;
  color: #222;
  line-height: 1.35;
  margin-bottom: 0.5rem;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.88rem;
  color: #444;
  font-weight: 600;
}

.meta-item i {
  font-size: 0.78rem;
  color: #717171;
}

.rating-badge i {
  color: #222;
}

.review-count {
  color: #717171;
  font-weight: 500;
  margin-right: 0.15rem;
}

.meta-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #717171;
  flex-shrink: 0;
}

.title-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.85rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #222;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
  text-decoration: underline;
}

.action-btn:hover {
  background: #f7f7f7;
}

.action-btn i {
  font-size: 0.85rem;
}

/* Share dropdown */
.share-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid #ebebeb;
  padding: 0.5rem;
  z-index: 20;
  min-width: 200px;
}

.share-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.7rem 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #222;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.share-item:hover {
  background: #f7f7f7;
}

.share-item i {
  font-size: 1rem;
  width: 20px;
  text-align: center;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ═══════════════════════════════════
   QUICK STATS
   ═══════════════════════════════════ */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #ebebeb;
  transition: border-color 0.2s;
}

.stat-card:hover {
  border-color: #222;
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon i {
  font-size: 1.1rem;
  color: #222;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: #222;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.78rem;
  color: #717171;
  font-weight: 500;
}

/* ═══════════════════════════════════
   HIGHLIGHTS
   ═══════════════════════════════════ */
.highlights {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.highlight-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.highlight-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--primary-rgb), 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.highlight-icon i {
  font-size: 1rem;
  color: var(--primary);
}

.highlight-row strong {
  display: block;
  font-size: 0.92rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.15rem;
}

.highlight-row p {
  font-size: 0.82rem;
  color: #717171;
  line-height: 1.5;
}

/* ═══════════════════════════════════
   DESCRIPTION
   ═══════════════════════════════════ */
.desc-section h2,
.amenities-section h2,
.views-section h2,
.videos-section h2,
.similar-section h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 1.25rem;
}

.desc-text {
  font-size: 0.95rem;
  line-height: 1.85;
  color: #444;
}

.desc-text.collapsed {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.show-more {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  padding: 0;
  border: none;
  background: none;
  color: #222;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
}

.show-more i {
  font-size: 0.65rem;
}

/* ═══════════════════════════════════
   AMENITIES
   ═══════════════════════════════════ */
.amenities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}

.amenity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #ebebeb;
  font-size: 0.92rem;
  color: #222;
  font-weight: 500;
}

.amenity-item:nth-last-child(-n+2) {
  border-bottom: none;
}

.amenity-item i {
  font-size: 1.15rem;
  color: #444;
  width: 24px;
  text-align: center;
}

.amenity-custom-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

/* ═══════════════════════════════════
   VIEWS
   ═══════════════════════════════════ */
.views-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.view-tag {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.2rem;
  border-radius: 50px;
  border: 1px solid #ebebeb;
  font-size: 0.88rem;
  font-weight: 600;
  color: #222;
  transition: all 0.2s;
}

.view-tag:hover {
  border-color: #222;
}

.view-tag i {
  font-size: 0.85rem;
  color: var(--primary);
}

/* ═══════════════════════════════════
   VIDEOS
   ═══════════════════════════════════ */
.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  border-radius: 16px;
  overflow: hidden;
  background: #111;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* ═══════════════════════════════════
   SIMILAR CHALETS
   ═══════════════════════════════════ */
.similar-scroll {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.similar-card {
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.similar-card:hover {
  transform: translateY(-4px);
}

.similar-img-wrap {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 1/1;
  margin-bottom: 0.65rem;
}

.similar-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s;
}

.similar-card:hover .similar-img-wrap img {
  transform: scale(1.04);
}

.similar-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 0.2rem 0.6rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #222;
}

.similar-body h4 {
  font-size: 0.92rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 0.15rem;
}

.similar-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.78rem;
  color: #717171;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.similar-meta i {
  font-size: 0.7rem;
  color: #222;
}

.similar-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.similar-price {
  font-size: 0.92rem;
  font-weight: 700;
  color: #222;
}

.similar-unit {
  font-size: 0.78rem;
  color: #717171;
  font-weight: 500;
}

/* ═══════════════════════════════════
   BOOKING SIDEBAR
   ═══════════════════════════════════ */
.sidebar-col {
  position: sticky;
  top: 6rem;
}

.booking-card {
  border-radius: 16px;
  padding: 1.1rem;
  background: #fff;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(0, 0, 0, 0.06),
    0 16px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

/* ── Card Header ── */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  padding-bottom: 0.65rem;
  border-bottom: 1px solid #f0f0f0;
}

.card-price-block {
  display: flex;
  align-items: baseline;
  gap: 0.15rem;
}

.card-price-num {
  font-size: 1.45rem;
  font-weight: 800;
  color: #111;
  letter-spacing: -0.02em;
}

.card-price-currency {
  font-size: 0.88rem;
  font-weight: 700;
  color: #111;
}

.card-price-per {
  font-size: 0.78rem;
  color: #888;
  font-weight: 500;
  margin-right: 0.1rem;
}

.card-rating-pill {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.28rem 0.6rem;
  border-radius: 50px;
  background: #f7f7f7;
  font-size: 0.75rem;
  font-weight: 600;
  color: #111;
}

.card-rating-pill i {
  color: #f59e0b;
  font-size: 0.68rem;
}

.card-review-dot {
  color: #ccc;
  margin: 0 0.05rem;
}

.card-review-count {
  font-weight: 500;
  color: #888;
  font-size: 0.68rem;
}

/* ── Nights Badge ── */
.nights-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.25rem;
  margin-bottom: 0.45rem;
  border-radius: 7px;
  background: linear-gradient(135deg, #ecfdf5, #d1fae5);
  font-size: 0.75rem;
  font-weight: 700;
  color: #166534;
}

.nights-badge i {
  font-size: 0.68rem;
}

/* ── Calendar ── */
.calendar-card {
  border-radius: 10px;
  padding: 0.4rem 0.5rem 0.3rem;
  margin-bottom: 0.55rem;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.calendar-card :deep(.p-datepicker) {
  border: none;
  background: transparent;
  width: 100%;
  font-family: 'Cairo', sans-serif;
}

.calendar-card :deep(.p-datepicker-header) {
  padding: 0.15rem 0 0.35rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.2rem;
}

.calendar-card :deep(.p-datepicker-title) {
  font-weight: 800;
  font-size: 0.82rem;
  color: #111;
  gap: 0.35rem;
}

.calendar-card :deep(.p-datepicker-prev-button),
.calendar-card :deep(.p-datepicker-next-button) {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  color: #333;
  transition: all 0.15s;
}

.calendar-card :deep(.p-datepicker-prev-button:hover),
.calendar-card :deep(.p-datepicker-next-button:hover) {
  background: #eee;
}

.calendar-card :deep(.p-datepicker-day-cell) {
  padding: 1px;
}

.calendar-card :deep(.p-datepicker-day) {
  width: 2rem;
  height: 2rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.75rem;
  transition: all 0.15s;
}

.calendar-card :deep(.p-datepicker-day:not(.p-disabled):not(.p-datepicker-day-selected):hover) {
  background: #e8f5e9;
  color: #2e7d32;
}

/* Selected dates — green */
.calendar-card :deep(.p-datepicker-day.p-datepicker-day-selected) {
  background: #16a34a;
  color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
  font-weight: 700;
}

/* Range between selected — light green */
.calendar-card :deep(.p-datepicker-day.p-datepicker-day-selected-range) {
  background: #dcfce7;
  color: #166534;
  border-radius: 0;
}

/* Booked / disabled dates — red */
.calendar-card :deep(.p-datepicker-day.p-disabled) {
  opacity: 1;
  background: #fff5f5;
  color: #ef4444;
  text-decoration: line-through;
  cursor: not-allowed;
  border-radius: 8px;
  font-weight: 500;
}

.calendar-card :deep(.p-datepicker-weekday-cell) {
  padding: 0.2rem 0;
}

.calendar-card :deep(.p-datepicker-weekday) {
  font-size: 0.65rem;
  font-weight: 800;
  color: #aaa;
  text-transform: uppercase;
}

/* Legend */
.calendar-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.35rem 0 0.15rem;
  border-top: 1px solid #eee;
  margin-top: 0.25rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.62rem;
  font-weight: 600;
  color: #888;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-selected {
  background: #16a34a;
}

.legend-booked {
  background: #ef4444;
}

.legend-available {
  background: #fff;
  border: 1.5px solid #ccc;
}

/* ── Price Breakdown ── */
.price-breakdown {
  padding: 0.65rem 0.75rem;
  margin-bottom: 0.65rem;
  border-radius: 10px;
  background: #f9fafb;
  border: 1px solid #f0f0f0;
}

.bd-row {
  display: flex;
  justify-content: space-between;
  padding: 0.3rem 0;
  font-size: 0.78rem;
  color: #444;
}

.bd-row span:first-child {
  text-decoration: none;
  color: #555;
}

.bd-total {
  padding-top: 0.4rem;
}

.bd-total span:first-child {
  font-weight: 800;
  color: #111;
}

.bd-total span:last-child {
  font-weight: 800;
  color: #111;
  font-size: 0.9rem;
}

.deposit-label {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.refund-badge {
  display: inline-block;
  padding: 0.05rem 0.35rem;
  border-radius: 5px;
  background: #ecfdf5;
  color: #16a34a;
  font-size: 0.58rem;
  font-weight: 700;
}

.bd-divider {
  height: 1px;
  background: #e5e7eb;
  margin: 0.2rem 0;
}

/* ── Date blocked error ── */
.date-blocked-error {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.75rem;
  margin-bottom: 0.55rem;
  border-radius: 8px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.75rem;
  font-weight: 600;
}

.date-blocked-error i {
  font-size: 0.78rem;
}

/* ── Book Button ── */
.book-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.3);
  letter-spacing: 0.01em;
}

.book-btn:hover:not(:disabled) {
  box-shadow: 0 6px 24px rgba(var(--primary-rgb), 0.45);
  transform: translateY(-2px);
}

.book-btn:active:not(:disabled) {
  transform: translateY(0);
}

.book-btn:disabled {
  background: #e5e7eb;
  color: #999;
  box-shadow: none;
  cursor: not-allowed;
}

.book-btn i {
  font-size: 0.85rem;
}

.card-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  margin-top: 0.6rem;
  font-size: 0.68rem;
  color: #aaa;
  font-weight: 500;
}

.card-notice i {
  font-size: 0.6rem;
}

/* ── Scarcity ── */
.scarcity-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.65rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border: 1px solid #fde68a;
  font-size: 0.75rem;
  font-weight: 700;
  color: #92400e;
  position: relative;
  overflow: hidden;
}

.scarcity-banner i {
  color: #f59e0b;
  font-size: 1rem;
  z-index: 1;
}

.scarcity-banner span {
  z-index: 1;
}

.scarcity-pulse {
  position: absolute;
  top: 50%;
  right: 1.25rem;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  transform: translateY(-50%);
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
}

/* Fade transition for price breakdown */
.fade-bd-enter-active,
.fade-bd-leave-active {
  transition: opacity 0.25s ease;
}

.fade-bd-enter-from,
.fade-bd-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════
   MOBILE BOTTOM BAR
   ═══════════════════════════════════ */
.mobile-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  border-top: 1px solid #ebebeb;
  padding: 0.85rem 1.25rem;
  align-items: center;
  justify-content: space-between;
}

.mobile-bar-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.mb-price {
  font-size: 1.05rem;
  font-weight: 800;
  color: #222;
}

.mb-price small {
  font-size: 0.85rem;
}

.mb-unit {
  font-size: 0.82rem;
  color: #717171;
  font-weight: 500;
}

.mb-rating {
  font-size: 0.78rem;
  font-weight: 600;
  color: #222;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  margin-right: 0.5rem;
}

.mb-rating i {
  font-size: 0.68rem;
}

.mb-book {
  padding: 0.72rem 1.75rem;
  border-radius: 8px;
  border: none;
  background: linear-gradient(to left, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
}

/* ═══════════════════════════════════
   NOT FOUND
   ═══════════════════════════════════ */
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  background: #fff;
}

.nf-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.nf-icon i {
  font-size: 1.8rem;
  color: #ef4444;
}

.not-found h2 {
  font-size: 1.3rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 0.4rem;
}

.not-found p {
  font-size: 0.9rem;
  color: #717171;
  margin-bottom: 1.5rem;
}

.nf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 2rem;
  border-radius: 8px;
  background: #222;
  color: #fff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 700;
  transition: background 0.15s;
}

.nf-link:hover {
  background: #000;
}

/* ═══════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════ */
@media (max-width: 1024px) {
  .page-body {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .sidebar-col {
    position: static;
  }

  .mobile-bar {
    display: flex;
  }

  .chalet-details {
    padding-bottom: 5rem;
  }

  .similar-scroll {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .photo-mosaic {
    padding: 4.5rem 0 0;
    border-radius: 0;
    gap: 3px;
  }

  .show-all-btn {
    bottom: 0.75rem;
    left: 0.75rem;
    padding: 0.4rem 0.85rem;
    font-size: 0.75rem;
  }

  .page-body {
    padding: 1.25rem 1rem 0;
  }

  .title-section h1 {
    font-size: 1.3rem;
  }

  .title-top {
    flex-direction: column;
    gap: 0.75rem;
  }

  .title-actions {
    align-self: flex-start;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .amenities-grid {
    grid-template-columns: 1fr;
  }

  .similar-scroll {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .booking-card {
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
  }

  .stat-card {
    padding: 0.75rem;
    gap: 0.5rem;
  }

  .stat-icon {
    width: 36px;
    height: 36px;
  }

  .similar-scroll {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
}

/* ═══════════════════════════════════
   BOOKING TERMS
   ═══════════════════════════════════ */
.booking-terms {
  margin-bottom: 0.75rem;
}
.terms-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #475569;
  cursor: pointer;
}
.terms-check input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary, #f97316);
  cursor: pointer;
  flex-shrink: 0;
}
.terms-link {
  color: var(--primary, #f97316);
  font-weight: 700;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  padding: 0;
  text-decoration: underline;
}
.terms-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}
.terms-modal {
  background: #fff;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.terms-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}
.terms-modal-header h3 {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}
.terms-modal-header button {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 1.1rem;
  padding: 0.25rem;
}
.terms-modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  color: #334155;
  font-size: 0.88rem;
  line-height: 1.8;
}
.terms-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}
.terms-accept-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border: none;
  font-weight: 700;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}
</style>
