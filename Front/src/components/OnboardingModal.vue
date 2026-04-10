<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

const emit = defineEmits(['onboarding-complete']);
const router = useRouter();
const userStore = useUserStore();

const isVisible = computed(() => !userStore.user.isOnboarded);
const currentStep = ref(1);
const selectedRole = ref<string | null>(null);

const form = ref({
  isHandicap: false, 
  situationProfessionnelle: '',
  experience: 0,
});

const errorMessage = ref<string | null>(null);
const isSubmitting = ref(false);

// Nouveaux rôles pour Karnain
const rolesKarnain = [
  { name: 'apprenant', label: 'Apprenant', description: 'Je souhaite apprendre et suivre des formations.' },
  { name: 'formateur', label: 'Formateur', description: 'Je souhaite créer du contenu et accompagner des élèves.' }
];

const selectRole = (role: string) => {
  selectedRole.value = role;
  currentStep.value = 2;
};

const handleFinalSubmit = async () => {
  if (!selectedRole.value) return;
  
  isSubmitting.value = ref(true);
  errorMessage.value = null;

  try {
    // On envoie les données au store qui appelle l'API
    await userStore.submitOnboarding(selectedRole.value, form.value);
    emit('onboarding-complete');
    
    // Redirection vers le dashboard selon le rôle
    if (selectedRole.value === 'admin') {
      router.push('/admin/dashboard');
    } else {
      router.push('/formations');
    }
  } catch (error: any) {
    errorMessage.value = error.response?.data?.message || "Une erreur est survenue lors de la configuration de votre profil.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#443E73]/60 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      
      <div class="p-8 border-b border-gray-100">
        <h2 class="text-2xl font-black text-[#443E73]">Bienvenue sur Karnain</h2>
        <p class="text-gray-500 font-medium">Configurons votre espace en quelques secondes.</p>
      </div>

      <div class="p-8">
        <div v-if="currentStep === 1">
          <p class="text-lg font-bold text-gray-700 mb-6">Quel est votre profil ?</p>
          <div class="grid grid-cols-1 gap-4">
            <button 
              v-for="role in rolesKarnain" 
              :key="role.name"
              @click="selectRole(role.name)"
              class="flex flex-col p-4 text-left border-2 border-gray-100 rounded-xl hover:border-[#B2E9E1] hover:bg-[#B2E9E1]/5 transition-all group"
            >
              <span class="text-lg font-black text-[#443E73] group-hover:text-[#FF8B7D]">{{ role.label }}</span>
              <span class="text-sm text-gray-500">{{ role.description }}</span>
            </button>
          </div>
        </div>

        <form v-if="currentStep === 2" @submit.prevent="handleFinalSubmit" class="space-y-6">
          <div v-if="selectedRole !== 'admin'" class="space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Situation professionnelle</label>
              <select v-model="form.situationProfessionnelle" class="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B2E9E1] outline-none">
                <option value="">Sélectionnez...</option>
                <option value="etudiant">Étudiant</option>
                <option value="salarie">Salarié</option>
                <option value="recherche_emploi">En recherche d'emploi</option>
                <option value="independant">Indépendant</option>
              </select>
            </div>

            <div class="flex items-center p-4 bg-gray-50 rounded-lg">
              <input type="checkbox" v-model="form.isHandicap" id="handicap" class="w-5 h-5 text-[#FF8B7D] border-gray-300 rounded focus:ring-[#FF8B7D]">
              <label for="handicap" class="ml-3 text-sm font-medium text-gray-700">Je souhaite déclarer une situation de handicap (Optionnel)</label>
            </div>
          </div>

          <div v-else>
            <p class="text-[#443E73] font-medium italic">Accès Administrateur détecté. Cliquez sur terminer pour accéder à la gestion complète.</p>
          </div>

          <p v-if="errorMessage" class="text-red-500 text-sm font-bold">{{ errorMessage }}</p>

          <div class="flex justify-between items-center pt-6">
            <button type="button" @click="currentStep = 1" class="text-gray-400 font-bold hover:text-gray-600 transition-colors">Retour</button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="px-10 py-3 bg-[#B2E9E1] text-[#443E73] font-black rounded-xl shadow-lg hover:bg-[#FF8B7D] hover:text-white transition-all transform hover:-translate-y-1"
            >
              {{ isSubmitting ? 'Envoi...' : 'Terminer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>