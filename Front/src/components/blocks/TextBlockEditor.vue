<template>
  <div class="p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
    <div class="mb-4">
      <label for="block-title" class="block text-sm font-medium text-gray-700 mb-2">Titre du bloc (optionnel)</label>
      <input type="text" id="block-title" v-model="editableData.title" class="input-field" placeholder="Ex: Introduction" />
    </div>
    <div class="mb-4">
      <label for="block-content" class="block text-sm font-medium text-gray-700 mb-2">Contenu du texte</label>
      <textarea id="block-content" v-model="editableData.content" class="input-field min-h-[150px]" placeholder="Écrivez votre texte ici..."></textarea>
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
  content: props.block?.content || ''
});
</script>
