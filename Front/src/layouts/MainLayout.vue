<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import TheSidebar from '../components/TheSidebar.vue';
import MobileBottomNav from '../components/MobileBottomNav.vue';

const isSidebarCollapsed = ref(window.innerWidth < 768);

const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);

const handleResize = () => {
  windowWidth.value = window.innerWidth;
  if (window.innerWidth < 768) {
    isSidebarCollapsed.value = true;
  }
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="relative min-h-screen flex pb-16 md:pb-0">

    <TheSidebar v-if="!isMobile" v-model="isSidebarCollapsed" />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ease-in-out"
      :class="{
        'ml-64': !isSidebarCollapsed && !isMobile,
        'ml-20': isSidebarCollapsed && !isMobile,
        'ml-0': isMobile
      }"
    >
      <RouterView />
    </div>
    
    <MobileBottomNav v-if="isMobile" />
  </div>
</template>