<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';

interface SessionUser {
  userId: string; nom: string; prenom: string; email: string; role: 'formateur' | 'eleve'; completion: number; dateInscription: string; enAttenteValidation?: boolean;
}
interface SessionFormData {
  _id?: string; formation: string; type: 'programme' | 'continue'; title: string; description: string; dateDebut?: string; dateFin?: string; dateExamen?: string; lieu?: string; formateurs?: SessionUser[]; elevesInscrits?: SessionUser[]; isDefaultContinuous: boolean;
}

const props = defineProps<{
  showModal: boolean;
  sessionId: string | null; 
  formationId: string; 
}>();

const emit = defineEmits(['close', 'save-session']);

const sessionStore = useSessionStore();

const currentSession = ref<SessionFormData>({
  formation: props.formationId, 
  type: 'programme', 
  title: '',
  description: '',
  dateDebut: undefined,
  dateFin: undefined,
  dateExamen: undefined,
  lieu: '',
  isDefaultContinuous: false,
});

const isEditMode = computed(() => props.sessionId !== null);
const modalTitle = computed(() => isEditMode.value ? `Modifier la session` : 'Nouvelle session');

const errors = ref({
  title: false,
  dateDebut: false,
  dateFin: false,
  common: ''
});

watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    resetForm();
    errors.value = { title: false, dateDebut: false, dateFin: false, common: '' };
    if (isEditMode.value) {
     loadSessionForEdit();
   } else {
     currentSession.value.formation = props.formationId; 
     currentSession.value.type = 'programme';
   }
 }
});

const loadSessionForEdit = async () => {
  if (props.sessionId) {
    const sessionToEdit = sessionStore.sessions.find(s => s._id === props.sessionId);
    if (sessionToEdit) {
      currentSession.value = {
        _id: sessionToEdit._id,
        formation: typeof sessionToEdit.formation === 'string' ? sessionToEdit.formation : (sessionToEdit.formation as any)._id,
        type: sessionToEdit.type,
        title: sessionToEdit.title,
        description: sessionToEdit.description,
        dateDebut: sessionToEdit.dateDebut ? new Date(sessionToEdit.dateDebut).toISOString().slice(0, 10) : undefined,
        dateFin: sessionToEdit.dateFin ? new Date(sessionToEdit.dateFin).toISOString().slice(0, 10) : undefined,
        dateExamen: sessionToEdit.dateExamen ? new Date(sessionToEdit.dateExamen).toISOString().slice(0, 10) : undefined,
        lieu: sessionToEdit.lieu,
        isDefaultContinuous: sessionToEdit.isDefaultContinuous,
      };
    } else {
      errors.value.common = "Session non trouvée.";
    }
  }
};

const resetForm = () => {
  currentSession.value = {
    formation: props.formationId, 
    type: 'programme',
    title: '',
    description: '',
    dateDebut: undefined,
    dateFin: undefined,
    dateExamen: undefined,
    lieu: '',
    isDefaultContinuous: false,
  };
};

const validateForm = () => {
  let isValid = true;
  errors.value = { title: false, dateDebut: false, dateFin: false, common: '' };
  if (!currentSession.value.title.trim()) { errors.value.title = true; isValid = false; }
  if (currentSession.value.type === 'programme') {
    if (!currentSession.value.dateDebut) { errors.value.dateDebut = true; isValid = false; }
    if (!currentSession.value.dateFin) { errors.value.dateFin = true; isValid = false; }
    if (currentSession.value.dateDebut && currentSession.value.dateFin &&
        new Date(currentSession.value.dateDebut) >= new Date(currentSession.value.dateFin)) {
      errors.value.dateFin = true;
      errors.value.common = "La date de fin doit être après le début.";
      isValid = false;
    }
  }
  return isValid;
};

const handleSubmit = () => { if (validateForm()) emit('save-session', currentSession.value); };
const closeModal = () => emit('close');
</script>

<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40" @click.self="closeModal">
      
      <div 
class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl p-10 relative overflow-hidden"
        @click.stop
      >
        <button 
          @click="closeModal" 
          class="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-[#423B71] hover:bg-gray-100 transition-colors focus:outline-none"
        >
          <i class="fas fa-times"></i>
        </button>

        <div class="absolute -top-24 -left-24 w-48 h-48 bg-[#B2E9E1] rounded-full opacity-10 blur-3xl"></div>

        <div class="relative z-10">
          <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-[#423B71] shadow-sm mb-6">
            <i class="fas fa-calendar-alt"></i>
          </div>

          <h3 class="text-4xl font-black text-[#423B71] mb-2 tracking-tighter">{{ modalTitle }}</h3>
          <p class="text-gray-500 mb-8 font-medium">Définissez les dates et détails de planification.</p>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div v-if="errors.common" class="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold uppercase tracking-wider border border-red-100">
              <i class="fas fa-exclamation-circle mr-2"></i> {{ errors.common }}
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Titre de la session</label>
              <input 
                type="text" 
                class="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold transition-all focus:bg-white focus:border-[#B2E9E1]"
                v-model="currentSession.title" 
                placeholder="Ex: Session Printemps 2025"
                :class="{'border-red-400': errors.title}"
              >
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Description (Optionnel)</label>
              <textarea 
                v-model="currentSession.description"
                rows="2"
                class="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold transition-all focus:bg-white focus:border-[#B2E9E1] resize-none"
                placeholder="Précisions sur cette session..."
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Début</label>
                <input type="date" v-model="currentSession.dateDebut" class="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl shadow-inner outline-none font-bold text-[#423B71] focus:bg-white focus:border-[#B2E9E1]" :class="{'border-red-400': errors.dateDebut}">
              </div>
              <div>
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Fin</label>
                <input type="date" v-model="currentSession.dateFin" class="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl shadow-inner outline-none font-bold text-[#423B71] focus:bg-white focus:border-[#B2E9E1]" :class="{'border-red-400': errors.dateFin}">
              </div>
              <div>
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Examen</label>
                <input type="date" v-model="currentSession.dateExamen" class="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl shadow-inner outline-none font-bold text-[#423B71] focus:bg-white focus:border-[#B2E9E1]">
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-4 pt-6">
              <button type="button" @click="closeModal" class="w-full sm:w-auto px-8 py-4 text-sm font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all">
                Annuler
              </button>
              <button type="submit" class="w-full sm:w-auto px-10 py-4 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95">
                {{ isEditMode ? 'Mettre à jour' : 'Planifier la session' }}
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