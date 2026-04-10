<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import api from '/services/api';
import { generateReleveConnexionPDF } from '../utils/pdfReleveConnexion';
import TheHeader from '../components/TheHeader.vue';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const userId = computed(() => route.params.id as string);

const editableUser = ref({ nom: '', prenom: '', isHandicap: false });
const profileFileInputRef = ref<HTMLInputElement | null>(null);
const userProfile = computed(() => userStore.selectedUser);
const isLoading = computed(() => userStore.isLoading);
const error = computed(() => userStore.error);

const studyTimeStats = ref<any>(null);
const isStudyTimeLoading = ref(true);

const studentOpportunites = ref<any[]>([]);
const isLoadingOpp = ref(false);

const studentSessions = ref<any[]>([]);
const isLoadingSessions = ref(false);

const studentIncidents = ref<any[]>([]);
const isLoadingIncidents = ref(false);

const formatTime = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '0h 00m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
};

const enrichedSessions = computed(() => {
  const sessionsMap = new Map();

  studentSessions.value.forEach(session => {
    sessionsMap.set(String(session._id), {
      ...session,
      title: session.title || session.formation?.title || 'Session sans titre',
      completion: session.computedProgress?.percent || 0,
      modulesProgress: session.computedProgress?.modules || [],
      timeStats: { totalSeconds: 0, details: { live: 0, elearning: 0, classe: 0 } }
    });
  });

  if (studyTimeStats.value && studyTimeStats.value.summaryBySession) {
    studyTimeStats.value.summaryBySession.forEach((summary: any) => {
      let existingSession = Array.from(sessionsMap.values()).find(s => s.title === summary.title || String(s._id) === String(summary.sessionId));

      if (existingSession) {
        existingSession.timeStats = summary;
      } else {
        sessionsMap.set(summary.title, {
          _id: summary.title,
          title: summary.title,
          type: 'archivée',
          completion: 0,
          modulesProgress: [],
          timeStats: summary
        });
      }
    });
  }

  return Array.from(sessionsMap.values());
});

const fetchStudyTimes = async () => {
  isStudyTimeLoading.value = true;
  try {
    const response = await api.get(`/api/tracking/user/${userId.value}`);
    studyTimeStats.value = response.data;
  } catch (error) {
  } finally {
    isStudyTimeLoading.value = false;
  }
};

const fetchStudentOpportunites = async () => {
  isLoadingOpp.value = true;
  try {
    const res = await api.get(`/api/crm/opportunites`);
    const allOpps = res.data || [];
    studentOpportunites.value = allOpps.filter((opp: any) => {
      if (!opp.apprenants) return false;
      return opp.apprenants.some((a: any) => String(a._id || a) === String(userId.value));
    });
  } catch (err) {
  } finally {
    isLoadingOpp.value = false;
  }
};

