<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import ImageUploader from '../components/ImageUploader.vue'; 

const formationBuilderStore = useFormationBuilderStore();
const formation = computed(() => formationBuilderStore.formation);
const isSaving = ref(false);
const newTagInput = ref('');

const domains = ['Business', 'Informatique', 'Langues', 'Énergie & Environnement', 'Arts et Design', 'Sciences Humaines', 'Santé & Bien-être'];

const handleImageUpdate = async (file: File) => {
  try { await formationBuilderStore.uploadFormationImage(file); } 
  catch (error) { alert("Erreur upload image."); }
};

const handleImageRemove = () => { if (confirm("Supprimer l'image ?")) formation.value.image = ''; };

const addTag = () => {
  const tag = newTagInput.value.trim();
  if (tag && !(formation.value.tags || []).includes(tag)) {
    if (!formation.value.tags) formation.value.tags = [];
    formation.value.tags.push(tag);
    newTagInput.value = ''; 
  }
};

const removeTag = (tagToRemove: string) => {
  formation.value.tags = formation.value.tags.filter((tag: string) => tag !== tagToRemove);
};

const saveChanges = async () => {
  isSaving.value = true;
  try {
    await formationBuilderStore.saveFormation();
    alert('Modifications enregistrées avec succès !');
  } catch (error) {
    alert('Erreur lors de la sauvegarde.');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="animate-in fade-in duration-500 w-full">
    
    <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
      <div>
        <h2 class="text-xl font-bold text-[#423B71] tracking-tight">Informations Générales</h2>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          N'oubliez pas de sauvegarder vos modifications avant de quitter
        </p>
      </div>
      <button 
        @click="saveChanges" 
        :disabled="isSaving"
        class="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-[#FF8B7D] hover:text-white transition-all shadow-md active:scale-95 shrink-0 flex items-center"
      >
        <i v-if="isSaving" class="fas fa-spinner fa-spin mr-1.5 sm:mr-2"></i>
        <i v-else class="fas fa-save mr-1.5 sm:mr-2"></i>
        {{ isSaving ? 'Enregistrement...' : 'Sauvegarder' }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
      
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          
          <h3 class="text-sm font-bold text-[#423B71] mb-8 border-b border-gray-50 pb-2">Configuration de la formation</h3>
          
          <div class="space-y-6">
            <div class="group">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Titre du programme</label>
              <input type="text" v-model="formation.title" class="standard-input font-bold" placeholder="Ex: Masterclass Management">
            </div>

            <div class="group">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Accroche (Description courte)</label>
              <textarea v-model="formation.description" class="standard-input min-h-[80px]" placeholder="Bref résumé pour le catalogue..."></textarea>
            </div>

            <div class="group">
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Présentation détaillée</label>
              <textarea v-model="formation.descriptionLongue" class="standard-input min-h-[160px]" placeholder="Contenu complet de la formation..."></textarea>
            </div>

            <div class="pt-6 border-t border-gray-50 space-y-6">
              <div class="group">
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Objectifs pédagogiques</label>
                <textarea v-model="formation.objectives" class="standard-input h-28 text-xs leading-relaxed" placeholder="À l'issue de la formation, l'apprenant sera capable de..."></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="group">
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Public visé</label>
                  <textarea v-model="formation.publicCible" class="standard-input h-28 text-xs leading-relaxed" placeholder="Profils, métiers, niveaux d'expérience..."></textarea>
                </div>
                <div class="group">
                  <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pré-requis nécessaires</label>
                  <textarea v-model="formation.prerequisites" class="standard-input h-28 text-xs leading-relaxed" placeholder="Diplômes, compétences techniques ou outils maîtrisés..."></textarea>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="lg:col-span-1 space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-bold text-[#423B71] mb-6 border-b border-gray-50 pb-2">Image & Vidéo</h3>
          
          <div class="mb-6">
            <ImageUploader 
              :image-url="formation.image"
              label="Couverture (16:9)"
              @update:image="handleImageUpdate"
              @remove:image="handleImageRemove"
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lien YouTube (Démo)</label>
            <div class="relative">
              <i class="fab fa-youtube absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"></i>
              <input type="url" v-model="formation.videoPresentation" class="standard-input pl-10 text-xs" placeholder="https://youtube.com/...">
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-sm font-bold text-[#423B71] mb-6 border-b border-gray-50 pb-2">Classification</h3>
          
          <div class="space-y-6">
            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Domaine</label>
              <select v-model="formation.domain" class="standard-input text-xs">
                <option v-for="d in domains" :key="d" :value="d">{{ d }}</option>
              </select>
            </div>

            <div>
              <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tags</label>
              <div class="flex gap-2 mb-3">
                <input type="text" v-model="newTagInput" @keyup.enter="addTag" class="standard-input py-2 text-xs" placeholder="Ajouter...">
                <button @click="addTag" class="px-3 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 border border-gray-100">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span v-for="tag in formation.tags" :key="tag" @click="removeTag(tag)" class="px-2 py-1 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase rounded border border-gray-100 cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all">
                  #{{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.standard-input {
  @apply w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:bg-white focus:border-indigo-200 transition-all text-sm text-[#423B71];
}
textarea.standard-input { @apply resize-none; }
</style>