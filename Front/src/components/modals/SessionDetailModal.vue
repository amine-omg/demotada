<script setup lang="ts">
import EleveInscritCard from '../EleveInscritCard.vue'

interface Formateur {
  id: string
  nom: string
  email: string
}

interface EleveInscrit {
  id: string
  nom: string
  prenom: string
  email: string
  completion: number
  dateInscription: string
  enAttenteValidation?: boolean
}

interface Session {
  id: string
  dateDebut: string
  dateFin: string
  formateurs: Formateur[]
  dateExamen: string
  elevesInscrits: EleveInscrit[]
}

const props = defineProps<{
  show: boolean
  selectedSession: Session | null
  formatDate: (dateStr: string) => string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'edit', session: Session): void
}>()

const editSessionFromDetail = () => {
  if (props.selectedSession) {
    emit('edit', props.selectedSession)
  }
}
</script>

<template>
  <div
    v-if="show && selectedSession"
    class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-[#F04636]">
            Détails de la session - {{ formatDate(selectedSession.dateDebut) }} au {{ formatDate(selectedSession.dateFin) }}
          </h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Formateurs</h4>
              <p class="text-sm text-gray-900">
                {{ selectedSession.formateurs.map((f: Formateur) => f.nom).join(', ') }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Date d'examen</h4>
              <p class="text-sm text-gray-900">{{ formatDate(selectedSession.dateExamen) }}</p>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-1">Élèves inscrits</h4>
              <p class="text-sm text-gray-900">{{ selectedSession.elevesInscrits.length }} participant{{ selectedSession.elevesInscrits.length > 1 ? 's' : '' }}</p>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">Élèves inscrits à cette session</h4>

          <div class="space-y-3">
            <div
              v-for="eleve in selectedSession.elevesInscrits"
              :key="eleve.id"
              class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div class="flex items-center">
                <div class="w-12 h-12 bg-[#62D6CA] rounded-full flex items-center justify-center text-white font-medium mr-4">
                  {{ eleve.prenom.charAt(0) }}{{ eleve.nom.charAt(0) }}
                </div>
                <div>
                  <div class="flex items-center">
                    <h5 class="font-medium text-gray-900">
                      {{ eleve.prenom }} {{ eleve.nom }}
                    </h5>
                    <span
                      v-if="eleve.enAttenteValidation"
                      class="ml-2 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center"
                      title="En attente de validation email"
                    >
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      En attente
                    </span>
                  </div>
                  <p class="text-sm text-gray-500">{{ eleve.email }}</p>
                  <p class="text-xs text-gray-400">
                    Inscrit le {{ formatDate(eleve.dateInscription) }}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <div class="text-right mr-4">
                  <div class="text-lg font-semibold text-gray-900">{{ eleve.completion }}%</div>
                  <div class="w-24 bg-gray-200 rounded-full h-3">
                    <div
                      class="h-3 rounded-full"
                      :class="eleve.completion >= 80 ? 'bg-green-500' : eleve.completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                      :style="{ width: eleve.completion + '%' }"
                    />
                  </div>
                </div>
                <button class="p-2 text-gray-400 hover:text-gray-600" title="Voir le profil">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="emit('close')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Fermer
          </button>
          <button
            @click="editSessionFromDetail"
            class="btn-primary"
          >
            Modifier la session
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
