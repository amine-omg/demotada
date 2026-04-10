<script setup lang="ts">
import { useCoursStore } from '../../stores/coursStore';
import type { Cours } from '../../stores/coursStore'; 

const props = defineProps<{
  cours: Cours;
}>();

const coursStore = useCoursStore();

const handleForceLive = async () => {
  try {
    await coursStore.forceCoursLive(props.cours._id);
    alert(`Le cours "${props.cours.title}" est maintenant en direct ! La bannière en haut de la page devrait se mettre à jour.`);
  } catch (error) {
    console.error(error);
    alert("Une erreur est survenue lors du forçage du cours.");
  }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
    <div>
      <p class="font-bold text-gray-800">{{ cours.title }}</p>
      <p class="text-sm text-gray-500">{{ formatDate(cours.date) }}</p>
    </div>
    <button @click="handleForceLive" class="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300">
      Forcer le direct (Test)
    </button>
  </div>
</template>
