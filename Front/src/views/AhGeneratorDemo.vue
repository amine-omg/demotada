<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col">
    <TheHeader pageTitle="Générateur d'Attestation (Démo AH)" :showBackButton="false" />

    <div class="flex-1 flex p-6 md:p-10 gap-8 h-[calc(100vh-6rem)] overflow-hidden">
      
      <div class="w-1/2 flex flex-col bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative">
        
        <label 
          v-if="!pdfPreviewUrl"
          class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 m-8 rounded-[2rem] bg-gray-50 hover:bg-gray-100 hover:border-[#D4AF37] transition-all cursor-pointer group"
        >
          <input type="file" @change="uploadDocument" accept=".pdf,.jpg,.png" class="hidden" />
          <div class="text-7xl mb-6 transition-transform group-hover:scale-110 opacity-80">📄</div>
          <h2 class="text-xl font-black uppercase tracking-widest text-[#1A1A1A] mb-2">Glissez le devis client</h2>
          <p class="text-sm font-bold text-[#D4AF37] uppercase tracking-widest">Génération automatique de l'AH</p>
        </label>

        <div v-else class="flex-1 flex flex-col relative bg-gray-100">
          <div class="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-gradient-to-b from-white to-transparent z-20">
            <span class="text-xs font-black uppercase tracking-widest text-[#1A1A1A] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">Document Source</span>
            <button @click="resetDemo" class="text-xs font-bold text-gray-500 hover:text-[#1A1A1A] bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 transition-colors">Nouveau fichier</button>
          </div>
          
          <iframe :src="pdfPreviewUrl" class="w-full h-full border-none z-10" title="Aperçu du document"></iframe>
          
          <div v-if="isAnalyzing" class="absolute inset-0 z-30 bg-white/70 backdrop-blur-md flex flex-col items-center justify-center">
            <div class="w-20 h-20 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-6 shadow-lg"></div>
            <p class="text-sm font-black tracking-[0.3em] text-[#1A1A1A] uppercase animate-pulse">Extraction Gemini en cours...</p>
            <p class="text-[10px] text-[#D4AF37] uppercase tracking-widest mt-2 font-bold">Pré-remplissage du formulaire CERFA</p>
          </div>
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.8)] top-0 animate-[scan_2.5s_ease-in-out_infinite] z-40"></div>
        </div>
      </div>

      <div class="w-1/2 flex flex-col bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 overflow-y-auto custom-scrollbar relative">
        
        <div v-if="!extractedData && !isAnalyzing" class="absolute inset-0 flex flex-col items-center justify-center z-10 opacity-40">
          <svg class="w-24 h-24 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p class="text-sm font-black uppercase tracking-widest text-gray-400">En attente d'un document</p>
        </div>

        <template v-if="extractedData || isAnalyzing">
          
          <div class="border-b-2 border-[#1A1A1A] pb-4 mb-6">
            <div class="flex justify-between items-start mb-2">
              <div class="text-[9px] font-black uppercase tracking-widest text-gray-500 text-center border border-gray-300 p-2 rounded">
                Ministère de la<br>Transition Énergétique
              </div>
              <div class="text-right">
                <span class="text-xs font-black uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full text-gray-600">BAT-EN-101</span>
              </div>
            </div>
            <h2 class="text-lg font-black uppercase tracking-tighter text-[#1A1A1A] text-center mt-4">
              Annexe 1 à la fiche d'opération standardisée
            </h2>
            <p class="text-xs text-center text-[#D4AF37] font-bold uppercase tracking-widest mt-1">Attestation pré-remplie par l'IA</p>
          </div>

          <div class="space-y-6" :class="{'opacity-50 pointer-events-none': isAnalyzing}">
            
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h3 class="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Informations Générales</h3>
              
              <div class="space-y-4">
                <div class="flex gap-4">
                  <div class="w-1/3 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Date engagement
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.date_engagement" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Nom du site / Copropriété
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.nom_site" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                </div>

                <div class="space-y-2 relative">
                  <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                    Adresse des travaux
                    <span class="text-[#D4AF37]">IA</span>
                  </label>
                  <input v-model="formData.adresse" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                </div>

                <div class="flex gap-4">
                  <div class="w-1/3 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Code Postal
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.code_postal" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Ville
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.ville" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <h3 class="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">Caractéristiques de l'isolant posé</h3>
              
              <div class="space-y-4">
                <div class="flex gap-4">
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Surface d'isolant (m²)
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.surface" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Résistance thermique (R)
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.resistance_thermique" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm" :class="{'ring-1 ring-amber-400': !formData.resistance_thermique}"/>
                  </div>
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Épaisseur (mm)
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.epaisseur" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                </div>

                <div class="flex gap-4">
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Marque de l'isolant
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.marque" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                  <div class="flex-1 space-y-2 relative">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Référence
                      <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.reference" class="w-full bg-white border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold transition-all outline-none shadow-sm text-sm"/>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="mt-8 pt-6 border-t border-gray-200 flex gap-4">
            <button @click="resetDemo" class="px-6 py-4 rounded-xl border border-gray-300 text-gray-600 font-black uppercase tracking-widest hover:bg-gray-50 transition-all text-xs">
              Annuler
            </button>
           <button @click="downloadPdf" class="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] flex items-center justify-center gap-3 text-white bg-[#1A1A1A] hover:bg-black">
  Générer le PDF de l'Attestation
  <svg class="w-5 h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
