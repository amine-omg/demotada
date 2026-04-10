<template>
  <div class="space-y-6">
    <div v-if="!hasTest" class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-gray-800">Test de Positionnement</h2>
          <p class="text-sm text-gray-500 mt-1">
            Ce test permet d'évaluer le niveau des apprenants avant qu'ils ne commencent le premier module.
          </p>
        </div>
        <button 
          @click="goToBuilder"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center shadow-md"
        >
          <i class="fas fa-plus"></i>
          <span class="ml-2">Créer le test</span>
        </button>
      </div>

      <div class="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
        <div class="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-clipboard-list text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-600 font-medium">Aucun test de positionnement configuré.</p>
        <p class="text-gray-400 text-sm mt-1">Cliquez sur le bouton pour commencer la création.</p>
      </div>
    </div>

    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  formation: any;
}>();

const router = useRouter();

// MISE À JOUR : On regarde si le nouvel objet contient des questions
const hasTest = computed(() => {
  return !!(props.formation?.positioningTest?.questions && props.formation.positioningTest.questions.length > 0);
});

const goToBuilder = () => {
  router.push(`/formation-builder/${props.formation._id}/positioning-test`);
};
</script>