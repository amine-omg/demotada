<script setup lang="ts">
const props = defineProps<{
  block: any;
}>();

const emit = defineEmits(['edit-block', 'save-block', 'cancel-block']);

const editedContent = ref(props.block.content || '');

const save = () => {
  emit('save-block', { content: editedContent.value });
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg border hover:border-purple-300">
    <div v-if="!block.isEditing">
      <p v-if="block.content">{{ block.content }}</p>
      <p v-else class="text-gray-400 italic">Aucun texte. Cliquez pour modifier.</p>
      <button @click="emit('edit-block')" class="mt-2 text-sm text-purple-600 hover:text-purple-800">Modifier le texte</button>
    </div>
    <div v-else>
      <textarea v-model="editedContent" class="w-full p-2 border rounded-md" rows="4"></textarea>
      <div class="mt-2 space-x-2">
        <button @click="save" class="px-4 py-1 bg-teal-500 text-white rounded-md text-sm">Enregistrer</button>
        <button @click="emit('cancel-block')" class="px-4 py-1 bg-gray-200 rounded-md text-sm">Annuler</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
export default {
}
</script>
