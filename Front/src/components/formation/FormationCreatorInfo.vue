<script setup lang="ts">
import { computed } from 'vue';

interface UserInfo {
  _id: string;
  nom?: string; 
  prenom?: string; 
  photo?: string; 
}

const props = defineProps<{
  createdBy: UserInfo | null; 
  createdAt: string;           
}>();

const authorInitials = computed(() => {
  if (props.createdBy) {
    const firstInitial = props.createdBy.prenom?.charAt(0) || '';
    const lastInitial = props.createdBy.nom?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase() || (props.createdBy.email?.charAt(0) || 'U').toUpperCase(); 
  }
  return '??'; 
});

const formattedCreatedAt = computed(() => {
  if (props.createdAt) {
    const date = new Date(props.createdAt);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
    }
  }
  return 'Date inconnue';
});
</script>

<template>
  <div class="bg-transparent border-transparent p-4 flex flex-col items-center justify-start h-full">
    <h3 class="text-sm font-medium text-gray-700 mb-4">Créé par</h3>

    <div v-if="createdBy && (createdBy.nom || createdBy.prenom || createdBy.photo)" class="flex flex-col items-center">
      <div class="w-20 h-20 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center mb-2">
        <img v-if="createdBy.photo" :src="createdBy.photo" :alt="createdBy.prenom" class="w-full h-full object-cover">
        <span v-else class="text-xl font-medium text-gray-700">{{ authorInitials }}</span>
      </div>
      <p class="text-md font-semibold text-gray-800 text-center">
        {{ createdBy.prenom }} {{ createdBy.nom }}
      </p>
      <p class="text-xs text-gray-500 mt-1 text-center">Le {{ formattedCreatedAt }}</p>
    </div>
    <div v-else class="text-sm text-gray-500 text-center">
      Auteur non défini.
      <p v-if="!createdBy"> (Veuillez créer la formation avec un utilisateur connecté)</p>
    </div>
  </div>
</template>
