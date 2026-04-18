<template>
  <div class="home">
    <section class="hero" ref="heroRef" @mousemove="onHeroMouse">
      <!-- Background image -->
      <div class="hero-bg">
        <img :src="heroBg" alt="Pharma Beach Resort" />
      </div>

      <!-- Dark overlay + mouse spotlight -->
      <div class="hero-overlay" />
      <div class="hero-spotlight" :style="spotlightStyle" />

      <!-- Light sweep -->
      <div class="hero-sweep" />

      <!-- Floating particles -->
      <div class="hero-particles">
        <span v-for="n in 20" :key="n" class="particle"
          :style="{
            left: ((n * 5 + 2) % 100) + '%',
            animationDelay: (n * 0.7) + 's',
            animationDuration: (6 + n % 5) + 's',
          }" />
      </div>

      <!-- Corner frames -->
      <div class="corner corner--tr" />
      <div class="corner corner--bl" />

      <!-- Glow ring behind title -->
      <div class="hero-halo" />

      <!-- Minimal centered content -->
      <div class="hero-center">
        <div class="hero-line-deco" />
        <h1 class="hero-name">
          <span class="hero-word" data-text="Pharma">
            <span v-for="(ch, i) in 'Pharma'" :key="'p'+i" class="hl" :style="`--i:${i}`">{{ ch }}</span>
          </span>
          <span class="hero-word hero-word--accent" data-text="Beach">
            <span v-for="(ch, i) in 'Beach'" :key="'b'+i" class="hl" :style="`--i:${i + 6}`">{{ ch }}</span>
          </span>
        </h1>
        <div class="hero-line-deco" />
        <p class="hero-arabic">شاليهات فاخرة على ساحل البحر الأبيض المتوسط</p>
        <div class="hero-meta">
          <div class="meta-card">
            <div class="meta-card-icon"><i class="pi pi-map-marker" /></div>
            <div class="meta-card-text">
              <strong>الموقع</strong>
              <span>الساحل الشمالي، مصر</span>
            </div>
          </div>
          <div class="meta-card">
            <div class="meta-card-icon meta-card-icon--gold"><i class="pi pi-star-fill" /></div>
            <div class="meta-card-text">
              <strong>التقييم</strong>
              <span>4.9 / 5</span>
            </div>
          </div>
          <div class="meta-card">
            <div class="meta-card-icon meta-card-icon--blue"><i class="pi pi-sun" /></div>
            <div class="meta-card-text">
              <strong>الطقس</strong>
              <span>28° مشمس</span>
            </div>
          </div>
        </div>
        <RouterLink to="/booking" class="hero-cta">احجز إقامتك</RouterLink>
      </div>

      <!-- Side vertical text -->
      <div class="hero-side hero-side--r">PHARMA BEACH RESORT</div>
      <div class="hero-side hero-side--l">MEDITERRANEAN COAST</div>

    </section>

    <!-- About Section -->
    <section :class="['about', { 'in-view': aboutVisible }]" ref="aboutRef">
      <!-- Background decorative elements -->
      <div class="about-bg-shapes">
        <div class="about-shape about-shape--1" />
        <div class="about-shape about-shape--2" />
        <div class="about-shape about-shape--3" />
        <div class="about-dots" />
      </div>
      <div class="about-container">
        <div class="about-text">
          <span class="about-tag">
            <span class="tag-line" />
            من نحن
            <span class="tag-line" />
          </span>
          <h2 class="about-title">نبذة عن <span>القرية</span></h2>
          <p class="about-desc">
            تقع قرية فارما بيتش ريزورت على ساحل البحر الأبيض المتوسط، وتوفر تجربة إقامة فاخرة
            تجمع بين الراحة والاستجمام. تضم القرية مجموعة من الشاليهات الحديثة المجهزة بالكامل،
            مع خدمات متميزة على مدار الساعة لضمان راحتكم.
          </p>

          <div class="about-stats">
            <div class="about-stat">
              <div class="stat-icon"><i class="pi pi-calendar" /></div>
              <div class="stat-content">
                <span class="stat-num">+10</span>
                <span class="stat-label">سنوات خبرة</span>
              </div>
            </div>
            <div class="about-stat">
              <div class="stat-icon stat-icon--blue"><i class="pi pi-building" /></div>
              <div class="stat-content">
                <span class="stat-num">+50</span>
                <span class="stat-label">شاليه فاخر</span>
              </div>
            </div>
            <div class="about-stat">
              <div class="stat-icon stat-icon--green"><i class="pi pi-users" /></div>
              <div class="stat-content">
                <span class="stat-num">+1200</span>
                <span class="stat-label">عميل سعيد</span>
              </div>
            </div>
          </div>

          <a href="#" class="about-link">
            اقرأ المزيد
            <i class="pi pi-arrow-down" />
          </a>
        </div>

        <div class="about-visual">
          <div class="about-deco" />
          <div class="about-img-main">
            <img src="https://picsum.photos/seed/pharma-resort-view/700/500" alt="فارما بيتش ريزورت" loading="lazy" />
            <button class="about-play" aria-label="تشغيل الفيديو">
              <i class="pi pi-play-fill" />
            </button>
          </div>
          <div class="about-img-float">
            <img src="https://picsum.photos/seed/pharma-pool-view/400/300" alt="المسبح" loading="lazy" />
          </div>
          <div class="about-badge">
            <span class="badge-num">+10</span>
            <span class="badge-txt">سنوات خبرة</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Location Section -->
    <section class="location">
      <!-- Background map (always visible, dimmed) -->
      <div class="loc-bg-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d217988.4511519507!2d28.5!3d31.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDAzJzAwLjAiTiAyOMKwMzAnMDAuMCJF!5e0!3m2!1sar!2seg!4v1700000000000"
          width="100%" height="100%" style="border:0"
          allowfullscreen="" loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        />
        <div class="loc-bg-tint" />
      </div>
      <div class="loc-wrapper">
        <!-- Dark card -->
        <div class="loc-card">
          <div class="loc-card-inner">
            <!-- Left: info -->
            <div class="loc-info">
              <span class="loc-tag">
                <span class="tag-line" />
                الموقع
                <span class="tag-line" />
              </span>
              <h2 class="loc-title">تجدنا هنا</h2>
              <div class="loc-detail">
                <i class="pi pi-map-marker" />
                <span>الساحل الشمالي — الكيلو 120، مصر</span>
              </div>
              <div class="loc-detail">
                <i class="pi pi-phone" />
                <span dir="ltr">+20 123 456 7890</span>
              </div>
              <div class="loc-detail">
                <i class="pi pi-clock" />
                <span>24 ساعة / 7 أيام</span>
              </div>
              <div class="loc-actions">
                <a href="https://maps.google.com" target="_blank" rel="noopener" class="loc-btn-primary">
                  <i class="pi pi-directions" />
                  احصل على الاتجاهات
                </a>
                <button class="loc-btn-map" @click="showMap = !showMap">
                  <i :class="showMap ? 'pi pi-times' : 'pi pi-map'" />
                  {{ showMap ? 'إخفاء الخريطة' : 'عرض الخريطة' }}
                </button>
              </div>
            </div>
            <!-- Right: map (revealed on click) -->
            <Transition name="map-reveal">
              <div v-if="showMap" class="loc-map-panel">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d217988.4511519507!2d28.5!3d31.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDAzJzAwLjAiTiAyOMKwMzAnMDAuMCJF!5e0!3m2!1sar!2seg!4v1700000000000"
                  width="100%" height="100%" style="border:0"
                  allowfullscreen="" loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade"
                />
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </section>

    <!-- Discover Section -->
    <section id="discover" class="discover">
      <!-- Animated background shapes -->
      <div class="discover-bg-shapes">
        <!-- Large gradient circle -->
        <div class="dshape dshape--blob-1" />
        <!-- Double ring -->
        <div class="dshape dshape--ring" />
        <!-- Oval outline -->
        <div class="dshape dshape--oval" />
        <!-- Dot grid -->
        <div class="dshape dshape--dots" />
        <!-- Accent circle -->
        <div class="dshape dshape--accent" />
      </div>
      <!-- Header with decorative line -->
      <div class="discover-header">
        <span class="discover-tag">
          <span class="tag-line" />
          اكتشف القرية
          <span class="tag-line" />
        </span>
        <h2 class="discover-title">جمال <span>فارما بيتش</span> من الداخل</h2>
        <p class="discover-sub">جولة بصرية في أرجاء القرية ومرافقها</p>
      </div>

      <!-- Filter chips with icons -->
      <div class="discover-filters">
        <button :class="['filter-chip', { active: discoverTab === 'photos' }]" @click="discoverTab = 'photos'">
          <i class="pi pi-images" />
          صور
          <span class="chip-count">{{ galleryItems.length }}</span>
        </button>
        <button :class="['filter-chip', { active: discoverTab === 'videos' }]" @click="discoverTab = 'videos'">
          <i class="pi pi-video" />
          فيديوهات
          <span class="chip-count">6</span>
        </button>
      </div>

      <!-- Masonry Photos Grid -->
      <div v-if="discoverTab === 'photos'" class="discover-masonry">
        <div
          v-for="(item, idx) in galleryItems"
          :key="item.id"
          :class="['mcard', { 'mcard--large': idx === 0 }]"
          @click="openLightbox(item)"
          :style="{ '--delay': idx * 0.08 + 's' }"
        >
          <img :src="item.img" :alt="item.title" loading="lazy" />
          <div class="mcard-overlay">
            <div class="mcard-zoom"><i class="pi pi-search-plus" /></div>
            <div class="mcard-info">
              <h3>{{ item.title }}</h3>
              <p>{{ item.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Videos Grid -->
      <div v-if="discoverTab === 'videos'" class="discover-masonry">
        <div
          v-for="n in 6"
          :key="'vid-' + n"
          :class="['mcard', { 'mcard--large': n === 1 }]"
          :style="{ '--delay': (n - 1) * 0.08 + 's' }"
        >
          <div class="mcard-video">
            <div class="video-play">
              <i class="pi pi-play-fill" />
            </div>
            <span>فيديو القرية {{ n }}</span>
          </div>
        </div>
      </div>

      <!-- Lightbox -->
      <Teleport to="body">
        <Transition name="lightbox-fade">
          <div v-if="lightboxItem" class="lightbox-overlay" @click="lightboxItem = null">
            <button class="lightbox-close" @click.stop="lightboxItem = null">
              <i class="pi pi-times" />
            </button>
            <img :src="lightboxItem.img" :alt="lightboxItem.title" class="lightbox-img" @click.stop />
          </div>
        </Transition>
      </Teleport>
    </section>

    <!-- Features: Sticky Scroll Section -->
    <section class="features" ref="featRef" :style="{ height: featuresData.length * 100 + 'vh' }">
      <div class="features-sticky">
        <!-- Full-width background image -->
        <div class="features-bg">
          <Transition name="feat-fade">
            <div class="feat-slide" :key="activeFeature">
              <img :src="featuresData[activeFeature].img" :alt="featuresData[activeFeature].title" />
            </div>
          </Transition>
          <div class="features-bg-overlay" />
        </div>

        <!-- Active feature info: centered on image -->
        <div class="feat-active-display">
          <Transition name="feat-info" mode="out-in">
            <div class="feat-active-inner" :key="activeFeature">
              <div class="feat-active-icon">
                <i :class="'pi ' + featuresData[activeFeature].icon" />
              </div>
              <h3 class="feat-active-title">{{ featuresData[activeFeature].title }}</h3>
              <p class="feat-active-desc">{{ featuresData[activeFeature].desc }}</p>
            </div>
          </Transition>
        </div>

        <!-- Steps card -->
        <div class="features-card">
          <span class="features-tag">
            <span class="tag-line" />
            مميزاتنا
            <span class="tag-line" />
          </span>
          <h2 class="features-title">هي وجهتك <span>المثالية</span></h2>
          <p class="features-desc">كل ما تحتاجه لعطلة لا تُنسى متوفر في مكان واحد</p>
          <div class="features-list">
            <button
              v-for="(feat, i) in featuresData"
              :key="feat.id"
              :class="['feat-item', { passed: i < activeFeature, current: i === activeFeature }]"
              @click="goToFeature(i)"
            >
              <span class="feat-indicator">
                <i v-if="i <= activeFeature" class="pi pi-check" />
              </span>
              <span class="feat-item-title">{{ feat.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section :class="['cta', { 'in-view': ctaVisible }]" ref="ctaRef">
      <div class="cta-container">
        <div class="cta-glow-wrap">
          <span class="cta-glow-ring" />
        </div>
        <div class="cta-card">
          <!-- Animated gradient overlay -->
          <div class="cta-gradient-bg" />

          <!-- Animated floating shapes -->
          <div class="cta-shapes">
            <span class="cta-shape cta-shape--1" />
            <span class="cta-shape cta-shape--2" />
            <span class="cta-shape cta-shape--3" />
            <span class="cta-shape cta-shape--4" />
            <span class="cta-shape cta-shape--5" />
          </div>

          <!-- Floating particles -->
          <div class="cta-particles">
            <span v-for="n in 12" :key="n" :class="'cta-particle cta-particle--' + n" />
          </div>

          <!-- Animated border -->
          <div class="cta-border-glow" />

          <div class="cta-inner">
            <span class="cta-badge">
              <span class="tag-line" />
              عروض لفترة محدودة
              <span class="tag-line" />
            </span>
            <h2 class="cta-title">جاهز لعطلة <span>لا تُنسى</span> ؟</h2>
            <p class="cta-desc">احجز شاليهك الآن واستمتع بأفضل العروض الحصرية على فارما بيتش ريزورت</p>
            <div class="cta-actions">
              <RouterLink to="/booking" class="cta-btn">
                <span class="cta-btn-text">احجز الآن — عروض محدودة</span>
                <i class="pi pi-arrow-left" />
              </RouterLink>
              <a href="tel:+201234567890" class="cta-phone">
                <i class="pi pi-phone" />
                اتصل بنا
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import heroBg from '@/assets/images/hero-bg.jpg'

// ---- Hero: mouse spotlight + parallax ----
const heroRef = ref(null)
const mouseX = ref(50)
const mouseY = ref(50)

const spotlightStyle = computed(() => ({
  background: `radial-gradient(600px circle at ${mouseX.value}% ${mouseY.value}%, rgba(255,255,255,0.04) 0%, transparent 100%)`,
}))

function onHeroMouse(e) {
  if (!heroRef.value || window.innerWidth < 768) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = ((e.clientX - rect.left) / rect.width * 100).toFixed(1)
  mouseY.value = ((e.clientY - rect.top) / rect.height * 100).toFixed(1)
}

function onHeroScroll() {
  if (!heroRef.value) return
  const y = window.scrollY
  if (y > window.innerHeight) return
  const img = heroRef.value.querySelector('.hero-bg > img')
  if (img) img.style.transform = `scale(${1 + y * 0.0001}) translateY(${y * 0.15}px)`
}

// ---- Location: map toggle ----
const showMap = ref(false)

// ---- About Section: scroll entrance ----
const aboutRef = ref(null)
const aboutVisible = ref(false)
let aboutObserver = null

// ---- CTA Section: scroll entrance ----
const ctaRef = ref(null)
const ctaVisible = ref(false)
let ctaObserver = null

// ---- Features Section: sticky scroll ----
const featRef = ref(null)
const activeFeature = ref(0)

const featuresData = [
  { id: 1, title: 'شاطئ خاص', desc: 'شاطئ رملي ناعم بمياه كريستالية صافية مع خدمات شاطئية متكاملة', icon: 'pi-sun', img: 'https://picsum.photos/seed/pharma-feat-beach/1200/900' },
  { id: 2, title: 'مطاعم متنوعة', desc: 'مطاعم عالمية تقدم أشهى المأكولات البحرية والعالمية', icon: 'pi-star', img: 'https://picsum.photos/seed/pharma-feat-dining/1200/900' },
  { id: 3, title: 'موقف سيارات', desc: 'موقف سيارات آمن ومجهز بالكامل لجميع الزوار', icon: 'pi-car', img: 'https://picsum.photos/seed/pharma-feat-parking/1200/900' },
  { id: 4, title: 'واي فاي مجاني', desc: 'إنترنت فائق السرعة متاح في جميع أنحاء القرية', icon: 'pi-wifi', img: 'https://picsum.photos/seed/pharma-feat-wifi/1200/900' },
  { id: 5, title: 'أمن 24/7', desc: 'فريق أمن محترف يعمل على مدار الساعة لراحتكم وأمانكم', icon: 'pi-shield', img: 'https://picsum.photos/seed/pharma-feat-security/1200/900' },
  { id: 6, title: 'مناطق خضراء', desc: 'حدائق ومساحات خضراء واسعة للاسترخاء والتنزه', icon: 'pi-heart', img: 'https://picsum.photos/seed/pharma-feat-green/1200/900' },
]

function onFeatScroll() {
  if (!featRef.value) return
  const rect = featRef.value.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return
  const scrolled = -rect.top
  const scrollable = featRef.value.offsetHeight - window.innerHeight
  if (scrollable <= 0) return
  const progress = Math.max(0, Math.min(1, scrolled / scrollable))
  activeFeature.value = Math.min(featuresData.length - 1, Math.floor(progress * featuresData.length))
}



function goToFeature(idx) {
  if (!featRef.value) return
  const top = featRef.value.offsetTop
  const scrollable = featRef.value.offsetHeight - window.innerHeight
  window.scrollTo({ top: top + ((idx + 0.3) / featuresData.length) * scrollable, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onHeroScroll, { passive: true })

  aboutObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { aboutVisible.value = true; aboutObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (aboutRef.value) aboutObserver.observe(aboutRef.value)
  ctaObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { ctaVisible.value = true; ctaObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (ctaRef.value) ctaObserver.observe(ctaRef.value)
  window.addEventListener('scroll', onFeatScroll, { passive: true })
  featuresData.forEach(f => { const img = new Image(); img.src = f.img })
})
onUnmounted(() => {
  aboutObserver?.disconnect()
  ctaObserver?.disconnect()
  window.removeEventListener('scroll', onFeatScroll)
  window.removeEventListener('scroll', onHeroScroll)
})

// ---- Discover Section ----
const discoverTab = ref('photos')
const lightboxItem = ref(null)

const galleryItems = [
  { id: 1, title: 'المسبح الرئيسي', desc: 'استرخاء وسباحة بلا حدود', img: 'https://picsum.photos/seed/pharma-pool/800/500' },
  { id: 2, title: 'الشاطئ الخاص', desc: 'رمال ذهبية وأمواج هادئة', img: 'https://picsum.photos/seed/pharma-beach/800/500' },
  { id: 3, title: 'الشاليهات', desc: 'إقامة فاخرة بإطلالة بحرية', img: 'https://picsum.photos/seed/pharma-chalet/800/500' },
  { id: 4, title: 'المطعم', desc: 'مأكولات عالمية وأجواء ساحرة', img: 'https://picsum.photos/seed/pharma-dining/800/500' },
  { id: 5, title: 'الألعاب المائية', desc: 'مغامرات ومرح للجميع', img: 'https://picsum.photos/seed/pharma-water/800/500' },
  { id: 6, title: 'الحدائق', desc: 'طبيعة خلابة واسترخاء', img: 'https://picsum.photos/seed/pharma-garden/800/500' },
]

function openLightbox(item) {
  lightboxItem.value = item
}
</script>

<style scoped>
/* ═══════════════════════════════════
   HERO — DARK MODE LUXURY (ANIMATED)
   ═══════════════════════════════════ */
.hero {
  position: relative;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e1a;
}

/* ---- Background ---- */
.hero-bg {
  position: absolute;
  inset: 0;
}

.hero-bg > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  animation: kb 35s ease-in-out infinite alternate, img-reveal 2.5s ease-out 0.3s forwards;
}

@keyframes kb {
  0% { transform: scale(1); }
  100% { transform: scale(1.06) translate(-0.5%, -0.3%); }
}

@keyframes img-reveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(ellipse at center, rgba(10, 14, 26, 0.3) 0%, rgba(10, 14, 26, 0.65) 100%),
    linear-gradient(180deg, rgba(10, 14, 26, 0.5) 0%, rgba(10, 14, 26, 0.2) 40%, rgba(10, 14, 26, 0.2) 60%, rgba(10, 14, 26, 0.6) 100%);
}

/* ---- Mouse spotlight ---- */
.hero-spotlight {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  transition: background 0.3s ease;
}

/* ---- Light sweep ---- */
.hero-sweep {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.hero-sweep::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 35%;
  height: 100%;
  background: linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 65%);
  transform: skewX(-15deg);
  animation: sweep 8s ease-in-out 3s infinite;
}

@keyframes sweep {
  0%, 100% { left: -60%; opacity: 0; }
  10% { opacity: 1; }
  50% { left: 130%; opacity: 1; }
  60% { opacity: 0; }
}

/* ---- Glow halo behind title ---- */
.hero-halo {
  position: absolute;
  z-index: 3;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 250px;
  border-radius: 50%;
  background: radial-gradient(ellipse, rgba(249,115,22,0.06) 0%, transparent 70%);
  pointer-events: none;
  opacity: 0;
  animation: halo-in 1.5s ease 2.5s forwards, halo-pulse 5s ease-in-out 4s infinite;
}

@keyframes halo-in {
  to { opacity: 1; }
}

@keyframes halo-pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
  50% { transform: translate(-50%, -50%) scale(1.12); opacity: 1; }
}

/* ---- Floating particles ---- */
.hero-particles {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  bottom: -10px;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  animation: rise linear infinite;
}

@keyframes rise {
  0% {
    bottom: -10px;
    opacity: 0;
  }
  10% {
    opacity: 0.6;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    bottom: 105%;
    opacity: 0;
  }
}

/* ---- Corner frames ---- */
.corner {
  position: absolute;
  z-index: 5;
  width: 80px;
  height: 80px;
  pointer-events: none;
  opacity: 0;
  animation: corner-in 1s ease 2.5s forwards;
}

.corner--tr {
  top: 2.5rem;
  right: 2.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}

.corner--bl {
  bottom: 2.5rem;
  left: 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
}

@keyframes corner-in {
  from { opacity: 0; transform: scale(0.6); }
  to { opacity: 1; transform: scale(1); }
}

/* ---- Centered content ---- */
.hero-center {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.75rem;
}

/* ---- Line decorations ---- */
.hero-line-deco {
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: line-expand 1.2s ease 1.8s forwards, line-breathe 4s ease-in-out 3.5s infinite;
}

@keyframes line-expand {
  from { width: 0; }
  to { width: 80px; }
}

@keyframes line-breathe {
  0%, 100% { width: 80px; opacity: 0.3; }
  50% { width: 120px; opacity: 0.55; }
}

/* ---- Title ---- */
.hero-name {
  line-height: 1;
  margin: 0.75rem 0;
  direction: ltr;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2.5rem;
}

/* Both words — neon outlined stroke with depth */
.hero-word {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 9rem;
  font-weight: 900;
  color: rgba(249, 115, 22, 0.06);
  -webkit-text-stroke: 3px #fbbf24;
  letter-spacing: 8px;
  display: inline-block;
  position: relative;
  opacity: 0;
  animation: word-in 1s cubic-bezier(0.22, 1, 0.36, 1) 1s forwards, neon-glow 5s ease-in-out 3s infinite;
  text-shadow:
    0 0 8px rgba(249, 115, 22, 0.08),
    0 0 20px rgba(249, 115, 22, 0.05);
}

/* White outline behind (depth layer) */
.hero-word::before {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  -webkit-text-stroke: 5px rgba(255, 255, 255, 0.08);
  z-index: -1;
  pointer-events: none;
}

/* "Beach" — filled primary with outlined gold stroke on top */
.hero-word--accent {
  letter-spacing: 10px;
  color: rgba(249, 115, 22, 0.55);
  -webkit-text-stroke: 1.5px #fbbf24;
  text-shadow:
    0 0 12px rgba(249, 115, 22, 0.2),
    0 4px 30px rgba(0, 0, 0, 0.3);
  animation:
    word-in 1s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards,
    beach-glow 5s ease-in-out 3.5s infinite;
}

.hero-word--accent::before {
  -webkit-text-stroke: 4px rgba(249, 115, 22, 0.12);
  color: transparent;
  filter: blur(3px);
}

@keyframes beach-glow {
  0%, 100% {
    text-shadow:
      0 0 12px rgba(249, 115, 22, 0.2),
      0 4px 30px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow:
      0 0 20px rgba(249, 115, 22, 0.3),
      0 0 40px rgba(249, 115, 22, 0.1),
      0 4px 30px rgba(0, 0, 0, 0.3);
  }
}

/* Entrance */
@keyframes word-in {
  0% { opacity: 0; transform: translateY(20px); filter: blur(6px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* Continuous: subtle glow breathe */
@keyframes neon-glow {
  0%, 100% {
    filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.08));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.15));
  }
}

/* ---- Per-letter wave animation ---- */
.hl {
  display: inline-block;
  animation: letter-wave 4s ease-in-out infinite;
  animation-delay: calc(0.2s * var(--i));
}

@keyframes letter-wave {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

/* ---- Arabic tagline ---- */
.hero-arabic {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 600;
  margin-top: 0.5rem;
  max-width: 500px;
  line-height: 1.7;
  opacity: 0;
  animation: text-rise 0.8s ease 2.2s forwards;
}

@keyframes text-rise {
  from { opacity: 0; transform: translateY(12px); filter: blur(3px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* ---- Meta: location, rating, weather ---- */
.hero-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
  opacity: 0;
  animation: text-rise 0.8s ease 2.6s forwards;
}

.meta-card {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 1.1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.35s ease;
}

.meta-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.meta-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.meta-card:hover .meta-card-icon {
  transform: scale(1.1);
}

.meta-card-icon i {
  font-size: 0.85rem;
  color: #f97316;
}

.meta-card-icon--gold {
  background: rgba(251, 191, 36, 0.12);
}
.meta-card-icon--gold i { color: #fbbf24; }

.meta-card-icon--blue {
  background: rgba(56, 189, 248, 0.12);
}
.meta-card-icon--blue i { color: #38bdf8; }

.meta-card-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.meta-card-text strong {
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.35);
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.meta-card-text span {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 700;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---- CTA ---- */
.hero-cta {
  display: inline-block;
  margin-top: 1.75rem;
  padding: 0.9rem 3.5rem;
  border: 1.5px solid rgba(249, 115, 22, 0.5);
  color: #fff;
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: text-rise 0.8s ease 2.8s forwards;
  transition: all 0.4s ease;
  background: transparent;
}

.hero-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(249, 115, 22, 0.05));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.hero-cta:hover {
  border-color: rgba(249, 115, 22, 0.8);
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.15);
}

.hero-cta:hover::before {
  opacity: 1;
}

/* ---- Side vertical text ---- */
.hero-side {
  position: absolute;
  z-index: 5;
  font-size: 0.55rem;
  letter-spacing: 4px;
  color: rgba(255, 255, 255, 0.08);
  font-weight: 600;
  text-transform: uppercase;
  writing-mode: vertical-lr;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  animation: fade-in 1s ease 3s forwards;
}

.hero-side--r {
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.hero-side--l {
  left: 2.5rem;
  top: 50%;
  transform: translateY(-50%) rotate(180deg);
}

/* ---- Scroll indicator ---- */
.hero-scroll-link {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  opacity: 0;
  animation: fade-in 1s ease 3.5s forwards;
}

.hero-scroll-link span {
  font-size: 0.6rem;
  letter-spacing: 3px;
  color: rgba(255, 255, 255, 0.3);
  text-transform: uppercase;
  font-weight: 500;
}

.scroll-bar {
  width: 1px;
  height: 50px;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.scroll-bar::after {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  animation: scroll-drop 2s ease-in-out infinite;
}

@keyframes scroll-drop {
  0% { top: -100%; }
  50% { top: 100%; }
  100% { top: 100%; }
}

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .hero-word { font-size: 6rem; }
  .corner { width: 60px; height: 60px; top: 2rem; right: 2rem; }
  .corner--bl { bottom: 2rem; left: 2rem; }
}

@media (max-width: 768px) {
  .hero-word { font-size: 3.2rem; letter-spacing: 4px; }
  .hero-word--accent { letter-spacing: 4px; }
  .hero-arabic { font-size: 0.95rem; }
  .hero-cta { padding: 0.75rem 2.5rem; font-size: 0.78rem; letter-spacing: 2px; }
  .scroll-bar { height: 35px; }
  .corner { display: none; }
  .hero-side { display: none; }
  .hero-particles { display: none; }
  .hero-spotlight { display: none; }
  .hero-sweep { display: none; }
  .hero-halo { width: 250px; height: 150px; }
  .hero-meta { gap: 0.4rem; flex-wrap: wrap; justify-content: center; }
  .meta-card { padding: 0.5rem 0.85rem; border-radius: 12px; }
  .meta-card-icon { width: 30px; height: 30px; border-radius: 8px; }
  .meta-card-icon i { font-size: 0.72rem; }
  .meta-card-text strong { font-size: 0.55rem; }
  .meta-card-text span { font-size: 0.72rem; }
}

@media (max-width: 480px) {
  .hero-word { font-size: 2.2rem; letter-spacing: 3px; }
  .hero-word--accent { letter-spacing: 3px; }
}

/* ========================================
   DISCOVER SECTION
   ======================================== */
.discover {
  padding: 6rem 0 5rem;
  background: #fff;
  overflow: hidden;
  position: relative;
}

/* ---- Animated background shapes ---- */
.discover-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.dshape { position: absolute; }

/* 1. Large gradient blob — top-right */
.dshape--blob-1 {
  width: 500px;
  height: 500px;
  top: -10%;
  right: -8%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    rgba(249, 115, 22, 0.08),
    rgba(14, 165, 233, 0.05),
    rgba(249, 115, 22, 0.08)
  );
  filter: blur(40px);
  animation: blob-morph 18s ease-in-out infinite;
}

@keyframes blob-morph {
  0%, 100% {
    border-radius: 50%;
    transform: scale(1) rotate(0deg);
  }
  25% {
    border-radius: 40% 60% 55% 45%;
    transform: scale(1.05) rotate(30deg);
  }
  50% {
    border-radius: 55% 45% 40% 60%;
    transform: scale(0.95) rotate(60deg);
  }
  75% {
    border-radius: 45% 55% 60% 40%;
    transform: scale(1.03) rotate(90deg);
  }
}

/* 2. Double ring — bottom-left */
.dshape--ring {
  width: 200px;
  height: 200px;
  bottom: 5%;
  left: 3%;
  border-radius: 50%;
  border: 2px solid rgba(249, 115, 22, 0.15);
  animation: ring-spin 25s linear infinite;
}

.dshape--ring::after {
  content: '';
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  border: 2px dashed rgba(249, 115, 22, 0.1);
  animation: ring-spin 15s linear infinite reverse;
}

@keyframes ring-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 3. Oval outline — mid-right, orbiting */
.dshape--oval {
  width: 350px;
  height: 140px;
  top: 35%;
  right: -3%;
  border-radius: 50%;
  border: 2px solid rgba(14, 165, 233, 0.1);
  animation: oval-orbit 20s ease-in-out infinite;
}

@keyframes oval-orbit {
  0%, 100% { transform: translate(0, 0) rotate(-10deg); }
  33% { transform: translate(20px, -25px) rotate(5deg); }
  66% { transform: translate(-10px, 15px) rotate(-20deg); }
}

/* 4. Dot grid — top-left */
.dshape--dots {
  width: 120px;
  height: 150px;
  top: 6%;
  left: 4%;
  background-image: radial-gradient(circle, rgba(249, 115, 22, 0.18) 2px, transparent 2px);
  background-size: 18px 18px;
  animation: dots-breathe 5s ease-in-out infinite;
}

@keyframes dots-breathe {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
}

/* 5. Accent small filled circle — floating */
.dshape--accent {
  width: 80px;
  height: 80px;
  bottom: 25%;
  right: 12%;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.02));
  border: 1.5px solid rgba(249, 115, 22, 0.12);
  animation: accent-float 8s ease-in-out infinite;
}

@keyframes accent-float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}

/* Ensure content sits above shapes */
.discover-header,
.discover-filters,
.discover-masonry {
  position: relative;
  z-index: 1;
}

/* ---- Header ---- */
.discover-header {
  text-align: center;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.discover-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 1rem;
}

.tag-line {
  display: block;
  width: 30px;
  height: 1px;
  background: var(--primary, #f97316);
  opacity: 0.4;
}

.discover-title {
  font-size: 2.8rem;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.3;
}

.discover-title span {
  color: var(--primary, #f97316);
}

.discover-sub {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* ---- Filter chips ---- */
.discover-filters {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 2.5rem;
  padding: 0 2rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  color: #475569;
  font-weight: 600;
  font-size: 0.88rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip i {
  font-size: 0.9rem;
}

.chip-count {
  font-size: 0.68rem;
  background: #f1f5f9;
  color: #64748b;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  border-color: var(--primary, #f97316);
  color: var(--primary, #f97316);
}

.filter-chip.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.filter-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
}

/* ---- Masonry Grid ---- */
.discover-masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 220px;
  gap: 1rem;
  max-width: 1280px;
  margin: 2.5rem auto 0;
  padding: 0 2rem;
}

.mcard {
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  animation: card-enter 0.5s ease var(--delay, 0s) both;
}

.mcard--large {
  grid-column: span 2;
  grid-row: span 2;
}

@keyframes card-enter {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.mcard > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.mcard:hover > img {
  transform: scale(1.08);
}

/* Overlay on hover */
.mcard-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.7) 100%);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.mcard:hover .mcard-overlay {
  opacity: 1;
}

.mcard-zoom {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.7);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.mcard:hover .mcard-zoom {
  transform: translate(-50%, -50%) scale(1);
}

.mcard-zoom i {
  font-size: 1.1rem;
  color: #fff;
}

.mcard-info h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: #fff;
}

.mcard-info p {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.15rem;
}

/* ---- Video cards ---- */
.mcard-video {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1e293b, #0f172a);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.88rem;
  font-weight: 600;
}

.video-play {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.15);
  border: 2px solid rgba(249, 115, 22, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.video-play i {
  font-size: 1.2rem;
  color: var(--primary, #f97316);
  margin-right: -2px;
}

.mcard:hover .video-play {
  background: rgba(249, 115, 22, 0.25);
  border-color: rgba(249, 115, 22, 0.5);
  transform: scale(1.1);
}

/* ---- Lightbox ---- */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.lightbox-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  cursor: default;
}

.lightbox-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s ease;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.25);
}

.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .discover-masonry {
    grid-auto-rows: 180px;
  }
}

@media (max-width: 768px) {
  .discover { padding: 4rem 0 3rem; }
  .discover-title { font-size: 2rem; }

  .discover-masonry {
    grid-template-columns: repeat(2, 1fr);
    grid-auto-rows: 160px;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  .mcard--large {
    grid-column: span 2;
    grid-row: span 1;
  }

  .mcard { border-radius: 14px; }
  .filter-chip { font-size: 0.8rem; padding: 0.5rem 1.1rem; }
  .mcard-info h3 { font-size: 0.88rem; }
}

@media (max-width: 480px) {
  .discover-masonry {
    grid-template-columns: 1fr;
    grid-auto-rows: 200px;
  }

  .mcard--large {
    grid-column: span 1;
  }
}

/* ========================================
   ABOUT SECTION
   ======================================== */
.about {
  padding: 7rem 0 8rem;
  background: #fff;
  position: relative;
  overflow: hidden;
}

/* ---- Background decorative shapes ---- */
.about-bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.about-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 1.5s ease;
}

.about.in-view .about-shape {
  opacity: 1;
}

.about-shape--1 {
  width: 500px;
  height: 500px;
  top: -15%;
  right: -10%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.06) 0%, transparent 70%);
  animation: shape-float 15s ease-in-out infinite alternate;
}

