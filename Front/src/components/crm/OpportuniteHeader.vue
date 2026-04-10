<script setup lang="ts">
import { ref, nextTick } from 'vue';

const props = defineProps<{
  opportunite: any;
  currencyFormatter: Intl.NumberFormat;
  availableStages?: string[]; // La liste dynamique des étapes de ton pipeline (ex: ['Nouveau', 'En cours', ...])
}>();

const emit = defineEmits(['update-stage', 'update-status', 'update-value']);

// --- ÉTATS D'ÉDITION ---
const isEditingStage = ref(false);
const selectedStage = ref('');

const isEditingStatus = ref(false);
const selectedStatus = ref('');

const isEditingValue = ref(false);
const editValue = ref(0);
const valueInputRef = ref<HTMLInputElement | null>(null);

// --- LOGIQUE STAGE (Étape du pipeline) ---
const startEditStage = () => {
  selectedStage.value = props.opportunite.currentStage;
  isEditingStage.value = true;
};
const saveStage = () => {
  if (selectedStage.value && selectedStage.value !== props.opportunite.currentStage) {
    emit('update-stage', selectedStage.value);
  }
  isEditingStage.value = false;
};

// --- LOGIQUE STATUT (Gagné/Perdu/Indécis) ---
const startEditStatus = () => {
  selectedStatus.value = props.opportunite.statutOpportunite || 'Indécis';
  isEditingStatus.value = true;
};
const saveStatus = () => {
  if (selectedStatus.value && selectedStatus.value !== props.opportunite.statutOpportunite) {
    emit('update-status', selectedStatus.value);
  }
  isEditingStatus.value = false;
};

// --- LOGIQUE VALEUR (Manuel vs Auto) ---
const startEditValue = async () => {
  editValue.value = props.opportunite.valeur || 0;
  isEditingValue.value = true;
  await nextTick();
  valueInputRef.value?.focus();
};

const saveValue = () => {
  // On sauvegarde en précisant que c'est une valeur écrasée manuellement (isCustomValue: true)
  emit('update-value', { valeur: Number(editValue.value), isCustomValue: true });
  isEditingValue.value = false;
};

const resetAutoValue = () => {
  // On signale au backend de repasser en automatique (le backend ou le parent recalculera le prix)
  emit('update-value', { valeur: props.opportunite.valeur, isCustomValue: false });
  isEditingValue.value = false;
};
</script>

