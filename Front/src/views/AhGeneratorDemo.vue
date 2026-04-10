<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'h-screen'" class="w-full max-w-[100vw] min-w-0 bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col relative overflow-hidden">
    
    <TheHeader pageTitle="Démo AH" :showBackButton="false" class="shrink-0 w-full z-40" />

    <div v-if="isMobile" class="flex-1 flex flex-col w-full overflow-hidden min-w-0 bg-gray-50/50">
      
     <div class="h-[35vh] w-full bg-white border-b-2 border-black shrink-0 relative overflow-hidden z-20 shadow-sm">
        
        <label 
          v-if="!pdfPreviewUrl"
          class="absolute inset-4 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer active:scale-95"
        >
          <input type="file" @change="uploadDocument" accept=".pdf,.jpg,.png" class="hidden" />
          <div class="text-5xl mb-2 opacity-80">📄</div>
          <h2 class="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-1">Glissez le devis</h2>
          <p class="text-[8px] font-bold text-[#D4AF37] uppercase tracking-widest text-center px-2">Génération auto AH</p>
        </label>

        <div v-else class="absolute inset-0 flex flex-col bg-gray-100">
          <div class="absolute top-0 left-0 w-full p-3 flex justify-between items-center bg-gradient-to-b from-white/90 to-transparent z-20">
            <span class="text-[8px] font-black uppercase tracking-widest text-[#1A1A1A] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200">Doc Source</span>
            <button @click="resetDemo" class="text-[8px] font-bold text-gray-500 hover:text-[#1A1A1A] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-gray-200 active:scale-95">Nouveau</button>
          </div>
          
          <iframe :src="pdfPreviewUrl" class="w-full h-full border-none z-10 pointer-events-none" title="Aperçu"></iframe>
          
          <div v-if="isAnalyzing" class="absolute inset-0 z-30 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            <div class="w-12 h-12 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4 shadow-lg shrink-0"></div>
            <p class="text-[10px] font-black tracking-[0.2em] text-[#1A1A1A] uppercase animate-pulse text-center">Extraction Gemini...</p>
            <p class="text-[8px] text-[#D4AF37] uppercase tracking-widest mt-2 font-bold text-center">Pré-remplissage CERFA</p>
          </div>
          <div v-if="isAnalyzing" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.8)] top-0 animate-[scan_2s_ease-in-out_infinite] z-40"></div>
        </div>
      </div>

      <div class="flex-1 w-full overflow-y-auto custom-scrollbar-hide relative z-10 pb-6">
        
        <div v-if="!extractedData && !isAnalyzing" class="h-full flex flex-col items-center justify-center opacity-30 p-6">
          <svg class="w-16 h-16 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          <p class="text-[9px] font-black uppercase tracking-widest text-gray-500 text-center">En attente document</p>
        </div>

        <div v-if="extractedData || isAnalyzing" class="p-4 sm:p-6 space-y-6" :class="{'opacity-40 pointer-events-none': isAnalyzing}">
          
          <div class="border-b-2 border-[#1A1A1A] pb-4 bg-white p-4 rounded-xl border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <div class="flex justify-between items-start mb-2">
              <div class="text-[7px] font-black uppercase tracking-widest text-gray-500 text-center border border-gray-300 p-1.5 rounded">
                Ministère de la<br>Transition Énergétique
              </div>
              <div class="text-right">
                <span class="text-[8px] font-black uppercase tracking-widest bg-gray-100 px-2 py-1 rounded-full text-gray-600">BAT-EN-101</span>
              </div>
            </div>
            <h2 class="text-sm sm:text-base font-black uppercase tracking-tighter text-[#1A1A1A] text-center mt-3">
              Annexe 1 <span class="block sm:inline">fiche standardisée</span>
            </h2>
            <p class="text-[9px] text-center text-[#D4AF37] font-bold uppercase tracking-widest mt-1">Pré-rempli IA</p>
          </div>

          <div class="space-y-4">
            
            <div class="bg-white p-4 sm:p-5 rounded-[1.5rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 class="text-[9px] font-black text-[#1A1A1A] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Général</h3>
              
              <div class="space-y-3">
                <div class="flex flex-col sm:flex-row gap-3 w-full">
                  <div class="w-full sm:w-1/3 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Engagement <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.date_engagement" type="date" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                  <div class="w-full sm:flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Nom / Copro <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.nom_site" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                </div>

                <div class="space-y-1 w-full">
                  <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                    Adresse <span class="text-[#D4AF37]">IA</span>
                  </label>
                  <input v-model="formData.adresse" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                </div>

                <div class="flex gap-3 w-full">
                  <div class="w-1/3 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      CP <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.code_postal" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Ville <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.ville" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white p-4 sm:p-5 rounded-[1.5rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 class="text-[9px] font-black text-[#1A1A1A] uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Caractéristiques Isolant</h3>
              
              <div class="space-y-3">
                <div class="flex gap-3 w-full">
                  <div class="flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Surface (m²) <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.surface" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Résist. (R) <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.resistance_thermique" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs" :class="{'ring-1 ring-amber-400': !formData.resistance_thermique}"/>
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Épais. (mm) <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.epaisseur" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 w-full">
                  <div class="flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Marque <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.marque" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                  <div class="flex-1 space-y-1">
                    <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                      Référence <span class="text-[#D4AF37]">IA</span>
                    </label>
                    <input v-model="formData.reference" class="w-full bg-gray-50 border border-gray-300 focus:border-black rounded-lg p-2.5 text-[#1A1A1A] font-bold outline-none text-xs"/>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div class="mt-4 flex flex-col gap-3 w-full">
            <button @click="downloadPdf" class="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)] active:translate-y-0.5 active:shadow-none flex items-center justify-center gap-2 text-white bg-[#1A1A1A]">
              Générer Attestation PDF
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </button>
            <button @click="resetDemo" class="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-black uppercase tracking-widest active:bg-gray-100 transition-all text-[9px] sm:text-[10px]">
              Annuler
            </button>
          </div>

        </div>
      </div>
    </div>


    <div v-else class="flex-1 flex p-6 md:p-10 gap-8 h-[calc(100vh-6rem)] overflow-hidden w-full min-w-0">
      
      <div class="w-1/2 flex flex-col bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden relative shrink-0">
        
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

      <div class="w-1/2 flex flex-col bg-white rounded-[2.5rem] border border-gray-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-8 overflow-y-auto custom-scrollbar relative shrink-0">
        
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
import { ref, onMounted, onUnmounted } from 'vue';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue'; 

const isAnalyzing = ref(false);
const extractedData = ref(null);
const pdfPreviewUrl = ref(null);



const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // 768px = point de bascule standard (tablette/mobile)
};


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

onMounted(() => {
  checkMobile(); // 1. Fait la vérification au premier chargement de la page
  window.addEventListener('resize', checkMobile); // 2. Écoute si l'écran change de taille
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile); // 3. Fait le ménage quand on quitte la page
});
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