<template>
  <div class="home">
    <section class="hero" ref="heroRef" @mousemove="onHeroMouse">
      <!-- Background image -->
      <div class="hero-bg" :style="heroBgStyle">
        <img :src="heroBg" alt="Pharma Beach Resort" />
      </div>

      <!-- Dark overlay + mouse spotlight -->
      <div class="hero-overlay" :style="heroOverlayStyle" />
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
      <div class="hero-center" :style="heroCenterStyle">
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
        <div class="hero-arabic-wrap">
          <Transition name="tagline-wipe" mode="out-in">
            <p class="hero-arabic" :key="heroTaglineIdx">{{ heroTaglines[heroTaglineIdx] }}</p>
          </Transition>
        </div>
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
    <section :class="['location', { 'in-view': locVisible }]" ref="locRef">
      <div class="location-container">
        <!-- Two-column row: map (right RTL) + content (left RTL) -->
        <div class="location-row">

          <!-- Map column (first / right in RTL) -->
          <div class="loc-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d217988.4511519507!2d28.5!3d31.05!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDAzJzAwLjAiTiAyOMKwMzAnMDAuMCJF!5e0!3m2!1sar!2seg!4v1700000000000"
              width="100%" height="100%" style="border:0"
              allowfullscreen="" loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="موقع فارما بيتش على الخريطة"
            />
            <!-- Animated marker -->
            <div class="loc-pulse-marker">
              <span class="pulse-ring" />
              <span class="pulse-ring pulse-ring--2" />
              <span class="pulse-dot"><i class="pi pi-map-marker" /></span>
            </div>
            <div class="loc-map-label">
              <strong>فارما بيتش ريزورت</strong>
              <span>الكيلو 120 — الساحل الشمالي</span>
            </div>
          </div>

          <!-- Content column (second / left in RTL) -->
          <div class="loc-content">
            <span class="location-tag">
              <span class="tag-line" />
              الموقع
              <span class="tag-line" />
            </span>
            <h2 class="location-title">تجدنا على <span>الساحل الشمالي</span></h2>
            <p class="location-sub">إقامة فاخرة بإطلالة بحرية مباشرة على البحر الأبيض المتوسط</p>

            <div class="loc-rows">
              <div class="loc-row">
                <span class="loc-row-icon"><i class="pi pi-map-marker" /></span>
                <div class="loc-row-text">
                  <span class="loc-row-label">العنوان</span>
                  <strong>الساحل الشمالي — الكيلو 120، مصر</strong>
                </div>
              </div>

              <div class="loc-row">
                <span class="loc-row-icon loc-row-icon--blue"><i class="pi pi-phone" /></span>
                <div class="loc-row-text">
                  <span class="loc-row-label">اتصل بنا</span>
                  <a href="tel:+201234567890" dir="ltr"><strong>+20 123 456 7890</strong></a>
                </div>
              </div>

              <div class="loc-row">
                <span class="loc-row-icon loc-row-icon--green"><i class="pi pi-whatsapp" /></span>
                <div class="loc-row-text">
                  <span class="loc-row-label">واتساب — رد فوري</span>
                  <a href="https://wa.me/201234567890" target="_blank" rel="noopener" dir="ltr"><strong>+20 123 456 7890</strong></a>
                </div>
              </div>

              <div class="loc-row">
                <span class="loc-row-icon loc-row-icon--gold"><i class="pi pi-clock" /></span>
                <div class="loc-row-text">
                  <span class="loc-row-label">ساعات العمل</span>
                  <strong>24 ساعة / 7 أيام</strong>
                </div>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=31.05,28.5"
              target="_blank"
              rel="noopener"
              class="loc-card-cta"
            >
              <span>احصل على الاتجاهات</span>
              <i class="pi pi-arrow-left" />
            </a>
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

    <!-- Features: Pinned Stage — single fixed window, content crossfades as you scroll -->
    <section
      :class="['features', { 'in-view': featuresVisible }]"
      ref="featuresRef"
      :style="{ height: (featuresData.length * 100) + 'vh' }"
    >
      <div class="feat-stage">
        <!-- Stacked background images — each fades in when active -->
        <div class="feat-stage-bg">
          <div
            v-for="(feat, i) in featuresData"
            :key="feat.id"
            :class="['feat-stage-img', { active: featTopIdx === i }]"
            :style="{ backgroundImage: `url(${feat.img})` }"
          />
          <div class="feat-stage-tint" />
        </div>

        <!-- Foreground content — text, stat, progress rail -->
        <div class="feat-stage-content">
          <!-- Header: chip tag (matches .discover-tag style) + small section title -->
          <header class="feat-stage-header">
            <span class="feat-stage-tag">
              <span class="tag-line" />
              مميزاتنا
              <span class="tag-line" />
            </span>
            <h2 class="feat-stage-heading">تجربة إقامة <span>متكاملة</span></h2>
          </header>

          <!-- Body + rail laid out as a 2-column row: rail on the LEFT (RTL: "after" the list) -->
          <div class="feat-stage-main">
          <!-- Relative wrapper with min-height reserves the column's vertical space, so the
               rail on the other side doesn't shift while the body crossfades. -->
          <div class="feat-stage-body-wrap">
          <!-- Directional crossfading text block for the active feature (slides up or down) -->
          <Transition :name="featTransitionName" mode="out-in">
            <div :key="featTopIdx" class="feat-stage-body" :data-variant="featuresData[featTopIdx].variant">
              <!-- Compact top row: counter + tagline (shared across all variants) -->
              <div class="feat-stage-meta-row">
                <span class="feat-stage-num">{{ String(featTopIdx + 1).padStart(2, '0') }}<span class="sep">/</span>{{ String(featuresData.length).padStart(2, '0') }}</span>
                <span class="feat-stage-divider-short" />
                <span class="feat-stage-tagline">{{ featuresData[featTopIdx].tagline }}</span>
              </div>

              <!-- Big title — SAME design across all features (per user request) -->
              <h3 class="feat-stage-title">{{ featuresData[featTopIdx].title }}</h3>

              <!-- === Variant 1: CLASSIC (beach) — desc + divider + stat + chip bullets === -->
              <template v-if="featuresData[featTopIdx].variant === 'classic'">
                <p class="feat-stage-desc">{{ featuresData[featTopIdx].desc }}</p>
                <span class="feat-stage-accent" />
                <div class="feat-stage-stat">
                  <strong>{{ featuresData[featTopIdx].stat.value }}</strong>
                  <span>{{ featuresData[featTopIdx].stat.label }}</span>
                </div>
                <ul class="feat-stage-bullets">
                  <li v-for="(b, bi) in featuresData[featTopIdx].bullets" :key="bi" :style="{ '--bi': bi }">
                    <span class="feat-stage-bullet-dot"><i class="pi pi-check" /></span>
                    <span class="feat-stage-bullet-text">{{ b }}</span>
                  </li>
                </ul>
              </template>

              <!-- === Variant 2: STAT-HERO (dining) — huge stat as centerpiece, bullets as inline pills === -->
              <template v-else-if="featuresData[featTopIdx].variant === 'stat-hero'">
                <div class="feat-stat-hero">
                  <strong class="feat-stat-hero-num">{{ featuresData[featTopIdx].stat.value }}</strong>
                  <span class="feat-stat-hero-label">{{ featuresData[featTopIdx].stat.label }}</span>
                </div>
                <p class="feat-stage-desc">{{ featuresData[featTopIdx].desc }}</p>
                <ul class="feat-pills">
                  <li v-for="(b, bi) in featuresData[featTopIdx].bullets" :key="bi" :style="{ '--bi': bi }">
                    <i class="pi pi-star-fill" />
                    <span>{{ b }}</span>
                  </li>
                </ul>
              </template>

              <!-- === Variant 3: CHECKLIST (parking) — numbered vertical checklist with connecting line === -->
              <template v-else-if="featuresData[featTopIdx].variant === 'checklist'">
                <p class="feat-stage-desc">{{ featuresData[featTopIdx].desc }}</p>
                <ol class="feat-checklist">
                  <li v-for="(b, bi) in featuresData[featTopIdx].bullets" :key="bi" :style="{ '--bi': bi }">
                    <span class="feat-checklist-num">{{ String(bi + 1).padStart(2, '0') }}</span>
                    <span class="feat-checklist-text">{{ b }}</span>
                    <span class="feat-checklist-check"><i class="pi pi-check" /></span>
                  </li>
                </ol>
                <div class="feat-stat-badge">
                  <strong>{{ featuresData[featTopIdx].stat.value }}</strong>
                  <span>{{ featuresData[featTopIdx].stat.label }}</span>
                </div>
              </template>

              <!-- === Variant 4: METRIC-GRID (wifi) — 3 metric tiles, desc below, stat as ribbon === -->
              <template v-else-if="featuresData[featTopIdx].variant === 'metric-grid'">
                <div class="feat-metric-grid">
                  <div v-for="(b, bi) in featuresData[featTopIdx].bullets" :key="bi" class="feat-metric-tile" :style="{ '--bi': bi }">
                    <span class="feat-metric-ico"><i :class="'pi ' + featuresData[featTopIdx].icon" /></span>
                    <span class="feat-metric-txt">{{ b }}</span>
                  </div>
                </div>
                <p class="feat-stage-desc">{{ featuresData[featTopIdx].desc }}</p>
                <div class="feat-stat-ribbon">
                  <strong>{{ featuresData[featTopIdx].stat.value }}</strong>
                  <span>{{ featuresData[featTopIdx].stat.label }}</span>
                </div>
              </template>

              <!-- === Variant 5: QUOTE (security) — desc as pull-quote, bullets as small inline chips === -->
              <template v-else-if="featuresData[featTopIdx].variant === 'quote'">
                <blockquote class="feat-quote">
                  <span class="feat-quote-mark">&ldquo;</span>
                  <p>{{ featuresData[featTopIdx].desc }}</p>
                  <footer>
                    <strong>{{ featuresData[featTopIdx].stat.value }}</strong>
                    <span>{{ featuresData[featTopIdx].stat.label }}</span>
                  </footer>
                </blockquote>
                <ul class="feat-tags">
                  <li v-for="(b, bi) in featuresData[featTopIdx].bullets" :key="bi" :style="{ '--bi': bi }">
                    <i class="pi pi-check-circle" />
                    {{ b }}
                  </li>
                </ul>
              </template>

              <!-- === Variant 6: SPLIT (greens) — 2 columns: desc+stat on left, bullets as cards on right === -->
              <template v-else-if="featuresData[featTopIdx].variant === 'split'">
                <div class="feat-split">
                  <div class="feat-split-left">
                    <p class="feat-stage-desc">{{ featuresData[featTopIdx].desc }}</p>
                    <div class="feat-stat-big">
                      <strong>{{ featuresData[featTopIdx].stat.value }}</strong>
                      <span>{{ featuresData[featTopIdx].stat.label }}</span>
                    </div>
                  </div>
                  <ul class="feat-split-right">
                    <li v-for="(b, bi) in featuresData[featTopIdx].bullets" :key="bi" :style="{ '--bi': bi }">
                      <span class="feat-split-ico"><i class="pi pi-leaf-fill" /></span>
                      <span>{{ b }}</span>
                    </li>
                  </ul>
                </div>
              </template>
            </div>
          </Transition>
          </div>

          <!-- Horizontal timeline rail — circular icon nodes + connecting line, glued beneath the list -->
          <nav class="feat-stage-rail" aria-label="قائمة المميزات">
            <span class="rail-track" aria-hidden="true">
              <span class="rail-track-fill" :style="{ height: (featTopIdx / (featuresData.length - 1) * 100) + '%' }" />
            </span>
            <button
              v-for="(feat, i) in featuresData"
              :key="feat.id"
              :class="['feat-rail-item', { active: featTopIdx === i, passed: featTopIdx > i }]"
              @click="jumpToFeat(i)"
              :aria-current="featTopIdx === i ? 'true' : 'false'"
            >
              <span class="rail-node">
                <i v-if="featTopIdx > i" class="pi pi-check" />
                <i v-else :class="'pi ' + feat.icon" />
              </span>
              <span class="rail-meta">
                <span class="rail-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="rail-title">{{ feat.title }}</span>
              </span>
            </button>
          </nav>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <!-- Testimonials Section -->
    <section :class="['testimonials', { 'in-view': testimonialsVisible }]" ref="testimonialsRef">
      <div class="testimonials-bg">
        <div class="testimonials-shape testimonials-shape--1" />
        <div class="testimonials-shape testimonials-shape--2" />

        <!-- Giant decorative quote marks -->
        <span class="tm-bg-quote tm-bg-quote--tl">&ldquo;</span>
        <span class="tm-bg-quote tm-bg-quote--br">&rdquo;</span>

        <!-- Floating message bubbles -->
        <div class="tm-bg-bubble tm-bg-bubble--1"><i class="pi pi-heart-fill" /> ممتاز</div>
        <div class="tm-bg-bubble tm-bg-bubble--2"><i class="pi pi-star-fill" /> 5 نجوم</div>
        <div class="tm-bg-bubble tm-bg-bubble--3"><i class="pi pi-thumbs-up-fill" /> موصى به</div>
        <div class="tm-bg-bubble tm-bg-bubble--4"><i class="pi pi-check-circle" /> نظافة فاخرة</div>
        <div class="tm-bg-bubble tm-bg-bubble--5"><i class="pi pi-comment" /> أفضل تجربة</div>
        <div class="tm-bg-bubble tm-bg-bubble--6"><i class="pi pi-send" /> رد سريع</div>

        <!-- Drifting stars / hearts -->
        <i class="tm-bg-icon tm-bg-icon--star1 pi pi-star-fill" />
        <i class="tm-bg-icon tm-bg-icon--star2 pi pi-star-fill" />
        <i class="tm-bg-icon tm-bg-icon--star3 pi pi-star-fill" />
        <i class="tm-bg-icon tm-bg-icon--heart1 pi pi-heart-fill" />
        <i class="tm-bg-icon tm-bg-icon--heart2 pi pi-heart-fill" />
      </div>

      <div class="testimonials-header">
        <span class="testimonials-tag">
          <span class="tag-line" />
          آراء نزلائنا
          <span class="tag-line" />
        </span>
        <h2 class="testimonials-title">ماذا يقول <span>ضيوفنا</span> عنا</h2>
        <p class="testimonials-sub">قصص حقيقية من عائلات استمتعت بإقامتها في فارما بيتش</p>
      </div>

      <div class="testimonials-wrap">
        <TestimonialsColumn :testimonials="testimonialsCol1" :duration="22" />
        <TestimonialsColumn :testimonials="testimonialsCol2" :duration="28" className="hide-md-down" />
        <TestimonialsColumn :testimonials="testimonialsCol3" :duration="25" className="hide-lg-down" />
      </div>
    </section>

    <!-- FAQ Section -->
    <section :class="['faq', { 'in-view': faqVisible }]" ref="faqRef">
      <div class="faq-bg">
        <div class="faq-blob faq-blob--1" />
        <div class="faq-blob faq-blob--2" />
      </div>

      <div class="faq-container">
        <!-- Right: header -->
        <div class="faq-header">
          <span class="faq-tag">
            <span class="tag-line" />
            أسئلة شائعة
            <span class="tag-line" />
          </span>
          <h2 class="faq-title">كل ما تحتاج <span>معرفته</span></h2>
          <p class="faq-sub">إجابات على الأسئلة الأكثر شيوعاً حول الحجز والإقامة</p>

          <div class="faq-still">
            <div class="faq-still-icon"><i class="pi pi-question-circle" /></div>
            <div class="faq-still-text">
              <strong>لم تجد إجابتك؟</strong>
              <a href="https://wa.me/201234567890" target="_blank" rel="noopener">تواصل معنا الآن →</a>
            </div>
          </div>
        </div>

        <!-- Left: accordion -->
        <div class="faq-list">
          <button
            v-for="(item, i) in faqs"
            :key="i"
            type="button"
            :class="['faq-item', { open: activeFaq === i }]"
            :style="{ '--delay': (i * 0.07) + 's' }"
            @click="toggleFaq(i)"
            :aria-expanded="activeFaq === i"
          >
            <span class="faq-q">
              <span class="faq-q-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="faq-q-text">{{ item.q }}</span>
            </span>
            <span class="faq-icon" aria-hidden="true">
              <i class="pi pi-plus" />
            </span>
            <div class="faq-a-wrap">
              <p class="faq-a">{{ item.a }}</p>
            </div>
          </button>
        </div>
      </div>
    </section>

    <section :class="['cta', { 'in-view': ctaVisible }]" ref="ctaRef">
      <div class="cta-card">
        <!-- Subtle dot pattern -->
        <div class="cta-pattern" />

        <!-- Single warm orb glow -->
        <div class="cta-orb cta-orb--warm" />
        <div class="cta-orb cta-orb--cool" />

        <!-- Decorative SVG line accent -->
        <svg class="cta-wave" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,40 C240,10 480,70 720,40 C960,10 1200,70 1440,40 L1440,80 L0,80 Z" fill="rgba(255,255,255,0.04)" />
        </svg>

        <div class="cta-inner">
          <!-- Right: pitch -->
          <div class="cta-content">
            <h2 class="cta-title">احجز شاليهك <span>اليوم</span></h2>
            <p class="cta-desc">
              <span class="dot" /> تأكيد فوري
              <span class="dot" /> إلغاء مجاني
              <span class="dot" /> دفع آمن
            </p>
          </div>

          <!-- Left: action cluster -->
          <div class="cta-actions">
            <RouterLink to="/booking" class="cta-btn">
              <span>احجز الآن</span>
              <i class="pi pi-arrow-left" />
            </RouterLink>
            <div class="cta-quick">
              <a href="https://wa.me/201234567890" target="_blank" rel="noopener" class="cta-quick-link cta-quick-link--wa">
                <i class="pi pi-whatsapp" />
                <span>واتساب</span>
              </a>
              <span class="cta-quick-sep" />
              <a href="tel:+201234567890" class="cta-quick-link" dir="ltr">
                <i class="pi pi-phone" />
                <span>+20 123 456 7890</span>
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
import TestimonialsColumn from '@/components/ui/TestimonialsColumn.vue'

