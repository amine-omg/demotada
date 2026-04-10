<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEtablissementsStore, type Etablissement } from '../stores/etablissementsStore';
import TheHeader from '../components/TheHeader.vue';

const store = useEtablissementsStore();
const route = useRoute();
const router = useRouter();
const etablissementId = route.params.id as string;

const form = ref<Partial<Etablissement>>({});

// On utilise une propriété calculée pour accéder facilement aux formations externes du store
const externalFormations = computed(() => store.externalFormations);

onMounted(async () => {
  // On vide les formations externes lors du chargement de la page
  store.externalFormations = []; 
  await store.fetchEtablissementById(etablissementId);
  await store.fetchFormationsForEtablissement(etablissementId);
});

watch(() => store.currentEtablissement, (newValue) => {
  if (newValue) {
    form.value = { ...newValue };
  }
}, { immediate: true, deep: true });

const handleSave = async () => {
  try {
    await store.updateEtablissement(etablissementId, form.value);
    alert('Modifications enregistrées !');
  } catch (err) {
    alert('Erreur lors de la sauvegarde.');
  }
};

const handleSiretSearch = async () => {
  if (!form.value.siret || form.value.siret.length !== 14) {
    alert("Veuillez entrer un numéro de SIRET valide de 14 chiffres.");
    return;
  }
  try {
    await store.fetchFormationsBySiret(form.value.siret);
  } catch (error) {
    console.error("Erreur lors de la recherche par SIRET:", error);
    alert("Impossible de récupérer les formations pour ce SIRET.");
  }
};


const goToFormation = (formationId: string) => {
  router.push(`/formations/${formationId}`);
};

const handleDetachFormation = async (formationId: string) => {
  if (confirm("Êtes-vous sûr de vouloir retirer cette formation ?")) {
    await store.detachFormationFromEtablissement(formationId);
  }
};

const handleImportFormation = (formation: any) => {
    // Logique pour importer la formation (créer une nouvelle formation dans Syali)
    console.log("Importer la formation :", formation.intitule_formation);
    alert(`Logique d'importation pour "${formation.intitule_formation}" à implémenter.`);
};

const handleLinkFormation = (formation: any) => {
    // Logique pour rattacher à une formation existante
    console.log("Rattacher la formation :", formation.intitule_formation);
    alert(`Logique de rattachement pour "${formation.intitule_formation}" à implémenter.`);
};

const copyCrmId = (id: string) => {
  if (!id) return;
  navigator.clipboard.writeText(id).then(() => {
    alert('ID CRM copié dans le presse-papiers !');
  });
};

// --- CORRECTION ICI ---
// Utilise la variable 'store' qui est déjà initialisée dans ton script.
const handleRegenerateCrmId = async (ecoleId: string) => {
  if (confirm('Êtes-vous sûr de vouloir régénérer l\'ID CRM ? L\'ancien ID ne sera plus valide.')) {
    await store.regenerateCrmId(ecoleId);
    alert('Nouvel ID CRM généré avec succès.');
  }
};

</script>

