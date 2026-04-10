<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useProgressionStore } from '../stores/progressionStore';
import TheHeader from '../components/TheHeader.vue'; 

const route = useRoute();
const progressionStore = useProgressionStore();


const sessionId = route.params.id as string;

const isLoading = computed(() => progressionStore.isLoading);
const progressions = computed(() => progressionStore.progressions);

// Au chargement de la page, on va chercher les données
onMounted(() => {
  if (sessionId) {
    progressionStore.fetchProgressionForSession(sessionId);
  }
});
</script>

<template>
  <div class="page-container">
    <TheHeader
      pageTitle="Suivi de la session"
      :showBackButton="true"
      backButtonRoute="/sessions"
    />

    <main class="flex-1 p-6 md:p-8">
      <h1 class="text-3xl font-bold text-[#423B71] mb-6">Suivi des Apprenants</h1>

      <div v-if="isLoading" class="text-center">
        <p>Chargement du suivi...</p>
      </div>

      <div v-else-if="progressions.length > 0">
        <div class="bg-gray-100 p-4 rounded-lg">
          <h2 class="font-bold mb-2">Données brutes de progression :</h2>
          <pre>{{ progressions }}</pre>
        </div>
        
        </div>

      <div v-else class="text-center text-gray-500">
        <p>Aucune donnée de progression à afficher pour cette session.</p>
      </div>
    </main>
  </div>
</template>