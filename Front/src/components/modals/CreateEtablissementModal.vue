<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits(['close', 'create']);

const nomEtablissement = ref('');

const submit = () => {
  if (nomEtablissement.value.trim()) {
    emit('create', nomEtablissement.value.trim());
    nomEtablissement.value = ''; // Reset
  }
};
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4">Créer votre Établissement</h2>
      <p class="mb-6 text-gray-600">Entrez le nom de votre école ou organisme de formation.</p>
      <form @submit.prevent="submit">
        <div>
          <label for="nom" class="block text-sm font-medium text-gray-700">Nom de l'établissement</label>
          <input 
            type="text" 
            v-model="nomEtablissement" 
            id="nom"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
            required
          />
        </div>
        <div class="mt-8 flex justify-end gap-4">
          <button type="button" @click="$emit('close')" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Créer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.btn-primary { @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-4 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300; }
.btn-secondary { @apply bg-white text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-300; }
</style>