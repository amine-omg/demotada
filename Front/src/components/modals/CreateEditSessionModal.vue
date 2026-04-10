<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useSessionStore } from '../../stores/sessionStore';
import { useUserStore } from '../../stores/user';

interface SessionUser {
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'formateur' | 'eleve';
  completion: number;
  dateInscription: string;
  enAttenteValidation?: boolean;
}

interface SessionFormData {
  _id?: string;
  formation: string;
  type: 'programme' | 'continue';
  title: string;
  description: string;
  dateDebut?: string;
  dateFin?: string;
  dateExamen?: string;
  lieu?: string;
  formateurs?: SessionUser[];
  elevesInscrits?: SessionUser[];
  isDefaultContinuous: boolean;
}

interface UserFormation {
    _id: string;
    title: string;
}


const props = defineProps<{
  showModal: boolean;
  sessionId: string | null; 
  formationId: string; 
  initialSessionType?: 'programme' | 'continue'; 
}>();

const emit = defineEmits(['close', 'save-session']);

const sessionStore = useSessionStore();
const userStore = useUserStore();


const userFormations = ref<UserFormation[]>([]);

const currentSession = ref<SessionFormData>({
  formation: null, 
  type: 'programme',
  title: '',
  description: '',
  dateDebut: undefined,
  dateFin: undefined,
  dateExamen: undefined,
  lieu: '',
  isDefaultContinuous: false,
});

const isEditMode = computed(() => props.sessionId !== null);
const modalTitle = computed(() => {
    if (isEditMode.value) {
        return `Modifier la session ${currentSession.value.title}`;
    }
    return 'Créer une session';
});


const errors = ref({
  title: false,
  dateDebut: false,
  dateFin: false,
  formation: false, 
  common: ''
});

const shouldShowFormationSelect = computed(() => {
    return !isEditMode.value && !props.formationId; 
});

watch(() => props.showModal, async (newVal) => {
  if (newVal) {
    resetForm();
    errors.value = { title: false, dateDebut: false, dateFin: false, formation: false, common: '' };

    if (shouldShowFormationSelect.value && userStore.user.id) {
      try {
        const fetchedFormations = await userStore.fetchUserFormations();
        if (fetchedFormations) {
            userFormations.value = fetchedFormations;
            if (fetchedFormations.length === 1) {
              currentSession.value.formation = fetchedFormations[0]._id;
            } else {
              currentSession.value.formation = null; 
            }
        } else {
            userFormations.value = [];
            errors.value.common = "Aucune formation trouvée pour cet utilisateur. Impossible de créer une session.";
        }
      } catch (error) {
        console.error("Erreur lors du chargement des formations de l'utilisateur dans le modal:", error);
        errors.value.common = "Erreur lors du chargement de vos formations.";
        userFormations.value = [];
      }
    }


    if (isEditMode.value) {
     loadSessionForEdit();
   } else {
     currentSession.value.type = 'programme';
     currentSession.value.formation = props.formationId || null;
   }
 }
});

const loadFormationsForModal = async () => {
    if (userStore.user.id) {
        try {
            const fetchedFormations = await userStore.fetchUserFormations();
            if (fetchedFormations) {
                userFormations.value = fetchedFormations;
                if (fetchedFormations.length === 1) {
                  currentSession.value.formation = fetchedFormations[0]._id;
                } else {
                  currentSession.value.formation = null;
                }
            } else {
                userFormations.value = [];
                errors.value.common = "Aucune formation trouvée pour cet utilisateur. Impossible de créer une session.";
            }
        } catch (error) {
            console.error("Erreur lors du chargement des formations de l'utilisateur dans le modal:", error);
            errors.value.common = "Erreur lors du chargement de vos formations.";
            userFormations.value = [];
        }
    }
};

const loadSessionForEdit = async () => {
  if (props.sessionId) {
    const sessionToEdit = sessionStore.sessions.find(s => s._id === props.sessionId) ||
                         (sessionStore.continuousSession && sessionStore.continuousSession._id === props.sessionId ? sessionStore.continuousSession : null);

    if (sessionToEdit) {
      currentSession.value = {
        _id: sessionToEdit._id,
        formation: typeof sessionToEdit.formation === 'string' ? sessionToEdit.formation : sessionToEdit.formation._id,
        type: sessionToEdit.type,
        title: sessionToEdit.title,
        description: sessionToEdit.description,
        dateDebut: sessionToEdit.dateDebut ? new Date(sessionToEdit.dateDebut).toISOString().slice(0, 10) : undefined,
        dateFin: sessionToEdit.dateFin ? new Date(sessionToEdit.dateFin).toISOString().slice(0, 10) : undefined,
        dateExamen: sessionToEdit.dateExamen ? new Date(sessionToEdit.dateExamen).toISOString().slice(0, 10) : undefined,
        lieu: sessionToEdit.lieu,
        isDefaultContinuous: sessionToEdit.isDefaultContinuous,
      };
      currentSession.value.type = 'programme';
    } else {
      errors.value.common = "Session non trouvée pour l'édition. Veuillez rafraîchir la page.";
      console.error("Session non trouvée dans le store pour l'édition:", props.sessionId);
    }
  }
};

