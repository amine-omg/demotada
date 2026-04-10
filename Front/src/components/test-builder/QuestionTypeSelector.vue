<script setup lang="ts">
/**
 * Ce composant permet de choisir le type de question à ajouter au test.
 * Il émet le type choisi vers le composant parent (PositioningTestBuilderPage).
 */

const emit = defineEmits(['select-question-type']);

const questionTypes = [
  {
    type: 'single-choice',
    name: 'Choix Unique',
    description: 'Une seule réponse correcte parmi plusieurs options.',
    icon: 'fas fa-check-circle',
    color: 'text-blue-500',
    bgColor: 'group-hover:bg-blue-50'
  },
  {
    type: 'multiple-choice',
    name: 'Choix Multiple',
    description: 'Plusieurs réponses peuvent être cochées comme correctes.',
    icon: 'fas fa-tasks',
    color: 'text-green-500',
    bgColor: 'group-hover:bg-green-50'
  },
  {
    type: 'true-false',
    name: 'Vrai ou Faux',
    description: 'Une affirmation simple à valider ou infirmer.',
    icon: 'fas fa-yin-yang',
    color: 'text-purple-500',
    bgColor: 'group-hover:bg-purple-50'
  },
  {
    type: 'image-qcm',
    name: 'QCM Image',
    description: 'Sélection visuelle parmi plusieurs images proposées.',
    icon: 'fas fa-images',
    color: 'text-yellow-500',
    bgColor: 'group-hover:bg-yellow-50'
  },
  {
    type: 'ordering',
    name: 'Ordonnancement',
    description: 'Remettre des éléments dans le bon ordre chronologique.',
    icon: 'fas fa-sort-numeric-down',
    color: 'text-indigo-500',
    bgColor: 'group-hover:bg-indigo-50'
  },
  {
    type: 'fill-in-the-blanks',
    name: 'Texte à trous',
    description: 'Compléter un texte en remplissant les mots manquants.',
    icon: 'fas fa-pen-fancy',
    color: 'text-teal-500',
    bgColor: 'group-hover:bg-teal-50'
  }
];
</script>

<template>
  <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
    <div class="mb-8">
      <h2 class="text-xl font-black text-[#423B71] uppercase tracking-tight">Ajouter une question</h2>
      <p class="text-gray-400 text-sm mt-1 font-medium">Choisissez le format d'évaluation le plus adapté.</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="qType in questionTypes"
        :key="qType.type"
        @click="emit('select-question-type', qType.type)"
        class="group text-left p-5 bg-gray-50 rounded-xl border-2 border-transparent hover:border-[#876EC8] hover:bg-white hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none"
      >
        <div class="flex items-center mb-4">
          <div :class="[qType.color, qType.bgColor]" class="w-12 h-12 flex items-center justify-center rounded-xl transition-colors duration-300 bg-white shadow-sm border border-gray-100 mr-4">
            <i :class="qType.icon" class="text-xl"></i>
          </div>
          <span class="font-bold text-[#423B71] group-hover:text-[#876EC8] transition-colors">{{ qType.name }}</span>
        </div>
        <p class="text-xs text-gray-500 leading-relaxed font-medium">
          {{ qType.description }}
        </p>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Les styles sont gérés via Tailwind */
</style>