<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import { useEtablissementsStore } from '../stores/etablissementsStore';
import { useUserStore } from '../stores/user';
import { generateProgrammePDF } from '../utils/pdfProgramme';

const formationBuilderStore = useFormationBuilderStore();
const etablissementsStore = useEtablissementsStore();
const userStore = useUserStore();

const formation = computed(() => formationBuilderStore.formation);
const modules = computed(() => formationBuilderStore.formation.modules || []);

// --- LOGIQUE DE RÉCUPÉRATION DIRECTE ---
const isGenerating = ref(false);

const loadFreshEtablissement = async () => {
  // On récupère l'ID de l'école rattachée à la formation
  const ecoleId = typeof formation.value.ecole === 'object' 
    ? formation.value.ecole?._id 
    : formation.value.ecole;

  // Fallback sur le contexte admin ou l'entité utilisateur si pas d'école sur la formation
  const fallbackId = userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
  
  const idToFetch = ecoleId || fallbackId;

  if (idToFetch) {
    console.log("📡 Fetching fresh establishment data for ID:", idToFetch);
    await etablissementsStore.fetchEtablissementById(idToFetch); //
  }
};

// On appelle la data dès le montage du composant
onMounted(loadFreshEtablissement);

// On surveille si l'ID de l'école change pour re-fetch
watch(() => formation.value.ecole, loadFreshEtablissement);

// --- SOURCE DE VÉRITÉ FINALE (Issue du store établissement) ---
const etablissement = computed(() => {
  const source = etablissementsStore.currentEtablissement; //

  return {
    nom: source?.nom || "Établissement",
    logoUrl: source?.logoUrl || null,
    // Les couleurs viennent directement de l'objet école fraîchement chargé
    couleur1: source?.couleur1 || "#423B71", 
    couleur2: source?.couleur2 || "#62D6CA",
    numeroSIRET: source?.siret || '',
    address: source?.adresse || null,
    contactEmail: (source as any)?.contactEmail || '',
    website: source?.website || ''
  };
});

const handleDownload = async () => {
  if (!formation.value) return;
  isGenerating.value = true;
  try {
    await generateProgrammePDF(formation.value, etablissement.value);
  } finally {
    isGenerating.value = false;
  }
};
</script>
<template>
  <div class="flex flex-col xl:flex-row gap-10 items-start animate-in fade-in duration-500 w-full p-1">
    
    <div class="w-full xl:w-[480px] shrink-0 xl:sticky xl:top-6">
      <div class="bg-white shadow-xl rounded-md overflow-hidden aspect-[1/1.41] border border-gray-200 relative group transition-all duration-500">
        
        <div :style="{ backgroundColor: etablissement.couleur1 }" class="h-[15%] p-5 flex items-center gap-4 transition-colors duration-500">
           <div v-if="etablissement.logoUrl" class="w-12 h-12 bg-white rounded-md flex items-center justify-center p-1.5 shadow-sm overflow-hidden">
              <img :src="etablissement.logoUrl" class="w-full h-full object-contain" />
           </div>
           <div class="flex-1 space-y-2">
             <div class="h-1 w-3/4 bg-white/20 rounded-full"></div>
             <div class="h-1 w-1/2 bg-white/10 rounded-full"></div>
           </div>
        </div>
        
        <div :style="{ backgroundColor: etablissement.couleur2 }" class="h-1 w-full opacity-80"></div>
        
        <div class="p-8 space-y-10">
          <div v-for="i in 2" :key="i" class="space-y-3">
            <div :style="{ color: etablissement.couleur1 }" class="text-[9px] font-black uppercase tracking-widest border-b pb-1">
               {{ i === 1 ? 'Objectifs Pédagogiques' : 'Pré-requis' }}
            </div>
            <div class="h-1 w-full bg-gray-50 rounded"></div>
            <div class="h-1 w-2/3 bg-gray-50 rounded"></div>
          </div>
        </div>

        <div @click="handleDownload" :style="{ backgroundColor: `${etablissement.couleur1}F2` }" class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white backdrop-blur-sm cursor-pointer">
          <i class="fas fa-file-download text-3xl mb-3"></i>
          <span class="font-black uppercase tracking-widest text-xs">Générer le Programme PDF</span>
        </div>
      </div>
    </div>

    <div class="flex-1 space-y-8 w-full">
      
      <div class="bg-white rounded-xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-black uppercase tracking-widest rounded border border-gray-200">
               Établissement
            </span>
            <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
               {{ etablissement.nom }}
            </span>
          </div>
          <h2 class="text-3xl font-black text-[#423B71] tracking-tight leading-none">{{ formation.title || 'Formation sans titre' }}</h2>
        </div>

        <button 
          @click="handleDownload"
          :disabled="isGenerating"
          class="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-[#FF8B7D] transition-all shadow-md active:scale-95 shrink-0">
          <i v-if="isGenerating" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-file-pdf"></i>
          Exporter le programme
        </button>
      </div>

      <div class="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
        <h3 class="text-sm font-black text-[#423B71] mb-8 uppercase tracking-[0.2em] flex items-center gap-4">
          <span class="w-1.5 h-6 rounded-full bg-gray-300"></span> 
          Contenu de la formation
        </h3>

        <div v-if="modules.length > 0" class="space-y-4">
          <div v-for="(mod, idx) in modules" :key="mod._id" class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
            <div class="flex items-center gap-5 mb-6">
              <div class="w-10 h-10 rounded flex items-center justify-center font-black text-base bg-gray-100 text-gray-600 border border-white shadow-sm">
                {{ (idx + 1).toString().padStart(2, '0') }}
              </div>
              <h4 class="font-black text-[#423B71] text-lg tracking-tight leading-none">{{ mod.name }}</h4>
            </div>
            
            <div class="ml-14 space-y-2">
                <div v-for="chap in mod.chapters" :key="chap._id" class="flex items-center justify-between p-3 bg-white rounded border border-gray-100 shadow-sm">
                    <span class="text-xs font-bold text-gray-600">{{ chap.title }}</span>
                </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aucun module configuré</p>
        </div>
      </div>
    </div>
  </div>
</template>