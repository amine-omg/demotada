<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col items-center justify-center p-4 sm:p-8">
    
    <div class="w-full max-w-md bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden relative">
      
      <div class="bg-[#1A1A1A] p-8 text-center text-white relative overflow-hidden">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-[#D4AF37] opacity-20 rounded-full blur-3xl"></div>
        <div class="flex items-center justify-center gap-3 relative z-10">
          <div class="w-8 h-8 flex items-center justify-center">
            <img src="http://localhost:3000/uploads/horns.png" alt="Logo" class="w-full h-full object-contain filter brightness-200" />
          </div>
          <h1 class="text-2xl font-black italic tracking-tighter">Karnain <span class="text-[#D4AF37] font-sans not-italic text-sm">Sign</span></h1>
        </div>
      </div>

      <div class="p-8">
        <h2 class="text-2xl font-black mb-1 text-[#1A1A1A]">Bonjour Jean,</h2>
        <p class="text-sm text-gray-500 font-medium mb-8">Votre installateur <strong class="text-gray-900">SOCIETE TINO R-C</strong> vous demande de valider votre dossier de prime énergie.</p>

        <transition name="fade-slide" mode="out-in">
          <div v-if="!isSigned" class="space-y-6">
            
            <div class="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 shadow-sm">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-white text-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <div>
                  <h3 class="text-sm font-black text-gray-900">Attestation sur l'Honneur</h3>
                  <p class="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Opération : Isolation des planchers</p>
                  <button @click="viewDocument = !viewDocument" class="text-xs font-bold text-blue-600 mt-2 hover:underline">
                    {{ viewDocument ? 'Masquer le document' : 'Voir le document complet' }}
                  </button>
                </div>
              </div>

              <div v-if="viewDocument" class="mt-4 pt-4 border-t border-blue-100">
                <div class="bg-white p-4 rounded-xl border border-gray-200 text-[10px] text-gray-600 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  <p class="font-bold">Je soussigné(e) Jean Dupont,</p>
                  <p>Atteste que les travaux ont été réalisés conformément à la fiche BAT-EN-101...</p>
                  <p>Montant des travaux : 189 900,00 €</p>
                  <p>Surface : 2000 m²</p>
                </div>
              </div>
            </div>

            <button @click="showSignaturePad = true" class="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
              Signer le document
            </button>
          </div>

          <div v-else class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm">
            <div class="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 class="text-xl font-black text-green-900 mb-2">Signature validée !</h3>
            <p class="text-sm text-green-700 font-medium leading-relaxed">Merci. Votre dossier est désormais complet et transmis pour validation finale.</p>
            <p class="text-xs text-green-600 mt-6 font-bold uppercase tracking-widest">Vous pouvez fermer cette page.</p>
          </div>
        </transition>

      </div>
    </div>

    <div v-if="showSignaturePad" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl flex flex-col h-[70vh] sm:h-auto animate-slide-up">
        
        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <span class="text-xs font-black uppercase tracking-widest text-gray-500">Signature Électronique</span>
          <button @click="showSignaturePad = false" class="text-gray-400 hover:text-gray-900 bg-white rounded-full p-1 border shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="flex-1 p-6 bg-white flex flex-col items-center justify-center">
          <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-4">Dessinez votre signature</p>
          <div class="w-full h-48 bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center relative cursor-crosshair group hover:border-[#D4AF37] transition-colors">
            <span class="text-gray-300 group-hover:text-[#D4AF37]/50 font-medium italic select-none pointer-events-none">Signer ici</span>
            <div v-if="signatureDrawn" class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span class="font-[Brush_Script_MT,cursive] text-4xl text-blue-900 rotate-[-5deg]">J. Dupont</span>
            </div>
            <div class="absolute inset-0" @click="signatureDrawn = true"></div>
          </div>
          <button v-if="signatureDrawn" @click="signatureDrawn = false" class="text-[10px] text-gray-400 hover:text-red-500 uppercase font-bold mt-2">Effacer</button>
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <p class="text-[9px] text-gray-500 text-center mb-4 leading-relaxed">
            En cliquant sur Valider, j'accepte de signer électroniquement ce document conformément à la réglementation européenne eIDAS.
          </p>
          <button 
            @click="validateSignature" 
            :disabled="!signatureDrawn"
            class="w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg"
            :class="signatureDrawn ? 'bg-[#D4AF37] text-white hover:bg-[#b5952f] shadow-[#D4AF37]/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
          >
            Confirmer la signature
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const showSignaturePad = ref(false);
const viewDocument = ref(false);
const signatureDrawn = ref(false); // Gère le clic sur la zone de signature
const isSigned = ref(false);

const validateSignature = () => {
  showSignaturePad.value = false;
  setTimeout(() => {
    isSigned.value = true;
  }, 400);
};
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
</style>