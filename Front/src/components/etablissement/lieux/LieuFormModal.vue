<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Lieu } from '../../../stores/lieuxStore';

const props = defineProps<{
  showModal: boolean;
  lieu: Lieu | null;
}>();

const emit = defineEmits(['close', 'save', 'delete']);

const form = ref<any>({
  nom: '',
  adresse: {
    formattedAddress: '',
    lat: 0,
    lng: 0,
  },
  capacite: 0,
  emailContact: '',
  nomContact: '',
  description: '',
  moyenAcces: '',
  prixParJour: 0,
  prixParDemiJournee: 0,
  proprietaireLocaux: true,
});

watch(() => props.showModal, (isShown) => {
  if (isShown) {
    if (props.lieu) {
      form.value = { ...props.lieu };
    } else {
      form.value = {
        nom: '',
        adresse: { formattedAddress: '', lat: 0, lng: 0 },
        capacite: 0, emailContact: '', nomContact: '',
        description: '', moyenAcces: '', prixParJour: 0,
        prixParDemiJournee: 0, proprietaireLocaux: true,
      };
    }
  }
});

watch(() => form.value.proprietaireLocaux, (isProprietaire) => {
    if (isProprietaire) {
        form.value.prixParJour = 0;
        form.value.prixParDemiJournee = 0;
    }
});

const handleSave = () => {
  const dataToSave = {
    ...form.value,
    adresse: {
        formattedAddress: form.value.adresse.formattedAddress,
        lat: form.value.adresse.lat || 0,
        lng: form.value.adresse.lng || 0,
    }
  };
  emit('save', dataToSave);
};

</script>

<template>
  <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
    <div class="bg-white rounded-lg shadow-xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h2 class="text-2xl font-bold text-[#423B71] mb-6">{{ lieu ? 'Modifier le lieu' : 'Ajouter un nouveau lieu' }}</h2>
      
      <form @submit.prevent="handleSave" class="space-y-6">
        <div>
          <label for="nom" class="form-label">Nom du lieu</label>
          <input id="nom" type="text" v-model="form.nom" class="form-input" required>
        </div>

        <div>
          <label for="adresse" class="form-label">Adresse</label>
          <input 
            id="adresse" 
            type="text" 
            v-model="form.adresse.formattedAddress" 
            class="form-input"
            placeholder="ex: 10 rue de la Paix, 75002 Paris"
          >
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="capacite" class="form-label">Capacité (personnes)</label>
                <input id="capacite" type="number" v-model.number="form.capacite" class="form-input">
            </div>
             <div>
                <label for="nomContact" class="form-label">Nom du contact</label>
                <input id="nomContact" type="text" v-model="form.nomContact" class="form-input">
            </div>
        </div>

        <div>
            <label for="emailContact" class="form-label">Email du contact</label>
            <input id="emailContact" type="email" v-model="form.emailContact" class="form-input">
        </div>
        
        <div>
            <label for="description" class="form-label">Description</label>
            <textarea id="description" v-model="form.description" class="form-input" rows="3"></textarea>
        </div>
        
        <div>
            <label for="moyenAcces" class="form-label">Moyens d'accès (transports, parking...)</label>
            <textarea id="moyenAcces" v-model="form.moyenAcces" class="form-input" rows="2"></textarea>
        </div>
        
        <div>
            <fieldset>
                <legend class="form-label">Êtes-vous propriétaire des locaux ?</legend>
                <div class="mt-2 flex items-center gap-x-6">
                    <div class="flex items-center">
                        <input id="prop-oui" type="radio" :value="true" v-model="form.proprietaireLocaux" class="h-4 w-4 border-gray-300 text-[#443E73] focus:ring-[#FF8B7D]">
                        <label for="prop-oui" class="ml-2 block text-sm text-gray-900">Oui</label>
                    </div>
                    <div class="flex items-center">
                        <input id="prop-non" type="radio" :value="false" v-model="form.proprietaireLocaux" class="h-4 w-4 border-gray-300 text-[#443E73] focus:ring-[#FF8B7D]">
                        <label for="prop-non" class="ml-2 block text-sm text-gray-900">Non</label>
                    </div>
                </div>
            </fieldset>

            <div v-if="!form.proprietaireLocaux" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <label for="prixParJour" class="form-label">Prix par journée (€)</label>
                    <input id="prixParJour" type="number" v-model.number="form.prixParJour" class="form-input">
                </div>
                <div>
                    <label for="prixParDemiJournee" class="form-label">Prix par demi-journée (€)</label>
                    <input id="prixParDemiJournee" type="number" v-model.number="form.prixParDemiJournee" class="form-input">
                </div>
            </div>
        </div>


        <div class="flex justify-end gap-4 pt-4">
          <button type="button" @click="$emit('close')" class="btn-secondary">Annuler</button>
          <button type="submit" class="btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.form-input {
  @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF8B7D] focus:border-[#FF8B7D] sm:text-sm;
}
.btn-primary {
  @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300;
}
.btn-secondary {
  @apply bg-white text-gray-700 font-semibold py-2 px-6 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-200;
}
</style>