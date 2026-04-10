<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useForumStore } from '../stores/forumStore'; 
import { useUserStore } from '../stores/user'; 

const forumStore = useForumStore();
const userStore = useUserStore();
const router = useRouter();

const showCreateSujetModal = ref(false);
const newSujetTitle = ref('');
const newSujetContent = ref('');
const newSujetCategory = ref('Discussion générale'); 
const sujetTitleError = ref(false);
const sujetContentError = ref(false);

const forumCategories = [
  'Discussion générale',
  'Support technique',
  'Suggestions',
  'Annonces',
  'Questions & Réponses',
];

const sujets = computed(() => forumStore.getSortedSujets);
const isLoading = computed(() => forumStore.isLoading);
const isPosting = computed(() => forumStore.isPosting);
const error = computed(() => forumStore.error);
const currentUserId = computed(() => userStore.user.id);

onMounted(async () => {
  if (currentUserId.value) {
    await forumStore.fetchAllSujets();
  } else {
    const stopWatching = watch(currentUserId, async (newId) => {
      if (newId) {
        await forumStore.fetchAllSujets();
        stopWatching();
      }
    }, { immediate: true });
  }
});

const openCreateSujetModal = () => {
  showCreateSujetModal.value = true;
  newSujetTitle.value = '';
  newSujetContent.value = '';
  newSujetCategory.value = 'Discussion générale';
  sujetTitleError.value = false;
  sujetContentError.value = false;
};

const closeCreateSujetModal = () => {
  showCreateSujetModal.value = false;
};

const createSujet = async () => {
  sujetTitleError.value = false;
  sujetContentError.value = false;

  if (!newSujetTitle.value.trim()) {
    sujetTitleError.value = true;
    return;
  }
  if (!newSujetContent.value.trim()) {
    sujetContentError.value = true;
    return;
  }

  try {
    await forumStore.createSujet(newSujetTitle.value.trim(), newSujetContent.value.trim(), newSujetCategory.value);
    closeCreateSujetModal();
    alert('Sujet créé avec succès !');
  } catch (err) {
    alert('Erreur lors de la création du sujet. Voir console.');
    console.error('Erreur createSujet (frontend):', err);
  }
};

const viewSujet = (sujetId: string) => {
  router.push({ name: 'sujet-detail', params: { sujetId: sujetId } });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getAuthorPhoto = (author: any) => {
  return (author && author.photo) ? author.photo : '/default-avatar.png'; 
};
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <TheHeader pageTitle="Communauté" :showBackButton="false" />

    <main class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-[#423B71] mb-2">Bienvenue dans la Communauté</h1>
        <p class="text-lg text-gray-600">Échangez, posez vos questions et partagez vos connaissances.</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <aside class="lg:w-1/4 bg-[#DCD8F4] p-6 rounded-lg shadow-md h-fit sticky top-4">
          <h2 class="text-xl font-semibold text-[#423B72] mb-4">Démarrer une discussion</h2>
          <button
            @click="openCreateSujetModal"
            class="w-full bg-[#B3E9E1] text-[#423B72] font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center hover:bg-[#FF8B7D]"
          >
            <i class="fas fa-plus mr-2"></i>
            Créer un sujet
          </button>
        </aside>

        <div class="lg:w-3/4">
          <div v-if="isLoading" class="text-center py-10 text-gray-500 font-medium">Chargement des sujets...</div>
          <div v-else-if="error" class="text-center text-red-600 text-lg">{{ error }}</div>
          <div v-else-if="sujets.length === 0" class="text-center py-16 bg-white rounded-lg border border-dashed">
            <h3 class="text-xl font-semibold text-[#423B71]">Aucun sujet de discussion pour le moment.</h3>
            <p class="text-gray-500 mt-2">Soyez le premier à lancer une discussion !</p>
          </div>
          <div v-else class="space-y-6">
            <div
              v-for="sujet in sujets"
              :key="sujet._id"
              @click="viewSujet(sujet._id)"
              class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            >
              <div class="flex items-center mb-3">
                <img :src="getAuthorPhoto(sujet.author)" alt="Avatar" class="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200">
                <div>
                  <h3 class="text-xl font-semibold text-gray-800">{{ sujet.title }}</h3>
                  <p class="text-sm text-gray-600">Par {{ sujet.author?.prenom || 'Utilisateur' }} {{ sujet.author?.nom || 'inconnu' }} - {{ formatDate(sujet.createdAt) }}</p>
                  <span class="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium mt-2 inline-block">{{ sujet.category }}</span>
                </div>
              </div>
              <p class="text-gray-700 mb-3 ellipsis">{{ sujet.content }}</p>
              <div class="flex justify-between items-center text-sm text-gray-500">
                <span>Catégorie: <span class="font-medium">{{ sujet.category }}</span></span>
                <span>Dernière activité: <span class="font-medium">{{ formatDate(sujet.lastReplyAt) }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="showCreateSujetModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300" @click.self="closeCreateSujetModal">
      <div class="bg-[#DCD8F4] rounded-lg shadow-2xl w-full max-w-lg p-8 transform transition-all duration-300" @click.stop>
        <h3 class="text-2xl font-bold text-[#423B71] mb-4">Créer un nouveau sujet</h3>
        <form @submit.prevent="createSujet" class="space-y-4">
          <div>
            <label for="sujet-title" class="block text-sm font-medium text-gray-700 mb-1">Titre du sujet</label>
            <input
              type="text"
              id="sujet-title"
              v-model="newSujetTitle"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              :class="{'border-red-500 ring-red-500': sujetTitleError}"
              placeholder="Ex: Problème avec le Lesson Builder"
            />
            <p v-if="sujetTitleError" class="text-red-500 text-xs mt-1">Le titre du sujet est requis.</p>
          </div>
          <div>
            <label for="sujet-content" class="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
            <textarea
              id="sujet-content"
              v-model="newSujetContent"
              rows="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              :class="{'border-red-500 ring-red-500': sujetContentError}"
              placeholder="Décrivez votre question ou votre discussion..."
            ></textarea>
            <p v-if="sujetContentError" class="text-red-500 text-xs mt-1">Le contenu du sujet est requis.</p>
          </div>
          <div>
            <label for="sujet-category" class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              id="sujet-category"
              v-model="newSujetCategory"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              <option v-for="cat in forumCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="closeCreateSujetModal" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700" :disabled="isPosting">
              <span v-if="isPosting">Création...</span>
              <span v-else>Créer le sujet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
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
