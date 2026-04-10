<script setup lang="ts">
import { ref, watch } from 'vue'

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
  selectedSessionForEleve: Session | null
  searchEleve: string
  filteredEleves: EleveInscrit[]
  showCreateEleveForm: boolean
  newEleve: { nom: string; prenom: string; email: string }
  formatDate: (dateStr: string) => string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update:searchEleve', value: string): void
  (e: 'update:showCreateEleveForm', value: boolean): void
  (e: 'update:newEleve', value: { nom: string; prenom: string; email: string }): void
  (e: 'add-eleve', eleve: EleveInscrit): void
  (e: 'create-and-add-eleve'): void
}>()

const updateSearchEleve = (event: Event) => {
  emit('update:searchEleve', (event.target as HTMLInputElement).value)
}

const toggleCreateEleveForm = () => {
  emit('update:showCreateEleveForm', !props.showCreateEleveForm)
}

const updateNewEleveField = (field: 'nom' | 'prenom' | 'email', value: string) => {
  emit('update:newEleve', { ...props.newEleve, [field]: value })
}

const addEleveToSession = (eleve: EleveInscrit) => {
  emit('add-eleve', eleve)
}

const createAndAddEleve = () => {
  emit('create-and-add-eleve')
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
          <h3 class="text-lg font-semibold text-[#F04636]">Ajouter un élève à la session</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div v-if="selectedSessionForEleve" class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900">Session sélectionnée :</h4>
          <p class="text-sm text-gray-600">
            Du {{ formatDate(selectedSessionForEleve.dateDebut) }} au {{ formatDate(selectedSessionForEleve.dateFin) }}
          </p>
          <p class="text-sm text-gray-500">
            {{ selectedSessionForEleve.elevesInscrits.length }} élève{{ selectedSessionForEleve.elevesInscrits.length > 1 ? 's' : '' }} actuellement inscrit{{ selectedSessionForEleve.elevesInscrits.length > 1 ? 's' : '' }}
          </p>
        </div>

        <div v-if="selectedSessionForEleve">
          <div class="mb-6">
            <h4 class="text-md font-medium text-gray-900 mb-3">Option 1 : Ajouter un élève existant</h4>

            <div class="mb-4">
              <label class="label">Rechercher par email ou ID étudiant</label>
              <input
                :value="searchEleve"
                @input="updateSearchEleve"
                type="text"
                class="input-field"
                placeholder="Tapez l'email ou l'ID de l'élève..."
              >
            </div>

            <div v-if="searchEleve && filteredEleves.length > 0" class="space-y-2 mb-4">
              <div
                v-for="eleve in filteredEleves"
                :key="eleve.id"
                class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                @click="addEleveToSession(eleve)"
              >
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-[#62D6CA] rounded-full flex items-center justify-center text-white font-medium mr-3">
                    {{ eleve.prenom.charAt(0) }}{{ eleve.nom.charAt(0) }}
                  </div>
                  <div>
                    <h5 class="font-medium text-gray-900">{{ eleve.prenom }} {{ eleve.nom }}</h5>
                    <p class="text-sm text-gray-500">{{ eleve.email }} ({{ eleve.id }})</p>
                    <p class="text-xs text-gray-400">Progression actuelle : {{ eleve.completion }}%</p>
                  </div>
                </div>
                <button class="text-[#62D6CA] hover:text-[#4FC3B7] text-sm font-medium">
                  Ajouter
                </button>
              </div>
            </div>

            <div v-else-if="searchEleve && filteredEleves.length === 0" class="text-sm text-gray-500 p-3 bg-gray-50 rounded-lg">
              Aucun élève trouvé pour "{{ searchEleve }}"
            </div>
          </div>

          <div class="flex items-center my-6">
            <div class="flex-1 border-t border-gray-300"/>
            <span class="px-4 text-sm text-gray-500 bg-white">OU</span>
            <div class="flex-1 border-t border-gray-300"/>
          </div>

          <div class="mb-6">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-md font-medium text-gray-900">Option 2 : Créer un nouvel élève</h4>
              <button
                @click="toggleCreateEleveForm"
                class="text-sm text-[#62D6CA] hover:text-[#4FC3B7] font-medium"
              >
                {{ showCreateEleveForm ? 'Masquer' : 'Afficher' }} le formulaire
              </button>
            </div>

            <div v-if="showCreateEleveForm" class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="label">Prénom</label>
                  <input
                    :value="newEleve.prenom"
                    @input="updateNewEleveField('prenom', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="input-field"
                    placeholder="Prénom"
                  >
                </div>
                <div>
                  <label class="label">Nom</label>
                  <input
                    :value="newEleve.nom"
                    @input="updateNewEleveField('nom', ($event.target as HTMLInputElement).value)"
                    type="text"
                    class="input-field"
                    placeholder="Nom"
                  >
                </div>
              </div>
              <div class="mb-4">
                <label class="label">Email</label>
                <input
                  :value="newEleve.email"
                  @input="updateNewEleveField('email', ($event.target as HTMLInputElement).value)"
                  type="email"
                  class="input-field"
                  placeholder="email@exemple.com"
                >
              </div>
              <button
                @click="createAndAddEleve"
                :disabled="!newEleve.prenom || !newEleve.nom || !newEleve.email"
                class="w-full btn-primary disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Créer et ajouter l'élève
              </button>
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
        </div>
      </div>
    </div>
  </div>
</template>