// ---- Testimonials ----
const testimonialsRef = ref(null)
const testimonialsVisible = ref(false)
let testimonialsObserver = null

const testimonials = [
  { text: 'الإقامة كانت استثنائية. الشاليه نظيف، الإطلالة رائعة، والطاقم ودود ومتعاون جداً. قضينا أجمل أسبوع مع العائلة.', image: 'https://randomuser.me/api/portraits/men/32.jpg', name: 'أحمد الشريف', role: 'عميل — 7 ليالي' },
  { text: 'أطفالي استمتعوا بالشاطئ الخاص والمسبح طوال الإقامة. الأمن ممتاز والخدمة 24 ساعة فرق كبير للعائلات.', image: 'https://randomuser.me/api/portraits/women/44.jpg', name: 'منى عبد العزيز', role: 'أم لـ 3 أطفال' },
  { text: 'التنظيف دوري والواي فاي سريع جداً، حتى نجحت أشتغل من الشاليه. تجربة فاخرة بسعر منطقي.', image: 'https://randomuser.me/api/portraits/men/11.jpg', name: 'محمد رجب', role: 'عميل دائم' },

  { text: 'الحجز سهل والدفع آمن. وصلنا ولاقينا الشاليه جاهز تماماً بدون أي تأخير. طريقة استقبال محترمة.', image: 'https://randomuser.me/api/portraits/women/68.jpg', name: 'سارة الفولي', role: 'زائرة جديدة' },
  { text: 'الموقع قريب من كل المطاعم والمحلات بس برضه هادي. أفضل حاجة الإطلالة البحرية من البلكونة مباشرة.', image: 'https://randomuser.me/api/portraits/men/22.jpg', name: 'كريم يوسف', role: 'عميل — 4 ليالي' },
  { text: 'استأجرت شاليه لمناسبة العيد وكل حاجة فاقت توقعاتي. التصميم فاخر والمطبخ مجهز بالكامل.', image: 'https://randomuser.me/api/portraits/women/12.jpg', name: 'ياسمين حلمي', role: 'زائرة' },

  { text: 'دعم العملاء رد عليا بسرعة قبل الحجز وساعدني أختار شاليه يناسب احتياجاتي. تجربة احترافية من البداية.', image: 'https://randomuser.me/api/portraits/men/45.jpg', name: 'عمر البربري', role: 'رجل أعمال' },
  { text: 'السعر ممتاز مقارنة بمستوى الخدمة والمكان. رجعنا السنة دي تاني لأن محدش يعرف يوفر نفس التجربة.', image: 'https://randomuser.me/api/portraits/women/25.jpg', name: 'هدى السيد', role: 'عميلة منذ 2022' },
  { text: 'الحديقة والمساحات الخضراء الواسعة ساعدت أولادي ينزلوا من الموبايل ويجروا في الطبيعة. مكان مثالي.', image: 'https://randomuser.me/api/portraits/men/67.jpg', name: 'طارق فهمي', role: 'أب لطفلين' },
]

const testimonialsCol1 = computed(() => testimonials.slice(0, 3))
const testimonialsCol2 = computed(() => testimonials.slice(3, 6))
const testimonialsCol3 = computed(() => testimonials.slice(6, 9))

// ---- FAQ ----
const faqRef = ref(null)
const faqVisible = ref(false)
let faqObserver = null
const activeFaq = ref(0)

function toggleFaq(i) {
  activeFaq.value = activeFaq.value === i ? -1 : i
}

const faqs = [
  { q: 'كيف يمكنني حجز شاليه؟', a: 'اختر الشاليه من قائمة الشاليهات، حدد تواريخ الإقامة وعدد الضيوف، ثم أتمم الحجز خلال 30 ثانية. ستحصل على تأكيد فوري عبر البريد الإلكتروني والواتساب.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل جميع البطاقات الائتمانية (Visa، Mastercard)، فودافون كاش، إنستاباي، والتحويل البنكي. كل المعاملات مؤمنة ومشفرة بالكامل.' },
  { q: 'هل يمكنني إلغاء أو تعديل الحجز؟', a: 'نعم، الإلغاء مجاني حتى 7 أيام قبل تاريخ الوصول. للتعديلات، تواصل معنا عبر الواتساب وسنساعدك مجاناً.' },
  { q: 'ما هي أوقات الدخول والخروج؟', a: 'الدخول من الساعة 3 ظهراً، والخروج حتى 12 ظهراً. يمكن طلب دخول مبكر أو خروج متأخر حسب الإتاحة.' },
  { q: 'هل الشاطئ خاص بالقرية؟', a: 'نعم، الشاطئ خاص بالنزلاء فقط مع خدمات شاطئية كاملة (مظلات، كراسي، خدمة المشروبات) متاحة طوال اليوم.' },
  { q: 'هل يوجد موقف سيارات مجاني؟', a: 'موقف سيارات مجاني وآمن لجميع النزلاء داخل القرية، مع خدمة الأمن 24 ساعة.' },
  { q: 'هل تتوفر خدمة التنظيف والمنشفات؟', a: 'الشاليه يُسلّم نظيفاً ومجهزاً بالكامل بالمناشف والشراشف. التنظيف اليومي متاح كخدمة إضافية.' },
]

