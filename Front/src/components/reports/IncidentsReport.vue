<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import api from '/services/api';
import AdminCreateIncidentModal from '../../components/modals/AdminCreateIncidentModal.vue';
import CreateAxeModal from '../../components/modals/CreateAxeModal.vue';
import IncidentDetailsPanel from '../../components/incidents/IncidentDetailsPanel.vue';

// --- TYPAGES ---
interface ActionCorrective {
  _id: string;
  description: string;
  dateMiseEnOeuvre: string;
  responsable: { prenom: string; nom: string; };
}

interface Axe {
  _id: string;
  titre: string;
  description: string;
  statut: string;
  createur: { prenom: string; nom: string; };
  createdAt: string;
}

interface Incident {
  _id: string;
  titre: string;
  type: string;
  description: string;
  statut: 'Nouveau' | 'En cours d\'analyse' | 'Action corrective en cours' | 'Clôturé';
  gravite: 'Faible' | 'Moyenne' | 'Haute' | 'Critique';
  nature?: string;
  cause?: string;
  createur: {
    prenom: string;
    nom: string;
  };
  contexte?: {
    formation?: { title: string };
    session?: { title: string };
  };
  apprenantConcerne: { prenom: string; nom: string; }; 
  createdAt: string;
  // Nouveaux champs pour les onglets
  actionsCorrectives?: ActionCorrective[];
  axeAmelioration?: { _id: string; titre: string; };
}

// --- ÉTATS ---
const incidents = ref<Incident[]>([]);
const axes = ref<Axe[]>([]); // Liste des axes d'amélioration
const isLoading = ref(true);
const searchQuery = ref('');
const activeTab = ref('Incidents qualité');

// Gestion des modales
const isModalOpen = ref(false); // Modale création incident
const isAxeModalOpen = ref(false); // Modale création axe
const isDetailsPanelOpen = ref(false); // Tiroir latéral
const selectedIncidentId = ref<string | null>(null);

// --- FONCTIONS ---
const openIncidentDetails = (id: string) => {
  selectedIncidentId.value = id;
  isDetailsPanelOpen.value = true;
};

// Soumission d'un nouvel Axe
const handleCreateAxe = async (payload: { titre: string, description: string }) => {
  try {
    await api.post('/api/axes-amelioration', payload);
    isAxeModalOpen.value = false;
    await fetchAxes(); // Rafraîchit la liste des axes
  } catch (error) {
    console.error("Erreur lors de la création de l'axe", error);
  }
};

// Soumission d'un nouvel Incident
const handleIncidentSubmit = async (payload: { type: string, titre: string, description: string }) => {
  try {
    await api.post('/api/incidents', payload);
    isModalOpen.value = false;
    await fetchIncidents(); // Rafraîchit le tableau des incidents
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
  }
};

// Récupération API - Incidents
const fetchIncidents = async () => {
  isLoading.value = true;
  try {
    const response = await api.get('/api/incidents');
    incidents.value = response.data || response; 
  } catch (error) {
    console.error('Erreur lors de la récupération des incidents:', error);
  } finally {
    isLoading.value = false;
  }
};

// Récupération API - Axes d'amélioration
const fetchAxes = async () => {
  try {
    const response = await api.get('/api/axes-amelioration');
    axes.value = response.data || response;
  } catch (error) {
    console.error('Erreur lors de la récupération des axes:', error);
  }
};

onMounted(() => {
  fetchIncidents();
  fetchAxes(); // On charge les deux au montage
});

// --- COMPUTED (Filtrage et tris) ---

// 1. Incidents filtrés
const filteredIncidents = computed(() => {
  if (!searchQuery.value) return incidents.value;
  const lowerQuery = searchQuery.value.toLowerCase();
  return incidents.value.filter(incident => 
    incident.titre.toLowerCase().includes(lowerQuery) ||
    incident.createur.nom.toLowerCase().includes(lowerQuery) ||
    incident.type.toLowerCase().includes(lowerQuery)
  );
});

