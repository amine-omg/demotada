<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-content', contentType: 'lesson' | 'quiz' | 'assignment' | 'task'): void
}>()
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-[#F04636]">Ajouter un contenu pédagogique</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>


                <div class="space-y-3">
          <button
            @click="emit('add-content', 'lesson')"
            class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Leçon</h4>
              <p class="text-sm text-gray-500">Créer une leçon avec du contenu multimédia</p>
            </div>
          </button>

          <button
            @click="emit('add-content', 'quiz')"
            class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Quiz</h4>
              <p class="text-sm text-gray-500">Évaluer les connaissances avec un quiz</p>
            </div>
          </button>

          <button
            @click="emit('add-content', 'assignment')"
            class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Devoir</h4>
              <p class="text-sm text-gray-500">Créer un devoir à rendre</p>
            </div>
          </button>

          <button
            @click="emit('add-content', 'task')"
            class="w-full flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-gray-900">Tâche</h4>
              <p class="text-sm text-gray-500">Assigner une tâche à compléter</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
