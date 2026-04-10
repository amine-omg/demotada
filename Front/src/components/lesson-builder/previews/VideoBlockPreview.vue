<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  block: any;
}>();

const emit = defineEmits(['edit-block', 'save-block', 'cancel-block']);

const editedSrc = ref(props.block.src || '');

// Fonction pour extraire l'ID de la vidéo et créer un lien embed propre
const embedUrl = computed(() => {
  if (!props.block.src) return '';
  const url = props.block.src;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url; // Retourne l'URL brute si ce n'est pas un lien YT classique
});

const save = () => {
  emit('save-block', { src: editedSrc.value });
};

const cancel = () => {
    if (!props.block._id) {
        emit('cancel-block'); // Annule la création si le bloc est nouveau
    } else { 
        editedSrc.value = props.block.src;
        emit('cancel-block'); // Restaure l'ancienne valeur si c'était une édition
    }
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg border group relative hover:border-red-300 transition-colors">
    
    <div v-if="!block.isEditing">
      <div v-if="block.src" class="w-full aspect-video rounded-md overflow-hidden bg-gray-100">
        <iframe 
          width="100%" 
          height="100%" 
          :src="embedUrl" 
          title="YouTube video player" 
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
      <div v-else class="text-center text-gray-400 italic py-8">
        <i class="fab fa-youtube text-4xl text-red-300 mb-2 block"></i>
        Aucune vidéo liée. Cliquez pour en ajouter une.
      </div>
      <button @click="emit('edit-block')" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-200">
        Modifier
      </button>
    </div>

    <div v-else>
      <label class="font-semibold text-sm text-gray-600 mb-1 block">Lien de la vidéo YouTube</label>
      <input
        v-model="editedSrc"
        type="text"
        class="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-300 focus:border-red-400 transition"
        placeholder="https://www.youtube.com/watch?v=..."
      />
      <p class="text-xs text-gray-500 mt-1">Collez le lien direct de la vidéo YouTube.</p>
      
      <div class="mt-4 flex justify-end space-x-2">
        <button @click="cancel" class="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-300">Annuler</button>
        <button @click="save" class="px-4 py-1.5 bg-red-500 text-white rounded-md text-sm font-semibold hover:bg-red-600">Enregistrer</button>
      </div>
    </div>
    
  </div>
</template>