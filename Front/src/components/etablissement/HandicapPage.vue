<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEtablissementsStore, type Etablissement } from '../../stores/etablissementsStore';

const props = defineProps<{
  etablissementId: string;
}>();

const store = useEtablissementsStore();
const etablissement = store.currentEtablissement;

const form = ref<Partial<Etablissement>>({
  mesuresPredefinies: [],
  mesuresPersonnalisees: [],
  certificationsHandicap: [],
});

const newMesureTag = ref('');
const newCertifTag = ref('');

const predefinedMesures = [
  "Tiers-temps pour les examens",
  "Supports de cours adaptés (Braille, gros caractères)",
  "Logiciels spécifiques (lecteurs d'écran, synthèse vocale)",
  "Interprétariat en Langue des Signes Française (LSF)",
  "Accompagnement personnalisé / tutorat"
];

watch(() => store.currentEtablissement, (newValue) => {
  if (newValue) {
    form.value = { ...newValue };
    if (!form.value.mesuresPredefinies) form.value.mesuresPredefinies = [];
    if (!form.value.mesuresPersonnalisees) form.value.mesuresPersonnalisees = [];
    if (!form.value.certificationsHandicap) form.value.certificationsHandicap = [];
  }
}, { immediate: true, deep: true });

const handleSave = async () => {
  if (!props.etablissementId) return;
  try {
    await store.updateEtablissement(props.etablissementId, form.value);
    alert('Informations sur l\'accessibilité enregistrées !');
  } catch (err) {
    alert('Erreur lors de la sauvegarde.');
  }
};

const addTag = (type: 'mesure' | 'certif') => {
  if (type === 'mesure' && newMesureTag.value.trim() !== '') {
    form.value.mesuresPersonnalisees?.push(newMesureTag.value.trim());
    newMesureTag.value = '';
  }
  if (type === 'certif' && newCertifTag.value.trim() !== '') {
    form.value.certificationsHandicap?.push(newCertifTag.value.trim());
    newCertifTag.value = '';
  }
};

const removeTag = (tagToRemove: string, type: 'mesure' | 'certif') => {
  if (type === 'mesure' && form.value.mesuresPersonnalisees) {
    form.value.mesuresPersonnalisees = form.value.mesuresPersonnalisees.filter(tag => tag !== tagToRemove);
  }
  if (type === 'certif' && form.value.certificationsHandicap) {
    form.value.certificationsHandicap = form.value.certificationsHandicap.filter(tag => tag !== tagToRemove);
  }
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-8">
    
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="font-bold text-lg text-[#423B71] border-b pb-4 mb-6">Référent Handicap</h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label class="label">Nom du Référent</label>
          <input type="text" v-model="form.referentHandicapNom" class="input-field">
        </div>
        <div>
          <label class="label">Email de Contact</label>
          <input type="email" v-model="form.referentHandicapEmail" class="input-field">
        </div>
        <div>
          <label class="label">Téléphone Direct (optionnel)</label>
          <input type="tel" v-model="form.referentHandicapTelephone" class="input-field">
        </div>
        <div class="lg:col-span-2">
          <label class="label">Rôle et disponibilités</label>
          <textarea v-model="form.referentHandicapBio" class="input-field" rows="3" placeholder="Décrivez le rôle du référent..."></textarea>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="font-bold text-lg text-[#423B71] border-b pb-4 mb-6">Accessibilité & Adaptations</h3>
      <div class="space-y-2 mb-6">
          <div class="flex items-start">
            <input id="locauxAccessiblesPMR" type="checkbox" v-model="form.locauxAccessiblesPMR" class="h-4 w-4 rounded mt-1">
            <label for="locauxAccessiblesPMR" class="ml-3 label">Nos locaux sont accessibles aux Personnes à Mobilité Réduite (PMR)</label>
          </div>
          <textarea v-if="form.locauxAccessiblesPMR" v-model="form.detailsAccessibilite" class="input-field mt-2" rows="3" placeholder="Détaillez les aménagements (rampes, ascenseurs, etc.)..."></textarea>
      </div>
      <div>
        <label class="label mb-2">Mesures d'Adaptation Pédagogiques Proposées</label>
        <div class="space-y-2">
          <div v-for="mesure in predefinedMesures" :key="mesure" class="flex items-center">
            <input :id="mesure" type="checkbox" :value="mesure" v-model="form.mesuresPredefinies" class="h-4 w-4 rounded">
            <label :for="mesure" class="ml-3 text-sm text-gray-700">{{ mesure }}</label>
          </div>
        </div>
        <div class="mt-4">
          <label class="label">Autres mesures (personnalisées)</label>
          <div class="flex items-center gap-2">
            <input type="text" v-model="newMesureTag" @keydown.enter.prevent="addTag('mesure')" class="input-field flex-grow" placeholder="Ajouter une mesure et appuyer sur Entrée">
            <button type="button" @click="addTag('mesure')" class="btn-secondary">Ajouter</button>
          </div>
          <div v-if="form.mesuresPersonnalisees && form.mesuresPersonnalisees.length > 0" class="flex flex-wrap gap-2 mt-2">
            <span v-for="tag in form.mesuresPersonnalisees" :key="tag" class="tag">
              {{ tag }}
              <button @click="removeTag(tag, 'mesure')" class="ml-1.5">&times;</button>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow-md">
       <h3 class="font-bold text-lg text-[#423B71] border-b pb-4 mb-6">Procédures & Engagements</h3>
       <div class="space-y-6">
          <div>
            <label class="label">Procédure d'Accueil et d'accompagnement</label>
            <textarea v-model="form.procedureAccueil" class="input-field" rows="4" placeholder="Décrivez les étapes pour un apprenant..."></textarea>
          </div>
          <div>
            <label class="label">Lien vers la Politique d'Accessibilité (optionnel)</label>
            <input type="url" v-model="form.lienPolitiqueAccessibilite" class="input-field" placeholder="https://...">
          </div>
          <div>
            <label class="label">Labels et Certifications</label>
            <div class="flex items-center gap-2">
              <input type="text" v-model="newCertifTag" @keydown.enter.prevent="addTag('certif')" class="input-field flex-grow" placeholder="Ajouter un label (ex: Qualiopi) et appuyer sur Entrée">
              <button type="button" @click="addTag('certif')" class="btn-secondary">Ajouter</button>
            </div>
            <div v-if="form.certificationsHandicap && form.certificationsHandicap.length > 0" class="flex flex-wrap gap-2 mt-2">
              <span v-for="tag in form.certificationsHandicap" :key="tag" class="tag">
                {{ tag }}
                <button @click="removeTag(tag, 'certif')" class="ml-1.5">&times;</button>
              </span>
            </div>
          </div>
       </div>
    </div>

    <div class="pt-4 flex justify-end">
      <button type="submit" class="btn-primary">Enregistrer les modifications</button>
    </div>
  </form>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent; }
.btn-primary { @apply bg-[#B2E9E1] text-[#443E73] font-bold py-3 px-6 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300; }
.btn-secondary { @apply bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200; }
.tag { @apply flex items-center bg-indigo-100 text-indigo-700 text-sm font-medium px-2.5 py-0.5 rounded-full; }
input[type="checkbox"] { @apply border-gray-300 rounded text-indigo-600 focus:ring-indigo-500; }
</style>