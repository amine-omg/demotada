<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';

const props = defineProps({
  exercise: {
    type: Object as PropType<any>,
    required: true,
  }
});
const emit = defineEmits(['save-settings']);
const localExercise = ref<any>({});

watch(() => props.exercise, (newVal) => {
    if (newVal) localExercise.value = JSON.parse(JSON.stringify(newVal));
}, { immediate: true, deep: true });
</script>

<template>
  <aside class="w-80 bg-white border-l border-gray-200 p-6">
    <h3 class="font-semibold text-lg mb-4">Paramètres de l'exercice</h3>
    <div class="space-y-4">
      <div>
        <label class="label">Titre de l'exercice</label>
        <input type="text" v-model="localExercise.title" class="input-field">
      </div>
      <div>
        <label class="label">Temps imparti (minutes)</label>
        <input type="number" v-model.number="localExercise.timeLimit" class="input-field">
        <p class="text-xs text-gray-500 mt-1">Mettre 0 pour un temps illimité.</p>
      </div>
      <div>
        <label class="label">Type de réponses attendues</label>
        <select v-model="localExercise.submissionType" class="input-field">
          <option value="text">Réponse par texte</option>
          <option value="file-upload">Dépôt de fichier</option>
        </select>
        </div>
      <button @click="$emit('save-settings', localExercise)" class="btn-primary w-full mt-4">
        Sauvegarder
      </button>
    </div>
  </aside>
</template>