.about-shape--2 {
  width: 400px;
  height: 400px;
  bottom: -10%;
  left: -8%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 70%);
  animation: shape-float 18s ease-in-out 2s infinite alternate-reverse;
}

.about-shape--3 {
  width: 250px;
  height: 250px;
  top: 40%;
  left: 30%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.04) 0%, transparent 70%);
  animation: shape-float 12s ease-in-out 4s infinite alternate;
}

@keyframes shape-float {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, -15px); }
}

/* Dot pattern */
.about-dots {
  position: absolute;
  top: 8%;
  left: 5%;
  width: 120px;
  height: 120px;
  opacity: 0;
  transition: opacity 1.5s ease 0.5s;
  background-image: radial-gradient(circle, rgba(249, 115, 22, 0.12) 1px, transparent 1px);
  background-size: 16px 16px;
}

.about.in-view .about-dots {
  opacity: 1;
}

.about-container {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 5rem;
}

/* ---- Text Side ---- */
.about-text {
  flex: 1;
  min-width: 0;
  opacity: 0;
  transform: translateY(50px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.about.in-view .about-text {
  opacity: 1;
  transform: translateY(0);
}

.about-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  text-transform: uppercase;
  letter-spacing: 3px;
}

.about-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-top: 1rem;
  line-height: 1.3;
}

