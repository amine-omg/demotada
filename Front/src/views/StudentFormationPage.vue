<template>
  <div class="min-h-screen bg-gray-50/50 responsive-wrapper flex flex-col">
    <TheHeader pageTitle="Mon Espace Apprenant" :showBackButton="false" />

    <main class="flex-1 w-full p-4 md:p-6 lg:p-8 bg-transparent">
      
      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-[#423B71] tracking-tight">
            Bonjour, <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-[#FF8B7D]">{{ userStore.user.prenom || 'Apprenant' }}</span> 👋
          </h1>
          <p class="text-sm text-gray-500 mt-2 font-medium">
            Prêt à continuer votre apprentissage aujourd'hui ? Voici vos parcours.
          </p>
        </div>
        
        <div v-if="!sessionStore.isLoading && activeSessionsCount > 0" class="flex gap-4">
          <div class="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div class="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
              <i class="fas fa-book-open text-lg"></i>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Formations actives</p>
              <p class="text-xl font-black text-gray-800 leading-none">{{ activeSessionsCount }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="sessionStore.isLoading" class="text-center py-20 flex flex-col items-center">
        <div class="relative w-16 h-16 mb-4">
          <div class="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
          <div class="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
        </div>
        <p class="text-gray-500 font-bold text-lg animate-pulse">Récupération de vos cours...</p>
      </div>

      <div v-else-if="sessionStore.error" class="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
        <i class="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
        <p class="text-red-600 font-bold text-lg">{{ sessionStore.error }}</p>
      </div>

      <div v-else-if="!sessionStore.sessions.length" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
        <div class="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-rocket text-indigo-400 text-4xl"></i>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">Aucun parcours en cours</h2>
        <p class="text-gray-500 text-lg font-medium max-w-md mx-auto">
          Vous n'êtes actuellement inscrit à aucune session de formation. Explorez le catalogue pour démarrer votre prochaine aventure !
        </p>
        <router-link to="/explore" class="bg-gradient-to-r from-[#B2E9E1] to-[#9ddbd1] text-[#423B72] hover:shadow-lg hover:scale-105 px-8 py-3.5 rounded-xl mt-8 inline-flex items-center gap-2 font-bold transition-all">
          Découvrir les formations <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>

      <div v-else class="flex flex-col gap-6 md:gap-8 w-full">
        <div
          v-for="session in sessionStore.sessions"
          :key="session._id"
          :class="[
            'bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col xl:flex-row group w-full',
            getSessionCardClasses(session) 
          ]"
        >
          <div class="w-full xl:w-80 2xl:w-96 relative h-48 xl:h-auto bg-gray-100 overflow-hidden cursor-pointer flex-shrink-0" @click="navigateToClassPage(session._id)">
            <img
              v-if="session.formation?.image"
              :src="session.formation?.image"
              alt="Image de la formation"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
              <i class="fas fa-graduation-cap text-indigo-200 text-7xl"></i>
            </div>
            
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent xl:hidden"></div>
            
            <span :class="['absolute top-4 right-4 xl:hidden px-3 py-1.5 text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 backdrop-blur-md bg-white/90', getSessionStatusBadgeText(session)]">
              <span :class="['w-2 h-2 rounded-full', getSessionStatusBadgeDot(session)]"></span>
              {{ formatStatus(session.status) }}
            </span>
          </div>

          <div class="w-full p-5 md:p-6 lg:p-8 flex flex-col relative min-w-0">
            
            <span :class="['hidden xl:flex absolute top-6 right-6 lg:top-8 lg:right-8 px-4 py-1.5 text-xs font-black rounded-xl shadow-sm items-center gap-2', getSessionStatusBadgeBg(session)]">
              <span :class="['w-2 h-2 rounded-full', getSessionStatusBadgeDot(session)]"></span>
              {{ formatStatus(session.status) }}
            </span>

            <div class="mb-5 xl:pr-32 cursor-pointer w-full" @click="navigateToClassPage(session._id)">
              <p class="text-xs md:text-sm text-indigo-500 font-black mb-1.5 uppercase tracking-widest flex items-center gap-2 truncate">
                <i class="fas fa-bookmark text-indigo-300"></i>
                {{ (session.formation as PopulatedFormation)?.title || 'Formation continue' }}
              </p>
              <h3 class="text-xl md:text-2xl lg:text-3xl font-black text-[#423B71] leading-tight group-hover:text-indigo-600 transition-colors break-words">
                {{ session.title }}
              </h3>
            </div>
            
            <div class="flex flex-wrap gap-3 md:gap-5 mb-6 md:mb-8">
              <div class="flex items-center text-xs md:text-sm text-gray-600 bg-gray-50 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-gray-100 w-fit">
                <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white flex items-center justify-center mr-2 md:mr-3 shadow-sm text-indigo-400 flex-shrink-0">
                  <i class="far fa-calendar-alt"></i>
                </div>
                <div class="flex flex-col">
                  <span class="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase">Période</span>
                  <span class="font-bold text-gray-700">{{ formatDate(session.dateDebut) }} <i class="fas fa-arrow-right mx-1 text-gray-400 text-[8px] md:text-[9px]"></i> {{ formatDate(session.dateFin) }}</span>
                </div>
              </div>
            </div>

            <div class="mt-auto pt-5 md:pt-6 border-t border-gray-100 w-full flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              
              <div class="flex-1 w-full min-w-0">
                <div class="flex justify-between items-end mb-2">
                  <span class="text-xs md:text-sm font-bold text-gray-600 flex items-center gap-2">
                    <i class="fas fa-route text-indigo-400"></i> Votre avancement
                  </span>
                  <div class="flex items-baseline gap-1">
                    <span v-if="isLoadingProgress[session._id]" class="text-[10px] md:text-xs text-gray-400 italic">Calcul...</span>
                    <span v-else :class="['text-base md:text-lg font-black', sessionProgressMap[session._id] === 100 ? 'text-green-500' : 'text-indigo-600']">
                      {{ sessionProgressMap[session._id] || 0 }}%
                    </span>
                  </div>
                </div>
                
                <div class="w-full bg-gray-100 rounded-full h-2 md:h-3 shadow-inner overflow-hidden relative">
                  <div v-if="isLoadingProgress[session._id]" class="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-shimmer"></div>
                  
                  <div 
                    v-else
                    :class="['h-full rounded-full transition-all duration-1000 ease-out', sessionProgressMap[session._id] === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-400 to-[#876EC8]']" 
                    :style="{ width: (sessionProgressMap[session._id] || 0) + '%' }"
                  ></div>
                </div>
              </div>

              <button 
                @click="navigateToClassPage(session._id)"
                class="w-full md:w-auto bg-[#423B71] text-white hover:bg-[#585091] px-5 py-3 md:px-6 md:py-3.5 rounded-xl font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 flex-shrink-0 group/btn text-sm md:text-base"
              >
                <span>{{ (sessionProgressMap[session._id] || 0) > 0 ? 'Reprendre' : 'Commencer' }}</span>
                <i class="fas fa-play text-xs md:text-sm group-hover/btn:translate-x-1 transition-transform"></i>
              </button>

            </div>

          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api';
import { useSessionStore } from '../stores/sessionStore';
import { useUserStore } from '../stores/user';
import { useProgressionStore } from '../stores/progressionStore';
import type { Session, PopulatedFormation } from '../stores/sessionStore';
import TheHeader from '../components/TheHeader.vue';

const router = useRouter();
const sessionStore = useSessionStore();
const userStore = useUserStore();
const progressionStore = useProgressionStore();

const sessionProgressMap = ref<Record<string, number>>({});
const isLoadingProgress = ref<Record<string, boolean>>({});

const activeSessionsCount = computed(() => {
  return sessionStore.sessions.filter(s => s.status !== 'passée').length;
});

const getSessionCardClasses = (session: Session) => {
  if (session.status === 'passée') return 'opacity-70 grayscale hover:grayscale-0';
  return '';
};

const formatStatus = (status?: string) => {
  if (!status) return 'Inconnu';
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getSessionStatusBadgeBg = (session: Session) => {
  const s = session.status?.toLowerCase() || '';
  if (s.includes('en cours')) return 'bg-orange-50 text-orange-700 border border-orange-200';
  if (s.includes('passée')) return 'bg-gray-100 text-gray-700 border border-gray-200';
  if (s.includes('continue')) return 'bg-purple-50 text-purple-700 border border-purple-200';
  return 'bg-blue-50 text-blue-700 border border-blue-200';
};

const getSessionStatusBadgeText = (session: Session) => {
  const s = session.status?.toLowerCase() || '';
  if (s.includes('en cours')) return 'text-orange-600';
  if (s.includes('passée')) return 'text-gray-600';
  if (s.includes('continue')) return 'text-purple-600';
  return 'text-blue-600';
};

const getSessionStatusBadgeDot = (session: Session) => {
  const s = session.status?.toLowerCase() || '';
  if (s.includes('en cours')) return 'bg-orange-500 animate-pulse';
  if (s.includes('passée')) return 'bg-gray-400';
  if (s.includes('continue')) return 'bg-purple-500';
  return 'bg-blue-500';
};

const navigateToClassPage = (sessionId: string) => {
  router.push({ name: 'classe', params: { id: sessionId } });
};

// --- MOTEUR DE CALCUL EXACT ---
const loadProgressForSession = async (session: Session) => {
  const sessionId = session._id;
  isLoadingProgress.value[sessionId] = true;
  
  try {
    const formationId = typeof session.formation === 'object' ? (session.formation as any)._id : session.formation;
    const userId = userStore.user.id;

    const [formationRes, progRes] = await Promise.all([
      api.get(`/api/formations/${formationId}`),
      api.get(`/api/progression/session/${sessionId}`)
    ]);

    const fullFormation = formationRes.data;
    const progressions = progRes.data;

    let totalActivities = 0;
    let completedActivities = 0;

    const sessionProgs = progressions.filter((p: any) => {
      return String(p.user?._id || p.user) === String(userId) && ['termine', 'valide'].includes(p.status);
    });
    
    const completedContentIds = new Set(sessionProgs.map((p: any) => String(p.contentId || p.content?._id || p.content)));

    if (fullFormation && fullFormation.modules) {
      for (const mod of fullFormation.modules) {
        for (const chap of (mod.chapters || [])) {
          const contents = chap.contents || [];
          totalActivities += contents.length;

          for (const content of contents) {
            if (completedContentIds.has(String(content._id || content))) {
              completedActivities++;
            }
          }
        }
      }
    }

    if (totalActivities === 0) {
      sessionProgressMap.value[sessionId] = 0;
    } else {
      const percent = Math.round((completedActivities / totalActivities) * 100);
      sessionProgressMap.value[sessionId] = percent > 100 ? 100 : percent;
    }

  } catch (error) {
    console.error(`Erreur calcul progression session ${sessionId}:`, error);
    sessionProgressMap.value[sessionId] = 0;
  } finally {
    isLoadingProgress.value[sessionId] = false;
  }
};

const fetchAllSessionsAndProgressions = async () => {
  await sessionStore.fetchSessionsForApprenant();
  
  for (const session of sessionStore.sessions) {
    if (sessionProgressMap.value[session._id] === undefined) {
      loadProgressForSession(session);
    }
  }
};

onMounted(async () => {
  if (userStore.user.id) {
    await fetchAllSessionsAndProgressions();
  } else {
    const unwatch = watch(() => userStore.user.id, async (newUserId) => {
      if (newUserId) {
        await fetchAllSessionsAndProgressions();
        unwatch();
      }
    });
  }
});

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

@media (max-width: 1024px) {
  .responsive-wrapper {
    max-width: 100vw;
    overflow-x: hidden;
  }
}
</style>