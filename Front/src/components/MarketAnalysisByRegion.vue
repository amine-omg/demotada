<script setup lang="ts">
import { ref } from 'vue';
import { useMarketAnalysisStore } from '../stores/marketAnalysisStore';

const marketStore = useMarketAnalysisStore();


const filters = ref({
  region: 'Occitanie',
  departement: '',
  keyword: '',
  minPrice: null,
  maxPrice: null,
  minHours: null,
  maxHours: null,
});

const regionsList = ref([
  'Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Bretagne', 'Centre-Val de Loire',
  'Corse', 'Grand Est', 'Guadeloupe', 'Guyane', 'Hauts-de-France', 'Île-de-France',
  'La Réunion', 'Martinique', 'Mayotte', 'Normandie', 'Nouvelle-Aquitaine',
  'Occitanie', 'Pays de la Loire', "Provence-Alpes-Côte d'Azur"
]);

const handleSearch = () => {
  // On ne garde que les filtres qui ont une valeur
  const activeFilters = Object.fromEntries(
    Object.entries(filters.value).filter(([_, value]) => value !== null && value !== '')
  );
  marketStore.fetchMarketData(activeFilters);
};
</script>

<template>
  <div class="space-y-8">
    <div class="bg-white p-6 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div>
          <label for="region-filter" class="label">Région</label>
          <select id="region-filter" v-model="filters.region" class="input-field">
            <option value="">Toutes</option>
            <option v-for="region in regionsList" :key="region" :value="region">{{ region }}</option>
          </select>
        </div>

        <div>
          <label for="departement-filter" class="label">Département (optionnel)</label>
          <input type="text" id="departement-filter" v-model="filters.departement" class="input-field" placeholder="Ex: Hérault">
        </div>

        <div>
          <label for="keyword-filter" class="label">Mots-clés (titre)</label>
          <input type="text" id="keyword-filter" v-model="filters.keyword" class="input-field" placeholder="Ex: Excel, CACES, Anglais...">
        </div>

        <div class="md:col-span-2 lg:col-span-2">
          <label class="label">Fourchette de Prix (€)</label>
          <div class="flex items-center space-x-2">
            <input type="number" v-model="filters.minPrice" class="input-field w-full" placeholder="Min">
            <span class="text-gray-500">-</span>
            <input type="number" v-model="filters.maxPrice" class="input-field w-full" placeholder="Max">
          </div>
        </div>

        <div class="md:col-span-2 lg:col-span-2">
          <label class="label">Fourchette de Durée (heures)</label>
          <div class="flex items-center space-x-2">
            <input type="number" v-model="filters.minHours" class="input-field w-full" placeholder="Min">
            <span class="text-gray-500">-</span>
            <input type="number" v-model="filters.maxHours" class="input-field w-full" placeholder="Max">
          </div>
        </div>
      </div>
      <div class="mt-4 flex justify-end">
        <button @click="handleSearch" class="btn-primary">Affiner la recherche</button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow overflow-x-auto">
      <div v-if="marketStore.isLoading" class="text-center py-8">Recherche en cours...</div>
      <div v-else>
        <p class="text-sm text-gray-600 mb-4">
          <span class="font-bold">{{ marketStore.totalCount }}</span> formations trouvées. Affichage des 100 premiers résultats.
        </p>
        <table class="w-full text-sm text-left">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2">Organisme</th>
              <th class="px-4 py-2">Intitulé de la formation</th>
              <th class="px-4 py-2">Durée (h)</th>
              <th class="px-4 py-2">Prix moyen (€)</th>
              <th class="px-4 py-2">Département</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(formation, index) in marketStore.competitorResults" :key="index" class="border-b">
              <td class="px-4 py-2 font-medium">{{ formation.nom_of }}</td>
              <td class="px-4 py-2">{{ formation.intitule_formation }}</td>
              <td class="px-4 py-2 text-center">{{ formation.nombre_heures_total_mean }}</td>
              <td class="px-4 py-2 text-center">{{ formation.frais_ttc_tot_mean }}</td>
              <td class="px-4 py-2">{{ formation.nom_departement }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>