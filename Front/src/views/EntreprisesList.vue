<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'min-h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col relative overflow-x-hidden overflow-y-hidden min-w-0">
    
    <TheHeader pageTitle="Clients & Partenaires PRO" class="shrink-0 w-full" />

    <div v-if="isMobile" class="flex-1 flex flex-col w-full overflow-y-auto custom-scrollbar-hide p-4 pb-24 min-w-0">
      
      <div class="flex flex-col gap-4 mb-6 shrink-0 min-w-0">
        <div class="min-w-0">
          <span class="text-[8px] font-black uppercase tracking-[0.4em] text-[#D4AF37] truncate block">Base de données</span>
          <h1 class="text-2xl font-black tracking-tighter mt-1 truncate">Annuaire PRO</h1>
        </div>
        <button @click="showCreateModal = true" class="w-full bg-black text-[#D4AF37] px-4 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform flex items-center justify-center gap-2 shrink-0">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
          <span class="truncate">Nouveau Client PRO</span>
        </button>
      </div>

      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center py-10 min-w-0">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4 shrink-0"></div>
        <p class="text-[9px] font-black uppercase tracking-widest text-gray-400 truncate">Chargement...</p>
      </div>

      <div v-else class="flex flex-col gap-5 min-w-0">
        <div v-for="ent in entreprises" :key="ent._id" 
             class="bg-white border-2 border-black rounded-[1.5rem] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative min-w-0 w-full"
             :class="{'bg-rose-50/30': ent.statutValidation === 'en_attente', 'bg-red-50/30': ent.statutValidation === 'refuse'}">
          
          <div v-if="ent.statutValidation === 'en_attente'" class="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-400"></div>
          
          <div class="p-4 flex flex-col gap-3 min-w-0">
            <div class="flex justify-between items-start gap-2 pl-1 min-w-0">
              <div class="min-w-0 flex-1">
                <p class="font-black text-sm uppercase text-[#1A1A1A] truncate">{{ ent.raisonSociale }}</p>
                <p class="font-mono text-[9px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                  <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ ent.siret }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-1.5 shrink-0">
                  <span v-if="ent.statutValidation === 'en_attente'" class="bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>En attente
                  </span>
                  <span v-else-if="ent.statutValidation === 'refuse'" class="bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-sm shrink-0">Refusé</span>
                  <span v-else class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-sm shrink-0">Validé</span>

                  <span v-if="ent.qualifications?.rgeValide" class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0">
                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    RGE
                  </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pl-1 mt-1 min-w-0">
              <div class="min-w-0">
                <p class="text-[7px] font-black uppercase text-gray-400 truncate">Localisation</p>
                <p class="text-xs font-bold text-[#1A1A1A] truncate">{{ ent.ville || 'N/A' }} <span class="text-[9px] text-gray-500 font-normal">({{ ent.codePostal }})</span></p>
              </div>
              <div class="min-w-0">
                <p class="text-[7px] font-black uppercase text-gray-400 truncate">Secteur</p>
                <span class="inline-block mt-0.5 px-2 py-0.5 bg-[#F5F2ED] text-[#D4AF37] border border-[#D4AF37]/30 rounded text-[7px] font-black uppercase tracking-wider truncate max-w-full">
                  {{ ent.secteurDeduit || 'À définir' }}
                </span>
              </div>
              <div class="col-span-2 mt-1 min-w-0">
                <p class="text-[7px] font-black uppercase text-gray-400 truncate">Contact</p>
                <template v-if="ent.contacts && ent.contacts.length > 0">
                  <p class="text-xs font-bold text-[#1A1A1A] truncate">{{ ent.contacts[0].prenom }} {{ ent.contacts[0].nom }}</p>
                  <p class="text-[9px] text-gray-500 truncate">{{ ent.contacts[0].telephone || ent.contacts[0].email }}</p>
                </template>
                <template v-else>
                  <span class="text-[9px] italic text-gray-400 truncate block">Aucun contact</span>
                </template>
              </div>
            </div>
          </div>
          
          <div class="flex border-t-2 border-black bg-gray-50 w-full min-w-0 mt-1">
            <button @click="$router.push(`/entreprises/${ent._id}`)" class="flex-1 py-3.5 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] border-r-2 border-black hover:bg-gray-100 active:bg-gray-200 transition-colors truncate">
              Profil
            </button>
            <button @click="lancerSimulation(ent._id)" class="flex-1 py-3.5 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#1A1A1A] hover:bg-black active:bg-gray-900 transition-colors truncate">
              <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Simuler
            </button>
          </div>
        </div>

        <div v-if="entreprises.length === 0" class="p-8 text-center text-gray-400 font-bold text-[10px] uppercase tracking-widest bg-white border-2 border-black rounded-[1.5rem] border-dashed min-w-0">
          Aucune entreprise
        </div>
      </div>
    </div>


    <div v-else class="p-8 flex-1 flex flex-col max-w-7xl mx-auto w-full min-w-0 overflow-y-auto">
      <div class="flex justify-between items-end mb-8 shrink-0">
        <div>
          <span class="text-[9px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Base de données</span>
          <h1 class="text-3xl font-black tracking-tighter mt-1">Annuaire Entreprises</h1>
        </div>
        <button @click="showCreateModal = true" class="bg-black text-[#D4AF37] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg>
          Nouveau Client PRO
        </button>
      </div>

      <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center">
        <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Chargement des données...</p>
      </div>

      <div v-else class="bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-[#F5F2ED] border-b-2 border-black text-[9px] font-black uppercase tracking-widest text-gray-500">
              <th class="p-4 pl-8">Raison Sociale & SIRET</th>
              <th class="p-4">Localisation & Secteur</th>
              <th class="p-4">Contact Principal</th>
              <th class="p-4 text-right pr-8">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ent in entreprises" :key="ent._id" 
                class="border-b border-gray-100 transition-colors group relative"
                :class="ent.statutValidation === 'en_attente' ? 'bg-rose-50/50 hover:bg-rose-100/50' : (ent.statutValidation === 'refuse' ? 'bg-red-50/50 hover:bg-red-100/50' : 'bg-white hover:bg-gray-50')">
              
              <td class="p-4 pl-8 relative">
                <div v-if="ent.statutValidation === 'en_attente'" class="absolute left-0 top-0 bottom-0 w-1 bg-rose-400"></div>
                
                <div class="flex items-center gap-2">
                  <p class="font-black text-sm uppercase text-[#1A1A1A] truncate max-w-[200px]">{{ ent.raisonSociale }}</p>
                  
                  <span v-if="ent.qualifications?.rgeValide" 
                        class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0">
                    <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    RGE
                  </span>
                </div>
                
                <div class="flex items-center gap-2 mt-1.5">
                  <span v-if="ent.statutValidation === 'en_attente'" class="bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    En attente
                  </span>
                  <span v-else-if="ent.statutValidation === 'refuse'" class="bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-sm shrink-0">
                    Refusé
                  </span>
                  <span v-else class="bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest shadow-sm shrink-0">
                    Validé
                  </span>

                  <p class="font-mono text-[10px] text-gray-500 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ ent.siret }}
                  </p>
                </div>
              </td>
              
              <td class="p-4">
                <p class="text-xs font-bold">{{ ent.ville || 'Non renseigné' }} <span class="text-gray-400 font-normal">({{ ent.codePostal }})</span></p>
                <span class="inline-block mt-1 px-2 py-0.5 bg-[#F5F2ED] text-[#D4AF37] border border-[#D4AF37]/30 rounded text-[8px] font-black uppercase tracking-wider">
                  {{ ent.secteurDeduit || 'À définir' }}
                </span>
              </td>
              
              <td class="p-4">
                <template v-if="ent.contacts && ent.contacts.length > 0">
                  <p class="text-xs font-bold">{{ ent.contacts[0].prenom }} {{ ent.contacts[0].nom }}</p>
                  <p class="text-[10px] text-gray-500">{{ ent.contacts[0].telephone || ent.contacts[0].email }}</p>
                </template>
                <template v-else>
                  <span class="text-[9px] italic text-gray-400">Aucun contact</span>
                </template>
              </td>
              
              <td class="p-4 pr-8 flex items-center justify-end gap-3 h-full pt-6">
                <button @click="$router.push(`/entreprises/${ent._id}`)" class="bg-white text-[#1A1A1A] border-2 border-black px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  Profil
                </button>
                
                <button @click="lancerSimulation(ent._id)" class="bg-[#FDF8E7] text-[#1A1A1A] border-2 border-black px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-[#D4AF37] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  Simuler
                </button>
              </td>
            </tr>
            <tr v-if="entreprises.length === 0">
              <td colspan="4" class="p-12 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">
                Aucune entreprise dans la base
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white border-2 border-black rounded-[1.5rem] md:rounded-2xl w-full max-w-[95vw] md:max-w-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden max-h-[90vh]">
          
          <div class="px-5 md:px-6 py-4 bg-[#F5F2ED] border-b-2 border-black flex justify-between items-center shrink-0">
            <h2 class="font-black uppercase tracking-widest text-[11px] md:text-sm flex items-center gap-2 truncate">
              <svg class="w-4 h-4 text-[#D4AF37] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
              <span class="truncate">Fiche Entreprise</span>
            </h2>
            <button @click="fermerModal" class="text-gray-400 hover:text-black transition-colors active:scale-95 shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <form @submit.prevent="submitEntreprise" class="p-5 md:p-6 flex flex-col gap-5 md:gap-6 overflow-y-auto custom-scrollbar-hide">
            
            <div>
              <h3 class="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2 mb-3">Identification légale</h3>
              <div class="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-4">
                <div class="md:col-span-2">
                  <label class="block text-[9px] md:text-[10px] font-black uppercase text-gray-600 mb-1">Raison Sociale *</label>
                  <input v-model="form.raisonSociale" required class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none transition-all"/>
                </div>
                <div>
                  <label class="block text-[9px] md:text-[10px] font-black uppercase text-gray-600 mb-1">SIRET *</label>
                  <input v-model="form.siret" required class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none transition-all"/>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2 mb-3">Localisation</h3>
              <div class="space-y-3">
                <input v-model="form.adresse" placeholder="Adresse complète" class="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
                <div class="flex gap-3">
                  <input v-model="form.codePostal" placeholder="Code Postal" class="w-1/3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
                  <input v-model="form.ville" placeholder="Ville" class="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-[9px] font-black uppercase text-gray-400 border-b border-gray-100 pb-2 mb-3">Contact Principal</h3>
              <div class="flex gap-3 mb-3">
                <input v-model="form.prenomContact" placeholder="Prénom" class="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
                <input v-model="form.nomContact" placeholder="Nom" class="w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
              </div>
              <div class="flex flex-col md:flex-row gap-3">
                <input v-model="form.emailContact" type="email" placeholder="Email" class="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
                <input v-model="form.telephoneContact" placeholder="Téléphone" class="w-full md:w-1/2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs md:text-sm font-bold focus:border-black outline-none"/>
              </div>
            </div>

            <div class="pt-4 border-t-2 border-black flex flex-col md:flex-row justify-end gap-3 shrink-0">
              <button type="button" @click="fermerModal" class="w-full md:w-auto px-6 py-4 md:py-3 rounded-lg font-black text-[10px] uppercase text-gray-500 hover:bg-gray-100 transition-colors active:scale-95 order-2 md:order-1">Annuler</button>
              <button type="submit" :disabled="isSubmitting" class="w-full md:w-auto bg-black text-[#D4AF37] px-8 py-4 md:py-3 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)] hover:translate-y-[-2px] transition-all disabled:opacity-50 active:scale-95 order-1 md:order-2">
                {{ isSubmitting ? 'Création...' : 'Sauvegarder' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // 768px = point de bascule standard
};

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  fetchEntreprises();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});
// ----------------------------------------------------

