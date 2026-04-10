<template>
  <div class="h-[100dvh] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-hidden relative">
    
    <TheHeader 
      :pageTitle="dossier ? `Certification Cockpit — ${dossier._id.substring(0, 8)}` : 'Chargement...'" 
      :showBackButton="true" 
      @back="$router.push('/mandataire')" 
      class="shrink-0"
    />

    <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center bg-white z-[100]">
      <div class="w-12 h-12 border-[3px] border-gray-100 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Sécurisation du flux...</p>
    </div>

    <template v-else-if="dossier">
      
      <div class="bg-white border-b-2 border-black px-4 md:px-8 py-4 shrink-0 z-40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 shadow-sm">
        
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 w-full md:w-auto">
          
          <div class="flex flex-col text-left group w-full md:w-auto">
            <span class="text-[8px] font-black uppercase tracking-widest text-[#D4AF37] mb-0.5">Bénéficiaire</span>
            <div class="flex items-center justify-between md:justify-start gap-2 w-full md:w-auto">
              <input v-if="isEditingClient" ref="clientInput" v-model="tempClientName" @blur="saveClientName" @keyup.enter="saveClientName"
                     class="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none bg-gray-50 border-b-2 border-[#D4AF37] outline-none w-full md:w-64" />
              <h1 v-else class="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none truncate max-w-[250px] md:max-w-none">
                {{ dossier.client || 'CLIENT À DÉFINIR' }}
              </h1>
              <button @click="startEditClient" class="p-1.5 hover:bg-gray-100 rounded-full transition-colors md:opacity-0 group-hover:opacity-100 shrink-0">
                <svg class="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37] md:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
            </div>
          </div>
          
          <div class="flex gap-2 md:gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar pb-1 md:pb-0">
             <div class="flex-1 md:flex-none bg-white border-2 border-black px-3 md:px-4 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-left shrink-0">
                <p class="text-[7px] font-black text-gray-400 uppercase">Volume</p>
                <p class="text-sm md:text-base font-black leading-none">{{ simulationData.kwhCumac }} <span class="text-[8px] md:text-[10px]">kWh</span></p>
             </div>
             <div class="flex-1 md:flex-none bg-black border-2 border-black px-3 md:px-4 py-1.5 rounded-xl shadow-[3px_3px_0px_0px_rgba(212,175,55,0.3)] text-left shrink-0">
                <p class="text-[7px] font-black text-gray-400 uppercase">Prime</p>
                <p class="text-sm md:text-base font-black text-[#D4AF37] leading-none">{{ simulationData.primeEstimee }} €</p>
             </div>
          </div>
        </div>
        
        <div class="w-full md:w-auto flex bg-gray-100 p-1 rounded-xl border-2 border-black overflow-x-auto hide-scrollbar">
          <button v-for="(tab, idx) in ['simulation', 'ah', 'signature']" :key="tab" @click="activeDoc = tab"
            class="flex-1 md:flex-none px-4 md:px-5 py-2 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
            :class="activeDoc === tab ? 'bg-black text-[#D4AF37] shadow-md' : 'text-gray-400 hover:text-black'">
            {{ idx + 1 }}. {{ tab === 'simulation' ? 'Audit RAI' : tab === 'ah' ? 'Mapping AH' : 'Signature' }}
          </button>
        </div>
      </div>

      <div class="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden p-4 md:p-5 gap-4 md:gap-5 w-full">
        
        <div class="w-full md:w-[62%] flex flex-col gap-4 md:gap-5 md:overflow-y-auto custom-scrollbar-hide pb-2 md:pb-10 px-0 md:px-1 shrink-0">
          
          <div class="bg-white border-2 border-black rounded-[1.5rem] md:rounded-xl p-5 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left relative overflow-hidden">
            
            <div v-if="activeDoc === 'simulation'" class="animate-fade-in space-y-6">
              <h2 class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 border-b border-gray-100 pb-4">
                <span class="w-6 h-6 md:w-7 md:h-7 bg-black text-[#D4AF37] rounded flex items-center justify-center text-[9px] md:text-[10px]">01</span>
                Contrôle Antériorité (RAI)
              </h2>

              <div class="flex flex-col md:grid md:grid-cols-2 gap-5 md:gap-8">
                <div class="space-y-4">
                  <div v-if="raiSent" class="p-5 bg-green-50 border-2 border-green-500 rounded-xl">
                    <p class="text-[8px] font-black text-green-600 uppercase mb-1">RAI Horodaté eIDAS</p>
                    <p class="text-sm md:text-base font-black tracking-tighter">{{ formatDateHours(raiDate) }}</p>
                  </div>
                  <button v-else @click="sendRAI" class="w-full bg-black text-[#D4AF37] py-4 md:py-5 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:scale-95">
                    Sceller l'incitation SMS
                  </button>
                  <p class="text-[9px] md:text-[10px] text-gray-400 leading-relaxed italic">Certification requise avant signature devis.</p>
                </div>

                <div class="bg-[#F5F2ED] border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col justify-center">
                   <p class="text-[8px] font-black text-gray-400 uppercase mb-3 text-center">Import preuve document</p>
                   <input type="date" v-model="manualRaiDate" class="w-full bg-white border-2 border-black rounded-lg p-2.5 text-[9px] md:text-[10px] font-black mb-3 outline-none" />
                   <button @click="triggerFileInput" class="w-full py-2.5 bg-white border-2 border-black rounded-lg text-[9px] font-black uppercase hover:bg-gray-100 active:scale-95 transition-transform">Importer</button>
                   <input type="file" ref="fileInputRef" class="hidden" @change="handleRaiUpload" />
                </div>
              </div>
            </div>

            <div v-if="activeDoc === 'ah'" class="animate-fade-in space-y-6 md:space-y-8">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 border-b border-gray-100 pb-4">
                <h2 class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <span class="w-6 h-6 md:w-7 md:h-7 bg-black text-[#D4AF37] rounded flex items-center justify-center text-[9px] md:text-[10px]">02</span>
                  Mapping Réglementaire
                </h2>
                <button @click="handleExtractAh" :disabled="isAnalyzing" class="w-full sm:w-auto px-4 py-3 sm:py-2 bg-black text-[#D4AF37] rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform">
                   <span v-if="isAnalyzing" class="w-3 h-3 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
                   Extraction IA
                </button>
              </div>

              <div class="flex flex-col md:grid md:grid-cols-2 gap-x-10 gap-y-6">
                <div class="space-y-4">
                  <h3 class="text-[9px] font-black uppercase text-[#D4AF37] tracking-widest">Calendrier de l'opération</h3>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1">
                      <label class="text-[8px] font-black text-gray-400 uppercase">Date Engagement</label>
                      <input type="date" v-model="formData.date_engagement" class="w-full bg-gray-50 border-2 border-black rounded-lg p-2.5 md:p-2 text-[9px] md:text-[10px] font-black" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[8px] font-black text-gray-400 uppercase">Début Travaux</label>
                      <input type="date" v-model="formData.date_debut_travaux" class="w-full bg-gray-50 border-2 border-black rounded-lg p-2.5 md:p-2 text-[9px] md:text-[10px] font-black" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[8px] font-black text-gray-400 uppercase">Date Facture</label>
                      <input type="date" v-model="formData.date_facture" class="w-full bg-gray-50 border-2 border-black rounded-lg p-2.5 md:p-2 text-[9px] md:text-[10px] font-black" />
                    </div>
                    <div class="space-y-1">
                      <label class="text-[8px] font-black text-gray-400 uppercase">Réf. Facture</label>
                      <input type="text" v-model="formData.ref_facture" placeholder="N° Facture" class="w-full bg-gray-50 border-2 border-black rounded-lg p-2.5 md:p-2 text-[9px] md:text-[10px] font-black" />
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-[9px] font-black uppercase text-[#D4AF37] tracking-widest">Spécifications</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input v-model="formData.surface" placeholder="Surface m²" class="bg-gray-50 border-2 border-black rounded-lg p-3 md:p-2 text-[9px] md:text-[10px] font-black" />
                    <input v-model="formData.resistance_thermique" placeholder="Résistance R" class="bg-gray-50 border-2 border-black rounded-lg p-3 md:p-2 text-[9px] md:text-[10px] font-black" />
                    <input v-model="formData.marque" placeholder="Marque" class="bg-gray-50 border-2 border-black rounded-lg p-3 md:p-2 text-[9px] md:text-[10px] font-black" />
                    <input v-model="formData.reference" placeholder="Référence" class="bg-gray-50 border-2 border-black rounded-lg p-3 md:p-2 text-[9px] md:text-[10px] font-black" />
                    <input v-model="formData.epaisseur" placeholder="Epaisseur (mm)" class="sm:col-span-2 bg-gray-50 border-2 border-black rounded-lg p-3 md:p-2 text-[9px] md:text-[10px] font-black" />
                  </div>
                </div>
              </div>

              <button @click="handleGenerateAH" :disabled="isGeneratingAH || !canGenerateAH" class="w-full py-4 md:py-5 bg-[#D4AF37] text-white rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 transition-all disabled:opacity-50">
                Générer et Sceller l'Attestation
              </button>
            </div>

            <div v-if="activeDoc === 'signature'" class="animate-fade-in space-y-6 text-left">
              <h2 class="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <span class="w-6 h-6 md:w-7 md:h-7 bg-black text-[#D4AF37] rounded flex items-center justify-center text-[9px] md:text-[10px]">03</span>
                Circuit Signature & Emmy
              </h2>
              <div class="flex flex-col md:grid md:grid-cols-2 gap-5 md:gap-8">
                <div class="p-5 md:p-6 bg-[#1A1A1A] rounded-xl border-2 border-black text-white space-y-5">
                   <p class="text-[8px] md:text-[9px] font-black uppercase text-[#D4AF37]">eIDAS SMS Protocol</p>
                   <button @click="sendSignature" :disabled="!isAhGenerated" class="w-full bg-[#D4AF37] text-black py-4 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 transition-all">
                      Lancer Signature
                   </button>
                </div>
                <div class="p-5 md:p-6 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between gap-4 md:gap-0">
                   <p class="text-[8px] md:text-[9px] font-black uppercase text-gray-400">Lot Dépôt</p>
                   <p class="text-xs md:text-sm font-black uppercase">LOT_CEE_2026_415</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border-2 border-black rounded-[1.5rem] md:rounded-xl p-4 md:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row justify-between items-start md:items-center text-left gap-4 md:gap-0">
             <div class="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-50 rounded-lg flex items-center justify-center text-lg md:text-xl border border-black/5 shrink-0">🏗️</div>
                <div class="min-w-0">
                   <p class="text-[7px] md:text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Installateur</p>
                   <p class="text-xs md:text-sm font-black text-[#1A1A1A] uppercase truncate w-full md:w-64">{{ dossier.installateur }}</p>
                   <span class="text-[7px] md:text-[8px] font-mono text-gray-400 uppercase">SIRET: {{ dossier.siret }}</span>
                </div>
             </div>
             <div class="bg-[#F5F2ED] px-3 py-2 md:px-4 md:py-2.5 rounded-lg border-2 border-black shrink-0 w-full md:w-auto flex md:block justify-between items-center">
                <p class="text-[7px] md:text-[8px] font-black uppercase text-[#D4AF37]">Réglementaire</p>
                <p class="text-[9px] md:text-[10px] font-black">Zone {{ dossier?.auditIa?.zoneClimatique || 'H1' }} / Tertiaire</p>
             </div>
          </div>
        </div>

        <div class="w-full md:w-[38%] flex flex-col gap-4 md:gap-5 shrink-0 pb-10 md:pb-10 px-0 md:px-1">
          
          <div class="bg-white border-2 border-black rounded-[1.5rem] md:rounded-xl p-4 md:p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left flex flex-col overflow-hidden md:min-h-[450px]">
            <h2 class="text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-gray-100 pb-3 flex justify-between items-center shrink-0">
               <span>Actifs Documentaires</span>
               <div class="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-black text-white text-[7px] font-black border border-black rounded uppercase shadow-sm">
                 ISO-9001 Scellé
               </div>
            </h2>
            
            <div class="flex overflow-x-auto md:grid md:grid-cols-3 gap-4 md:overflow-visible flex-1 items-start mt-4 pr-1 hide-scrollbar snap-x snap-mandatory pb-2 md:pb-0">
              
              <div class="w-[45vw] sm:w-[150px] md:w-auto shrink-0 snap-start flex flex-col gap-2 group cursor-pointer" @click="activeDoc = 'devis'; showDocModal = true">
                 <p class="text-[7px] font-black uppercase text-gray-400 truncate">Devis Client</p>
                 <div class="relative aspect-[21/29.7] w-full bg-white border-2 border-black rounded shadow-sm overflow-hidden group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all">
                    <iframe v-if="dossier.documentOriginalUrl" :src="dossier.documentOriginalUrl" class="w-[300%] h-[300%] border-none pointer-events-none scale-[0.33] origin-top-left"></iframe>
                    <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                 </div>
              </div>

              <div class="w-[45vw] sm:w-[150px] md:w-auto shrink-0 snap-start flex flex-col gap-2 group cursor-pointer" @click="activeDoc = 'ah'; showDocModal = true">
                 <p class="text-[7px] font-black uppercase text-gray-400 truncate">Attestation AH</p>
                 <div class="relative aspect-[21/29.7] w-full bg-white border-2 border-black rounded shadow-sm overflow-hidden group-hover:shadow-[4px_4px_0px_0px_rgba(212,175,55,0.2)] transition-all">
                    <img src="/ah.png" 
                         class="w-full h-full object-cover transition-all duration-300" 
                         :class="{'blur-[2px] opacity-60': !isAhGenerated, 'blur-0 opacity-100': isAhGenerated}" />
                    <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                    <div class="absolute inset-0 flex items-center justify-center p-2 text-center backdrop-blur-[1px]" :class="isAhGenerated ? 'hidden' : ''">
                       <span class="text-[6px] md:text-[7px] font-black text-black/40 uppercase bg-white/95 px-1.5 py-1.5 rounded border border-black/10 shadow-sm">Génération requise</span>
                    </div>
                    <div v-if="isAhGenerated" class="absolute bottom-2 right-2 bg-black text-[#D4AF37] px-1.5 py-0.5 rounded text-[5px] md:text-[6px] font-black uppercase shadow-lg">Scellé eIDAS</div>
                 </div>
              </div>

              <div class="w-[45vw] sm:w-[150px] md:w-auto shrink-0 snap-start flex flex-col gap-2 group cursor-pointer" @click="showCreateDocModal = true">
                 <p class="text-[7px] font-black uppercase text-gray-400">Action</p>
                 <div class="aspect-[21/29.7] w-full bg-[#F5F2ED] border-2 border-dashed border-black/20 rounded flex flex-col items-center justify-center gap-2 group-hover:border-black group-hover:bg-[#FDFBF7] transition-all duration-300 md:group-hover:-translate-y-1">
                    <div class="w-8 h-8 rounded-full border border-black flex items-center justify-center bg-white shadow-sm"><svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 4v16m8-8H4"/></svg></div>
                    <span class="text-[7px] font-black uppercase text-black/30">Nouveau Doc</span>
                 </div>
              </div>
            </div>
            
            <div v-if="dossier.auditIa?.decision" class="mt-4 pt-4 border-t border-gray-100 shrink-0">
               <div class="p-3 md:p-4 bg-[#FDFBF7] rounded-lg border border-black/5 shadow-inner text-left">
                  <p class="text-[7px] md:text-[8px] font-black uppercase text-[#D4AF37] mb-1 tracking-widest">Rapport Gemini IA</p>
                  <p class="text-[9px] md:text-[10px] font-bold italic leading-relaxed text-black/70 truncate">"{{ dossier.auditIa.decision }}"</p>
               </div>
            </div>
          </div>

          <div class="min-h-[220px] md:h-[210px] bg-[#F5F2ED] rounded-[1.5rem] md:rounded-xl p-4 md:p-5 text-left flex flex-col overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
             <div class="flex items-center justify-between mb-4 border-b border-black/10 pb-3 shrink-0">
                <p class="text-[9px] md:text-[11px] font-black uppercase text-black/60 tracking-widest flex items-center gap-2">
                   <span class="w-2 md:w-2.5 h-2 md:h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.3)]"></span>
                   Audit Log (ISO-9001)
                </p>
                <span class="hidden sm:block text-[7px] md:text-[8px] font-mono text-black/30 tracking-widest uppercase font-black">Secured SHA-256</span>
             </div>
             <div class="flex-1 overflow-y-auto custom-scrollbar-v space-y-4 md:space-y-5 px-1 pb-4">
                <div v-for="(log, idx) in isoLogs" :key="idx" class="flex gap-3 md:gap-4 border-l-2 border-black/10 pl-3 md:pl-4 ml-1">
                   <div class="min-w-0">
                      <p class="text-[10px] md:text-[11px] font-black text-black uppercase leading-none mb-1.5">{{ log.action }}</p>
                      <p class="text-[8px] md:text-[9px] font-mono text-black/40 uppercase font-bold flex items-center gap-2">
                        {{ formatDateHours(log.time) }}
                        <span class="w-1 md:w-1.5 h-1 md:h-1.5 bg-black/10 rounded-full"></span>
                        <span class="text-[#D4AF37] truncate">AGENT: {{ dossier._id.slice(0,4).toUpperCase() }}</span>
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </template>

    <Teleport to="body">
      <div v-if="showDocModal" class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10 animate-fade-in">
         <button @click="showDocModal = false" class="absolute top-4 right-4 md:top-5 md:right-10 bg-[#D4AF37] text-white p-3 md:p-4 rounded-full hover:rotate-90 transition-all duration-300 shadow-2xl z-20 active:scale-95">
            <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
         </button>
         <div class="w-full max-w-6xl h-full bg-white rounded-2xl md:rounded-xl overflow-hidden shadow-2xl relative border-2 border-black/10 mt-12 md:mt-0">
            <iframe v-if="currentDocUrl" :src="currentDocUrl" class="w-full h-full border-none"></iframe>
         </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showCreateDocModal" class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
        <div class="bg-white w-full max-w-[90vw] md:max-w-sm rounded-2xl md:rounded-xl shadow-2xl border-4 border-black overflow-hidden">
          <div class="p-5 md:p-6 border-b-2 border-black bg-gray-50 flex justify-between items-center text-left">
            <h2 class="text-lg md:text-xl font-black text-black uppercase tracking-tighter">Nouveau Doc</h2>
            <button @click="showCreateDocModal = false" class="text-black hover:rotate-90 transition-transform active:scale-95">
              <svg class="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-6 md:p-8 grid grid-cols-1 gap-3 md:gap-4 bg-white">
            <button v-for="type in ['Devis d\'engagement', 'Facture travaux', 'Attestation AH']" :key="type"
                    class="flex items-center justify-between p-4 md:p-5 bg-white border-2 border-black rounded-xl md:hover:bg-[#F5F2ED] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95">
              <span class="font-black uppercase text-[9px] md:text-[10px] tracking-widest text-left">{{ type }}</span>
              <svg class="w-4 h-4 md:w-5 md:h-5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.custom-scrollbar-v::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar-v::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
}
</style>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';

const route = useRoute();
const router = useRouter();

// --- ETATS ---
const dossier = ref(null);
const isLoading = ref(true);
const activeDoc = ref('simulation'); 
const showDocModal = ref(false);
const showCreateDocModal = ref(false);
const isAhGenerated = ref(false);
const isGeneratingAH = ref(false);
const isAnalyzing = ref(false);
const extractedData = ref(false);
const generatedAhUrl = ref(null);
const isoLogs = ref([]);
const manualRaiDate = ref('');
const raiSent = ref(false);
const raiDate = ref(null);
const timelineSteps = ['Simulation', 'Audit IA', 'Signature', 'Dépôt'];

// --- EDIT CLIENT ---
const isEditingClient = ref(false);
const tempClientName = ref('');
const clientInput = ref(null);

const startEditClient = () => {
  tempClientName.value = dossier.value.client || '';
  isEditingClient.value = true;
  nextTick(() => clientInput.value?.focus());
};

const saveClientName = async () => {
  if (!isEditingClient.value) return;
  if (tempClientName.value && tempClientName.value !== dossier.value.client) {
    const oldName = dossier.value.client;
    dossier.value.client = tempClientName.value;
    try {
      await api.put(`/api/demo/dossiers/${dossier.value._id}/status`, { client: tempClientName.value });
      isoLogs.value.unshift({ time: new Date(), action: `Client mis à jour : ${tempClientName.value}`, color: 'bg-blue-500' });
    } catch (e) { 
      dossier.value.client = oldName;
    }
  }
  isEditingClient.value = false;
};

// --- LOGIQUE MÉTIER ---
const simulationData = ref({ ficheCee: 'BAR-EN-101', profil: 'classique', kwhCumac: '150 000', primeEstimee: '1 200' });
const formData = ref({ nom_site: '', adresse: '', code_postal: '', ville: '', surface: '', resistance_thermique: '', epaisseur: '', marque: '', reference: '' });

const currentDocUrl = computed(() => {
  if (activeDoc.value === 'devis') return dossier.value?.documentOriginalUrl;
  return generatedAhUrl.value || '/template_ah.pdf';
});

const canGenerateAH = computed(() => formData.value.nom_site && formData.value.surface && formData.value.adresse);

const sendRAI = async () => {
  raiSent.value = true;
  raiDate.value = new Date();
  isoLogs.value.unshift({ time: raiDate.value, action: 'RAI SMS Horodaté', color: 'bg-green-500' });
  await api.put(`/api/demo/dossiers/${dossier.value._id}/status`, { compliance: { raiSent: true, raiDate: raiDate.value } });
};

const triggerFileInput = () => {
  const input = document.querySelector('input[type="file"]');
  input?.click();
};

const handleRaiUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const uploadData = new FormData();
  uploadData.append('file', file);
  try {
    const res = await api.post(`/api/demo/dossiers/${dossier.value._id}/upload-rai`, uploadData);
    dossier.value = res.data.data;
    raiSent.value = true;
    raiDate.value = new Date(dossier.value.compliance.raiDate);
    isoLogs.value.unshift({ time: new Date(), action: 'Document RAI Importé', color: 'bg-green-500' });
  } catch (e) { alert("Erreur upload"); }
};

