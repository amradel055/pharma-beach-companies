<template>
  <div class="icon-picker">
    <input
      v-model="search"
      type="text"
      class="icon-search"
      placeholder="بحث عن أيقونة..."
      dir="rtl"
    />
    <div class="icon-grid">
      <button
        v-for="icon in filtered"
        :key="icon"
        type="button"
        class="icon-box"
        :class="{ selected: modelValue === 'pi ' + icon }"
        @click="$emit('update:modelValue', 'pi ' + icon)"
        :title="icon"
      >
        <i :class="'pi ' + icon" />
        <span class="icon-name">{{ icon.replace('pi-', '') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])

const ICONS = [
  'pi-wifi', 'pi-car', 'pi-sun', 'pi-heart', 'pi-home',
  'pi-star', 'pi-flag', 'pi-bolt', 'pi-shield', 'pi-phone',
  'pi-camera', 'pi-globe', 'pi-map', 'pi-bell', 'pi-cloud',
  'pi-gift', 'pi-key', 'pi-lock', 'pi-palette', 'pi-pencil',
  'pi-print', 'pi-shopping-cart', 'pi-trophy', 'pi-umbrella', 'pi-video',
  'pi-volume-up', 'pi-wrench', 'pi-eye', 'pi-fire', 'pi-sparkles',
]

const search = ref('')

const filtered = computed(() => {
  if (!search.value.trim()) return ICONS
  const q = search.value.trim().toLowerCase()
  return ICONS.filter((i) => i.includes(q))
})
</script>

<style scoped>
.icon-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.icon-search {
  height: 38px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  color: #1e293b;
  background: #fafbfc;
  outline: none;
  transition: all 0.2s;
}

.icon-search:focus {
  border-color: #f97316;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08);
}

.icon-search::placeholder {
  color: #94a3b8;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 6px;
  max-height: 240px;
  overflow-y: auto;
}

.icon-box {
  width: 48px;
  height: 56px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.15s;
  padding: 4px 2px;
}

.icon-box:hover {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.04);
}

.icon-box.selected {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.08);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.15);
}

.icon-box i {
  font-size: 18px;
  color: #475569;
}

.icon-box.selected i {
  color: #f97316;
}

.icon-name {
  font-size: 8px;
  color: #94a3b8;
  line-height: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  text-align: center;
}
</style>