// 2. Actions Correctives (Extraites des incidents)
const allActions = computed(() => {
  const actions: any[] = [];
  incidents.value.forEach(incident => {
    if (incident.actionsCorrectives && Array.isArray(incident.actionsCorrectives)) {
      incident.actionsCorrectives.forEach(action => {
        actions.push({
          ...action,
          incidentId: incident._id,
          incidentTitre: incident.titre,
          incidentStatut: incident.statut
        });
      });
    }
  });
  // Tri par date (la plus récente ou la plus urgente)
  let sorted = actions.sort((a, b) => new Date(b.dateMiseEnOeuvre).getTime() - new Date(a.dateMiseEnOeuvre).getTime());
  
  // Recherche textuelle
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    sorted = sorted.filter(a => a.description.toLowerCase().includes(q) || a.incidentTitre.toLowerCase().includes(q));
  }
  return sorted;
});

// 3. Axes filtrés
const filteredAxes = computed(() => {
  if (!searchQuery.value) return axes.value;
  const q = searchQuery.value.toLowerCase();
  return axes.value.filter(a => a.titre.toLowerCase().includes(q));
});

// --- HELPERS D'AFFICHAGE ---
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
};

const getStatusBadgeClass = (statut: string) => {
  switch (statut) {
    // Remplacement du bleu par le turquoise de ton app
    case 'Nouveau': return 'bg-[#B2E9E1] text-[#423B71] shadow-sm';
    case 'En cours d\'analyse': return 'bg-yellow-100 text-yellow-800';
    case 'Action corrective en cours': return 'bg-purple-100 text-purple-800';
    case 'Clôturé': return 'bg-green-100 text-green-800';
    case 'En cours': return 'bg-yellow-100 text-yellow-800'; 
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getGravityBadgeClass = (gravite: string) => {
  switch (gravite) {
    case 'Critique': return 'bg-red-100 text-red-800';
    case 'Haute': return 'bg-orange-100 text-orange-800';
    case 'Moyenne': return 'bg-yellow-100 text-yellow-800';
    case 'Faible': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 min-h-screen">
    
    <div class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
      <h1 class="text-3xl font-black text-[#423B71] mb-6">Amélioration continue</h1>

      <div class="flex bg-gray-50 p-1 rounded-xl mb-6">
        <button 
          v-for="tab in ['Incidents qualité', 'Actions correctives', 'Axes d\'amélioration']" 
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'flex-1 py-3 text-sm font-bold rounded-lg transition-all',
            activeTab === tab ? 'bg-[#EFEAFB] text-[#423B71] shadow-sm' : 'text-gray-500 hover:bg-gray-100'
          ]"
        >
          {{ tab }}
        </button>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div class="relative w-full md:w-72">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Rechercher..." 
            class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8A79E2]/20 focus:border-[#8A79E2] transition-all"
          >
        </div>

        <div class="flex items-center gap-3">
          
          <button 
            v-if="activeTab === 'Incidents qualité' || activeTab === 'Actions correctives'"
            @click="isModalOpen = true" 
            class="px-5 py-2.5 bg-[#8A79E2] text-white text-sm font-bold rounded-xl shadow-md shadow-[#8A79E2]/20 hover:bg-[#7262c8] transition-all flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Ajouter un incident
          </button>

          <button 
            v-else-if="activeTab === 'Axes d\'amélioration'"
            @click="isAxeModalOpen = true" 
            class="px-5 py-2.5 bg-[#B2E9E1] text-[#423B71] text-sm font-bold rounded-xl shadow-md shadow-teal-900/10 hover:bg-[#8BD8CC] transition-all flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Nouvel Axe
          </button>

          <button class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2">
            <i class="fas fa-download"></i>
            Exporter
          </button>

          <button class="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all">
            Choisir les colonnes
          </button>
        </div>
      </div>

      <div v-if="activeTab === 'Incidents qualité'" class="overflow-x-auto border border-gray-100 rounded-xl flex-1 relative">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider w-1/4">Titre (Axe lié)</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Apprenant & Contexte</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Statut & Responsable</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center" colspan="3">Qualification</th>
            </tr>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th colspan="3"></th>
              <th class="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center border-l border-gray-100">Cause</th>
              <th class="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center border-l border-gray-100">Nature</th>
              <th class="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center border-l border-gray-100">Gravité</th>
            </tr>
          </thead>
          
          <tbody v-if="isLoading">
            <tr>
              <td colspan="6" class="p-8 text-center text-gray-400">
                <i class="fas fa-circle-notch fa-spin text-2xl text-[#8A79E2] mb-2"></i>
                <p>Chargement des incidents...</p>
              </td>
            </tr>
          </tbody>

          <tbody v-else-if="filteredIncidents.length === 0">
            <tr>
              <td colspan="6" class="p-16 text-center text-gray-400 font-medium">
                Pas de données
              </td>
            </tr>
          </tbody>

          <tbody v-else class="divide-y divide-gray-50">
            <tr v-for="incident in filteredIncidents" :key="incident._id" @click="openIncidentDetails(incident._id)" class="hover:bg-gray-50/50 transition-colors cursor-pointer group">
              
              <td class="p-4">
                <div class="font-bold text-[#423B71] group-hover:text-[#8A79E2] transition-colors leading-tight mb-1">
                  {{ incident.titre }}
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {{ incident.axeAmelioration ? incident.axeAmelioration.titre : incident.type }}
                  </span>
                </div>
              </td>

              <td class="p-4">
                <div v-if="incident.apprenantConcerne" class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-full bg-[#EFEAFB] text-[#423B71] flex items-center justify-center text-[10px] font-bold">
                     {{ (incident.apprenantConcerne.prenom || '?').charAt(0) }}{{ (incident.apprenantConcerne.nom || '').charAt(0) }}
                  </div>
                  <span class="text-sm font-bold text-gray-700">
                    {{ incident.apprenantConcerne.prenom || 'Apprenant' }} {{ incident.apprenantConcerne.nom || 'Inconnu' }}
                  </span>
                </div>
                <div v-else class="flex items-center gap-2 mb-1.5">
                  <div class="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[10px] font-bold">
                    <i class="fas fa-users"></i>
                  </div>
                  <span class="text-sm font-bold text-gray-500 italic">Concerne la session</span>
                </div>

                <div v-if="incident.contexte?.formation" class="text-[10px] font-medium text-gray-500 flex items-center gap-1.5">
                  <i class="fas fa-graduation-cap text-gray-400"></i>
                  <span class="truncate max-w-[180px]">{{ incident.contexte.formation.title }}</span>
                </div>
              </td>

              <td class="p-4">
                <div class="mb-2">
                  <span :class="['px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full', getStatusBadgeClass(incident.statut)]">
                    {{ incident.statut }}
                  </span>
                </div>
                <div v-if="incident.actionsCorrectives && incident.actionsCorrectives.length > 0" class="text-[10px] font-medium text-gray-500 flex items-center gap-1.5 mt-1">
                  <i class="fas fa-user-hard-hat text-[#8A79E2]"></i>
                  En charge : {{ incident.actionsCorrectives[incident.actionsCorrectives.length - 1].responsable.prenom }}
                </div>
                <div v-else class="text-[10px] font-medium text-gray-400 italic flex items-center gap-1.5 mt-1">
                  <i class="far fa-clock"></i> Non assigné
                </div>
              </td>

              <td class="p-4 border-l border-gray-50 text-sm text-gray-600 text-center">{{ incident.cause || '-' }}</td>
              <td class="p-4 border-l border-gray-50 text-sm text-gray-600 text-center">{{ incident.nature || '-' }}</td>
              <td class="p-4 border-l border-gray-50 text-center">
                <span :class="['px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wide', getGravityBadgeClass(incident.gravite)]">
                  {{ incident.gravite }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'Actions correctives'" class="overflow-x-auto border border-gray-100 rounded-xl flex-1 relative">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Action à réaliser</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Incident Lié</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Date Prévue</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Responsable</th>
            </tr>
          </thead>
          <tbody v-if="allActions.length === 0">
            <tr><td colspan="4" class="p-16 text-center text-gray-400 font-medium">Aucune action corrective planifiée.</td></tr>
          </tbody>
          <tbody v-else class="divide-y divide-gray-50">
            <tr v-for="(action, index) in allActions" :key="index" @click="openIncidentDetails(action.incidentId)" class="hover:bg-gray-50/50 transition-colors cursor-pointer group">
              <td class="p-4">
                <div class="font-bold text-[#423B71] flex items-center gap-2">
                  <i class="fas fa-tools text-[#8A79E2] text-xs"></i> {{ action.description }}
                </div>
              </td>
              <td class="p-4">
                <span class="text-sm font-medium text-gray-600 group-hover:text-[#8A79E2] transition-colors">{{ action.incidentTitre }}</span>
                <span :class="['ml-2 px-2 py-0.5 text-[10px] font-bold rounded-md', getStatusBadgeClass(action.incidentStatut)]">{{ action.incidentStatut }}</span>
              </td>
              <td class="p-4 text-sm font-bold text-gray-600">
                <i class="far fa-calendar-alt text-gray-400 mr-1"></i> {{ formatDate(action.dateMiseEnOeuvre) }}
              </td>
              <td class="p-4 text-sm font-medium text-gray-700">
                <i class="fas fa-user-circle text-gray-400 mr-1"></i> {{ action.responsable.prenom }} {{ action.responsable.nom }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else-if="activeTab === 'Axes d\'amélioration'" class="overflow-x-auto border border-gray-100 rounded-xl flex-1 relative">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-100">
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Titre du Chantier</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Objectif</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Créé par</th>
              <th class="p-4 text-xs font-black text-gray-500 uppercase tracking-wider text-center">Statut</th>
            </tr>
          </thead>
          <tbody v-if="filteredAxes.length === 0">
            <tr><td colspan="4" class="p-16 text-center text-gray-400 font-medium">Aucun axe d'amélioration défini.</td></tr>
          </tbody>
          <tbody v-else class="divide-y divide-gray-50">
            <tr v-for="axe in filteredAxes" :key="axe._id" class="hover:bg-gray-50 transition-colors">
              <td class="p-4 font-black text-[#423B71] flex items-center gap-2">
                <i class="fas fa-bullseye text-[#8A79E2]"></i> {{ axe.titre }}
              </td>
              <td class="p-4 text-sm text-gray-600 font-medium max-w-md truncate">{{ axe.description || '-' }}</td>
              <td class="p-4 text-sm text-gray-700 font-medium">{{ axe.createur.prenom }} {{ axe.createur.nom }}</td>
              <td class="p-4 text-center">
                <span :class="['px-3 py-1 text-xs font-bold rounded-full', getStatusBadgeClass(axe.statut)]">{{ axe.statut }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <div class="w-full md:w-80 flex flex-col gap-6">
      
      <div class="bg-[#EFEAFB] rounded-2xl p-6 flex justify-center items-center h-48 relative overflow-hidden">
        <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#8A79E2] to-transparent"></div>
        <i class="fas fa-chart-line text-6xl text-[#8A79E2] relative z-10"></i>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-start gap-4 mb-4">
          <div class="text-[#8A79E2] mt-1"><i class="fas fa-info-circle"></i></div>
          <div>
            <h4 class="text-sm font-bold text-gray-800 mb-1">Nouveauté</h4>
            <p class="text-xs text-gray-500 leading-relaxed">
              Créez un axe d'amélioration et affectez-le à tous vos incidents qualités liés pour piloter efficacement les grandes lignes de votre amélioration continue.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4 pt-4 border-t border-gray-100">
          <div class="text-[#8A79E2] mt-1"><i class="fas fa-lightbulb"></i></div>
          <div>
            <h4 class="text-sm font-bold text-gray-800 mb-1">En savoir plus</h4>
            <p class="text-xs text-gray-500 leading-relaxed">
              Découvrez comment <a href="#" class="text-[#8A79E2] underline hover:text-[#7262c8]">répondre aux indicateurs 31 et 32 de Qualiopi grâce au Tableau d'Amélioration Continue</a>.
            </p>
          </div>
        </div>
      </div>

    </div>

    <AdminCreateIncidentModal 
      :showModal="isModalOpen" 
      @close="isModalOpen = false"
      @submit="handleIncidentSubmit"
    />

    <IncidentDetailsPanel 
      :isOpen="isDetailsPanelOpen" 
      :incidentId="selectedIncidentId"
      @close="isDetailsPanelOpen = false"
      @updated="fetchIncidents" 
    />

    <CreateAxeModal 
      :showModal="isAxeModalOpen"
      @close="isAxeModalOpen = false"
      @submit="handleCreateAxe"
    />

  </div>
</template>