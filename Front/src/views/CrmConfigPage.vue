<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useCrmStore } from '../stores/crm';
import draggable from 'vuedraggable';
import TheHeader from '../components/TheHeader.vue'; // Ajout du header

const crmStore = useCrmStore();

// Refs locales pour modifier la configuration sans impacter le store directement
const localStages = ref<{ name: string; order: number }[]>([]);
const localLossReasons = ref<string[]>([]);

onMounted(() => {
  crmStore.fetchCrmConfig();
});

// Met à jour les données locales quand la configuration du store est chargée
watch(() => crmStore.config, (newConfig) => {
  if (newConfig) {
    // Copie profonde pour éviter les mutations accidentelles
    localStages.value = JSON.parse(JSON.stringify(newConfig.pipelineStages));
    localLossReasons.value = [...newConfig.lossReasons];
  }
}, { deep: true });

const addStage = () => {
  localStages.value.push({ name: 'Nouvelle étape', order: localStages.value.length });
};

const removeStage = (index: number) => {
  localStages.value.splice(index, 1);
};

const addLossReason = () => {
  localLossReasons.value.push('Nouveau motif');
};

const removeLossReason = (index: number) => {
  localLossReasons.value.splice(index, 1);
};

const saveConfig = () => {
  const updatedStages = localStages.value.map((stage, index) => ({ ...stage, order: index }));
  crmStore.updateCrmConfig({
    pipelineStages: updatedStages,
    lossReasons: localLossReasons.value
  });
  alert('Configuration sauvegardée !');
};
</script>

<template>
  <div class="page-container">
<TheHeader 
  pageTitle="Configuration du Pipeline" 
  :showBackButton="true" 
  :backButtonRoute="'/pipeline'" 
/>
    <main class="flex-1 p-6 md:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-[#423B71]">Configuration du tunnel de vente</h1>
          <p class="text-sm text-gray-600 mt-1">Personnalisez les étapes de votre pipeline et les motifs de perte.</p>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 class="text-xl font-semibold text-[#423B72] mb-4">Colonnes du tunnel de vente</h2>
          <p class="text-sm text-gray-500 mb-4">Glissez-déposez pour réorganiser les étapes.</p>
          
          <div class="space-y-3 mb-4">
            <draggable v-model="localStages" item-key="_id" handle=".handle" ghost-class="ghost">
              <template #item="{ element, index }">
                <div class="config-item">
                  <span class="handle">⠿</span>
                  <input type="text" v-model="element.name" placeholder="Nom de l'étape" class="input-field flex-grow" />
                  <button @click="removeStage(index)" class="delete-btn">&times;</button>
                </div>
              </template>
            </draggable>
          </div>
          <button @click="addStage" class="btn-secondary text-sm">Ajouter une étape</button>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-semibold text-[#423B72] mb-4">Motifs de perte des opportunités</h2>
          <div class="space-y-3 mb-4">
            <div v-for="(reason, index) in localLossReasons" :key="index" class="config-item">
              <input type="text" v-model="localLossReasons[index]" placeholder="Motif de perte" class="input-field flex-grow" />
              <button @click="removeLossReason(index)" class="delete-btn">&times;</button>
            </div>
          </div>
          <button @click="addLossReason" class="btn-secondary text-sm">Ajouter un motif</button>
        </div>
        
        <div class="mt-8 text-right">
          <button @click="saveConfig" class="btn-primary">Enregistrer les modifications</button>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.page-container { background-color: #f8f9fa; min-height: 100vh; }
.config-item { display: flex; align-items: center; gap: 1rem; background: #f8f9fa; padding: 0.75rem; border-radius: 8px; border: 1px solid #e0e0e0; }
.handle { cursor: grab; color: #a0aec0; }
.ghost { opacity: 0.5; background: #dcd8f4; }
.input-field { border: 1px solid #ccc; padding: 0.5rem 0.75rem; border-radius: 6px; }
.delete-btn { background: #fee2e2; color: #ef4444; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-weight: bold; }
.btn-primary { @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300; }
.btn-secondary { @apply bg-white text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-300; }
</style>