<template>
  <div>
    <TheHeader pageTitle="Page Publique de la Formation" :showBackButton="true" backButtonRoute="/explore" />
    <main class="container mx-auto p-6 md:p-8">
      <div v-if="isLoading" class="text-center py-10 text-gray-500 font-medium">Chargement de la formation...</div>
      <div v-else-if="error" class="text-center text-red-600 text-lg">{{ error }}</div>
      <div v-else-if="!formation" class="text-center py-16 bg-white rounded-lg border border-dashed">
        <h3 class="text-xl font-semibold text-[#423B71]">Formation non trouvée ou accès refusé.</h3>
        <p class="text-gray-500 mt-2">Vérifiez l'ID, ou si elle est publique et approuvée.</p>
      </div>

      <div v-else>
        <div v-if="!isPubliclyVisible && isPreviewMode" class="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-300">
            <p class="font-semibold">Statut actuel (visible uniquement par vous) :</p>
            <p v-if="formation.validationStatus === 'pending'" class="text-sm">Cette formation est en attente de validation par un administrateur.</p>
            <p v-else-if="formation.validationStatus === 'rejected'" class="text-sm">Cette formation a été rejetée. Raison : [Notes validateur si implémenté]. Veuillez la modifier et la soumettre à nouveau.</p>
            <p v-else-if="(formation.status === 'draft')" class="text-sm">Cette formation est encore en brouillon et n'est pas soumise à validation.</p>
            <p class="text-xs mt-2">Ce message est visible uniquement en mode aperçu ou si vous êtes admin/propriétaire.</p>
        </div>

        <section class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div v-if="formation.videoPresentation" class="relative w-full" style="padding-top: 56.25%;"> <iframe
              :src="formation.videoPresentation"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              class="absolute top-0 left-0 w-full h-full rounded-t-lg"
            ></iframe>
          </div>
          <img
            v-else
            :src="formation.image || '/default-formation-large.png'"
            alt="Image de la formation"
            class="w-full h-64 object-cover rounded-t-lg"
          />
          <div class="p-6">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ formation.title }}</h1>
            <p class="text-lg text-gray-700 mb-4">{{ formation.descriptionCourte }}</p>
            <div class="flex items-center text-sm text-gray-600">
              <i class="fas fa-user-circle mr-2"></i>
              <span>Par {{ (formation.createdBy as PopulatedUser)?.prenom }} {{ (formation.createdBy as PopulatedUser)?.nom }}</span>
              <span v-if="(formation.category as PopulatedCategory)?.name" class="ml-4 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                Catégorie: {{ (formation.category as PopulatedCategory).name }}
              </span>
              <span v-if="formation.domain" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {{ formation.domain }}
              </span>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span v-for="tag in formation.tags" :key="tag" class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">#{{ tag }}</span>
            </div>
          </div>
        </section>

        <div class="text-center mb-8">
          <button class="bg-[#B3E9E1] text-[#423B72] font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-[#FF8B7D] transition-colors duration-200 text-xl">
            S'inscrire à la formation
          </button>
        </div>

        <section class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Description de la formation</h2>
          <p class="text-gray-700 leading-relaxed">{{ formation.descriptionLongue }}</p>
        </section>

        <section class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Ce que vous apprendrez</h2>
          <p class="text-gray-700 leading-relaxed">{{ formation.objectives || 'Non spécifié.' }}</p>
        </section>

        <section class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">À qui s'adresse cette formation</h2>
          <p class="text-gray-700 leading-relaxed">{{ formation.publicCible || 'Non spécifié.' }}</p>
        </section>

        <section v-if="formation.chapters && formation.chapters.length > 0" class="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Programme de la formation</h2>
          <div class="space-y-4">
            <div v-for="chapter in formation.chapters" :key="chapter._id" class="border border-gray-200 rounded-lg p-4">
              <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ chapter.title }}</h3>
              <ul class="list-disc pl-5 space-y-1 text-gray-700">
                <li v-for="content in chapter.contents" :key="content._id">
                  {{ content.title }} ({{ content.type === 'lesson' ? 'Leçon' : 'Quiz' }})
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '../components/TheHeader.vue';
import { useRoute, useRouter } from 'vue-router';
import { ref, computed, onMounted } from 'vue';
import { useFormationsStore } from '../stores/formations';
import { useUserStore } from '../stores/user';

import type { Formation, PopulatedCategory } from '../stores/formations';
import type { PopulatedUser } from '../stores/formationBuilder'; // Importer PopulatedUser pour le type createdBy (du store FormationBuilder)

// Stores
const formationsStore = useFormationsStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute(); // Récupérer l'instance de la route

const formationId = computed(() => route.params.id as string);
const formation = ref<Formation | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const isPreviewMode = computed(() => route.query.preview === 'true');
const isAdmin = computed(() => userStore.userRole === 'admin');

const isPubliclyVisible = computed(() => {
  return formation.value && formation.value.status === 'public' && formation.value.validationStatus === 'approved';
});

onMounted(async () => {
  if (!formationId.value) {
    error.value = "ID de formation manquant.";
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const fetchedFormation = await formationsStore.fetchFormationById(formationId.value);

    if (fetchedFormation) {
        formation.value = fetchedFormation; // D'abord assigner la formation

        // Logique d'affichage des messages d'avertissement (le backend gère déjà l'accès réel 403)
        // Si ce n'est PAS en mode aperçu ET la formation n'est PAS publiquement approuvée
        if (!isPreviewMode.value && !isPubliclyVisible.value) {
            error.value = "Accès non autorisé à cette formation.";
            formation.value = null; // Cacher les détails si non autorisé
            // Optionnel: router.push('/not-found'); ou router.push('/explore');
        }
    } else {
        error.value = "Formation non trouvée.";
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Erreur lors du chargement de la formation.';
    console.error('Erreur FormationPublicPage:', err);
    if (err.response?.status === 403) {
      error.value = "Accès refusé. Cette formation n'est pas publique ou pas encore validée.";
    } else if (err.response?.status === 404) {
      error.value = "Formation non trouvée.";
    }
    formation.value = null; // S'assurer que la formation n'est pas affichée en cas d'erreur
  } finally {
    isLoading.value = false;
  }
});

const formatDate = (dateString?: string | Date) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
};
</script>

<style scoped>
/* Styles généraux pour l'élégance */
h1, h2, h3, h4, h5 {
  font-family: 'Poppins', sans-serif; /* Assurez-vous que Poppins est importé globalement */
}
.ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
