<template>
  <div class="min-h-screen bg-gray-50/50">
    <TheHeader :pageTitle="`Suivi - ${displayTitle}`" :showBackButton="true" backButtonRoute="/evaluations-hub" />

    <main class="p-6 md:p-8 animate-in fade-in duration-500">
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[#423B71]">
          {{ displayTitle }}
          <span v-if="etablissementName" class="text-gray-500">- {{ etablissementName }}</span>
        </h1>
        <p class="text-gray-600 mt-1">Sélectionnez une formation puis une session pour générer les bilans pédagogiques de vos apprenants.</p>
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
              v-for="formation in filteredFormations" 
              :key="formation._id"
              @click="selectFormation(formation)"
              class="w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between group"
              :class="selectedFormation?._id === formation._id ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100' : 'bg-white border-gray-100 hover:border-indigo-100 hover:bg-gray-50'"
            >
              <div class="flex flex-col pr-4">
                <span class="text-sm font-bold text-[#423B71] line-clamp-1 group-hover:text-indigo-600 transition-colors">{{ formation.title }}</span>
                <span class="text-xs text-gray-400 mt-1">Voir les sessions</span>
              </div>
              <i class="fas fa-chevron-right text-gray-300 group-hover:text-indigo-400 transition-transform" :class="selectedFormation?._id === formation._id ? 'translate-x-1 text-indigo-500' : ''"></i>
            </button>
          </div>
        </div>

        <div class="w-full lg:w-2/3 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 min-h-[600px] flex flex-col">
          
          <div v-if="!selectedFormation" class="flex-1 flex flex-col items-center justify-center text-gray-300 py-20">
            <div class="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4 shadow-inner border border-gray-100">
              <i class="fas fa-mouse-pointer text-3xl opacity-50"></i>
            </div>
            <h2 class="text-lg font-bold text-gray-400">Sélectionnez une formation</h2>
          </div>

          <div v-else class="space-y-8 animate-in slide-in-from-bottom-4 duration-300 flex-1 flex flex-col">
            
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-gray-100 pb-6 gap-6">
              <div>
                <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg mb-2 inline-block">
                  Formation sélectionnée
                </span>
                <h2 class="text-xl font-bold text-[#423B71]">{{ selectedFormation.title }}</h2>
              </div>
              
              <div class="w-full lg:w-64">
                <label class="block text-xs font-bold text-gray-500 mb-2">Filtrer par session</label>
                <div class="relative">
                  <select v-model="selectedSession" class="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 cursor-pointer transition-all">
                    <option :value="null">Toutes les sessions</option>
                    <option v-for="session in sessions" :key="session._id" :value="session._id">
                      {{ formatSessionName(session) }}
                    </option>
                  </select>
                  <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                </div>
              </div>
            </div>

            <div v-if="isLoadingResults" class="flex-1 flex justify-center items-center py-20">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#423B71]"></div>
            </div>

            <div v-else-if="filteredResults.length > 0" class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-gray-50/50 rounded-t-xl">
                  <tr>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tl-xl">Apprenant</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Date</th>
                    <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Score</th>
                    <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="res in filteredResults" :key="res._id" class="hover:bg-gray-50 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                          {{ res.student?.prenom?.charAt(0) || '?' }}{{ res.student?.nom?.charAt(0) || '' }}
                        </div>
                        <div class="flex flex-col">
                          <span class="text-sm font-bold text-gray-900">{{ res.student?.prenom }} {{ res.student?.nom }}</span>
                          <span class="text-xs text-gray-500">{{ res.student?.email }}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span class="text-sm text-gray-600 font-medium">
                        {{ new Date(res.completedAt).toLocaleDateString('fr-FR') }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-center">
                      <span :class="['px-3 py-1 rounded-full text-xs font-bold', res.globalScore >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700']">
                        {{ res.globalScore }}%
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button 
                        @click="handleDownloadPDF(res)"
                        class="px-4 py-2 bg-[#423B71] text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors inline-flex items-center gap-2 shadow-sm"
                        title="Télécharger le Bilan PDF"
                      >
                        <i class="fas fa-file-pdf"></i> VOIR
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="flex-1 flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <i class="fas fa-folder-open text-3xl text-gray-400 mb-3"></i>
              <p class="text-sm font-bold text-gray-600">Aucun résultat trouvé</p>
              <p class="text-xs text-gray-400 mt-1 text-center">
                {{ selectedSession ? "Aucun test validé pour cette session spécifique." : "Aucun élève n'a encore passé ce test." }}
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '/services/api';
import { useUserStore } from '../stores/user';
// 1. AJOUT DU STORE ÉTABLISSEMENT POUR AVOIR LE LOGO
import { useEtablissementsStore } from '../stores/etablissementsStore'; 
import TheHeader from '../components/TheHeader.vue';
import { generateBilanPDF } from '../utils/pdfGenerator';

const props = defineProps<{
  type?: 'positioning' | 'satisfaction_chaud' | 'satisfaction_froid'
}>();

const route = useRoute();
const userStore = useUserStore();
const etablissementsStore = useEtablissementsStore(); // Initialisation du store

const formations = ref<any[]>([]);
const selectedFormation = ref<any>(null);
const fullFormationData = ref<any>(null);
const sessions = ref<any[]>([]);
const selectedSession = ref<string | null>(null);
const results = ref<any[]>([]);
const searchQuery = ref('');

const isLoadingFormations = ref(true);
const isLoadingResults = ref(false);

const activeType = computed(() => {
  if (props.type) return props.type;
  if (route.path.includes('chaud')) return 'satisfaction_chaud';
  if (route.path.includes('froid')) return 'satisfaction_froid';
  return 'positioning';
});

const displayTitle = computed(() => {
  if (activeType.value === 'positioning') return "Tests de Positionnement";
  if (activeType.value === 'satisfaction_chaud') return "Satisfaction à Chaud";
  return "Satisfaction à Froid";
});

const getDocTitle = computed(() => {
  if (activeType.value === 'positioning') return "TEST DE POSITIONNEMENT";
  if (activeType.value === 'satisfaction_chaud') return "QUESTIONNAIRE DE SATISFACTION (À CHAUD)";
  return "QUESTIONNAIRE DE SATISFACTION (À FROID)";
});

// 2. IDENTIFIER L'ÉCOLE ACTUELLE (Contexte)
const currentEcoleId = computed(() => {
  return userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
});

const etablissementName = computed(() => {
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) return userStore.adminSelectedContext.nom;
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) return userStore.user.associatedEntity.nom;
  return '';
});

