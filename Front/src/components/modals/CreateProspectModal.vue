<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  showModal: boolean;
  initialEmail: string; // L'email tapé par le commercial qui n'a pas été trouvé
}>();

const emit = defineEmits(['close', 'save-prospect']);

const prospectForm = ref({
  prenom: '',
  nom: '',
  email: '',
  telephone: ''
});

const errors = ref({ prenom: false, nom: false, email: false });
const isLoading = ref(false);

// Pré-remplir l'email avec ce que le commercial avait déjà tapé
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    prospectForm.value = {
      prenom: '',
      nom: '',
      email: props.initialEmail || '',
      telephone: ''
    };
    errors.value = { prenom: false, nom: false, email: false };
  }
});

const validateForm = () => {
  errors.value = { prenom: false, nom: false, email: false };
  if (!prospectForm.value.prenom.trim()) errors.value.prenom = true;
  if (!prospectForm.value.nom.trim()) errors.value.nom = true;
  if (!prospectForm.value.email.trim()) errors.value.email = true;
  
  return !errors.value.prenom && !errors.value.nom && !errors.value.email;
};

const handleSubmit = async () => {
  if (validateForm()) {
    isLoading.value = true;
    // On simule un petit temps de chargement pour l'UX
    setTimeout(() => {
      emit('save-prospect', prospectForm.value);
      isLoading.value = false;
    }, 500);
  }
};

const closeModal = () => emit('close');
</script>

<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40" @click.self="closeModal">
      
      <div 
        class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl p-6 md:p-10 relative overflow-hidden max-h-[95vh] overflow-y-auto"
        @click.stop
      >
        <button 
          @click="closeModal" 
          class="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-[#423B71] hover:bg-white transition-colors focus:outline-none"
        >
          <i class="fas fa-times"></i>
        </button>

        <div class="absolute -top-24 -left-24 w-48 h-48 bg-[#B2E9E1] rounded-full opacity-40 blur-3xl"></div>

        <div class="relative z-10">
          <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-[#8A79E2] shadow-sm mb-6">
            <i class="fas fa-user-plus"></i>
          </div>

          <h3 class="text-3xl md:text-4xl font-black text-[#423B71] mb-3 tracking-tighter leading-tight">Créer un Prospect</h3>
          
          <div class="bg-white/40 p-4 rounded-2xl mb-8 border border-white/60">
            <p class="text-sm text-[#423B71] font-medium leading-relaxed">
              <strong class="font-black text-[#8A79E2]">Aucun compte Syali n'est lié à cet email.</strong><br>
              Créez une fiche Prospect pour générer vos documents et avancer dans le dossier. Lorsque cette personne s'inscrira sur la plateforme avec cet email, son compte sera automatiquement lié à cette opportunité !
            </p>
          </div>
          
          <form @submit.prevent="handleSubmit" class="space-y-5">
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="group">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Prénom *</label>
                <input 
                  type="text" 
                  v-model="prospectForm.prenom" 
                  class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]" 
                  placeholder="Ex: Jean" 
                  :class="{'border-red-400': errors.prenom}"
                >
              </div>

              <div class="group">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Nom *</label>
                <input 
                  type="text" 
                  v-model="prospectForm.nom" 
                  class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]" 
                  placeholder="Ex: Dupont" 
                  :class="{'border-red-400': errors.nom}"
                >
              </div>
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Adresse Email *</label>
              <input 
                type="email" 
                v-model="prospectForm.email" 
                class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]" 
                placeholder="jean.dupont@email.com" 
                :class="{'border-red-400': errors.email}"
              >
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Téléphone (Optionnel)</label>
              <input 
                type="tel" 
                v-model="prospectForm.telephone" 
                class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]" 
                placeholder="06 12 34 56 78" 
              >
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-4 pt-6">
              <button 
                type="button" 
                @click="closeModal" 
                class="w-full sm:w-auto px-8 py-4 text-xs font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                :disabled="isLoading"
                class="w-full sm:w-auto px-10 py-4 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-check"></i>
                Créer le prospect
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