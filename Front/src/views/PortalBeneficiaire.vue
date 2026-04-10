<template>
  <div class="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col items-center justify-center p-4 md:p-10">
    
    <div class="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden relative">
      
      <div class="bg-[#1A1A1A] p-6 text-center text-white relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-[#D4AF37] opacity-20 rounded-full blur-3xl"></div>
        <h1 class="text-xl font-black italic tracking-tighter relative z-10">Karnain <span class="text-[#D4AF37] font-sans not-italic text-sm">Énergie</span></h1>
        <p class="text-xs text-gray-400 mt-1 uppercase tracking-widest relative z-10">Espace Sécurisé</p>
      </div>

      <div class="p-8">
        <h2 class="text-2xl font-black mb-1">Bonjour Jean,</h2>
        <p class="text-sm text-gray-500 font-medium mb-8">Voici l'avancement de votre prime énergie pour vos travaux avec <strong class="text-gray-900">SOCIETE TINO R-C</strong>.</p>

        <div class="relative pl-4 border-l-2 border-gray-100 mb-10 space-y-6">
          <div class="relative">
            <span class="absolute -left-[21px] top-1 w-3 h-3 bg-green-500 rounded-full ring-4 ring-white"></span>
            <p class="text-xs font-black uppercase tracking-widest text-green-600">1. Devis validé</p>
            <p class="text-xs text-gray-400 mt-0.5">Par l'installateur</p>
          </div>
          
          <div class="relative">
            <span class="absolute -left-[23px] top-0.5 w-4 h-4 bg-[#D4AF37] rounded-full ring-4 ring-white flex items-center justify-center animate-pulse"></span>
            <p class="text-xs font-black uppercase tracking-widest text-[#1A1A1A]">2. Action requise</p>
            <p class="text-xs text-gray-500 mt-0.5">Signature de l'Attestation</p>
          </div>

          <div class="relative opacity-40">
            <span class="absolute -left-[21px] top-1 w-3 h-3 bg-gray-300 rounded-full ring-4 ring-white"></span>
            <p class="text-xs font-black uppercase tracking-widest text-gray-600">3. Versement de la prime</p>
            <p class="text-xs text-gray-400 mt-0.5">Montant prévu : 1 450 €</p>
          </div>
        </div>

        <transition name="fade-slide" mode="out-in">
          <div v-if="!isSigned" class="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-gray-900">Attestation sur l'Honneur</h3>
                <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Document obligatoire (BAT-EN-101)</p>
              </div>
            </div>

            <button @click="showSignaturePad = true" class="w-full mt-5 bg-[#1A1A1A] text-white py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-md">
              Consulter & Signer
            </button>
          </div>

          <div v-else class="bg-green-50 border border-green-200 rounded-2xl p-6 text-center shadow-sm">
            <div class="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/30">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="text-lg font-black text-green-800">Dossier signé !</h3>
            <p class="text-sm text-green-600 mt-2 font-medium">Merci Jean. Votre dossier est maintenant transmis au bureau de contrôle avant le paiement.</p>
          </div>
        </transition>

      </div>
    </div>

    <div v-if="showSignaturePad" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col h-[80vh] md:h-auto">
        
        <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <span class="text-xs font-black uppercase tracking-widest text-gray-500">Signature requise</span>
          <button @click="showSignaturePad = false" class="text-gray-400 hover:text-gray-900"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>

        <div class="flex-1 overflow-y-auto p-6 bg-gray-100/50">
          <div class="bg-white border border-gray-200 p-4 rounded-xl text-[10px] text-gray-600 space-y-2 mb-4 shadow-sm">
            <p class="font-bold text-xs mb-2">Extrait de l'Attestation :</p>
            <p>Je soussigné(e) Jean Dupont, atteste sur l'honneur que les travaux d'isolation (BAT-EN-101) ont été réalisés par SOCIETE TINO R-C...</p>
            <div class="h-10 border-b border-dashed border-gray-300 mt-4 relative">
               <span class="absolute bottom-1 right-1 text-gray-300">Cliquer pour signer</span>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-white">
          <button @click="validateSignature" class="w-full bg-[#D4AF37] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-[#b5952f] transition-all shadow-lg shadow-[#D4AF37]/30">
            Je signe et je valide
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const showSignaturePad = ref(false);
const isSigned = ref(false);

const validateSignature = () => {
  showSignaturePad.value = false;
  // Petit délai artificiel pour faire "vrai"
  setTimeout(() => {
    isSigned.value = true;
  }, 300);
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>