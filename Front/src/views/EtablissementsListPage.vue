<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useEtablissementsStore } from '../stores/etablissementsStore';
import TheHeader from '../components/TheHeader.vue';

const store = useEtablissementsStore();
const router = useRouter();

const showCreateModal = ref(false);
const newEtablissementNom = ref('');
const error = ref(false);

onMounted(() => {
  store.fetchEtablissements();
});

const openCreateModal = () => {
  newEtablissementNom.value = '';
  error.value = false;
  showCreateModal.value = true;
};

const handleCreate = async () => {
  if (!newEtablissementNom.value.trim()) {
    error.value = true;
    return;
  }
  try {
    await store.createEtablissement({ nom: newEtablissementNom.value });
    showCreateModal.value = false;
  } catch (err) {
    alert("Une erreur est survenue lors de la création.");
  }
};

const goToEtablissement = (id: string) => {
  router.push(`/etablissements/${id}`);
};
</script>

<template>
  <div class="page-container">
    <TheHeader pageTitle="Gestion des Établissements" />

    <main class="flex-1 p-6 md:p-8">
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-[#423B71]">Établissements</h1>
          <p class="text-sm text-gray-600 mt-1">Gérez tous les établissements de la plateforme.</p>
        </div>
        <button @click="openCreateModal" class="btn-primary">Ajouter un établissement</button>
      </div>

      <div class="bg-white p-4 rounded-lg shadow">
        <div v-if="store.isLoading" class="text-center py-8">Chargement...</div>
         <ul v-else class="divide-y divide-gray-200">
          <li v-for="etablissement in store.etablissements" :key="etablissement._id" @click="goToEtablissement(etablissement._id)" class="py-3 px-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
            
            <div class="flex items-center">
              <div class="flex-shrink-0 h-20 w-40 mr-4">
                <img v-if="etablissement.logoUrl" :src="etablissement.logoUrl" :alt="etablissement.nom" class="h-20 w-40 rounded-md object-contain border">
                <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5h1v5h-1z"></path></svg>
                </div>
              </div>
              <span class="font-medium text-gray-800">{{ etablissement.nom }}</span>
            </div>
            
            <span class="text-sm text-gray-500 capitalize">{{ etablissement.statut }}</span>
          </li>
        </ul>
      </div>
    </main>

    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50" @click="showCreateModal = false">
      <div class="bg-[#DCD8F4] rounded-lg shadow-2xl w-full max-w-lg p-8" @click.stop>
        <h3 class="text-3xl font-bold text-[#423B71] mb-2 text-center">Nouvel établissement</h3>
        <p class="text-center text-gray-700 mb-8">Entrez le nom du nouvel établissement.</p>
        <form @submit.prevent="handleCreate">
          <label for="etablissement-nom" class="label">Nom de l'établissement</label>
          <input type="text" v-model="newEtablissementNom" id="etablissement-nom" class="input-field p-3" :class="{'border-red-500': error}" placeholder="Ex: Académie Flamingo">
          <p v-if="error" class="text-red-500 text-xs mt-1">Le nom est requis.</p>
          <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 pt-6">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">Annuler</button>
            <button type="submit" class="btn-primary">Créer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>