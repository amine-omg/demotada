<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '/services/api';
import { useUserStore } from '../../stores/user';

const userStore = useUserStore();

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
  (e: 'submit', payload: { 
    type: string, 
    titre: string, 
    description: string,
    apprenantEmail: string, // Sera vide si aucun élève sélectionné
    formationId: string,
    sessionId: string
  }): void; 
}>();

const incidentType = ref<'Bug Technique' | 'Amélioration' | 'Réclamation'>('Réclamation'); 
const incidentTitle = ref('');
const incidentDescription = ref('');
const apprenantEmail = ref('');
const formationId = ref('');
const sessionId = ref('');

interface FormationOption { _id: string; title: string; }
interface SessionOption { _id: string; title: string; }
// Interface basée sur ton sessionUserSchema
interface EleveOption { userId: string; nom: string; prenom: string; email: string; }

const formations = ref<FormationOption[]>([]);
const sessions = ref<SessionOption[]>([]);
const elevesSession = ref<EleveOption[]>([]); // NOUVEAU: Stocke les élèves de la session

const isLoadingFormations = ref(false);
const isLoadingSessions = ref(false);
const isLoadingEleves = ref(false); // NOUVEAU

const errors = ref({
  titre: false,
  description: false,
  formation: false,
  session: false
  // L'email n'est plus ici car il est optionnel !
});

const fetchFormations = async () => {
  isLoadingFormations.value = true;
  try {
    let ecoleId = null;
    if (userStore.userRole === 'admin' && userStore.getAdminContext) {
      ecoleId = userStore.getAdminContext._id;
    } else if (userStore.associatedEntityData) {
      ecoleId = userStore.associatedEntityData._id;
    }

    if (ecoleId) {
      const response = await api.get(`/api/ecoles/${ecoleId}/formations`);
      formations.value = response.data || response;
    } else {
      const response = await api.get('/api/formations');
      formations.value = response.data || response;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
  } finally {
    isLoadingFormations.value = false;
  }
};

const fetchSessions = async (formId: string) => {
  isLoadingSessions.value = true;
  try {
    const response = await api.get('/api/sessions', { params: { formationId: formId } });
    sessions.value = response.data || response;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
  } finally {
    isLoadingSessions.value = false;
  }
};

// NOUVEAU : Récupérer les élèves de la session sélectionnée
const fetchElevesSession = async (sessId: string) => {
  isLoadingEleves.value = true;
  try {
    // getSessionById renvoie la session complète avec elevesInscrits
    const response = await api.get(`/api/sessions/${sessId}`);
    // On extrait le tableau des élèves inscrits
    const sessionData = response.data || response;
    elevesSession.value = sessionData.elevesInscrits || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des élèves de la session:', error);
    elevesSession.value = [];
  } finally {
    isLoadingEleves.value = false;
  }
};

watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    incidentType.value = 'Réclamation';
    incidentTitle.value = '';
    incidentDescription.value = '';
    apprenantEmail.value = '';
    formationId.value = '';
    sessionId.value = '';
    sessions.value = [];
    elevesSession.value = [];
    Object.keys(errors.value).forEach(key => errors.value[key as keyof typeof errors.value] = false);
    
    await fetchFormations();
  }
});

watch(formationId, async (newVal) => {
  sessionId.value = ''; 
  apprenantEmail.value = '';
  elevesSession.value = [];
  if (newVal) {
    await fetchSessions(newVal);
  } else {
    sessions.value = [];
  }
});

// NOUVEAU : Quand la session change, on charge les élèves
watch(sessionId, async (newVal) => {
  apprenantEmail.value = ''; 
  if (newVal) {
    await fetchElevesSession(newVal);
  } else {
    elevesSession.value = [];
  }
});