.about-title span {
  color: var(--primary);
}

.about-desc {
  font-size: 1.05rem;
  line-height: 1.9;
  color: #475569;
  font-weight: 500;
  margin-top: 1.25rem;
}

/* ---- Stats: Glass Cards ---- */
.about-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 2.5rem;
}

.about-stat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.15rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.35s ease;
}

.about-stat:hover {
  background: rgba(var(--primary-rgb), 0.04);
  border-color: rgba(var(--primary-rgb), 0.15);
  transform: translateY(-4px);
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.12), rgba(var(--primary-rgb), 0.04));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 1.05rem;
  flex-shrink: 0;
}

.stat-icon--blue {
  background: linear-gradient(135deg, rgba(var(--secondary-rgb), 0.12), rgba(var(--secondary-rgb), 0.04));
  color: var(--secondary);
}

.stat-icon--green {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04));
  color: #16a34a;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.stat-num {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
}

.stat-label {
  font-size: 0.76rem;
  color: #64748b;
  font-weight: 600;
}

/* Link */
.about-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  color: var(--primary);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  transition: gap 0.3s ease;
}

.about-link:hover {
  gap: 0.85rem;
}

.about-link i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.about-link:hover i {
  transform: translateY(3px);
}

/* ---- Visual Side ---- */
.about-visual {
  flex: 1.15;
  position: relative;
  min-width: 0;
  opacity: 0;
  transform: translateY(50px);
  transition: all 1s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}

