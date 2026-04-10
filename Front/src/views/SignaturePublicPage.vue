<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '/services/api';
import SignaturePad from '../components/sign/SignaturePad.vue';
import { generateConventionPDF } from '../utils/pdfConvention';
import { generateDevisPDF } from '../utils/pdfDevis';

const route = useRoute();
const token = route.params.token as string;

const step = ref('loading');
const requestData = ref<any>(null);
const isFinalizing = ref(false);
const pdfUrl = ref('');
const pdfBase64 = ref('');

onMounted(async () => {
  try {
    const res = await api.get(`/api/signatures/details/${token}`);
    requestData.value = res.data;
    
    // On attend que les données soient là avant de générer l'aperçu
    await preparePreview();
    
    step.value = 'view';
  } catch (error) {
    console.error("Erreur chargement signature:", error);
    step.value = 'error';
  }
});

const preparePreview = async () => {
  try {
    let doc: any;
    const opportunite = requestData.value.opportunite;
    // On récupère l'école soit dans l'opportunité, soit dans l'objet de la requête
    const etablissement = opportunite.ecole || requestData.value.ecole;

    // Génération du document via les utils (le paramètre 'true' active le mode returnDoc)
    if (requestData.value.documentType === 'Convention') {
      doc = await generateConventionPDF(opportunite, etablissement, true);
    } else {
      doc = await generateDevisPDF(opportunite, etablissement, true);
    }

    if (doc) {
      // 1. Création d'un Blob pour l'aperçu (plus stable que le datauri sur mobile)
      const blob = doc.output('blob');
      pdfUrl.value = URL.createObjectURL(blob);
      
      // 2. Extraction du Base64 pur pour le backend
      // On utilise reader pour garantir un encodage propre sans préfixe
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result as string;
        pdfBase64.value = base64data.split(',')[1]; // On ne garde que la partie après la virgule
      };
    }
  } catch (err) {
    console.error("Erreur lors de la préparation de l'aperçu PDF:", err);
  }
};

const handleConfirmSignature = async (signatureImage: string) => {
  if (!pdfBase64.value) {
    alert("Le document est encore en cours de préparation. Veuillez patienter.");
    return;
  }
  
  isFinalizing.value = true;
  try {
    // signatureImage contient déjà le Base64 de l'image (Pad ou Initiales)
    await api.post(`/api/signatures/finalize/${token}`, {
      signatureImage,
      pdfBase64: pdfBase64.value
    });

    step.value = 'success';
  } catch (error: any) {
    console.error("Erreur finalisation:", error);
    alert("Erreur lors de la finalisation : " + (error.response?.data?.message || "Erreur serveur"));
  } finally {
    isFinalizing.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-[#DCD8F4] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
    
    <div v-if="step === 'loading'" class="text-center">
      <div class="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-white font-black uppercase tracking-widest text-xs">Chargement du document...</p>
    </div>

    <div v-else-if="step === 'error'" class="bg-white p-10 rounded-[2.5rem] shadow-xl text-center max-w-md">
      <div class="w-20 h-20 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
        <i class="fas fa-times"></i>
      </div>
      <h1 class="text-2xl font-black text-[#423B71] mb-2">Lien invalide</h1>
      <p class="text-gray-500 font-medium">Ce document a déjà été signé ou le lien d'accès a expiré.</p>
    </div>

    <div v-else-if="step === 'view'" class="w-full max-w-5xl space-y-8 animate-in fade-in zoom-in duration-500">
      <div class="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
        
        <div v-if="isFinalizing" class="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <i class="fas fa-circle-notch fa-spin text-4xl text-[#8A79E2] mb-4"></i>
          <p class="text-[#423B71] font-black uppercase tracking-widest text-xs">Sécurisation et envoi du document...</p>
        </div>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
  <div class="flex items-center gap-2 mb-1">
    <span class="px-2 py-0.5 bg-[#B2E9E1] text-[#423B71] text-[8px] font-black uppercase rounded-md">Document Officiel</span>
  </div>
  <h1 class="text-3xl font-black text-[#423B71] tracking-tighter">{{ requestData.documentType }}</h1>
  <p class="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">À l'attention de {{ requestData.opportunite?.apprenants?.[0]?.prenom }} {{ requestData.opportunite?.apprenants?.[0]?.nom }}</p>
</div>
          <div class="bg-[#EFEAFB] px-6 py-3 rounded-2xl border border-[#DCD8F4] text-right">
            <p class="text-[10px] font-black text-[#8A79E2] uppercase tracking-widest">Émis par</p>
            <p class="text-sm font-black text-[#423B71]">Syali Academy</p>
          </div>
        </div>

        <div class="bg-gray-200 rounded-3xl h-[600px] flex items-center justify-center mb-8 border-2 border-gray-100 shadow-inner overflow-hidden">
           <iframe v-if="pdfUrl" :src="pdfUrl" class="w-full h-full border-none"></iframe>
           <div v-else class="text-center">
             <i class="fas fa-file-pdf text-4xl text-gray-400 mb-2 animate-pulse"></i>
             <p class="text-gray-400 font-bold italic text-sm">Génération de l'aperçu sécurisé...</p>
           </div>
        </div>

        <div class="border-t-2 border-dashed border-gray-100 pt-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-black text-[#423B71] flex items-center gap-3">
              <div class="w-10 h-10 bg-[#B2E9E1] rounded-xl flex items-center justify-center text-[#423B71] shadow-sm"><i class="fas fa-file-signature"></i></div>
              Apposer votre signature
            </h2>
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">Étape finale de validation</p>
          </div>
          
          <SignaturePad @confirm="handleConfirmSignature" />
          
          <div class="mt-8 flex items-start gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div class="pt-1">
              <input type="checkbox" id="legal" checked class="w-4 h-4 rounded border-gray-300 text-[#8A79E2] focus:ring-[#8A79E2]">
            </div>
            <label for="legal" class="text-[11px] text-gray-500 font-medium leading-relaxed">
              En utilisant ce service, je consens à l'utilisation de la signature électronique. Je reconnais que cette signature, associée à mon adresse e-mail et aux données de ce document, constitue une preuve de mon engagement et possède la même valeur légale qu'une signature manuscrite (Art. 1367 du Code Civil).
            </label>
          </div>
        </div>
      </div>
      
      <div class="text-center">
        <p class="text-[#423B71] text-[10px] font-black uppercase tracking-widest opacity-60">Propulsé par Syali Academy • Sécurisé & Certifié</p>
      </div>
    </div>

    <div v-else-if="step === 'success'" class="bg-white p-12 rounded-[3rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] text-center max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div class="w-24 h-24 bg-green-100 text-green-500 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">
        <i class="fas fa-check"></i>
      </div>
      <h1 class="text-3xl font-black text-[#423B71] mb-3 tracking-tight">Félicitations !</h1>
      <p class="text-gray-500 font-medium text-lg leading-relaxed mb-10">Votre document a été signé avec succès. Une copie certifiée vient de vous être envoyée par e-mail.</p>
      <button @click="() => window.close()" class="w-full py-5 bg-[#423B71] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-black transition-all active:scale-95">
        Quitter cette page
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-duration: 0.5s;
  animation-fill-mode: both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slide-in-from-bottom-8 {
  from { opacity: 0; transform: translateY(2rem); }
  to { opacity: 1; transform: translateY(0); }
}
</style>