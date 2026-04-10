<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="text-center p-8 bg-white shadow-lg rounded-lg">
      <h1 class="text-6xl font-bold text-red-500 mb-4">404</h1>
      <p class="text-xl text-gray-700 mb-6">Page non trouvée</p>
      <p class="text-gray-600 mb-8">Désolé, la page que vous recherchez n'existe pas.</p>
      <router-link to="/" class="btn-primary">Retour à l'accueil</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pas de logique spécifique nécessaire pour une page 404 simple
</script>

<style scoped>
/* Vos styles Tailwind ou autres */
.btn-primary {
  @apply bg-[#F04636] text-white py-2 px-4 rounded-md hover:bg-[#D9382D] transition-colors font-semibold;
}
</style>
