<template>
  <div class="h-[100dvh] w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-hidden relative">
    
    <TheHeader pageTitle="Dossiers CEE" :showBackButton="false" class="shrink-0 w-full relative z-40 shadow-sm md:shadow-none" />

    <div class="md:hidden shrink-0 w-full flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 z-30 overflow-x-auto hide-scrollbar">
      
      <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="shrink-0 p-2.5 text-[#1A1A1A] bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 active:scale-95 transition-all shadow-sm">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>

      <button @click="showCreateModal = true; isMobileMenuOpen = false" class="shrink-0 h-10 bg-[#1A1A1A] hover:bg-black text-white font-black uppercase tracking-widest text-[9px] px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)] active:translate-y-0.5">
        <svg class="w-3.5 h-3.5 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Nouveau
      </button>

      <button @click="showActionsModal = true; isMobileMenuOpen = false" class="shrink-0 h-10 bg-white hover:bg-gray-50 text-[#1A1A1A] border-2 border-black font-black uppercase tracking-widest text-[9px] px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5">
        <svg class="w-3.5 h-3.5 text-[#1A1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        Actions
      </button>

    </div>

    <div class="flex-1 flex overflow-hidden w-full relative min-w-0">
      
      <div 
        v-if="isMobileMenuOpen" 
        @click="isMobileMenuOpen = false" 
        class="md:hidden absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      ></div>

      <aside 
        :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
        class="absolute md:relative inset-y-0 left-0 transform md:translate-x-0 transition-transform duration-300 ease-out z-50 md:z-10 w-[75%] max-w-[280px] md:w-64 bg-white border-r border-gray-200 flex flex-col py-6 px-4 shadow-[20px_0_40px_rgba(0,0,0,0.1)] md:shadow-[10px_0_30px_rgba(0,0,0,0.02)] shrink-0"
      >
        <div class="hidden md:flex flex-col gap-3 mb-8">
          <button @click="showCreateModal = true" class="w-full h-12 bg-[#1A1A1A] hover:bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all group shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(212,175,55,1)] hover:-translate-y-0.5">
            <svg class="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Nouveau Dossier
          </button>
          <button @click="showActionsModal = true" class="w-full h-12 bg-white hover:bg-gray-50 text-[#1A1A1A] border-2 border-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5">
            <svg class="w-4 h-4 text-[#1A1A1A] group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Actions Rapides
          </button>
        </div>

        <nav class="space-y-1 flex-1 overflow-y-auto custom-scrollbar">
          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 pl-3">Pilotage IA</p>
          <button @click="currentFilter = 'all'; isMobileMenuOpen = false" :class="currentFilter === 'all' ? 'bg-gray-100 text-[#1A1A1A] font-bold' : 'text-gray-500 hover:bg-gray-50'" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5" :class="currentFilter === 'all' ? 'text-[#D4AF37]' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              <span class="text-sm tracking-tight">Réception</span>
            </div>
            <span class="text-xs font-bold bg-gray-200 text-gray-700 py-0.5 px-2 rounded-full">{{ dossiers.length }}</span>
          </button>

          <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 mt-6 pl-3">Conformité PNCEE</p>
          <button @click="$router.push('/admin/validation'); isMobileMenuOpen = false" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            <span class="text-sm">SAS Validation <span v-if="pendingCount > 0" class="text-orange-500 font-black ml-1">({{ pendingCount }})</span></span>
          </button>
          <button @click="$router.push('/liasses'); isMobileMenuOpen = false" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <span class="text-sm">Générateur Liasses</span>
          </button>
          <button @click="$router.push('/fiscal'); isMobileMenuOpen = false" class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span class="text-sm">Vérification Fiscale</span>
          </button>
        </nav>
      </aside>

      <main class="flex-1 flex flex-col bg-white overflow-hidden relative w-full min-w-0">
        
        <div class="shrink-0 w-full overflow-x-auto hide-scrollbar flex md:grid md:grid-cols-4 gap-4 px-4 md:px-8 pt-5 md:pt-8 pb-5 snap-x snap-mandatory">
          
          <div class="w-[80vw] sm:w-[300px] md:w-auto shrink-0 snap-center md:snap-align-none bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
            <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Simulations</p>
            <p class="text-2xl font-black">{{ stats.simulation }} <span class="text-[10px] text-[#D4AF37] ml-1">PROSPECTS</span></p>
          </div>
          
          <div @click="currentFilter = 'anomaly'" class="w-[80vw] sm:w-[300px] md:w-auto shrink-0 snap-center md:snap-align-none bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(212,175,55,1)] cursor-pointer md:hover:-translate-y-1 transition-transform text-left">
            <p class="text-[9px] font-black uppercase text-[#D4AF37] tracking-widest mb-2">Alertes IA</p>
            <p class="text-2xl font-black text-[#D4AF37]">{{ stats.anomaly }} <span class="text-[10px] ml-1">BLOQUÉS</span></p>
          </div>
          
          <div class="w-[80vw] sm:w-[300px] md:w-auto shrink-0 snap-center md:snap-align-none bg-white border-2 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
            <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">En cours Signature</p>
            <p class="text-2xl font-black">{{ stats.to_sign }} <span class="text-[10px] text-gray-400 ml-1">DOSSIERS</span></p>
          </div>
          
          <div class="w-[80vw] sm:w-[300px] md:w-auto shrink-0 snap-center md:snap-align-none bg-[#1A1A1A] p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-left">
            <p class="text-[9px] font-black uppercase text-gray-400 tracking-widest mb-2">Volumes Déposés</p>
            <p class="text-2xl font-black text-[#D4AF37] tabular-nums">1.2 <span class="text-[10px] text-white ml-1">GWh</span></p>
          </div>

          <div class="w-2 md:hidden shrink-0"></div>
        </div>

        <div class="shrink-0 w-full h-14 border-b border-gray-100 flex items-center px-4 md:px-8 bg-white overflow-x-auto hide-scrollbar">
          <div class="flex items-center gap-4 md:gap-6 min-w-max">
            <div class="flex items-center gap-2">
              <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-black cursor-pointer" />
              <button @click="fetchDossiers" class="p-2 text-gray-400 hover:text-black transition-colors">
                <svg class="w-4 h-4" :class="{'animate-spin text-[#D4AF37]': isLoadingData}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </button>
            </div>
            <div class="h-4 w-px bg-gray-200"></div>
            <div class="flex gap-5">
               <button @click="currentFilter = 'all'" class="text-[9px] font-black uppercase tracking-widest whitespace-nowrap px-1 pb-1 transition-all" :class="currentFilter === 'all' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'">Tous</button>
               <button @click="currentFilter = 'simulation'" class="text-[9px] font-black uppercase tracking-widest whitespace-nowrap px-1 pb-1 transition-all" :class="currentFilter === 'simulation' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'">Simulations</button>
               <button @click="currentFilter = 'to_sign'" class="text-[9px] font-black uppercase tracking-widest whitespace-nowrap px-1 pb-1 transition-all" :class="currentFilter === 'to_sign' ? 'text-black border-b-2 border-black' : 'text-gray-400 hover:text-black'">Signatures</button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar bg-white relative w-full pb-20 md:pb-0">
          <div v-if="isLoadingData" class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <div class="w-10 h-10 border-2 border-gray-100 border-t-[#D4AF37] rounded-full animate-spin"></div>
          </div>

          <div 
            v-for="dossier in filteredDossiers" 
            :key="dossier._id"
            @click="goToDossier(dossier)"
            class="flex flex-col md:flex-row md:items-center px-4 md:px-8 py-5 border-b border-gray-50 hover:bg-gray-50/50 cursor-pointer group transition-all relative gap-3 md:gap-0"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1" :class="getStatusColor(dossier.status).border"></div>

            <div class="flex items-start justify-between w-full md:w-72 shrink-0 text-left">
              <div class="truncate pr-4">
                <p class="text-sm font-black text-[#1A1A1A] truncate group-hover:text-[#D4AF37] transition-colors">{{ dossier.installateur || 'Installateur CEE' }}</p>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate mt-1">{{ dossier.client || 'Client anonyme' }}</p>
              </div>
              <span class="md:hidden px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0" :class="getStatusColor(dossier.status).badge">
                {{ getStatusLabel(dossier.status) }}
              </span>
            </div>

            <div class="hidden md:flex items-center gap-3 w-40 shrink-0">
              <span class="px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :class="getStatusColor(dossier.status).badge">
                {{ getStatusLabel(dossier.status) }}
              </span>
            </div>

            <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0 pr-0 md:pr-4 text-left">
              <span class="text-[9px] md:text-[10px] font-black text-[#1A1A1A] shrink-0 bg-[#F5F2ED] px-2 py-0.5 rounded-md border border-black/5">{{ dossier.ficheCee || 'BAR-EN-101' }}</span>
              <span class="text-[10px] md:text-[11px] text-gray-500 truncate group-hover:text-black transition-colors">{{ dossier.auditIa?.decision || 'Analyse en attente...' }}</span>
            </div>

            <div class="hidden md:flex items-center gap-6 shrink-0">
              <span class="text-[10px] font-bold text-gray-300 w-24 text-right tabular-nums">{{ formatDate(dossier.createdAt) }}</span>
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-gray-300 group-hover:text-[#D4AF37] group-hover:bg-[#1A1A1A] transition-all shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 5l7 7-7 7"></path></svg>
              </div>
            </div>
          </div>

          <div v-if="filteredDossiers.length === 0 && !isLoadingData" class="flex flex-col items-center justify-center h-64 md:h-96 text-gray-300">
            <div class="text-5xl md:text-6xl mb-6 opacity-10">📂</div>
            <p class="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-center px-4">Aucun dossier</p>
          </div>
        </div>

      </main>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div class="bg-white w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border-2 border-black">
        <div class="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div class="text-left">
            <h2 class="text-lg md:text-xl font-black text-[#1A1A1A] tracking-tighter">Initialisation IA</h2>
            <p class="text-[8px] md:text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mt-1 md:mt-2">Nouveau Mandat CEE</p>
          </div>
          <button @click="showCreateModal = false" class="text-gray-400 hover:text-black transition-colors w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="p-6 md:p-10">
          <label class="w-full h-56 md:h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[1.5rem] md:rounded-[2rem] bg-gray-50/50 hover:bg-gray-100 hover:border-[#D4AF37] transition-all cursor-pointer relative overflow-hidden group">
            <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.png" class="hidden" :disabled="isUploading" />
            <div v-if="!isUploading" class="text-center px-4">
              <div class="text-5xl md:text-7xl mb-4 group-hover:scale-110 transition-transform">📄</div>
              <p class="font-black text-[#1A1A1A] uppercase text-[10px] md:text-xs tracking-widest">Déposez le Devis</p>
              <p class="text-[8px] md:text-[9px] text-gray-400 mt-2 uppercase">L'IA extrait l'intégralité des données</p>
            </div>
            <div v-else class="text-center z-10">
              <div class="w-12 h-12 md:w-16 md:h-16 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4 mx-auto"></div>
              <p class="text-[10px] md:text-xs font-black tracking-[0.3em] uppercase animate-pulse">Extraction...</p>
            </div>
            <div v-if="isUploading" class="absolute inset-x-0 h-1 bg-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,1)] top-0 animate-[scan_2s_infinite]"></div>
          </label>
        </div>
      </div>
    </div>

    <div v-if="showActionsModal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div class="bg-white w-full max-w-3xl rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border-2 border-black flex flex-col max-h-[90vh]">
        
        <div class="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div class="text-left">
            <h2 class="text-lg md:text-xl font-black text-[#1A1A1A] tracking-tighter">Actions Rapides</h2>
            <p class="text-[8px] md:text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mt-1 md:mt-2">Que souhaitez-vous faire ?</p>
          </div>
          <button @click="showActionsModal = false" class="text-gray-400 hover:text-black transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white overflow-y-auto">
          
          <button @click="showActionsModal = false; showCreateModal = true" class="p-5 md:p-6 border-2 border-gray-100 rounded-2xl hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-left group">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-[#F5F2ED] text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors">
              <span class="text-xl md:text-2xl">🤖</span>
            </div>
            <h3 class="font-black text-xs md:text-sm text-[#1A1A1A] uppercase tracking-wider">Scanner un Devis (IA)</h3>
            <p class="text-[9px] md:text-[10px] text-gray-500 font-bold mt-1">Créer un dossier CEE à partir d'un PDF.</p>
          </button>

          <button @click="showActionsModal = false; $router.push('/demo-cee')" class="p-5 md:p-6 border-2 border-gray-100 rounded-2xl hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-left group">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-[#D4AF37] rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors">
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 class="font-black text-xs md:text-sm text-[#1A1A1A] uppercase tracking-wider">Nouvelle Simulation</h3>
            <p class="text-[9px] md:text-[10px] text-gray-500 font-bold mt-1">Lancer le simulateur pour estimer une prime.</p>
          </button>

          <button @click="showActionsModal = false; $router.push('/entreprises')" class="p-5 md:p-6 border-2 border-gray-100 rounded-2xl hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-left group">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-400 group-hover:bg-black group-hover:text-white rounded-xl flex items-center justify-center mb-3 md:mb-4 transition-colors">
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            </div>
            <h3 class="font-black text-xs md:text-sm text-[#1A1A1A] uppercase tracking-wider">Ajouter Entreprise</h3>
            <p class="text-[9px] md:text-[10px] text-gray-500 font-bold mt-1">Recherche SIRET, vérification RGE via l'ADEME.</p>
          </button>

          <button class="p-5 md:p-6 border-2 border-dashed border-gray-200 rounded-2xl opacity-70 hover:opacity-100 transition-opacity text-left group">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-gray-50 text-gray-300 rounded-xl flex items-center justify-center mb-3 md:mb-4">
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
            </div>
            <h3 class="font-black text-xs md:text-sm text-gray-400 uppercase tracking-wider">Inviter Partenaire</h3>
            <p class="text-[9px] md:text-[10px] text-gray-400 font-bold mt-1">Bureau d'études ou artisan. <span class="text-[#D4AF37]">À venir</span></p>
          </button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';

const router = useRouter();

const currentFilter = ref('all');
const dossiers = ref([]);
const isLoadingData = ref(false);
const isUploading = ref(false);

const showCreateModal = ref(false);
const showActionsModal = ref(false); 
const isMobileMenuOpen = ref(false);

const fetchDossiers = async () => {
  isLoadingData.value = true;
  try {
    const response = await api.get('/api/demo/dossiers');
    dossiers.value = response.data.data;
  } catch (error) {
    console.error("Erreur dossiers:", error);
  } finally {
    isLoadingData.value = false;
  }
};
const pendingCount = ref(0);

// NOUVELLE FONCTION : Va chercher le nombre de partenaires en attente
const fetchPendingCount = async () => {
  try {
    const res = await api.get('/api/demo/entreprises');
    // On filtre celles qui sont en attente et on compte
    const enAttente = res.data.data.filter(e => e.statutValidation === 'en_attente');
    pendingCount.value = enAttente.length;
  } catch (error) {
    console.error("Erreur lors de la récupération des attentes :", error);
  }
};

// ON RÉUNIT TOUT ICI
onMounted(() => {
  fetchDossiers();
  fetchPendingCount(); // On ajoute l'appel ici !
});

const stats = computed(() => ({
  all: dossiers.value.length,
  simulation: dossiers.value.filter(d => d.status === 'simulation' || d.status === 'draft').length,
  anomaly: dossiers.value.filter(d => d.status === 'anomaly').length,
  to_sign: dossiers.value.filter(d => d.status === 'to_sign').length,
}));

const anomalyCount = computed(() => stats.value.anomaly);

const filteredDossiers = computed(() => {
  if (currentFilter.value === 'all') return dossiers.value;
  if (currentFilter.value === 'simulation') return dossiers.value.filter(d => d.status === 'simulation' || d.status === 'draft');
  return dossiers.value.filter(d => d.status === currentFilter.value);
});

const goToDossier = (dossier) => {
  router.push(`/dossier/${dossier._id}`);
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  isUploading.value = true;
  const fd = new FormData();
  fd.append('file', file);
  try {
    const response = await api.post('/api/demo/analyze-quote-full', fd).catch(() => api.post('/api/demo/analyze-quote', fd));
    const nouveauDossier = response.data.data;
    setTimeout(() => {
      showCreateModal.value = false;
      isUploading.value = false;
      router.push(`/dossier/${nouveauDossier._id}`);
    }, 1800);
  } catch (error) {
    alert("Serveur d'analyse momentanément indisponible.");
    isUploading.value = false;
  }
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '---';

const getStatusLabel = (s) => ({
  simulation: 'Simulation',
  draft: 'Simulation',
  anomaly: 'Alerte IA',
  to_sign: 'Signature',
  validated: 'Terminé'
}[s] || s);

const getStatusColor = (s) => ({
  simulation: { border: 'bg-black', badge: 'bg-white text-black border-black' },
  draft: { border: 'bg-black', badge: 'bg-white text-black border-black' },
  anomaly: { border: 'bg-[#D4AF37]', badge: 'bg-[#F5F2ED] text-[#D4AF37] border-[#D4AF37]' },
  to_sign: { border: 'bg-black', badge: 'bg-[#1A1A1A] text-white border-black shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)]' },
  validated: { border: 'bg-black', badge: 'bg-white text-[#D4AF37] border-black' }
}[s] || { border: 'bg-gray-200', badge: 'bg-white text-gray-400' });
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>