.about.in-view .about-visual {
  opacity: 1;
  transform: translateY(0);
}

/* Decorative Gradient Blob */
.about-deco {
  position: absolute;
  width: 115%;
  height: 115%;
  top: -8%;
  right: -12%;
  background: radial-gradient(
    ellipse at 55% 50%,
    rgba(var(--primary-rgb), 0.07) 0%,
    rgba(var(--secondary-rgb), 0.04) 40%,
    transparent 70%
  );
  border-radius: 50%;
  z-index: 0;
  filter: blur(30px);
}

/* Main Image */
.about-img-main {
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.04);
  transform: rotate(1.5deg);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.about-img-main:hover {
  transform: rotate(0deg);
}

.about-img-main > img {
  width: 100%;
  display: block;
  aspect-ratio: 7 / 5;
  object-fit: cover;
  transition: transform 6s ease;
}

.about-img-main:hover > img {
  transform: scale(1.06);
}

/* Play Button — Double Ring Pulse */
.about-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.3rem;
  color: var(--primary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 2;
}

.about-play::before,
.about-play::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  z-index: -1;
}

.about-play::before {
  animation: play-ring 2.5s ease-out infinite;
}

.about-play::after {
  animation: play-ring 2.5s ease-out 0.9s infinite;
}

@keyframes play-ring {
  0% { transform: scale(1); opacity: 0.7; border-width: 2px; }
  100% { transform: scale(2); opacity: 0; border-width: 0.5px; }
}

