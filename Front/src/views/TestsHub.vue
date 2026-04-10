<template>
  <div class="min-h-screen bg-gray-50/50">
    <TheHeader 
      pageTitle="Hub des Évaluations" 
      :showBackButton="true" 
      backButtonRoute="/documents" 
    />
    
    <main class="p-6 md:p-8">
      
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[#423B71]">
          Hub des Évaluations
          <span v-if="etablissementName" class="text-gray-500">- {{ etablissementName }}</span>
        </h1>
        <p class="text-gray-600 mt-1">Gérez les modèles de vos évaluations et accédez aux résultats de votre établissement.</p>
      </div>

      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-10 animate-in fade-in duration-500">
        
        <div class="mb-10 border-b border-gray-100 pb-6 flex items-center gap-4">
          <div class="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner text-xl">
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <h3 class="text-2xl font-black text-[#423B71] tracking-tight">Référentiel Qualiopi</h3>
            <p class="text-gray-500 text-sm mt-1 font-medium">Banques de questions et résultats par type de test.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="card in evaluationCards" 
            :key="card.id"
            class="p-8 rounded-[2rem] border transition-all duration-300 flex flex-col relative group overflow-hidden bg-white shadow-sm hover:shadow-md"
            :class="`${card.colors.border} hover:ring-4 ${card.colors.ring}`"
          >
            <div class="flex items-start justify-between mb-8 relative z-10">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors"
                   :class="`${card.colors.bgIcon} ${card.colors.textIcon}`">
                <i :class="card.icon"></i>
              </div>

              <div class="flex flex-col items-end">
                 <span class="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm">
                  Modèles
                </span>
              </div>
            </div>

            <h4 class="font-black text-xl text-[#423B71] mb-3 tracking-tight relative z-10">{{ card.title }}</h4>
            
            <p class="text-gray-500 text-sm mb-10 flex-1 leading-relaxed font-medium relative z-10">{{ card.desc }}</p>
            
            <div class="space-y-3 mt-auto relative z-10">
              <router-link 
                :to="card.route"
                class="w-full py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
                :class="`${card.colors.bgBtn} ${card.colors.textBtn} ${card.colors.hoverBgBtn} ${card.colors.hoverTextBtn}`"
              >
                <i class="fas fa-folder-open text-sm"></i> Ouvrir le répertoire
              </router-link>
            </div>

            <div :class="`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none ${card.colors.bgIcon}`"></div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useUserStore } from '../stores/user';
import TheHeader from '../components/TheHeader.vue';

const userStore = useUserStore();

// Reprise exacte de la logique d'établissement de DocumentsPage
const etablissementName = computed(() => {
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext.nom;
  }
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity.nom;
  }
  return '';
});

// Dans TestsHub.vue

const evaluationCards = [
  { 
    id: 'positioning', 
    title: 'Test de Positionnement', 
    desc: 'Banque de questions pour évaluer les pré-requis et le niveau initial avant formation.', 
    icon: 'fas fa-graduation-cap', 
    route: '/suivi-evaluations/positioning', // <-- NOUVEAU LIEN ICI
    colors: {
      border: 'border-indigo-200', ring: 'ring-indigo-50', bgIcon: 'bg-indigo-50', textIcon: 'text-indigo-600',
      bgBtn: 'bg-indigo-50', textBtn: 'text-indigo-700', hoverBgBtn: 'hover:bg-indigo-600', hoverTextBtn: 'hover:text-white'
    }
  },
  { 
    id: 'satisfaction_chaud', 
    title: 'Satisfaction à Chaud', 
    desc: 'Modèles de questionnaires pour mesurer la satisfaction immédiate des apprenants.', 
    icon: 'fas fa-fire-alt', 
    route: '/suivi-evaluations/satisfaction_chaud', // <-- NOUVEAU LIEN ICI
    colors: {
      border: 'border-orange-200', ring: 'ring-orange-50', bgIcon: 'bg-orange-50', textIcon: 'text-orange-600',
      bgBtn: 'bg-orange-50', textBtn: 'text-orange-700', hoverBgBtn: 'hover:bg-orange-600', hoverTextBtn: 'hover:text-white'
    }
  },
  { 
    id: 'satisfaction_froid', 
    title: 'Satisfaction à Froid', 
    desc: 'Outils d\'analyse pour vérifier l\'impact réel et la mise en pratique (J+90).', 
    icon: 'fas fa-snowflake', 
    route: '/suivi-evaluations/satisfaction_froid', // <-- NOUVEAU LIEN ICI
    colors: {
      border: 'border-blue-200', ring: 'ring-blue-50', bgIcon: 'bg-blue-50', textIcon: 'text-blue-600',
      bgBtn: 'bg-blue-50', textBtn: 'text-blue-700', hoverBgBtn: 'hover:bg-blue-600', hoverTextBtn: 'hover:text-white'
    }
  }
];
</script>