const resetForm = () => {
  currentSession.value = {
    formation: null, 
    type: 'programme',
    title: '',
    description: '',
    dateDebut: undefined,
    dateFin: undefined,
    dateExamen: undefined,
    lieu: '',
    isDefaultContinuous: false,
  };
  errors.value = { title: false, dateDebut: false, dateFin: false, formation: false, common: '' }; 
};

const validateForm = () => {
  let isValid = true;
  errors.value = { title: false, dateDebut: false, dateFin: false, formation: false, common: '' };

  if (!currentSession.value.title.trim()) {
    errors.value.title = true;
    isValid = false;
  }

  if (shouldShowFormationSelect.value && (currentSession.value.formation === null || currentSession.value.formation === undefined || currentSession.value.formation === '')) {
      errors.value.formation = true;
      isValid = false;
  }


  if (currentSession.value.type === 'programme') {
    if (!currentSession.value.dateDebut) {
      errors.value.dateDebut = true;
      isValid = false;
    }
    if (!currentSession.value.dateFin) {
      errors.value.dateFin = true;
      isValid = false;
    }
    if (currentSession.value.dateDebut && currentSession.value.dateFin &&
        new Date(currentSession.value.dateDebut) >= new Date(currentSession.value.dateFin)) {
      errors.value.dateFin = true;
      errors.value.common = "La date de fin doit être postérieure à la date de début.";
      isValid = false;
    }
  }

  return isValid;
};

const handleSubmit = () => {
  emit('save-session', currentSession.value);
};

const closeModal = () => {
  emit('close');
};
</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300" @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-8 transform transition-all duration-300" @click.stop>
      <h3 class="text-3xl font-bold text-[#423B71] mb-2 text-center">{{ modalTitle }}</h3>
      <p class="text-center text-gray-700 mb-8">Définissez les détails de votre session programmée.</p>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="errors.common" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ errors.common }}</span>
        </div>

        <div v-if="shouldShowFormationSelect">
          <label for="formation-select" class="label">Sélectionner la formation</label>
          <select id="formation-select" v-model="currentSession.formation" class="input-field p-3" :class="{'border-red-500 ring-red-500': errors.formation}">
            <option :value="null" disabled>Choisissez une formation</option>
            <option v-for="formation in userFormations" :key="formation._id" :value="formation._id">
              {{ formation.title }}
            </option>
          </select>
          <p v-if="errors.formation" class="text-red-600 text-xs mt-1">Veuillez sélectionner une formation.</p>
          <p v-if="userFormations.length === 0 && !userStore.isLoading" class="text-gray-500 text-sm mt-1">
              Vous n'avez pas de formations à gérer pour créer une session.
          </p>
        </div>

        <div>
          <label for="session-title" class="label">Titre de la session</label>
          <input type="text" id="session-title" class="input-field p-3" v-model="currentSession.title" placeholder="Ex: Session Hiver 2025" :class="{'border-red-500 ring-red-500': errors.title}">
          <p v-if="errors.title" class="text-red-600 text-xs mt-1">Le titre est requis.</p>
        </div>

        <div>
          <label for="session-description" class="label">Description (optionnel)</label>
          <textarea id="session-description" rows="3" class="input-field p-3" v-model="currentSession.description" placeholder="Courte description de cette session..."></textarea>
        </div>

        <div class="space-y-4">
          <div>
            <label for="date-debut" class="label">Date de début</label>
            <input type="date" id="date-debut" v-model="currentSession.dateDebut" class="input-field p-3" :class="{'border-red-500 ring-red-500': errors.dateDebut}">
            <p v-if="errors.dateDebut" class="text-red-600 text-xs mt-1">La date de début est requise et doit être antérieure à la date de fin.</p>
          </div>
          <div>
            <label for="date-fin" class="label">Date de fin</label>
            <input type="date" id="date-fin" v-model="currentSession.dateFin" class="input-field p-3" :class="{'border-red-500 ring-red-500': errors.dateFin}">
            <p v-if="errors.dateFin" class="text-red-600 text-xs mt-1">La date de fin est requise et doit être postérieure à la date de début.</p>
          </div>
          <div>
            <label for="date-examen" class="label">Date de l'examen (optionnel)</label>
            <input type="date" id="date-examen" v-model="currentSession.dateExamen" class="input-field p-3">
          </div>
        </div>

        <div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-4 pt-4">
          <button type="button" @click="closeModal" class="w-full sm:w-auto mt-2 sm:mt-0 px-8 py-3 text-base font-bold text-[#423B72] bg-transparent rounded-lg hover:bg-gray-100/50 transition-all">Annuler</button>
          <button type="submit" class="w-full sm:w-auto px-8 py-3 text-base font-bold rounded-lg shadow-lg transition-all bg-[#B2E9E1] text-[#443E73] hover:bg-[#FF8B7D]">
            {{ isEditMode ? 'Modifier la session' : 'Créer la session' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent; }
.form-radio, .form-checkbox { @apply border-gray-300; }
</style>
