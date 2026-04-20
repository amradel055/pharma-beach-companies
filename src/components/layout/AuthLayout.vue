<template>
    <div class="lp">
        <!-- RIGHT (in RTL) — Form panel. DOM first => first grid track => right side in RTL. -->
        <div class="lp-form-side">
            <div class="lp-form-wrap">
                <!-- Child auth views render here. The left visual panel (below) lives outside
                     the router-view, so it persists across /login → /register → /forgot etc. —
                     only the form swaps (with a fade). -->
                <RouterView v-slot="{ Component }">
                    <Transition name="lp-form-swap" mode="out-in">
                        <component :is="Component" />
                    </Transition>
                </RouterView>
            </div>
        </div>

        <!-- LEFT (in RTL) — Visual panel. DOM second => second grid track => left side in RTL. -->
        <div class="lp-visual">
            <!-- Background photo for the whole visual section (sits beneath the mesh blobs) -->
            <img src="https://picsum.photos/seed/pharma-resort-view/1400/1600" alt="" class="lp-visual__bg" aria-hidden="true" />

            <div class="lp-mesh">
                <div class="lp-mesh__blob lp-mesh__blob--a"></div>
                <div class="lp-mesh__blob lp-mesh__blob--b"></div>
                <div class="lp-mesh__blob lp-mesh__blob--c"></div>
                <div class="lp-mesh__blob lp-mesh__blob--d"></div>
                <div class="lp-mesh__noise"></div>
            </div>

            <div class="lp-particles">
                <span v-for="n in 12" :key="n" class="lp-particle" :style="particleStyle(n)"></span>
            </div>

            <div class="lp-visual__content">
                <div class="lp-visual__brand lp-anim" style="--d:0s">
                    <img :src="logoUrl" alt="فارما بيتش" class="lp-visual__logo" />
                </div>

                <div class="lp-carousel lp-anim" style="--d:0.2s">
                    <TransitionGroup :name="slideDirection" tag="div" class="lp-carousel__track">
                        <div class="lp-slide" :key="activeSlide">
                            <div class="lp-slide__icon" :style="{ background: slides[activeSlide].iconBg }">
                                <component :is="slides[activeSlide].icon" />
                            </div>
                            <span class="lp-slide__tag">{{ slides[activeSlide].tag }}</span>
                            <h2 class="lp-slide__title">{{ slides[activeSlide].title }}</h2>
                            <p class="lp-slide__desc">{{ slides[activeSlide].desc }}</p>

                            <!-- Visual per slide type -->
                            <div class="lp-visual-card">
                                <!-- Slide 0: Featured chalet card (Discover inspiration) -->
                                <div v-if="activeSlide === 0" class="lp-chalet">
                                    <div class="lp-chalet__img">
                                        <div class="lp-chalet__img-grid"><span v-for="n in 9" :key="n" /></div>
                                        <span class="lp-chalet__tag">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                            مميز
                                        </span>
                                        <span class="lp-chalet__price">
                                            <strong>2,400</strong>
                                            <em>ج.م / ليلة</em>
                                        </span>
                                    </div>
                                    <div class="lp-chalet__body">
                                        <div class="lp-chalet__row">
                                            <h3 class="lp-chalet__name">شاليه أزور B-14</h3>
                                            <span class="lp-chalet__rate">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                4.9
                                            </span>
                                        </div>
                                        <p class="lp-chalet__loc">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                            قرية فارما بيتش، الساحل الشمالي
                                        </p>
                                        <div class="lp-chalet__amenities">
                                            <span v-for="(a, ai) in chaletAmenities" :key="ai" class="lp-chalet__amenity" :style="{ animationDelay: (0.2 + ai * 0.08) + 's' }">
                                                <component :is="a.icon" />
                                                {{ a.label }}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Slide 1: Guest testimonial (Testimonials inspiration) -->
                                <div v-else-if="activeSlide === 1" class="lp-tm">
                                    <span class="lp-tm__mark">&ldquo;</span>
                                    <p class="lp-tm__text">{{ activeTm.text }}</p>
                                    <div class="lp-tm__footer">
                                        <div class="lp-tm__avatar" :style="{ background: activeTm.avatarBg }">{{ activeTm.initials }}</div>
                                        <div class="lp-tm__info">
                                            <div class="lp-tm__name">{{ activeTm.name }}</div>
                                            <div class="lp-tm__meta">
                                                <span class="lp-tm__stars">
                                                    <svg v-for="n in 5" :key="n" width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                                </span>
                                                <span class="lp-tm__badge">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                                                    {{ activeTm.role }}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Slide 2: Amenities grid (Features inspiration) -->
                                <div v-else-if="activeSlide === 2" class="lp-feats">
                                    <div v-for="(f, fi) in homeFeatures" :key="fi" class="lp-feat" :style="{ animationDelay: (0.15 + fi * 0.08) + 's' }">
                                        <span class="lp-feat__icon" :style="{ background: f.bg, color: f.color }">
                                            <component :is="f.icon" />
                                        </span>
                                        <span class="lp-feat__label">{{ f.label }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TransitionGroup>
                </div>

                <div class="lp-carousel__nav">
                    <button class="lp-carousel__arrow" @click="prevSlide" aria-label="Previous">
                        <!-- RTL: "previous" points to the RIGHT (where we came from) -->
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                    <div class="lp-carousel__dots">
                        <button
                            v-for="(_, i) in slides"
                            :key="i"
                            class="lp-carousel__dot"
                            :class="{ 'lp-carousel__dot--active': i === activeSlide }"
                            @click="goToSlide(i)"
                        >
                            <span class="lp-carousel__dot-fill" :style="i === activeSlide ? { animationDuration: slideDuration + 'ms' } : {}"></span>
                        </button>
                    </div>
                    <button class="lp-carousel__arrow" @click="nextSlide" aria-label="Next">
                        <!-- RTL: "next" points to the LEFT (reading flow direction) -->
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, h, markRaw } from 'vue'
import logoImg from '@/assets/images/logo.png'
import '@/styles/auth-layout.css'

