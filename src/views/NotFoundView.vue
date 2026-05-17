<template>
  <div class="nf" ref="rootRef" @pointermove="onParallax">
    <!-- ambient layers -->
    <div class="nf-aurora" :style="auroraStyle" aria-hidden="true">
      <span class="nf-orb nf-orb--a"></span>
      <span class="nf-orb nf-orb--b"></span>
      <span class="nf-orb nf-orb--c"></span>
    </div>
    <div class="nf-grid" aria-hidden="true"></div>
    <div class="nf-dust" :style="dustStyle" aria-hidden="true">
      <span v-for="n in 14" :key="n" class="nf-spark" :style="sparkStyle(n)"></span>
    </div>

    <div class="nf-stage">
      <div class="nf-404" aria-hidden="true">
        <span class="nf-d" style="--i: 0">4</span>
        <span class="nf-ring" style="--i: 1">
          <span class="nf-ring-core"><i class="pi pi-compass" /></span>
        </span>
        <span class="nf-d" style="--i: 2">4</span>
      </div>

      <h1 class="nf-title" style="--i: 3">الصفحة غير موجودة</h1>
      <p class="nf-desc" style="--i: 4">
        يبدو أنك ابتعدت عن المسار — الرابط غير صحيح أو تم نقله.
      </p>

      <div class="nf-actions" style="--i: 5">
        <button class="nf-btn nf-btn--primary" @click="goHome">
          <i class="pi pi-home" />
          العودة للرئيسية
        </button>
        <button class="nf-btn nf-btn--ghost" @click="goBack">
          <i class="pi pi-arrow-right" />
          رجوع
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rootRef = ref(null)

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
const fine = window.matchMedia('(hover: hover) and (pointer: fine)')

const mx = ref(0)
const my = ref(0)
let raf = null
function onParallax(e) {
  if (reduce.matches || !fine.matches) return
  const nx = e.clientX / window.innerWidth - 0.5
  const ny = e.clientY / window.innerHeight - 0.5
  if (raf) cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => { mx.value = nx; my.value = ny })
}
const auroraStyle = computed(() => ({
  transform: `translate3d(${mx.value * -34}px, ${my.value * -34}px, 0)`,
}))
const dustStyle = computed(() => ({
  transform: `translate3d(${mx.value * 22}px, ${my.value * 22}px, 0)`,
}))

const sparkStyle = (n) => {
  const seeds = [
    { x: 10, y: 18, s: 3, d: 13, dl: 0 }, { x: 84, y: 12, s: 2, d: 17, dl: 2 },
    { x: 70, y: 78, s: 4, d: 15, dl: 4 }, { x: 22, y: 84, s: 2, d: 19, dl: 1 },
    { x: 46, y: 28, s: 3, d: 21, dl: 6 }, { x: 90, y: 48, s: 2, d: 14, dl: 3 },
    { x: 16, y: 52, s: 3, d: 18, dl: 8 }, { x: 60, y: 90, s: 2, d: 16, dl: 5 },
    { x: 34, y: 14, s: 2, d: 20, dl: 7 }, { x: 78, y: 62, s: 3, d: 12, dl: 9 },
    { x: 52, y: 50, s: 2, d: 23, dl: 10 }, { x: 6, y: 36, s: 2, d: 15, dl: 11 },
    { x: 40, y: 70, s: 3, d: 17, dl: 6 }, { x: 94, y: 80, s: 2, d: 19, dl: 2 },
  ]
  const p = seeds[(n - 1) % seeds.length]
  return {
    left: p.x + '%', top: p.y + '%', width: p.s + 'px', height: p.s + 'px',
    animationDuration: p.d + 's', animationDelay: p.dl + 's',
  }
}

function goHome() { router.push('/') }
function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

onBeforeUnmount(() => { if (raf) cancelAnimationFrame(raf) })
</script>

<style scoped>
.nf {
  position: fixed;
  inset: 0;
  direction: rtl;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 28%, #fff7ed 0%, #fffaf4 50%, #f1f5f9 100%);
}

/* ── Ambient ── */
.nf-aurora { position: absolute; inset: 0; will-change: transform; }
.nf-orb { position: absolute; border-radius: 50%; filter: blur(90px); }
.nf-orb--a { width: 46vw; height: 46vw; top: -12%; inset-inline-end: -8%; background: rgba(249, 115, 22, 0.18); animation: nf-drift1 18s ease-in-out infinite alternate; }
.nf-orb--b { width: 40vw; height: 40vw; bottom: -14%; inset-inline-start: -10%; background: rgba(251, 191, 36, 0.18); animation: nf-drift2 22s ease-in-out infinite alternate; }
.nf-orb--c { width: 30vw; height: 30vw; top: 40%; inset-inline-start: 30%; background: rgba(245, 158, 11, 0.12); animation: nf-drift3 26s ease-in-out infinite alternate; }
@keyframes nf-drift1 { to { transform: translate(40px, 30px) scale(1.12); } }
@keyframes nf-drift2 { to { transform: translate(-36px, -24px) scale(1.1); } }
@keyframes nf-drift3 { to { transform: translate(28px, -32px) scale(1.15); } }