// ---- Hero: mouse spotlight + parallax ----
const heroRef = ref(null)
const mouseX = ref(50)
const mouseY = ref(50)
const scrollY = ref(0)

// ---- Hero: rotating Arabic tagline (3D flip cycle) ----
const heroTaglines = [
  'شاليهات فاخرة على ساحل البحر الأبيض المتوسط',
  'إقامة استثنائية مع خدمة 24 ساعة',
  'شاطئ خاص، مسبح، ومطاعم في مكان واحد',
  'أمان كامل ومساحات خضراء لعائلتك',
  'احجز بسهولة، وصل، واستمتع',
]
const heroTaglineIdx = ref(0)
let heroTaglineTimer = null

const spotlightStyle = computed(() => ({
  background: `radial-gradient(600px circle at ${mouseX.value}% ${mouseY.value}%, rgba(255,255,255,0.04) 0%, transparent 100%)`,
}))

// 0 at top, 1 when fully scrolled past hero
const heroProgress = computed(() => {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  return Math.min(1, Math.max(0, scrollY.value / vh))
})

// Centered content: 3D tilt from mouse + scroll-driven recede on Z axis
const heroCenterStyle = computed(() => {
  const rx = ((50 - mouseY.value) / 50) * 6
  const ry = ((mouseX.value - 50) / 50) * 10
  const p = heroProgress.value
  const z = scrollY.value * 1.1            // pushes back into -Z with scroll
  const blur = p * 5                       // up to 5px blur
  return {
    transform: `translate3d(0, 0, -${z}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
    opacity: 1 - p * 0.95,
    filter: `blur(${blur}px)`,
  }
})

// Background image: stays in place, only fades + very subtle zoom (keeps full width)
const heroBgStyle = computed(() => {
  const p = heroProgress.value
  const scale = 1 + p * 0.08               // gentle zoom in as content recedes
  return {
    transform: `scale(${scale})`,
    opacity: 1 - p * 0.5,
  }
})

// Overlay darkens further as hero recedes
const heroOverlayStyle = computed(() => ({
  opacity: 1 + heroProgress.value * 0.4,
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
  // Freeze updates once hero is fully past — saves work and lets child sections own the viewport
  if (y > window.innerHeight * 1.2) return
  scrollY.value = y
}

// ---- Location: scroll entrance ----
const locRef = ref(null)
const locVisible = ref(false)
let locObserver = null

// ---- About Section: scroll entrance ----
const aboutRef = ref(null)
const aboutVisible = ref(false)
let aboutObserver = null

// ---- CTA Section: scroll entrance ----
const ctaRef = ref(null)
const ctaVisible = ref(false)
let ctaObserver = null

// ---- Features Section: sticky stack reveal + scroll-driven 3D depth ----
const featuresRef = ref(null)
const featuresVisible = ref(false)
let featuresObserver = null

// Index of the topmost sticky-locked card — drives the 3D depth pile
const featTopIdx = ref(0)
// Direction of the most recent change: 1 = forward (next feature), -1 = back.
// Drives whether the crossfade slides in from the bottom or the top.
const featDir = ref(1)
const featTransitionName = computed(() =>
  featDir.value >= 0 ? 'feat-stage-swap-down' : 'feat-stage-swap-up'
)

function onFeatStackScroll() {
  if (!featuresRef.value) return
  const rect = featuresRef.value.getBoundingClientRect()
  if (rect.bottom < 0 || rect.top > window.innerHeight) return

  // Track scroll progress through the tall pinned section, map to active feature index
  const scrolled = -rect.top
  const scrollable = featuresRef.value.offsetHeight - window.innerHeight
  if (scrollable <= 0) return
  const progress = Math.max(0, Math.min(1, scrolled / scrollable))
  const total = featuresData.length
  const nextIdx = Math.min(total - 1, Math.floor(progress * total))
  if (featTopIdx.value !== nextIdx) {
    featDir.value = nextIdx > featTopIdx.value ? 1 : -1
    featTopIdx.value = nextIdx
  }
}

function jumpToFeat(idx) {
  if (!featuresRef.value) return
  featDir.value = idx >= featTopIdx.value ? 1 : -1
  const top = featuresRef.value.offsetTop
  const scrollable = featuresRef.value.offsetHeight - window.innerHeight
  const total = featuresData.length
  const target = top + (idx + 0.3) / total * scrollable
  window.scrollTo({ top: target, behavior: 'smooth' })
}

const featuresData = [
  {
    id: 1,
    tagline: 'تجربة شاطئية لا تُنسى',
    title: 'شاطئ خاص للنزلاء',
    desc: 'شاطئ رملي ناعم بمياه كريستالية صافية، مخصص حصرياً لنزلاء القرية مع خدمات شاطئية متكاملة على مدار اليوم.',
    bullets: ['مظلات وكراسي استرخاء مجانية', 'خدمة المشروبات والوجبات الخفيفة', 'إنقاذ بحري معتمد طوال اليوم'],
    stat: { value: '1.2', label: 'كم من الشاطئ الذهبي' },
    icon: 'pi-sun', img: 'https://picsum.photos/seed/pharma-feat-beach/1200/900',
    variant: 'classic',
  },
  {
    id: 2,
    tagline: 'نكهات من حول العالم',
    title: 'مطاعم متنوعة',
    desc: 'تشكيلة من المطاعم العالمية والمحلية تقدم أشهى المأكولات البحرية والشرقية والإيطالية بأيدي طهاة محترفين.',
    bullets: ['مأكولات بحرية طازجة يومياً', 'مطعم إيطالي وأكلات شرقية', 'خدمة الإفطار حتى الظهر'],
    stat: { value: '+15', label: 'مطعم وكافيه داخل القرية' },
    icon: 'pi-star', img: 'https://picsum.photos/seed/pharma-feat-dining/1200/900',
    variant: 'stat-hero',
  },
  {
    id: 3,
    tagline: 'راحتك تبدأ من الباب',
    title: 'مواقف سيارات مجانية',
    desc: 'موقف سيارات واسع وآمن مجهز بالكامل، مع كاميرات مراقبة على مدار الساعة وفريق أمن مختص.',
    bullets: ['موقف مظلل بجانب كل شاليه', 'كاميرات مراقبة 24 ساعة', 'مواقف لذوي الاحتياجات الخاصة'],
    stat: { value: '+200', label: 'مكان انتظار آمن ومظلل' },
    icon: 'pi-car', img: 'https://picsum.photos/seed/pharma-feat-parking/1200/900',
    variant: 'checklist',
  },
  {
    id: 4,
    tagline: 'متصل دائماً، أينما كنت',
    title: 'واي فاي فائق السرعة',
    desc: 'إنترنت ألياف بصرية فائق السرعة متاح في جميع أنحاء القرية والشاطئ والمطاعم بدون انقطاع.',
    bullets: ['تغطية كاملة لكل الشاليهات', 'سرعة تتجاوز 200 ميجابت/ثانية', 'متاح حتى على الشاطئ والمسبح'],
    stat: { value: '200', label: 'ميجابت/ثانية في كل مكان' },
    icon: 'pi-wifi', img: 'https://picsum.photos/seed/pharma-feat-wifi/1200/900',
    variant: 'metric-grid',
  },
  {
    id: 5,
    tagline: 'سلامتك أولويتنا',
    title: 'أمن وحراسة 24/7',
    desc: 'فريق أمن محترف ومدرب يعمل على مدار الساعة، مع نظام مراقبة متطور لضمان أعلى درجات الأمان والراحة.',
    bullets: ['دوريات أمنية كل ساعة', 'كاميرات بدقة عالية في كل مكان', 'بوابات إلكترونية بنظام QR'],
    stat: { value: '24/7', label: 'حراسة مستمرة بلا انقطاع' },
    icon: 'pi-shield', img: 'https://picsum.photos/seed/pharma-feat-security/1200/900',
    variant: 'quote',
  },
  {
    id: 6,
    tagline: 'الطبيعة في قلب القرية',
    title: 'مناطق خضراء واسعة',
    desc: 'حدائق ومساحات خضراء مزروعة بأشجار النخيل والورود، مثالية للاسترخاء، اليوغا الصباحية، أو نزهة عائلية.',
    bullets: ['ممرات للمشي وركوب الدراجات', 'منطقة ألعاب آمنة للأطفال', 'جلسات يوغا صباحية مجانية'],
    stat: { value: '+8', label: 'فدان من الحدائق الخلابة' },
    icon: 'pi-heart', img: 'https://picsum.photos/seed/pharma-feat-green/1200/900',
    variant: 'split',
  },
]

onMounted(() => {
  window.addEventListener('scroll', onHeroScroll, { passive: true })

  // Rotate the Arabic tagline every 4.5s — kicks in after the initial entrance
  // animation settles (~3s) so the first read is unhurried.
  setTimeout(() => {
    heroTaglineTimer = setInterval(() => {
      heroTaglineIdx.value = (heroTaglineIdx.value + 1) % heroTaglines.length
    }, 4500)
  }, 3000)

  aboutObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { aboutVisible.value = true; aboutObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (aboutRef.value) aboutObserver.observe(aboutRef.value)
  locObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { locVisible.value = true; locObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (locRef.value) locObserver.observe(locRef.value)
  featuresObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { featuresVisible.value = true; featuresObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (featuresRef.value) featuresObserver.observe(featuresRef.value)
  window.addEventListener('scroll', onFeatStackScroll, { passive: true })
  onFeatStackScroll()
  testimonialsObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { testimonialsVisible.value = true; testimonialsObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (testimonialsRef.value) testimonialsObserver.observe(testimonialsRef.value)
  faqObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { faqVisible.value = true; faqObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (faqRef.value) faqObserver.observe(faqRef.value)
  ctaObserver = new IntersectionObserver(
    ([entry]) => { if (entry.isIntersecting) { ctaVisible.value = true; ctaObserver.disconnect() } },
    { threshold: 0.15 }
  )
  if (ctaRef.value) ctaObserver.observe(ctaRef.value)
  featuresData.forEach((f) => { const img = new Image(); img.src = f.img })
})
onUnmounted(() => {
  aboutObserver?.disconnect()
  ctaObserver?.disconnect()
  testimonialsObserver?.disconnect()
  faqObserver?.disconnect()
  featuresObserver?.disconnect()
  locObserver?.disconnect()
  if (heroTaglineTimer) clearInterval(heroTaglineTimer)
  window.removeEventListener('scroll', onFeatStackScroll)
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
  perspective: 1400px;
  perspective-origin: center center;
}

/* ---- Background ---- */
.hero-bg {
  position: absolute;
  inset: 0;
  will-change: transform, opacity;
}

.hero-bg > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* Slight warmth + brightness lift so the scene feels more lit */
  filter: saturate(1.1) brightness(1.08);
  /* Show the image at full brightness immediately — no dark → light fade-in.
     The splash screen already covers the initial load. */
  animation: kb 35s ease-in-out infinite alternate;
}

@keyframes kb {
  0% { transform: scale(1); }
  100% { transform: scale(1.06) translate(-0.5%, -0.3%); }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  /* Lightened — lower dark-overlay opacities so more of the photo shows through */
  background:
    radial-gradient(ellipse at center, rgba(10, 14, 26, 0.15) 0%, rgba(10, 14, 26, 0.45) 100%),
    linear-gradient(180deg, rgba(10, 14, 26, 0.3) 0%, rgba(10, 14, 26, 0.1) 40%, rgba(10, 14, 26, 0.1) 60%, rgba(10, 14, 26, 0.45) 100%);
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
  from { opacity: 0; transform: perspective(600px) rotateY(-90deg) scale(0.6); }
  to   { opacity: 1; transform: perspective(600px) rotateY(0deg) scale(1); }
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
  transform-style: preserve-3d;
  will-change: transform, opacity, filter;
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
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2.5rem;
  transform-style: preserve-3d;
}

/* "Pharma" — now wears the OLD BEACH look: filled primary with a thin gold
   stroke + breathing beach-glow. Gets the wider letter-spacing too. */
.hero-word {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 9rem;
  font-weight: 900;
  color: rgba(249, 115, 22, 0.8);
  -webkit-text-stroke: 1.5px #fbbf24;
  letter-spacing: 10px;
  display: inline-block;
  position: relative;
  opacity: 0;
  animation:
    word-in 1s cubic-bezier(0.22, 1, 0.36, 1) 1s forwards,
    beach-glow 5s ease-in-out 3s infinite;
  text-shadow:
    0 0 12px rgba(249, 115, 22, 0.2),
    0 4px 30px rgba(0, 0, 0, 0.3);
}

/* Pharma's blurred-orange depth halo (was the old Beach ::before) */
.hero-word::before {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  -webkit-text-stroke: 4px rgba(249, 115, 22, 0.12);
  filter: blur(3px);
  z-index: -1;
  pointer-events: none;
}

/* "Beach" — now wears the OLD PHARMA look: neon outlined stroke, minimal fill,
   narrower letter-spacing + gentle neon glow breathing. */
.hero-word--accent {
  letter-spacing: 8px;
  color: rgba(249, 115, 22, 0.16);
  -webkit-text-stroke: 3px #fbbf24;
  text-shadow:
    0 0 8px rgba(249, 115, 22, 0.08),
    0 0 20px rgba(249, 115, 22, 0.05);
  animation:
    word-in 1s cubic-bezier(0.22, 1, 0.36, 1) 1.3s forwards,
    neon-glow 5s ease-in-out 3.5s infinite;
}

/* Beach's soft white depth halo (was the old Pharma ::before) */
.hero-word--accent::before {
  -webkit-text-stroke: 5px rgba(255, 255, 255, 0.08);
  color: transparent;
  filter: none;
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

/* Entrance — 3D flip down from above */
@keyframes word-in {
  0%   { opacity: 0; transform: perspective(800px) rotateX(-75deg) translateY(-30px); filter: blur(6px); }
  60%  { opacity: 1; filter: blur(0); }
  100% { opacity: 1; transform: perspective(800px) rotateX(0deg) translateY(0); filter: blur(0); }
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

/* ---- Per-letter 3D wave animation ---- */
.hl {
  display: inline-block;
  transform-style: preserve-3d;
  animation: letter-wave 4s ease-in-out infinite;
  animation-delay: calc(0.2s * var(--i));
}

@keyframes letter-wave {
  0%, 100% { transform: translateY(0) rotateY(0deg) rotateX(0deg); }
  25%      { transform: translateY(-4px) rotateY(15deg) rotateX(-6deg); }
  50%      { transform: translateY(-8px) rotateY(0deg) rotateX(0deg); }
  75%      { transform: translateY(-4px) rotateY(-15deg) rotateX(6deg); }
}

/* ---- Arabic tagline ---- */
/* Wrapper establishes perspective + reserves vertical space so the page doesn't
   jump when the tagline swaps. */
.hero-arabic-wrap {
  perspective: 900px;
  transform-style: preserve-3d;
  min-height: 2.3em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
}

.hero-arabic {
  font-size: 1.15rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
  max-width: 500px;
  line-height: 1.7;
  margin: 0;
  perspective: 900px;
  /* Entrance is handled per-word by .hero-tag-word; the paragraph itself stays visible. */
}

@keyframes text-rise {
  from { opacity: 0; transform: translateY(12px); filter: blur(3px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* ── Curtain-wipe transition ──
   Outgoing: visible band shrinks left → right (leftmost chars disappear first)
   Incoming: visible band grows right → left (mirrors the RTL reading direction)
   A thin gold "wipe line" trails the edge on both phases for cinematic polish. */
.tagline-wipe-enter-active {
  animation: tagline-wipe-in 0.85s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  position: relative;
}
.tagline-wipe-leave-active {
  animation: tagline-wipe-out 0.55s cubic-bezier(0.65, 0, 0.35, 1) forwards;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

@keyframes tagline-wipe-out {
  0%   {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    clip-path: inset(0 0 0 100%);
    -webkit-clip-path: inset(0 0 0 100%);
    transform: translateX(-24px);
    opacity: 0.85;
  }
}

@keyframes tagline-wipe-in {
  0%   {
    clip-path: inset(0 0 0 100%);
    -webkit-clip-path: inset(0 0 0 100%);
    transform: translateX(24px);
    opacity: 0.85;
    filter: blur(4px);
  }
  50%  { filter: blur(1px); }
  100% {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
    transform: translateX(0);
    opacity: 1;
    filter: blur(0);
  }
}

/* The wipe "edge" — a thin gold bar that travels across with the reveal */
.tagline-wipe-enter-active::after,
.tagline-wipe-leave-active::after {
  content: '';
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  background: linear-gradient(180deg, transparent, #fbbf24 30%, #f97316 70%, transparent);
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.8), 0 0 24px rgba(249, 115, 22, 0.4);
  pointer-events: none;
}
.tagline-wipe-enter-active::after {
  animation: wipe-edge-in 0.85s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}
.tagline-wipe-leave-active::after {
  animation: wipe-edge-out 0.55s cubic-bezier(0.65, 0, 0.35, 1) forwards;
}

@keyframes wipe-edge-in {
  0%   { right: 0;    opacity: 1; }
  100% { right: 100%; opacity: 0; }
}
@keyframes wipe-edge-out {
  0%   { left: 0;     opacity: 1; }
  100% { left: 100%;  opacity: 0; }
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
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  transform-style: preserve-3d;
}

.meta-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: perspective(600px) rotateX(-8deg) rotateY(6deg) translateY(-6px) translateZ(20px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.25),
    0 0 20px rgba(249, 115, 22, 0.12);
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
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
}

.meta-card:hover .meta-card-icon {
  transform: rotateY(360deg) scale(1.1);
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
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.meta-card-text span {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.95);
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
  border: 1.5px solid rgba(249, 115, 22, 0.75);
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
  background: rgba(249, 115, 22, 0.18);
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.2);
}

.hero-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50px;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(251, 191, 36, 0.15));
  opacity: 0;
  transition: opacity 0.4s ease;
}

.hero-cta:hover {
  border-color: rgba(249, 115, 22, 0.8);
  transform: perspective(500px) rotateX(-10deg) translateY(-4px) translateZ(10px);
  box-shadow:
    0 18px 35px rgba(0, 0, 0, 0.35),
    0 0 30px rgba(249, 115, 22, 0.35);
  letter-spacing: 4px;
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
  color: rgba(255, 255, 255, 0.22);
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
  perspective: 1400px;
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
    transform: scale(1) rotate3d(1, 1, 0, 0deg);
  }
  25% {
    border-radius: 40% 60% 55% 45%;
    transform: scale(1.05) rotate3d(1, 1, 0.2, 30deg);
  }
  50% {
    border-radius: 55% 45% 40% 60%;
    transform: scale(0.95) rotate3d(1, 1, 0.5, 60deg);
  }
  75% {
    border-radius: 45% 55% 60% 40%;
    transform: scale(1.03) rotate3d(1, 1, 0.3, 90deg);
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
  from { transform: rotateX(20deg) rotateZ(0deg); }
  to   { transform: rotateX(20deg) rotateZ(360deg); }
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
  0%, 100% { transform: translate3d(0, 0, 0) rotate3d(0.3, 1, 0.1, -10deg); }
  33%      { transform: translate3d(20px, -25px, 30px) rotate3d(0.5, 1, 0.2, 25deg); }
  66%      { transform: translate3d(-10px, 15px, -20px) rotate3d(0.2, 1, 0.3, -35deg); }
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
  0%, 100% { transform: translate3d(0, 0, 0) rotateY(0deg) scale(1); }
  50%      { transform: translate3d(0, -20px, 15px) rotateY(180deg) scale(1.1); }
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
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
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
  transform: perspective(500px) rotateX(-8deg) translateY(-3px);
  box-shadow: 0 10px 22px rgba(var(--primary-rgb), 0.15);
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
  animation: card-enter 0.6s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s) both;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.mcard:hover {
  transform: perspective(1000px) rotateX(-4deg) rotateY(4deg) translateY(-6px);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.18), 0 0 30px rgba(var(--primary-rgb), 0.08);
}

.mcard--large {
  grid-column: span 2;
  grid-row: span 2;
}

@keyframes card-enter {
  from { opacity: 0; transform: perspective(900px) translate3d(0, 30px, -50px) rotateX(12deg); }
  to   { opacity: 1; transform: perspective(900px) translate3d(0, 0, 0) rotateX(0deg); }
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
  perspective: 1400px;
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
  0%   { transform: translate3d(0, 0, 0) rotateZ(0deg) rotateX(0deg); }
  50%  { transform: translate3d(10px, -10px, 20px) rotateZ(8deg) rotateX(10deg); }
  100% { transform: translate3d(20px, -15px, 0) rotateZ(-5deg) rotateX(-8deg); }
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
  transform: perspective(1200px) translate3d(0, 50px, -60px) rotateX(10deg);
  transform-origin: center bottom;
  transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1), opacity 1s ease;
}

.about.in-view .about-text {
  opacity: 1;
  transform: perspective(1200px) translate3d(0, 0, 0) rotateX(0deg);
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
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  transform-style: preserve-3d;
  transform: perspective(600px);
}

.about-stat:hover {
  background: rgba(var(--primary-rgb), 0.04);
  border-color: rgba(var(--primary-rgb), 0.2);
  transform: perspective(600px) rotateX(-10deg) rotateY(8deg) translateY(-6px) translateZ(16px);
  box-shadow: 0 22px 40px rgba(0, 0, 0, 0.1), 0 0 18px rgba(var(--primary-rgb), 0.08);
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
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
}

.about-stat:hover .stat-icon {
  transform: rotateY(360deg) scale(1.08);
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
  transform: perspective(1400px) translate3d(60px, 40px, -120px) rotateY(-15deg);
  transform-origin: right center;
  transition: transform 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.25s, opacity 1s ease 0.25s;
}

.about.in-view .about-visual {
  opacity: 1;
  transform: perspective(1400px) translate3d(0, 0, 0) rotateY(0deg);
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
  transform: perspective(1400px) rotateY(-5deg) rotateX(2deg);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.about-img-main:hover {
  transform: perspective(1400px) rotateY(0deg) rotateX(0deg);
  box-shadow: 0 36px 80px rgba(0, 0, 0, 0.18), 0 0 30px rgba(var(--primary-rgb), 0.08);
}

.about-img-main > img {
  width: 100%;
  display: block;
  aspect-ratio: 7 / 5;
  object-fit: cover;
  transition: transform 6s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
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
  transform: translate(-50%, -50%) perspective(500px) rotateX(-12deg) scale(1.15) translateZ(20px);
  box-shadow: 0 18px 50px rgba(var(--primary-rgb), 0.55);
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
  transform: perspective(1200px) rotateY(8deg) rotateZ(-3deg);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.5s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.about-img-float:hover {
  transform: perspective(1200px) rotateY(0deg) rotateZ(0deg) scale(1.04);
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.22);
}

.about-img-float img {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
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
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  transform: perspective(800px) rotateY(-8deg) rotateZ(4deg);
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.about-badge:hover {
  transform: perspective(800px) rotateY(0deg) rotateZ(0deg) scale(1.06);
  box-shadow: 0 22px 50px rgba(var(--primary-rgb), 0.5);
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


/* ═══════════════════════════════════
   FEATURES — PINNED STAGE + CROSSFADING CONTENT
   ═══════════════════════════════════ */
.features {
  position: relative;
  background: #0a1628;
}

.feat-stage {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.feat-stage-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.feat-stage-img {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 1.1s cubic-bezier(0.22, 1, 0.36, 1), transform 2.5s ease-out;
  will-change: opacity, transform;
}

.feat-stage-img.active {
  opacity: 1;
  transform: scale(1);
}

.feat-stage-tint {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, rgba(10, 22, 40, 0.45) 0%, rgba(10, 22, 40, 0.85) 100%),
    linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), transparent 50%, rgba(var(--secondary-rgb), 0.15));
}

.feat-stage-content {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  height: 100%;
  padding: clamp(2rem, 5vh, 3.5rem) clamp(1.5rem, 4vw, 4rem);
  display: grid;
  /* Header at top, main (body + rail glued together) centered in the remaining space. */
  grid-template-rows: auto 1fr;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  direction: rtl;
}

/* Body + rail wrapper — 2-column row: body on the right, rail on the LEFT (RTL "after" position).
   Spans the full content container width.
   align-items: start keeps the rail anchored to the top — prevents it from shifting
   vertically during the body's out-in crossfade (when the body element is briefly removed
   from the DOM, the grid row collapses; centering would reposition the rail and "jump"). */
.feat-stage-main {
  grid-column: 1;
  grid-row: 2;
  align-self: center;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 280px; /* body | rail */
  align-items: start;
  gap: 3rem;
  direction: rtl; /* body first (right), rail second (left) */
}

/* ---- Header — centered, chip tag matches other sections, subordinate section title ---- */
.feat-stage-header {
  grid-column: 1;
  grid-row: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: clamp(2rem, 6vh, 4rem); /* push the header down from the navbar edge */
  opacity: 0;
  transform: translateY(-20px);
  transition: opacity 0.9s ease, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}

.features.in-view .feat-stage-header {
  opacity: 1;
  transform: translateY(0);
}

/* Match the .discover-tag / .loc-tag pattern — simple text with lines either side */
.feat-stage-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.feat-stage-tag .tag-line {
  display: block;
  width: 30px;
  height: 1px;
  background: rgba(251, 191, 36, 0.55);
  opacity: 1;
}

.feat-stage-heading {
  font-size: clamp(1.1rem, 1.8vw, 1.35rem);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
  line-height: 1.3;
  letter-spacing: 0.2px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

.feat-stage-heading span {
  background: linear-gradient(135deg, var(--primary), #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

/* Wrapper reserves a fixed vertical slot — prevents layout jumps during the body crossfade.
   The body element inside is absolute-positioned so when it's briefly removed from the DOM
   (mode="out-in"), the wrapper still holds the space → rail on the other column stays put. */
.feat-stage-body-wrap {
  position: relative;
  width: 100%;
  min-height: clamp(440px, 56vh, 540px);
}

.feat-stage-body {
  position: absolute;
  top: 0;
  right: 0; /* flush to the right edge of the column (body is on the right in RTL) */
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
  text-align: right;
}

/* Meta row — counter + short divider + tagline, all inline */
.feat-stage-meta-row {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.feat-stage-num {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.2rem;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
  direction: ltr;
  line-height: 1;
}

.feat-stage-num .sep {
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0.15rem;
  font-weight: 400;
}

.feat-stage-divider-short {
  width: 32px;
  height: 1px;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.7), transparent);
}

.feat-stage-tagline {
  font-size: 0.75rem;
  font-weight: 800;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 3px;
}

.feat-stage-title {
  font-size: clamp(2.4rem, 5.5vw, 4.2rem);
  font-weight: 900;
  color: #fff;
  margin: 0;
  line-height: 1.05;
  letter-spacing: -1.5px;
  text-shadow: 0 6px 30px rgba(0, 0, 0, 0.5);
}

.feat-stage-desc {
  font-size: 1.08rem;
  line-height: 1.85;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  max-width: 540px;
}

/* Gold-orange accent line — sits between desc and stat */
.feat-stage-accent {
  display: block;
  width: 64px;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), #fbbf24, transparent);
  border-radius: 3px;
  margin: 0.35rem 0 0.15rem;
  box-shadow: 0 0 14px rgba(251, 191, 36, 0.4);
}

.feat-stage-stat {
  display: flex;
  align-items: baseline;
  gap: 0.9rem;
}

.feat-stage-stat strong {
  font-size: clamp(2.6rem, 5vw, 3.8rem);
  font-weight: 900;
  background: linear-gradient(135deg, var(--primary), #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  letter-spacing: -1.5px;
  direction: ltr;
}

.feat-stage-stat span {
  font-size: 0.88rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.78);
  max-width: 180px;
  line-height: 1.4;
}

/* ---- Perks list — glass chips with gold check-icon, staggered entry + hover lift ---- */
.feat-stage-bullets {
  list-style: none;
  padding: 0;
  margin: 0.85rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.feat-stage-bullets li {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.85rem 0.55rem 0.6rem;
  background: rgba(255, 255, 255, 0.06);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
          backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 50px;
  width: fit-content;
  font-size: 0.86rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.3;
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  /* Staggered entrance — each chip fades up after the feature body has settled */
  opacity: 0;
  transform: translateX(12px) translateY(6px);
  animation: feat-bullet-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.2s + var(--bi, 0) * 0.09s);
}

@keyframes feat-bullet-in {
  to { opacity: 1; transform: translateX(0) translateY(0); }
}

.feat-stage-bullets li:hover {
  background: rgba(251, 191, 36, 0.12);
  border-color: rgba(251, 191, 36, 0.35);
  transform: perspective(400px) rotateY(-3deg) translateX(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.35), 0 0 24px rgba(251, 191, 36, 0.2);
}

.feat-stage-bullet-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, var(--primary));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.6rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.feat-stage-bullet-text {
  display: inline-block;
  padding-right: 0.1rem;
}

/* ═══════════════════════════════════════════════════════════
   Feature variant layouts — each step has its own body design,
   while the title stays consistent across all of them.
   ═══════════════════════════════════════════════════════════ */

/* --- VARIANT 2: stat-hero (dining) --- */
.feat-stat-hero {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.5rem 0 0.75rem;
  position: relative;
}
.feat-stat-hero::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0.25rem;
  width: 90px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fbbf24, var(--primary));
  border-radius: 2px;
}
.feat-stat-hero-num {
  font-size: clamp(4rem, 8vw, 6.5rem);
  font-weight: 900;
  line-height: 0.95;
  background: linear-gradient(135deg, #fff 0%, #fbbf24 55%, var(--primary) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 6px 32px rgba(251, 191, 36, 0.25);
  letter-spacing: -2px;
}
.feat-stat-hero-label {
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
}
.feat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  justify-content: flex-end;
}
.feat-pills li {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  opacity: 0;
  animation: feat-bullet-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.25s + var(--bi, 0) * 0.08s);
}
.feat-pills li i { color: #fbbf24; font-size: 0.75rem; }

/* --- VARIANT 3: checklist (parking) --- */
.feat-checklist {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.feat-checklist::before {
  content: '';
  position: absolute;
  top: 1.2rem;
  bottom: 1.2rem;
  right: 22px;  /* aligns with number circle center */
  width: 2px;
  background: linear-gradient(180deg, #fbbf24, rgba(251, 191, 36, 0));
  opacity: 0.5;
}
.feat-checklist li {
  display: grid;
  grid-template-columns: 44px 1fr auto;
  align-items: center;
  gap: 0.85rem;
  padding: 0.55rem 0.8rem 0.55rem 0.8rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  direction: rtl;
  opacity: 0;
  transform: translateX(20px);
  animation: feat-bullet-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.2s + var(--bi, 0) * 0.1s);
  position: relative;
  z-index: 1;
}
.feat-checklist-num {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #fbbf24);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px rgba(251, 191, 36, 0.35);
}
.feat-checklist-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}
.feat-checklist-check {
  color: #4ade80;
  font-size: 1.1rem;
}
.feat-stat-badge {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  border-radius: 50px;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
  align-self: flex-end;
  margin-top: 0.5rem;
}
.feat-stat-badge strong {
  color: #fbbf24;
  font-size: 1.1rem;
  font-weight: 800;
}
.feat-stat-badge span {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.8rem;
  font-weight: 600;
}

/* --- VARIANT 4: metric-grid (wifi) --- */
.feat-metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
  margin: 0.5rem 0;
}
.feat-metric-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  padding: 1.1rem 0.75rem;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(251, 191, 36, 0.18);
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  opacity: 0;
  transform: translateY(24px);
  animation: feat-bullet-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.2s + var(--bi, 0) * 0.11s);
  transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
}
.feat-metric-tile:hover {
  transform: translateY(-4px);
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 12px 28px rgba(251, 191, 36, 0.2);
}
.feat-metric-ico {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), #fbbf24);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 6px 18px rgba(251, 191, 36, 0.3);
}
.feat-metric-txt {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.35;
}
.feat-stat-ribbon {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.25rem;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(251, 191, 36, 0.15), rgba(var(--primary-rgb), 0.1));
  border-right: 3px solid #fbbf24;
}
.feat-stat-ribbon strong {
  font-size: 1.6rem;
  font-weight: 900;
  color: #fbbf24;
  letter-spacing: -0.5px;
}
.feat-stat-ribbon span {
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-align: right;
}

/* --- VARIANT 5: quote (security) --- */
.feat-quote {
  position: relative;
  margin: 0.5rem 0;
  padding: 1.5rem 1.5rem 1.25rem 3rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(251, 191, 36, 0.18);
  border-radius: 16px;
  border-right: 4px solid #fbbf24;
}
.feat-quote-mark {
  position: absolute;
  top: -0.6rem;
  right: 1.1rem;
  font-family: 'Playfair Display', serif;
  font-size: 5rem;
  line-height: 1;
  color: #fbbf24;
  opacity: 0.8;
  text-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
}
.feat-quote p {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
  font-style: italic;
  margin: 0 0 1rem;
}
.feat-quote footer {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
  padding-top: 0.85rem;
  border-top: 1px solid rgba(251, 191, 36, 0.2);
}
.feat-quote footer strong {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fbbf24;
}
.feat-quote footer span {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}
.feat-tags {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-start;
}
.feat-tags li {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(251, 191, 36, 0.35);
  border-radius: 6px;
  opacity: 0;
  animation: feat-bullet-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.3s + var(--bi, 0) * 0.07s);
}
.feat-tags li i { color: #fbbf24; font-size: 0.85rem; }

/* --- VARIANT 6: split (greens) --- */
.feat-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: start;
  margin-top: 0.5rem;
}
.feat-split-left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.feat-stat-big {
  padding: 1.1rem 1.25rem;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(var(--primary-rgb), 0.1));
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 16px;
  text-align: right;
}
.feat-stat-big strong {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #fbbf24, var(--primary));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -1px;
}
.feat-stat-big span {
  display: block;
  margin-top: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
}
.feat-split-right {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.feat-split-right li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.88);
  opacity: 0;
  transform: translateX(-20px);
  animation: feat-bullet-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(0.25s + var(--bi, 0) * 0.1s);
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.feat-split-right li:hover {
  transform: translateX(-4px);
  border-color: rgba(251, 191, 36, 0.3);
}
.feat-split-ico {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
}

/* ---- Directional swap animations ----
   Forward (down): new content rises from below, old content slides up and away.
   Back (up): new content drops in from above, old content slides down and away. */
.feat-stage-swap-down-enter-active,
.feat-stage-swap-up-enter-active {
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.05s,
              filter 0.55s ease;
}

.feat-stage-swap-down-leave-active,
.feat-stage-swap-up-leave-active {
  transition: opacity 0.35s ease, transform 0.45s ease, filter 0.35s ease;
}

/* Forward (scrolling down / next feature) — slide up and out, fade in from below */
.feat-stage-swap-down-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
  filter: blur(6px);
}
.feat-stage-swap-down-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.97);
  filter: blur(4px);
}

/* Back (scrolling up / previous feature) — reverse direction */
.feat-stage-swap-up-enter-from {
  opacity: 0;
  transform: translateY(-40px) scale(0.98);
  filter: blur(6px);
}
.feat-stage-swap-up-leave-to {
  opacity: 0;
  transform: translateY(40px) scale(0.97);
  filter: blur(4px);
}

/* ---- Vertical timeline rail (LEFT side — RTL "after" position) ---- */
.feat-stage-rail {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  padding: 0.5rem 0;
  opacity: 0;
  transform: translateX(-30px);
  transition: opacity 0.9s ease 0.3s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
  direction: ltr; /* rail items: node on the RIGHT (near body), meta on the LEFT */
}

.features.in-view .feat-stage-rail {
  opacity: 1;
  transform: translateX(0);
}

/* Connecting line through the center of all nodes (vertical). Nodes sit on the LEFT edge
   of the rail (far end), with meta labels extending to the RIGHT toward the body. */
.rail-track {
  position: absolute;
  top: 1.5rem;
  bottom: 1.5rem;
  left: 22px; /* aligns with node center (44px/2) on the left edge of the column */
  width: 2px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
  pointer-events: none;
}

/* Fill that grows as featTopIdx increases — gradient gold/orange */
.rail-track-fill {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, var(--primary), #fbbf24);
  border-radius: 2px;
  box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);
  transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ---- Rail item ---- */
.feat-rail-item {
  display: grid;
  grid-template-columns: 44px 1fr; /* node on left (far end), meta on right (near body) */
  align-items: center;
  gap: 1rem;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: rgba(255, 255, 255, 0.55);
  text-align: right;
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s ease;
  position: relative;
  z-index: 2;
}

.feat-rail-item:hover { color: rgba(255, 255, 255, 0.9); transform: translateX(4px); }

/* ---- The node (circle with icon) ---- */
.rail-node {
  grid-column: 1;
  grid-row: 1;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  flex-shrink: 0;
  transition:
    background 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.4s ease,
    color 0.4s ease,
    transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s ease;
  -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
}

.feat-rail-item:hover .rail-node {
  border-color: rgba(255, 255, 255, 0.45);
  color: rgba(255, 255, 255, 0.9);
  transform: scale(1.08);
}

/* Passed state — filled gold, checkmark */
.feat-rail-item.passed .rail-node {
  background: linear-gradient(135deg, #fbbf24, var(--primary));
  border-color: transparent;
  color: #fff;
  box-shadow: 0 6px 18px rgba(251, 191, 36, 0.4);
}

/* Active state — filled orange gradient, large glow, slight scale */
.feat-rail-item.active {
  color: #fff;
}

.feat-rail-item.active .rail-node {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
  transform: scale(1.15);
  box-shadow:
    0 0 0 4px rgba(var(--primary-rgb), 0.18),
    0 10px 24px rgba(var(--primary-rgb), 0.5),
    0 0 40px rgba(var(--primary-rgb), 0.3);
  animation: rail-node-pulse 2.4s ease-in-out infinite;
}

@keyframes rail-node-pulse {
  0%, 100% {
    box-shadow:
      0 0 0 4px rgba(var(--primary-rgb), 0.18),
      0 10px 24px rgba(var(--primary-rgb), 0.5),
      0 0 40px rgba(var(--primary-rgb), 0.3);
  }
  50% {
    box-shadow:
      0 0 0 6px rgba(var(--primary-rgb), 0.24),
      0 10px 28px rgba(var(--primary-rgb), 0.6),
      0 0 56px rgba(var(--primary-rgb), 0.45);
  }
}

/* ---- Meta (number + title) — right column, aligned to the right (toward the body) ---- */
.rail-meta {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: flex-end;
  text-align: right;
  direction: rtl;
}

.rail-num {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 2px;
  direction: ltr;
  opacity: 0.6;
  transition: color 0.3s ease, opacity 0.3s ease;
}

.feat-rail-item.active .rail-num {
  color: #fbbf24;
  opacity: 1;
}

.feat-rail-item.passed .rail-num {
  color: rgba(251, 191, 36, 0.85);
  opacity: 1;
}

.rail-title {
  font-size: 0.92rem;
  font-weight: 700;
  line-height: 1.25;
  transition: color 0.3s ease;
}

.feat-rail-item.active .rail-title {
  font-weight: 800;
  letter-spacing: -0.2px;
}

@media (max-width: 900px) {
  .feat-stage-content {
    gap: 1.5rem;
  }
  /* Keep rail on the LEFT always — just shrink it on smaller screens (icon-only, no meta text) */
  .feat-stage-main {
    grid-template-columns: 1fr 56px; /* body | compact rail */
    gap: 1rem;
  }
  .feat-stage-rail {
    gap: 0.85rem;
  }
  .feat-rail-item {
    grid-template-columns: 44px; /* node only — hide meta on mobile */
    gap: 0;
  }
  .rail-meta { display: none; }
  .rail-node {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
  .rail-track {
    left: 18px; /* 36/2 — stays aligned with the shrunken node centers */
  }
  .feat-stage-title { font-size: clamp(1.8rem, 7vw, 2.8rem); }
  .feat-stage-desc { font-size: 0.95rem; }

  /* Variant layouts simplified on narrow screens */
  .feat-stat-hero-num { font-size: clamp(3rem, 12vw, 5rem); }
  .feat-metric-grid { grid-template-columns: 1fr; gap: 0.5rem; }
  .feat-split { grid-template-columns: 1fr; gap: 1rem; }
  .feat-quote { padding: 1.25rem 1.25rem 1rem 2rem; }
  .feat-quote-mark { font-size: 3.5rem; right: 0.75rem; }
}

/* ═══════════════════════════════════
   LOCATION — 2-column row (map + content)
   ═══════════════════════════════════ */
.location {
  position: relative;
  padding: 6rem 2rem;
  /* Modern mesh gradient — 6 layered radial spots in brand palette */
  background:
    radial-gradient(900px 650px at 85% 0%, rgba(var(--primary-rgb), 0.28), transparent 60%),
    radial-gradient(700px 500px at 100% 50%, rgba(251, 191, 36, 0.22), transparent 65%),
    radial-gradient(1000px 700px at 0% 100%, rgba(var(--secondary-rgb), 0.28), transparent 60%),
    radial-gradient(600px 600px at 25% 25%, rgba(239, 68, 68, 0.08), transparent 65%),
    radial-gradient(800px 600px at 75% 85%, rgba(34, 211, 238, 0.12), transparent 65%),
    linear-gradient(135deg, #fef9f3 0%, #fff 50%, #f0f9ff 100%);
  overflow: hidden;
}

/* Soft animated accent blob — gives the gradient subtle motion */
.location::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  top: 30%;
  left: 50%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.18), transparent 70%);
  filter: blur(60px);
  pointer-events: none;
  animation: loc-bg-pulse 10s ease-in-out infinite;
  z-index: 0;
}

@keyframes loc-bg-pulse {
  0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.7; }
  50%      { transform: translate(-50%, -30px) scale(1.15); opacity: 1; }
}

.location-container { position: relative; z-index: 1; }

.location-container {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
}

/* Two-column row */
.location-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: stretch;
}

/* ---- Map column (right in RTL) ---- */
.loc-map {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  min-height: 460px;
  background: #f1f5f9;
  box-shadow: 0 16px 40px -10px rgba(15, 23, 42, 0.18), 0 4px 14px -4px rgba(15, 23, 42, 0.08);
  opacity: 0;
  transform: perspective(1200px) translate3d(0, 30px, -60px) rotateY(-8deg);
  transform-origin: right center;
  transition: opacity 0.9s ease 0.15s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, box-shadow 0.5s ease;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.location.in-view .loc-map {
  opacity: 1;
  /* Settles + a continuous 3D float kicks in after entrance */
  animation: loc-map-float 9s ease-in-out 1.2s infinite;
}

/* Continuous gentle 3D drift */
@keyframes loc-map-float {
  0%, 100% { transform: perspective(1200px) translate3d(0, 0, 0)    rotateY(0deg)   rotateX(0deg); }
  50%      { transform: perspective(1200px) translate3d(0, -10px, 0) rotateY(1.5deg) rotateX(-1deg); }
}

/* Hover: tip toward viewer, lift, deeper shadow */
.loc-map:hover {
  animation-play-state: paused;
  transform: perspective(1200px) translate3d(0, -10px, 30px) rotateY(0deg) rotateX(-2deg);
  box-shadow: 0 28px 60px -10px rgba(15, 23, 42, 0.28), 0 0 30px rgba(var(--primary-rgb), 0.15);
}

.loc-map iframe {
  width: 100%;
  height: 100%;
  display: block;
  filter: saturate(0.85) contrast(0.95);
}

/* Centered animated marker */
.loc-pulse-marker {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60px;
  height: 60px;
  pointer-events: none;
  z-index: 2;
}

.pulse-dot {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.55), 0 0 0 3px rgba(255, 255, 255, 0.7);
  z-index: 3;
  /* Continuous 3D coin-spin + breath */
  animation: pulse-dot-spin 5s linear infinite, pulse-dot-breath 2.4s ease-in-out infinite;
  transform-style: preserve-3d;
}

@keyframes pulse-dot-spin {
  from { transform: rotateY(0deg); }
  to   { transform: rotateY(360deg); }
}

@keyframes pulse-dot-breath {
  0%, 100% { box-shadow: 0 6px 18px rgba(var(--primary-rgb), 0.55), 0 0 0 3px rgba(255, 255, 255, 0.7); }
  50%      { box-shadow: 0 10px 28px rgba(var(--primary-rgb), 0.75), 0 0 0 5px rgba(255, 255, 255, 0.85), 0 0 30px rgba(var(--primary-rgb), 0.4); }
}

.pulse-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.5);
  animation: loc-pulse-ring 2.2s ease-out infinite;
}

.pulse-ring--2 { animation-delay: 1.1s; }

@keyframes loc-pulse-ring {
  0%   { transform: scale(0.4); opacity: 0.7; }
  100% { transform: scale(2.4); opacity: 0; }
}

.loc-map-label {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  padding: 0.55rem 1.1rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.95);
  -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  pointer-events: none;
  z-index: 2;
  animation: loc-label-bob 3.5s ease-in-out infinite;
}

@keyframes loc-label-bob {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(-5px); }
}

.loc-map-label strong {
  font-size: 0.82rem;
  font-weight: 800;
  color: #0f172a;
}

.loc-map-label span {
  font-size: 0.68rem;
  color: #64748b;
  font-weight: 600;
}

/* ---- Content column (left in RTL) ---- */
.loc-content {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  text-align: right;
  opacity: 0;
  transform: perspective(1200px) translate3d(0, 30px, -60px) rotateY(8deg);
  transform-origin: left center;
  transition: opacity 0.9s ease 0.3s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
}

.location.in-view .loc-content {
  opacity: 1;
  transform: perspective(1200px) translate3d(0, 0, 0) rotateY(0deg);
}

.location-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 3px;
  width: fit-content;
  opacity: 0;
  transform: perspective(700px) translateY(20px) rotateX(20deg);
  transition: opacity 0.7s ease 0.4s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.4s;
}

.location.in-view .location-tag {
  opacity: 1;
  transform: perspective(700px) translateY(0) rotateX(0deg);
}

.location.in-view .location-title {
  animation: loc-title-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s backwards;
}

.location.in-view .location-sub {
  animation: loc-title-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.65s backwards;
}

@keyframes loc-title-in {
  from { opacity: 0; transform: perspective(700px) translateY(18px) rotateX(15deg); }
  to   { opacity: 1; transform: perspective(700px) translateY(0) rotateX(0deg); }
}

.location-title {
  font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  font-weight: 900;
  color: #0f172a;
  margin: 0.3rem 0 0;
  line-height: 1.2;
  letter-spacing: -0.5px;
}

.location-title span {
  background: linear-gradient(135deg, var(--primary), #fbbf24, var(--primary));
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: location-shimmer 4s ease-in-out infinite;
}

@keyframes location-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}

.location-sub {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
  line-height: 1.7;
}

.loc-rows {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.loc-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  /* Each row staggered 3D flip-up entrance */
  opacity: 0;
  transform: perspective(800px) translate3d(0, 18px, -40px) rotateX(15deg);
  transform-origin: right center;
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease;
  padding: 0.5rem;
  border-radius: 12px;
  margin: -0.5rem;
}

.location.in-view .loc-row {
  opacity: 1;
  transform: perspective(800px) translate3d(0, 0, 0) rotateX(0deg);
}

.location.in-view .loc-rows .loc-row:nth-child(1) { transition-delay: 0.55s; }
.location.in-view .loc-rows .loc-row:nth-child(2) { transition-delay: 0.65s; }
.location.in-view .loc-rows .loc-row:nth-child(3) { transition-delay: 0.75s; }
.location.in-view .loc-rows .loc-row:nth-child(4) { transition-delay: 0.85s; }

.loc-row:hover {
  background: rgba(var(--primary-rgb), 0.04);
  transform: perspective(700px) rotateY(-3deg) rotateX(-2deg) translateZ(8px);
}

.loc-row-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.14), rgba(var(--primary-rgb), 0.04));
  border: 1px solid rgba(var(--primary-rgb), 0.18);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  font-size: 1.05rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.12);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.loc-row:hover .loc-row-icon { transform: scale(1.08) rotate(-6deg); }

.loc-row-icon--blue {
  background: linear-gradient(135deg, rgba(var(--secondary-rgb), 0.14), rgba(var(--secondary-rgb), 0.04));
  border-color: rgba(var(--secondary-rgb), 0.2);
  color: var(--secondary);
  box-shadow: 0 4px 12px rgba(var(--secondary-rgb), 0.14);
}

.loc-row-icon--green {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.14), rgba(34, 197, 94, 0.04));
  border-color: rgba(34, 197, 94, 0.2);
  color: #16a34a;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.14);
}

.loc-row-icon--gold {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.04));
  border-color: rgba(251, 191, 36, 0.25);
  color: #d97706;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.16);
}

.loc-row-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.loc-row-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.loc-row-text strong {
  font-size: 0.95rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.4;
}

.loc-row-text a {
  text-decoration: none;
  color: inherit;
  transition: color 0.25s ease;
}

.loc-row-text a:hover strong { color: var(--primary); }

.loc-card-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 0.95rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  box-shadow: 0 8px 22px rgba(var(--primary-rgb), 0.4);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  width: fit-content;
  opacity: 0;
  transform: perspective(700px) translateY(20px) rotateX(20deg);
  animation: loc-cta-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 1s forwards;
}

@keyframes loc-cta-in {
  to { opacity: 1; transform: perspective(700px) translateY(0) rotateX(0deg); }
}

.loc-card-cta i { font-size: 0.85rem; transition: transform 0.3s ease; }

.loc-card-cta:hover {
  transform: perspective(600px) rotateX(-8deg) translateY(-3px) translateZ(12px);
  box-shadow: 0 16px 36px rgba(var(--primary-rgb), 0.55), 0 0 30px rgba(var(--primary-rgb), 0.2);
}

.loc-card-cta:hover i { transform: translateX(-4px); }

@media (max-width: 1024px) {
  .location-row { grid-template-columns: 1fr; gap: 2rem; }
  .loc-map { min-height: 320px; }
}

@media (max-width: 640px) {
  .location { padding: 4rem 1rem; }
  .location-title { font-size: 1.6rem; }
  .loc-map { min-height: 240px; }
  .loc-content { text-align: center; align-items: center; }
}

/* ═══════════════════════════════════
   TESTIMONIALS
   ═══════════════════════════════════ */
.testimonials {
  padding: 6rem 0 7rem;
  background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
  position: relative;
  overflow: hidden;
}

.testimonials-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.testimonials-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0;
  transition: opacity 1.2s ease;
}

.testimonials.in-view .testimonials-shape { opacity: 1; }

.testimonials-shape--1 {
  width: 360px; height: 360px;
  top: 5%; right: -5%;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.09) 0%, transparent 70%);
}

.testimonials-shape--2 {
  width: 320px; height: 320px;
  bottom: 5%; left: -5%;
  background: radial-gradient(circle, rgba(var(--secondary-rgb), 0.09) 0%, transparent 70%);
}

/* ---- Giant decorative quote marks ---- */
.tm-bg-quote {
  position: absolute;
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 18rem;
  font-weight: 900;
  line-height: 1;
  color: rgba(var(--primary-rgb), 0.06);
  pointer-events: none;
  user-select: none;
  opacity: 0;
  transition: opacity 1.5s ease 0.3s;
  animation: tm-quote-breathe 8s ease-in-out infinite;
}

.testimonials.in-view .tm-bg-quote { opacity: 1; }

.tm-bg-quote--tl { top: 4%; left: 4%; }
.tm-bg-quote--br {
  bottom: 4%;
  right: 4%;
  color: rgba(var(--secondary-rgb), 0.06);
  animation-delay: -4s;
}

@keyframes tm-quote-breathe {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50%      { transform: scale(1.06) rotate(-3deg); }
}

/* ---- Floating message bubbles ---- */
.tm-bg-bubble {
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--primary-rgb), 0.12);
  font-size: 0.78rem;
  font-weight: 700;
  color: #475569;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
  pointer-events: none;
  user-select: none;
  opacity: 0;
  white-space: nowrap;
  animation: tm-bubble-float 14s ease-in-out infinite;
}

.tm-bg-bubble i {
  font-size: 0.78rem;
  color: var(--primary);
}

.testimonials.in-view .tm-bg-bubble { opacity: 1; }

/* Position + per-bubble timing variation so they don't sync */
.tm-bg-bubble--1 { top: 12%; left: 6%;  animation-delay: 0s;    }
.tm-bg-bubble--2 { top: 22%; right: 8%; animation-delay: -3s;   }
.tm-bg-bubble--3 { top: 65%; left: 4%;  animation-delay: -6s;   }
.tm-bg-bubble--4 { top: 8%;  right: 28%; animation-delay: -9s;  }
.tm-bg-bubble--5 { bottom: 18%; right: 12%; animation-delay: -1.5s; }
.tm-bg-bubble--6 { bottom: 10%; left: 22%; animation-delay: -7s; }

/* Color variants */
.tm-bg-bubble--2 i,
.tm-bg-bubble--4 i { color: #fbbf24; }
.tm-bg-bubble--3 i,
.tm-bg-bubble--6 i { color: var(--secondary); }

@keyframes tm-bubble-float {
  0%, 100% { transform: translate(0, 0) rotate(-2deg); }
  25%      { transform: translate(8px, -12px) rotate(2deg); }
  50%      { transform: translate(-6px, -18px) rotate(-1deg); }
  75%      { transform: translate(4px, -8px) rotate(3deg); }
}

/* ---- Drifting stars / hearts ---- */
.tm-bg-icon {
  position: absolute;
  font-size: 1.4rem;
  pointer-events: none;
  opacity: 0;
  animation: tm-icon-drift 18s linear infinite;
}

.testimonials.in-view .tm-bg-icon { opacity: 1; }

.tm-bg-icon--star1  { top: 30%; left: 14%; color: #fbbf24; animation-delay: 0s; }
.tm-bg-icon--star2  { top: 50%; right: 6%; color: #fbbf24; animation-delay: -5s; font-size: 1rem; }
.tm-bg-icon--star3  { top: 75%; right: 22%; color: #fbbf24; animation-delay: -10s; font-size: 1.2rem; }
.tm-bg-icon--heart1 { top: 40%; left: 26%; color: #ef4444; opacity: 0.55 !important; animation-delay: -3s; font-size: 1.1rem; }
.tm-bg-icon--heart2 { bottom: 30%; right: 30%; color: #ef4444; opacity: 0.55 !important; animation-delay: -8s; font-size: 0.95rem; }

@keyframes tm-icon-drift {
  0%   { transform: translate(0, 0) rotate(0deg) scale(0.8); opacity: 0; }
  10%  { opacity: 0.7; }
  50%  { transform: translate(-15px, -40px) rotate(180deg) scale(1.1); opacity: 1; }
  90%  { opacity: 0.5; }
  100% { transform: translate(10px, -90px) rotate(360deg) scale(0.7); opacity: 0; }
}

/* ---- Header ---- */
.testimonials-header {
  text-align: center;
  max-width: 540px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.testimonials.in-view .testimonials-header {
  opacity: 1;
  transform: translateY(0);
}

.testimonials-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 3px;
}

.testimonials-title {
  font-size: 2.5rem;
  font-weight: 900;
  color: #0f172a;
  margin-top: 0.8rem;
  line-height: 1.3;
}

.testimonials-title span { color: var(--primary); }

.testimonials-sub {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  margin-top: 0.5rem;
}

/* ---- Columns wrap (gradient fade top/bottom like the shadcn mask-image trick) ---- */
.testimonials-wrap {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  max-height: 640px;
  overflow: hidden;
  position: relative;
  z-index: 1;
  padding: 0 2rem;
  perspective: 1600px;
  perspective-origin: center center;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 18%, #000 82%, transparent 100%);
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.9s ease 0.15s, transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
}

.testimonials.in-view .testimonials-wrap {
  opacity: 1;
  transform: translateY(0);
}

/* Column visibility breakpoints (mirror the shadcn hidden md:block / lg:block) */
.hide-md-down { display: none; }
.hide-lg-down { display: none; }

@media (min-width: 768px)  { .hide-md-down { display: block; } }
@media (min-width: 1024px) { .hide-lg-down { display: block; } }

@media (max-width: 640px) {
  .testimonials { padding: 4rem 0 5rem; }
  .testimonials-title { font-size: 1.7rem; }
  .testimonials-wrap { max-height: 520px; gap: 1rem; padding: 0 1rem; }
}

/* ═══════════════════════════════════
   FAQ — modern accordion, 2-column
   ═══════════════════════════════════ */
.faq {
  position: relative;
  padding: 6rem 0 7rem;
  background: linear-gradient(180deg, #fff 0%, #fafbfc 100%);
  overflow: hidden;
}

.faq-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.faq-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0;
  transition: opacity 1.4s ease;
}

.faq.in-view .faq-blob { opacity: 1; }

.faq-blob--1 {
  width: 400px;
  height: 400px;
  top: 10%;
  left: -8%;
  background: radial-gradient(circle, rgba(var(--primary-rgb), 0.08) 0%, transparent 70%);
}

.faq-blob--2 {
  width: 360px;
  height: 360px;
  bottom: 5%;
  right: -6%;
  background: radial-gradient(circle, rgba(var(--secondary-rgb), 0.08) 0%, transparent 70%);
}

.faq-container {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 4rem;
  align-items: start;
}

/* ---- Right: header column ---- */
.faq-header {
  position: sticky;
  top: 6rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  text-align: right;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.faq.in-view .faq-header {
  opacity: 1;
  transform: translateY(0);
}

.faq-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 3px;
  width: fit-content;
}

.faq-title {
  font-size: clamp(2rem, 3.6vw, 2.8rem);
  font-weight: 900;
  color: #0f172a;
  line-height: 1.25;
  margin: 0;
  letter-spacing: -0.5px;
}

.faq-title span { color: var(--primary); }

.faq-sub {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
  line-height: 1.7;
}

/* "Still have questions" card */
.faq-still {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.06), rgba(var(--primary-rgb), 0.02));
  border: 1px solid rgba(var(--primary-rgb), 0.12);
  margin-top: 0.75rem;
}

.faq-still-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  font-size: 1.05rem;
  box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.3);
}

.faq-still-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.faq-still-text strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f172a;
}

.faq-still-text a {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.faq-still-text a:hover { color: var(--primary-dark); }

/* ---- Left: accordion list ---- */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.faq-item {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  width: 100%;
  padding: 1.25rem 1.4rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  cursor: pointer;
  font-family: inherit;
  text-align: right;
  transition: border-color 0.3s ease, box-shadow 0.4s ease, background 0.3s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  opacity: 0;
  transform: translateY(20px);
}

.faq.in-view .faq-item {
  opacity: 1;
  transform: translateY(0);
  transition-delay: var(--delay, 0s);
}

.faq-item:hover {
  border-color: rgba(var(--primary-rgb), 0.3);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.06);
}

.faq-item.open {
  border-color: rgba(var(--primary-rgb), 0.45);
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.04), rgba(255, 255, 255, 1));
  box-shadow: 0 12px 28px rgba(var(--primary-rgb), 0.1);
}

/* Question row */
.faq-q {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex: 1 1 auto;
  min-width: 0;
}

.faq-q-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--primary);
  background: rgba(var(--primary-rgb), 0.1);
  width: 30px;
  height: 30px;
  border-radius: 8px;
  flex-shrink: 0;
  letter-spacing: 0.5px;
  transition: background 0.3s ease, color 0.3s ease, transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  direction: ltr;
}

.faq-item.open .faq-q-num {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  transform: scale(1.05);
}

.faq-q-text {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.4;
}

/* Toggle icon */
.faq-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f1f5f9;
  color: #64748b;
  flex-shrink: 0;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background 0.3s ease, color 0.3s ease;
  margin-left: 0.5rem;
}

.faq-icon i {
  font-size: 0.7rem;
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.faq-item:hover .faq-icon {
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
}

.faq-item.open .faq-icon {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  transform: rotate(45deg);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

/* Answer wrapper — animated height via grid trick (smooth, no JS measurement) */
.faq-a-wrap {
  display: grid;
  grid-template-rows: 0fr;
  width: 100%;
  transition: grid-template-rows 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.faq-item.open .faq-a-wrap {
  grid-template-rows: 1fr;
}

.faq-a {
  overflow: hidden;
  margin: 0;
  padding-top: 0;
  font-size: 0.92rem;
  line-height: 1.85;
  color: #475569;
  font-weight: 500;
  padding-right: calc(30px + 0.85rem);
  opacity: 0;
  transition: opacity 0.3s ease, padding-top 0.4s ease;
}

.faq-item.open .faq-a {
  opacity: 1;
  padding-top: 1rem;
}

/* ---- Responsive ---- */
@media (max-width: 1024px) {
  .faq-container {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .faq-header {
    position: static;
    text-align: center;
    align-items: center;
  }
  .faq-tag { margin: 0 auto; }
  .faq-still { align-self: center; max-width: 360px; }
}

@media (max-width: 640px) {
  .faq { padding: 4rem 0 5rem; }
  .faq-container { padding: 0 1rem; }
  .faq-title { font-size: 1.7rem; }
  .faq-item { padding: 1rem 1.15rem; }
  .faq-q-text { font-size: 0.92rem; }
  .faq-q { gap: 0.65rem; }
  .faq-a { padding-right: calc(30px + 0.65rem); font-size: 0.88rem; }
}

/* ═══════════════════════════════════
   CTA — COMPACT FULL-WIDTH BAND (joins footer)
   ═══════════════════════════════════ */
.cta {
  padding: 0;
  /* Match the card's dark navy so any sticky-footer gap blends invisibly */
  background: #0a1628;
  perspective: 1600px;
}

.cta-card {
  position: relative;
  overflow: hidden;
  border-radius: 0;
  padding: 3rem clamp(1.5rem, 5vw, 4rem);
  background:
    radial-gradient(800px 400px at 90% 0%, rgba(var(--primary-rgb), 0.18), transparent 60%),
    linear-gradient(135deg, #0a1628 0%, #0c2a4a 45%, #0e3a5f 100%);
  box-shadow:
    0 -10px 40px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  opacity: 0;
  transform: perspective(1600px) translate3d(0, 50px, -100px) rotateX(14deg);
  transform-origin: center bottom;
  transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 0.9s cubic-bezier(0.4, 0, 0.2, 1);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.cta.in-view .cta-card {
  opacity: 1;
  transform: perspective(1600px) translate3d(0, 0, 0) rotateX(0deg);
}

/* ---- Backgrounds: dot pattern + dual orbs + bottom wave accent ---- */
.cta-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1.5px);
  background-size: 22px 22px;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(135deg, #000 30%, transparent 80%);
          mask-image: linear-gradient(135deg, #000 30%, transparent 80%);
  opacity: 0;
  transition: opacity 1.2s ease 0.3s;
}

.cta.in-view .cta-pattern { opacity: 1; }

.cta-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.4s ease 0.4s;
}

.cta.in-view .cta-orb { opacity: 1; }

.cta-orb--warm {
  width: 460px;
  height: 460px;
  top: -200px;
  right: -120px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(251, 191, 36, 0.12) 50%, transparent 75%);
  animation: cta-orb-drift 14s ease-in-out infinite;
}

.cta-orb--cool {
  width: 380px;
  height: 380px;
  bottom: -160px;
  left: -100px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.28) 0%, transparent 75%);
  animation: cta-orb-drift 18s ease-in-out infinite reverse;
}

@keyframes cta-orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%      { transform: translate(-40px, 30px) scale(1.08); }
}

.cta-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.2s ease 0.5s;
}

.cta.in-view .cta-wave { opacity: 1; }

/* ---- Inner = horizontal split (right: pitch · left: actions) ---- */
.cta-inner {
  position: relative;
  z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 3rem;
  flex-wrap: wrap;
}

.cta-content {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  text-align: right;
  flex: 1 1 380px;
  min-width: 280px;
}

.cta-actions {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  align-items: flex-end;
  flex: 0 0 auto;
}

/* Staggered entrance */
.cta-title,
.cta-desc,
.cta-actions > * {
  opacity: 0;
  transform: perspective(700px) translateY(24px) rotateX(18deg);
  transform-origin: center bottom;
  transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.cta.in-view .cta-title { opacity: 1; transform: perspective(700px) translateY(0) rotateX(0deg); transition-delay: 0.25s; }
.cta.in-view .cta-desc  { opacity: 1; transform: perspective(700px) translateY(0) rotateX(0deg); transition-delay: 0.4s; }
.cta.in-view .cta-actions > *:nth-child(1) { opacity: 1; transform: perspective(700px) translateY(0) rotateX(0deg); transition-delay: 0.35s; }
.cta.in-view .cta-actions > *:nth-child(2) { opacity: 1; transform: perspective(700px) translateY(0) rotateX(0deg); transition-delay: 0.5s; }

/* ---- Title ---- */
.cta-title {
  font-size: clamp(1.6rem, 3.2vw, 2.4rem);
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  margin: 0;
  letter-spacing: -0.5px;
}

.cta-title span {
  background: linear-gradient(135deg, #fbbf24, var(--primary), #fbbf24);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: cta-title-shimmer 3.5s ease-in-out infinite;
}

@keyframes cta-title-shimmer {
  0%, 100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}

/* ---- Description (inline trust dots) ---- */
.cta-desc {
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 500;
  margin: 0;
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.cta-desc .dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.7);
  display: inline-block;
}

/* ---- Primary CTA button ---- */
.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  padding: 1rem 2.2rem;
  border-radius: 14px;
  font-weight: 800;
  font-size: 1rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  box-shadow: 0 6px 22px rgba(var(--primary-rgb), 0.45);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-btn::after {
  content: '';
  position: absolute;
  top: 0;
  left: -60%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  animation: cta-btn-shine 3s ease-in-out infinite;
}

@keyframes cta-btn-shine {
  0%, 70%, 100% { left: -60%; }
  35%           { left: 110%; }
}

.cta-btn i {
  font-size: 0.85rem;
  transition: transform 0.3s ease;
}

.cta-btn:hover {
  transform: perspective(600px) rotateX(-8deg) translateY(-3px) translateZ(12px);
  box-shadow: 0 14px 34px rgba(var(--primary-rgb), 0.6), 0 0 30px rgba(var(--primary-rgb), 0.2);
}

.cta-btn:hover i { transform: translateX(-4px); }

/* ---- Quick-contact row (WhatsApp · phone) ---- */
.cta-quick {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.82rem;
}

.cta-quick-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.25s ease, transform 0.25s ease;
}

.cta-quick-link i { font-size: 0.85rem; }

.cta-quick-link:hover {
  color: #fff;
  transform: translateY(-1px);
}

.cta-quick-link--wa:hover { color: #25d366; }

.cta-quick-sep {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

/* ---- Responsive ---- */
@media (max-width: 768px) {
  .cta { padding: 0; }

  .cta-card {
    padding: 2.5rem 1.25rem;
    border-radius: 0;
  }

  .cta-inner {
    flex-direction: column;
    align-items: stretch;
    gap: 1.75rem;
    text-align: center;
  }

  .cta-content {
    text-align: center;
    align-items: center;
  }

  .cta-discount-pill { align-self: center; }

  .cta-actions {
    align-items: center;
    width: 100%;
  }

  .cta-btn { width: 100%; max-width: 360px; }

  .cta-orb--warm { width: 340px; height: 340px; top: -140px; right: -80px; }
  .cta-orb--cool { width: 280px; height: 280px; bottom: -100px; left: -60px; }
}
</style>
