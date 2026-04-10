<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useFormationsStore } from '../../stores/formations';
import { useSessionStore } from '../../stores/sessionStore';
import { useCrmStore } from '../../stores/crm';

const props = defineProps<{
  showModal: boolean;
}>();

const emit = defineEmits(['close', 'save']);

const formationsStore = useFormationsStore();
const sessionStore = useSessionStore();
const crmStore = useCrmStore();

const nomOpportunite = ref('');
const typeBusiness = ref('OpportunitéParticulier'); 
const selectedFormationId = ref<string | null>(null);
const selectedSessionId = ref<string | null>(null);

onMounted(() => {
  formationsStore.fetchFormations();
});

watch(selectedFormationId, (newFormationId) => {
  selectedSessionId.value = null; 
  if (newFormationId) {
    sessionStore.fetchSessionsForFormation(newFormationId);
  } else {
    sessionStore.sessions = []; 
  }
});

const handleSave = () => {
  if (!nomOpportunite.value.trim()) {
    alert("Le nom de l'opportunité est requis.");
    return;
  }

  const opportuniteData = {
    nomOpportunite: nomOpportunite.value,
    typeBusiness: typeBusiness.value,
    ...(selectedFormationId.value && { formation: selectedFormationId.value }),
    ...(selectedSessionId.value && { session: selectedSessionId.value }),
  };

  emit('save', opportuniteData);
};

watch(() => props.showModal, (isVisible) => {
  if (!isVisible) {
    nomOpportunite.value = '';
    typeBusiness.value = 'OpportunitéParticulier';
    selectedFormationId.value = null;
    selectedSessionId.value = null;
  }
});

</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4">
    <div class="bg-[#DCD8F4] rounded-xl shadow-2xl p-8 w-full max-w-lg" @click.stop>
      <h2 class="text-3xl font-bold text-[#423B71] mt-2 mb-2 text-center">Créer une nouvelle opportunité</h2>
      <p class="text-center text-gray-700 mb-8">Renseignez les informations de base. Vous pourrez les compléter plus tard.</p>

      <form @submit.prevent="handleSave" class="space-y-6">
        <div>
          <label for="opp-name" class="label">Nom de l'opportunité</label>
          <input 
            type="text" 
            id="opp-name" 
            v-model="nomOpportunite"
            class="input-field p-3"
            placeholder="Ex: John Doe - Formation React"
            required
          />
        </div>

        <div>
          <label class="label">Type de client</label>
          <div class="grid grid-cols-2 gap-4">
            <label :class="['radio-card', { 'radio-card-active': typeBusiness === 'OpportunitéParticulier' }]">
              <input type="radio" v-model="typeBusiness" value="OpportunitéParticulier" class="sr-only">
              Particulier
            </label>
            <label :class="['radio-card', { 'radio-card-active': typeBusiness === 'OpportunitéEntreprise' }]">
              <input type="radio" v-model="typeBusiness" value="OpportunitéEntreprise" class="sr-only">
              Entreprise
            </label>
          </div>
        </div>

        <div>
          <label for="formation" class="label">Formation (Optionnel)</label>
          <select id="formation" v-model="selectedFormationId" class="input-field p-3">
            <option :value="null">Aucune formation</option>
            <option v-for="formation in formationsStore.formations" :key="formation._id" :value="formation._id">
              {{ formation.title }}
            </option>
          </select>
        </div>

        <div v-if="selectedFormationId">
          <label for="session" class="label">Session (Optionnel)</label>
          <select id="session" v-model="selectedSessionId" class="input-field p-3">
            <option :value="null">Aucune session</option>
            <option v-for="session in sessionStore.sessions" :key="session._id" :value="session._id">
              {{ session.nom }}
            </option>
          </select>
        </div>

        <div class="mt-8 flex justify-end gap-4 pt-4">
          <button type="button" @click="$emit('close')" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">
            Créer l'opportunité
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.label {
  @apply block text-sm font-medium text-gray-800 mb-2;
}
.input-field {
  @apply w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent;
}
.radio-card {
  @apply block p-4 text-center border-2 border-gray-300 rounded-lg cursor-pointer transition-all;
}
.radio-card-active {
  @apply border-[#FE8B7D] ring-2 ring-[#FE8B7D] text-[#443E73] font-bold bg-white;
}
.btn-primary {
  @apply bg-[#B2E9E1] text-[#443E73] font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300;
}
.btn-secondary {
  @apply bg-white/70 text-gray-700 font-bold py-3 px-6 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-300;
}
</style>