const fetchStudentSessions = async () => {
  isLoadingSessions.value = true;
  try {
    const res = await api.get(`/api/sessions`);
    const allSessions = res.data || [];
    
    const enrolledSessions = allSessions.filter((session: any) => 
      session.elevesInscrits?.some((e: any) => String(e.userId?._id || e.userId) === String(userId.value) || String(e._id) === String(userId.value))
    );

    const sessionsWithProgress = [];
    
    for (const session of enrolledSessions) {
       let computedProgress = { percent: 0, modules: [] };
       try {
         const formationId = typeof session.formation === 'object' ? session.formation._id : session.formation;
         const formRes = await api.get(`/api/formations/${formationId}`);
         const fullFormation = formRes.data;

         const progRes = await api.get(`/api/progression/session/${session._id}`);
         const allProgs = progRes.data || [];
         
         const userProgs = allProgs.filter((p: any) => {
           const pUserId = String(p.user?._id || p.user || p.userId);
           return pUserId === String(userId.value) && ['termine', 'valide'].includes(p.status);
         });
         
         const completedContentIds = new Set(userProgs.map((p: any) => String(p.content || p.contentId)));

         let totalOverall = 0;
         let completedOverall = 0;
         const modulesProgress: any[] = [];

         if (fullFormation && fullFormation.modules) {
           for (const mod of fullFormation.modules) {
             const modChapters = mod.chapters || [];
             let modTotalActivities = 0;
             let modCompletedActivities = 0;

             for (const chap of modChapters) {
               const contents = chap.contents || [];
               modTotalActivities += contents.length; 
               for (const content of contents) {
                 if (completedContentIds.has(String(content._id || content))) {
                   modCompletedActivities++;
                 }
               }
             }

             if (modTotalActivities > 0) {
               totalOverall += modTotalActivities;
               completedOverall += modCompletedActivities;
               modulesProgress.push({
                 id: mod._id,
                 name: mod.name || mod.title,
                 total: modTotalActivities,
                 completed: modCompletedActivities,
                 percent: Math.round((modCompletedActivities / modTotalActivities) * 100)
               });
             }
           }
         }

         const percentOverall = totalOverall > 0 ? Math.round((completedOverall / totalOverall) * 100) : 0;
         computedProgress = { percent: percentOverall > 100 ? 100 : percentOverall, modules: modulesProgress as never[] };
       } catch (e) {}

       sessionsWithProgress.push({
         ...session,
         computedProgress
       });
    }

    studentSessions.value = sessionsWithProgress;
  } catch (err) {
  } finally {
    isLoadingSessions.value = false;
  }
};

const fetchStudentIncidents = async () => {
  isLoadingIncidents.value = true;
  try {
    const res = await api.get(`/api/incidents`);
    const allIncidents = res.data || [];
    studentIncidents.value = allIncidents.filter((incident: any) => 
      String(incident.createur?._id || incident.createur) === String(userId.value) || 
      String(incident.apprenantConcerne?._id || incident.apprenantConcerne) === String(userId.value)
    );
  } catch (err) {
  } finally {
    isLoadingIncidents.value = false;
  }
};

onMounted(async () => {
  if (userId.value) {
    userStore.fetchUserById(userId.value);
    userStore.fetchUserLogs(userId.value);
    fetchStudentOpportunites();
    fetchStudyTimes();
    fetchStudentSessions();
    fetchStudentIncidents();
  }
});

watch(userProfile, (newUser) => {
  if (newUser) {
    editableUser.value.nom = newUser.nom || '';
    editableUser.value.prenom = newUser.prenom || '';
    editableUser.value.isHandicap = newUser.isHandicap || false;
  }
});

const exportSessionPdf = async (session: any) => {
  if (!session || !userProfile.value) return;

  const sessionLogs = studyTimeStats.value?.logs?.filter((log: any) => 
    String(log.session?._id) === String(session._id) || log.session?.title === session.title
  ) || [];

  const timeDataForPdf = {
    totalSeconds: session.timeStats.totalSeconds || 0,
    details: session.timeStats.details || { live: 0, elearning: 0, classe: 0 },
    logs: sessionLogs
  };

  try {
    await generateReleveConnexionPDF(
      timeDataForPdf,
      userProfile.value,
      { title: `Relevé d'Assiduité - ${session.title}` }
    );
  } catch(e) {
    alert("Erreur lors de la génération du document.");
  }
};

const goToOpportunite = (id: string) => {
  router.push({ name: 'opportunite-detail', params: { id } });
};

const handleUpdate = async () => {
  if (!userProfile.value) return;
  const success = await userStore.updateUserByAdmin(userProfile.value._id, {
    nom: editableUser.value.nom,
    prenom: editableUser.value.prenom,
    isHandicap: editableUser.value.isHandicap,
  });
  if (success) alert('Profil mis à jour avec succès !');
  else alert(`Erreur : ${userStore.error}`);
};