.about-play:hover {
  background: var(--primary);
  color: #fff;
  transform: translate(-50%, -50%) scale(1.12);
  box-shadow: 0 12px 40px rgba(var(--primary-rgb), 0.4);
}

/* Floating Image — Tilted */
.about-img-float {
  position: absolute;
  bottom: -2.5rem;
  left: -2.5rem;
  width: 42%;
  border-radius: 20px;
  overflow: hidden;
  border: 5px solid #fff;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.14);
  z-index: 3;
  transform: rotate(-3deg);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.about-img-float:hover {
  transform: rotate(0deg) scale(1.04);
}

.about-img-float img {
  width: 100%;
  display: block;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

/* Badge — Tilted Gradient */
.about-badge {
  position: absolute;
  top: -1.5rem;
  right: -1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  padding: 1.1rem 1.6rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(var(--primary-rgb), 0.35);
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  transform: rotate(4deg);
  transition: transform 0.35s ease;
}

.about-badge:hover {
  transform: rotate(0deg) scale(1.06);
}

.badge-num {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}

.badge-txt {
  font-size: 0.78rem;
  font-weight: 600;
  opacity: 0.9;
}

/* ---- About Responsive ---- */
@media (max-width: 1024px) {
  .about-container {
    gap: 3rem;
  }

  .about-title {
    font-size: 2.1rem;
  }

  .about-stats {
    flex-wrap: wrap;
  }

  .about-img-float {
    left: -1rem;
    width: 38%;
  }

  .about-badge {
    right: -0.5rem;
    top: -1rem;
  }
}

@media (max-width: 768px) {
  .about {
    padding: 4rem 0 5rem;
  }

  .about-container {
    flex-direction: column;
    gap: 3rem;
  }

  .about-text {
    text-align: center;
  }

  .about-title {
    font-size: 2rem;
  }

  .about-stats {
    justify-content: center;
  }

  .about-link {
    justify-content: center;
  }

  .about-visual {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .about-img-main {
    transform: rotate(0deg);
  }

  .about-img-float {
    bottom: -1.5rem;
    left: -0.5rem;
    width: 38%;
    border-width: 4px;
    transform: rotate(-2deg);
  }

  .about-badge {
    right: -0.5rem;
    top: -0.75rem;
    padding: 0.8rem 1.2rem;
    transform: rotate(3deg);
  }

  .badge-num {
    font-size: 1.4rem;
  }

  .about-play {
    width: 56px;
    height: 56px;
    font-size: 1rem;
  }

  .about-stat {
    padding: 0.7rem 0.9rem;
  }

  .stat-icon {
    width: 38px;
    height: 38px;
    font-size: 0.9rem;
  }

  .stat-num {
    font-size: 1.15rem;
  }
}

/* ========================================
   FEATURES SECTION (Sticky Scroll)
   ======================================== */
.features {
  position: relative;
}

.features-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* ---- Full-Width Background Image ---- */
.features-bg {
  position: absolute;
  inset: 0;
}

.features-bg .feat-slide {
  position: absolute;
  inset: 0;
  will-change: opacity, transform;
}

.features-bg .feat-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.features-bg-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.55) 0%,
    rgba(0, 0, 0, 0.3) 35%,
    rgba(0, 0, 0, 0.12) 100%
  );
  z-index: 1;
}

