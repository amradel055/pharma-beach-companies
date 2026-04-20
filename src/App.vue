<template>
  <RouterView v-slot="{ Component }">
    <Transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
  <ScrollToTop />
  <AppToast />

  <!-- Splash loader — forced ON for testing. Toggle `splashVisible` to false when done. -->
  <Transition name="splash-fade">
    <SplashLoader v-if="splashVisible" />
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ScrollToTop from '@/components/ui/ScrollToTop.vue'
import AppToast from '@/components/ui/AppToast.vue'
import SplashLoader from '@/components/ui/SplashLoader.vue'

// Splash shows during initial app load, then fades out once the window + its
// stylesheets/fonts have finished loading (plus a small minimum display time so
// the animation is visible on fast connections).
const splashVisible = ref(true)
const MIN_SPLASH_MS = 700

onMounted(() => {
  const mountTime = performance.now()
  const hide = () => {
    const elapsed = performance.now() - mountTime
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed)
    setTimeout(() => { splashVisible.value = false }, wait)
  }
  if (document.readyState === 'complete') {
    hide()
  } else {
    window.addEventListener('load', hide, { once: true })
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700&display=swap');

:root {
  --primary: #f97316;
  --primary-dark: #ea580c;
  --primary-darker: #c2410c;
  --primary-rgb: 249, 115, 22;

  --secondary: #0ea5e9;
  --secondary-dark: #0284c7;
  --secondary-darker: #0369a1;
  --secondary-rgb: 14, 165, 233;
}

*,
*::before,
*::after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: var(--primary) rgba(15, 23, 42, 0.04);
}

/* ---- Premium branded scrollbar ---- */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.03), rgba(15, 23, 42, 0.06));
  border-radius: 50px;
  margin: 4px 0;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%);
  border-radius: 50px;
  border: 2px solid transparent;
  background-clip: padding-box;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.15),
    0 2px 6px rgba(var(--primary-rgb), 0.35);
  transition: background 0.25s ease, box-shadow 0.25s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #fbbf24 0%, var(--primary) 60%, var(--primary-dark) 100%);
  background-clip: padding-box;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.25),
    0 4px 14px rgba(var(--primary-rgb), 0.55);
}

::-webkit-scrollbar-thumb:active {
  background: var(--primary-darker);
  background-clip: padding-box;
}

::-webkit-scrollbar-corner {
  background: transparent;
}

body {
  font-family: 'Cairo', sans-serif;
  direction: rtl;
  color: #1a1a2e;
  background: #fff;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Prevent the horizontal scrollbar flash caused by the page-transition's translateX(±20px) */
  overflow-x: clip;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Splash fade-out when the app is ready */
.splash-fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.6s;
}
.splash-fade-leave-to {
  opacity: 0;
  visibility: hidden;
}
</style>
