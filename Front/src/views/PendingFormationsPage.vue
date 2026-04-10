<template>
  <div>
    <TheHeader pageTitle="Formations en attente de validation" :showBackButton="false" />
    <main class="p-6 md:p-8">
      <h1 class="text-3xl font-bold text-[#423B71] mb-6">Formations en attente de validation</h1>
      <p class="text-gray-600 mt-2 mb-8">Liste des formations soumises par les formateurs en attente de votre approbation.</p>

      <div v-if="formationsStore.isLoading" class="text-center py-10 text-gray-500 font-medium">Chargement des formations...</div>
      <div v-else-if="formationsStore.error" class="text-center text-red-600 text-lg">{{ formationsStore.error }}</div>
      <div v-else-if="pendingFormations.length === 0" class="text-center py-16 bg-white rounded-lg border border-dashed">
        <h3 class="text-xl font-semibold text-[#423B71]">Aucune formation en attente de validation.</h3>
        <p class="text-gray-500 mt-2">Toutes les formations ont été validées ou n'ont pas encore été soumises.</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="formation in pendingFormations"
          :key="formation._id"
          class="bg-white rounded-lg shadow-md p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-gray-200"
        >
          <div class="flex-1 flex items-center min-w-0">
            <img
              :src="formation.image || '/default-formation.png'"
              alt="Logo Formation"
              class="w-20 h-20 object-cover rounded-full mr-4 border-2 border-gray-200 flex-shrink-0"
            />
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-semibold text-gray-800 truncate">{{ formation.title }}</h3>
              <p class="text-sm text-gray-600 truncate">{{ formation.descriptionCourte || formation.description || 'Pas de description courte.' }}</p>
              <p class="text-xs text-gray-500 mt-1">Créée par {{ (formation.createdBy as PopulatedUser)?.prenom }} {{ (formation.createdBy as PopulatedUser)?.nom }} le {{ formatDate(formation.createdAt) }}</p>
              <div class="flex flex-wrap gap-2 mt-2">
                <span :class="getStatusDisplay(formation.status).badgeClass" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
                  {{ getStatusDisplay(formation.status).label }}
                </span>
                <span v-if="formation.domain" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ formation.domain }}
                </span>
                <span v-for="tag in formation.tags" :key="tag" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 flex-shrink-0">
            <button @click="viewFormation(formation._id)" class="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
              Voir
            </button>
            <button @click="approveFormation(formation._id)" class="px-4 py-2 text-sm font-medium rounded-md bg-green-500 text-white hover:bg-green-600">
              Approuver
            </button>
            <button @click="rejectFormation(formation._id)" class="px-4 py-2 text-sm font-medium rounded-md bg-red-500 text-white hover:bg-red-600">
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useFormationsStore } from '../stores/formations';
import { useUserStore } from '../stores/user';
import FORMATION_STATUSES from '../constants/statuses.js';

import type { PopulatedUser, Formation } from '../stores/formations'; 

// Stores
const formationsStore = useFormationsStore();
const userStore = useUserStore();
const router = useRouter();

// Computed property pour les formations en attente
const pendingFormations = computed(() => {
  return formationsStore.formations;
});

// Charger les formations en attente au montage du composant
onMounted(async () => {
  if (userStore.user.id && userStore.userRole === 'admin') {
    await formationsStore.fetchFormations(null, 'pending'); // Charger les formations avec validationStatus: 'pending'
  } else {
    router.push('/dashboard');
    alert("Accès non autorisé à cette page.");
  }
});

// Fonctions d'action de validation
const viewFormation = (formationId: string) => {
  router.push({ name: 'formation-public-page', params: { id: formationId }, query: { preview: 'true' } });
};

const approveFormation = async (formationId: string) => {
  if (confirm('Êtes-vous sûr de vouloir approuver cette formation ? Elle sera visible publiquement si son statut de publication est "public".')) {
    try {
      await formationsStore.updateFormationValidationStatus(formationId, 'approved');
      alert('Formation approuvée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'approbation de la formation:', error);
      alert('Erreur lors de l\'approbation de la formation.');
    }
  }
};

const rejectFormation = async (formationId: string) => {
  if (confirm('Êtes-vous sûr de vouloir rejeter cette formation ? Elle ne sera pas visible publiquement.')) {
    const reason = prompt('Veuillez saisir une brève raison de rejet (sera visible par le formateur) :');
    try {
      await formationsStore.updateFormationValidationStatus(formationId, 'rejected');
      alert('Formation rejetée avec succès !');
    } catch (error) {
      console.error('Erreur lors du rejet de la formation:', error);
      alert('Erreur lors du rejet de la formation.');
    }
  }
};

// Fonction d'aide pour afficher le statut de publication existant
const getStatusDisplay = (statusName: string) => {
  return FORMATION_STATUSES.find(s => s.name === statusName) || {
    value: 'default', label: 'Statut inconnu', description: '', dotClass: 'bg-gray-400', badgeClass: 'bg-gray-100 text-gray-800'
  };
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString?: string | Date) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
};
</script>
