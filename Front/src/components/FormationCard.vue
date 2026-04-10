<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import { useUserStore } from '../stores/user';
import { useSessionStore } from '../stores/sessionStore';

interface Formation {
  _id: string;
  title: string;
  image?: string;
  status: 'draft' | 'public' | 'disabled' | string;
  validationStatus?: 'pending' | 'approved' | 'rejected' | string;
  createdAt: string;
  modules?: any[];
}

const props = defineProps({
  formation: {
    type: Object as PropType<Formation>,
    required: true
  }
});

const emit = defineEmits<{
  (e: 'view', id: string): void;
  (e: 'delete', id:string): void;
  (e: 'archive', id:string): void;
  (e: 'reindex', id:string): void;
  (e: 'publish', id:string): void;
  (e: 'publish-direct', id:string): void; 
}>();

const showActionsMenu = ref(false);
const userStore = useUserStore(); 
const sessionStore = useSessionStore();

const sessionsLiees = computed(() => {
  if (!sessionStore.sessions) return [];
  return sessionStore.sessions.filter(s => {
    const fId = typeof s.formation === 'object' ? s.formation._id : s.formation;
    return String(fId) === String(props.formation._id);
  });
});

const sessionsCount = computed(() => sessionsLiees.value.length);
const totalStudents = computed(() => sessionsLiees.value.reduce((acc, s) => acc + (s.elevesInscrits?.length || 0), 0));

const statusDisplay = computed(() => {
  switch (props.formation.status) {
    case 'public': return { text: 'Public', class: 'bg-green-500/90 text-white' };
    case 'draft': return { text: 'Brouillon', class: 'bg-slate-100 text-slate-500 border border-slate-200' };
    case 'disabled': return { text: 'Archive', class: 'bg-gray-400 text-white' };
    default: return { text: 'Privé', class: 'bg-orange-500/90 text-white' };
  }
});

const toggleActionsMenu = () => { showActionsMenu.value = !showActionsMenu.value; };
const closeMenu = () => { showActionsMenu.value = false; };
</script>

<template>
  <div 
    class="group relative bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm hover:shadow-2xl border border-gray-100 overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-1 h-full"
    @click="$emit('view', formation._id)"
  >
    
    <div class="h-40 md:h-44 w-full relative overflow-hidden bg-gray-50">
      <img v-if="formation.image" :src="formation.image" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
      <div v-else class="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <i class="fas fa-graduation-cap text-indigo-100 text-4xl"></i>
      </div>

      <div class="absolute top-4 left-4">
        <span :class="statusDisplay.class" class="backdrop-blur-md text-[8px] md:text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">
          {{ statusDisplay.text }}
        </span>
      </div>
    </div>

    <div class="p-5 md:p-7 flex-1 flex flex-col">
      <h3 class="text-lg md:text-xl font-black text-[#423B71] leading-tight mb-4 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
        {{ formation.title }}
      </h3>
      
      <div class="grid grid-cols-2 gap-3 md:gap-4 mb-5 md:mb-6">
        <div class="bg-[#F8FAFC] p-3 md:p-4 rounded-2xl md:rounded-3xl text-center border border-gray-50 shadow-inner">
          <p class="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">Sessions</p>
          <p class="text-base md:text-xl font-black text-purple-600">{{ sessionsCount }}</p>
        </div>
        <div class="bg-[#F8FAFC] p-3 md:p-4 rounded-2xl md:rounded-3xl text-center border border-gray-50 shadow-inner">
          <p class="text-[8px] font-black text-gray-400 uppercase leading-none mb-1">Élèves</p>
          <p class="text-base md:text-xl font-black text-indigo-600">{{ totalStudents }}</p>
        </div>
      </div>

      <div class="flex items-center justify-between text-[10px] font-bold text-gray-300 mt-auto">
        <span class="flex items-center gap-1 uppercase tracking-tighter truncate">
          <i class="fas fa-layer-group text-indigo-200"></i>
          {{ formation.modules?.length || 0 }} modules
        </span>
        <span class="italic">{{ new Date(formation.createdAt).toLocaleDateString('fr-FR', {year:'2-digit', month:'2-digit'}) }}</span>
      </div>
    </div>

    <div class="absolute top-4 right-4 z-20">
      <button @click.stop="toggleActionsMenu" class="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#423B71] shadow-lg border border-white/20 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
        <i class="fas fa-ellipsis-h text-xs"></i>
      </button>

      <transition name="fade">
        <div v-if="showActionsMenu" class="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden" @click.stop>
          <button @click="$emit('archive', formation._id); closeMenu()" class="w-full text-left px-5 py-3 text-[10px] font-black text-orange-500 hover:bg-orange-50 uppercase flex items-center gap-3">
            <i class="fas fa-archive"></i> Archiver
          </button>
          <button @click="$emit('delete', formation._id); closeMenu()" class="w-full text-left px-5 py-3 text-[10px] font-black text-red-600 hover:bg-red-50 uppercase border-t border-gray-50 flex items-center gap-3">
            <i class="fas fa-trash-alt"></i> Supprimer
          </button>
        </div>
      </transition>
    </div>
    
    <div v-if="showActionsMenu" @click.stop="closeMenu" class="fixed inset-0 z-10"></div>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-10px); }
</style>