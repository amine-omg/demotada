<script setup lang="ts">
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
  session: Session
  formatDate: (dateStr: string) => string
}>()

const emit = defineEmits<{
  (e: 'open-session-detail', session: Session): void
  (e: 'edit-session', session: Session): void
  (e: 'delete-session', session: Session): void
  (e: 'open-add-eleve-modal', session: Session): void
}>()
</script>

<template>
  <div
    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
    @click="emit('open-session-detail', session)"
  >
    <div>
      <h4 class="font-medium text-gray-900">
        Session du {{ formatDate(session.dateDebut) }} au {{ formatDate(session.dateFin) }}
      </h4>
      <p class="text-sm text-gray-600">
        {{ session.elevesInscrits.length }} élève{{ session.elevesInscrits.length > 1 ? 's' : '' }} inscrit{{ session.elevesInscrits.length > 1 ? 's' : '' }}
      </p>
      <p class="text-sm text-gray-500">
        Formateur{{ session.formateurs.length > 1 ? 's' : '' }} :
        {{ session.formateurs.map((f: Formateur) => f.nom).join(', ') }}
      </p>
      <p class="text-xs text-gray-400">
        Examen : {{ formatDate(session.dateExamen) }}
      </p>
    </div>
    <div class="flex items-center space-x-2">
      <button
        @click.stop="emit('open-add-eleve-modal', session)"
        class="p-2 text-green-500 hover:text-green-600"
        title="Ajouter un élève"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
      </button>
      <button
        @click.stop="emit('open-session-detail', session)"
        class="p-2 text-gray-400 hover:text-gray-600"
        title="Voir les détails"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 616 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      </button>
      <button
        @click.stop="emit('edit-session', session)"
        class="p-2 text-gray-400 hover:text-gray-600"
        title="Modifier"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
        </svg>
      </button>
      <button
        @click.stop="emit('delete-session', session)"
        class="p-2 text-gray-400 hover:text-red-600"
        title="Supprimer"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
</template>
