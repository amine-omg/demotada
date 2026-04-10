<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
  (e: 'add-content', payload: { type: 'lesson' | 'quiz' | 'exercise' | 'assignment' | 'support' | 'task', title: string }): void; 
}>();

const newContentType = ref<'lesson' | 'quiz' | 'exercise' | 'support' | 'assignment' | 'task'>('lesson'); 
const newContentTitle = ref('');
const newContentTitleError = ref(false);

// Reset des champs à chaque ouverture
watch(() => props.showModal, (newVal) => {
  if (newVal) {
    newContentType.value = 'lesson';
    newContentTitle.value = '';
    newContentTitleError.value = false;
  }
});

const addContent = () => {
  newContentTitleError.value = false;
  if (!newContentTitle.value.trim()) {
    newContentTitleError.value = true;
    return;
  }
  emit('add-content', {
    type: newContentType.value,
    title: newContentTitle.value,
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
            <i class="fas fa-plus-circle"></i>
          </div>

          <h3 class="text-4xl font-black text-[#423B71] mb-2 tracking-tighter">Ajouter un contenu</h3>
          <p class="text-gray-600 mb-8 font-medium">Choisissez le type d'activité et donnez-lui un nom clair.</p>
          
          <form @submit.prevent="addContent" class="space-y-6">
            <div class="group">
              <label for="content-type" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">
                Type d'activité
              </label>
              <div class="relative">
                <select 
                  id="content-type" 
                  v-model="newContentType"
                  class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold appearance-none transition-all focus:border-[#B2E9E1] focus:ring-4 focus:ring-[#B2E9E1]/20 cursor-pointer"
                >
                  <option value="lesson">📖 Leçon</option>
                  <option value="assignment">📂 Devoir</option>
                  <option value="exercise">✏️ Exercice</option>
                  <option value="quiz">⚡ Quiz</option>
                  <option value="support">💾 Support</option>
                </select>
                <div class="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#423B71] opacity-50">
                  <i class="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>

            <div class="group">
              <label for="content-title" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">
                Titre du contenu
              </label>
              <input 
                type="text" 
                id="content-title" 
                v-model="newContentTitle"
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1] focus:ring-4 focus:ring-[#B2E9E1]/20"
                placeholder="Ex: Introduction aux bases de données"
                :class="{'border-red-400 focus:border-red-400 focus:ring-red-100': newContentTitleError}"
              >
              <p v-if="newContentTitleError" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2 italic">
                Le titre du contenu est requis.
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
                <i class="fas fa-check"></i>
                Valider l'ajout
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