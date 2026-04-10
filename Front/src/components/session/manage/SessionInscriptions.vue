<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';
import type { Session } from '../../../stores/sessionStore';
import { useSessionStore } from '../../../stores/sessionStore';
import { useProgressionStore } from '../../../stores/progressionStore';
import { useFormationsStore } from '../../../stores/formations';
import { useCrmStore } from '../../../stores/crm';
import { useUserStore } from '../../../stores/user';

// Composants Enfants
import SessionInscriptionsLeft from './SessionInscriptionsLeft.vue';
import SessionInscriptionsRight from './SessionInscriptionsRight.vue';

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true
  }
});

const sessionStore = useSessionStore();
const progressionStore = useProgressionStore();
const formationStore = useFormationsStore();
const crmStore = useCrmStore();
const userStore = useUserStore();

// --- ETAT LOCAL ---
const showAddEleveModal = ref(false);
const eleveEmailToAdd = ref('');
const addEleveError = ref('');
const isAddingFromCrm = ref<string | null>(null);

const progressions = computed(() => progressionStore.progressions);
const formation = computed(() => formationStore.currentFormation);

// --- CHARGEMENT DES DONNÉES ---
onMounted(async () => {
  if (props.session._id) {
    await progressionStore.fetchProgressionForSession(props.session._id);
    
    const formationId = typeof props.session.formation === 'object' 
      ? (props.session.formation as any)._id 
      : props.session.formation;
      
    if (formationId) {
      await formationStore.fetchFormationById(formationId);
    }

    const ecoleId = userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
    if (ecoleId) {
      await crmStore.fetchOpportunites(null, ecoleId);
    }
  }
});

// --- MOTEUR DE CALCUL DE PROGRESSION ---
const getStudentProgressDetailed = (userId: string) => {
  if (!formation.value || !formation.value.modules) return { total: 0, completed: 0, percent: 0, modules: [] };

  let totalOverall = 0;
  let completedOverall = 0;
  const modulesProgress = [];

  const userProgs = progressions.value.filter(p => {
    const pUserId = String(p.user?._id || p.user || p.userId);
    return pUserId === String(userId) && ['termine', 'valide'].includes(p.status);
  });
  
  const completedContentIds = new Set(userProgs.map(p => String(p.contentId)));

  for (const mod of formation.value.modules) {
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

    if (modTotalActivities === 0) continue; 

    totalOverall += modTotalActivities;
    completedOverall += modCompletedActivities;

    modulesProgress.push({
      id: mod._id,
      name: mod.name || mod.title,
      total: modTotalActivities,
      completed: modCompletedActivities,
      percent: Math.round((modCompletedActivities / modTotalActivities) * 100),
      weight: modTotalActivities 
    });
  }

  const percentOverall = totalOverall > 0 ? Math.round((completedOverall / totalOverall) * 100) : 0;

  return {
    total: totalOverall,
    completed: completedOverall,
    percent: percentOverall > 100 ? 100 : percentOverall,
    modules: modulesProgress
  };
};

// --- LISTES ET TRI ---
const elevesAvecProgression = computed(() => {
  const list = [...(props.session.elevesInscrits || [])];
  
  const enrichedList = list.map(eleve => ({
    ...eleve,
    progress: getStudentProgressDetailed(eleve.userId)
  }));

  return enrichedList.sort((a, b) => {
    const pA = a.progress.percent;
    const pB = b.progress.percent;
    if (pB !== pA) return pB - pA;
    return (a.prenom || '').localeCompare(b.prenom || ''); 
  });
});

// --- LOGIQUE DOCUMENTS CRM ---
const getDocState = (op: any, docType: string) => {
  const activities = op.activites || [];
  const docActivity = activities.slice().reverse().find((a: any) => a.type === docType);
  
  if (!docActivity) return 'none'; 
  if (docActivity.status === 'signed' || docActivity.status === 'valide' || docActivity.status === 'received') return 'done'; 
  return 'pending'; 
};