const handleDelete = async () => {
  if (!userProfile.value) return;
  if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${userProfile.value.prenom} ?`)) {
    const success = await userStore.deleteUserByAdmin(userProfile.value._id);
    if (success) {
      alert('Apprenant supprimé avec succès.');
      router.push({ name: 'apprenants' });
    }
  }
};

const triggerProfileFileUpload = () => profileFileInputRef.value?.click();

const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('profilePhoto', file);
  await userStore.uploadUserPhotoByAdmin(userId.value, formData);
};

const formatCurrency = (val: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val || 0);

const getIncidentStatusClass = (status: string) => {
  if (status === 'Clôturé') return 'bg-emerald-50 text-emerald-600';
  if (status === 'Action corrective en cours') return 'bg-purple-50 text-purple-600';
  if (status === 'En cours d\'analyse') return 'bg-amber-50 text-amber-600';
  return 'bg-blue-50 text-blue-600';
};
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] font-sans flex flex-col w-full">
    <TheHeader pageTitle="Dossier Apprenant" :showBackButton="true" backButtonRoute="/apprenants" />

    <main class="flex-1 w-full flex flex-col">
      <div v-if="isLoading" class="flex-1 flex justify-center items-center h-64">
          <i class="fas fa-circle-notch fa-spin text-4xl text-[#8A79E2]"></i>
      </div>
      
      <div v-else-if="error" class="m-6 md:m-8 p-6 bg-red-50 text-red-700 rounded-2xl border border-red-100 w-full">
          <p class="font-bold"><i class="fas fa-exclamation-triangle mr-2"></i> Erreur : {{ error }}</p>
      </div>

      <div v-else-if="userProfile" class="w-full flex flex-col">
        <div class="h-48 md:h-64 bg-gradient-to-r from-[#DCD8F4] to-[#EFEAFB] relative shadow-inner w-full">
           <div class="absolute -bottom-12 md:-bottom-16 left-6 md:left-12 w-24 h-24 md:w-36 md:h-36 rounded-[2rem] overflow-hidden bg-white border-4 md:border-8 border-white flex items-center justify-center shadow-xl z-10">
              <img v-if="userProfile.photo" :src="userProfile.photo" alt="Photo" class="w-full h-full object-cover">
              <span v-else class="text-3xl md:text-4xl font-black text-[#8A79E2]">{{ userProfile.prenom?.charAt(0) }}{{ userProfile.nom?.charAt(0) }}</span>
           </div>
        </div>
        
        <div class="w-full px-6 py-16 md:px-8 md:py-20 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
           <div class="lg:col-span-1 space-y-6 md:space-y-8 w-full">
               <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 w-full">
                  <h1 class="text-2xl md:text-3xl font-black text-[#423B71] leading-tight mb-1">{{ userProfile.prenom }} {{ userProfile.nom }}</h1>
                  <p class="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">{{ userProfile.email }}</p>

                  <div class="flex items-center gap-4 mb-8">
                    <button @click="triggerProfileFileUpload" class="px-4 py-2 bg-[#EFEAFB] text-[#8A79E2] font-bold text-xs rounded-xl hover:bg-[#DCD8F4] transition-colors">
                      <i class="fas fa-camera mr-2"></i> Modifier photo
                    </button>
                    <input type="file" ref="profileFileInputRef" @change="handleFileSelected" class="hidden" accept="image/*" />
                  </div>

                  <form @submit.prevent="handleUpdate" class="space-y-4 md:space-y-5">
                    <div>
                      <label class="block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Prénom</label>
                      <input type="text" v-model="editableUser.prenom" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#423B71] focus:ring-2 focus:ring-[#8A79E2]/20 outline-none">
                    </div>
                    <div>
                      <label class="block text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Nom</label>
                      <input type="text" v-model="editableUser.nom" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#423B71] focus:ring-2 focus:ring-[#8A79E2]/20 outline-none">
                    </div>
                    
                    <div class="flex items-center p-3 md:p-4 bg-yellow-50 rounded-xl border border-yellow-100 mt-4">
                      <input type="checkbox" id="isHandicap" v-model="editableUser.isHandicap" class="h-4 w-4 md:h-5 md:w-5 rounded text-yellow-600 focus:ring-yellow-500">
                      <label for="isHandicap" class="ml-3 block text-xs md:text-sm font-bold text-yellow-800">
                        Situation de handicap (RQTH)
                      </label>
                    </div>

                    <button type="submit" class="w-full mt-6 bg-[#B2E9E1] text-[#423B71] font-black text-[10px] md:text-xs uppercase tracking-widest py-3 px-6 rounded-xl hover:bg-[#FF8B7D] hover:text-white transition-all shadow-sm">
                      Mettre à jour le profil
                    </button>
                  </form>
               </div>

               <div class="bg-red-50 rounded-[2rem] border border-red-100 p-6 md:p-8 w-full">
                  <h3 class="text-[10px] md:text-sm font-black text-red-600 uppercase tracking-widest mb-2"><i class="fas fa-exclamation-triangle mr-2"></i> Zone de danger</h3>
                  <p class="text-[10px] md:text-xs text-red-500 mb-6 font-medium">La suppression d'un apprenant efface tout son historique de progression.</p>
                  <button @click="handleDelete" class="w-full bg-white border-2 border-red-200 text-red-600 font-black text-[10px] md:text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                    Supprimer l'apprenant
                  </button>
               </div>
           </div>

           <div class="lg:col-span-2 space-y-6 md:space-y-8 w-full">
              <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 w-full relative overflow-hidden">
                <div class="absolute -right-4 -top-4 text-gray-50 opacity-50 text-7xl pointer-events-none transform rotate-12">
                  <i class="fas fa-layer-group"></i>
                </div>
                
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-4 relative z-10">
                  <h2 class="text-lg md:text-xl font-black text-[#423B71] flex items-center gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-[#EFEAFB] rounded-xl flex items-center justify-center text-[#8A79E2] text-sm md:text-base"><i class="fas fa-route"></i></div>
                    Parcours & Assiduité
                  </h2>
                </div>

                <div v-if="studyTimeStats" class="flex items-center gap-4 p-4 mb-6 bg-gradient-to-r from-[#EFEAFB] to-white rounded-xl border border-[#EFEAFB] relative z-10">
                  <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0 text-[#8A79E2] text-xl">
                    <i class="fas fa-stopwatch"></i>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Temps Total Global</p>
                    <p class="text-2xl font-black text-[#423B71] leading-tight">{{ formatTime(studyTimeStats.totalSecondsOverall) }}</p>
                  </div>
                </div>

                <div v-if="isLoadingSessions || isStudyTimeLoading" class="text-center py-8 relative z-10">
                  <i class="fas fa-circle-notch fa-spin text-[#8A79E2] text-2xl"></i>
                </div>
                <div v-else-if="enrichedSessions.length === 0" class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 relative z-10">
                  <i class="fas fa-inbox text-gray-300 text-3xl mb-3"></i>
                  <p class="text-xs md:text-sm font-bold text-gray-500">Aucune session ni temps d'étude trouvé.</p>
                </div>
                
                <div v-else class="flex flex-col gap-4 relative z-10">
                  <div v-for="session in enrichedSessions" :key="session._id" class="p-4 md:p-5 bg-gray-50 hover:bg-indigo-50/20 rounded-xl border border-gray-100 hover:border-indigo-100 transition-all shadow-sm group">
                    
                    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <h4 class="font-bold text-gray-800 text-base truncate">{{ session.title }}</h4>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          <i class="fas fa-graduation-cap mr-1 text-indigo-400"></i>
                          {{ session.type === 'continue' ? 'Session Continue' : (session.type === 'programme' ? 'Session Programmée' : 'Session Archivée') }}
                        </p>
                      </div>
                      <div class="text-right flex flex-col items-end">
                        <button 
                          @click.stop="exportSessionPdf(session)"
                          :disabled="!session.timeStats || session.timeStats.totalSeconds === 0"
                          title="Télécharger le relevé de connexions PDF"
                          class="bg-white border border-gray-200 text-[#8A79E2] px-3 py-1.5 rounded-lg text-sm font-black shadow-sm flex items-center gap-2 hover:bg-[#8A79E2] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <i class="fas fa-file-pdf"></i> {{ formatTime(session.timeStats.totalSeconds) }}
                        </button>
                      </div>
                    </div>

                    <div v-if="session.timeStats.totalSeconds > 0" class="flex flex-wrap gap-2 mb-4">
                      <div v-if="session.timeStats.details.live > 0" class="flex items-center gap-1.5 text-[10px] font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 text-red-500">
                        <i class="fas fa-video"></i> Live: {{ formatTime(session.timeStats.details.live) }}
                      </div>
                      <div v-if="session.timeStats.details.elearning > 0" class="flex items-center gap-1.5 text-[10px] font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 text-blue-500">
                        <i class="fas fa-laptop-code"></i> E-learning: {{ formatTime(session.timeStats.details.elearning) }}
                      </div>
                      <div v-if="session.timeStats.details.classe > 0" class="flex items-center gap-1.5 text-[10px] font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100 text-purple-500">
                        <i class="fas fa-chalkboard"></i> Dashboard: {{ formatTime(session.timeStats.details.classe) }}
                      </div>
                    </div>

                    <div class="w-full pt-3 border-t border-gray-100 mt-1">
                       <div class="flex items-center justify-between w-full mb-2 text-xs font-bold text-gray-500">
                         <span class="uppercase tracking-wider text-indigo-400"><i class="fas fa-route mr-1"></i> Progression globale</span>
                         <span :class="session.completion === 100 ? 'text-green-600' : 'text-indigo-600'">
                           {{ session.completion || 0 }}%
                         </span>
                       </div>
                       
                       <div class="w-full flex gap-1 h-3 rounded-full overflow-hidden bg-gray-200/50 mb-1 shadow-inner">
                         <div class="relative h-full bg-gray-200 transition-all w-full">
                           <div :class="['absolute left-0 top-0 h-full transition-all duration-1000', session.completion === 100 ? 'bg-green-500' : 'bg-indigo-500']" 
                                :style="{ width: `${session.completion || 0}%` }">
                           </div>
                         </div>
                       </div>

                       <div v-if="session.modulesProgress && session.modulesProgress.length > 0" class="mt-3 space-y-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100/50">
                          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Détail des modules</p>
                          <div v-for="(mod, index) in session.modulesProgress" :key="index" class="flex justify-between items-center bg-white border border-gray-100 px-3 py-2 rounded-lg shadow-sm">
                            <span class="text-[10px] text-gray-600 truncate font-medium"><i class="fas fa-cube text-gray-300 mr-1.5"></i> {{ mod.name || `Module ${index + 1}` }}</span>
                            <span class="text-[10px] font-black text-[#423B71]">{{ mod.completed || 0 }}/{{ mod.total || 0 }}</span>
                          </div>
                       </div>
                    </div>

                  </div>
                </div>
              </div>

              <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 w-full">
                <div class="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                  <h2 class="text-lg md:text-xl font-black text-[#423B71] flex items-center gap-3">
                    <div class="w-8 h-8 md:w-10 md:h-10 bg-[#EFEAFB] rounded-xl flex items-center justify-center text-[#8A79E2] text-sm md:text-base"><i class="fas fa-handshake"></i></div>
                    Dossiers Commerciaux (CRM)
                  </h2>
                  <button @click="router.push('/pipeline')" class="text-[10px] md:text-xs font-bold text-[#8A79E2] hover:underline">Voir le Pipeline</button>
                </div>

                <div v-if="isLoadingOpp" class="text-center py-8"><i class="fas fa-spinner fa-spin text-[#8A79E2] text-2xl"></i></div>
                <div v-else-if="studentOpportunites.length === 0" class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <i class="fas fa-folder-open text-gray-300 text-3xl md:text-4xl mb-3"></i>
                  <p class="text-xs md:text-sm font-bold text-gray-500">Aucune opportunité liée à cet apprenant.</p>
                </div>
                
                <div v-else class="flex flex-col gap-4">
                  <div v-for="opp in studentOpportunites" :key="opp._id" 
                       @click="goToOpportunite(opp._id)"
                       class="group p-4 md:p-5 bg-white border-2 border-gray-100 rounded-2xl hover:border-[#8A79E2] cursor-pointer transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-1.5">
                        <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md">{{ opp.currentStage }}</span>
                        <span v-if="opp.statutOpportunite !== 'Indécis'" 
                              :class="['text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md', opp.statutOpportunite === 'Gagné' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                          {{ opp.statutOpportunite }}
                        </span>
                      </div>
                      <h4 class="font-bold text-[#423B71] text-base md:text-lg leading-tight group-hover:text-[#8A79E2] transition-colors">{{ opp.nomOpportunite }}</h4>
                      <p v-if="opp.formation?.title" class="text-xs text-gray-500 mt-1 font-medium"><i class="fas fa-graduation-cap mr-1"></i> {{ opp.formation.title }}</p>
                    </div>
                    
                    <div class="flex items-center justify-between md:flex-col md:items-end md:justify-center border-t border-gray-50 md:border-none pt-3 md:pt-0 gap-1 md:gap-2">
                      <span class="text-sm md:text-base font-black text-[#FF8B7D]">{{ formatCurrency(opp.valeur) }}</span>
                      <span class="text-[10px] md:text-xs font-bold text-gray-400 flex items-center gap-2">
                        <i class="far fa-calendar-alt"></i> {{ new Date(opp.dateCreation).toLocaleDateString() }}
                        <i class="fas fa-chevron-right text-gray-300 group-hover:text-[#8A79E2] group-hover:translate-x-1 transition-all ml-1 hidden md:block"></i>
                      </span>
                    </div>

                  </div>
                </div>
              </div>

              <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 w-full">
                <h2 class="text-lg md:text-xl font-black text-[#423B71] flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                  <div class="w-8 h-8 md:w-10 md:h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 text-sm md:text-base"><i class="fas fa-exclamation-circle"></i></div>
                  Incidents & Support
                </h2>

                <div v-if="isLoadingIncidents" class="text-center py-8"><i class="fas fa-spinner fa-spin text-orange-500 text-2xl"></i></div>
                <div v-else-if="studentIncidents.length === 0" class="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <i class="fas fa-check-circle text-gray-300 text-3xl mb-3"></i>
                  <p class="text-xs md:text-sm font-bold text-gray-500">Aucun incident reporté par cet apprenant.</p>
                </div>
                
                <div v-else class="flex flex-col gap-3">
                  <div v-for="incident in studentIncidents" :key="incident._id" class="p-4 bg-white border border-gray-100 rounded-xl flex items-start justify-between gap-4 hover:shadow-sm">
                    <div>
                      <h4 class="font-bold text-[#423B71] text-sm">{{ incident.titre || 'Incident sans titre' }}</h4>
                      <p class="text-[10px] font-medium text-gray-500 mt-1 line-clamp-2">{{ incident.description }}</p>
                      <p class="text-[9px] font-bold text-gray-400 mt-2"><i class="far fa-calendar-alt"></i> Signalé le {{ new Date(incident.createdAt).toLocaleDateString('fr-FR') }}</p>
                    </div>
                    <span :class="['text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shrink-0', getIncidentStatusClass(incident.statut)]">
                      {{ incident.statut || 'Nouveau' }}
                    </span>
                  </div>
                </div>
              </div>

           </div>
        </div>
      </div>
    </main>
  </div>
</template>