const logoUrl = logoImg

/* ── Slide icons ── */
/* Sun / Key — full control / dashboard */
const IconGrid = markRaw({
    render: () => h(
        'svg',
        { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        [
            h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
            h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
            h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 }),
            h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }),
        ]
    )
})

/* Waves / live bookings */
const IconWaves = markRaw({
    render: () => h(
        'svg',
        { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        [
            h('path', { d: 'M2 6c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2' }),
            h('path', { d: 'M2 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2' }),
            h('path', { d: 'M2 18c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2' }),
        ]
    )
})

/* Sun — facilities / occupancy */
const IconSun = markRaw({
    render: () => h(
        'svg',
        { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        [
            h('circle', { cx: 12, cy: 12, r: 4 }),
            h('path', { d: 'M12 2v2' }),
            h('path', { d: 'M12 20v2' }),
            h('path', { d: 'M4.93 4.93l1.41 1.41' }),
            h('path', { d: 'M17.66 17.66l1.41 1.41' }),
            h('path', { d: 'M2 12h2' }),
            h('path', { d: 'M20 12h2' }),
            h('path', { d: 'M4.93 19.07l1.41-1.41' }),
            h('path', { d: 'M17.66 6.34l1.41-1.41' }),
        ]
    )
})

/* Shield / verified booking */
const IconShield = markRaw({
    render: () => h(
        'svg',
        { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        [
            h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' }),
            h('polyline', { points: '9 12 11 14 15 10' }),
        ]
    )
})

/* Quote — guest testimonial */
const IconQuote = markRaw({
    render: () => h(
        'svg',
        { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        [
            h('path', { d: 'M3 21c3 0 7-1 7-8V5H3v7h4c0 4-1 5-4 5v4zM14 21c3 0 7-1 7-8V5h-7v7h4c0 4-1 5-4 5v4z' }),
        ]
    )
})

/* Sparkle — amenities grid */
const IconSparkle = markRaw({
    render: () => h(
        'svg',
        { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        [
            h('path', { d: 'M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z' }),
            h('path', { d: 'M19 15l0.7 2L22 17.7 20 18.5 19 21 18 18.5 16 17.7 18.3 17z' }),
            h('path', { d: 'M5 4l0.4 1.3L7 5.8l-1.6 0.5L5 8l-0.4-1.7L3 5.8 4.6 5.3z' }),
        ]
    )
})

/* Small icons used inside the chalet amenity pills / feature grid */
const IconUsers = markRaw({ render: () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }), h('circle', { cx: 9, cy: 7, r: 4 }), h('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }), h('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })]) })
const IconWifi = markRaw({ render: () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M5 12.55a11 11 0 0 1 14.08 0' }), h('path', { d: 'M1.42 9a16 16 0 0 1 21.16 0' }), h('path', { d: 'M8.53 16.11a6 6 0 0 1 6.95 0' }), h('line', { x1: 12, y1: 20, x2: 12.01, y2: 20 })]) })
const IconCar = markRaw({ render: () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2' }), h('circle', { cx: 6.5, cy: 16.5, r: 2.5 }), h('circle', { cx: 16.5, cy: 16.5, r: 2.5 })]) })
const IconBeach = markRaw({ render: () => h('svg', { width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('circle', { cx: 8, cy: 8, r: 3 }), h('path', { d: 'M8 11v10' }), h('path', { d: 'M3 21h18' })]) })
const IconPool = markRaw({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M2 20c2 0 2-1.5 4-1.5S8 20 10 20s2-1.5 4-1.5S16 20 18 20s2-1.5 4-1.5' }), h('path', { d: 'M6 15V4a2 2 0 1 1 4 0m4 11V4a2 2 0 1 1 4 0' })]) })
const IconChef = markRaw({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M6 13.5V20a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-6.5' }), h('path', { d: 'M4 9a4 4 0 0 1 4-4 4 4 0 0 1 8 0 4 4 0 0 1 4 4c0 2.5-2 4.5-4 4.5H8c-2 0-4-2-4-4.5z' })]) })
const IconHeart = markRaw({ render: () => h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })]) })

const slides = [
    {
        icon: IconSun,
        iconBg: 'linear-gradient(135deg, rgba(249,115,22,0.22), rgba(251,191,36,0.15))',
        tag: 'اكتشف القرية',
        title: 'شاليهات فاخرة بإطلالة بحرية',
        desc: 'مجموعة مختارة من أرقى الشاليهات على شاطئ الساحل الشمالي، بإطلالات ساحرة وكل ما تحتاجه لإقامة لا تُنسى.',
    },
    {
        icon: IconQuote,
        iconBg: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(249,115,22,0.18))',
        tag: 'تجارب النزلاء',
        title: 'يثق بنا آلاف العائلات',
        desc: 'قرأنا كل تعليق وتقييم لنقدّم لك تجربة إقامة تليق بك، مع خدمة تهتم بأدق التفاصيل.',
    },
    {
        icon: IconSparkle,
        iconBg: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(249,115,22,0.15))',
        tag: 'مميزاتنا',
        title: 'تجربة إقامة متكاملة',
        desc: 'من الشاطئ الخاص إلى الأمن على مدار الساعة — كل التفاصيل التي تجعل إقامتك مثالية في مكان واحد.',
    },
]

/* ── Slide 0: Featured chalet amenity pills ── */
const chaletAmenities = [
    { icon: IconUsers, label: '6 أشخاص' },
    { icon: IconWifi,  label: 'واي فاي' },
    { icon: IconCar,   label: 'موقف' },
    { icon: IconBeach, label: 'شاطئ خاص' },
]

/* ── Slide 1: Rotating guest testimonials (cycles inside the slide while carousel is on slide 1) ── */
const testimonials = [
    {
        text: 'تجربة رائعة من البداية للنهاية. الشاليه نظيف والمنظر خيالي وفريق الاستقبال محترف جداً.',
        name: 'أحمد محمد',
        initials: 'أ م',
        avatarBg: 'linear-gradient(135deg, #f97316, #fbbf24)',
        role: 'نزيل موثّق',
    },
    {
        text: 'أفضل إجازة قضيناها كعائلة. الأطفال أحبّوا المسبح والشاطئ والمطاعم متنوعة وممتازة.',
        name: 'سارة عبدالرحمن',
        initials: 'س ع',
        avatarBg: 'linear-gradient(135deg, #0ea5e9, #14b8a6)',
        role: 'نزيلة موثّقة',
    },
    {
        text: 'الحجز كان سهلاً، والقرية فعلاً بتستاهل، هنرجع تاني بإذن الله.',
        name: 'كريم حسن',
        initials: 'ك ح',
        avatarBg: 'linear-gradient(135deg, #a855f7, #ec4899)',
        role: 'نزيل موثّق',
    },
]
const activeTmIdx = ref(0)
const activeTm = computed(() => testimonials[activeTmIdx.value])
let tmTimer = null

/* ── Slide 2: Amenities grid (mirrors HomeView features) ── */
const homeFeatures = [
    { icon: IconSun,   label: 'شاطئ خاص',      bg: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.12))', color: '#fbbf24' },
    { icon: IconChef,  label: 'مطاعم متنوعة',  bg: 'linear-gradient(135deg, rgba(236,72,153,0.18), rgba(249,115,22,0.12))', color: '#f97316' },
    { icon: IconCar,   label: 'مواقف مجانية',  bg: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(6,182,212,0.12))', color: '#0ea5e9' },
    { icon: IconWifi,  label: 'واي فاي فائق',  bg: 'linear-gradient(135deg, rgba(20,184,166,0.2), rgba(34,211,238,0.12))', color: '#14b8a6' },
    { icon: IconShield,label: 'أمن 24/7',       bg: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.12))', color: '#a855f7' },
    { icon: IconPool,  label: 'مسبح كبير',      bg: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(20,184,166,0.12))', color: '#10b981' },
]

