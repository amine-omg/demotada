<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useUserStore } from '../stores/user';
import { useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

const userStore = useUserStore();
const router = useRouter();

const filters = ref({
  search: '',
  sortBy: 'createdAt',
});

const allUsersFromAPI = computed(() => userStore.userList);

const apprenants = computed(() => {
    return allUsersFromAPI.value.filter(user => user.role === 'apprenant');
});

const filteredApprenants = computed(() => {
  let filtered = [...apprenants.value];

  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    filtered = filtered.filter(a =>
      (a.nom && a.nom.toLowerCase().includes(searchTerm)) ||
      (a.prenom && a.prenom.toLowerCase().includes(searchTerm)) ||
      (a.email && a.email.toLowerCase().includes(searchTerm))
    );
  }

  if (filters.value.sortBy === 'nom') {
    filtered.sort((a, b) => (a.nom || '').localeCompare(b.nom || ''));
  } else if (filters.value.sortBy === 'createdAt') {
    filtered.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
    });
  }
  return filtered;
});

const extraData = ref<Record<string, { time: number, sessionCount: number, loaded: boolean }>>({});
const isFetchingExtra = ref(false);

watch(apprenants, async (newVals) => {
  if (newVals.length > 0 && !isFetchingExtra.value) {
    isFetchingExtra.value = true;
    try {
      const resSessions = await api.get('/api/sessions');
      const sessions = resSessions.data || [];
      
      const counts: Record<string, number> = {};
      sessions.forEach((s: any) => {
        s.elevesInscrits?.forEach((e: any) => {
          const uid = String(e.userId?._id || e.userId || e._id);
          counts[uid] = (counts[uid] || 0) + 1;
        });
      });

      for (const a of newVals) {
        const uid = String(a._id);
        if (!extraData.value[uid]) {
          extraData.value[uid] = { time: 0, sessionCount: counts[uid] || 0, loaded: false };
        } else {
          extraData.value[uid].sessionCount = counts[uid] || 0;
        }

        if (!extraData.value[uid].loaded) {
          api.get(`/api/tracking/user/${uid}`).then(res => {
            if (res.data) {
              extraData.value[uid].time = res.data.totalSecondsOverall || 0;
            }
            extraData.value[uid].loaded = true;
          }).catch(() => {
            extraData.value[uid].loaded = true;
          });
        }
      }
    } catch (e) {
    }
  }
}, { immediate: true });

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (totalSeconds: number) => {
  if (!totalSeconds || totalSeconds === 0) return '0h';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return minutes > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${hours}h`;
};

const getStatus = (apprenant: any) => {
  const data = extraData.value[String(apprenant._id)];
  const count = data?.sessionCount || 0;
  if (count > 0) {
    return { label: `En formation (${count})`, class: 'bg-emerald-50 border-emerald-200 text-emerald-600' };
  }
  return { label: 'Inactif', class: 'bg-gray-50 border-gray-200 text-gray-400' };
};

onMounted(() => {
  userStore.loadApprenantList();
});

const goToProfile = (id: string) => {
  router.push({ name: 'apprenant-profile', params: { id } });
};
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] flex flex-col w-full">
    <TheHeader pageTitle="Annuaire Apprenants" :showBackButton="false" />

    <main class="p-6 md:p-8 w-full flex-1 flex flex-col">
      
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 w-full">
        <div>
          <h1 class="text-3xl md:text-4xl font-black text-[#423B71] leading-tight">Mes Apprenants</h1>
          <p class="text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
            <i class="fas fa-users mr-2 text-[#8A79E2]"></i> {{ filteredApprenants.length }} Profils enregistrés
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div class="relative flex-1 sm:w-80">
            <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"></i>
            <input
              type="text"
              v-model="filters.search"
              placeholder="Rechercher un apprenant..."
              class="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-[#8A79E2]/20 outline-none font-bold text-sm text-[#423B71]"
            />
          </div>
          <select 
            v-model="filters.sortBy" 
            class="px-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm outline-none font-bold text-sm text-gray-500 cursor-pointer"
          >
            <option value="createdAt">Plus récents</option>
            <option value="nom">Ordre alphabétique (A-Z)</option>
          </select>
        </div>
      </div>

      <div v-if="userStore.isLoading && filteredApprenants.length === 0" class="flex flex-col items-center justify-center py-32 w-full">
        <i class="fas fa-circle-notch fa-spin text-5xl text-[#8A79E2] mb-4"></i>
        <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronisation des profils...</p>
      </div>

      <div v-else-if="userStore.error" class="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-4 w-full">
        <i class="fas fa-exclamation-circle text-2xl"></i>
        <p class="font-bold">Erreur de chargement : {{ userStore.error }}</p>
      </div>

      <div v-else class="w-full flex flex-col gap-3">
        
        <div class="hidden md:flex items-center px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-200 w-full">
          <div class="flex-1">Apprenant</div>
          <div class="w-32 text-center">Statut</div>
          <div class="w-32 text-center">Temps Total</div>
          <div class="w-32 text-center">Inscription</div>
          <div class="w-12"></div>
        </div>

        <div 
          v-for="apprenant in filteredApprenants" 
          :key="apprenant._id"
          @click="goToProfile(apprenant._id)"
          class="group flex flex-col md:flex-row md:items-center bg-white rounded-2xl p-4 md:px-6 md:py-4 shadow-sm border border-gray-100 hover:border-[#8A79E2]/40 hover:shadow-md transition-all cursor-pointer w-full gap-4 md:gap-0"
        >
          
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <div class="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center text-[#8A79E2] font-black shrink-0">
              <img v-if="apprenant.photo" :src="apprenant.photo" class="w-full h-full object-cover" />
              <span v-else>{{ apprenant.prenom?.charAt(0) }}{{ apprenant.nom?.charAt(0) }}</span>
            </div>
            <div class="min-w-0">
              <h3 class="text-sm md:text-base font-black text-[#423B71] truncate group-hover:text-[#8A79E2] transition-colors">
                {{ apprenant.prenom }} {{ apprenant.nom }}
              </h3>
              <p class="text-xs font-bold text-gray-400 truncate mt-0.5">{{ apprenant.email }}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 md:flex md:items-center gap-4 md:gap-0">
            
            <div class="md:w-32 flex justify-start md:justify-center items-center">
              <span :class="['text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border', getStatus(apprenant).class]">
                {{ getStatus(apprenant).label }}
              </span>
            </div>

            <div class="md:w-32 flex flex-col md:items-center justify-center border-l md:border-none border-gray-100 pl-4 md:pl-0">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest md:hidden mb-1">Temps</span>
              <span class="text-sm font-black text-[#423B71] flex items-center gap-1.5">
                <i class="fas fa-stopwatch text-[#8A79E2] opacity-70"></i> 
                {{ formatTime(extraData[apprenant._id]?.time || 0) }}
              </span>
            </div>

            <div class="md:w-32 flex flex-col md:items-center justify-center border-l md:border-none border-gray-100 pl-4 md:pl-0">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest md:hidden mb-1">Inscrit le</span>
              <span class="text-xs font-bold text-gray-500">{{ formatDate(apprenant.createdAt) }}</span>
            </div>
          </div>

          <div class="hidden md:flex w-12 justify-end items-center">
            <div class="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#EFEAFB] group-hover:text-[#8A79E2] transition-all">
              <i class="fas fa-chevron-right text-xs"></i>
            </div>
          </div>

        </div>

        <div v-if="filteredApprenants.length === 0" class="w-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4">
          <i class="fas fa-user-slash text-4xl text-gray-300 mb-4"></i>
          <p class="font-bold text-gray-400">Aucun apprenant ne correspond à votre recherche.</p>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #EFEAFB;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #8A79E2;
}
</style>