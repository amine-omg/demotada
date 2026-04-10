<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import StudentSessionTimeModal from './StudentSessionTimeModal.vue';
import api from '/services/api'; // Import nécessaire pour récupérer les temps

const props = defineProps<{
  eleves: any[];
}>();

const emit = defineEmits(['open-add-modal', 'toggle-mute', 'remove-eleve']);
const route = useRoute();

// --- ÉTATS POUR LE MODAL ---
const showTimeModal = ref(false);
const selectedStudent = ref<any>(null);
const sessionId = ref(route.params.id as string);

// --- ÉTATS POUR LES TEMPS DE CONNEXION ---
const studentTimes = ref<Record<string, number>>({});
const isFetchingTimes = ref<Record<string, boolean>>({});

// --- FONCTIONS ---
const getInitials = (prenom: string, nom: string) => {
  return (prenom?.charAt(0) || '') + (nom?.charAt(0) || 'U');
};

const openTimeModal = (eleve: any) => {
  selectedStudent.value = eleve;
  showTimeModal.value = true;
};

// Formateur de temps (pour l'affichage direct dans la carte)
const formatTime = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '0h 00m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

// Requête silencieuse pour charger le temps de chaque élève de la liste
const fetchTimeForStudent = async (userId: string) => {
  if (isFetchingTimes.value[userId]) return;
  isFetchingTimes.value[userId] = true;
  try {
    const res = await api.get(`/api/tracking/session/${sessionId.value}/user/${userId}`);
    studentTimes.value[userId] = res.data.totalSeconds || 0;
  } catch (err) {
    studentTimes.value[userId] = 0;
  } finally {
    isFetchingTimes.value[userId] = false;
  }
};

// Chargement initial
onMounted(() => {
  props.eleves.forEach(eleve => fetchTimeForStudent(eleve.userId));
});

// Chargement si la liste change (ex: ajout d'un élève)
watch(() => props.eleves, (newEleves) => {
  newEleves.forEach(eleve => {
    if (studentTimes.value[eleve.userId] === undefined) {
      fetchTimeForStudent(eleve.userId);
    }
  });
}, { deep: true });
</script>

