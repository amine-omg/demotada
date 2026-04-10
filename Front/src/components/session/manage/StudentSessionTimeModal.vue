<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import api from '/services/api';
import { generateReleveConnexionPDF } from '../../../utils/pdfReleveConnexion';
import { useSessionStore } from '../../../stores/sessionStore';

const props = defineProps<{
  show: boolean;
  student: any | null;
  sessionId: string;
}>();

const emit = defineEmits(['close']);
const sessionStore = useSessionStore();

const isLoading = ref(false);
const timeData = ref<any>(null);

// --- LE SYSTÈME SECRET (EASTER EGG) ---
const secretWord = "urgence";
let typedKeys = "";
const showEmergencyForm = ref(false);
const isInjecting = ref(false);
const errorMessage = ref("");

// Structure optimisée : Saisie directe en minutes pour plus de rapidité
const manualEntry = ref({
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '17:00',
  liveMinutes: 0,
  elearningMinutes: 0,
  classeMinutes: 0
});

const handleKeydown = (e: KeyboardEvent) => {
  typedKeys += e.key.toLowerCase();
  if (typedKeys.length > secretWord.length) {
    typedKeys = typedKeys.slice(-secretWord.length);
  }
  if (typedKeys === secretWord) {
    showEmergencyForm.value = !showEmergencyForm.value;
    typedKeys = "";
  }
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    window.addEventListener('keydown', handleKeydown);
    loadTimeData();
  } else {
    window.removeEventListener('keydown', handleKeydown);
    showEmergencyForm.value = false;
    timeData.value = null;
    typedKeys = "";
    errorMessage.value = "";
  }
});

onUnmounted(() => window.removeEventListener('keydown', handleKeydown));


const submitManualEntry = async () => {
  errorMessage.value = "";
  
  // Sécurité : conversion et fallback à 0 si les champs sont vides (v-model.number)
  const mLive = manualEntry.value.liveMinutes || 0;
  const mElearn = manualEntry.value.elearningMinutes || 0;
  const mClasse = manualEntry.value.classeMinutes || 0;

  // Conversion en secondes pour la BDD (cohérence avec le tracker auto)
  const liveSec = mLive * 60;
  const elearningSec = mElearn * 60;
  const classeSec = mClasse * 60;
  const totalSec = liveSec + elearningSec + classeSec;

  if (totalSec === 0) {
    errorMessage.value = "Veuillez saisir au moins 1 minute de formation.";
    return;
  }

  // Validation de l'amplitude horaire (Amplitude = Heure de fin - Heure de début)
  const [startH, startM] = manualEntry.value.startTime.split(':').map(Number);
  const [endH, endM] = manualEntry.value.endTime.split(':').map(Number);
  const amplitudeMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  const totalMinutesSaisies = mLive + mElearn + mClasse;

  if (totalMinutesSaisies > amplitudeMinutes) {
    errorMessage.value = `Erreur : Le temps total (${totalMinutesSaisies} min) dépasse l'amplitude horaire (${amplitudeMinutes} min).`;
    return;
  }

  isInjecting.value = true;
  try {
    const payload = {
      sessionId: props.sessionId,
      userId: props.student.userId || props.student._id,
      dateString: manualEntry.value.date,
      startTime: manualEntry.value.startTime, // Pour firstConnection
      endTime: manualEntry.value.endTime,     // Pour lastConnection
      details: {
        live: liveSec,
        elearning: elearningSec,
        classe: classeSec
      }
    };

    // Appel à la nouvelle route d'injection manuelle
    await api.post('/api/tracking/manual', payload);
    
    // Succès : Reset et rafraîchissement
    showEmergencyForm.value = false;
    manualEntry.value = {
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00', 
      endTime: '17:00',
      liveMinutes: 0, 
      elearningMinutes: 0, 
      classeMinutes: 0
    };
    await loadTimeData();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Erreur lors de l'injection du temps.";
  } finally {
    isInjecting.value = false;
  }
};

const formatTime = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '0h 00m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

