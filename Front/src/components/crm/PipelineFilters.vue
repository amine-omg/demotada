<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  filters: any;
  gestionnaires: any[];
}>();

const emit = defineEmits(['update:filters']);

const localFilters = computed({
  get: () => props.filters,
  set: (value) => emit('update:filters', value)
});

const resetFilters = () => {
  emit('update:filters', {
    search: '',
    gestionnaireId: null,
    statut: null,
    typeClient: null,
  });
};

const activeFilterCount = computed(() => {
  let count = 0;
  if (localFilters.value.gestionnaireId) count++;
  if (localFilters.value.statut) count++;
  if (localFilters.value.typeClient) count++;
  return count;
});
</script>

<template>
  <div class="filter-bar">
    <div class="search-container">
      <svg class="search-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
      <input 
        type="text" 
        placeholder="Rechercher..." 
        class="search-input"
        v-model="localFilters.search"
      />
    </div>

    <div class="chips-container hidden md:flex">
      <div class="filter-chip">
        <label>Gestionnaires</label>
        <select v-model="localFilters.gestionnaireId">
          <option :value="null">Tous</option>
          <option v-for="user in gestionnaires" :key="user._id" :value="user._id">
            {{ user.prenom }} {{ user.nom }}
          </option>
        </select>
      </div>

      <div class="filter-chip">
        <label>Statut</label>
        <select v-model="localFilters.statut">
          <option :value="null">Tous</option>
          <option value="Indécis">Indécis</option>
          <option value="Gagné">Gagné</option>
          <option value="Perdu">Perdu</option>
          <option value="Annulé">Annulé</option>
        </select>
      </div>

      <div class="filter-chip hidden md:flex">
        <label>Type de client</label>
        <select v-model="localFilters.typeClient">
          <option :value="null">Tous</option>
          <option value="OpportunitéParticulier">Particulier</option>
          <option value="OpportunitéEntreprise">Entreprise</option>
        </select>
      </div>
      
      <button v-if="activeFilterCount > 0" @click="resetFilters" class="clear-button">
        <span class="font-bold mr-1">{{ activeFilterCount }}</span>
        Effacer tout
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  @apply flex flex-col md:flex-row items-center gap-4 mb-6 p-4 bg-white rounded-lg border border-gray-200;
}
.search-container {
  /* On s'assure que la barre de recherche prend toute la largeur sur mobile */
  @apply relative flex-shrink-0 w-full md:w-64;
}
.search-icon {
  @apply absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400;
}
.search-input {
  @apply w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300;
}
.chips-container {
  /* On s'assure que les filtres prennent toute la largeur quand ils sont visibles */
  @apply flex flex-wrap items-center gap-3 w-full md:w-auto flex-grow;
}
.filter-chip {
  @apply flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-1.5 text-sm transition-all duration-200 hover:border-purple-400;
}
.filter-chip label {
  @apply text-gray-500 whitespace-nowrap;
}
.filter-chip select {
  @apply bg-transparent border-none focus:ring-0 p-0 cursor-pointer font-semibold text-gray-800;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.clear-button {
  @apply text-sm text-red-600 font-medium hover:text-red-800 transition-colors flex items-center ml-auto pl-2;
}
</style>