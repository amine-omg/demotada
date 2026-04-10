<template>
  <div class="min-h-screen bg-gray-100">
    <TheHeader pageTitle="Explorez les Formations" :showBackButton="false" />

    <main class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-[#423B71] mb-2">Découvrez de nouvelles compétences</h1>
        <p class="text-lg text-gray-600">Parcourez notre catalogue de formations et trouvez celle qui vous convient.</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="lg:w-1/5 bg-transparent p-6 shadow-none h-fit sticky top-4"> <h2 class="text-lg font-semibold text-gray-700 mb-4">Filtrer par</h2> <div class="space-y-6"> <div>
              <h3 class="font-bold text-gray-700 text-sm mb-2">Objet</h3> <div class="space-y-2 text-sm"> <label v-for="domainOption in domains" :key="domainOption" class="flex items-center text-gray-700">
                  <input
                    type="checkbox"
                    :value="domainOption"
                    v-model="filters.selectedDomains"
                    @change="applyFilters"
                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span class="ml-2">{{ domainOption }}</span>
                </label>
              </div>
            </div>

            <div>
              <h3 class="font-bold text-gray-700 text-sm mb-2">Mots-clés (Tags)</h3> <input
                type="text"
                id="filterTags"
                v-model="filters.tagsInput"
                @keyup.enter="applyFilters"
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-4 text-sm" placeholder="Ex: Marketing, IA..."
              />
              <p class="text-xs text-gray-500 mt-1">Séparez les tags par des virgules.</p>
            </div>

            <button
              @click="resetFilters"
              class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out text-sm mt-6" >
              Réinitialiser les filtres
            </button>
          </div>
        </aside>

        <div class="lg:w-4/5"> <div class="flex items-center justify-between mb-6">
            <input
              type="text"
              v-model="filters.searchInput"
              @keyup.enter="applyFilters"
              class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-2 px-4 text-sm" placeholder="Rechercher des formations..."
            />
            <button
              @click="applyFilters"
              class="ml-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out text-sm" >
              Rechercher
            </button>
          </div>

          <div v-if="formationsStore.isLoading" class="text-center py-10 text-gray-500 font-medium">Chargement des formations...</div>
          <div v-else-if="formationsStore.error" class="text-center text-red-600 text-lg">{{ formationsStore.error }}</div>
          <div v-else-if="filteredFormations.length === 0" class="text-center py-16 bg-white rounded-lg border border-dashed">
            <h3 class="text-xl font-semibold text-[#423B71]">Aucune formation trouvée avec les critères actuels.</h3>
            <p class="text-gray-500 mt-2">Essayez d'ajuster vos filtres.</p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="formation in filteredFormations"
              :key="formation._id"
              class="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105 duration-200 ease-in-out cursor-pointer"
              @click="viewFormationDetails(formation._id)"
            >
              <img
                :src="formation.image || '/default-formation.png'"
                alt="Image de la formation"
                class="w-full h-48 object-cover"
              />
              <div class="p-4">
                <h3 class="text-xl font-semibold text-gray-800 mb-2 truncate">{{ formation.title }}</h3>
                <p class="text-sm text-gray-600 mb-3 ellipsis">{{ formation.descriptionCourte || formation.description || 'Pas de description.' }}</p>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span v-if="formation.domain" class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">{{ formation.domain }}</span>
                  <span v-for="tag in formation.tags" :key="tag" class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">#{{ tag }}</span>
                  <span v-if="(formation.category as PopulatedCategory)?.name" class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Catégorie: {{ (formation.category as PopulatedCategory).name }}</span>
                </div>
                <div class="flex items-center text-sm text-gray-700 mt-3">
                  <i class="fas fa-user-circle mr-2 text-gray-500"></i>
                  <span>{{ formation.createdBy?.prenom }} {{ formation.createdBy?.nom }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useFormationsStore } from '../stores/formations';
import { useCategoriesStore } from '../stores/categories';
import { useUserStore } from '../stores/user';

import type { Formation, PopulatedCategory } from '../stores/formations';
import type { PopulatedUser } from '../stores/formationBuilder';
import type { Category } from '../stores/categories';

// Stores
const formationsStore = useFormationsStore();
const categoriesStore = useCategoriesStore();
const userStore = useUserStore();

const router = useRouter();

// Filtres locaux pour la page Explore
const filters = ref({
  searchInput: '', // Pour la barre de recherche textuelle
  selectedDomains: [] as string[], // MODIFIÉ: Tableau pour choix multiples de domaines
  tagsInput: '', // Input text pour les tags séparés par des virgules
  categoryId: null as string | null, // Reste un select single-choice pour l'instant
});

// Liste des domaines disponibles (doit correspondre à l'enum du modèle Formation)
const domains = [
  'Business', 'Informatique', 'Langues', 'Énergie & Environnement',
  'Arts et Design', 'Sciences Humaines'
];

// Formations filtrées affichées sur la page
const filteredFormations = computed(() => {
  return formationsStore.formations; // Le store nous donne déjà la liste filtrée par l'API
});


onMounted(async () => {
  // Charger les catégories pour le filtre
  await categoriesStore.fetchCategories();
  // Charger les formations publiques au montage de la page (avec les filtres initiaux)
  await applyFilters();
});


// Watcher pour déclencher le filtre quand les valeurs des filtres changent
let filterTimeout: ReturnType<typeof setTimeout> | null = null;
watch(filters.value, () => { // Watch sur l'objet ref lui-même
  if (filterTimeout) {
    clearTimeout(filterTimeout);
  }
  filterTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
}, { deep: true }); // Watch en profondeur pour les changements d'objet

// Appliquer les filtres en appelant l'action du store
const applyFilters = async () => {
  // Transformer la chaîne de tags en tableau
  const tagsArray = filters.value.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

  // Les domaines sélectionnés sont maintenant un tableau
  const domainsToFilter = filters.value.selectedDomains.join(','); // Joindre les domaines par virgule pour l'API

  await formationsStore.fetchFormations(
    null, // Pas de userId spécifique pour Explore (c'est public)
    'approved', // Filtrer par validationStatus: 'approved'
    domainsToFilter, // Passe la chaîne de domaines
    tagsArray,
    true, // publicOnly = true
  );
};

// Réinitialiser tous les filtres
const resetFilters = async () => {
  filters.value.searchInput = '';
  filters.value.selectedDomains = []; // Réinitialiser à un tableau vide
  filters.value.tagsInput = '';
  filters.value.categoryId = null;
  await applyFilters(); // Appliquer les filtres réinitialisés
};

// Naviguer vers la page de détails de la formation publique
const viewFormationDetails = (formationId: string) => {
  router.push({ name: 'formation-public-page', params: { id: formationId } });
};
</script>

<style scoped>
.ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent; }
</style>
