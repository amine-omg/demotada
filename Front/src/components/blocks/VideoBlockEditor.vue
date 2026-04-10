<template>
  <div class="p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
    <div class="mb-4">
      <label for="block-title" class="block text-sm font-medium text-gray-700 mb-2">Titre du bloc (optionnel)</label>
      <input type="text" id="block-title" v-model="editableData.title" class="input-field" placeholder="Ex: Vidéo de démonstration" />
    </div>
    <div class="mb-4">
      <label for="video-url" class="block text-sm font-medium text-gray-700 mb-2">URL de la vidéo YouTube</label>
      <input type="text" id="video-url" v-model="editableData.src" class="input-field" placeholder="https://www.youtube.com/watch?v=..." />
    </div>
    <div class="flex justify-end space-x-3">
      <button @click="$emit('cancel')" class="btn-secondary">Annuler</button>
      <button @click="$emit('save', editableData)" class="btn-primary">Ajouter le bloc</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ block: any }>();
defineEmits(['save', 'cancel']);

const editableData = ref({
  title: props.block?.title || '',
  src: props.block?.src || ''
});
</script>
