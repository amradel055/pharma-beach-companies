<template>
  <div v-if="show" class="pagination">
    <div class="pagination-info">
      عرض {{ rangeFrom }} – {{ rangeTo }} من {{ total }}
    </div>
    <div class="pagination-controls">
      <button
        class="page-btn nav"
        :disabled="currentPage === 1"
        aria-label="السابق"
        @click="go(currentPage - 1)"
      >
        <i class="pi pi-chevron-right" />
      </button>

      <button v-if="pageWindow[0] > 1" class="page-btn" @click="go(1)">1</button>
      <span v-if="pageWindow[0] > 2" class="page-ellipsis">…</span>

      <button
        v-for="p in pageWindow"
        :key="p"
        :class="['page-btn', { active: p === currentPage }]"
        @click="go(p)"
      >{{ p }}</button>

      <span v-if="pageWindow[pageWindow.length - 1] < lastPage - 1" class="page-ellipsis">…</span>
      <button
        v-if="pageWindow[pageWindow.length - 1] < lastPage"
        class="page-btn"
        @click="go(lastPage)"
      >{{ lastPage }}</button>

      <button
        class="page-btn nav"
        :disabled="currentPage === lastPage"
        aria-label="التالي"
        @click="go(currentPage + 1)"
      >
        <i class="pi pi-chevron-left" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, default: 1 },
  lastPage: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  rangeFrom: { type: Number, default: 0 },
  rangeTo: { type: Number, default: 0 },
  // Hide entirely when there's only a single page (matches prior behaviour).
  hideSinglePage: { type: Boolean, default: true },
})
const emit = defineEmits(['change'])

const show = computed(() => {
  if (props.total <= 0) return false
  if (props.hideSinglePage && props.lastPage <= 1) return false
  return true
})

// Sliding window of ±2 around the current page (1-based).
const pageWindow = computed(() => {
  const last = props.lastPage
  const cur = props.currentPage
  const span = 2
  let start = Math.max(1, cur - span)
  let end = Math.min(last, cur + span)
  if (end - start < span * 2) {
    if (start === 1) end = Math.min(last, start + span * 2)
    else if (end === last) start = Math.max(1, end - span * 2)
  }
  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function go(p) {
  if (p < 1 || p > props.lastPage || p === props.currentPage) return
  emit('change', p)
}
</script>