const formatSessionName = (session: any) => {
  if (session.nom) return session.nom;
  if (session.title) return session.title;
  
  const dateVal = session.startDate || session.dateDebut || session.createdAt;
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return `Session du ${d.toLocaleDateString('fr-FR')}`;
  }
  return `Session ${session._id.substring(0, 6)}`;
};

// 3. FILTRAGE DES FORMATIONS PAR ÉCOLE
const filteredFormations = computed(() => {
  return formations.value.filter(f => {
    // Filtre texte
    const matchesSearch = f && f.title && f.title.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtre école : On vérifie si la formation appartient à l'école du contexte
    const fEcoleId = typeof f.ecole === 'object' ? f.ecole?._id : f.ecole;
    const matchesEcole = currentEcoleId.value ? String(fEcoleId) === String(currentEcoleId.value) : true;
    
    return matchesSearch && matchesEcole;
  });
});

const filteredResults = computed(() => {
  if (!selectedSession.value) return results.value;
  const currentSessionObj = sessions.value.find(s => String(s._id) === String(selectedSession.value));
  if (!currentSessionObj || !currentSessionObj.elevesInscrits) return [];

  return results.value.filter(r => {
    const studentId = r.student?._id || r.student;
    return currentSessionObj.elevesInscrits.some((eleve: any) => String(eleve.userId) === String(studentId));
  });
});

const fetchFormations = async () => {
  isLoadingFormations.value = true;
  try {
    const response = await api.get('/api/formations');
    formations.value = Array.isArray(response.data) ? response.data : response.data.formations;
  } catch (error) {
    console.error("Erreur chargement formations:", error);
  } finally {
    isLoadingFormations.value = false;
  }
};

const selectFormation = async (formation: any) => {
  selectedFormation.value = formation;
  selectedSession.value = null;
  isLoadingResults.value = true;
  
  try {
    const formRes = await api.get(`/api/formations/${formation._id}`);
    fullFormationData.value = formRes.data;

    const sessionRes = await api.get(`/api/sessions`);
    const allSessions = Array.isArray(sessionRes.data) ? sessionRes.data : (sessionRes.data.sessions || []);
    sessions.value = allSessions.filter((s: any) => 
      String(s.formation) === String(formation._id) || 
      (s.formation && String(s.formation._id) === String(formation._id))
    );

    const evalRes = await api.get(`/api/user-evaluations/${formation._id}/stats/${activeType.value}`);
    results.value = evalRes.data;

  } catch (error) {
    console.error("Erreur lors du chargement des détails:", error);
    results.value = [];
    sessions.value = [];
  } finally {
    isLoadingResults.value = false;
  }
};

// 4. RÉCUPÉRATION DE LA VRAIE DATA ÉCOLE POUR LE PDF
const handleDownloadPDF = async (resultRow: any) => {
  if (!fullFormationData.value) return;
  
  const enrichedResult = {
    ...resultRow,
    formationTitle: fullFormationData.value.title
  };

  // On récupère l'ID de l'école liée à la formation ou au contexte
  const ecoleIdToFetch = typeof fullFormationData.value.ecole === 'object' 
    ? fullFormationData.value.ecole?._id 
    : (fullFormationData.value.ecole || currentEcoleId.value);

  let sourceData = null;

  // 1. On force le store à se mettre à jour
  if (ecoleIdToFetch) {
    try {
      await etablissementsStore.fetchEtablissementById(ecoleIdToFetch);
      // C'EST ICI LA CLÉ : On lit la donnée depuis le STATE du store, pas depuis le return du fetch
      sourceData = etablissementsStore.currentEtablissement; 
    } catch (e) {
      console.error("Impossible de récupérer la donnée complète de l'école");
    }
  }

  // 2. Fallback de sécurité
  if (!sourceData) {
     sourceData = userStore.adminSelectedContext || userStore.user.associatedEntity;
  }

  // 3. MAPPING BLINDÉ (Copie exacte de ce qui marche dans ProgrammeSection)
  const finalSchoolData = {
    nom: sourceData?.nom || "Établissement",
    logoUrl: sourceData?.logoUrl || sourceData?.logo || null,
    couleur1: sourceData?.couleur1 || "#423B71", 
    couleur2: sourceData?.couleur2 || "#62D6CA",
    numeroSIRET: sourceData?.siret || sourceData?.numeroSIRET || 'N/A',
    adresse: sourceData?.adresse || null,
    contactEmail: sourceData?.contactEmail || '',
    website: sourceData?.website || ''
  };

  // Petit log de contrôle pour être sûr à 100% avant que ça parte dans le PDF
  console.log("🚀 DATA ENVOYÉE AU PDF GENERATOR:", finalSchoolData);

  // On lance la génération PDF avec la donnée mappée !
  await generateBilanPDF(enrichedResult, finalSchoolData, getDocTitle.value);
};

onMounted(fetchFormations);
</script>