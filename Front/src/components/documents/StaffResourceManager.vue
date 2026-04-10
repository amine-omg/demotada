<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import api from '/services/api';
import { useUserStore } from '../../stores/user';
import { useFormationsStore } from '../../stores/formations';
import TheHeader from '../TheHeader.vue';
import SupportPreview from './SupportPreview.vue';

const userStore = useUserStore();
const formationsStore = useFormationsStore();

const selectedFormationId = ref('');
const fullFormationData = ref<any>(null);
const isLoadingFormations = ref(true);
const isLoadingContent = ref(false);
const searchQuery = ref('');

const showPreview = ref(false);
const selectedSupport = ref<any>(null);

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
  isLoadingContent.value = true;
  fullFormationData.value = null;
  try {
    const res = await api.get(`/api/formations/${formation._id}`);
    fullFormationData.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingContent.value = false;
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

const organizedContent = computed(() => {
  if (!fullFormationData.value || !fullFormationData.value.modules) return [];
  return fullFormationData.value.modules.map((module: any) => ({
    _id: module._id,
    name: module.name,
    chapters: (module.chapters || []).map((chapter: any) => ({
      _id: chapter._id,
      title: chapter.title,
      supports: (chapter.contents || []).filter((act: any) => act.type === 'Support')
    })).filter((chap: any) => chap.supports.length > 0)
  })).filter((mod: any) => mod.chapters.length > 0);
});

const getFileIcon = (title: string) => {
  const ext = title?.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { icon: 'fa-file-pdf', color: 'text-red-500' };
  if (['doc', 'docx'].includes(ext || '')) return { icon: 'fa-file-word', color: 'text-blue-500' };
  if (['png', 'jpg', 'jpeg'].includes(ext || '')) return { icon: 'fa-file-image', color: 'text-purple-500' };
  return { icon: 'fa-file-alt', color: 'text-gray-400' };
};

const openPreview = (support: any) => {
  selectedSupport.value = support;
  showPreview.value = true;
};

onMounted(fetchFormations);
watch(currentEcoleId, fetchFormations);
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">
    <TheHeader pageTitle="Bibliothèque Pédagogique" :showBackButton="true" backButtonRoute="/documents" />
    <main class="p-6 md:p-8 animate-in fade-in duration-500">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[#423B71]">
          Gestion des Supports
          <span v-if="etablissementName" class="text-gray-500">- {{ etablissementName }}</span>
        </h1>
        <p class="text-gray-600 mt-1">Visualisez et administrez tous les documents téléchargeables de vos programmes.</p>
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
            <button v-for="f in filteredFormations" :key="f._id" @click="selectFormation(f)" class="w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between group" :class="selectedFormationId === f._id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50'">
              <div class="flex flex-col pr-4">
                <span class="text-sm font-bold text-[#423B71] line-clamp-1 group-hover:text-indigo-600 transition-colors">{{ f.title }}</span>
                <span class="text-xs text-gray-400 mt-1 uppercase tracking-widest font-black text-[8px]">Sélectionner</span>
              </div>
              <i class="fas fa-chevron-right text-gray-300 group-hover:text-indigo-400 transition-transform" :class="selectedFormationId === f._id ? 'translate-x-1 text-indigo-500' : ''"></i>
            </button>
          </div>
        </div>

        <div class="w-full lg:w-2/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 min-h-[600px] flex flex-col">
          <div v-if="!fullFormationData" class="flex-1 flex flex-col items-center justify-center text-gray-300 py-20">
            <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 shadow-inner border border-gray-100">
              <i class="fas fa-mouse-pointer text-3xl opacity-50"></i>
            </div>
            <h2 class="text-lg font-bold text-gray-400">Sélectionnez une formation</h2>
          </div>
          <div v-else-if="isLoadingContent" class="flex-1 flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#423B71]"></div>
          </div>
          <div v-else class="animate-in slide-in-from-bottom-4 duration-300 flex-1 flex flex-col">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-100 pb-6 mb-8 gap-6">
              <div>
                <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg mb-2 inline-block">Supports Actifs</span>
                <h2 class="text-xl font-bold text-[#423B71]">{{ fullFormationData.title }}</h2>
              </div>
            </div>

            <div v-if="organizedContent.length > 0" class="space-y-12">
              <div v-for="module in organizedContent" :key="module._id">
                <div class="flex items-center gap-4 mb-6">
                  <h3 class="text-xs font-black text-[#423B71] uppercase tracking-[0.2em] whitespace-nowrap">{{ module.name }}</h3>
                  <div class="h-px bg-gray-100 w-full"></div>
                </div>
                <div class="space-y-6">
                  <div v-for="chapter in module.chapters" :key="chapter._id" class="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                    <h4 class="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                      <i class="fas fa-bookmark text-[10px] text-indigo-300"></i>
                      {{ chapter.title }}
                    </h4>
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-6">
                      <div v-for="support in chapter.supports" :key="support._id" @click="openPreview(support)" class="group flex flex-col items-center text-center cursor-pointer">
                        <div class="w-14 h-16 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center mb-2 group-hover:shadow-md group-hover:border-[#B2E9E1] transition-all relative">
                           <i :class="['fas text-2xl', getFileIcon(support.title).icon, getFileIcon(support.title).color]"></i>
                           <div class="absolute bottom-0 inset-x-0 h-1 bg-gray-50 group-hover:bg-[#B2E9E1] transition-colors"></div>
                        </div>
                        <span class="text-[10px] font-bold text-[#423B71] w-full truncate px-1" :title="support.title">{{ support.title }}</span>
                        <span class="text-[8px] font-black text-gray-300 uppercase mt-0.5 tracking-tighter">Support {{ support.resourceType || 'PDF' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex-1 flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <i class="fas fa-folder-open text-3xl text-gray-400 mb-3"></i>
              <p class="text-sm font-bold text-gray-600">Aucun support trouvé</p>
            </div>
          </div>
        </div>
      </div>
    </main>
    <SupportPreview :show="showPreview" :support="selectedSupport" @close="showPreview = false" />
  </div>
</template>

<style scoped>
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.animate-in { animation-fill-mode: both; }
</style>