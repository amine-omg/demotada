<script setup lang="ts">
const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
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
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[#F04636]">Confirmer la suppression</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mb-6">
          <p class="text-gray-700">
            Êtes-vous sûr de vouloir supprimer cet élément ?
          </p>
          <p class="text-sm text-gray-500 mt-2">
            Cette action est irréversible.
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="emit('confirm')"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