const router = useRouter();

const entreprises = ref([]);
const isLoading = ref(true);
const showCreateModal = ref(false);
const isSubmitting = ref(false);

const form = ref({
  raisonSociale: '', siret: '', adresse: '', codePostal: '', ville: '',
  prenomContact: '', nomContact: '', emailContact: '', telephoneContact: ''
});

const fermerModal = () => {
  showCreateModal.value = false;
  form.value = { raisonSociale: '', siret: '', adresse: '', codePostal: '', ville: '', prenomContact: '', nomContact: '', emailContact: '', telephoneContact: '' };
};

const fetchEntreprises = async () => {
  isLoading.value = true;
  try {
    const res = await api.get('/api/demo/entreprises');
    
    const sortedData = res.data.data.sort((a, b) => {
      const weight = { 'en_attente': 1, 'refuse': 2, 'valide': 3 };
      const wA = weight[a.statutValidation || 'en_attente'];
      const wB = weight[b.statutValidation || 'en_attente'];
      return wA - wB;
    });
    
    entreprises.value = sortedData;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const submitEntreprise = async () => {
  isSubmitting.value = true;
  try {
    await api.post('/api/demo/entreprises', form.value);
    await fetchEntreprises();
    fermerModal();
  } catch (error) {
    alert("Erreur lors de la création (Vérifiez si le SIRET existe déjà).");
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

const lancerSimulation = (entrepriseId) => {
  router.push(`/entreprises/${entrepriseId}/simulation`);
};
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.custom-scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>