<template>
  <div class="sl" role="status" aria-label="Loading">
    <!-- Layered background: rotating soft rays → radial spotlight → mesh blobs →
         faint dot pattern → grain → edge vignette -->
    <div class="sl-mesh">
      <div class="sl-mesh__rays" />
      <div class="sl-mesh__spotlight" />
      <div class="sl-mesh__blob sl-mesh__blob--a" />
      <div class="sl-mesh__blob sl-mesh__blob--b" />
      <div class="sl-mesh__blob sl-mesh__blob--c" />
      <div class="sl-mesh__blob sl-mesh__blob--d" />
      <div class="sl-mesh__dots" />
      <div class="sl-mesh__noise" />
      <div class="sl-mesh__vignette" />
    </div>

    <!-- Floating particles -->
    <div class="sl-particles">
      <span v-for="n in 14" :key="n" class="sl-particle" :style="particleStyle(n)" />
    </div>

    <!-- Centered gradient-tail spinner — modern premium loader (Stripe/Linear-style)
         with a pulsing halo behind it for depth. -->
    <div class="sl-loader" aria-hidden="true">
      <span class="sl-halo" />
      <span class="sl-tail" />
    </div>
  </div>
</template>

<script setup>
const particleStyle = (n) => {
  const seeds = [
    { x: 6,  y: 14, s: 3, dur: 14, del: 0 },   { x: 88, y: 10, s: 2, dur: 18, del: 2 },
    { x: 72, y: 78, s: 4, dur: 16, del: 5 },   { x: 22, y: 88, s: 2, dur: 20, del: 1 },
    { x: 48, y: 32, s: 3, dur: 22, del: 7 },   { x: 92, y: 48, s: 2, dur: 15, del: 3 },
    { x: 15, y: 58, s: 3, dur: 19, del: 9 },   { x: 62, y: 92, s: 2, dur: 17, del: 4 },
    { x: 36, y: 18, s: 2, dur: 21, del: 6 },   { x: 78, y: 62, s: 3, dur: 13, del: 8 },
    { x: 52, y: 52, s: 2, dur: 24, del: 10 },  { x: 8,  y: 38, s: 2, dur: 16, del: 11 },
    { x: 40, y: 70, s: 3, dur: 12, del: 2 },   { x: 82, y: 28, s: 2, dur: 19, del: 6 },
  ]
  const p = seeds[(n - 1) % seeds.length]
  return {
    left: p.x + '%', top: p.y + '%',
    width: p.s + 'px', height: p.s + 'px',
    animationDuration: p.dur + 's', animationDelay: p.del + 's',
  }
}
</script>

<style scoped>
/* ══════════════════════ FULL-SCREEN SPLASH LOADER ══════════════════════ */
.sl {
  position: fixed;
  inset: 0;
  z-index: 99999;
  overflow: hidden;
  direction: rtl;
  font-family: 'Cairo', sans-serif;
}

/* ── Light premium mesh background (dialed down — warmer, less bright) ── */
.sl-mesh {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    radial-gradient(ellipse 80% 60% at 50% 40%, #f4ead9 0%, #ecdec6 50%, #e2d0ae 100%),
    linear-gradient(135deg, #f1e6d1 0%, #e9dbbe 100%);
}

/* Rotating soft light rays — conic gradient creates a sunburst feel behind the loader */
.sl-mesh__rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 140vmax;
  height: 140vmax;
  transform: translate(-50%, -50%);
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(251, 191, 36, 0.08) 18deg,
    transparent 36deg,
    transparent 90deg,
    rgba(249, 115, 22, 0.06) 108deg,
    transparent 126deg,
    transparent 180deg,
    rgba(251, 191, 36, 0.08) 198deg,
    transparent 216deg,
    transparent 270deg,
    rgba(249, 115, 22, 0.06) 288deg,
    transparent 306deg,
    transparent 360deg
  );
  animation: sl-rays-spin 60s linear infinite;
  filter: blur(4px);
  pointer-events: none;
}
@keyframes sl-rays-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }

/* Soft spotlight glow — toned down so it doesn't bleach out the center */
.sl-mesh__spotlight {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60vmax;
  height: 60vmax;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.05) 35%, transparent 65%);
  animation: sl-spotlight-breathe 5s ease-in-out infinite;
  pointer-events: none;
}
@keyframes sl-spotlight-breathe {
  0%, 100% { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.9; transform: translate(-50%, -50%) scale(1.06); }
}