/* ---- Active Feature Display: centered on image ---- */
.feat-active-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  text-align: center;
  pointer-events: none;
}

.feat-active-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.feat-active-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.feat-active-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
}

.feat-active-desc {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  line-height: 1.7;
  margin: 0;
  max-width: 420px;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.25);
}

/* Active feature transition */
.feat-info-enter-active {
  transition: all 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

.feat-info-leave-active {
  transition: all 0.3s ease;
}

.feat-info-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.feat-info-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ---- Steps Card: glass, on the right ---- */
.features-card {
  position: absolute;
  top: 50%;
  right: max(2rem, calc((100vw - 1280px) / 2 + 2rem));
  transform: translateY(-50%);
  z-index: 10;
  width: 320px;
  max-width: calc(100% - 4rem);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  padding: 1.5rem 1.5rem 1.75rem;
}

.features-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  text-transform: uppercase;
  letter-spacing: 3px;
  width: fit-content;
}

.features-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-top: 0.65rem;
  line-height: 1.35;
}

.features-title span {
  color: var(--primary);
}

.features-desc {
  font-size: 0.82rem;
  line-height: 1.65;
  color: #64748b;
  font-weight: 500;
  margin-top: 0.3rem;
}

/* ---- Feature Steps ---- */
.features-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin-top: 1rem;
}

.feat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0;
  border: none;
  background: none;
  font-family: inherit;
  font-size: 0.9rem;
  color: #b0b8c4;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s ease;
  text-align: right;
}

.feat-item:hover {
  color: #64748b;
}

.feat-item.passed {
  color: #475569;
}