<template>
  <div class="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-6 md:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
    
    <div>
      <div class="flex flex-wrap items-center gap-2 mb-3 h-8">
        
        <div v-if="!isEditingStage" @click="startEditStage" class="cursor-pointer group">
          <span class="px-3 py-1.5 bg-[#EFEAFB] text-[#8A79E2] text-xs font-black uppercase tracking-widest rounded-lg group-hover:bg-[#8A79E2] group-hover:text-white transition-colors flex items-center gap-1 shadow-sm">
            {{ opportunite.currentStage }}
            <i class="fas fa-caret-down opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </span>
        </div>
        <div v-else class="flex items-center">
          <select v-model="selectedStage" @blur="saveStage" @change="saveStage" 
                  class="px-2 py-1 text-xs font-black uppercase tracking-widest rounded-lg border-2 border-[#8A79E2] text-[#8A79E2] bg-white outline-none cursor-pointer shadow-sm">
            <option v-if="!availableStages || availableStages.length === 0" :value="opportunite.currentStage">{{ opportunite.currentStage }}</option>
            <option v-for="stage in availableStages" :key="stage" :value="stage">{{ stage }}</option>
          </select>
        </div>

        <div v-if="!isEditingStatus" @click="startEditStatus" class="cursor-pointer group">
          <span :class="['px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-1 shadow-sm', 
                         opportunite.statutOpportunite === 'Gagné' ? 'bg-green-100 text-green-700 group-hover:bg-green-600 group-hover:text-white' : 
                         opportunite.statutOpportunite === 'Perdu' ? 'bg-red-100 text-red-700 group-hover:bg-red-600 group-hover:text-white' : 
                         'bg-gray-100 text-gray-500 border border-gray-200 group-hover:bg-gray-200']">
            {{ opportunite.statutOpportunite === 'Indécis' ? 'En cours' : opportunite.statutOpportunite }}
            <i class="fas fa-caret-down opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </span>
        </div>
        <div v-else class="flex items-center">
          <select v-model="selectedStatus" @blur="saveStatus" @change="saveStatus" 
                  class="px-2 py-1 text-xs font-black uppercase tracking-widest rounded-lg border-2 border-gray-300 outline-none cursor-pointer shadow-sm">
            <option value="Indécis">En cours</option>
            <option value="Gagné">Gagné</option>
            <option value="Perdu">Perdu</option>
          </select>
        </div>

      </div>
      
      <h1 class="text-2xl md:text-4xl font-black text-[#423B71] leading-tight">
        {{ opportunite.nomOpportunite }}
      </h1>
      
      <p class="text-xs md:text-sm font-bold text-gray-400 mt-2 flex flex-wrap gap-2 items-center">
        <span>
          <i class="far fa-calendar-alt mr-1"></i> 
          Créé le {{ new Date(opportunite.dateCreation).toLocaleDateString('fr-FR') }}
        </span>
        <span class="hidden md:inline text-gray-200">|</span>
        <span>
          <i class="fas fa-briefcase mr-1"></i> 
          {{ opportunite.typeBusiness === 'OpportunitéEntreprise' ? 'B2B (Entreprise)' : 'B2C (Particulier)' }}
        </span>
      </p>
    </div>

    <div class="relative group mt-2 md:mt-0 min-w-[200px]">
      <div :class="['text-left md:text-right p-4 rounded-2xl border transition-all duration-300', 
                    opportunite.isCustomValue ? 'bg-[#EFEAFB]/30 border-[#8A79E2]' : 'bg-gray-50 border-gray-100 group-hover:border-[#8A79E2]/30']">
        
        <div v-if="!isEditingValue" class="cursor-pointer" @click="startEditValue">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center md:justify-end gap-1.5">
            Valeur estimée
            <span v-if="opportunite.isCustomValue" class="text-[#8A79E2] bg-white w-4 h-4 rounded-full flex items-center justify-center shadow-sm" title="Modifié manuellement">
              <i class="fas fa-lock text-[8px]"></i>
            </span>
            <i class="fas fa-pen text-[#8A79E2] opacity-0 group-hover:opacity-100 transition-opacity ml-1"></i>
          </p>
          <p class="text-3xl md:text-4xl font-black text-[#FF8B7D] group-hover:scale-[1.02] transition-transform origin-right">
            {{ currencyFormatter.format(opportunite.valeur) }}
          </p>
        </div>

        <div v-else class="flex flex-col items-start md:items-end animate-in fade-in zoom-in duration-200">
          <p class="text-[10px] font-black text-[#8A79E2] uppercase tracking-widest mb-2">Forcer le montant</p>
          
          <div class="flex items-center gap-2">
            <input ref="valueInputRef" type="number" v-model="editValue" @keyup.enter="saveValue" 
                   class="w-24 md:w-32 px-3 py-1.5 text-xl md:text-2xl font-black text-[#FF8B7D] bg-white border-2 border-[#8A79E2] rounded-xl outline-none text-right shadow-inner">
            <span class="text-2xl font-black text-[#FF8B7D]">€</span>
          </div>

          <div class="flex items-center justify-end gap-2 mt-3 w-full">
            <button v-if="opportunite.isCustomValue" @click="resetAutoValue" 
                    class="mr-auto text-[9px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 px-2 py-1 rounded bg-white border border-gray-200 shadow-sm transition-colors">
              <i class="fas fa-unlock"></i> Auto
            </button>
            <button @click="isEditingValue = false" 
                    class="text-[9px] font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest px-2 py-1">
              Annuler
            </button>
            <button @click="saveValue" 
                    class="text-[9px] font-bold bg-[#8A79E2] text-white px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-md hover:bg-[#FF8B7D] transition-colors">
              Valider
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.2s;
  animation-fill-mode: both;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
/* Cache les flèches du champ number */
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  margin: 0; 
}
</style>