const formatTimeShort = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${minutes}m`;
};

const exportPdf = async () => {
  if (!timeData.value || !props.student) return;
  const currentSession = sessionStore.currentSession;
  try {
    await generateReleveConnexionPDF(
      timeData.value, 
      props.student, 
      { title: currentSession?.title || "Session de formation" }
    );
  } catch (e) {
    console.error("Erreur PDF:", e);
    alert("Erreur lors de la génération du PDF.");
  }
};

// --- FONCTION DE RÉPARATION DES LOGS ANCIENS ---
const repairMissingConnections = async () => {
  if (!timeData.value || !timeData.value.logs) return;

  // On filtre les logs qui ont du temps mais pas de plage horaire
  const logsToRepair = timeData.value.logs.filter((log: any) => 
    log.totalSeconds > 0 && (!log.firstConnection || !log.lastConnection)
  );

  if (logsToRepair.length === 0) return;

  try {
    // On envoie la liste des IDs à réparer au backend
    await api.post('/api/tracking/repair-logs', {
      logIds: logsToRepair.map((l: any) => l._id)
    });
    
    // Une fois réparé, on recharge discrètement pour afficher les vraies heures
    const response = await api.get(`/api/tracking/session/${props.sessionId}/user/${props.student.userId || props.student._id}`);
    timeData.value = response.data;
  } catch (error) {
    console.error("Erreur lors de la réparation automatique des logs:", error);
  }
};

const loadTimeData = async () => {
  if (!props.student || !props.sessionId) return;
  isLoading.value = true;
  try {
    const response = await api.get(`/api/tracking/session/${props.sessionId}/user/${props.student.userId || props.student._id}`);
    timeData.value = response.data;
    
    // 🌟 APPEL DE LA RÉPARATION ICI
    await repairMissingConnections();
    
  } catch (error) {
    timeData.value = null;
  } finally {
    isLoading.value = false;
  }
};

const deleteLog = async (logId: string) => {
  if (!confirm("Voulez-vous vraiment supprimer définitivement ce journal d'activité ? Cette action est irréversible pour Qualiopi.")) return;
  
  try {
    // On appelle la route de suppression (à créer côté backend si pas faite)
    await api.delete(`/api/tracking/log/${logId}`);
    // On rafraîchit la liste
    await loadTimeData();
  } catch (error) {
    alert("Erreur lors de la suppression du log.");
  }
};
</script>
<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] transition-opacity" @click="emit('close')"></div>
    </Transition>

    <Transition name="slide">
      <div v-if="show" class="fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-white shadow-2xl flex flex-col transform overflow-hidden">
        
        <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center z-20 bg-white">
          <div>
            <h2 class="text-lg font-black text-[#423B71]">Temps de formation</h2>
            <p class="text-xs font-bold text-gray-500 mt-0.5" v-if="student">
              <i class="fas fa-user-graduate mr-1"></i> {{ student.prenom }} {{ student.nom }}
            </p>
          </div>
          <button @click="emit('close')" class="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="showEmergencyForm" class="bg-red-50 border-b-2 border-red-200 p-5 shadow-inner z-20">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
              <i class="fas fa-biohazard"></i> Régularisation Manuelle
            </h3>
            <button @click="showEmergencyForm = false" class="text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button>
          </div>
          
          <p v-if="errorMessage" class="text-[10px] font-bold text-white bg-red-500 p-2 rounded mb-3 shadow-sm">
            <i class="fas fa-exclamation-triangle mr-1"></i> {{ errorMessage }}
          </p>

          <form @submit.prevent="submitManualEntry" class="space-y-4">
            <div class="grid grid-cols-3 gap-2">
              <div class="col-span-3">
                <label class="block text-[10px] font-bold text-red-800 mb-1">Date d'activité</label>
                <input type="date" v-model="manualEntry.date" required class="w-full text-xs p-2 rounded border border-red-200 focus:ring-red-400 outline-none">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-red-800 mb-1" title="1ère connexion">1ère Conn.</label>
                <input type="time" v-model="manualEntry.startTime" required class="w-full text-xs p-1.5 rounded border border-red-200 outline-none">
              </div>
              <div>
                <label class="block text-[9px] font-bold text-red-800 mb-1" title="Dernière connexion">Der. Conn.</label>
                <input type="time" v-model="manualEntry.endTime" required class="w-full text-xs p-1.5 rounded border border-red-200 outline-none">
              </div>
            </div>
            
            <hr class="border-red-200">

            <div class="space-y-2">
              <label class="block text-[10px] font-bold text-red-800">Temps effectif réalisé (en minutes)</label>
              
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold text-red-700 w-20"><i class="fas fa-video w-3"></i> Live</span>
                <div class="flex items-center">
                  <input type="number" min="0" v-model.number="manualEntry.liveMinutes" class="w-16 text-xs p-1.5 rounded border border-red-200 text-center font-bold">
                  <span class="text-xs font-bold text-red-400 ml-2">min</span>
                </div>
              </div>
              
              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold text-red-700 w-20"><i class="fas fa-laptop-code w-3"></i> E-learn</span>
                <div class="flex items-center">
                  <input type="number" min="0" v-model.number="manualEntry.elearningMinutes" class="w-16 text-xs p-1.5 rounded border border-red-200 text-center font-bold">
                  <span class="text-xs font-bold text-red-400 ml-2">min</span>
                </div>
              </div>

              <div class="flex items-center justify-between gap-2">
                <span class="text-[10px] font-bold text-red-700 w-20"><i class="fas fa-chalkboard w-3"></i> Dashb.</span>
                <div class="flex items-center">
                  <input type="number" min="0" v-model.number="manualEntry.classeMinutes" class="w-16 text-xs p-1.5 rounded border border-red-200 text-center font-bold">
                  <span class="text-xs font-bold text-red-400 ml-2">min</span>
                </div>
              </div>
            </div>

            <button type="submit" :disabled="isInjecting" class="w-full mt-2 bg-red-600 text-white font-bold text-[10px] uppercase tracking-widest py-2.5 rounded-lg shadow hover:bg-red-700 transition-colors">
              <span v-if="isInjecting"><i class="fas fa-spinner fa-spin mr-2"></i> Injection...</span>
              <span v-else><i class="fas fa-check-circle mr-2"></i> Valider la régularisation</span>
            </button>
          </form>
        </div>

        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
            <i class="fas fa-circle-notch fa-spin text-4xl text-[#8A79E2] mb-4"></i>
          </div>

          <div v-else-if="timeData" class="space-y-6">
            <div class="bg-gradient-to-br from-[#EFEAFB] to-[#DCD8F4] p-5 rounded-2xl border border-white shadow-inner relative overflow-hidden">
              <i class="fas fa-stopwatch absolute -right-4 -bottom-4 text-white opacity-40 text-7xl transform -rotate-12"></i>
              <p class="text-[10px] font-black text-[#8A79E2] uppercase tracking-widest mb-1 relative z-10">Total Session</p>
              <p class="text-4xl font-black text-[#423B71] relative z-10">{{ formatTime(timeData.totalSeconds) }}</p>
            </div>

            <div>
              <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 px-1">Preuves d'assiduité</h3>
              <div v-if="timeData.logs?.length > 0" class="space-y-3">
                <div v-for="log in timeData.logs" :key="log._id" class="group relative flex flex-col p-4 bg-gray-50 hover:bg-white border border-gray-100 hover:border-[#8A79E2]/30 rounded-2xl transition-all shadow-sm">
                  
                  <button 
                    v-if="showEmergencyForm"
                    @click="deleteLog(log._id)"
                    class="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-30"
                    title="Supprimer cette entrée"
                  >
                    <i class="fas fa-trash-alt text-[10px]"></i>
                  </button>

                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 border border-gray-100">
                        <i class="far fa-calendar-check text-sm"></i>
                      </div>
                      <div>
                        <p class="text-xs font-black text-gray-700 uppercase tracking-tight">
                          {{ new Date(log.dateString).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) }}
                        </p>
                        <p class="text-[10px] font-bold text-gray-400 italic">
                          <i class="far fa-clock mr-1"></i> {{ log.firstConnection || '--:--' }} <i class="fas fa-arrow-right mx-0.5 opacity-30"></i> {{ log.lastConnection || '--:--' }}
                        </p>
                      </div>
                    </div>
                    <span class="text-sm font-black text-[#423B71] bg-white px-2 py-1 rounded-lg border border-gray-100">{{ formatTime(log.totalSeconds) }}</span>
                  </div>

                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-if="log.details?.live > 0" class="text-[9px] font-bold bg-white text-red-500 px-2 py-0.5 rounded-md border border-red-50 shadow-sm flex items-center gap-1">
                      <i class="fas fa-video"></i> {{ formatTimeShort(log.details.live) }}
                    </span>
                    <span v-if="log.details?.elearning > 0" class="text-[9px] font-bold bg-white text-blue-500 px-2 py-0.5 rounded-md border border-blue-50 shadow-sm flex items-center gap-1">
                      <i class="fas fa-laptop-code"></i> {{ formatTimeShort(log.details.elearning) }}
                    </span>
                    <span v-if="log.details?.classe > 0" class="text-[9px] font-bold bg-white text-purple-500 px-2 py-0.5 rounded-md border border-purple-50 shadow-sm flex items-center gap-1">
                      <i class="fas fa-chalkboard"></i> {{ formatTimeShort(log.details.classe) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <i class="fas fa-ghost text-gray-200 text-3xl mb-2"></i>
                <p class="text-[10px] font-bold text-gray-400 uppercase">Aucune donnée</p>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-gray-100 bg-white">
          <button @click="exportPdf" :disabled="!timeData || timeData.totalSeconds === 0" class="w-full bg-white border-2 border-gray-200 text-gray-600 hover:border-[#8A79E2] hover:text-[#8A79E2] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
            <i class="fas fa-file-pdf"></i> Exporter Relevé de Connexions
          </button>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* (Garde ton CSS slide-enter etc. identique ici) */
.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease-in-out; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
.slide-enter-to, .slide-leave-from { transform: translateX(0); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
</style>