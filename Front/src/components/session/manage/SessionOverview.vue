<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import type { PropType } from 'vue';
import type { Session } from '../../../stores/sessionStore';
import { useProgressionStore } from '../../../stores/progressionStore';
import { useFormationsStore } from '../../../stores/formations';

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true
  }
});

const progressionStore = useProgressionStore();
const formationStore = useFormationsStore();

const isLoading = ref(false);
const error = ref<string | null>(null);

const progressions = computed(() => progressionStore.progressions);
const formation = computed(() => formationStore.currentFormation);

// Fonction de chargement des données
const loadResultsData = async () => {
  if (!props.session || !props.session._id) return;
  
  isLoading.value = true;
  error.value = null;
  
  try {
    await progressionStore.fetchProgressionForSession(props.session._id);
    
    const formationId = typeof props.session.formation === 'object' 
      ? (props.session.formation as any)._id 
      : props.session.formation;
      
    if (formationId) {
      await formationStore.fetchFormationById(formationId);
    }
  } catch (err) {
    console.error("Erreur lors du chargement des résultats:", err);
    error.value = "Impossible de charger les résultats des apprenants.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(loadResultsData);
watch(() => props.session._id, loadResultsData);

// Le filtre magique mis à jour pour calculer le ratio de réussite
const filteredProgressions = computed(() => {
  if (!progressions.value || !Array.isArray(progressions.value)) return [];

  const mapped = progressions.value
    .filter(p => {
      const isRightSession = String(p.session?._id || p.session) === String(props.session._id);
      const isFinished = p.status === 'termine' || p.status === 'valide';
      return isRightSession && isFinished;
    })
    .map(p => {
      const userId = p.user?._id || p.user || p.userId;
      const matchingEleve = props.session.elevesInscrits?.find(e => 
        String(e.userId) === String(userId) || String(e.id) === String(userId)
      );
      
      const prenom = matchingEleve?.prenom || p.user?.prenom || 'Apprenant';
      const nom = matchingEleve?.nom || p.user?.nom || '';

      let contentTitle = 'Évaluation / Devoir'; 
      let actualContentType = 'Unknown'; 
      let foundContentData: any = null;
      
      if (formation.value && formation.value.modules) {
        for (const mod of formation.value.modules) {
          for (const chap of (mod.chapters || [])) {
            const foundContent = (chap.contents || []).find((c: any) => String(c._id) === String(p.contentId));
            if (foundContent) {
              contentTitle = foundContent.title;
              actualContentType = foundContent.type; 
              foundContentData = foundContent;
              break;
            }
          }
        }
      }

      // --- LOGIQUE DE GESTION DU SCORE ET DE LA RÉUSSITE ---
      // 1. Déterminer le score max (soit celui sauvé en BDD, soit depuis la formation, soit 10 par défaut)
      let maxScore = p.totalScore || (foundContentData ? foundContentData.totalPossibleScore : 0) || 10;
      if (p.score > maxScore) maxScore = p.score; // Sécurité anti-bug (ex: 12/10)

      // 2. Déterminer la note minimale pour passer (par défaut 50%)
      let minScore = (foundContentData && foundContentData.minScoreToPass !== undefined) 
        ? foundContentData.minScoreToPass 
        : (maxScore / 2);

      // 3. L'élève a-t-il réussi ?
      const isPassed = p.score >= minScore;

      return {
        ...p,
        displayPrenom: prenom,
        displayNom: nom,
        contentLabel: contentTitle,
        actualContentType: actualContentType,
        maxScore: maxScore,
        isPassed: isPassed,
        initiales: (prenom.charAt(0) || '') + (nom.charAt(0) || 'U')
      };
    });

    return mapped
      .filter(p => {
        const isGradedContent = p.actualContentType === 'Quiz' || p.actualContentType === 'Exercise' || p.actualContentType === 'Assignment';
        const isBackendQuiz = p.contentType === 'Quiz';
        return isGradedContent || isBackendQuiz;
      })
      .sort((a, b) => a.displayPrenom.localeCompare(b.displayPrenom));
});

const deleteProgression = async (progressionId: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce résultat ? L'apprenant devra recommencer l'évaluation.")) {
    try {
      await progressionStore.deleteProgression(progressionId);
      await loadResultsData(); 
    } catch (err) {
      alert("Une erreur est survenue lors de la suppression.");
    }
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-[#423B71]">Vue d'ensemble des résultats</h2>
        <p class="text-sm text-gray-500 mt-1">Consultez les notes des apprenants pour les QCM et les évaluations de cette session.</p>
      </div>
      <button @click="loadResultsData" class="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-lg border border-gray-200 transition-colors flex items-center gap-2">
        <i :class="['fas fa-sync-alt', { 'fa-spin': isLoading }]"></i>
        Rafraîchir
      </button>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden">
      
      <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center">
        <i class="fas fa-circle-notch fa-spin text-3xl text-indigo-400 mb-3"></i>
        <p class="text-gray-500 font-medium">Chargement des notes...</p>
      </div>

      <div v-else-if="error" class="py-8 px-4 bg-red-50 text-red-600 rounded-lg text-center border border-red-100">
        <i class="fas fa-exclamation-triangle mr-2"></i> {{ error }}
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
            {{ filteredProgressions.length }} résultat(s) enregistré(s)
          </span>
        </div>

        <div class="w-full overflow-x-auto rounded-lg border border-gray-100">
          <table class="min-w-full table-auto">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Apprenant</th>
                <th class="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Évaluation</th>
                <th class="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Score Obtenu</th>
                <th class="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="prog in filteredProgressions" :key="prog._id" class="hover:bg-gray-50/80 transition-colors group">
                
                <td class="px-4 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold mr-3 text-xs shadow-sm flex-shrink-0">
                      {{ prog.initiales }}
                    </div>
                    <div class="text-sm font-semibold text-gray-900 truncate">
                      {{ prog.displayPrenom }} {{ prog.displayNom }}
                    </div>
                  </div>
                </td>

                <td class="px-4 py-4">
                  <div class="text-sm text-gray-700 font-medium">
                    {{ prog.contentLabel }}
                  </div>
                  <div class="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">
                    {{ prog.actualContentType === 'Quiz' ? 'QCM' : 'Devoir' }}
                  </div>
                </td>

                <td class="px-4 py-4 text-center">
                  <span 
                    :class="[
                      'inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold min-w-[70px]',
                      prog.isPassed ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    ]"
                  >
                    {{ prog.score }} / {{ prog.maxScore }}
                  </span>
                </td>

                <td class="px-4 py-4 text-right">
                  <button 
                    v-if="!prog.isPassed"
                    @click="deleteProgression(prog._id)" 
                    class="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Supprimer ce résultat (L'apprenant devra recommencer)"
                  >
                    <i class="fas fa-trash-alt"></i> Effacer
                  </button>
                  <span v-else class="text-xs font-bold text-gray-400 italic flex items-center justify-end">
                    <i class="fas fa-check-circle text-green-500 mr-1.5"></i> Validé
                  </span>
                </td>
              </tr>

              <tr v-if="filteredProgressions.length === 0">
                <td colspan="4" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-indigo-50 p-4 rounded-full mb-3">
                      <i class="fas fa-clipboard-check text-indigo-300 text-3xl"></i>
                    </div>
                    <p class="text-gray-600 font-bold text-lg">Aucun résultat</p>
                    <p class="text-gray-500 text-sm mt-1">Les apprenants n'ont pas encore complété de QCM ou de devoirs.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>