<template>
  <router-view />
</template>

<script setup lang="ts">
import { ref, provide, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from './stores/user'; 
import OnboardingModal from './components/OnboardingModal.vue';

const router = useRouter();
const userStore = useUserStore(); 

onMounted(() => {
  console.log('App.vue: Application montée. Store utilisateur initialisé.');
});

watch(router.currentRoute, (to, from) => {
  console.log('App.vue: Changement de route détecté.');
  if (to.name === 'login' || to.name === 'register') {
    userStore.logout(); 
    console.log('App.vue: Déconnexion forcée via route login/register.');
  }
});

</script>
