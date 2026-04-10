<script setup lang="ts">
import { ref, watch } from 'vue';

import api from '/services/api';
import type { Lieu } from '../../../stores/lieuxStore';

const props = defineProps<{
  showModal: boolean;
  lieuToDelete: Lieu | null;
}>();

const emit = defineEmits(['close', 'confirm-delete']);

const isLoading = ref(false);
const conflictingSessions = ref<any[]>([]);
const error = ref<string | null>(null);

// Ce watcher se déclenche à l'ouverture du modal
watch(() => props.lieuToDelete, async (newLieu) => {
  if (newLieu) {
    isLoading.value = true;
    error.value = null;
    conflictingSessions.value = [];
    try {
      // On appelle notre nouvelle route API
      const response = await api.get(`/api/lieux/${newLieu._id}/conflicting-sessions`);
      conflictingSessions.value = response.data;
    } catch (e) {
      console.error("Erreur lors de la vérification des sessions:", e);
      error.value = "Impossible de vérifier les sessions liées à ce lieu.";
    } finally {
      isLoading.value = false;
    }
  }
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
    <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-4">Supprimer le lieu</h2>
      
      <div v-if="isLoading" class="text-center py-8">
        <p>Vérification des sessions en cours...</p>
      </div>
      
      <div v-else-if="error" class="text-red-500 py-4">
        <p>{{ error }}</p>
      </div>

      <div v-else-if="conflictingSessions.length > 0">
        <p class="text-gray-700 mb-4">
          Le lieu <strong class="font-semibold">{{ lieuToDelete?.nom }}</strong> ne peut pas être supprimé car il est utilisé dans les sessions suivantes :
        </p>
        <ul class="list-disc list-inside bg-yellow-50 border border-yellow-200 p-4 rounded-md max-h-40 overflow-y-auto">
          <li v-for="session in conflictingSessions" :key="session._id">
            {{ session.title }} (début le {{ formatDate(session.dateDebut) }})
          </li>
        </ul>
        <div class="flex justify-end mt-6">
          <button @click="$emit('close')" class="btn-secondary">Fermer</button>
        </div>
      </div>
      
      <div v-else>
        <p class="text-gray-700">
          Êtes-vous sûr de vouloir supprimer définitivement le lieu <strong class="font-semibold">{{ lieuToDelete?.nom }}</strong> ?
          <br>Cette action est irréversible.
        </p>
        <div class="flex justify-end gap-4 mt-6">
          <button @click="$emit('close')" class="btn-secondary">Annuler</button>
          <button @click="$emit('confirm-delete')" class="btn-danger">Oui, supprimer</button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.btn-secondary { @apply bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300; }
.btn-danger { @apply bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700; }
</style>