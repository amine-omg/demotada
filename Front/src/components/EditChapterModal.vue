<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  showModal: boolean;
  chapterId: string | null;
  initialTitle: string; 
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
  (e: 'update-chapter', chapterId: string, newTitle: string): void; 
}>();

const editingChapterTitle = ref('');
const editingChapterTitleError = ref(false);

// Synchronisation du titre à l'ouverture ou au changement de chapitre
watch(() => [props.showModal, props.initialTitle], ([isOpen, newTitle]) => {
  if (isOpen) {
    editingChapterTitle.value = newTitle as string;
    editingChapterTitleError.value = false;
  }
}, { immediate: true });

const updateChapterTitle = () => {
  editingChapterTitleError.value = false;
  if (!editingChapterTitle.value.trim()) {
    editingChapterTitleError.value = true;
    return;
  }
  if (props.chapterId) {
    emit('update-chapter', props.chapterId, editingChapterTitle.value);
  }
};

const closeModal = () => {
  emit('close');
  editingChapterTitleError.value = false;
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
            <i class="fas fa-pen"></i>
          </div>

          <h3 class="text-4xl font-black text-[#423B71] mb-2 tracking-tighter">Éditer le chapitre</h3>
          <p class="text-gray-600 mb-8 font-medium">Modifiez le titre de votre chapitre pour plus de clarté.</p>
          
          <form @submit.prevent="updateChapterTitle" class="space-y-8">
            <div class="group">
              <label for="edit-chapter-title" class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">
                Titre du chapitre
              </label>
              <input 
                id="edit-chapter-title" 
                type="text" 
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1] focus:ring-4 focus:ring-[#B2E9E1]/20"
                v-model="editingChapterTitle" 
                placeholder="Ex: Maîtriser les bases"
                :class="{'border-red-400 focus:border-red-400 focus:ring-red-100': editingChapterTitleError}"
              >
              <p v-if="editingChapterTitleError" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2 italic">
                Le titre du chapitre est requis.
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
                Mettre à jour
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