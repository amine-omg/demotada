<template>
  <router-view />
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user'; // Import du store Pinia
import OnboardingModal from './components/OnboardingModal.vue'; // App.vue est dans 'src/', OnboardingModal dans 'src/components/'

const router = useRouter();
const userStore = useUserStore(); // Utilisation du store

// Pinia gère déjà le state global, donc provide n'est plus nécessaire pour userRole et userPhotoUrl
// provide('userRole', userRole);
// provide('userPhotoUrl', userPhotoUrl);

// La logique de chargement initial est maintenant gérée par le store Pinia lui-même
// Via les getters du store, les composants peuvent accéder aux données réactives.
// La fonction loadUserRoleAndPhoto() n'est plus nécessaire ici.

onMounted(() => {
  // Au montage de l'application, le store userStore est déjà initialisé et a lu localStorage
  // Si vous avez besoin d'une logique spécifique ici, ajoutez-la.
  console.log('App.vue: Application montée. Store utilisateur initialisé.');
});

// Écouter les changements de route pour gérer les déconnexions/nettoyages spécifiques
watch(router.currentRoute, (to, from) => {
  console.log('App.vue: Changement de route détecté.');
  // Si la navigation est vers la page de login ou d'inscription, on s'assure de vider l'état via le store
  if (to.name === 'login' || to.name === 'register') {
    userStore.logout(); // Utilise l'action de déconnexion du store pour nettoyer localStorage et l'état du store
    console.log('App.vue: Déconnexion forcée via route login/register.');
  }
  // Pas besoin de recharger manuellement ici, car Pinia gère la réactivité et lit localStorage à l'initialisation
});

// Les watchers sur userRole et userPhotoUrl ne sont plus nécessaires ici car ils sont gérés par le store
// et les composants les lisent directement du store.
// watch(userRole, (newRole, oldRole) => {
//   console.log(`App.vue: userRole changed from "${oldRole}" to "${newRole}" (via watch)`);
// });
// watch(userPhotoUrl, (newUrl, oldUrl) => {
//   console.log(`App.vue: userPhotoUrl changed from "${oldUrl}" to "${newUrl}" (via watch)`);
// });
</script>
