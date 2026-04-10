<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useSessionStore } from '../stores/sessionStore';
import { useUserStore } from '../stores/user';
import { useFormationsStore } from '../stores/formations';
import { useCategoriesStore } from '../stores/categories';
import CreateGlobalSessionModal from '../components/modals/CreateGlobalSessionModal.vue';
import SessionFilters from '../components/session/SessionFilters.vue'; 
import SessionListItem from '../components/session/SessionListItem.vue'; 
import type { Session, PopulatedFormation } from '../stores/sessionStore';

// Stores & Router
const sessionStore = useSessionStore();
const userStore = useUserStore();
const formationsStore = useFormationsStore();
const categoriesStore = useCategoriesStore();
const router = useRouter();

const dataContext = computed(() => {
  const role = userStore.userRole;
  const userId = userStore.user.id;
  
  // 1. ADMIN : On force l'utilisation du contexte sélectionné.
  // S'il n'y a pas de contexte, on renvoie null pour ecoleId pour bloquer les fuites.
  if (role === 'admin') {
    return { 
      ecoleId: userStore.adminSelectedContext?._id || null, 
      name: userStore.adminSelectedContext?.nom || null, 
      role, 
      userId 
    };
  }
  
  // 2. ÉCOLE : Strictement l'entité associée.
  if (role === 'ecole' && userStore.user.associatedEntity) {
    return { 
      ecoleId: userStore.user.associatedEntity._id, 
      name: userStore.user.associatedEntity.nom, 
      role, 
      userId 
    };
  }

  // 3. FORMATEUR : Doit être rattaché à une école (contexte actuel ou entité associée).
  if (role === 'formateur') {
    const ecoleId = userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
    return {
      ecoleId: ecoleId || null,
      name: userStore.adminSelectedContext?.nom || userStore.user.associatedEntity?.nom || 'Indépendant',
      role,
      userId
    };
  }

  return { role, userId, name: userStore.user.nom, ecoleId: null };
});

const etablissementName = computed(() => dataContext.value.name);

// --- États locaux ---
const showCreateSessionModal = ref(false);
const editingSessionId = ref<string | null>(null);
const showPassedSessions = ref(false);
const instructors = ref<any[]>([]);

// UI States
const showFilters = ref(false);
const viewMode = ref<'list' | 'grid'>('list');

const filters = computed({
  get: () => sessionStore.filters,
  set: (value) => { sessionStore.filters = value; }
});

const activeFilterCount = computed(() => {
  let count = 0;
  if (filters.value.searchLieu) count++;
  if (filters.value.formationId) count++;
  if (filters.value.formateurId) count++;
  if (filters.value.categoryId) count++;
  return count;
});

const loadFilterData = async (context: any) => {
  // On ne charge les données que si on a un ecoleId valide pour éviter de tout voir
  if (context.ecoleId) {
    formationsStore.fetchFormations({ 
      ecoleId: context.ecoleId, 
      createdByUserId: context.role === 'formateur' ? context.userId : undefined 
    });
    categoriesStore.fetchCategories({ 
      ecoleId: context.ecoleId, 
      createdByUserId: context.role === 'formateur' ? context.userId : undefined 
    });
    userStore.fetchUsersByRole('formateur').then(data => { instructors.value = data; });
  }
};

const visibleSessions = computed(() => {
  if (showPassedSessions.value) {
    return sessionStore.sessions;
  }
  return sessionStore.sessions.filter(session => session.status !== 'passée');
});

const openCreateSessionModal = () => {
  editingSessionId.value = null;
  showCreateSessionModal.value = true;
};
const closeCreateSessionModal = () => {
  showCreateSessionModal.value = false;
};
const handleSaveGlobalSession = async (sessionData: any) => {
    try {
        if (editingSessionId.value) {
            await sessionStore.updateSession(editingSessionId.value, sessionData, 'global');
        } else {
            await sessionStore.createSession(sessionData, 'global');
        }
        closeCreateSessionModal();
    } catch (error) {
        alert("Erreur lors de la sauvegarde.");
    }
};
const confirmDeleteSession = async (sessionId: string) => {
  const session = sessionStore.sessions.find(s => s._id === sessionId);
  if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
    await sessionStore.deleteSession(sessionId, (session?.formation as PopulatedFormation)?._id || '', 'global');
  }
};
const toggleShowPassedSessions = () => {
  showPassedSessions.value = !showPassedSessions.value;
};

watch(dataContext, (newContext) => {
  if (newContext.role === 'apprenant') {
    sessionStore.fetchSessionsForApprenant();
  } else {
    sessionStore.fetchSessions(newContext);
  }
  loadFilterData(newContext);
}, { immediate: true, deep: true });

