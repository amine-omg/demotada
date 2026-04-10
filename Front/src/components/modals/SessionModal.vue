<script setup lang="ts">
import { ref, watch } from 'vue'

interface Formateur {
  id: string
  nom: string
  email: string
}

const props = defineProps<{
  show: boolean
  newSession: { dateDebut: string; dateFin: string; formateurs: Formateur[]; dateExamen: string }
  formateurs: Formateur[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'create', sessionData: { dateDebut: string; dateFin: string; formateurs: Formateur[]; dateExamen: string }): void
}>()

const localNewSession = ref({ ...props.newSession })

watch(() => props.newSession, (newValue) => {
  localNewSession.value = { ...newValue }
}, { deep: true })

const createSession = () => {
  emit('create', localNewSession.value)
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
          <h3 class="text-lg font-semibold text-[#F04636]">Ajouter une session</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createSession">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="label">Date de début</label>
              <input
                v-model="localNewSession.dateDebut"
                type="date"
                class="input-field"
                required
              >
            </div>
            <div>
              <label class="label">Date de fin</label>
              <input
                v-model="localNewSession.dateFin"
                type="date"
                class="input-field"
                required
              >
            </div>
          </div>

          <div class="mb-4">
            <label class="label">Date d'examen</label>
            <input
              v-model="localNewSession.dateExamen"
              type="date"
              class="input-field"
              required
            >
          </div>

          <div class="mb-6">
            <label class="label">Formateurs</label>
            <div class="space-y-2">
              <label
                v-for="formateur in formateurs"
                :key="formateur.id"
                class="flex items-center"
              >
                <input
                  type="checkbox"
                  :value="formateur"
                  v-model="localNewSession.formateurs"
                  class="w-4 h-4 text-[#62D6CA] bg-gray-100 border-gray-300 rounded focus:ring-[#62D6CA] focus:ring-2"
                >
                <span class="ml-2 text-sm text-gray-700">{{ formateur.nom }}</span>
                <span class="ml-1 text-xs text-gray-500">({{ formateur.email }})</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              Créer la session
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