<template>
  <div class="page-container">
    <TheHeader pageTitle="Édition d'un Établissement" showBackButton :backButtonRoute="{ name: 'etablissements-list' }" />
    
    <main class="flex-1 p-6 md:p-8">
      <div v-if="store.isLoading && !form._id">Chargement...</div>
      
      <!-- Nouvelle mise en page en deux colonnes -->
      <div v-else-if="form._id" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <!-- COLONNE DE GAUCHE : Informations de l'établissement -->
        <div class="space-y-8">
          <form @submit.prevent="handleSave" class="bg-white p-8 rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold text-gray-800 border-b pb-4 mb-6">Modifier : {{ form.nom }}</h1>
            
            <div v-if="form.logoUrl" class="mb-6">
              <img :src="form.logoUrl" :alt="form.nom" class="mt-2 max-h-32 rounded-md shadow-sm border">
            </div>
            
            <div class="space-y-6">
              <div>
                <label class="label">Nom de l'établissement</label>
                <input type="text" v-model="form.nom" class="input-field mt-1 w-full p-2">
              </div>
              
              <!-- NOUVEAU CHAMP SIRET -->
              <div>
                <label class="label">N° de SIRET</label>
                <div class="flex items-center gap-2">
                    <input type="text" v-model="form.siret" class="input-field mt-1 w-full p-2" placeholder="14 chiffres">
                    <button @click.prevent="handleSiretSearch" class="btn-secondary self-end whitespace-nowrap" :disabled="store.isExternalLoading">
                        <span v-if="store.isExternalLoading">...</span>
                        <span v-else>Chercher</span>
                    </button>
                </div>
              </div>

              <div>
                <label class="label">URL du Logo</label>
                <input type="text" v-model="form.logoUrl" class="input-field mt-1 w-full p-2" placeholder="https://...">
              </div>

              <div>
                <label class="label">Site Web</label>
                <input type="text" v-model="form.website" class="input-field mt-1 w-full p-2" placeholder="https://www.mon-etablissement.com">
              </div>

              <div>
                <label class="label">Description</label>
                <textarea v-model="form.description" class="input-field mt-1 w-full p-2" rows="4"></textarea>
              </div>
              
              <div class="pt-4 flex justify-end">
                <button type="submit" class="btn-primary">Enregistrer</button>
              </div>
            </div>
          </form>
        </div>

        <!-- COLONNE DE DROITE : Formations -->
        <div class="space-y-8">
            <!-- Bloc des formations rattachées (Syali) -->
            <div>
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Formations Rattachées (Syali)</h2>
              <div class="bg-white p-4 rounded-lg shadow-lg">
                <div v-if="store.isLoading" class="text-center py-4 text-gray-500">Chargement...</div>
                <div v-else-if="!store.formationsForCurrentEtablissement?.length" class="text-center py-8 text-gray-500">
                  Aucune formation rattachée dans Syali.
                </div>
                <ul v-else class="divide-y divide-gray-200">
                  <li v-for="formation in store.formationsForCurrentEtablissement" :key="formation._id" class="py-3 px-2 flex items-center justify-between">
                    <div @click="goToFormation(formation._id)" class="flex-grow cursor-pointer">
                      <span class="font-medium text-gray-800">{{ formation.title }}</span>
                    </div>
                    <button @click.stop="handleDetachFormation(formation._id)" class="text-red-500 hover:text-red-700 text-sm font-semibold">Retirer</button>
                  </li>
                </ul>
              </div>
            </div>

            <!-- NOUVEAU BLOC : Formations externes (Open Data) -->
            <div v-if="form.siret">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">Formations Externes (Catalogue Public)</h2>
              <div class="bg-white p-4 rounded-lg shadow-lg">
                <div v-if="store.isExternalLoading" class="text-center py-4 text-gray-500">Recherche en cours...</div>
                <div v-else-if="!externalFormations.length" class="text-center py-8 text-gray-500">
                  Aucune formation publique trouvée pour ce SIRET.
                </div>
                <ul v-else class="divide-y divide-gray-200">
                  <li v-for="(formation, index) in externalFormations" :key="index" class="py-3 px-2">
                    <p class="font-medium text-gray-800">{{ formation.intitule_formation }}</p>
                    <p class="text-xs text-gray-500">RNCP: {{ formation.code_rncp || 'Non spécifié' }}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <button @click="handleImportFormation(formation)" class="text-sm font-semibold text-green-600 hover:text-green-800">Importer</button>
                        <button @click="handleLinkFormation(formation)" class="text-sm font-semibold text-blue-600 hover:text-blue-800">Rattacher</button>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
       

  
     <div class="bg-white p-6 rounded-lg shadow-md mt-8">
              <h2 class="text-xl font-semibold text-[#423B72] mb-4">Identifiant CRM</h2>
              <p class="text-sm text-gray-600 mb-4">
                Cet identifiant unique permet aux utilisateurs de se connecter au pipeline CRM de cet établissement.
              </p>
              
              <div v-if="form && form.crmId" class="flex items-center gap-4 bg-gray-100 p-3 rounded-md">
                <input 
                  type="text" 
                  :value="form.crmId" 
                  readonly 
                  class="input-field flex-grow bg-gray-200"
                />
                <button @click="copyCrmId(form.crmId)" class="btn-secondary">Copier</button>
              </div>

              <div v-else class="text-sm text-gray-500">
                Cet établissement n'a pas encore d'ID CRM. Sauvegardez pour en générer un.
              </div>
            </div>


<div v-if="form && form.crmId" class="flex items-center ...">
    </div>

<div v-if="form.crmManagers && form.crmManagers.length > 0" class="mt-6">
    <h3 class="text-md font-semibold text-gray-700 border-t pt-4">
      Managers associés à ce CRM
    </h3>
    <ul class="mt-2 space-y-2">
      <li v-for="manager in form.crmManagers" :key="manager._id" class="bg-gray-50 p-2 rounded-md text-sm">
        <p class="font-medium text-gray-800">{{ manager.prenom }} {{ manager.nom }}</p>
        <p class="text-gray-500">{{ manager.email }}</p>
      </li>
    </ul>
</div>

        </div>
      </div>
       <div v-else class="text-center py-8 text-gray-500">Cet établissement n'a pas été trouvé.</div>
    </main>
  </div>
</template>