.nf-grid {
  position: absolute;
  inset: -2px;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.045) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at 50% 45%, #000 0%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse at 50% 45%, #000 0%, transparent 72%);
}

.nf-dust { position: absolute; inset: 0; will-change: transform; }
.nf-spark {
  position: absolute;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.55);
  box-shadow: 0 0 7px rgba(251, 191, 36, 0.5);
  opacity: 0;
  animation: nf-spark-float ease-in-out infinite;
}
@keyframes nf-spark-float {
  0% { opacity: 0; transform: translateY(0) scale(1); }
  15% { opacity: 1; }
  50% { transform: translateY(-46px) scale(1.25); }
  85% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-92px) scale(0.6); }
}

/* ── Content ── */
.nf-stage {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 24px;
  max-width: 560px;
}

.nf-404 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(8px, 2vw, 20px);
  margin-bottom: 18px;
}
.nf-d,
.nf-ring {
  opacity: 0;
  animation: nf-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: calc(var(--i) * 90ms + 80ms);
}
.nf-d {
  font-size: clamp(96px, 19vw, 184px);
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(135deg, #fdba74, #f97316 45%, #fbbf24);
  background-size: 220% 220%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: nf-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    nf-sheen 5s ease-in-out infinite;
  filter: drop-shadow(0 12px 30px rgba(234, 88, 12, 0.4));
}
@keyframes nf-sheen {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* The middle "0" → spinning conic ring with a compass core */
.nf-ring {
  position: relative;
  width: clamp(86px, 17vw, 168px);
  height: clamp(86px, 17vw, 168px);
  border-radius: 50%;
  background: conic-gradient(from 0deg, #fb923c, #fbbf24, #ea580c, #f59e0b, #fb923c);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 11px), #000 calc(100% - 10px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 11px), #000 calc(100% - 10px));
  filter: drop-shadow(0 0 18px rgba(249, 115, 22, 0.45));
  animation: nf-pop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
    nf-spin 5.5s linear infinite;
}
@keyframes nf-spin { to { transform: rotate(360deg); } }
.nf-ring-core {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ea580c;
  /* counter-spin so the icon stays upright */
  animation: nf-spin-rev 5.5s linear infinite;
}
.nf-ring-core i {
  font-size: clamp(26px, 5vw, 46px);
  filter: drop-shadow(0 3px 8px rgba(234, 88, 12, 0.3));
  animation: nf-pulse 2.6s ease-in-out infinite;
}
@keyframes nf-spin-rev { to { transform: rotate(-360deg); } }
@keyframes nf-pulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.12); opacity: 1; }
}

.nf-title,
.nf-desc,
.nf-actions {
  opacity: 0;
  animation: nf-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i) * 90ms + 80ms);
}
.nf-title {
  font-size: clamp(20px, 3.4vw, 28px);
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}
.nf-desc {
  font-size: 14.5px;
  line-height: 1.75;
  color: #64748b;
  margin: 0 0 30px;
}

.nf-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}
.nf-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 13px 26px;
  border-radius: 12px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
}
.nf-btn i { font-size: 13px; }
.nf-btn--primary {
  border: none;
  background: linear-gradient(135deg, #fb923c, #ea580c);
  color: #fff;
  box-shadow: 0 8px 22px rgba(234, 88, 12, 0.45);
}
.nf-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(234, 88, 12, 0.55);
}
.nf-btn--ghost {
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #475569;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}
.nf-btn--ghost:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}
.nf-btn:active { transform: translateY(0) scale(0.97); }

@keyframes nf-pop {
  0% { opacity: 0; transform: translateY(18px) scale(0.7); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes nf-rise {
  to { opacity: 1; transform: translateY(0); }
}
.nf-title { transform: translateY(14px); }
.nf-desc { transform: translateY(14px); }
.nf-actions { transform: translateY(14px); }

@media (prefers-reduced-motion: reduce) {
  .nf-orb, .nf-spark, .nf-d, .nf-ring, .nf-ring-core, .nf-ring-core i { animation: none; }
  .nf-d, .nf-ring, .nf-title, .nf-desc, .nf-actions { opacity: 1; transform: none; }
  .nf-spark { display: none; }
  .nf-aurora, .nf-dust { transform: none !important; }
}

@media (max-width: 480px) {
  .nf-btn { flex: 1; justify-content: center; }
}
</style>
