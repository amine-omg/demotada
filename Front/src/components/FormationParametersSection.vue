<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFormationBuilderStore, type PopulatedEcole } from '../stores/formationBuilder';
import { useEtablissementsStore } from '../stores/etablissementsStore';

const formationBuilderStore = useFormationBuilderStore();
const etablissementsStore = useEtablissementsStore();

const searchTerm = ref('');
const showConfirmationModal = ref(false);
const selectedEtablissement = ref<PopulatedEcole | null>(null);

onMounted(() => {
  etablissementsStore.fetchEtablissements();
});

const isAlreadyLinked = computed(() => !!formationBuilderStore.ecole);
const linkedEtablissementName = computed(() => {
  if (formationBuilderStore.ecole && typeof formationBuilderStore.ecole === 'object') {
    return (formationBuilderStore.ecole as PopulatedEcole).nom;
  }
  return 'Non défini';
});

const filteredEtablissements = computed(() => {
  if (!searchTerm.value) {
    return [];
  }
  return etablissementsStore.etablissements.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.value.toLowerCase())
  ).slice(0, 5); 
});

const selectEtablissement = (etablissement: PopulatedEcole) => {
  if (isAlreadyLinked.value) return; 

  selectedEtablissement.value = etablissement;
  showConfirmationModal.value = true;
  searchTerm.value = ''; 
};

const confirmLinkage = async () => {
  if (selectedEtablissement.value) {
    formationBuilderStore.setEtablissement(selectedEtablissement.value);
    try {
      await formationBuilderStore.saveFormation();
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    } finally {
      showConfirmationModal.value = false;
      selectedEtablissement.value = null;
    }
  }
};
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-xl font-bold text-gray-800 border-b pb-4 mb-6">Établissement de tutelle</h3>

      <div v-if="isAlreadyLinked">
        <p class="text-sm text-gray-600 mb-2">Cette formation est rattachée à l'établissement suivant :</p>
        <div class="flex items-center p-3 bg-gray-100 rounded-md">
          <svg class="w-5 h-5 text-gray-500 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z" clip-rule="evenodd"></path></svg>
          <span class="font-semibold text-gray-800">{{ linkedEtablissementName }}</span>
        </div>
        <p class="text-xs text-gray-500 mt-2">Ce rattachement est définitif. Seul l'administrateur de l'établissement peut le modifier.</p>
      </div>

      <div v-else class="relative">
        <label for="etablissement-search" class="label">Rattacher à un établissement</label>
        <p class="text-sm text-gray-500 mb-2">Recherchez un établissement pour y lier cette formation. Attention, cette action est irréversible.</p>
        <input
          type="text"
          id="etablissement-search"
          v-model="searchTerm"
          class="input-field p-3"
          placeholder="Tapez le nom d'un établissement..."
        />
        <ul v-if="filteredEtablissements.length > 0" class="absolute z-10 w-full bg-white border rounded-md shadow-lg mt-1">
          <li
            v-for="etablissement in filteredEtablissements"
            :key="etablissement._id"
            @click="selectEtablissement(etablissement)"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            {{ etablissement.nom }}
          </li>
        </ul>
      </div>
    </div>

    <div v-if="showConfirmationModal" class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8 text-center">
        <h3 class="text-2xl font-bold text-red-600 mb-4">Action Irréversible</h3>
        <p class="text-gray-700 mb-6">
          Vous êtes sur le point de rattacher cette formation à l'établissement
          <strong class="font-semibold">"{{ selectedEtablissement?.nom }}"</strong>.
          <br><br>
          Une fois confirmé, vous ne pourrez plus modifier ce rattachement. Seul un administrateur de l'établissement pourra le faire.
        </p>
        <div class="flex justify-center space-x-4">
          <button @click="showConfirmationModal = false" class="btn-secondary">Annuler</button>
          <button @click="confirmLinkage" class="btn-danger">Confirmer et Rattacher</button> </div>
      </div>
    </div>
  </div>
</template>