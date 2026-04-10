<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import FormationTestResults from '../views/FormationTestResults.vue';

import api from '/services/api';

const router = useRouter();
const store = useFormationBuilderStore();

const formationId = computed(() => store.formation._id);
const evaluations = computed(() => store.formation.evaluations || []);
const isSaving = ref<string | null>(null);

// ÉTATS DE NAVIGATION INLINE
const viewMode = ref<'cards' | 'results'>('cards');
const selectedType = ref<string>('');



const resultsCounts = ref<Record<string, number>>({});

const loadResultsCounts = async () => {
  for (const card of evaluationCards) {
    if (isEvalEnabled(card.id)) {
      try {
        // On utilise ta route existante dans userEvaluationRoutes.js
        const response = await api.get(`/api/user-evaluations/${formationId.value}/stats/${card.id}`);
        // La route renvoie un tableau de copies, on stocke la longueur !
        resultsCounts.value[card.id] = response.data.length;
      } catch (error) {
        console.error(`Erreur stats pour ${card.id}:`, error);
        resultsCounts.value[card.id] = 0;
      }
    }
  }
};

// NOUVEAU : On lance la requête quand la page s'affiche
onMounted(() => {
  if (formationId.value) {
    loadResultsCounts();
  }
});

// Remplacement des colorClass par des classes Tailwind complètes
const evaluationCards = [
  { 
    id: 'positioning', 
    title: 'Test de Positionnement', 
    desc: 'Évaluez les pré-requis et le niveau initial avant le début de la formation.', 
    icon: 'fas fa-clipboard-list', 
    colors: {
      border: 'border-indigo-300',
      ring: 'ring-indigo-50',
      bgIcon: 'bg-indigo-100',
      textIcon: 'text-indigo-600',
      bgBtn: 'bg-indigo-50',
      textBtn: 'text-indigo-700',
      hoverBgBtn: 'hover:bg-indigo-600',
      hoverTextBtn: 'hover:text-white'
    }
  },
  { 
    id: 'satisfaction_chaud', 
    title: 'Satisfaction à Chaud', 
    desc: 'Mesurez la satisfaction des apprenants immédiatement après la session.', 
    icon: 'fas fa-fire', 
    colors: {
      border: 'border-orange-300',
      ring: 'ring-orange-50',
      bgIcon: 'bg-orange-100',
      textIcon: 'text-orange-600',
      bgBtn: 'bg-orange-50',
      textBtn: 'text-orange-700',
      hoverBgBtn: 'hover:bg-orange-600',
      hoverTextBtn: 'hover:text-white'
    }
  },
  { 
    id: 'satisfaction_froid', 
    title: 'Satisfaction à Froid', 
    desc: 'Analysez l\'impact réel et la mise en pratique des acquis (J+90).', 
    icon: 'fas fa-icicles', 
    colors: {
      border: 'border-blue-300',
      ring: 'ring-blue-50',
      bgIcon: 'bg-blue-100',
      textIcon: 'text-blue-600',
      bgBtn: 'bg-blue-50',
      textBtn: 'text-blue-700',
      hoverBgBtn: 'hover:bg-blue-600',
      hoverTextBtn: 'hover:text-white'
    }
  }
];

const getQuestionCount = (type: string) => {
  const ev = evaluations.value.find(e => e.type === type);
  return ev?.questions?.length || 0;
};

const isEvalEnabled = (type: string) => {
  const ev = evaluations.value.find(e => e.type === type);
  return ev ? ev.isEnabled : false;
};

const toggleEvaluation = async (type: string) => {
  if (!store.formation.evaluations) store.formation.evaluations = [];
  const existingEval = store.formation.evaluations.find(e => e.type === type);
  
  if (existingEval) {
    existingEval.isEnabled = !existingEval.isEnabled;
  } else {
    store.formation.evaluations.push({
      type: type,
      isEnabled: true,
      title: type === 'positioning' ? 'Test de Positionnement' : 'Satisfaction',
      questions: [],
      settings: { isBlocking: false, minScoreToPass: 0 }
    });
  }

  isSaving.value = type;
  try {
    await store.saveFormation();
  } catch (error) {
    console.error("Erreur toggle:", error);
    if (existingEval) existingEval.isEnabled = !existingEval.isEnabled;
  } finally {
    isSaving.value = null;
  }
};

