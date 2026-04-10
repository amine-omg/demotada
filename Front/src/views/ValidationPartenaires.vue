<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; // Ajout de onUnmounted ici
import api from '/services/api'; 
import TheHeader from '../components/TheHeader.vue';

const pendingEntreprises = ref([]);
const selectedEnt = ref(null);
const isLoading = ref(true);
const isProcessing = ref(false);

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024; // Point de bascule pour la grille desktop
};

const fetchPending = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/api/demo/entreprises');
    // On ne garde que les entreprises en attente de validation
    pendingEntreprises.value = res.data.data.filter(e => e.statutValidation === 'en_attente');
  } catch (error) {
    console.error("Erreur chargement attente:", error);
  } finally {
    isLoading.value = false;
  }
};

const selectEntreprise = (ent) => {
  selectedEnt.value = ent;
};

const traiterDemande = async (nouveauStatut) => {
  if (!selectedEnt.value) return;
  
  isProcessing.value = true;
  try {
    await api.put(`/api/demo/entreprises/${selectedEnt.value._id}`, {
      statutValidation: nouveauStatut
    });
    
    // Mise à jour locale
    pendingEntreprises.value = pendingEntreprises.value.filter(e => e._id !== selectedEnt.value._id);
    selectedEnt.value = null;
    
  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    alert("Une erreur est survenue.");
  } finally {
    isProcessing.value = false;
  }
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchPending();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
</script>

<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'min-h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden overflow-y-hidden relative min-w-0">
    
    <TheHeader 
      :pageTitle="isMobile && selectedEnt ? 'Examen Partenaire' : 'SAS de Validation'" 
      :showBackButton="isMobile && !!selectedEnt" 
      @back="selectedEnt = null"
      class="shrink-0 w-full z-40"
    />

    <div v-if="isMobile" class="flex-1 flex flex-col overflow-hidden w-full relative min-w-0 bg-[#F8F9FA]">
      
      <div v-if="!selectedEnt" class="flex-1 flex flex-col overflow-y-auto p-4 pb-24 custom-scrollbar-hide min-w-0">
        <div class="mb-6 shrink-0 min-w-0">
          <div class="flex justify-between items-center bg-[#1A1A1A] p-5 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div class="min-w-0">
              <h2 class="text-lg font-black text-white tracking-tighter truncate uppercase">En attente</h2>
              <p class="text-[8px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mt-0.5 truncate">Contrôle avant activation</p>
            </div>
            <span class="bg-white text-black font-black text-xs px-3 py-1.5 rounded-xl shrink-0">{{ pendingEntreprises.length }}</span>
          </div>
        </div>

        <div v-if="isLoading" class="flex justify-center py-12 min-w-0">
          <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
        </div>

        <div v-else-if="pendingEntreprises.length === 0" class="flex-1 flex flex-col items-center justify-center opacity-40 py-20 min-w-0">
          <div class="text-5xl mb-4">☕</div>
          <p class="text-[9px] font-black uppercase tracking-widest text-gray-500">Aucune demande</p>
        </div>

        <div v-else class="flex flex-col gap-4 min-w-0">
          <button 
            v-for="ent in pendingEntreprises" 
            :key="ent._id"
            @click="selectEntreprise(ent)"
            class="w-full text-left p-4 bg-white border-2 border-black rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden active:scale-[0.98] transition-all min-w-0"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="ent.type === 'installateur' ? 'bg-[#D4AF37]' : (ent.type === 'bureau_etude' ? 'bg-blue-400' : 'bg-gray-300')"></div>
            <div class="flex justify-between items-start gap-2 min-w-0 pl-1">
              <div class="min-w-0 flex-1">
                <p class="font-black text-sm uppercase text-[#1A1A1A] truncate">{{ ent.raisonSociale }}</p>
                <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">
                  {{ ent.type === 'bureau_etude' ? "Bureau d'études" : ent.type === 'installateur' ? "Installateur PRO" : "Client Tertiaire" }}
                </p>
              </div>
              <span class="w-2 h-2 rounded-full bg-orange-400 animate-pulse shrink-0"></span>
            </div>
            <div class="mt-3 flex items-center gap-3 text-[8px] font-black uppercase tracking-widest text-gray-400 min-w-0 pl-1">
              <span class="flex items-center gap-1 truncate"><svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/></svg>{{ ent.siret }}</span>
              <span class="flex items-center gap-1 truncate" v-if="ent.ville"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-width="2"/></svg>{{ ent.ville }}</span>
            </div>
          </button>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col overflow-hidden w-full min-w-0 bg-white relative">
        <div class="flex-1 overflow-y-auto p-4 pb-32 custom-scrollbar-hide min-w-0">
          
          <div class="mb-6 min-w-0">
             <div class="flex items-center gap-2 mb-3">
                <span class="px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shrink-0">
                  <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>EN ATTENTE
                </span>
                <span class="text-[9px] font-black text-[#D4AF37] bg-[#1A1A1A] px-2 py-1 rounded-lg uppercase tracking-widest truncate shrink-0">{{ selectedEnt.type.replace('_', ' ') }}</span>
             </div>
             <h1 class="text-2xl font-black uppercase tracking-tighter text-[#1A1A1A] leading-tight break-words">{{ selectedEnt.raisonSociale }}</h1>
             <p class="text-[10px] font-bold text-gray-500 mt-2 truncate">{{ selectedEnt.adresse || 'Adresse N/C' }}, {{ selectedEnt.ville }}</p>
          </div>

          <div v-if="selectedEnt.estActive === false" class="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 shrink-0">
             <div class="text-red-600 shrink-0"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
             <p class="text-[9px] font-black text-red-700 uppercase leading-snug">Société Radiée / Cessation. Cette demande doit être rejetée.</p>
          </div>

          <div class="space-y-6 min-w-0">
             <div class="bg-gray-50 border-2 border-black rounded-[1.5rem] p-5 space-y-4 min-w-0">
                <p class="text-[8px] font-black uppercase text-gray-400 border-b border-gray-200 pb-2">Identité Légale</p>
                <div>
                   <label class="block text-[7px] font-black uppercase text-gray-400 mb-1">SIRET</label>
                   <p class="font-mono text-xs font-black text-[#1A1A1A] truncate">{{ selectedEnt.siret }}</p>
                </div>
                <div>
                   <label class="block text-[7px] font-black uppercase text-gray-400 mb-1">Activité NAF</label>
                   <p class="text-[9px] font-bold text-[#1A1A1A] leading-tight break-words">{{ selectedEnt.codeNaf }} - {{ selectedEnt.libelleNaf || 'N/C' }}</p>
                </div>
             </div>

             <div v-if="selectedEnt.type !== 'client_tertiaire'" class="bg-white border-2 border-black rounded-[1.5rem] p-5 space-y-4 min-w-0 shadow-sm">
                <p class="text-[8px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2">Qualité & Risques</p>
                <div class="flex items-center gap-4">
                   <div class="w-12 h-12 rounded-full border-4 flex items-center justify-center shrink-0" :class="selectedEnt.auditQualite?.noteMoyenne >= 8 ? 'border-green-400 text-green-600' : 'border-gray-200 text-gray-400'">
                      <span class="text-sm font-black">{{ selectedEnt.auditQualite?.noteMoyenne || '-' }}</span>
                   </div>
                   <div class="min-w-0">
                      <p class="font-black uppercase text-[10px] text-[#1A1A1A] truncate">{{ selectedEnt.auditQualite?.statut || 'Nouveau' }}</p>
                      <p class="text-[8px] text-gray-400 font-bold uppercase truncate">Zéro Fraude Détectée</p>
                   </div>
                </div>
             </div>

             <div v-if="selectedEnt.qualifications?.rgeValide" class="bg-green-50 border-2 border-green-500 rounded-[1.5rem] p-5 space-y-4 min-w-0">
                <div class="flex items-center gap-2 shrink-0">
                   <div class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg></div>
                   <h3 class="text-[10px] font-black text-green-800 uppercase tracking-widest">RGE Validé API ADEME</h3>
                </div>
                <div v-for="(certif, idx) in selectedEnt.qualifications?.details" :key="idx" class="bg-white/80 border border-green-200 rounded-xl p-3">
                   <p class="text-[9px] font-black text-green-900 uppercase truncate">{{ certif.domaine }}</p>
                   <p class="text-[8px] font-bold text-green-600 mt-0.5 truncate">{{ certif.organisme }}</p>
                </div>
             </div>
          </div>
        </div>

        <div class="absolute bottom-0 left-0 w-full p-4 bg-white border-t-2 border-black flex gap-3 z-50">
          <button @click="traiterDemande('refuse')" :disabled="isProcessing" class="flex-1 bg-white text-red-600 border-2 border-red-200 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest active:bg-red-50">Rejeter</button>
          <button @click="traiterDemande('valide')" :disabled="isProcessing" class="flex-[2] bg-black text-green-400 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2">
            <span v-if="isProcessing" class="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin shrink-0"></span>
            <span v-else class="truncate">Valider & Activer</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 max-w-[1400px] mx-auto w-full p-8 mt-4 grid grid-cols-12 gap-8 h-[calc(100vh-6rem)]">
      
      <div class="col-span-5 bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden h-full relative z-10">
        <div class="p-6 border-b-2 border-black bg-[#1A1A1A] text-white">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-black tracking-tighter">Partenaires en attente</h2>
              <p class="text-[9px] text-[#D4AF37] font-black uppercase tracking-[0.2em] mt-1">À contrôler avant activation</p>
            </div>
            <span class="bg-white text-black font-black text-sm px-3 py-1 rounded-lg shadow-sm border border-black/10">
              {{ pendingEntreprises.length }}
            </span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar p-4 bg-gray-50/50">
          <div v-if="isLoading" class="flex justify-center py-10">
            <div class="w-8 h-8 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin"></div>
          </div>

          <div v-else-if="pendingEntreprises.length === 0" class="text-center py-16 opacity-50">
            <div class="text-5xl mb-4">☕</div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-500">Aucune demande en attente</p>
          </div>

          <button 
            v-for="ent in pendingEntreprises" 
            :key="ent._id"
            @click="selectEntreprise(ent)"
            class="w-full text-left p-4 mb-3 border-2 rounded-xl transition-all group relative overflow-hidden"
            :class="selectedEnt?._id === ent._id ? 'border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-1' : 'border-transparent bg-white shadow-sm hover:border-gray-300'"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="ent.type === 'installateur' ? 'bg-[#D4AF37]' : (ent.type === 'bureau_etude' ? 'bg-blue-400' : 'bg-gray-300')"></div>

            <div class="flex justify-between items-start pl-2">
              <div class="flex items-center gap-2 flex-wrap pr-4">
                <p class="font-black text-sm uppercase truncate max-w-[200px]" :class="selectedEnt?._id === ent._id ? 'text-black' : 'text-gray-800'">{{ ent.raisonSociale }}</p>
                
                <span v-if="ent.qualifications?.rgeValide" class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0">
                  <svg class="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                  RGE ({{ ent.qualifications?.details?.length || 1 }})
                </span>
              </div>
              <span class="w-2 h-2 rounded-full bg-orange-400 animate-pulse mt-1 shrink-0"></span>
            </div>
            
            <div class="pl-2 mt-2">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{{ ent.type === 'bureau_etude' ? "Bureau d'études" : ent.type === 'installateur' ? "Installateur PRO" : "Client Tertiaire" }}</p>
              <div class="mt-2 flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-gray-400">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ ent.siret }}
                </span>
                <span class="flex items-center gap-1" v-if="ent.ville">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  {{ ent.ville }}
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="col-span-7 bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full relative overflow-hidden z-0">
        
        <div v-if="!selectedEnt" class="flex-1 flex flex-col items-center justify-center text-gray-300 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwwLDAsMC4wNSkiLz48L3N2Zz4=')]">
          <div class="w-20 h-20 bg-white border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-4">
             <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </div>
          <p class="text-[10px] font-black uppercase tracking-[0.3em]">Sélectionnez un dossier à examiner</p>
        </div>

        <template v-else>
          <div class="p-8 border-b-2 border-black bg-white shrink-0 relative z-10">
            <div class="absolute top-8 right-8 text-right flex flex-col items-end gap-2">
              <span class="inline-block px-3 py-1.5 bg-[#1A1A1A] text-[#D4AF37] rounded-lg text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(212,175,55,1)]">
                {{ selectedEnt.type.replace('_', ' ') }}
              </span>
            </div>
            
            <div class="flex items-center gap-3 mb-3">
              <span class="px-2.5 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                En attente de validation
              </span>
              <span class="text-[10px] font-bold text-gray-400">Inscrit le {{ new Date(selectedEnt.createdAt).toLocaleDateString('fr-FR') }}</span>
            </div>
            
            <h1 class="text-3xl font-black uppercase tracking-tighter text-[#1A1A1A] max-w-[80%] leading-tight">{{ selectedEnt.raisonSociale }}</h1>
            
            <p class="text-xs font-bold text-gray-500 mt-2 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              {{ selectedEnt.adresse || 'Adresse non précisée' }}, {{ selectedEnt.codePostal }} {{ selectedEnt.ville }}
            </p>
          </div>

          <div class="flex-1 overflow-y-auto p-8 bg-[#F8F9FA] relative">
            <div v-if="selectedEnt.estActive === false" class="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl shadow-[6px_6px_0px_0px_rgba(220,38,38,0.2)] flex items-start gap-4 animate-fade-in">
              <div class="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <h3 class="text-sm font-black text-red-700 uppercase tracking-widest">Alerte : Société Radiée / Fermée</h3>
                <p class="text-xs font-bold text-red-600 mt-1">L'API de l'État indique que cet établissement est en statut "Cessation d'activité". L'inscription de ce partenaire doit être rejetée.</p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8">
              <div class="space-y-8">
                <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-5 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/></svg>
                    Identité Légale & Activité
                  </h2>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">SIRET (INSEE)</label>
                      <div class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm font-black font-mono text-[#1A1A1A]">{{ selectedEnt.siret }}</div>
                    </div>
                    <div>
                      <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Code NAF & Activité</label>
                      <div class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs font-bold text-[#1A1A1A]">
                        {{ selectedEnt.codeNaf ? `${selectedEnt.codeNaf} - ${selectedEnt.libelleNaf || ''}` : 'Non renseigné' }}
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedEnt.type === 'installateur' || selectedEnt.type === 'bureau_etude'" class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-5 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Audit & Qualité
                  </h2>
                  <div class="flex items-center gap-5">
                    <div class="w-16 h-16 rounded-full border-[3px] flex items-center justify-center bg-gray-50"
                        :class="selectedEnt.auditQualite?.noteMoyenne >= 8 ? 'border-green-400 text-green-600' : (selectedEnt.auditQualite?.noteMoyenne >= 5 ? 'border-orange-400 text-orange-600' : 'border-gray-200 text-gray-400')">
                      <span class="text-xl font-black tracking-tighter">{{ selectedEnt.auditQualite?.noteMoyenne || '-' }}</span>
                      <span class="text-[10px] font-bold text-gray-400 mt-1.5">/10</span>
                    </div>
                    <div>
                      <p class="font-black uppercase text-sm text-[#1A1A1A]">{{ selectedEnt.auditQualite?.statut || 'Nouvel Inscrit - Non évalué' }}</p>
                      <p class="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Aucun historique de fraude détecté.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-8">
                <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" v-if="selectedEnt.contacts && selectedEnt.contacts.length > 0">
                  <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-5 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    Contact Principal
                  </h2>
                  <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Prénom Nom</label>
                        <div class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-[#1A1A1A] truncate">{{ selectedEnt.contacts[0].prenom }} {{ selectedEnt.contacts[0].nom }}</div>
                      </div>
                      <div>
                        <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Fonction</label>
                        <div class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-[#1A1A1A] truncate">{{ selectedEnt.contacts[0].fonction || '---' }}</div>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Téléphone</label>
                      <div class="flex gap-2">
                        <div class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-[#1A1A1A]">{{ selectedEnt.contacts[0].telephone || 'Non renseigné' }}</div>
                        <a v-if="selectedEnt.contacts[0].telephone" :href="`tel:${selectedEnt.contacts[0].telephone}`" class="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-[#D4AF37] hover:scale-110 transition-transform shrink-0 shadow-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg></a>
                      </div>
                    </div>
                    <div>
                      <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Email</label>
                      <div class="flex gap-2">
                        <div class="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold text-[#1A1A1A] truncate">{{ selectedEnt.contacts[0].email || 'Non renseigné' }}</div>
                        <a v-if="selectedEnt.contacts[0].email" :href="`mailto:${selectedEnt.contacts[0].email}`" class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-black hover:text-[#D4AF37] transition-colors shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg></a>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="selectedEnt.type === 'installateur' || selectedEnt.qualifications?.rgeValide" class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                  <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
                    <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    Certifications & Label RGE
                  </h2>
                  <div v-if="selectedEnt.qualifications?.rgeValide" class="p-5 bg-green-50 border-2 border-green-500 rounded-xl mb-4 flex flex-col gap-4 relative overflow-hidden">
                    <div class="absolute -right-4 -top-4 text-green-500/10 transform rotate-12 pointer-events-none"><svg class="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg></div>
                    <div class="flex items-start gap-4 z-10"><div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div><div><h3 class="text-sm font-black text-green-800 uppercase tracking-widest flex items-center gap-2">Label RGE Validé <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded text-[8px]">API ADEME</span></h3><p class="text-[10px] text-green-700 font-bold mt-1">L'entreprise possède {{ selectedEnt.qualifications?.details?.length || 0 }} certification(s) active(s).</p></div></div>
                    <div class="mt-2 space-y-2 z-10"><div v-for="(certif, idx) in selectedEnt.qualifications?.details" :key="idx" class="bg-white/80 border border-green-200 rounded-lg p-3 flex justify-between items-center shadow-sm"><div><p class="text-[10px] font-black text-green-900 uppercase tracking-wider">{{ certif.domaine }}</p><p class="text-[9px] font-bold text-green-600 mt-0.5">{{ certif.organisme }} <span v-if="certif.qualification">- {{ certif.qualification }}</span></p></div><div class="text-right shrink-0"><span class="text-[8px] font-black uppercase tracking-widest text-green-600/70 block mb-0.5">Expiration</span><span class="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded">{{ new Date(certif.expiration).toLocaleDateString('fr-FR') }}</span></div></div></div>
                  </div>
                  <div v-else class="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                    <div class="text-orange-500 mt-0.5"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg></div>
                    <div><p class="text-xs font-black text-orange-800 uppercase">Aucun certificat RGE trouvé</p><p class="text-[10px] font-bold text-orange-600 mt-1">Vérification stricte requise avant validation.</p></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 bg-white border-t-2 border-black shrink-0 flex gap-4">
            <button @click="traiterDemande('refuse')" :disabled="isProcessing" class="flex-1 bg-white text-red-600 border-2 border-red-200 hover:border-red-600 hover:bg-red-50 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-sm hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] flex items-center justify-center gap-2 disabled:opacity-50"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>Rejeter</button>
            <button @click="traiterDemande('valide')" :disabled="isProcessing" class="flex-[2] bg-[#1A1A1A] hover:bg-black text-green-400 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-[4px_4px_0px_0px_rgba(74,222,128,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(74,222,128,1)] flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"><span v-if="isProcessing" class="w-5 h-5 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></span><template v-else><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M5 13l4 4L19 7"/></svg>Valider et Activer</template></button>
          </div>
        </template>
      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
.animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>