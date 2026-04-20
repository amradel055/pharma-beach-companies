<template>
  <div class="main-layout">
    <TheHeader />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade-slide" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter />

    <Transition name="promo-pop">
      <div v-show="showPromo" class="promo-bar">
      <div class="promo-text">
        <span class="promo-dot" />
        <span>عروض حصرية متاحة الآن</span>
      </div>
      <RouterLink to="/booking" class="promo-btn">احجز الان</RouterLink>
    </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'

const showPromo = ref(false)

function onScroll() {
  const scrolled = window.scrollY
  const viewportBottom = scrolled + window.innerHeight
  const pageHeight = document.documentElement.scrollHeight
  const nearBottom = viewportBottom >= pageHeight - 120
  showPromo.value = scrolled > 100 && !nearBottom
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
}

.promo-bar {
  position: fixed;
  bottom: 1.25rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% - 2.5rem);
  max-width: 720px;
  padding: 0.65rem 0.65rem 0.65rem 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-radius: 50px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.promo-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #334155;
  font-size: 0.9rem;
  font-weight: 600;
}

.promo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
}

.promo-btn {
  padding: 0.6rem 1.8rem;
  border-radius: 50px;
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  transition: all 0.25s ease;
  box-shadow: 0 2px 12px rgba(var(--primary-rgb), 0.35);
  white-space: nowrap;
  animation: btn-nudge 3s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.promo-btn::after {
  content: '';
  position: absolute;
  top: 0;
  right: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btn-shine 3s ease-in-out infinite;
}

@keyframes btn-nudge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

@keyframes btn-shine {
  0%, 60%, 100% { right: -100%; }
  30% { right: 120%; }
}

.promo-btn:hover {
  background: linear-gradient(135deg, var(--primary-dark), var(--primary-darker));
  box-shadow: 0 4px 20px rgba(var(--primary-rgb), 0.5);
  animation: none;
  transform: scale(1.05);
}

.promo-btn:hover::after {
  animation: none;
  opacity: 0;
}

.promo-pop-enter-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.promo-pop-leave-active {
  transition: all 0.3s ease-in;
}

.promo-pop-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(100%);
}

.promo-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(30px);
}

@media (max-width: 640px) {
  .promo-bar {
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    bottom: 0.75rem;
  }

  .promo-text {
    font-size: 0.8rem;
  }

  .promo-btn {
    font-size: 0.8rem;
    padding: 0.5rem 1.2rem;
  }
}
</style>
