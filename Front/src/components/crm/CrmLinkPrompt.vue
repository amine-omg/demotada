<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useCrmStore } from '../../stores/crm';
import { useEtablissementsStore } from '../../stores/etablissementsStore';

const crmStore = useCrmStore();
const etablissementsStore = useEtablissementsStore();

const selectedEtablissement = ref('');
const crmIdInput = ref('');
const errorMessage = ref('');

onMounted(() => {
  etablissementsStore.fetchEtablissements();
});

const etablissements = computed(() => etablissementsStore.etablissements);

const handleLink = async () => {
  errorMessage.value = '';
  if (!selectedEtablissement.value || !crmIdInput.value.trim()) {
    errorMessage.value = 'Veuillez sélectionner un établissement et fournir l\'ID CRM.';
    return;
  }
  try {
    await crmStore.linkToCrm(selectedEtablissement.value, crmIdInput.value.trim());
  } catch (error: any) {
    errorMessage.value = crmStore.error || 'Une erreur est survenue.';
  }
};
</script>

<template>
  <div class="w-full max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md text-center border-2 border-dashed">
    <h2 class="text-2xl font-bold text-[#423B71] mb-2">Lier votre compte à un CRM</h2>
    <p class="text-gray-600 mb-6">
      Pour commencer, sélectionnez votre établissement et entrez l'ID CRM qui vous a été fourni.
    </p>

    <form @submit.prevent="handleLink" class="space-y-4 text-left">
      <div>
        <label for="etablissement-select" class="block text-sm font-medium text-gray-700 mb-1">
          Établissement
        </label>
        <select
          id="etablissement-select"
          v-model="selectedEtablissement"
          class="input-field w-full"
        >
          <option disabled value="">Veuillez sélectionner un établissement</option>
          <option v-for="etablissement in etablissements" :key="etablissement._id" :value="etablissement._id">
            {{ etablissement.nom }}
          </option>
        </select>
      </div>

      <div>
        <label for="crm-id-input" class="block text-sm font-medium text-gray-700 mb-1">
          ID CRM
        </label>
        <input
          type="text"
          id="crm-id-input"
          v-model="crmIdInput"
          placeholder="Entrez l'identifiant unique du CRM"
          class="input-field w-full"
        />
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <div class="pt-4">
        <button 
          type="submit" 
          class="btn-primary w-full"
          :disabled="crmStore.isLoading"
        >
          {{ crmStore.isLoading ? 'Vérification...' : 'Se connecter au CRM' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent;
}

.btn-primary {
  @apply w-full bg-[#B2E9E1] text-[#443E73] font-bold py-3 px-4 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300 disabled:opacity-50;
}

.error-message {
  @apply text-red-600 bg-red-100 p-3 rounded-md text-sm;
}
</style>