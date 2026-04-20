<template>
  <div :class="['tcol', className]">
    <div class="tcol-track" :style="{ '--duration': duration + 's' }">
      <!-- Rendered twice so the loop is seamless (the -50% translation lands exactly on the start of the second copy) -->
      <template v-for="copy in 2" :key="copy">
        <div v-for="(t, i) in testimonials" :key="`${copy}-${i}`" class="tcard">
          <p class="tcard-text">{{ t.text }}</p>
          <div class="tcard-meta">
            <img :src="t.image" :alt="t.name" class="tcard-avatar" loading="lazy" />
            <div class="tcard-info">
              <div class="tcard-name">{{ t.name }}</div>
              <div class="tcard-role">{{ t.role }}</div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
  className: { type: String, default: '' },
  testimonials: { type: Array, required: true },
  duration: { type: Number, default: 15 },
})
</script>

<style scoped>
.tcol {
  position: relative;
  /* Clip only top/bottom (so marquee loop stays hidden) but allow cards to extend
     horizontally on 3D hover without being cut off. */
  overflow: visible;
  clip-path: inset(0 -50% 0 -50%);
  perspective: 1000px;
  perspective-origin: center center;
  padding: 0 12px;
}

.tcol-track {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 1.5rem;
  animation: tcol-scroll var(--duration, 15s) linear infinite;
  will-change: transform;
  transform-style: preserve-3d;
}

.tcol:hover .tcol-track {
  animation-play-state: paused;
}

@keyframes tcol-scroll {
  from { transform: translateY(0); }
  to   { transform: translateY(-50%); }
}

.tcard {
  padding: 2rem 1.75rem;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow:
    0 4px 20px rgba(var(--primary-rgb, 249, 115, 22), 0.08),
    0 1px 3px rgba(15, 23, 42, 0.04);
  width: 100%;
  max-width: 20rem;
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.45s ease, border-color 0.35s ease;
  transform: perspective(900px) rotateY(0deg) rotateX(0deg) translateZ(0);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  will-change: transform;
}

.tcard:hover {
  transform: perspective(1200px) rotateY(-5deg) rotateX(3deg) translateZ(20px);
  border-color: rgba(var(--primary-rgb, 249, 115, 22), 0.4);
  box-shadow:
    0 22px 44px rgba(15, 23, 42, 0.15),
    0 0 28px rgba(var(--primary-rgb, 249, 115, 22), 0.18);
}

/* When the column is RTL (Arabic) the tilt should mirror so cards still tip "outward toward viewer" */
:dir(rtl) .tcard:hover,
[dir="rtl"] .tcard:hover {
  transform: perspective(1200px) rotateY(5deg) rotateX(3deg) translateZ(20px);
}

.tcard-text {
  color: #334155;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.75;
  margin: 0;
}

.tcard-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  margin-top: 1.25rem;
}

.tcard-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.tcard:hover .tcard-avatar {
  transform: rotateY(360deg) scale(1.08);
}

.tcard-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tcard-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.25;
}

.tcard-role {
  font-size: 0.78rem;
  color: #64748b;
  line-height: 1.3;
  margin-top: 2px;
}
</style>