const submitIncident = () => {
  Object.keys(errors.value).forEach(key => errors.value[key as keyof typeof errors.value] = false);
  let hasError = false;

  if (!incidentTitle.value.trim()) { errors.value.titre = true; hasError = true; }
  if (!incidentDescription.value.trim()) { errors.value.description = true; hasError = true; }
  if (!formationId.value) { errors.value.formation = true; hasError = true; }
  if (!sessionId.value) { errors.value.session = true; hasError = true; }
  // Plus de vérification d'erreur sur l'email !

  if (hasError) return;

  emit('submit', {
    type: incidentType.value,
    titre: incidentTitle.value,
    description: incidentDescription.value,
    apprenantEmail: apprenantEmail.value, // Peut être une string vide
    formationId: formationId.value,
    sessionId: sessionId.value
  });
};

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40 overflow-y-auto" @click.self="closeModal">
      
      <div 
        class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl p-10 relative overflow-hidden my-8"
        @click.stop
      >
        <button @click="closeModal" class="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-[#423B71] hover:bg-white transition-colors focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-[#B2E9E1] rounded-full opacity-20 blur-3xl"></div>

        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-[#423B71] shadow-sm">
              <i class="fas fa-headset"></i>
            </div>
            <div>
              <h3 class="text-3xl font-black text-[#423B71] tracking-tighter">Déclarer un incident</h3>
              <p class="text-sm text-gray-600 font-medium">Enregistrez un retour ou une réclamation (lié ou non à un apprenant).</p>
            </div>
          </div>
          
          <form @submit.prevent="submitIncident" class="space-y-5">
            
            <div class="bg-white/50 p-5 rounded-2xl border border-white/60 space-y-4">
              <h4 class="text-xs font-black text-[#8A79E2] uppercase tracking-widest mb-2"><i class="fas fa-map-marker-alt mr-2"></i>Contexte de l'incident</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="group relative">
                  <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">
                    Formation <span class="text-red-500">*</span> <i v-if="isLoadingFormations" class="fas fa-spinner fa-spin text-[#8A79E2] ml-2"></i>
                  </label>
                  <select 
                    v-model="formationId" 
                    :disabled="isLoadingFormations"
                    :class="{'border-red-400': errors.formation}" 
                    class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-bold appearance-none transition-all focus:border-[#B2E9E1]"
                  >
                    <option value="" disabled>Sélectionner la formation...</option>
                    <option v-for="form in formations" :key="form._id" :value="form._id">
                      {{ form.title }}
                    </option>
                  </select>
                </div>

                <div class="group relative">
                  <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">
                    Session <span class="text-red-500">*</span> <i v-if="isLoadingSessions" class="fas fa-spinner fa-spin text-[#8A79E2] ml-2"></i>
                  </label>
                  <select 
                    v-model="sessionId" 
                    :disabled="!formationId || isLoadingSessions"
                    :class="{'border-red-400': errors.session, 'opacity-50 cursor-not-allowed': !formationId}" 
                    class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-bold appearance-none transition-all focus:border-[#B2E9E1]"
                  >
                    <option value="" disabled>
                      {{ !formationId ? 'Choisissez d\'abord une formation' : 'Sélectionner la session...' }}
                    </option>
                    <option v-for="session in sessions" :key="session._id" :value="session._id">
                      {{ session.title }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="group relative mt-4">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">
                  Apprenant concerné (Optionnel) <i v-if="isLoadingEleves" class="fas fa-spinner fa-spin text-[#8A79E2] ml-2"></i>
                </label>
                <div class="relative">
                  <select 
                    v-model="apprenantEmail"
                    :disabled="!sessionId || isLoadingEleves"
                    class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-bold appearance-none transition-all focus:border-[#B2E9E1] cursor-pointer"
                    :class="{'opacity-50 cursor-not-allowed': !sessionId}"
                  >
                    <option value="">-- Concerne toute la session (aucun apprenant spécifique) --</option>
                    <option v-for="eleve in elevesSession" :key="eleve.userId" :value="eleve.email">
                      {{ eleve.prenom }} {{ eleve.nom }} ({{ eleve.email }})
                    </option>
                  </select>
                  <div class="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-[#423B71] opacity-50">
                    <i class="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="group md:col-span-1">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Type</label>
                <select v-model="incidentType" class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-bold appearance-none transition-all focus:border-[#B2E9E1]">
                  <option value="Réclamation">⚠️ Réclamation</option>
                  <option value="Bug Technique">🐞 Bug Technique</option>
                  <option value="Amélioration">💡 Amélioration</option>
                </select>
              </div>
              
              <div class="group md:col-span-2">
                <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Titre de l'incident <span class="text-red-500">*</span></label>
                <input 
                  type="text" 
                  v-model="incidentTitle"
                  class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-bold placeholder:text-gray-300 transition-all focus:border-[#B2E9E1]"
                  placeholder="Ex: Problème d'accès au QCM final"
                  :class="{'border-red-400': errors.titre}"
                >
              </div>
            </div>

            <div class="group">
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Description détaillée <span class="text-red-500">*</span></label>
              <textarea 
                v-model="incidentDescription"
                rows="3"
                class="w-full px-5 py-3 bg-white border-2 border-transparent rounded-xl shadow-inner outline-none text-[#423B71] font-medium placeholder:text-gray-300 transition-all focus:border-[#B2E9E1] resize-none"
                placeholder="Décrivez la demande ou le problème remonté..."
                :class="{'border-red-400': errors.description}"
              ></textarea>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-3 pt-2">
              <button type="button" @click="closeModal" class="px-6 py-3 text-sm font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all">
                Annuler
              </button>
              <button type="submit" class="px-8 py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-teal-900/10 hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center gap-2">
                <i class="fas fa-save"></i> Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>