<template>
  <div class="xl:col-span-2 space-y-6">
    <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-[#423B71] flex items-center gap-2">
            <i class="fas fa-user-graduate text-indigo-400"></i> Apprenants inscrits
          </h2>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            {{ eleves.length }} apprenant(s) classé(s) par progression
          </p>
        </div>
        <button 
          @click="emit('open-add-modal')" 
          class="bg-[#B2E9E1] hover:bg-[#9ddbd1] text-[#443E73] font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <i class="fas fa-plus"></i> Ajouter
        </button>
      </div>

      <div class="flex-1">
        <ul v-if="eleves.length > 0" class="space-y-4">
          <li 
            v-for="eleve in eleves" 
            :key="eleve.userId" 
            class="flex flex-col p-4 md:p-5 bg-gray-50 hover:bg-indigo-50/20 border border-gray-100 hover:border-indigo-100 rounded-xl transition-all shadow-sm gap-3 group overflow-hidden"
          >
            
            <div class="flex items-start justify-between w-full">
              
              <div class="flex items-center gap-4 min-w-0 pr-4">
                <img v-if="eleve.photo" :src="eleve.photo" class="w-12 h-12 rounded-full object-cover shadow-sm flex-shrink-0 border-2 border-white"/>
                <div v-else class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0 border-2 border-white text-lg">
                  {{ getInitials(eleve.prenom, eleve.nom) }}
                </div>
                
                <div class="min-w-0">
                  <p class="font-bold text-gray-800 text-base truncate">{{ eleve.prenom }} {{ eleve.nom }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ eleve.email }}</p>
                  
                  <div class="flex items-center gap-2 mt-1">
                    <span v-if="eleve.hasDisability" class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded border border-yellow-200 flex items-center gap-1" title="Situation de handicap"><i class="fas fa-wheelchair"></i> Handicap</span>
                    <span v-if="eleve.isMuted" class="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded border border-red-200 flex items-center gap-1" title="Sourdine activée"><i class="fas fa-volume-mute"></i> Sourdine</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3 flex-shrink-0 mt-0.5">
                
                <div class="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    @click="emit('toggle-mute', eleve)" 
                    :class="['w-8 h-8 flex items-center justify-center rounded-lg border transition-colors shadow-sm', eleve.isMuted ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' : 'bg-white border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-200']"
                    :title="eleve.isMuted ? 'Réactiver la parole' : 'Mettre en sourdine'"
                  >
                    <i :class="eleve.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up'"></i>
                  </button>
                  <button 
                    @click="emit('remove-eleve', eleve.userId)" 
                    class="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                    title="Retirer de la session"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>

                <button @click="openTimeModal(eleve)" class="flex flex-col items-center justify-center bg-white border border-gray-200 hover:border-[#8A79E2] hover:bg-[#EFEAFB] px-3 py-1.5 rounded-lg shadow-sm transition-all group/time min-w-[70px]">
                  <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 group-hover/time:text-[#8A79E2] transition-colors"><i class="fas fa-stopwatch mr-1"></i>Temps</span>
                  <span class="text-xs md:text-sm font-black text-[#423B71]">
                    <i v-if="isFetchingTimes[eleve.userId]" class="fas fa-circle-notch fa-spin text-gray-300 text-xs"></i>
                    <span v-else>{{ studentTimes[eleve.userId] !== undefined ? formatTime(studentTimes[eleve.userId]) : '...' }}</span>
                  </span>
                </button>

              </div>
            </div>

            <div class="w-full pt-3 border-t border-gray-100 mt-1">
              <div v-if="eleve.progress.total > 0">
                <div class="flex items-center justify-between w-full mb-2 text-xs font-bold text-gray-500">
                  <span class="uppercase tracking-wider text-indigo-400"><i class="fas fa-route mr-1"></i> Progression globale</span>
                  <span :class="eleve.progress.percent === 100 ? 'text-green-600' : 'text-indigo-600'">
                    {{ eleve.progress.percent }}% 
                    <span class="text-gray-400 font-medium ml-1">({{ eleve.progress.completed }}/{{ eleve.progress.total }} activités)</span>
                  </span>
                </div>

                <div class="w-full flex gap-1 h-3 rounded-full overflow-hidden bg-gray-200/50 mb-3 shadow-inner">
                  <div 
                    v-for="mod in eleve.progress.modules" 
                    :key="mod.id"
                    class="relative h-full bg-gray-200 transition-all hover:brightness-90 cursor-help"
                    :style="{ flex: mod.weight }"
                    :title="`${mod.name} : ${mod.completed}/${mod.total} activités validées (${mod.percent}%)`"
                  >
                    <div 
                      :class="['absolute left-0 top-0 h-full transition-all duration-1000', mod.percent === 100 ? 'bg-green-500' : 'bg-indigo-500']" 
                      :style="{ width: mod.percent + '%' }"
                    ></div>
                  </div>
                </div>

                <div class="flex flex-wrap gap-x-4 gap-y-2 mt-2 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div v-for="mod in eleve.progress.modules" :key="mod.id" class="flex items-center gap-1.5 text-[10px] sm:text-xs">
                    <span :class="['w-2.5 h-2.5 rounded-full shadow-sm flex-shrink-0', mod.percent === 100 ? 'bg-green-500' : (mod.percent > 0 ? 'bg-indigo-500' : 'bg-gray-300')]"></span>
                    <span class="text-gray-600 truncate max-w-[120px] sm:max-w-[160px] font-medium" :title="mod.name">{{ mod.name }}</span>
                    <span class="font-bold text-gray-800">{{ mod.completed }}/{{ mod.total }}</span>
                  </div>
                </div>

              </div>
              <div v-else class="text-xs text-gray-400 italic flex items-center justify-center p-4 bg-white rounded-lg border border-gray-100">
                <i class="fas fa-folder-open mr-2"></i> Aucune activité dans le programme.
              </div>
            </div>

          </li>
        </ul>

        <div v-else class="flex flex-col items-center justify-center py-16 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 h-full">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <i class="fas fa-users-slash text-gray-300 text-2xl"></i>
          </div>
          <h3 class="text-lg font-bold text-gray-700">Aucun apprenant</h3>
          <p class="text-sm text-gray-500 mt-1 max-w-sm">Vous n'avez pas encore ajouté d'apprenant à cette session. Cliquez sur "Ajouter" pour commencer.</p>
        </div>
      </div>
    </div>

    <StudentSessionTimeModal 
      :show="showTimeModal"
      :student="selectedStudent"
      :sessionId="sessionId"
      @close="showTimeModal = false"
    />
  </div>
</template>

<style scoped>
.group:hover .group-hover\:opacity-100 {
  opacity: 1;
}
</style>