// CROSS MATCHING CRM <=> LMS
const prospectsEnAttente = computed(() => {
  if (!crmStore.opportunites) return [];

  const inscritsIds = props.session.elevesInscrits?.map((e: any) => String(e.userId)) || [];
  const enAttente: any[] = [];

  const oppsLiees = crmStore.opportunites.filter((op: any) => {
    const oppSessionId = typeof op.session === 'object' ? op.session?._id : op.session;
    return oppSessionId === props.session._id;
  });

  for (const op of oppsLiees) {
    const people = [...(op.apprenants || []), ...(op.prospects || [])];
    for (const person of people) {
      if (person._id && !inscritsIds.includes(String(person._id))) {
        if (!enAttente.some(p => p._id === person._id)) {
          enAttente.push({
            ...person,
            emailToDisplay: person.email || '', // Récupère le champ exact du schéma Mongoose
            opportuniteName: op.nomOpportunite,
            opportuniteStage: op.currentStage,
            opportuniteId: op._id, // Indispensable pour la redirection !
            devisState: getDocState(op, 'Devis'),
            conventionState: getDocState(op, 'Convention'),
            programmeState: getDocState(op, 'Programme')
          });
        }
      }
    }
  }

  return enAttente;
});

// --- ACTIONS ---
const handleAddEleve = async () => {
  addEleveError.value = '';
  if (!eleveEmailToAdd.value.trim()) { 
    addEleveError.value = "L'email est requis."; 
    return; 
  }
  try {
    await sessionStore.addEleveToSessionByEmail(props.session._id, eleveEmailToAdd.value);
    showAddEleveModal.value = false;
    eleveEmailToAdd.value = '';
  } catch (err: any) {
    addEleveError.value = err.message || 'Erreur lors de l\'ajout de l\'apprenant.';
  }
};

const handleAddFromCrm = async (person: any) => {
  const email = person.emailToDisplay;
  if (!email) {
    alert("Cet utilisateur CRM n'a pas d'adresse e-mail définie.");
    return;
  }
  isAddingFromCrm.value = person._id;
  try {
    await sessionStore.addEleveToSessionByEmail(props.session._id, email);
  } catch (err: any) {
    alert(`Erreur lors de l'ajout: ${err.message}`);
  } finally {
    isAddingFromCrm.value = null;
  }
};

const handleRemoveEleve = async (eleveId: string) => {
  if (confirm("Êtes-vous sûr de vouloir retirer cet apprenant de la session ?")) {
    try {
      await sessionStore.removeEleveFromSession(props.session._id, eleveId);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  }
};

const handleToggleMute = async (eleve: any) => {
  const action = eleve.isMuted ? "réactiver" : "restreindre";
  if (confirm(`Voulez-vous vraiment ${action} les publications de cet apprenant ?`)) {
    try {
      await sessionStore.toggleEleveMuteStatus(props.session._id, eleve.userId);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  }
};
</script>

<template>
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
    
    <SessionInscriptionsLeft 
      :eleves="elevesAvecProgression"
      @open-add-modal="showAddEleveModal = true"
      @toggle-mute="handleToggleMute"
      @remove-eleve="handleRemoveEleve"
    />

    <SessionInscriptionsRight 
      :prospects="prospectsEnAttente"
      :is-loading-crm="crmStore.isLoading"
      :is-adding-id="isAddingFromCrm"
      @add-from-crm="handleAddFromCrm"
    />

    <div v-if="showAddEleveModal" class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white p-5 md:p-6 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-user-plus text-indigo-500"></i> Ajouter un apprenant
        </h3>
        
        <div class="mb-5">
          <label for="eleveEmail" class="block text-sm font-bold text-gray-700 mb-1.5">Email de l'apprenant</label>
          <input
            type="email"
            id="eleveEmail"
            v-model="eleveEmailToAdd"
            class="block w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-sm"
            placeholder="prenom.nom@exemple.com"
          />
        </div>

        <div v-if="addEleveError" class="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-2">
          <i class="fas fa-exclamation-circle mt-0.5 flex-shrink-0"></i>
          <span>{{ addEleveError }}</span>
        </div>
        
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="showAddEleveModal = false; eleveEmailToAdd = ''; addEleveError = ''"
            class="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Annuler
          </button>
          <button
            @click="handleAddEleve"
            :disabled="sessionStore.isLoading"
            class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
          >
            <i v-if="sessionStore.isLoading" class="fas fa-spinner fa-spin"></i>
            {{ sessionStore.isLoading ? 'Ajout...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>