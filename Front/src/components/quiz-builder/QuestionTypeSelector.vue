<script setup lang="ts">
const emit = defineEmits(['select-question-type']);

const questionTypes = [
  {
    type: 'single-choice',
    name: 'Choix Unique',
    description: 'Posez une question, une seule réponse est correcte.',
    icon: 'fas fa-check-circle',
    color: 'text-blue-500'
  },
  {
    type: 'multiple-choice',
    name: 'Choix Multiple',
    description: 'Meme principe, mais plusieurs réponses peuvent être correctes.',
    icon: 'fas fa-tasks',
    color: 'text-green-500'
  },
  {
    type: 'true-false',
    name: 'Vrai ou Faux',
    description: 'Posez une affirmation. L\'élève doit dire si elle est vraie ou fausse.',
    icon: 'fas fa-yin-yang',
    color: 'text-purple-500'
  },
  {
    type: 'image-qcm',
    name: 'QCM Image',
    description: 'Les élèves choisissent les bonnes images parmi plusieurs proposées.',
    icon: 'fas fa-images',
    color: 'text-yellow-600'
  },
  {
    type: 'ordering',
    name: 'Mettre dans l\'ordre',
    description: 'Les élèves réorganisent des phrases ou éléments dans le bon ordre.',
    icon: 'fas fa-sort-numeric-down', 
    color: 'text-indigo-600'
  },
  {
    type: 'fill-in-the-blanks',
    name: 'Texte à Trous',
    description: 'Les élèves glissent-déposent des mots pour compléter un texte.',
    icon: 'fas fa-file-alt', 
    color: 'text-teal-600'
  }
];
</script>

<template>
  <div class="bg-white p-8 rounded-lg shadow-sm border">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-[#423B71]">Choisissez un type de question</h2>
      <p class="text-gray-600 mt-2">Sélectionnez un modèle pour commencer à construire votre question.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <button
        v-for="qType in questionTypes"
        :key="qType.type"
        @click="emit('select-question-type', qType.type)"
        class="text-left p-6 bg-gray-50 rounded-lg border-2 border-transparent hover:border-[#876EC8] hover:bg-white transition-all transform hover:-translate-y-1"
      >
        <div class="flex items-center mb-3">
          <i :class="[qType.icon, qType.color]" class="text-2xl mr-4"></i>
          <h3 class="font-bold text-lg text-gray-800">{{ qType.name }}</h3>
        </div>
        <p class="text-sm text-gray-500">
          {{ qType.description }}
        </p>
      </button>
    </div>
  </div>
</template>
