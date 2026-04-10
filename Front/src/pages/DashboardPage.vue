<template>
  <div>
    <TheHeader pageTitle="Tableau de bord" :showBackButton="false" />

    <main class="p-6 md:p-8">
  <div v-if="!['admin', 'ecole'].includes(userStore.userRole)" class="mb-8">
    <h1 class="text-3xl font-bold text-[#423B71]">
      Tableau de bord
      <span v-if="etablissementName" class="text-gray-500">- {{ etablissementName }}</span>
    </h1>
    <p class="text-gray-600 mt-1">Votre espace centralisé pour suivre vos activités et votre progression.</p>
  </div>

  <div v-if="userStore.isAuthenticated">
    <component :is="dashboardComponent" :ecole-id="ecoleIdForDashboard" />
  </div>
  <div v-else>
    <p class="text-center text-gray-500">Chargement des informations utilisateur...</p>
  </div>
</main>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useUserStore } from '../stores/user';
import TheHeader from '../components/TheHeader.vue';

const userStore = useUserStore();

const AdminDashboard = defineAsyncComponent(() => import('../components/dashboards/AdminDashboard.vue'));
const FormateurDashboard = defineAsyncComponent(() => import('../components/dashboards/FormateurDashboard.vue'));
const ApprenantDashboard = defineAsyncComponent(() => import('../components/dashboards/ApprenantDashboard.vue'));
const EcoleDashboard = defineAsyncComponent(() => import('../components/dashboards/EcoleDashboard.vue'));

const ecoleIdForDashboard = computed(() => {
  const role = userStore.userRole;
  if (role === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext._id;
  }
  if ((role === 'ecole' || role === 'entreprise') && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity._id;
  }
  return null;
});

const etablissementName = computed(() => {
  const role = userStore.userRole;
  if (role === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext.nom;
  }
  if ((role === 'ecole' || role === 'entreprise') && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity.nom;
  }
  return '';
});

const dashboardComponent = computed(() => {
  const role = userStore.userRole;

  if (role === 'admin' && userStore.adminSelectedContext) {
    return EcoleDashboard;
  }

  switch (role) {
    case 'admin':
      return AdminDashboard;
    case 'formateur':
      return FormateurDashboard;
    case 'apprenant':
      return ApprenantDashboard;
    case 'ecole':
    case 'entreprise':
      return EcoleDashboard;
    default:
      return null;
  }
});
</script>