const handleExtractAh = async () => {
  isAnalyzing.value = true;
  setTimeout(() => {
    extractedData.value = true;
    formData.value = { 
      nom_site: dossier.value.client, adresse: '16 allée Joinville', code_postal: '78260', ville: 'ACHERES', 
      surface: '2000', resistance_thermique: '7.5', epaisseur: '320', marque: 'ISOVER', reference: 'IBR 320' 
    };
    isAnalyzing.value = false;
    isoLogs.value.unshift({ time: new Date(), action: 'Mapping Gemini terminé', color: 'bg-[#D4AF37]' });
  }, 1500);
};

const handleGenerateAH = async () => {
  isGeneratingAH.value = true;
  try {
    const res = await api.post('/api/demo/generate-ah-pdf', { ...formData.value, nom_site: dossier.value.client, siret: dossier.value.siret }, { responseType: 'blob' });
    generatedAhUrl.value = window.URL.createObjectURL(new Blob([res.data]));
    isAhGenerated.value = true;
    isoLogs.value.unshift({ time: new Date(), action: 'AH Scellée Certifiée', color: 'bg-green-500' });
    await api.put(`/api/demo/dossiers/${dossier.value._id}/status`, { ahData: { ...formData.value, isGenerated: true } });
  } finally { isGeneratingAH.value = false; }
};

