<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
  (e: 'submit', payload: { type: string, titre: string, description: string }): void; 
}>();

const incidentType = ref<'Bug Technique' | 'Amélioration' | 'Réclamation'>('Bug Technique'); 
const incidentTitle = ref('');
const incidentDescription = ref('');

const titleError = ref(false);
const descriptionError = ref(false);

// Reset des champs à chaque ouverture
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    incidentType.value = 'Bug Technique';
    incidentTitle.value = '';
    incidentDescription.value = '';
    titleError.value = false;
    descriptionError.value = false;
  }
});

const submitIncident = () => {
  titleError.value = false;
  descriptionError.value = false;
  let hasError = false;

  if (!incidentTitle.value.trim()) {
    titleError.value = true;
    hasError = true;
  }
  if (!incidentDescription.value.trim()) {
    descriptionError.value = true;
    hasError = true;
  }

  if (hasError) return;

  emit('submit', {
    type: incidentType.value,
    titre: incidentTitle.value,
    description: incidentDescription.value
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
          <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-[#423B71] shadow-sm mb-6">
            <i class="fas fa-ticket-alt"></i>
          </div>

          <h3 class="text-4xl font-black text-[#423B71] mb-2 tracking-tighter">Ouvrir un ticket</h3>
          <p class="text-gray-600 mb-8 font-medium">Aidez-nous à améliorer votre expérience en nous signalant un problème ou une suggestion.</p>
          
          <form @submit.prevent="submitIncident" class="space-y-6">
            
            <div class="group">
              <label for="incident-type" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">
                Type de retour
              </label>
              <div class="relative">
                <select 
                  id="incident-type" 
                  v-model="incidentType"
                  class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold appearance-none transition-all focus:border-[#B2E9E1] focus:ring-4 focus:ring-[#B2E9E1]/20 cursor-pointer"
                >
                  <option value="Bug Technique">🐞 Bug Technique</option>
                  <option value="Amélioration">💡 Suggestion d'amélioration</option>
                  <option value="Réclamation">⚠️ Réclamation</option>
                </select>
                <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#423B71] opacity-50">
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div class="group">
              <label for="incident-title" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">
                Titre
              </label>
              <input 
                type="text" 
                id="incident-title" 
                v-model="incidentTitle"
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1] focus:ring-4 focus:ring-[#B2E9E1]/20"
                placeholder="Ex: La vidéo ne charge pas"
                :class="{'border-red-400 focus:border-red-400 focus:ring-red-100': titleError}"
              >
              <p v-if="titleError" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2 italic">
                Un titre est requis.
              </p>
            </div>

            <div class="group">
              <label for="incident-desc" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">
                Description détaillée
              </label>
              <textarea 
                id="incident-desc" 
                v-model="incidentDescription"
                rows="4"
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-medium placeholder:text-gray-300 transition-all focus:border-[#B2E9E1] focus:ring-4 focus:ring-[#B2E9E1]/20 resize-none"
                placeholder="Décrivez précisément ce qu'il se passe..."
                :class="{'border-red-400 focus:border-red-400 focus:ring-red-100': descriptionError}"
              ></textarea>
              <p v-if="descriptionError" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2 italic">
                La description est requise.
              </p>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-4 pt-4">
              <button 
                type="button" 
                @click="closeModal" 
                class="w-full sm:w-auto px-8 py-4 text-sm font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all focus:outline-none"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="w-full sm:w-auto px-10 py-4 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-900/10 hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 focus:outline-none"
              >
                <i class="fas fa-paper-plane"></i>
                Envoyer le ticket
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