.feat-item.current {
  color: #0f172a;
}

.feat-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #e2e8f0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-size: 0.55rem;
  color: transparent;
}

.feat-item.passed .feat-indicator {
  background: var(--secondary);
  border-color: var(--secondary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(var(--secondary-rgb), 0.3);
}

.feat-item.current .feat-indicator {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-color: var(--primary);
  color: #fff;
  box-shadow:
    0 0 0 3px rgba(var(--primary-rgb), 0.12),
    0 3px 12px rgba(var(--primary-rgb), 0.3);
  transform: scale(1.1);
}

.feat-item-title {
  font-weight: inherit;
  transition: all 0.3s ease;
}

.feat-item.current .feat-item-title {
  font-weight: 700;
}

/* ---- Image Crossfade Transition ---- */
.feat-fade-enter-active {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.feat-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.feat-fade-enter-from {
  opacity: 0;
  transform: scale(1.08);
}

.feat-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

/* ---- Features Responsive ---- */
@media (max-width: 1024px) {
  .features-card {
    width: 290px;
    padding: 1.25rem;
  }

  .feat-active-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .features-sticky {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .features-bg-overlay {
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(0, 0, 0, 0.25) 50%,
      rgba(0, 0, 0, 0.1) 100%
    );
  }

  .feat-active-display {
    top: 30%;
  }

  .feat-active-title {
    font-size: 1.3rem;
  }

  .feat-active-desc {
    font-size: 0.85rem;
    max-width: 300px;
  }

  .features-card {
    position: relative;
    top: auto;
    right: auto;
    transform: none;
    width: calc(100% - 2rem);
    max-width: none;
    margin: auto 1rem 1.5rem;
    align-self: flex-end;
    padding: 1.25rem;
    border-radius: 18px;
  }

  .feat-item {
    font-size: 0.85rem;
  }
}

/* ========================================
   LOCATION SECTION
   ======================================== */
.location {
  position: relative;
  padding: 6rem 0;
  overflow: hidden;
}

/* ---- Background map ---- */
.loc-bg-map {
  position: absolute;
  inset: 0;
}

.loc-bg-map iframe {
  width: 100%;
  height: 100%;
  display: block;
  filter: grayscale(1) brightness(0.35);
}

.loc-bg-tint {
  position: absolute;
  inset: 0;
  background: rgba(10, 14, 26, 0.5);
  pointer-events: none;
}

.loc-wrapper {
  position: relative;
  z-index: 2;
  max-width: max-content;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ---- Dark card ---- */
.loc-card {
  background: #0f172a;
  border-radius: 24px;
  overflow: hidden;
}

.loc-card-inner {
  display: flex;
  direction: rtl;
  min-height: 380px;
}

/* ---- Info side ---- */
.loc-info {
  flex: 1;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1rem;
}

.loc-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  text-transform: uppercase;
  letter-spacing: 3px;
  width: fit-content;
}

.loc-tag .tag-line {
  display: block;
  width: 20px;
  height: 1px;
  background: var(--primary, #f97316);
  opacity: 0.4;
}

.loc-title {
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
}

.loc-detail {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
}

.loc-detail i {
  font-size: 0.8rem;
  color: var(--primary, #f97316);
  opacity: 0.7;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* ---- Action buttons ---- */
.loc-detail { justify-content: center; }

.loc-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

.loc-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.75rem;
  border-radius: 10px;
  background: var(--primary, #f97316);
  color: #fff;
  font-weight: 700;
  font-size: 0.82rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.loc-btn-primary i { font-size: 0.8rem; }

.loc-btn-primary:hover {
  background: var(--primary-dark, #ea580c);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);
}

.loc-btn-map {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 600;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.loc-btn-map i { font-size: 0.8rem; }

.loc-btn-map:hover {
  border-color: rgba(255, 255, 255, 0.35);
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

/* ---- Map panel (reveals on click) ---- */
.loc-map-panel {
  width: 50%;
  min-height: 100%;
  flex-shrink: 0;
}

.loc-map-panel iframe {
  width: 100%;
  height: 100%;
  display: block;
  min-height: 380px;
}

/* Map reveal transition */
.map-reveal-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.map-reveal-leave-active {
  transition: all 0.3s ease;
}

.map-reveal-enter-from {
  width: 0;
  opacity: 0;
}

.map-reveal-leave-to {
  width: 0;
  opacity: 0;
}

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .loc-info { padding: 2.5rem 2rem; }
  .loc-title { font-size: 1.7rem; }
  .loc-map-panel { width: 45%; }
}

@media (max-width: 768px) {
  .location { padding: 4rem 0; }
  .loc-wrapper { padding: 0 1rem; }

  .loc-card-inner {
    flex-direction: column;
  }

  .loc-info {
    padding: 2rem 1.5rem;
    align-items: center;
    text-align: center;
  }

  .loc-title { font-size: 1.5rem; }
  .loc-detail { justify-content: center; }

  .loc-actions {
    flex-direction: column;
    width: 100%;
  }

  .loc-btn-primary, .loc-btn-map {
    width: 100%;
    justify-content: center;
  }

  .loc-map-panel {
    width: 100%;
    min-height: 280px;
  }

  .loc-map-panel iframe {
    min-height: 280px;
  }
}

/* ========================================
   CTA SECTION
   ======================================== */
.cta {
  padding: 6rem 0;
  background: #fff;
}

.cta-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
}

/* Pulsing glow ring behind the card */
.cta-glow-wrap {
  position: absolute;
  inset: -20px;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease 0.3s;
}

.cta.in-view .cta-glow-wrap {
  opacity: 1;
}

.cta-glow-ring {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 40px;
  background: linear-gradient(135deg, rgba(var(--secondary-rgb), 0.2), rgba(var(--primary-rgb), 0.15), rgba(var(--secondary-rgb), 0.2));
  filter: blur(30px);
  animation: cta-glow-pulse 4s ease-in-out infinite;
}

@keyframes cta-glow-pulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.02); }
}

/* Card — entrance animation */
.cta-card {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--secondary) 0%, #0077b6 50%, #023e8a 100%);
  border-radius: 32px;
  padding: 5rem 3rem;
  overflow: hidden;
  opacity: 0;
  transform: translateY(50px) scale(0.97);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta.in-view .cta-card {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Animated gradient overlay that shifts */
.cta-gradient-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(var(--primary-rgb), 0.08) 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.05) 60%,
    rgba(var(--primary-rgb), 0.06) 100%
  );
  background-size: 200% 200%;
  animation: cta-gradient-shift 6s ease-in-out infinite;
  pointer-events: none;
  border-radius: 32px;
}

@keyframes cta-gradient-shift {
  0%, 100% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
}

/* Animated border glow */
.cta-border-glow {
  position: absolute;
  inset: 0;
  border-radius: 32px;
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 1s ease 0.5s;
}

.cta.in-view .cta-border-glow {
  opacity: 1;
}

.cta-border-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 32px;
  padding: 1.5px;
  background: linear-gradient(
    var(--cta-border-angle, 0deg),
    rgba(255, 255, 255, 0.3),
    transparent 40%,
    transparent 60%,
    rgba(var(--primary-rgb), 0.4)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: cta-border-rotate 5s linear infinite;
}

@keyframes cta-border-rotate {
  to { --cta-border-angle: 360deg; }
}

@property --cta-border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* Animated floating shapes */
.cta-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 32px;
}

.cta-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 1s ease;
}

.cta.in-view .cta-shape {
  opacity: 1;
}

.cta-shape--1 {
  width: 300px;
  height: 300px;
  top: -80px;
  right: -60px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%);
  animation: cta-float-1 8s ease-in-out infinite;
}

