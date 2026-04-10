<script setup lang="ts">
import { ref, watch } from 'vue';
import { useEtablissementsStore, type Etablissement } from '../../stores/etablissementsStore';
import api from '/services/api';

const props = defineProps<{
  etablissement: Etablissement;
}>();

const store = useEtablissementsStore();
const form = ref<Partial<Etablissement>>({
  domaineCompetences: [], 
});

const newTag = ref('');

// --- SYSTÈME D'UPLOAD ---
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const isSaving = ref(false); // Ajout de l'état de sauvegarde

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploading.value = true;
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    form.value.logoUrl = response.data.url || response.data.fileUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload du logo:', error);
    alert("Erreur lors de l'importation de l'image.");
  } finally {
    isUploading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};

watch(() => props.etablissement, (newValue) => {
  if (newValue) {
    form.value = { ...newValue };

    if (newValue.dateDeFondation) {
      form.value.dateDeFondation = new Date(newValue.dateDeFondation).toISOString().slice(0, 10);
    }
    
    if (!form.value.domaineCompetences) {
      form.value.domaineCompetences = [];
    }
  }
}, { immediate: true, deep: true });

const handleSave = async () => {
  if (!props.etablissement._id) return;
  isSaving.value = true;
  try {
    await store.updateEtablissement(props.etablissement._id, form.value);
    alert('Modifications enregistrées avec succès !');
  } catch (err) {
    alert('Erreur lors de la sauvegarde.');
  } finally {
    isSaving.value = false;
  }
};

const addTag = () => {
  if (newTag.value.trim() !== '' && !form.value.domaineCompetences?.includes(newTag.value.trim())) {
    form.value.domaineCompetences?.push(newTag.value.trim());
    newTag.value = ''; 
  }
};

