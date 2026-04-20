<template>
  <div class="sl" role="status" aria-label="Loading">
    <!-- Mesh blobs + grain -->
    <div class="sl-mesh">
      <div class="sl-mesh__blob sl-mesh__blob--a" />
      <div class="sl-mesh__blob sl-mesh__blob--b" />
      <div class="sl-mesh__blob sl-mesh__blob--c" />
      <div class="sl-mesh__noise" />
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

/* ── Light mesh background ── */
.sl-mesh {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, #ffffff 0%, #fdf6ef 55%, #fff8ee 100%);
}
.sl-mesh__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
}
.sl-mesh__blob--a { width: 55%; height: 55%; top: -10%; left: -8%; background: #f97316; opacity: 0.18; animation: sl-m1 16s ease-in-out infinite alternate; }
.sl-mesh__blob--b { width: 45%; height: 45%; bottom: -5%; right: -5%; background: #fbbf24; opacity: 0.22; animation: sl-m2 14s ease-in-out infinite alternate; }
.sl-mesh__blob--c { width: 40%; height: 40%; top: 40%; left: 40%; background: #fcd34d; opacity: 0.14; animation: sl-m3 18s ease-in-out infinite alternate; }
.sl-mesh__noise {
  position: absolute;
  inset: 0;
  opacity: 0.035;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
}

@keyframes sl-m1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(60px, 40px) scale(1.15); } }
@keyframes sl-m2 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-50px, -30px) scale(1.1); } }
@keyframes sl-m3 { from { transform: translate(0, 0) scale(1); } to { transform: translate(40px, -50px) scale(1.2); } }

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