.cta-shape--2 {
  width: 200px;
  height: 200px;
  bottom: -40px;
  left: 5%;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.18) 0%, transparent 70%);
  animation: cta-float-2 10s ease-in-out infinite;
}

.cta-shape--3 {
  width: 120px;
  height: 120px;
  top: 20%;
  left: 15%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: cta-float-3 7s ease-in-out infinite;
}

.cta-shape--4 {
  width: 80px;
  height: 80px;
  top: 60%;
  right: 20%;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.14) 0%, transparent 70%);
  animation: cta-float-4 9s ease-in-out infinite;
}

.cta-shape--5 {
  width: 160px;
  height: 160px;
  top: 10%;
  left: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.07) 0%, transparent 70%);
  animation: cta-float-5 12s ease-in-out infinite;
}

@keyframes cta-float-1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-30px, 20px) scale(1.1); }
  66% { transform: translate(15px, -10px) scale(1.05); }
}

@keyframes cta-float-2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(25px, -30px) scale(1.15); }
  66% { transform: translate(-10px, 15px) scale(0.95); }
}

@keyframes cta-float-3 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(15px, 15px) rotate(45deg); }
}

@keyframes cta-float-4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, -15px) scale(1.3); }
}

@keyframes cta-float-5 {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-20px, 25px) rotate(60deg); }
}

/* Floating particles */
.cta-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: 32px;
}

.cta-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
}

.cta.in-view .cta-particle {
  animation: cta-particle-rise linear infinite;
}

.cta-particle--1  { left: 8%;  bottom: -5%; animation-duration: 6s;  animation-delay: 0s;   }
.cta-particle--2  { left: 15%; bottom: -5%; animation-duration: 8s;  animation-delay: 1s;   width: 2px; height: 2px; }
.cta-particle--3  { left: 25%; bottom: -5%; animation-duration: 7s;  animation-delay: 0.5s; }
.cta-particle--4  { left: 35%; bottom: -5%; animation-duration: 9s;  animation-delay: 2s;   width: 4px; height: 4px; background: rgba(var(--primary-rgb), 0.4); }
.cta-particle--5  { left: 45%; bottom: -5%; animation-duration: 6.5s; animation-delay: 0.8s; }
.cta-particle--6  { left: 55%; bottom: -5%; animation-duration: 8.5s; animation-delay: 1.5s; width: 2px; height: 2px; }
.cta-particle--7  { left: 65%; bottom: -5%; animation-duration: 7.5s; animation-delay: 0.3s; }
.cta-particle--8  { left: 72%; bottom: -5%; animation-duration: 10s; animation-delay: 2.5s; width: 4px; height: 4px; background: rgba(var(--primary-rgb), 0.35); }
.cta-particle--9  { left: 80%; bottom: -5%; animation-duration: 6.8s; animation-delay: 1.2s; }
.cta-particle--10 { left: 88%; bottom: -5%; animation-duration: 9.5s; animation-delay: 0.7s; width: 2px; height: 2px; }
.cta-particle--11 { left: 20%; bottom: -5%; animation-duration: 11s; animation-delay: 3s;   width: 2px; height: 2px; background: rgba(var(--primary-rgb), 0.3); }
.cta-particle--12 { left: 50%; bottom: -5%; animation-duration: 7.2s; animation-delay: 1.8s; }

@keyframes cta-particle-rise {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.6; }
  50% { opacity: 0.4; }
  90% { opacity: 0; }
  100% { transform: translateY(-500px) translateX(20px); opacity: 0; }
}

/* Inner content */
.cta-inner {
  position: relative;
  z-index: 3;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

/* Scroll entrance — staggered slide-up */
.cta-badge,
.cta-title,
.cta-desc,
.cta-actions {
  opacity: 0;
  transform: translateY(35px);
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.cta.in-view .cta-badge {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.3s;
}

.cta.in-view .cta-title {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.5s;
}

.cta.in-view .cta-desc {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.7s;
}

.cta.in-view .cta-actions {
  opacity: 1;
  transform: translateY(0);
  transition-delay: 0.9s;
}

/* Badge */
.cta-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary, #f97316);
  text-transform: uppercase;
  letter-spacing: 3px;
}


/* Title */
.cta-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.35;
}

.cta-title span {
  background: linear-gradient(135deg, var(--primary), #fbbf24, var(--primary));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: cta-text-shimmer 4s ease-in-out infinite;
}

@keyframes cta-text-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Description */
.cta-desc {
  font-size: 1.08rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  line-height: 1.8;
  max-width: 520px;
}

/* Actions */
.cta-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* CTA Button — with shine, glow pulse, and arrow bounce */
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 1rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  box-shadow: 0 6px 28px rgba(var(--primary-rgb), 0.45);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  animation: cta-btn-glow 3s ease-in-out infinite;
}

@keyframes cta-btn-glow {
  0%, 100% { box-shadow: 0 6px 28px rgba(var(--primary-rgb), 0.45); }
  50% { box-shadow: 0 6px 40px rgba(var(--primary-rgb), 0.65), 0 0 60px rgba(var(--primary-rgb), 0.15); }
}

.cta-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-btn:hover::before {
  opacity: 1;
}

.cta-btn::after {
  content: '';
  position: absolute;
  top: 0;
  right: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: cta-shine 3s ease-in-out infinite;
}

@keyframes cta-shine {
  0%, 60%, 100% { right: -100%; }
  30% { right: 120%; }
}

.cta-btn:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-darker));
  box-shadow: 0 8px 40px rgba(var(--primary-rgb), 0.6);
  transform: translateY(-3px) scale(1.03);
  animation: none;
}

.cta-btn:hover::after {
  animation: none;
  opacity: 0;
}

.cta-btn-text {
  position: relative;
  z-index: 1;
}

.cta-btn i {
  font-size: 0.85rem;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
  animation: cta-arrow-nudge 2s ease-in-out infinite;
}

@keyframes cta-arrow-nudge {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-4px); }
}

.cta-btn:hover i {
  animation: none;
  transform: translateX(-6px);
}

/* Phone link — with ring animation */
.cta-phone {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.cta-phone::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cta-phone:hover::after {
  opacity: 1;
}

.cta-phone:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.cta-phone i {
  font-size: 0.9rem;
  animation: cta-phone-ring 3s ease-in-out infinite;
}

@keyframes cta-phone-ring {
  0%, 100% { transform: rotate(0deg); }
  5% { transform: rotate(15deg); }
  10% { transform: rotate(-15deg); }
  15% { transform: rotate(12deg); }
  20% { transform: rotate(-8deg); }
  25% { transform: rotate(0deg); }
}

@media (max-width: 768px) {
  .cta {
    padding: 4rem 0;
  }

  .cta-card {
    padding: 3.5rem 1.5rem;
    border-radius: 24px;
  }

  .cta-gradient-bg,
  .cta-shapes,
  .cta-particles,
  .cta-border-glow {
    border-radius: 24px;
  }

  .cta-glow-ring {
    border-radius: 32px;
  }

  .cta-title {
    font-size: 1.9rem;
  }

  .cta-desc {
    font-size: 0.95rem;
  }

  .cta-btn {
    padding: 0.85rem 2rem;
    font-size: 0.92rem;
  }

  .cta-phone {
    padding: 0.85rem 1.5rem;
    font-size: 0.88rem;
  }

  .cta-actions {
    flex-direction: column;
    width: 100%;
  }

  .cta-btn,
  .cta-phone {
    width: 100%;
    justify-content: center;
  }

  .cta-particle {
    display: none;
  }
}
</style>
