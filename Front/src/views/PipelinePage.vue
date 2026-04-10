<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCrmStore } from '../stores/crm';
import { useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import PipelineColumn from '../components/crm/PipelineColumn.vue';
import PipelineFilters from '../components/crm/PipelineFilters.vue';
import { useRoute } from 'vue-router'; 
import { useUserStore } from '../stores/user'; 
const route = useRoute(); 
import CreateOpportuniteModal from '../components/modals/CreateOpportuniteModal.vue'; 

const userStore = useUserStore(); 
const crmStore = useCrmStore();
const router = useRouter();

const showCreateOpportuniteModal = ref(false); 

const stages = computed(() => {
  if (!crmStore.config) return [];
  return [...crmStore.config.pipelineStages].sort((a, b) => a.order - b.order);
});

const goToConfig = () => {
  router.push({ name: 'crm-config' });
};

const createNewOpportunite = () => {
  showCreateOpportuniteModal.value = true;
};


const filters = ref({
  search: '',
  gestionnaireId: null,
  statut: null,
  typeClient: null,
});

const ecoleIdToFetch = computed(() => {
  if (route.query.ecoleId) {
    return route.query.ecoleId as string;
  }
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext._id;
  }
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity._id;
  }
  return null;
});

const etablissementName = computed(() => {
  if (userStore.adminSelectedContext && userStore.userRole === 'admin') {
    return userStore.adminSelectedContext.nom;
  }
  return crmStore.config?.ecole?.nom || '';
});

watch(ecoleIdToFetch, (newId) => {
  if (newId) {
    crmStore.fetchCrmConfig(newId);
    crmStore.fetchOpportunites(filters.value, newId);
  } else {
    crmStore.config = null;
    crmStore.opportunites = [];
  }
}, { immediate: true });

const handleSaveOpportunite = async (opportuniteData: any) => {
  try {
    const initialStage = crmStore.config?.pipelineStages[0]?.name || 'Entrant';
    const dataToSave = {
      ...opportuniteData,
      currentStage: initialStage,
    };

    await crmStore.createOpportunite(dataToSave, ecoleIdToFetch.value);
    
    showCreateOpportuniteModal.value = false;
  } catch (error) {
    console.error("Erreur lors de la création de l'opportunité:", error);
    alert("La création a échoué.");
  }
};

watch(ecoleIdToFetch, (newId) => {
  if (newId) {
    crmStore.fetchCrmConfig(newId);
    crmStore.fetchOpportunites(filters.value, newId);
  } else {
    crmStore.config = null;
    crmStore.opportunites = [];
  }
}, { immediate: true }); 

watch(filters, (newFilters) => {
  if (ecoleIdToFetch.value) {
    crmStore.fetchOpportunites(newFilters, ecoleIdToFetch.value);
  }
}, { deep: true });

const gestionnaires = computed(() => {
  if (!crmStore.opportunites) return [];
  const owners = crmStore.opportunites.map(op => op.proprietaire).filter(Boolean);
  const uniqueOwners = Array.from(new Map(owners.map(owner => [owner._id, owner])).values());
  return uniqueOwners;
});


</script>

<template>
  <div class="page-container">
    <TheHeader pageTitle="Pipeline" :showBackButton="false" />

    <main class="flex-1 p-6 md:p-8">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
        <h1 class="text-3xl font-bold text-[#423B71]">
            Tunnel de vente 
            <span v-if="etablissementName" class="text-gray-500">- {{ etablissementName }}</span>
          </h1>
          <p class="text-sm text-gray-600 mt-1">Gérez vos opportunités commerciales avant l'entrée en formation.</p>
        </div>
        <div class="flex items-center space-x-3 mt-4 md:mt-0">
          <button @click="goToConfig" class="btn-secondary">Configuration</button>
          
          <button @click="createNewOpportunite" class="btn-primary">
            <span class="hidden md:inline">Créer une opportunité</span>
            <span class="md:hidden">+ Opportunité</span>
          </button>
          </div>
      </div>


      
      <PipelineFilters 
        :filters="filters" 
        :gestionnaires="gestionnaires"
        @update:filters="newFilters => filters = newFilters"
      />

      <div v-if="crmStore.isLoading && stages.length === 0" class="text-center py-12 text-gray-500">
        Chargement du pipeline...
      </div>

      <div v-else-if="crmStore.error" class="text-center py-12 text-red-500 border-2 border-dashed border-red-300 rounded-lg">
        {{ crmStore.error }}
      </div>

      <div v-else-if="stages.length > 0" class="pipeline-board">
        <PipelineColumn 
            v-for="stage in stages" 
            :key="stage.name" 
            :stage="stage" 
        />
      </div>
      
      <div v-else class="text-center py-12 text-gray-500 border-2 border-dashed rounded-lg">
        <p>Aucune étape n'est configurée pour votre tunnel de vente.</p>
        <button @click="goToConfig" class="mt-4 btn-primary">Configurer votre pipeline</button>
      </div>
    </main>
     <CreateOpportuniteModal
      :show-modal="showCreateOpportuniteModal"
      @close="showCreateOpportuniteModal = false"
      @save="handleSaveOpportunite"
    />
  </div>
</template>

<style scoped>
.page-container {
  background-color: #f8f9fa; 
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.btn-primary {
  @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300;
}

.btn-secondary {
  @apply bg-white text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-300;
}

.pipeline-board {
  display: flex;
  gap: 1.5rem; 
  overflow-x: auto;
  padding: 1rem 0.5rem;
  min-height: 65vh; 
}
</style>