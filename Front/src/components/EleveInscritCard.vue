<script setup lang="ts">
interface Eleve {
  id: string
  nom: string
  prenom: string
  completion: number
  dateInscription: string
  email?: string 
  enAttenteValidation?: boolean
}

const props = defineProps<{
  eleve: Eleve
  formatDate: (dateStr: string) => string
}>()
</script>

<template>
  <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div class="flex items-center">
      <div class="w-10 h-10 bg-[#62D6CA] rounded-full flex items-center justify-center text-white font-medium mr-3">
        {{ eleve.prenom.charAt(0) }}{{ eleve.nom.charAt(0) }}
      </div>
      <div>
        <h4 class="font-medium text-gray-900">
          {{ eleve.prenom }} {{ eleve.nom }}
        </h4>
        <p class="text-sm text-gray-500">
          Inscrit le {{ formatDate(eleve.dateInscription) }}
        </p>
      </div>
    </div>
    <div class="flex items-center">
      <div class="text-right mr-4">
        <div class="text-lg font-semibold text-gray-900">{{ eleve.completion }}%</div>
        <div class="w-20 bg-gray-200 rounded-full h-2">
          <div
            class="bg-[#62D6CA] h-2 rounded-full"
            :style="{ width: eleve.completion + '%' }"
          />
        </div>
      </div>
      <button class="p-2 text-gray-400 hover:text-gray-600" title="Voir le profil">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      </button>
    </div>
  </div>
</template>
