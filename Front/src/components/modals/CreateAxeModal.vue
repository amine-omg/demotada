<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
  (e: 'submit', payload: { titre: string, description: string }): void; 
}>();

const axeTitle = ref('');
const axeDescription = ref('');
const titleError = ref(false);

// Reset des champs à chaque ouverture de la modale
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    axeTitle.value = '';
    axeDescription.value = '';
    titleError.value = false;
  }
});

const submitAxe = () => {
  titleError.value = false;

  // Validation : Le titre est obligatoire
  if (!axeTitle.value.trim()) {
    titleError.value = true;
    return;
  }

  // On envoie les données au composant parent (IncidentsReport)
  emit('submit', {
    titre: axeTitle.value,
    description: axeDescription.value
  });
};

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40" @click.self="closeModal">
      
      <div 
        class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-xl p-10 relative overflow-hidden"
        @click.stop
      >
        <button 
          @click="closeModal" 
          class="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-[#423B71] hover:bg-white transition-colors focus:outline-none"
        >
          <i class="fas fa-times"></i>
        </button>

        <div class="absolute -top-24 -left-24 w-48 h-48 bg-[#B2E9E1] rounded-full opacity-20 blur-3xl"></div>

        <div class="relative z-10">
          
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-[#8A79E2] shadow-sm">
              <i class="fas fa-bullseye"></i>
            </div>
            <div>
              <h3 class="text-3xl font-black text-[#423B71] tracking-tighter">Nouvel Axe</h3>
              <p class="text-sm text-gray-600 font-medium">Créez un chantier d'amélioration globale.</p>
            </div>
          </div>
          
          <form @submit.prevent="submitAxe" class="space-y-5 bg-white/50 p-6 rounded-3xl border border-white/60">
            
            <div class="group">
              <label for="axe-title" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">
                Titre de l'axe <span class="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                id="axe-title" 
                v-model="axeTitle"
                class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]"
                placeholder="Ex: Refonte du support vidéo"
                :class="{'border-red-400': titleError}"
              >
              <p v-if="titleError" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-1 ml-1 italic">
                Veuillez donner un nom à cet axe.
              </p>
            </div>

            <div class="group">
              <label for="axe-desc" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">
                Objectif / Description
              </label>
              <textarea 
                id="axe-desc" 
                v-model="axeDescription"
                rows="3"
                class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-medium placeholder:text-gray-300 transition-all focus:border-[#B2E9E1] resize-none"
                placeholder="Décrivez l'objectif de cet axe et ce qui doit être amélioré..."
              ></textarea>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-3 pt-4">
              <button 
                type="button" 
                @click="closeModal" 
                class="px-6 py-3 text-sm font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all focus:outline-none"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="px-8 py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-900/10 hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 focus:outline-none"
              >
                <i class="fas fa-plus"></i>
                Créer l'axe
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease-out; }
.modal-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>