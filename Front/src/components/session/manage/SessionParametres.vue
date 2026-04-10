<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import type { Session } from '../../../stores/sessionStore';
import { useSessionStore } from '../../../stores/sessionStore';

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true
  }
});

const sessionStore = useSessionStore();

// --- ÉTAT POUR LES PARAMÈTRES GÉNÉRAUX ---
const editableSession = ref({
  title: props.session.title,
  description: props.session.description,
  dateDebut: props.session.dateDebut ? new Date(props.session.dateDebut).toISOString().split('T')[0] : '',
  dateFin: props.session.dateFin ? new Date(props.session.dateFin).toISOString().split('T')[0] : ''
});

const isSaving = ref(false);
const saveSuccess = ref(false);

watch(() => props.session, (newSession) => {
  editableSession.value.title = newSession.title;
  editableSession.value.description = newSession.description;
  editableSession.value.dateDebut = newSession.dateDebut ? new Date(newSession.dateDebut).toISOString().split('T')[0] : '';
  editableSession.value.dateFin = newSession.dateFin ? new Date(newSession.dateFin).toISOString().split('T')[0] : '';
}, { deep: true });

const handleUpdateGeneral = async () => {
  isSaving.value = true;
  saveSuccess.value = false;
  try {
    const updated = await sessionStore.updateSession(
      props.session._id, 
      {
        title: editableSession.value.title,
        description: editableSession.value.description,
        dateDebut: editableSession.value.dateDebut,
        dateFin: editableSession.value.dateFin
      },
      'none' // On met 'none' pour éviter le double appel API inutile
    );

   if (updated) {
      editableSession.value.title = updated.title;
      editableSession.value.description = updated.description;
      editableSession.value.dateDebut = updated.dateDebut ? new Date(updated.dateDebut).toISOString().split('T')[0] : '';
      editableSession.value.dateFin = updated.dateFin ? new Date(updated.dateFin).toISOString().split('T')[0] : '';
    }

    saveSuccess.value = true;
    setTimeout(() => (saveSuccess.value = false), 3000);
  } catch (error: any) {
    alert("Erreur");
  } finally {
    isSaving.value = false;
  }
};

// --- ÉTAT POUR LES INTERVENANTS (LOGIQUE EXISTANTE) ---
const showAddIntervenantModal = ref(false);
const intervenantEmail = ref('');
const errorMessage = ref('');
const isAddingIntervenant = ref(false);

const handleAddIntervenant = async () => {
  if (!intervenantEmail.value) {
    errorMessage.value = "L'email ne peut pas être vide.";
    return;
  }
  isAddingIntervenant.value = true;
  errorMessage.value = '';
  try {
    await sessionStore.addIntervenantByEmail(props.session._id, intervenantEmail.value);
    intervenantEmail.value = '';
    showAddIntervenantModal.value = false;
  } catch (error: any) {
    errorMessage.value = error.message || "Une erreur est survenue.";
  } finally {
    isAddingIntervenant.value = false;
  }
};

const handleRemoveIntervenant = async (userId: string) => {
  if (confirm("Êtes-vous sûr de vouloir retirer cet intervenant ?")) {
    try {
      await sessionStore.removeIntervenant(props.session._id, userId);
    } catch (error: any) {
      alert(error.message || "Erreur lors de la suppression.");
    }
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Paramètres généraux</h2>
        
        <form @submit.prevent="handleUpdateGeneral" class="space-y-4">
          <div>
            <label for="session-title" class="block text-sm font-medium text-gray-700">Titre de la session</label>
            <input 
              id="session-title"
              v-model="editableSession.title"
              type="text" 
              class="input-field"
              placeholder="Ex: Promotion Octobre 2025"
              required
            />
          </div>

          <div>
              <label class="block text-sm font-medium text-gray-700">Date de début</label>
              <input v-model="editableSession.dateDebut" type="date" class="input-field" />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Date de fin</label>
              <input v-model="editableSession.dateFin" type="date" class="input-field" />
            </div>

          <div>
            <label for="session-desc" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea 
              id="session-desc"
              v-model="editableSession.description"
              rows="4"
              class="input-field"
              placeholder="Informations complémentaires sur la session..."
            ></textarea>
          </div>

          <div class="flex items-center gap-4 pt-2">
            <button 
              type="submit" 
              class="btn-primary" 
              :disabled="isSaving"
            >
              <i v-if="isSaving" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
            
            <transition name="fade">
              <span v-if="saveSuccess" class="text-green-600 text-sm font-medium flex items-center gap-1">
                <i class="fas fa-check-circle"></i> Modifications enregistrées
              </span>
            </transition>
          </div>
        </form>
      </div>

      <div class="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">Intervenants</h2>
          <button @click="showAddIntervenantModal = true" class="btn-primary-small">
            <i class="fas fa-plus mr-1"></i> Ajouter
          </button>
        </div>
        
        <div v-if="session.formateurs && session.formateurs.length > 0" class="space-y-3">
          <div 
            v-for="formateur in session.formateurs" 
            :key="formateur.userId" 
            class="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
          >
            <div>
              <p class="font-semibold text-gray-800">{{ formateur.prenom }} {{ formateur.nom }}</p>
              <p class="text-sm text-gray-500">{{ formateur.email }}</p>
            </div>
            <button @click="handleRemoveIntervenant(formateur.userId)" class="text-gray-400 hover:text-red-600 transition-colors">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-8 text-gray-400">
          <i class="fas fa-user-tie text-3xl mb-2"></i>
          <p>Aucun intervenant assigné</p>
        </div>
      </div>
    </div>

    <div v-if="showAddIntervenantModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-bold mb-4 text-gray-800">Ajouter un intervenant</h3>
        <form @submit.prevent="handleAddIntervenant">
          <label for="intervenant-email" class="block text-sm font-medium text-gray-700">Email du formateur</label>
          <input 
            v-model="intervenantEmail"
            id="intervenant-email"
            type="email" 
            placeholder="intervenant@exemple.com"
            class="input-field mt-1"
            required
          />
          <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>

          <div class="mt-6 flex justify-end gap-3">
            <button type="button" @click="showAddIntervenantModal = false" class="btn-secondary">
              Annuler
            </button>
            <button type="submit" class="btn-primary" :disabled="isAddingIntervenant">
              {{ isAddingIntervenant ? 'Ajout...' : 'Ajouter' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B2E9E1] focus:border-transparent transition-all;
}
.btn-primary { 
  @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-6 rounded-lg hover:bg-[#9ddbd1] transition-colors disabled:opacity-50 flex items-center; 
}
.btn-primary-small { 
  @apply bg-[#B2E9E1] text-sm text-[#443E73] font-bold py-1.5 px-3 rounded-md hover:bg-[#9ddbd1] transition-colors; 
}
.btn-secondary { 
  @apply bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors; 
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>