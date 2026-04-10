<script setup lang="ts">
import { ref, watch } from 'vue'

interface Chapter {
  id?: string
  title: string
  description: string
  isDraft: boolean
}

const props = defineProps<{
  show: boolean
  newChapter: { title: string; description: string; isDraft: boolean }
  editingChapter: Chapter | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', chapterData: { title: string; description: string; isDraft: boolean }): void
}>()

const localNewChapter = ref({ ...props.newChapter })

watch(() => props.newChapter, (newValue) => {
  localNewChapter.value = { ...newValue }
}, { deep: true })

watch(() => props.show, (newValue) => {
  if (newValue && !props.editingChapter) {
    localNewChapter.value = { title: '', description: '', isDraft: false }
  } else if (newValue && props.editingChapter) {
    localNewChapter.value = { ...props.editingChapter }
  }
})

const saveChapter = () => {
  emit('save', localNewChapter.value)
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-[#F04636]">{{ editingChapter ? 'Éditer le chapitre' : 'Ajouter un chapitre' }}</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="saveChapter">
          <div class="mb-4">
            <label class="label">Titre</label>
            <input
              v-model="localNewChapter.title"
              type="text"
              class="input-field"
              required
            >
          </div>

          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="localNewChapter.isDraft"
                class="sr-only"
              >
              <div
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:ring-offset-2"
                :class="localNewChapter.isDraft ? 'bg-[#62D6CA]' : 'bg-gray-200'"
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  :class="localNewChapter.isDraft ? 'translate-x-6' : 'translate-x-1'"
                />
              </div>
              <span class="ml-3 text-sm font-medium text-gray-900">Mettre en brouillon</span>
            </label>
          </div>

          <div class="mb-6">
            <label class="label">Description</label>

            <div class="border border-gray-300 rounded-t-md bg-gray-50 px-3 py-2 flex flex-wrap items-center gap-1">
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">H2</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">H3</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">H4</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">H5</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">H6</button>
              <div class="w-px h-6 bg-gray-300 mx-1" />
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200 font-bold">B</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200 italic">I</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200 underline">U</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200 line-through">S</button>
              <div class="w-px h-6 bg-gray-300 mx-1" />
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">🔗</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">⚡</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">🎥</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">•</button>
              <button type="button" class="px-2 py-1 text-sm border rounded hover:bg-gray-200">1.</button>
            </div>

            <textarea
              v-model="localNewChapter.description"
              class="w-full px-4 py-3 border border-t-0 border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:border-transparent"
              rows="8"
              placeholder="Décrivez votre chapitre..."
            />
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Fermer
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
