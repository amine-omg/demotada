<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { ref, computed, watch, onMounted } from 'vue';
import { useUserStore } from '../stores/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const userRole = computed(() => userStore.userRole);

const isSidebarCollapsed = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// --- Configuration de la Navigation (Cohérence Turquoise) ---
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
      show: true // Ajouté pour éviter d'être filtré
    },
    {
  name: 'Création Dossier',
  to: '/demo-cee',
  icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  show: true
},
{
  name: 'Générateur AH',
  to: '/demo-ah',
  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', // Icône document
  show: true
},
{
      name: 'Export PNCEE',
      to: '/emmy-index', 
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', 
      show: true
    },
    {
  name: 'Générer Liasses',
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
  name: 'Portail Obligé',
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
      name: 'Moteur Tarifaire',
      to: '/admin/tarifs',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      show: true // Remplace par "userStore.userRole === 'admin'" si tu veux le cacher aux simples utilisateurs
    }
  ];
  return links.filter(link => link.show);
});

const isAdmin = computed(() => userRole.value === 'admin');
</script>
<template>
  <aside
    class="fixed top-0 left-0 h-screen bg-[#050505] text-slate-400 border-r border-white/5 shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-40 flex flex-col select-none"
    :class="[isSidebarCollapsed ? 'w-20' : 'w-64']"
  >
  <div class="h-24 flex items-center px-6 mb-4">
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-12 h-12 flex items-center justify-center overflow-visible">
          <img 
            src="http://localhost:3000/uploads/horns.png" 
            alt="Logo Karnain" 
            class="w-full h-full object-contain filter brightness-110 group-hover:scale-110 transition-transform duration-500"
          />
        </div>
        <span 
          v-if="!isSidebarCollapsed" 
          class="text-2xl font-black text-white tracking-tighter transition-opacity duration-300  italic"
        >
          Karnain
        </span>
      </router-link>
    </div>

    <nav class="flex-grow px-3 space-y-1 overflow-y-auto custom-scrollbar">
      <div v-if="!isSidebarCollapsed" class="px-3 mb-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-600">
        Menu Principal
      </div>
      
      <ul class="space-y-2.5">
        <li v-for="link in navigationLinks" :key="link.to">
          <router-link
            :to="link.to"
            class="flex items-center rounded-2xl px-4 py-3.5 transition-all duration-200 group relative"
            :class="[
              $route.path === link.to 
                ? 'bg-[#E5E5D1]/5 text-white shadow-lg' 
                : 'hover:bg-white/5 hover:text-white'
            ]"
            :title="link.name"
          >
            <div 
              v-if="$route.path === link.to" 
              class="absolute left-0 w-1.5 h-7 bg-[#E5E5D1] rounded-r-full shadow-[0_0_15px_rgba(229,229,209,0.4)]"
            ></div>

            <div 
              class="flex items-center justify-center transition-transform duration-200 group-hover:scale-110" 
              :class="[isSidebarCollapsed ? 'w-full' : 'mr-4']"
            >
              <svg 
                class="w-6 h-6 transition-colors duration-200" 
                :class="$route.path === link.to ? 'text-[#E5E5D1]' : 'text-slate-500 group-hover:text-white'"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" :d="link.icon" />
              </svg>
            </div>
            
            <span 
              v-if="!isSidebarCollapsed" 
              class="font-bold text-base whitespace-nowrap tracking-tight"
            >
              {{ link.name }}
            </span>
          </router-link>
        </li>
      </ul>

     
    </nav>

    <div class="p-4">
      <button 
        @click="isSidebarCollapsed = !isSidebarCollapsed"
        class="flex items-center w-full px-4 py-4 text-slate-500 hover:text-[#E5E5D1] bg-white/5 hover:bg-[#E5E5D1]/5 rounded-2xl transition-all duration-300 group"
        :class="{ 'justify-center': isSidebarCollapsed }"
      >
        <div class="transition-transform duration-500" :class="{ 'rotate-180': isSidebarCollapsed }">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </div>
        <span v-if="!isSidebarCollapsed" class="ml-4 font-black text-[10px] tracking-[0.3em] uppercase">Masquer</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}
</style>