<template>
  <div class="p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label for="title-text" class="block text-sm font-medium text-gray-700 mb-2">
          Texte du titre
        </label>
        <input
          type="text"
          id="title-text"
          v-model="editableData.text"
          :class="titleSizeClass"
          class="input-field transition-all duration-200"
          placeholder="Votre titre..."
        />
      </div>
      <div>
        <label for="title-level" class="block text-sm font-medium text-gray-700 mb-2">
          Taille
        </label>
        <select id="title-level" v-model="editableData.level" class="input-field">
          <option value="h1">Titre 1 (Très grand)</option>
          <option value="h2">Titre 2 (Grand)</option>
          <option value="h3">Titre 3 (Moyen)</option>
          <option value="h4">Titre 4 (Petit)</option>
          <option value="h5">Titre 5 (Très petit)</option>
        </select>
      </div>
    </div>

    <div class="flex justify-end space-x-3 mt-6">
      <button @click="$emit('cancel')" class="btn-secondary">Annuler</button>
      <button @click="$emit('save', editableData)" class="btn-primary">Ajouter le bloc</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{ block: any }>();
defineEmits(['save', 'cancel']);

const editableData = ref({
  text: props.block?.text || '',
  level: props.block?.level || 'h2', 
});

const titleSizeClass = computed(() => {
  switch (editableData.value.level) {
    case 'h1': return 'text-4xl font-bold';
    case 'h2': return 'text-3xl font-bold';
    case 'h3': return 'text-2xl font-semibold';
    case 'h4': return 'text-xl font-semibold';
    case 'h5': return 'text-lg font-medium';
    default: return 'text-3xl font-bold';
  }
});
</script>