const activeSlide = ref(0)
const slideDirection = ref('lp-slide-next')
const slideDuration = 7000
let autoplayTimer = null

const startAutoplay = () => {
    stopAutoplay()
    autoplayTimer = setInterval(() => {
        slideDirection.value = 'lp-slide-next'
        activeSlide.value = (activeSlide.value + 1) % slides.length
    }, slideDuration)
}
const stopAutoplay = () => { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null } }
const nextSlide = () => { slideDirection.value = 'lp-slide-next'; activeSlide.value = (activeSlide.value + 1) % slides.length; startAutoplay() }
const prevSlide = () => { slideDirection.value = 'lp-slide-prev'; activeSlide.value = (activeSlide.value - 1 + slides.length) % slides.length; startAutoplay() }
const goToSlide = (i) => { slideDirection.value = i > activeSlide.value ? 'lp-slide-next' : 'lp-slide-prev'; activeSlide.value = i; startAutoplay() }

/* Rotate testimonials inside slide 1 (every ~2.8s so 2-3 cycles fit in one slide window) */
const startTmRotator = () => {
    stopTmRotator()
    tmTimer = setInterval(() => {
        activeTmIdx.value = (activeTmIdx.value + 1) % testimonials.length
    }, 2800)
}
const stopTmRotator = () => { if (tmTimer) { clearInterval(tmTimer); tmTimer = null } }

