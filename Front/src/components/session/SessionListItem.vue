<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { PropType } from 'vue';
import type { Session, PopulatedFormation } from '../../stores/sessionStore';
import { useUserStore } from '../../stores/user';

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true,
  },
  viewMode: {
    type: String,
    default: 'list' 
  }
});

const emit = defineEmits(['delete-session']);
const router = useRouter();
const userStore = useUserStore();

// --- DONNÉES SÉCURISÉES ---
const formation = computed(() => props.session.formation as PopulatedFormation | undefined);
const sessionTitle = computed(() => props.session.title || 'Session sans nom');
const formationTitle = computed(() => formation.value?.title || 'Formation non définie');
const formationImage = computed(() => formation.value?.image || 'https://placehold.co/600x400/e2e8f0/64748b?text=Aucune+Image');
const elevesCount = computed(() => props.session.elevesInscrits?.length || 0);

// --- PERMISSIONS ---
const canManageSession = computed(() => {
  const userRole = userStore.userRole;
  const userId = userStore.user.id;
  return userRole === 'admin' || userRole === 'ecole' || props.session.createdBy === userId;
});

// --- FORMATTAGE ---
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Logique de badge
const statusConfig = computed(() => {
  const rawStatus = props.session.status?.toLowerCase() || '';
  if (rawStatus.includes('en cours')) return { label: 'En cours', bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (rawStatus.includes('passée')) return { label: 'Terminée', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  if (rawStatus.includes('continue')) return { label: 'Continue', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' };
  return { label: 'À venir', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' };
});

// --- NAVIGATION ---
const navigateToClass = () => {
  // Redirige vers MaClassePage.vue
  router.push({ name: 'classe', params: { id: props.session._id } });
};

const handleManage = () => {
  // Redirige vers SessionManagePage.vue (Assure-toi que le nom de cette route est bien 'session-manage' dans ton router/index.ts)
  router.push({ name: 'session-manage', params: { id: props.session._id } });
};
</script>

<template>
  <div v-if="viewMode === 'grid'" class="bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col group relative h-full">
    
    <button 
      v-if="canManageSession"
      @click.stop="emit('delete-session', session._id)" 
      class="absolute top-3 right-3 z-20 w-8 h-8 bg-white/90 hover:bg-red-500 text-gray-500 hover:text-white rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
      title="Supprimer la session"
    >
      <i class="fas fa-trash-alt text-[10px]"></i>
    </button>

    <div class="relative w-full h-40 sm:h-48 overflow-hidden bg-gray-100 flex-shrink-0">
      <img :src="formationImage" alt="Image session" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      
      <div class="absolute top-3 left-3">
        <span :class="['px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-1.5', statusConfig.bg, statusConfig.text]">
          <span :class="['w-1.5 h-1.5 rounded-full', statusConfig.dot]"></span>
          {{ statusConfig.label }}
        </span>
      </div>
    </div>

    <div class="p-4 sm:p-5 flex flex-col flex-grow min-w-0">
      <div class="mb-4 min-w-0">
        <h3 class="text-base sm:text-lg font-extrabold text-[#423B71] line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors break-words" :title="sessionTitle">
          {{ sessionTitle }}
        </h3>
        <p class="text-xs text-indigo-500 font-semibold mt-1 line-clamp-1 break-words" :title="formationTitle">
          {{ formationTitle }}
        </p>
      </div>
      
      <div class="flex flex-wrap items-center gap-2 mb-6 mt-auto">
        <div class="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium border border-gray-100">
          <i class="far fa-calendar-alt text-gray-400"></i>
          <span class="truncate">Du {{ formatDate(session.dateDebut) }} au {{ formatDate(session.dateFin) }}</span>
        </div>
        <div class="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-medium border border-gray-100 flex-shrink-0">
          <i class="fas fa-users text-gray-400"></i>
          <span>{{ elevesCount }} inscrit(s)</span>
        </div>
      </div>

      <div class="flex items-center gap-2 mt-auto w-full">
        <button 
          @click="navigateToClass" 
          class="flex-1 bg-[#B2E9E1] hover:bg-[#FF8B7D] hover:text-white text-[#423B72] font-bold py-2.5 rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
        >
          <i class="fas fa-sign-in-alt"></i>
          <span>Classe</span>
        </button>

        <button 
          v-if="canManageSession"
          @click.stop="handleManage" 
          class="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl transition-all duration-300 text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
        >
          <i class="fas fa-cog"></i>
          <span>Gérer</span>
        </button>
      </div>
    </div>
  </div>

  <div v-else class="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col sm:flex-row group">
    
    <div class="relative w-full sm:w-40 h-32 sm:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
      <img :src="formationImage" alt="Image session" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute top-2 left-2 sm:hidden">
        <span :class="['px-2 py-0.5 rounded-md text-[9px] font-bold shadow-sm', statusConfig.bg, statusConfig.text]">
          {{ statusConfig.label }}
        </span>
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center flex-1 min-w-0 gap-3 sm:gap-4 w-full">
      
      <div class="flex-1 min-w-0 flex flex-col justify-center">
        <div class="hidden sm:flex items-center gap-2 mb-1.5">
           <span :class="['px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1', statusConfig.bg, statusConfig.text]">
            <span :class="['w-1.5 h-1.5 rounded-full', statusConfig.dot]"></span>
            {{ statusConfig.label }}
          </span>
        </div>

        <h3 class="text-sm sm:text-base font-bold text-[#423B71] truncate sm:whitespace-normal sm:line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors break-words">
          {{ sessionTitle }}
        </h3>
        <p class="text-[10px] sm:text-xs text-indigo-500 font-semibold mt-0.5 truncate">
          {{ formationTitle }}
        </p>

        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-gray-500 font-medium mt-2">
          <span class="flex items-center gap-1"><i class="far fa-calendar-alt"></i> {{ formatDate(session.dateDebut) }} - {{ formatDate(session.dateFin) }}</span>
          <span class="hidden sm:inline text-gray-300">•</span>
          <span class="flex items-center gap-1"><i class="fas fa-users"></i> {{ elevesCount }}</span>
        </div>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 flex-shrink-0 justify-end">
        <button 
          @click="navigateToClass" 
          class="flex-1 sm:flex-none bg-[#B2E9E1] hover:bg-[#FF8B7D] hover:text-white text-[#423B72] font-bold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
        >
          <i class="fas fa-sign-in-alt"></i>
          <span>Classe</span>
        </button>

        <button 
          v-if="canManageSession"
          @click.stop="handleManage" 
          class="flex-1 sm:flex-none bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold py-2 px-3 sm:px-4 rounded-lg transition-all duration-300 text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5"
        >
          <i class="fas fa-cog"></i>
          <span class="hidden sm:inline">Gérer</span>
        </button>

        <button 
          v-if="canManageSession"
          @click.stop="emit('delete-session', session._id)" 
          class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 transition-colors shadow-sm flex-shrink-0"
          title="Supprimer"
        >
          <i class="fas fa-trash-alt text-[10px] sm:text-xs"></i>
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>