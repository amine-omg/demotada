<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useForumStore } from '../stores/forumStore';
import { useUserStore } from '../stores/user';

const forumStore = useForumStore();
const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const sujetId = computed(() => route.params.sujetId as string);
const currentSujet = computed(() => forumStore.currentSujet);
const reponses = computed(() => forumStore.getSortedReponses);
const isLoading = computed(() => forumStore.isLoading);
const isPosting = computed(() => forumStore.isPosting);
const error = computed(() => forumStore.error);
const currentUserId = computed(() => userStore.user.id);
const newReponseContent = ref('');
const reponseContentError = ref(false);

const reponsesContainer = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  nextTick(() => {
    if (reponsesContainer.value) {
      reponsesContainer.value.scrollTop = reponsesContainer.value.scrollHeight;
    }
  });
};

onMounted(async () => {
  if (sujetId.value) {
    await forumStore.fetchSujetAndReponses(sujetId.value);
  }
});

watch(reponses, () => {
  scrollToBottom();
});

const postReponse = async () => {
  reponseContentError.value = false;
  if (!newReponseContent.value.trim()) {
    reponseContentError.value = true;
    return;
  }
  if (!currentSujet.value) {
    alert("Aucun sujet sélectionné pour poster une réponse.");
    return;
  }

  try {
    await forumStore.createReponse(currentSujet.value._id, newReponseContent.value.trim());
    newReponseContent.value = ''; // Vider l'input après envoi
    alert('Réponse publiée avec succès !');
  } catch (err) {
    alert('Erreur lors de la publication de la réponse. Voir console.');
    console.error('Erreur postReponse:', err);
  }
};

// Fonction utilitaire pour formater les dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Obtenir la photo de profil de l'auteur
const getAuthorPhoto = (author: any) => {
  return author.photo || '/default-avatar.png'; // Image par défaut si pas de photo
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <TheHeader pageTitle="Forum" :showBackButton="true" backButtonRoute="/communaute" />

    <main class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="text-center py-10 text-gray-500 font-medium">Chargement du sujet...</div>
      <div v-else-if="error" class="text-center text-red-600 text-lg">{{ error }}</div>
      <div v-else-if="!currentSujet" class="text-center py-16 bg-white rounded-lg border border-dashed">
        <h3 class="text-xl font-semibold text-[#423B71]">Sujet non trouvé.</h3>
        <p class="text-gray-500 mt-2">Ce sujet n'existe peut-être pas ou n'est plus accessible.</p>
      </div>
      <div v-else class="flex flex-col lg:flex-row gap-8">
        <!-- Colonne principale: Sujet et Réponses -->
        <div class="lg:w-3/4">
          <!-- Carte du Sujet -->
          <div class="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
            <div class="flex items-center mb-4">
              <img :src="getAuthorPhoto(currentSujet.author)" alt="Avatar" class="w-12 h-12 rounded-full object-cover mr-4">
              <div>
                <h1 class="text-3xl font-bold text-gray-800 mb-1">{{ currentSujet.title }}</h1>
                <p class="text-sm text-gray-600">Par {{ currentSujet.author.prenom }} {{ currentSujet.author.nom }} - {{ formatDate(currentSujet.createdAt) }}</p>
                <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mt-2 inline-block">{{ currentSujet.category }}</span>
              </div>
            </div>
            <hr class="my-4 border-gray-200">
            <p class="text-gray-700 leading-relaxed">{{ currentSujet.content }}</p>
          </div>

          <!-- Section des Réponses -->
          <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Réponses ({{ reponses.length }})</h2>
            <div ref="reponsesContainer" class="max-h-96 overflow-y-auto space-y-4 pr-2">
              <div v-if="reponses.length === 0" class="text-center text-gray-500 py-4">Aucune réponse pour le moment.</div>
              <div
                v-for="reponse in reponses"
                :key="reponse._id"
                class="flex items-start p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <img :src="getAuthorPhoto(reponse.author)" alt="Avatar" class="w-8 h-8 rounded-full object-cover mr-3">
                <div>
                  <p class="font-semibold text-gray-800">{{ reponse.author.prenom }} {{ reponse.author.nom }} <span class="text-xs text-gray-500 ml-2">{{ formatDate(reponse.createdAt) }}</span></p>
                  <p class="text-gray-700 mt-1">{{ reponse.content }}</p>
                </div>
              </div>
            </div>

            <!-- Formulaire pour poster une nouvelle réponse -->
            <div class="mt-6 border-t pt-6 border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Poster une réponse</h3>
              <textarea
                v-model="newReponseContent"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
                :class="{'border-red-500 ring-red-500': reponseContentError}"
                placeholder="Écrivez votre réponse ici..."
              ></textarea>
              <p v-if="reponseContentError" class="text-red-500 text-xs mt-1">Le contenu de la réponse est requis.</p>
              <div class="flex justify-end mt-3">
                <button @click="postReponse" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md" :disabled="isPosting">
                  <span v-if="isPosting">Publication...</span>
                  <span v-else>Publier la réponse</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Colonne de droite: Informations complémentaires (à développer) -->
        <aside class="lg:w-1/4 bg-white p-6 rounded-lg shadow-md h-fit sticky top-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Informations</h2>
          <p class="text-gray-600 text-sm">Plus d'informations sur ce sujet ou des sujets similaires pourraient apparaître ici.</p>
        </aside>
      </div>
    </main>
  </div>
</template>

<style scoped>
.ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limite le texte à 2 lignes */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
