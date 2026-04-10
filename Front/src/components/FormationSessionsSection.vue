<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { useFormationBuilderStore } from '../stores/formationBuilder';

const props = defineProps<{
  formatDate: (dateStr: string) => string; 
}>();

const emit = defineEmits([
  'toggle-continuous-enrollment',
  'open-create-programmed-session-modal',
  'edit-session',
  'delete-session',
  'open-session-detail',
  'open-add-eleve-modal',
]);

const sessionStore = useSessionStore();
const formationBuilderStore = useFormationBuilderStore();

const programmedSessions = computed(() => sessionStore.sessions);
const isContinuousEnrollmentEnabled = computed(() => formationBuilderStore.formation.isContinuousEnrollmentEnabled);
const continuousEnrollmentDetails = computed(() => formationBuilderStore.formation.continuousEnrollmentDetails);

const handleContinuousToggle = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  emit('toggle-continuous-enrollment', isChecked);
};

const openCreateProgrammedSessionModal = () => {
  emit('open-create-programmed-session-modal');
};

const formatDateOnly = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch {
        return dateStr; 
    }
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border p-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">
        Gestion des sessions
      </h2>
      <p class="text-gray-600">
        Créez et gérez les différentes sessions pour cette formation.
      </p>
    </div>

    <div class="mb-8 p-4 border rounded-md bg-gray-50">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-medium text-gray-900">Session Continue (MOOC)</h3>
        <label class="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            :checked="isContinuousEnrollmentEnabled"
            @change="handleContinuousToggle"
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#B2E9E0] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B2E9E0]"></div>
          <span class="ml-3 text-sm font-medium text-gray-900">
            {{ isContinuousEnrollmentEnabled ? 'Activée' : 'Désactivée' }}
          </span>
        </label>
      </div>
      <p class="text-sm text-gray-600">
        Permet aux élèves de s'inscrire à tout moment et de suivre la formation à leur propre rythme.
      </p>
      <div v-if="isContinuousEnrollmentEnabled" class="mt-4 p-3 bg-white rounded-md border border-gray-200">
        <p class="font-semibold text-gray-800">{{ continuousEnrollmentDetails.title }}</p>
        <p class="text-sm text-gray-700">{{ continuousEnrollmentDetails.description }}</p>
      </div>
    </div>

    <div class="mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">Sessions Programmées</h3>
        <button
          @click="openCreateProgrammedSessionModal"
          class="btn-primary"
        >
          <i class="fas fa-plus mr-2"></i> Ajouter une session
        </button>
      </div>

      <div v-if="sessionStore.isLoading" class="text-center py-4 text-gray-500">Chargement des sessions...</div>
      <div v-else-if="programmedSessions.length === 0" class="text-center py-8 text-gray-500">
        <p class="mb-2 text-lg">Aucune session programmée pour le moment.</p>
        <p>Cliquez sur "Ajouter une session" pour en créer une.</p>
      </div>
      <div v-else class="space-y-4">
        <div
          v-for="session in programmedSessions"
          :key="session._id"
          class="bg-gray-50 p-4 rounded-md border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
        >
          <div class="flex-1">
            <h4 class="font-semibold text-gray-800 text-lg">{{ session.title }}</h4>
            <p class="text-sm text-gray-600">{{ session.description }}</p>
            <div class="text-xs text-gray-500 mt-1">
              <span v-if="session.dateDebut">Du {{ formatDateOnly(session.dateDebut) }}</span>
              <span v-if="session.dateFin"> au {{ formatDateOnly(session.dateFin) }}</span>
              <span v-if="session.lieu"> - Lieu: {{ session.lieu }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-1">
                <span v-if="session.elevesInscrits">
                    {{ session.elevesInscrits.length }} élève{{ session.elevesInscrits.length > 1 ? 's' : '' }} inscrit{{ session.elevesInscrits.length > 1 ? 's' : '' }}
                </span>
            </div>
          </div>
          <div class="flex space-x-2 mt-3 sm:mt-0">
            <button @click="emit('open-session-detail', session._id)" class="btn-icon text-blue-600 hover:text-blue-800">
              <i class="fas fa-eye"></i>
            </button>
            <button @click="emit('edit-session', session._id)" class="btn-icon text-purple-600 hover:text-purple-800">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="emit('delete-session', session._id)" class="btn-icon text-red-600 hover:text-red-800">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-primary { @apply bg-[#B0E9DF] text-black font-medium px-4 py-2 rounded-md hover:bg-[#FF8B7D] transition-colors duration-200; }
.btn-icon { @apply p-2 rounded-full hover:bg-gray-200 transition-colors duration-200; }
</style>
