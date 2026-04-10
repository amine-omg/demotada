<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  block: any;
}>();

const emit = defineEmits(['edit-block', 'save-block', 'cancel-block']);

const editedSrc = ref(props.block.src || '');

const save = () => {
  emit('save-block', { src: editedSrc.value });
};

const cancel = () => {
    if (!props.block._id) {
        emit('cancel-block');
    } else { 
        editedSrc.value = props.block.src;
        emit('cancel-block');
    }
}
</script>

<template>
  <div class="bg-white p-6 rounded-lg border group relative hover:border-purple-300 transition-colors">
    <!-- Mode Affichage -->
    <div v-if="!block.isEditing">
      <div v-if="block.src" class="flex items-center space-x-4">
        <div class="flex-shrink-0">
          <i class="fab fa-google-drive text-4xl text-blue-500"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-800">Document Google Docs</p>
          <a :href="block.src" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline truncate block">
            {{ block.src }}
          </a>
        </div>
      </div>
      <div v-else class="text-center text-gray-400 italic py-8">
        Aucun document lié. Cliquez pour en ajouter un.
      </div>
      <button @click="emit('edit-block')" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-200">
        Modifier
      </button>
    </div>

    <!-- Mode Édition -->
    <div v-else>
      <label class="font-semibold text-sm text-gray-600 mb-1 block">Lien du Google Doc</label>
      <input
        v-model="editedSrc"
        type="text"
        class="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
        placeholder="https://docs.google.com/document/d/..."
      />
      <p class="text-xs text-gray-500 mt-1">Assurez-vous que le document est bien partagé en mode "Lecteur" pour tous les utilisateurs ayant le lien.</p>
      <div class="mt-3 flex justify-end space-x-2">
        <button @click="cancel" class="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-300">Annuler</button>
        <button @click="save" class="px-4 py-1.5 bg-teal-500 text-white rounded-md text-sm font-semibold hover:bg-teal-600">Enregistrer</button>
      </div>
    </div>
  </div>
</template>
