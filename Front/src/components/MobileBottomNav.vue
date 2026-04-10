<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';
import { mobileMenus } from '../config/mobileMenuConfig';

const userStore = useUserStore();
const route = useRoute();

const currentMenu = computed(() => {
  const role = userStore.userRole;
  return mobileMenus[role] || mobileMenus.default;
});

const isRouteActive = (path: string) => {
  if (path === '/dashboard') {
    return route.path === path;
  }
  return route.path.startsWith(path);
};
</script>

<template>
  <nav class="mobile-bottom-nav">
    <div class="flex justify-around items-center h-20">
      <router-link v-for="item in currentMenu" :key="item.label" :to="item.to" class="nav-item">
        
        <div class="icon-background">
          <span v-if="item.icon.startsWith('<svg')" v-html="item.icon"></span>
          <i v-else :class="[item.icon, 'icon-style']"></i>
        </div>
        
        <span class="label-style">{{ item.label }}</span>

      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav {
  @apply md:hidden fixed bottom-0 left-0 right-0 z-40;
  background-color: #DCD8F4;
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  box-shadow: 0 -20px S15px rgba(0, 0, 0, 0.25);
}

.nav-item {
  @apply flex flex-col items-center justify-center text-center;
  flex: 1; 
}

.icon-background {
  @apply w-10 h-10 rounded-full flex items-center justify-center mb-1;
  background-color: #B2E9E1;
}

.icon-style {
  font-size: 20px; 
  color: #464279;
}

.icon-background > span > svg {
  width: 22px;
  height: 22px;
  fill: #464279;
}

.label-style {
  color: #322F55;
  font-size: 12px; 
  font-weight: 500;
}
</style>