const applyFilters = () => {
  sessionStore.fetchSessions(dataContext.value);
};
const resetFilters = async () => {
  sessionStore.filters = { searchLieu: '', formationId: null, formateurId: null, categoryId: null };
  applyFilters();
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50/50 mobile-wrapper">
    <TheHeader pageTitle="Vos sessions" :showBackButton="false" />

    <main class="flex-1 w-full p-4 md:p-6 lg:p-8 bg-transparent">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl md:text-4xl font-black text-[#423B71] tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2 break-words">
            Vos sessions 
            <span v-if="etablissementName" class="text-gray-400 font-medium text-xl sm:text-2xl truncate">
              <span class="hidden sm:inline">-</span> {{ etablissementName }}
            </span>
          </h1>
          <p class="text-sm text-gray-500 mt-2 font-medium">Administrez, planifiez et suivez toutes vos sessions en cours et à venir.</p>
        </div>
        <button 
          v-if="userStore.userRole !== 'apprenant'"
          @click="openCreateSessionModal()" 
          class="hidden md:flex bg-[#B2E9E1] text-[#443E73] font-bold py-3 px-6 rounded-xl shadow-sm hover:bg-[#FF8B7D] hover:text-white hover:shadow-md transition-all duration-300 items-center justify-center gap-2 flex-shrink-0"
        >
          <i class="fas fa-plus"></i> Nouvelle session
        </button>
      </div>
      
      <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-200">
        
        <div class="flex items-center gap-2">
          <button 
            @click="showFilters = !showFilters" 
            :class="[
              'flex items-center justify-center gap-2 p-2.5 sm:px-5 sm:py-2.5 rounded-lg font-bold transition-all duration-200', 
              showFilters || activeFilterCount > 0 ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            ]"
          >
            <i class="fas fa-sliders-h text-lg sm:text-base"></i>
            <span class="hidden sm:inline">Filtres</span>
            <span v-if="activeFilterCount > 0" class="bg-indigo-500 text-white text-[10px] sm:text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1 shadow-sm">
              {{ activeFilterCount }}
            </span>
            <i :class="['fas fa-chevron-down text-xs ml-1 transition-transform duration-300 hidden sm:inline', showFilters ? 'rotate-180' : '']"></i>
          </button>

          <button 
            v-if="userStore.userRole !== 'apprenant'"
            @click="openCreateSessionModal()" 
            class="flex md:hidden items-center justify-center gap-1.5 p-2.5 px-3.5 rounded-lg font-bold bg-[#B2E9E1] text-[#443E73] hover:bg-[#FF8B7D] hover:text-white transition-all duration-200 shadow-sm"
          >
            <i class="fas fa-plus text-sm"></i>
            <span class="text-sm">Session</span>
          </button>
        </div>

        <div class="flex items-center gap-3 sm:gap-6 ml-auto">
          
          <div class="hidden md:flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              @click="viewMode = 'list'" 
              :class="['px-3 py-1.5 rounded-md text-sm font-bold transition-all', viewMode === 'list' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800']"
              title="Vue Liste compacte"
            >
              <i class="fas fa-list"></i>
            </button>
            <button 
              @click="viewMode = 'grid'" 
              :class="['px-3 py-1.5 rounded-md text-sm font-bold transition-all', viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-800']"
              title="Vue Grille (Grandes images)"
            >
              <i class="fas fa-th-large"></i>
            </button>
          </div>

          <div class="w-px h-6 bg-gray-200 hidden sm:block"></div>

          <div class="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
            <span class="text-xs sm:text-sm font-bold text-gray-600 hidden sm:inline">Historique</span>
            <button 
              @click="toggleShowPassedSessions"
              :class="['relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2', showPassedSessions ? 'bg-indigo-500' : 'bg-gray-300']"
            >
              <span class="sr-only">Afficher sessions passées</span>
              <span :class="[showPassedSessions ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
            </button>
          </div>
        </div>
      </div>

      <div v-show="showFilters" class="mb-8 overflow-hidden transition-all duration-300 ease-in-out">
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100/50">
          <SessionFilters
            v-model:filters="filters"
            :formations="formationsStore.formations"
            :formateurs="instructors"
            :categories="categoriesStore.allCategories"
            @reset="resetFilters"
            @update:filters="applyFilters"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div v-if="sessionStore.isLoading" class="flex flex-col items-center justify-center py-20">
          <i class="fas fa-spinner fa-spin text-4xl text-indigo-300 mb-4"></i>
          <p class="text-gray-500 font-medium animate-pulse">Chargement de vos sessions...</p>
        </div>
        
        <div v-else-if="visibleSessions.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
          <div class="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-calendar-times text-indigo-400 text-2xl"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-800 mb-1">Aucune session trouvée</h3>
          <p class="text-gray-500 text-sm">Créez une nouvelle session ou modifiez vos critères de recherche.</p>
          <button v-if="activeFilterCount > 0" @click="resetFilters" class="mt-4 text-indigo-600 font-bold hover:underline text-sm">
            Réinitialiser les filtres
          </button>
        </div>

        <div v-else :class="[
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8' 
            : 'flex flex-col gap-4'
        ]">
          <SessionListItem
            v-for="session in visibleSessions"
            :key="session._id"
            :session="session"
            :view-mode="viewMode" 
            @delete-session="confirmDeleteSession"
          />
        </div>
      </div>
    </main>

    <CreateGlobalSessionModal
      :show-modal="showCreateSessionModal"
      :session-id="editingSessionId"
      :etablissement-id="dataContext.ecoleId"
      @close="closeCreateSessionModal"
      @save-session="handleSaveGlobalSession"
    />
  </div>
</template>

<style scoped>
/* Cette classe sauve la mise sur mobile sans casser le bureau */
@media (max-width: 1024px) {
  .mobile-wrapper {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>