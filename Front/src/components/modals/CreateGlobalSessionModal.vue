<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useFormationsStore } from '../../stores/formations';
import { useLieuxStore } from '../../stores/LieuxStore';

const props = defineProps<{
  showModal: boolean;
  sessionId: string | null;
  etablissementId: string | null;
}>();

const emit = defineEmits(['close', 'save-session']);

const sessionStore = useSessionStore();
const formationsStore = useFormationsStore();
const lieuxStore = useLieuxStore();

const currentSession = ref<any>({
  formation: null, 
  type: 'programme',
  title: '',
  description: '',
  dateDebut: undefined,
  dateFin: undefined,
  dateExamen: undefined,
  lieu: null,
  isDefaultContinuous: false,
});

// FORCE LE CONTEXTE : Filtrage local strict sur l'ID de l'établissement
const filteredFormations = computed(() => {
  if (!props.etablissementId) return [];
  return formationsStore.formations.filter(f => {
    const fEcoleId = typeof f.ecole === 'object' ? f.ecole?._id : f.ecole;
    return String(fEcoleId) === String(props.etablissementId);
  });
});

const isEditMode = computed(() => props.sessionId !== null);
const modalTitle = computed(() => isEditMode.value ? `Modifier la session` : 'Nouvelle session');
const activeLieux = computed(() => lieuxStore.activeLieux);

const errors = ref({ title: false, formation: false, common: '' });

watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    resetForm();
    if (props.etablissementId) {
        // On utilise les fetchs officiels bridés par l'ID établissement
        formationsStore.fetchFormations({ ecoleId: props.etablissementId });
        lieuxStore.fetchLieux(props.etablissementId);
    }
    
    if (isEditMode.value) loadSessionForEdit();
  }
}, { immediate: true });

const loadSessionForEdit = async () => {
  if (props.sessionId) {
    const sessionToEdit = sessionStore.sessions.find(s => s._id === props.sessionId);
    if (sessionToEdit) {
      currentSession.value = {
        ...sessionToEdit,
        formation: typeof sessionToEdit.formation === 'object' ? sessionToEdit.formation._id : sessionToEdit.formation,
        dateDebut: sessionToEdit.dateDebut ? new Date(sessionToEdit.dateDebut).toISOString().slice(0, 10) : undefined,
        dateFin: sessionToEdit.dateFin ? new Date(sessionToEdit.dateFin).toISOString().slice(0, 10) : undefined,
        dateExamen: sessionToEdit.dateExamen ? new Date(sessionToEdit.dateExamen).toISOString().slice(0, 10) : undefined,
        lieu: sessionToEdit.lieu || null,
      };
    }
  }
};

const resetForm = () => {
  currentSession.value = {
    formation: null, type: 'programme', title: '', description: '',
    dateDebut: undefined, dateFin: undefined, dateExamen: undefined, lieu: null, isDefaultContinuous: false,
  };
};

const validateForm = () => {
  errors.value = { title: false, formation: false, common: '' };
  if (!currentSession.value.title?.trim()) errors.value.title = true;
  if (!currentSession.value.formation) errors.value.formation = true;
  return !errors.value.title && !errors.value.formation;
};

const handleSubmit = () => { if (validateForm()) emit('save-session', currentSession.value); };
const closeModal = () => emit('close');
</script>

<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40" @click.self="closeModal">
      
      <div 
        class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl p-10 relative overflow-hidden max-h-[95vh] overflow-y-auto"
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
            <i class="fas fa-calendar-plus"></i>
          </div>

          <h3 class="text-4xl font-black text-[#423B71] mb-2 tracking-tighter">{{ modalTitle }}</h3>
          <p class="text-gray-600 mb-8 font-medium italic">Seules les formations de l'établissement sélectionné sont disponibles.</p>
          
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">Formation (Catalogue École)</label>
              <select 
                v-model="currentSession.formation" 
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold transition-all focus:border-[#B2E9E1]"
                :class="{'border-red-400': errors.formation}"
              >
                <option :value="null" disabled>-- Choisissez une formation --</option>
                <option v-for="f in filteredFormations" :key="f._id" :value="f._id">
                  {{ f.title }}
                </option>
              </select>
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">Nom de la session</label>
              <input 
                type="text" 
                v-model="currentSession.title" 
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]" 
                placeholder="Ex: Cohorte Hiver 2026" 
                :class="{'border-red-400': errors.title}"
              >
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-3 ml-1">Lieu de formation</label>
              <select 
                v-model="currentSession.lieu" 
                class="w-full px-6 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold transition-all focus:border-[#B2E9E1]"
              >
                <option :value="null">🌐 Distanciel / En ligne</option>
                <option v-for="lieu in activeLieux" :key="lieu._id" :value="lieu._id">
                  📍 {{ lieu.nom }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="group">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Date Début</label>
                <input type="date" v-model="currentSession.dateDebut" class="w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none font-bold text-[#423B71] focus:border-[#B2E9E1]">
              </div>
              <div class="group">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Date Fin</label>
                <input type="date" v-model="currentSession.dateFin" class="w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none font-bold text-[#423B71] focus:border-[#B2E9E1]">
              </div>
              <div class="group">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Examen</label>
                <input type="date" v-model="currentSession.dateExamen" class="w-full px-4 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none font-bold text-[#423B71] focus:border-[#B2E9E1]">
              </div>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-4 pt-4">
              <button 
                type="button" 
                @click="closeModal" 
                class="w-full sm:w-auto px-8 py-4 text-sm font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                class="w-full sm:w-auto px-10 py-4 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <i class="fas fa-check"></i>
                {{ isEditMode ? 'Enregistrer' : 'Planifier la session' }}
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

/* Style pour l'icône de calendrier des inputs date */
input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
    opacity: 0.6;
    filter: invert(24%) sepia(14%) saturate(2244%) hue-rotate(211deg) brightness(94%) contrast(91%);
}
</style>