const sendSignature = async () => {
  await api.put(`/api/demo/dossiers/${dossier.value._id}/status`, { status: 'to_sign' });
  dossier.value.status = 'to_sign';
  isoLogs.value.unshift({ time: new Date(), action: 'Transmission eIDAS active', color: 'bg-[#D4AF37]' });
};

const fetchDossier = async () => {
  try {
    const res = await api.get(`/api/demo/dossiers/${route.params.id}`);
    dossier.value = res.data.data;
    if (dossier.value.compliance?.raiSent) {
      raiSent.value = true;
      raiDate.value = new Date(dossier.value.compliance.raiDate);
    }
    if (dossier.value.ahData?.isGenerated) {
       formData.value = { ...formData.value, ...dossier.value.ahData };
       isAhGenerated.value = true;
       api.post('/api/demo/generate-ah-pdf', { ...formData.value, nom_site: dossier.value.client }, { responseType: 'blob' }).then(pdfRes => {
           generatedAhUrl.value = window.URL.createObjectURL(new Blob([pdfRes.data]));
       });
    } else { handleExtractAh(); }
  } catch (error) { router.push('/mandataire'); } finally { isLoading.value = false; }
};

onMounted(async () => {
  await fetchDossier();
  if (dossier.value) {
    isoLogs.value.unshift({ time: new Date(), action: 'Ouverture Session Cockpit', color: 'bg-blue-500' });
  }
});

const formatDateHours = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('fr-FR', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', 
    day: '2-digit', month: '2-digit', year: 'numeric' 
  });
};
</script>
