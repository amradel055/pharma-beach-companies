<template>
  <div
    class="gooey-loader-wrap"
    role="status"
    aria-label="Loading"
    :style="cssVars"
  >
    <!-- SVG filter that creates the gooey effect -->
    <svg class="gooey-svg" aria-hidden="true" focusable="false">
      <defs>
        <filter :id="filterId">
          <feGaussianBlur in="SourceGraphic" :stdDeviation="blur" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 48 -7"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>

    <!-- The loader bar — blobs animate behind the mask -->
    <div class="gooey-loader" :style="{ filter: `url(#${filterId})` }"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  primaryColor: { type: String, default: 'var(--primary, #f97316)' },
  secondaryColor: { type: String, default: 'var(--secondary, #0ea5e9)' },
  borderColor: { type: String, default: '#e2e8f0' },
  blur: { type: Number, default: 12 },
})

// Unique filter id so multiple instances don't collide
const filterId = `gooey-loader-${Math.random().toString(36).slice(2, 9)}`

const cssVars = computed(() => ({
  '--gooey-primary': props.primaryColor,
  '--gooey-secondary': props.secondaryColor,
  '--gooey-border': props.borderColor,
}))
</script>

<style scoped>
.gooey-loader-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.gooey-svg {
  position: absolute;
  width: 0;
  height: 0;
}

.gooey-loader {
  width: 12em;
  height: 3em;
  position: relative;
  overflow: hidden;
  border-bottom: 8px solid var(--gooey-border);
}

.gooey-loader::before,
.gooey-loader::after {
  content: '';
  position: absolute;
  border-radius: 50%;
}

.gooey-loader::before {
  width: 22em;
  height: 18em;
  background-color: var(--gooey-primary);
  left: -2em;
  bottom: -18em;
  animation: gooey-wee1 2s linear infinite;
}

.gooey-loader::after {
  width: 16em;
  height: 12em;
  background-color: var(--gooey-secondary);
  left: -4em;
  bottom: -12em;
  animation: gooey-wee2 2s linear infinite 0.75s;
}

@keyframes gooey-wee1 {
  0%   { transform: translateX(-10em) rotate(0deg); }
  100% { transform: translateX(7em)   rotate(180deg); }
}

@keyframes gooey-wee2 {
  0%   { transform: translateX(-8em) rotate(0deg); }
  100% { transform: translateX(8em)  rotate(180deg); }
}
</style>
