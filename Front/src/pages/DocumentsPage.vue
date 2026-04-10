<script setup lang="ts">
import { computed } from 'vue';
import TheHeader from '../components/TheHeader.vue';
import { useUserStore } from '../stores/user';

const userStore = useUserStore();
const isStaff = computed(() => ['admin', 'ecole', 'formateur'].includes(userStore.userRole));

const etablissementName = computed(() => {
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext.nom;
  }
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity.nom;
  }
  return '';
});
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">
    <TheHeader pageTitle="Espace Documents" :showBackButton="false" />

    <main class="p-6 md:p-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl md:text-4xl font-black text-[#423B71] tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2 break-words">
            Documents
            <span v-if="etablissementName" class="text-gray-400 font-medium text-xl sm:text-2xl truncate">
              <span class="hidden sm:inline">-</span> {{ etablissementName }}
            </span>
          </h1>
          <p class="text-sm text-gray-500 mt-2 font-medium">
            {{ isStaff ? 'Gérez les ressources pédagogiques, les travaux et la conformité.' : 'Consultez vos supports de cours, attestations et diplômes.' }}
          </p>
        </div>
      </div>

      <div v-if="isStaff" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link to="/gestion-ressources" class="staff-card group border-l-4 border-l-[#B2E9E1]">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold text-[#423B71] mb-1">Bibliothèque Pédagogique</h2>
              <p class="text-gray-500 text-sm leading-relaxed">Uploadez et organisez les supports par formation.</p>
            </div>
            <div class="w-12 h-12 bg-[#B2E9E1]/10 text-[#423B71] rounded-xl flex items-center justify-center group-hover:bg-[#B2E9E1] transition-colors">
              <i class="fas fa-folder-plus text-xl"></i>
            </div>
          </div>
        </router-link>

       <router-link to="/suivi-devoirs" class="staff-card group border-l-4 border-l-indigo-400">
  <div class="flex items-start justify-between">
    <div>
      <h2 class="text-xl font-bold text-[#423B71] mb-1 tracking-tight">Centre de Correction</h2>
      <p class="text-gray-500 text-sm leading-relaxed">Suivez les rendus et gérez les corrections de vos cohortes.</p>
    </div>
    <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
      <i class="fas fa-tasks text-xl"></i>
    </div>
  </div>
</router-link>

        <router-link to="/evaluations-hub" v-if="userStore.userRole !== 'formateur'" class="staff-card group border-l-4 border-l-orange-400">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold text-[#423B71] mb-1">Conformité Qualiopi</h2>
              <p class="text-gray-500 text-sm leading-relaxed">Gérez les tests et questionnaires de satisfaction.</p>
            </div>
            <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <i class="fas fa-clipboard-check text-xl"></i>
            </div>
          </div>
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link to="/mes-ressources" class="student-card group">
          <div class="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <i class="fas fa-rocket text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-[#423B71] mb-2">Mes Ressources</h2>
          <p class="text-gray-500 text-sm font-medium">Récupérez vos cours et envoyez vos devoirs.</p>
        </router-link>

        <router-link to="/certificats" class="student-card group">
          <div class="w-16 h-16 bg-teal-50 text-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <i class="fas fa-star text-2xl"></i>
          </div>
          <h2 class="text-xl font-bold text-[#423B71] mb-2">Mes Succès</h2>
          <p class="text-gray-500 text-sm font-medium">Retrouvez vos attestations et diplômes.</p>
        </router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.staff-card {
  @apply block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300;
}
.student-card {
  @apply block p-8 bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-500;
}
</style>