/* Blobs — warmer base, lower opacity overall */
.sl-mesh__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(110px);
  pointer-events: none;
}
.sl-mesh__blob--a { width: 60%; height: 60%; top: -12%; left: -10%;   background: #c2410c; opacity: 0.14; animation: sl-m1 18s ease-in-out infinite alternate; }
.sl-mesh__blob--b { width: 50%; height: 50%; bottom: -8%; right: -8%; background: #d97706; opacity: 0.18; animation: sl-m2 15s ease-in-out infinite alternate; }
.sl-mesh__blob--c { width: 42%; height: 42%; top: 38%; left: 38%;     background: #ca8a04; opacity: 0.1;  animation: sl-m3 20s ease-in-out infinite alternate; }
.sl-mesh__blob--d { width: 38%; height: 38%; top: 10%; right: 12%;    background: #9a3412; opacity: 0.1;  animation: sl-m4 22s ease-in-out infinite alternate; }

@keyframes sl-m1 { from { transform: translate(0, 0)  scale(1); } to { transform: translate(70px, 50px)   scale(1.18); } }
@keyframes sl-m2 { from { transform: translate(0, 0)  scale(1); } to { transform: translate(-55px, -35px) scale(1.12); } }
@keyframes sl-m3 { from { transform: translate(0, 0)  scale(1); } to { transform: translate(45px, -60px)  scale(1.22); } }
@keyframes sl-m4 { from { transform: translate(0, 0)  scale(1); } to { transform: translate(-40px, 45px)  scale(1.1);  } }

/* Faint dot-grid texture — adds structure without dominating */
.sl-mesh__dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(249, 115, 22, 0.18) 1px, transparent 1.5px);
  background-size: 28px 28px;
  opacity: 0.35;
  mask: radial-gradient(ellipse at center, #000 20%, transparent 75%);
  -webkit-mask: radial-gradient(ellipse at center, #000 20%, transparent 75%);
  pointer-events: none;
}

.sl-mesh__noise {
  position: absolute;
  inset: 0;
  opacity: 0.04;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
  pointer-events: none;
}

/* Edge vignette — deeper so the warm cream doesn't feel washed out at the corners */
.sl-mesh__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(69, 26, 3, 0.22) 100%);
  pointer-events: none;
}

/* ── Particles ── */
.sl-particles {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
.sl-particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(249, 115, 22, 0.3);
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.25);
  opacity: 0;
  animation: sl-particle-float ease-in-out infinite;
}
@keyframes sl-particle-float {
  0%   { opacity: 0; transform: translateY(0) translateX(0) scale(1); }
  15%  { opacity: 1; }
  50%  { transform: translateY(-70px) translateX(20px) scale(1.3); }
  85%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-140px) translateX(-15px) scale(0.6); }
}

/* ══════════════════════ GRADIENT TAIL SPINNER ══════════════════════
   A single conic-gradient arc that rotates, with a fading tail — the kind of
   modern loader used by Stripe / Linear / Vercel. Plus a soft breathing halo
   behind it for extra polish. */
.sl-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  width: 72px;
  height: 72px;
  filter: drop-shadow(0 8px 24px rgba(249, 115, 22, 0.25));
}

/* Outer breathing halo — soft blurred glow that pulses in brand color */
.sl-halo {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.25) 0%, transparent 65%);
  animation: sl-halo-pulse 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
}
@keyframes sl-halo-pulse {
  0%, 100% { transform: scale(0.85); opacity: 0.6; }
  50%      { transform: scale(1.1);  opacity: 1;   }
}

/* The main spinner — conic gradient tail on a ring, fast continuous rotation */
.sl-tail {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    transparent 120deg,
    rgba(251, 191, 36, 0.15) 160deg,
    rgba(251, 191, 36, 0.55) 220deg,
    #fbbf24 280deg,
    #f97316 340deg,
    #ea580c 360deg
  );
  /* Mask to a thin 4px-wide donut */
  -webkit-mask: radial-gradient(circle, transparent 43%, #000 45%, #000 50%, transparent 52%);
          mask: radial-gradient(circle, transparent 43%, #000 45%, #000 50%, transparent 52%);
  animation: sl-tail-spin 0.9s linear infinite;
}
@keyframes sl-tail-spin {
  to { transform: rotate(360deg); }
}

/* ══════════════════════ RESPONSIVE ══════════════════════ */
@media (max-width: 900px) {
  .sl-loader { width: 60px; height: 60px; }
}
</style>