const removeTag = (tagToRemove: string) => {
  if (form.value.domaineCompetences) {
    form.value.domaineCompetences = form.value.domaineCompetences.filter(tag => tag !== tagToRemove);
  }
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-8 pb-10 animate-in fade-in duration-500 w-full">
    
    <div class="flex justify-between items-center bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
      <div>
        <h2 class="text-xl font-bold text-[#423B71] tracking-tight">Paramètres Généraux</h2>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          N'oubliez pas de sauvegarder vos modifications
        </p>
      </div>
      <button 
        type="submit" 
        :disabled="isSaving"
        class="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-[#FF8B7D] hover:text-white transition-all shadow-md active:scale-95 shrink-0 flex items-center"
      >
        <i v-if="isSaving" class="fas fa-spinner fa-spin mr-1.5 sm:mr-2"></i>
        <i v-else class="fas fa-save mr-1.5 sm:mr-2"></i>
        {{ isSaving ? 'Enregistrement...' : 'Sauvegarder' }}
      </button>
    </div>

    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
      <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center shadow-inner">
          <i class="fas fa-fingerprint"></i>
        </div>
        <h2 class="text-xl font-bold text-[#423B71]">Identité de l'établissement</h2>
      </div>

      <div class="flex flex-col lg:flex-row gap-10 items-start pt-2">
        
        <div class="shrink-0 mx-auto lg:mx-0 flex flex-col items-center gap-4">
          <div v-if="form.logoUrl" class="relative group w-48 h-48 rounded-[2rem] border border-gray-100 bg-white shadow-sm flex items-center justify-center p-4 overflow-hidden">
            <img :src="form.logoUrl" :alt="form.nom" class="w-full h-full object-contain transition-transform group-hover:scale-105">
          </div>
          <div v-else class="w-48 h-48 rounded-[2rem] bg-gray-50 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-300">
            <i class="fas fa-image text-4xl mb-3 opacity-50"></i>
            <span class="text-xs font-bold uppercase tracking-wider">Aucun logo</span>
          </div>

          <input type="file" ref="fileInput" class="hidden" accept="image/png, image/jpeg, image/webp" @change="handleFileUpload" />
          <button 
            type="button" 
            @click="triggerUpload" 
            :disabled="isUploading" 
            class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-all flex items-center gap-2"
          >
            <i v-if="isUploading" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-upload"></i>
            {{ isUploading ? 'Envoi...' : 'Importer une image' }}
          </button>
        </div>

        <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-2">Nom officiel</label>
            <input type="text" v-model="form.nom" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="Nom de l'école">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-2">Slogan / Baseline</label>
            <input type="text" v-model="form.slogan" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="Ex: L'excellence au service de demain">
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-gray-500 mb-2">URL directe du logo (Optionnel)</label>
            <input type="text" v-model="form.logoUrl" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="Générée automatiquement lors de l'import ou saisie manuellement">
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">Couleurs de la plateforme</label>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <input type="color" v-model="form.couleur1" class="w-8 h-8 rounded cursor-pointer border-none bg-transparent p-0">
              <input type="text" v-model="form.couleur1" class="w-20 bg-transparent border-none text-xs font-bold outline-none text-gray-700 uppercase" v-maska="'#HHHHHH'">
            </div>
            <div class="flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
              <input type="color" v-model="form.couleur2" class="w-8 h-8 rounded cursor-pointer border-none bg-transparent p-0">
              <input type="text" v-model="form.couleur2" class="w-20 bg-transparent border-none text-xs font-bold outline-none text-gray-700 uppercase" v-maska="'#HHHHHH'">
            </div>
          </div>
        </div>
        <div>
           <label class="block text-xs font-bold text-gray-500 mb-2">Date de création</label>
           <input type="date" v-model="form.dateDeFondation" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all">
        </div>
      </div>
    </div>

    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
      <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
        <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shadow-inner">
          <i class="fas fa-align-left"></i>
        </div>
        <h2 class="text-xl font-bold text-[#423B71]">Présentation & Liens</h2>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">Histoire & Valeurs</label>
          <textarea v-model="form.histoire" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all min-h-[120px] resize-none" placeholder="Parlez-nous de la genèse de l'école..."></textarea>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">Description synthétique</label>
          <textarea v-model="form.description" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all min-h-[120px] resize-none" placeholder="Sera affichée sur les catalogues publics..."></textarea>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">Site Web Officiel</label>
          <div class="relative">
            <i class="fas fa-link absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" v-model="form.website" class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="https://...">
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-500 mb-2">Vidéo YouTube de présentation</label>
          <div class="relative">
            <i class="fab fa-youtube absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" v-model="form.videoPresentation" class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="URL de la vidéo">
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
        <div class="flex items-center justify-between border-b border-gray-100 pb-4">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center shadow-inner">
              <i class="fas fa-medal"></i>
            </div>
            <h2 class="text-xl font-bold text-[#423B71]">Expertise</h2>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-500">Certificateur</span>
            <button 
                type="button"
                @click="form.estCertificateur = !form.estCertificateur"
                class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none"
                :class="form.estCertificateur ? 'bg-teal-400' : 'bg-gray-300'"
              >
                <span class="inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200"
                      :class="form.estCertificateur ? 'translate-x-5' : 'translate-x-0'"></span>
            </button>
          </div>
        </div>
        
        <div class="pt-2">
          <label class="block text-xs font-bold text-gray-500 mb-2">Domaines de compétences</label>
          <div class="flex items-center gap-2">
            <input type="text" v-model="newTag" @keydown.enter.prevent="addTag" class="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="Ajouter une expertise (Entrée pour valider)...">
            <button type="button" @click="addTag" class="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors font-bold text-sm">
              Ajouter
            </button>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <span v-for="tag in form.domaineCompetences" :key="tag" class="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
              {{ tag }}
              <button @click.prevent="removeTag(tag)" class="text-indigo-400 hover:text-indigo-900 transition-colors">
                <i class="fas fa-times"></i>
              </button>
            </span>
            <span v-if="!form.domaineCompetences?.length" class="text-sm text-gray-400 italic">
              Aucun domaine de compétence renseigné.
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 flex flex-col gap-6">
        <div class="flex items-center gap-4 border-b border-gray-100 pb-4">
          <div class="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shadow-inner">
            <i class="fas fa-file-invoice"></i>
          </div>
          <h2 class="text-xl font-bold text-[#423B71]">Fiscalité & Légal</h2>
        </div>
        
        <div class="pt-2 space-y-6">
          <div>
            <label class="block text-xs font-bold text-gray-500 mb-2">N° SIRET (14 chiffres)</label>
            <input type="text" v-model="form.siret" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all" placeholder="Indispensable pour Qualiopi">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-2">Numéro TVA</label>
              <input type="text" v-model="form.numeroTVA" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-500 mb-2">Code NAF</label>
              <input type="text" v-model="form.codeNAF" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50 transition-all">
            </div>
          </div>
        </div>
      </div>
    </div>

  </form>
</template>