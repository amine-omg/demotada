<template>
  <div class="min-h-screen bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col relative">
    
    <TheHeader 
      :pageTitle="entreprise.raisonSociale ? `Fiche : ${entreprise.raisonSociale}` : 'Profil Entreprise'" 
      :showBackButton="true" 
      @back="$router.push('/entreprises')" 
    />

    <div v-if="isLoadingInitial" class="flex-1 flex flex-col items-center justify-center">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
      <p class="text-[9px] font-black uppercase tracking-widest text-gray-400">Chargement de la fiche...</p>
    </div>

    <div v-else class="flex-1 flex flex-col max-w-5xl mx-auto w-full p-8">
      
      <div class="flex justify-between items-start mb-8">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-black text-[#D4AF37] rounded-2xl flex items-center justify-center text-2xl shadow-sm">
            🏢
          </div>
          <div>
            <h1 class="text-3xl font-black tracking-tighter">{{ entreprise.raisonSociale || 'Nouvelle Fiche' }}</h1>
            <span class="inline-block mt-1 px-2 py-0.5 bg-[#F5F2ED] text-[#D4AF37] border border-[#D4AF37]/30 rounded text-[9px] font-black uppercase tracking-widest">
              {{ entreprise.type === 'client_tertiaire' ? 'Client PRO (Tertiaire)' : entreprise.type }}
            </span>
          </div>
        </div>
        <button @click="sauvegarder" :disabled="isSaving" class="bg-black text-[#D4AF37] px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] transition-all flex items-center gap-2">
           <span v-if="isSaving" class="w-3 h-3 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
           {{ isSaving ? 'Sauvegarde...' : 'Enregistrer les modifs' }}
         </button>
      </div>

      <div v-if="entreprise.estActive === false" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm flex items-start gap-4 animate-fade-in">
        <div class="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <div>
          <h3 class="text-sm font-black text-red-700 uppercase tracking-widest">Alerte : Société Radiée / Fermée</h3>
          <p class="text-[11px] font-bold text-red-600 mt-1">L'API de l'État indique que cet établissement est en statut "Cessation d'activité". Ce SIRET n'est plus valide pour déposer des CEE.</p>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-8">
        
        <div class="col-span-2 space-y-6">
          <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Identité Légale & SIRENE
            </h2>

            <div class="flex gap-3 items-end mb-6 p-4 bg-[#F8F9FA] rounded-xl border border-gray-200">
              <div class="flex-1">
                <label class="block text-[10px] font-black uppercase text-gray-600 mb-1">Numéro SIRET</label>
                <input v-model="entreprise.siret" placeholder="Ex: 55208131700011" class="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm font-bold focus:border-black outline-none transition-all"/>
              </div>
              <button @click="verifierSiret" :disabled="isVerifying" class="px-6 py-3 bg-[#D4AF37] text-white border-2 border-black rounded-lg font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all disabled:opacity-50 flex items-center gap-2 h-[46px]">
                <span v-if="isVerifying" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>🔍 Vérifier (API)</span>
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="col-span-2">
                <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Raison Sociale</label>
                <input v-model="entreprise.raisonSociale" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm font-bold focus:border-black outline-none" :class="{'ring-2 ring-green-400 bg-green-50': apiSuccess}"/>
              </div>
              <div class="col-span-2">
                <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Adresse du siège</label>
                <input v-model="entreprise.adresse" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs font-bold focus:border-black outline-none" :class="{'ring-2 ring-green-400 bg-green-50': apiSuccess}"/>
              </div>
              <div>
                <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Code Postal</label>
                <input v-model="entreprise.codePostal" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs font-bold focus:border-black outline-none" :class="{'ring-2 ring-green-400 bg-green-50': apiSuccess}"/>
              </div>
              <div>
                <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Ville</label>
                <input v-model="entreprise.ville" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs font-bold focus:border-black outline-none" :class="{'ring-2 ring-green-400 bg-green-50': apiSuccess}"/>
              </div>
            <div class="col-span-2">
                <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Code NAF & Activité</label>
                <input :value="entreprise.codeNaf ? `${entreprise.codeNaf} - ${entreprise.libelleNaf || ''}` : ''" 
                       @input="entreprise.codeNaf = $event.target.value.split(' - ')[0]"
                       placeholder="Ex: 55.10Z - Hôtels et hébergement" 
                       class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs font-bold focus:border-black outline-none" 
                       :class="{'ring-2 ring-green-400 bg-green-50 text-green-800': apiSuccess}"/>
              </div>
              <div>
                <label class="block text-[9px] font-black uppercase text-gray-400 mb-1">Secteur CEE Déduit</label>
                <select v-model="entreprise.secteurDeduit" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-xs font-bold focus:border-black outline-none" :class="{'ring-2 ring-green-400 bg-green-50': apiSuccess}">
                  <option value="Hôtellerie / restauration">Hôtellerie / restauration</option>
                  <option value="Bureaux">Bureaux</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Enseignement">Enseignement</option>
                  <option value="Santé">Santé</option>
                  <option value="Industrie">Industrie</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
            </div>
            
           <div v-if="apiSuccess" class="absolute top-4 right-4 text-green-500 animate-pulse">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>

          <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Certifications & Label RGE
            </h2>

            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
              <div>
                <p class="text-xs font-black uppercase text-gray-800">Scan Base Nationale ADEME</p>
                <p class="text-[10px] text-gray-500 font-bold mt-1">Vérifie la validité des certificats via le SIRET.</p>
              </div>
              <button @click="verifierRge" :disabled="isVerifyingRge || !entreprise.siret" class="px-5 py-2.5 bg-black text-[#D4AF37] rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(212,175,55,0.4)]">
                <span v-if="isVerifyingRge" class="w-3 h-3 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></span>
                <span v-else>Lancer le scan</span>
              </button>
            </div>

            <div v-if="rgeSuccess || (entreprise.qualifications && entreprise.qualifications.rgeValide)" class="p-5 bg-green-50 border-2 border-green-500 rounded-xl mb-4 flex flex-col gap-4 animate-fade-in relative overflow-hidden">
              <div class="absolute -right-4 -top-4 text-green-500/10 transform rotate-12">
                 <svg class="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              </div>
              
              <div class="flex items-start gap-4 z-10">
                <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <h3 class="text-sm font-black text-green-800 uppercase tracking-widest flex items-center gap-2">
                    Label RGE Validé
                    <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded text-[8px]">API ADEME</span>
                  </h3>
                  <p class="text-[10px] text-green-700 font-bold mt-1">L'entreprise possède {{ entreprise.qualifications?.details?.length || 0 }} certification(s) active(s).</p>
                </div>
              </div>

              <div class="mt-2 space-y-2 z-10">
                <div v-for="(certif, idx) in entreprise.qualifications?.details" :key="idx" class="bg-white/80 border border-green-200 rounded-lg p-3 flex justify-between items-center shadow-sm">
                  <div>
                    <p class="text-[10px] font-black text-green-900 uppercase tracking-wider">{{ certif.domaine }}</p>
                    <p class="text-[9px] font-bold text-green-600 mt-0.5">{{ certif.organisme }} <span v-if="certif.qualification">- {{ certif.qualification }}</span></p>
                  </div>
                  <div class="text-right shrink-0">
                    <span class="text-[8px] font-black uppercase tracking-widest text-green-600/70 block mb-0.5">Expiration</span>
                    <span class="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-1 rounded">{{ new Date(certif.expiration).toLocaleDateString('fr-FR') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="rgeError" class="p-4 bg-orange-50 border border-orange-200 rounded-xl mb-4 flex items-start gap-3 animate-fade-in">
              <div class="text-orange-500 mt-0.5">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <div>
                <p class="text-xs font-black text-orange-800 uppercase">Aucun certificat RGE trouvé</p>
                <p class="text-[10px] font-bold text-orange-600 mt-1">L'API ADEME ne renvoie aucun label actif pour ce SIRET. Si l'entreprise est un client tertiaire, c'est normal.</p>
              </div>
            </div>

          </div>
        </div>

        <div class="col-span-1 space-y-6">
          
         <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Contact Principal
            </h2>

            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Prénom</label>
                  <input v-model="entreprise.contacts[0].prenom" placeholder="Ex: Jean" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold focus:border-black outline-none transition-all"/>
                </div>
                <div>
                  <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Nom</label>
                  <input v-model="entreprise.contacts[0].nom" placeholder="Ex: Dupont" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold focus:border-black outline-none transition-all"/>
                </div>
              </div>
              
              <div>
                <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Fonction</label>
                <input v-model="entreprise.contacts[0].fonction" placeholder="Ex: Gérant / Responsable" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold focus:border-black outline-none transition-all"/>
              </div>

              <div>
                <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Téléphone</label>
                <div class="flex gap-2">
                  <input v-model="entreprise.contacts[0].telephone" placeholder="06 12 34 56 78" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold focus:border-black outline-none transition-all"/>
                  <a v-if="entreprise.contacts[0].telephone" :href="`tel:${entreprise.contacts[0].telephone}`" class="w-9 h-9 bg-black rounded-lg flex items-center justify-center text-[#D4AF37] hover:scale-110 transition-transform shrink-0 shadow-sm" title="Appeler">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </a>
                </div>
              </div>

              <div>
                <label class="block text-[8px] font-black uppercase text-gray-400 mb-1">Email</label>
                <div class="flex gap-2">
                  <input v-model="entreprise.contacts[0].email" type="email" placeholder="jean@exemple.com" class="w-full bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs font-bold focus:border-black outline-none transition-all"/>
                  <a v-if="entreprise.contacts[0].email" :href="`mailto:${entreprise.contacts[0].email}`" class="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 hover:bg-black hover:text-[#D4AF37] transition-colors shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white border-2 border-black rounded-2xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 class="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4">Activité CEE</h2>
            <div class="space-y-4">
               <div class="flex justify-between items-end border-b border-gray-50 pb-2">
                 <span class="text-[9px] font-bold uppercase text-gray-500">Dossiers en cours</span>
                 <span class="font-black text-lg leading-none">{{ entreprise?.stats?.dossiersEnCours || 0 }}</span>
               </div>
               <div class="flex justify-between items-end border-b border-gray-50 pb-2">
                 <span class="text-[9px] font-bold uppercase text-gray-500">Dossiers terminés</span>
                 <span class="font-black text-lg leading-none">{{ entreprise?.stats?.dossiersTermines || 0 }}</span>
               </div>
               <div class="flex justify-between items-end">
                 <span class="text-[9px] font-bold uppercase text-[#D4AF37]">Volume Validé (MWh)</span>
                 <span class="font-black text-lg leading-none text-[#D4AF37]">{{ entreprise?.stats?.mwhCumacTotal || 0 }}</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '/services/api';
import TheHeader from '../components/TheHeader.vue';

const route = useRoute();
const router = useRouter();

const entreprise = ref({});
const isLoadingInitial = ref(true);
const isSaving = ref(false);
const isVerifying = ref(false);
const apiSuccess = ref(false);

const fetchEntreprise = async () => {
  try {
    const res = await api.get(`/api/demo/entreprises/${route.params.id}`);
    entreprise.value = res.data.data;
    
    // NOUVEAU : Si l'entreprise n'a aucun contact, on initialise un contact vide pour le formulaire
    if (!entreprise.value.contacts || entreprise.value.contacts.length === 0) {
      entreprise.value.contacts = [{ prenom: '', nom: '', email: '', telephone: '', fonction: '' }];
    }
    
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingInitial.value = false;
  }
};

const sauvegarder = async () => {
  isSaving.value = true;
  try {
    // Appel PUT à créer dans ton backend (updateEntreprise)
    await api.put(`/api/demo/entreprises/${route.params.id}`, entreprise.value);
    apiSuccess.value = false; // Reset l'effet visuel vert
  } catch (e) {
    console.error(e);
  } finally {
    isSaving.value = false;
  }
};

// ==========================================
// LA MAGIE API GOUVERNEMENTALE
// ==========================================
const verifierSiret = async () => {
  if (!entreprise.value.siret || entreprise.value.siret.length < 9) {
    alert("Veuillez entrer un numéro SIRET/SIREN valide.");
    return;
  }

  isVerifying.value = true;
  apiSuccess.value = false;

  try {
    // Nettoyer les espaces du SIRET
    const cleanSiret = entreprise.value.siret.replace(/\s/g, '');
    
    // Appel à l'API publique (Fetch natif du navigateur)
    const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${cleanSiret}`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const etablissement = data.results[0];
      const siege = etablissement.siege;

// 1. Remplissage des champs textuels
      entreprise.value.raisonSociale = etablissement.nom_complet;
      entreprise.value.adresse = siege.adresse;
      entreprise.value.codePostal = siege.code_postal;
      entreprise.value.ville = siege.libelle_commune;
      
      // PIMP DU CODE NAF
      entreprise.value.codeNaf = etablissement.activite_principale;
      entreprise.value.libelleNaf = etablissement.libelle_activite_principale;
      
      // GESTION DU STATUT RADIÉ
      // L'API renvoie 'A' pour Active, 'C' pour Cessée (Fermée)
      entreprise.value.estActive = (etablissement.etat_administratif === 'A');

      // 2. Déduction intelligente du Secteur d'Activité via le Code NAF (2 premiers chiffres)
      const nafPrefix = entreprise.value.codeNaf ? entreprise.value.codeNaf.substring(0, 2) : '';
      
      if (['55', '56'].includes(nafPrefix)) entreprise.value.secteurDeduit = 'Hôtellerie / restauration';
      else if (['45', '46', '47'].includes(nafPrefix)) entreprise.value.secteurDeduit = 'Commerce';
      else if (['85'].includes(nafPrefix)) entreprise.value.secteurDeduit = 'Enseignement';
      else if (['86', '87', '88'].includes(nafPrefix)) entreprise.value.secteurDeduit = 'Santé';
      else if (['10', '11', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33'].includes(nafPrefix)) entreprise.value.secteurDeduit = 'Industrie';
      else if (['64', '65', '66', '68', '69', '70', '71', '72', '73', '74', '78', '80', '81', '82'].includes(nafPrefix)) entreprise.value.secteurDeduit = 'Bureaux';
      else entreprise.value.secteurDeduit = 'Autres';

      // 3. Déduction Zone Climatique simplifiée (H1, H2, H3)
      if (siege.code_postal) {
         const dep = siege.code_postal.substring(0,2);
         const h2 = ['04','07','09','12','16','17','18','19','22','23','24','26','29','31','32','33','35','36','37','40','41','44','46','47','48','49','50','53','56','61','72','79','81','82','85','86','87'];
         const h3 = ['11','13','30','34','66','83','84','2A','2B'];
         if (h3.includes(dep)) entreprise.value.zoneClimatique = 'H3';
         else if (h2.includes(dep)) entreprise.value.zoneClimatique = 'H2';
         else entreprise.value.zoneClimatique = 'H1';
      }

      apiSuccess.value = true; // Déclenche le surlignage vert flash
    } else {
      alert("Aucune entreprise trouvée avec ce numéro.");
    }
  } catch (error) {
    console.error("Erreur API:", error);
    alert("Erreur lors de la connexion à l'API gouvernementale.");
  } finally {
    isVerifying.value = false;
  }
};

// Variables d'état pour le RGE
const isVerifyingRge = ref(false);
const rgeSuccess = ref(false);
const rgeError = ref(false);

// LA MAGIE API ADEME (Vérification RGE Multi-Certifs)
const verifierRge = async () => {
  if (!entreprise.value.siret) {
    alert("Veuillez d'abord renseigner ou vérifier le SIRET.");
    return;
  }

  isVerifyingRge.value = true;
  rgeSuccess.value = false;
  rgeError.value = false;

  try {
    const cleanSiret = entreprise.value.siret.replace(/\s/g, '');
    
    const response = await fetch(`https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines?q=${cleanSiret}&q_fields=siret`);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      if (!entreprise.value.qualifications) entreprise.value.qualifications = {};
      
      entreprise.value.qualifications.rgeValide = true;
      entreprise.value.qualifications.numeroRge = data.results[0].numero_certificat || 'Multiple';
      
      // On capture TOUTES les certifications de l'API
      entreprise.value.qualifications.details = data.results.map(certif => ({
        domaine: certif.domaine || 'Général',
        organisme: certif.nom_organisme || 'ADEME',
        qualification: certif.nom_qualification || '',
        expiration: certif.date_fin_validite ? new Date(certif.date_fin_validite).toISOString().split('T')[0] : null
      }));

      rgeSuccess.value = true;
    } else {
      if (!entreprise.value.qualifications) entreprise.value.qualifications = {};
      entreprise.value.qualifications.rgeValide = false;
      entreprise.value.qualifications.details = [];
      rgeError.value = true;
    }
  } catch (error) {
    console.error("Erreur API ADEME:", error);
    alert("Impossible de joindre le serveur de l'ADEME.");
  } finally {
    isVerifyingRge.value = false;
  }
};

onMounted(() => fetchEntreprise());
</script>