onMounted(() => { startAutoplay(); startTmRotator() })
onUnmounted(() => { stopAutoplay(); stopTmRotator() })

const particleStyle = (n) => {
    const seeds = [
        { x: 8,  y: 12, s: 3, dur: 14, del: 0 },  { x: 85, y: 8,  s: 2, dur: 18, del: 2 },
        { x: 72, y: 75, s: 4, dur: 16, del: 5 },  { x: 20, y: 88, s: 2, dur: 20, del: 1 },
        { x: 45, y: 30, s: 3, dur: 22, del: 7 },  { x: 92, y: 45, s: 2, dur: 15, del: 3 },
        { x: 15, y: 55, s: 3, dur: 19, del: 9 },  { x: 60, y: 92, s: 2, dur: 17, del: 4 },
        { x: 35, y: 15, s: 2, dur: 21, del: 6 },  { x: 78, y: 60, s: 3, dur: 13, del: 8 },
        { x: 50, y: 50, s: 2, dur: 24, del: 10 }, { x: 5,  y: 35, s: 2, dur: 16, del: 11 },
    ]
    const p = seeds[(n - 1) % seeds.length]
    return { left: p.x + '%', top: p.y + '%', width: p.s + 'px', height: p.s + 'px', animationDuration: p.dur + 's', animationDelay: p.del + 's' }
}
</script>
