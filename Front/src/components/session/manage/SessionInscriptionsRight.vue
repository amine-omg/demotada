<script setup lang="ts">
import { useRouter } from 'vue-router';

defineProps<{
  prospects: any[];
  isLoadingCrm: boolean;
  isAddingId: string | null;
}>();

const emit = defineEmits(['add-from-crm']);
const router = useRouter();

const getInitials = (prenom: string, nom: string) => {
  return (prenom?.charAt(0) || '') + (nom?.charAt(0) || 'U');
};

const goToOpportunite = (opportuniteId: string) => {
  if (opportuniteId) {
    // Adapter la route selon le path exact de ton CRM si nécessaire
    router.push(`/pipeline/opportunite/${opportuniteId}`);
  }
};
</script>

<template>
  <div class="xl:col-span-1 space-y-6">
    <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 h-full">
      <h2 class="text-lg font-bold text-[#423B71] flex items-center gap-2 mb-2">
        <i class="fas fa-link text-indigo-400"></i> Liés au CRM
      </h2>
      <p class="text-xs text-gray-500 mb-6">
        Prospects du tunnel de vente positionnés sur cette session mais non inscrits.
      </p>

      <div v-if="isLoadingCrm" class="flex justify-center py-8">
          <i class="fas fa-circle-notch fa-spin text-indigo-400 text-2xl"></i>
      </div>
      
      <div v-else-if="prospects.length > 0" class="space-y-4">
        <div 
          v-for="person in prospects" 
          :key="person._id" 
          @click="goToOpportunite(person.opportuniteId)"
          class="p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer shadow-sm group"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center gap-3 min-w-0 pr-2">
              <img v-if="person.photo" :src="person.photo" class="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-white flex-shrink-0"/>
              <div v-else class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 text-indigo-700 flex items-center justify-center font-bold shadow-sm border-2 border-white text-sm flex-shrink-0">
                {{ getInitials(person.prenom, person.nom) }}
              </div>
              
              <div class="min-w-0 flex flex-col justify-center">
                <div class="flex flex-wrap items-center gap-1.5 mb-0.5">
                  <p class="font-bold text-gray-800 text-sm truncate max-w-[100px] group-hover:text-indigo-600 transition-colors">{{ person.prenom }} {{ person.nom }}</p>
                  <span class="text-[8px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold truncate max-w-[80px]" :title="person.opportuniteName">{{ person.opportuniteName }}</span>
                  <span class="text-[8px] px-1.5 py-0.5 bg-[#EFEAFB] text-[#8A79E2] rounded font-black uppercase tracking-wider truncate max-w-[70px]">{{ person.opportuniteStage }}</span>
                </div>
                <p class="text-[10px] text-gray-500 truncate">{{ person.emailToDisplay || 'Pas d\'email renseigné' }}</p>
              </div>
            </div>
            
            <button 
              @click.stop="emit('add-from-crm', person)"
              :disabled="isAddingId === person._id"
              class="flex-shrink-0 w-8 h-8 mt-1 rounded-lg bg-[#B2E9E1] text-[#423B71] hover:bg-[#FF8B7D] hover:text-white transition-colors flex items-center justify-center shadow-sm disabled:opacity-50"
              title="Inscrire à la session"
            >
              <i v-if="isAddingId === person._id" class="fas fa-spinner fa-spin text-xs"></i>
              <i v-else class="fas fa-arrow-left text-xs"></i>
            </button>
          </div>
          
          <div class="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200">
            <div class="flex items-center justify-between px-2 py-1.5 rounded-md border text-[8px] font-bold uppercase tracking-widest transition-colors"
                 :class="[person.devisState === 'none' ? 'bg-white border-gray-200 text-gray-400' : person.devisState === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-green-50 border-green-200 text-green-600']">
                 <span class="truncate">Devis</span>
                 <i v-if="person.devisState === 'none'" class="fas fa-times text-gray-300"></i>
                 <i v-else-if="person.devisState === 'pending'" class="fas fa-paper-plane text-orange-400" title="Envoyé"></i>
                 <i v-else class="fas fa-check-circle text-green-500" title="Validé"></i>
            </div>
            
            <div class="flex items-center justify-between px-2 py-1.5 rounded-md border text-[8px] font-bold uppercase tracking-widest transition-colors"
                 :class="[person.conventionState === 'none' ? 'bg-white border-gray-200 text-gray-400' : person.conventionState === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-green-50 border-green-200 text-green-600']">
                 <span class="truncate">Conv.</span>
                 <i v-if="person.conventionState === 'none'" class="fas fa-times text-gray-300"></i>
                 <i v-else-if="person.conventionState === 'pending'" class="fas fa-paper-plane text-orange-400" title="Envoyée"></i>
                 <i v-else class="fas fa-check-circle text-green-500" title="Signée"></i>
            </div>
            
            <div class="flex items-center justify-between px-2 py-1.5 rounded-md border text-[8px] font-bold uppercase tracking-widest transition-colors"
                 :class="[person.programmeState === 'none' ? 'bg-white border-gray-200 text-gray-400' : person.programmeState === 'pending' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-green-50 border-green-200 text-green-600']">
                 <span class="truncate">Prog.</span>
                 <i v-if="person.programmeState === 'none'" class="fas fa-times text-gray-300"></i>
                 <i v-else-if="person.programmeState === 'pending'" class="fas fa-paper-plane text-orange-400" title="Envoyé"></i>
                 <i v-else class="fas fa-check-circle text-green-500" title="Reçu"></i>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div class="relative inline-block mb-3">
          <i class="fas fa-folder-open text-gray-300 text-4xl"></i>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <i class="fas fa-check text-white text-[8px]"></i>
          </div>
        </div>
        <p class="text-sm font-bold text-gray-600">Tout est à jour</p>
        <p class="text-xs text-gray-400 mt-1 px-4">Tous les prospects CRM liés à cette session sont déjà inscrits.</p>
      </div>
    </div>
  </div>
</template>