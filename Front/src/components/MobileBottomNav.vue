<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/user';

const route = useRoute();
const userStore = useUserStore();

// --- On reprend EXACTEMENT les mêmes liens que TheSidebar.vue ---
const navigationLinks = computed(() => {
  const links = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      show: userStore.isAuthenticated
    },
    {
      name: 'Pipeline',
      to: '/pipeline',
      icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2',
      show: true
    },
    {
      name: 'Créa Dossier', // Raccourci pour mobile
      to: '/demo-cee',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      show: true
    },
    {
      name: 'Générer AH', // Raccourci pour mobile
      to: '/demo-ah',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      show: true
    },
    {
      name: 'Export PNCEE',
      to: '/emmy-index', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
      show: true
    },
    {
      name: 'Liasses', // Raccourci pour mobile
      to: '/liasses',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      show: true
    },
    {
      name: 'Audit Fiscal',
      to: '/fiscal',
      icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
      show: true
    },
    {
      name: 'Obligé', // Raccourci pour mobile
      to: '/portail-oblige',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      show: true
    },
    {
      name: 'Clients PRO',
      to: '/entreprises',
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      show: true
    },
    {
      name: 'Tarifs', // Raccourci pour mobile
      to: '/admin/tarifs',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      show: true // Ou userStore.userRole === 'admin'
    }
  ];
  return links.filter(link => link.show);
});
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-white/5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)]">
    
    <div class="flex overflow-x-auto items-center px-3 py-2 gap-1 hide-scrollbar snap-x snap-mandatory">
      
      <router-link
        v-for="link in navigationLinks"
        :key="link.to"
        :to="link.to"
        class="snap-start flex-shrink-0 flex flex-col items-center justify-center w-[76px] h-[60px] rounded-[1rem] transition-all duration-200 relative group"
        :class="[
          $route.path === link.to 
            ? 'bg-[#E5E5D1]/10 text-white' 
            : 'text-slate-500 hover:text-white hover:bg-white/5'
        ]"
      >
        <div 
          v-if="$route.path === link.to" 
          class="absolute top-1 w-1 h-1 bg-[#E5E5D1] rounded-full shadow-[0_0_8px_rgba(229,229,209,0.8)]"
        ></div>

        <svg 
          class="w-6 h-6 mb-1 transition-colors duration-200" 
          :class="$route.path === link.to ? 'text-[#E5E5D1] mt-2' : 'text-slate-500 group-hover:text-white'"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" :d="link.icon" />
        </svg>

        <span 
          class="text-[9px] font-bold uppercase tracking-widest text-center leading-none w-full px-1 truncate"
          :class="$route.path === link.to ? 'text-white opacity-100' : 'opacity-80'"
        >
          {{ link.name }}
        </span>
      </router-link>

    </div>
  </nav>
</template>

<style scoped>
/* Cache la barre de défilement tout en gardant la fonctionnalité de scroll */
.hide-scrollbar {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  -webkit-overflow-scrolling: touch; /* Momentum scrolling sur iOS */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>