const configureTest = (type: string) => {
  router.push(`/evaluation-builder/${type}/${formationId.value}`);
};

const showResults = (type: string) => {
  selectedType.value = type;
  viewMode.value = 'results';
};
</script>

<template>
  <div class="w-full transition-all duration-500">
    
    <div v-if="viewMode === 'cards'" class="animate-in fade-in duration-500">
      
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        <div class="mb-8 border-b border-gray-100 pb-6">
          <h3 class="text-2xl font-bold text-[#423B71] flex items-center gap-3">
            Évaluations & Qualiopi
          </h3>
          <p class="text-gray-500 text-sm mt-2">
            Gérez la qualité et suivez la progression de vos apprenants en temps réel. Activez les modules dont vous avez besoin.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            v-for="card in evaluationCards" 
            :key="card.id"
            class="p-6 rounded-2xl border transition-all duration-300 flex flex-col"
            :class="isEvalEnabled(card.id) ? `${card.colors.border} ring-4 ${card.colors.ring} shadow-md` : 'border-gray-200 bg-gray-50/50'"
          >
            <div class="flex items-start justify-between mb-6">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-colors shadow-sm"
                   :class="isEvalEnabled(card.id) ? `${card.colors.bgIcon} ${card.colors.textIcon}` : 'bg-gray-200 text-gray-500'">
                <i :class="card.icon"></i>
              </div>

              <div class="flex flex-col items-end">
                <button 
                  @click="toggleEvaluation(card.id)"
                  :disabled="isSaving === card.id"
                  class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none"
                  :class="isEvalEnabled(card.id) ? 'bg-[#62D6CA]' : 'bg-gray-300'"
                >
                  <span 
                    class="inline-block h-5 w-5 transform rounded-full bg-white transition duration-300 shadow-sm"
                    :class="isEvalEnabled(card.id) ? 'translate-x-5' : 'translate-x-0'"
                  ></span>
                </button>
                <span class="text-[10px] font-bold uppercase tracking-wider mt-1" 
                      :class="isEvalEnabled(card.id) ? 'text-[#423B71]' : 'text-gray-400'">
                  {{ isEvalEnabled(card.id) ? 'Activé' : 'Désactivé' }}
                </span>
              </div>
            </div>

            <h4 class="font-bold text-lg text-[#423B71] mb-2">{{ card.title }}</h4>
            <div class="mb-4">
              <span class="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md uppercase tracking-wider border border-gray-200">
                {{ getQuestionCount(card.id) }} question(s)
              </span>
            </div>

            <p class="text-gray-500 text-sm mb-8 flex-1 leading-relaxed">{{ card.desc }}</p>
            
            <div class="space-y-3 mt-auto">
              <button 
                @click="configureTest(card.id)"
                class="w-full py-2.5 font-bold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                :class="isEvalEnabled(card.id) ? `${card.colors.bgBtn} ${card.colors.textBtn} ${card.colors.hoverBgBtn} ${card.colors.hoverTextBtn}` : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'"
              >
                <i class="fas fa-cog"></i> Configurer
              </button>
              
             <button 
  v-if="isEvalEnabled(card.id)"
  @click="showResults(card.id)"
  class="w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm"
>
  <i class="fas fa-chart-bar text-gray-500"></i> 
  Résultats
  
  <span 
    v-if="resultsCounts[card.id] > 0" 
    class="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black shadow-sm"
  >
    {{ resultsCounts[card.id] }}
  </span>
</button>

            </div>
          </div>
        </div>

      </div>
    </div>

    <div v-else class="w-full">
      <FormationTestResults 
        :formationId="formationId" 
        :type="selectedType" 
        @back="viewMode = 'cards'"
      />
    </div>

  </div>
</template>