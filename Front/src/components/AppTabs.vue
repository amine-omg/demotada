<script setup lang="ts">
import { defineEmits } from 'vue';

export interface Tab {
  id: string;
  label: string;
  icon: string;
}

const props = defineProps<{
  activeTab: string;
  tabs: Tab[]; 
}>();

const emit = defineEmits(['change-tab']);

const selectTab = (tabId: string) => {
  emit('change-tab', tabId);
};
</script>

<template>
  <div class="tabs-scroll-container">
    <div
      v-for="tab in tabs"
      :key="tab.id"
      @click="selectTab(tab.id)"
      :class="['tab-block', { 'tab-block-active': activeTab === tab.id }]"
      :title="tab.label"
    >
      <div v-html="tab.icon" class="icon-container"></div>
      <span class="label">{{ tab.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.tabs-scroll-container {
  @apply flex items-center gap-2 p-1 overflow-x-auto;
  -ms-overflow-style: none;  
  scrollbar-width: none;  
}
.tabs-scroll-container::-webkit-scrollbar {
  display: none;
}

.tab-block {
  @apply flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-gray-200;
  @apply cursor-pointer transition-all duration-200 ease-in-out;
  min-width: 90px;
}

.tab-block:hover {
  background-color: #FFF1EE;
  border-color: #FFD6CC;
}

.tab-block-active {
  background-color: #FFF1EE;
  border-color: #FE8B7D;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
}

.icon-container {
  @apply w-8 h-8 flex items-center justify-center rounded-lg bg-white mb-1;
  color: #6B7280;
}

.tab-block:hover .icon-container,
.tab-block-active .icon-container {
  color: #9A3412;
}

.label {
  @apply text-xs font-medium text-gray-600;
}

.tab-block-active .label {
  color: #9A3412;
  @apply font-semibold;
}
</style>