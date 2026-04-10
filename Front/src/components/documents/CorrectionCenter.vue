<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '/services/api';
import { useUserStore } from '../../stores/user';
import { useFormationsStore } from '../../stores/formations';
import TheHeader from '../TheHeader.vue';

const userStore = useUserStore();
const formationsStore = useFormationsStore();

const selectedFormationId = ref('');
const studentsList = ref<any[]>([]);
const isLoadingFormations = ref(true);
const isLoadingStudents = ref(false);
const searchQuery = ref('');

const currentEcoleId = computed(() => {
  return userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
});

const etablissementName = computed(() => {
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) return userStore.adminSelectedContext.nom;
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) return userStore.user.associatedEntity.nom;
  return '';
});

const fetchFormations = async () => {
  isLoadingFormations.value = true;
  try {
    const ecoleId = currentEcoleId.value;
    if (ecoleId) {
      await formationsStore.fetchFormations({ ecoleId });
    }
  } finally {
    isLoadingFormations.value = false;
  }
};

const selectFormation = async (formation: any) => {
  selectedFormationId.value = formation._id;
  isLoadingStudents.value = true;
  studentsList.value = [];
  
  try {
    const res = await api.get(`/api/stats/corrections/formation/${formation._id}`);
    studentsList.value = res.data; 
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingStudents.value = false;
  }
};

const filteredFormations = computed(() => {
  return formationsStore.formations.filter(f => {
    const matchesSearch = f?.title?.toLowerCase().includes(searchQuery.value.toLowerCase());
    const fEcoleId = typeof f.ecole === 'object' ? f.ecole?._id : f.ecole;
    const matchesEcole = currentEcoleId.value ? String(fEcoleId) === String(currentEcoleId.value) : true;
    return matchesSearch && matchesEcole;
  });
});

const getProgressColor = (percent: number) => {
  if (percent === 100) return 'bg-green-500';
  if (percent > 50) return 'bg-indigo-500';
  return 'bg-orange-400';
};

onMounted(fetchFormations);
watch(currentEcoleId, fetchFormations);
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">
    <TheHeader pageTitle="Centre de Corrections" :showBackButton="true" backButtonRoute="/documents" />

    <main class="p-6 md:p-8 animate-in fade-in duration-500">
      
      <div class="mb-8">
        <h1 class="text-3xl md:text-4xl font-black text-[#423B71] tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2 break-words">
          Centre de Corrections
          <span v-if="etablissementName" class="text-gray-400 font-medium text-xl sm:text-2xl truncate">
            <span class="hidden sm:inline">-</span> {{ etablissementName }}
          </span>
        </h1>
        <p class="text-sm text-gray-500 mt-2 font-medium">Suivez l'état d'avancement des devoirs et gérez les corrections par formation.</p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        
        <div class="w-full lg:w-1/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6 max-h-[800px] overflow-y-auto">
          <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">
              <i class="fas fa-book"></i>
            </div>
            <h2 class="text-xl font-bold text-[#423B71]">Formations</h2>
          </div>

          <div class="relative">
            <i class="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" v-model="searchQuery" placeholder="Rechercher..." class="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-indigo-50 transition-all">
          </div>

          <div v-if="isLoadingFormations" class="flex justify-center py-10">
             <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#423B71]"></div>
          </div>

          <div v-else class="space-y-3">
            <button 
              v-for="f in filteredFormations" 
              :key="f._id"
              @click="selectFormation(f)"
              class="w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between group"
              :class="selectedFormationId === f._id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50'"
            >
              <div class="flex flex-col pr-4">
                <span class="text-sm font-bold text-[#423B71] line-clamp-1 group-hover:text-indigo-600 transition-colors">{{ f.title }}</span>
                <span class="text-[8px] font-black text-gray-300 uppercase mt-1 tracking-widest">Voir les rendus</span>
              </div>
              <i class="fas fa-chevron-right text-gray-300 group-hover:text-indigo-400 transition-transform" :class="selectedFormationId === f._id ? 'translate-x-1 text-indigo-500' : ''"></i>
            </button>
          </div>
        </div>

        <div class="w-full lg:w-2/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 min-h-[600px] flex flex-col">
          
          <div v-if="!selectedFormationId" class="flex-1 flex flex-col items-center justify-center text-gray-300 py-20">
            <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 shadow-inner border border-gray-100">
              <i class="fas fa-edit text-3xl opacity-50"></i>
            </div>
            <h2 class="text-lg font-bold text-gray-400">Sélectionnez une formation</h2>
          </div>

          <div v-else-if="isLoadingStudents" class="flex-1 flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#423B71]"></div>
          </div>

          <div v-else class="animate-in slide-in-from-bottom-4 duration-300 flex-1 flex flex-col">
            
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-100 pb-6 mb-8 gap-6">
              <div>
                <span class="px-3 py-1 bg-[#B2E9E1] text-[#423B71] text-[10px] font-black uppercase rounded-lg mb-2 inline-block">
                  Suivi des travaux
                </span>
                <h2 class="text-xl font-bold text-[#423B71]">{{ filteredFormations.find(f => f._id === selectedFormationId)?.title }}</h2>
              </div>
            </div>

            <div v-if="studentsList.length > 0" class="overflow-x-auto">
              <table class="w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr class="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                    <th class="px-6 pb-2">Apprenant</th>
                    <th class="px-6 pb-2 text-center">Rendus</th>
                    <th class="px-6 pb-2 text-center">Progression</th>
                    <th class="px-6 pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in studentsList" :key="student._id" class="bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group rounded-2xl">
                    <td class="px-6 py-4 rounded-l-2xl">
                      <div class="flex items-center gap-4">
                        <div class="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shadow-sm">
                          {{ student.prenom?.charAt(0) }}{{ student.nom?.charAt(0) }}
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-bold text-[#423B71]">{{ student.prenom }} {{ student.nom }}</span>
                          <span class="text-[10px] text-gray-400 font-medium">{{ student.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-black text-[#423B71]">
                        {{ student.assignmentsSubmitted }} / {{ student.totalAssignments }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex flex-col gap-1.5 min-w-[120px]">
                        <div class="flex justify-between text-[9px] font-black text-gray-400 uppercase">
                          <span>Avancement</span>
                          <span>{{ Math.round((student.assignmentsSubmitted / student.totalAssignments) * 100) }}%</span>
                        </div>
                        <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            :class="['h-full transition-all duration-1000', getProgressColor((student.assignmentsSubmitted / student.totalAssignments) * 100)]"
                            :style="{ width: `${(student.assignmentsSubmitted / student.totalAssignments) * 100}%` }"
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right rounded-r-2xl">
                      <button 
                        class="px-5 py-2.5 bg-[#423B71] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#FF8B7D] transition-all shadow-sm active:scale-95 inline-flex items-center gap-2"
                      >
                        <i class="fas fa-graduation-cap"></i> Corriger
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="flex-1 flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <i class="fas fa-users-slash text-3xl text-gray-300 mb-3"></i>
              <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Aucun apprenant trouvé</p>
            </div>

          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-in { animation-fill-mode: both; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
</style>