<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface NewApprenantData {
  nom: string;
  prenom: string;
  email: string;
}

interface FormErrors {
  nom: boolean;
  prenom: boolean;
  email: boolean;
}

const props = defineProps<{
  show: boolean;
  newApprenant: NewApprenantData;
  errors: FormErrors;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create-apprenant', data: NewApprenantData): void;
  (e: 'update:newApprenant', data: NewApprenantData): void;
  (e: 'update:errors', errors: FormErrors): void;
}>();

const localNewApprenant = ref({ ...props.newApprenant });
const localErrors = ref({ ...props.errors });

watch(() => props.newApprenant, (newValue) => {
  localNewApprenant.value = { ...newValue };
}, { deep: true });
watch(() => props.errors, (newValue) => {
  localErrors.value = { ...newValue };
}, { deep: true });

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const createApprenant = () => {
  localErrors.value = { nom: false, prenom: false, email: false };

  let hasErrors = false;

  if (!localNewApprenant.value.nom.trim()) {
    localErrors.value.nom = true;
    hasErrors = true;
  }
  if (!localNewApprenant.value.prenom.trim()) {
    localErrors.value.prenom = true;
    hasErrors = true;
  }
  if (!localNewApprenant.value.email.trim() || !isValidEmail(localNewApprenant.value.email)) {
    localErrors.value.email = true;
    hasErrors = true;
  }

  emit('update:errors', localErrors.value);

  if (hasErrors) return;

  emit('create-apprenant', localNewApprenant.value);
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[#F04636]">Ajouter un apprenant</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="createApprenant">
          <div class="mb-4">
            <label class="label">Nom</label>
            <input
              v-model="localNewApprenant.nom"
              type="text"
              class="input-field"
              :class="{ 'border-red-500': localErrors.nom }"
              placeholder=""
              required
            >
            <p v-if="localErrors.nom" class="text-red-500 text-xs mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Veuillez compléter ce champ.
            </p>
          </div>

          <div class="mb-4">
            <label class="label">Prénom</label>
            <input
              v-model="localNewApprenant.prenom"
              type="text"
              class="input-field"
              :class="{ 'border-red-500': localErrors.prenom }"
              placeholder=""
              required
            >
            <p v-if="localErrors.prenom" class="text-red-500 text-xs mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Veuillez compléter ce champ.
            </p>
          </div>

          <div class="mb-6">
            <label class="label">Adresse email</label>
            <input
              v-model="localNewApprenant.email"
              type="email"
              class="input-field"
              :class="{ 'border-red-500': localErrors.email }"
              placeholder="exemple@email.com"
              required
            >
            <p v-if="localErrors.email" class="text-red-500 text-xs mt-1 flex items-center">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Veuillez entrer une adresse email valide.
            </p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