</button>
          </div>

        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue'; 

const isAnalyzing = ref(false);
const extractedData = ref(null);
const pdfPreviewUrl = ref(null);

// Les champs précis du CERFA
const formData = ref({
  date_engagement: '',
  nom_site: '',
  adresse: '',
  code_postal: '',
  ville: '',
  surface: '',
  resistance_thermique: '',
  epaisseur: '',
  marque: '',
  reference: ''
});

const uploadDocument = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  pdfPreviewUrl.value = URL.createObjectURL(file);

  isAnalyzing.value = true;
  extractedData.value = null;

  const fd = new FormData();
  fd.append('file', file); 

  try {
    // On appelle la nouvelle route dédiée à l'AH
    const response = await api.post('/api/demo/extract-ah', fd);
    
    setTimeout(() => {
      const data = response.data.data;
      extractedData.value = data;
      
      formData.value = {
        date_engagement: data.date_engagement || '',
        nom_site: data.nom_site || '',
        adresse: data.adresse || '',
        code_postal: data.code_postal || '',
        ville: data.ville || '',
        surface: data.surface || '',
        resistance_thermique: data.resistance_thermique || '',
        epaisseur: data.epaisseur || '',
        marque: data.marque || '',
        reference: data.reference || ''
      };
      
      isAnalyzing.value = false;
    }, 2000);

  } catch (error) {
    console.error("Erreur d'extraction AH:", error);
    isAnalyzing.value = false;
    alert("Impossible d'analyser le document pour la démo.");
    pdfPreviewUrl.value = null;
  }
};

const resetDemo = () => {
  extractedData.value = null;
  pdfPreviewUrl.value = null;
  formData.value = { 
    date_engagement: '', nom_site: '', adresse: '', code_postal: '', 
    ville: '', surface: '', resistance_thermique: '', epaisseur: '', 
    marque: '', reference: '' 
  };
};

const downloadPdf = async () => {
  try {
    // Appel à l'API en demandant un format 'blob' (fichier binaire)
    const response = await api.post('/api/demo/generate-ah-pdf', formData.value, {
      responseType: 'blob' 
    });

    // Création d'un lien de téléchargement invisible pour forcer la sauvegarde
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AH_BAT-EN-101_${formData.value.nom_site || 'Client'}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Remplacer l'aperçu à gauche par le PDF généré pour l'effet Waouh !
    pdfPreviewUrl.value = url;

  } catch (error) {
    console.error("Erreur de génération :", error);
    alert("Impossible de générer le PDF final.");
  }
};
</script>

<style scoped>
@keyframes scan {
  0% { top: 0%; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
.animate-scan {
  animation: scan 2.5s infinite ease-in-out;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5); /* Hover doré */
}
</style>