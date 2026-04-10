<template>
  <div class="p-6 bg-white rounded-lg border-2 border-dashed border-gray-300">
    <div class="mb-4">
      <label for="block-title" class="block text-sm font-medium text-gray-700 mb-2">
        Titre du bloc (optionnel)
      </label>
      <input
        type="text"
        id="block-title"
        v-model="editableData.title"
        class="input-field"
        placeholder="Ex: Document de projet"
      />
    </div>
    <div class="mb-4">
      <label for="gdoc-iframe" class="block text-sm font-medium text-gray-700 mb-2">
        Code d'intégration du Google Doc
      </label>
      <textarea
        id="gdoc-iframe"
        v-model="editableData.src"
        class="input-field font-mono text-sm min-h-[120px]"
        placeholder='<iframe src="https://docs.google.com/document/d/e/..."></iframe>'
      ></textarea>

      <p class="mt-2 text-xs text-gray-500">
        Dans Google Docs : allez dans <strong>Fichier > Partager > Publier sur le Web</strong>, onglet <strong>Intégrer</strong>, puis copiez et collez ici l'intégralité du code `&lt;iframe&gt;`.
      </p>

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
