<script setup lang="ts">
import { ref, watch } from 'vue';
import api from '/services/api';

const props = defineProps<{
  isOpen: boolean;
  incidentId: string | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'updated'): void; // Pour dire au tableau principal de se rafraîchir
}>();

// --- TYPES ---
interface Axe { _id: string; titre: string; }
interface ActionCorrective { _id: string; description: string; dateMiseEnOeuvre: string; responsable: { prenom: string; nom: string; } }
interface Admin { _id: string; prenom: string; nom: string; email: string; }

interface IncidentDetail {
  _id: string;
  titre: string;
  type: string;
  description: string;
  statut: string;
  gravite: string;
  nature: string;
  cause: string;
  createdAt: string;
  createur: { prenom: string; nom: string; role: string; };
  apprenantConcerne?: { prenom: string; nom: string; email: string; };
  responsable?: Admin | null; // Ajout du responsable
  contexte: {
    formation?: { title: string; };
    session?: { title: string; };
  };
  axeAmelioration?: { _id: string; titre: string; } | null;
  actionsCorrectives: ActionCorrective[];
}

// --- ÉTATS ---
const incident = ref<IncidentDetail | null>(null);
const axesList = ref<Axe[]>([]);
const adminsList = ref<Admin[]>([]); // Liste pour le dropdown d'assignation
const isLoading = ref(false);
const isUpdating = ref(false);

// Formulaire pour nouvelle action corrective
const newActionDesc = ref('');
const newActionDate = ref('');
const isAddingAction = ref(false);

// --- FETCH DATA ---
const fetchIncident = async () => {
  if (!props.incidentId) return;
  isLoading.value = true;
  try {
    const response = await api.get(`/api/incidents/${props.incidentId}`);
    incident.value = response.data || response;
  } catch (error) {
    console.error('Erreur lors du chargement de l\'incident', error);
  } finally {
    isLoading.value = false;
  }
};

const fetchAxes = async () => {
  try {
    const response = await api.get('/api/axes-amelioration');
    axesList.value = response.data || response;
  } catch (error) {
    console.error('Erreur lors du chargement des axes', error);
  }
};

const fetchAdmins = async () => {
  try {
    const response = await api.get('/api/incidents/staff/admins');
    adminsList.value = response.data || response;
  } catch (error) {
    console.error('Erreur lors du chargement des administrateurs', error);
  }
};

// Se déclenche à chaque fois qu'on ouvre le panneau ou change d'ID
watch(() => props.isOpen, (newVal) => {
  if (newVal && props.incidentId) {
    fetchIncident();
    fetchAxes();
    fetchAdmins();
    // Reset du mini-formulaire
    newActionDesc.value = '';
    newActionDate.value = '';
  } else {
    incident.value = null;
  }
});

const isDeleting = ref(false);

const handleDelete = async () => {
  if (!incident.value) return;
  
  const confirmDelete = confirm("⚠️ Êtes-vous sûr de vouloir supprimer définitivement cet incident ? Cette action est irréversible.");
  
  if (confirmDelete) {
    isDeleting.value = true;
    try {
      await api.delete(`/api/incidents/${incident.value._id}`);
      emit('updated'); // Pour rafraîchir le tableau principal
      closePanel();    // On ferme le panneau puisque l'objet n'existe plus
    } catch (error) {
      console.error("Erreur lors de la suppression de l'incident", error);
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      isDeleting.value = false;
    }
  }
};

const updateField = async (field: string, value: any) => {
  if (!incident.value) return;
  isUpdating.value = true;
  try {
    const payload = { [field]: value };
    
    const response = await api.put(`/api/incidents/${incident.value._id}`, payload);
    
    incident.value = response.data || response; 
    
    emit('updated'); 
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de ${field}`, error);
    await fetchIncident(); 
  } finally {
    isUpdating.value = false;
  }
};

// Ajouter une action corrective
const submitAction = async () => {
  if (!incident.value || !newActionDesc.value.trim()) return;
  isAddingAction.value = true;
  try {
    const payload = {
      description: newActionDesc.value,
      dateMiseEnOeuvre: newActionDate.value || undefined
    };
    const response = await api.post(`/api/incidents/${incident.value._id}/actions`, payload);
    
    // Le backend renvoie l'incident mis à jour avec la nouvelle action
    incident.value = response.data || response; 
    
    newActionDesc.value = '';
    newActionDate.value = '';
    emit('updated');
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'action', error);
  } finally {
    isAddingAction.value = false;
  }
};

// --- HELPERS UX ---
const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateString));
};

const getStatusColor = (statut: string) => {
  switch (statut) {
    case 'Nouveau': return 'bg-[#B2E9E1] text-[#423B71]'; // Turquoise comme demandé
    case 'En cours d\'analyse': return 'bg-yellow-100 text-yellow-800';
    case 'Action corrective en cours': return 'bg-purple-100 text-purple-800';
    case 'Clôturé': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const closePanel = () => {
  emit('close');
};
</script>
<template>
  <Transition name="slide">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex justify-end" @click.self="closePanel">
      
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" @click="closePanel"></div>

      <div class="relative w-full max-w-xl h-full bg-[#f8f9fa] shadow-2xl flex flex-col transform transition-transform duration-300">
        
        <div class="bg-white px-6 py-5 border-b border-gray-100 flex items-start justify-between z-10 shadow-sm">
          <div class="pr-8">
            <div class="flex items-center gap-3 mb-2">
              <span class="px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md bg-[#EFEAFB] text-[#8A79E2]">
                {{ incident?.type || 'Ticket' }}
              </span>
              <span v-if="incident" :class="['px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-md', getStatusColor(incident.statut)]">
                {{ incident.statut }}
              </span>
            </div>
            <h2 class="text-xl font-black text-[#423B71] leading-tight">
              {{ incident?.titre || 'Chargement...' }}
            </h2>
          </div>
          <button @click="closePanel" class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="isLoading" class="flex-1 flex flex-col items-center justify-center text-gray-400">
          <i class="fas fa-circle-notch fa-spin text-3xl text-[#8A79E2] mb-4"></i>
          <p class="font-medium">Chargement des détails...</p>
        </div>

        <div v-else-if="incident" class="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Plainte / Signalement</h3>
            
            <p class="text-sm text-gray-700 leading-relaxed font-medium mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
              "{{ incident.description }}"
            </p>

            <div class="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span class="block text-gray-400 font-bold mb-1">Créé par</span>
                <span class="font-bold text-[#423B71]"><i class="fas fa-user-edit text-[#8A79E2] mr-1"></i> {{ incident.createur?.prenom }} {{ incident.createur?.nom }}</span>
              </div>
              <div>
                <span class="block text-gray-400 font-bold mb-1">Date</span>
                <span class="font-bold text-[#423B71]"><i class="fas fa-calendar-alt text-[#8A79E2] mr-1"></i> {{ formatDate(incident.createdAt) }}</span>
              </div>
              
              <div class="col-span-2 pt-3 mt-1 border-t border-gray-50" v-if="incident.apprenantConcerne">
                <span class="block text-gray-400 font-bold mb-2">Concerne l'apprenant</span>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-[#EFEAFB] text-[#423B71] flex items-center justify-center text-xs font-bold">
                    {{ (incident.apprenantConcerne.prenom || '?').charAt(0) }}{{ (incident.apprenantConcerne.nom || '').charAt(0) }}
                  </div>
                  <div>
                    <div class="font-bold text-[#423B71]">{{ incident.apprenantConcerne.prenom }} {{ incident.apprenantConcerne.nom }}</div>
                    <div class="text-gray-400">{{ incident.apprenantConcerne.email }}</div>
                  </div>
                </div>
              </div>

              <div class="col-span-2 space-y-2 pt-3 mt-1 border-t border-gray-50" v-if="incident.contexte">
                <div class="flex items-center gap-2 text-gray-500 font-medium" v-if="incident.contexte?.formation || incident.contexte?.session">
                  <i class="fas fa-graduation-cap text-[#8A79E2] w-4"></i>
                  <span v-if="incident.contexte?.formation">{{ incident.contexte.formation?.title }}</span>
                  <span v-if="incident.contexte?.formation && incident.contexte?.session" class="text-gray-300">/</span>
                  <span v-if="incident.contexte?.session">{{ incident.contexte.session?.title }}</span>
                </div>

                <div class="flex items-center gap-2 text-gray-500 font-medium" v-if="incident.contexte?.chapitre">
                  <i class="fas fa-book-open text-[#8A79E2] w-4"></i>
                  <span class="text-[#423B71] font-bold">Chapitre :</span>
                  <span>{{ incident.contexte.chapitre?.title || 'Chargement...' }}</span>
                </div>

                <div class="flex items-center gap-2 text-gray-500 font-medium" v-if="incident.contexte?.activite || incident.contexte?.typeSupport">
                  <i class="fas fa-file-alt text-[#8A79E2] w-4"></i>
                  <span class="text-[#423B71] font-bold">Support :</span>
                  <span>{{ incident.contexte.activite?.title || incident.contexte?.typeSupport || 'Document' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative">
            <div v-if="isUpdating" class="absolute top-4 right-4 text-[#8A79E2] text-xs font-bold flex items-center gap-2">
              <i class="fas fa-spinner fa-spin"></i> Sauvegarde...
            </div>
            
            <h3 class="text-xs font-black text-[#8A79E2] uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">
              <i class="fas fa-clipboard-check mr-2"></i>Traitement du ticket
            </h3>

            <div class="grid grid-cols-2 gap-5">
              <div class="group col-span-2">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Responsable de la résolution</label>
                <select 
                  :value="incident.responsable?._id || ''" 
                  @change="(e) => updateField('responsable', (e.target as HTMLSelectElement).value || null)" 
                  class="w-full px-3 py-3 bg-[#DCD8F4]/30 border-2 border-transparent rounded-xl text-sm font-black text-[#423B71] focus:border-[#B2E9E1] outline-none transition-all"
                >
                  <option value="">-- Non assigné (Direction) --</option>
                  <option v-for="admin in adminsList" :key="admin._id" :value="admin._id">
                    👤 {{ admin.prenom }} {{ admin.nom }}
                  </option>
                </select>
              </div>

              <div class="group">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Statut</label>
                <select v-model="incident.statut" @change="updateField('statut', incident.statut)" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-[#423B71] focus:ring-2 focus:ring-[#8A79E2]/20 outline-none">
                  <option value="Nouveau">Nouveau</option>
                  <option value="En cours d'analyse">En cours d'analyse</option>
                  <option value="Action corrective en cours">Action corrective en cours</option>
                  <option value="Clôturé">Clôturé</option>
                </select>
              </div>

              <div class="group">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Gravité</label>
                <select v-model="incident.gravite" @change="updateField('gravite', incident.gravite)" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-[#423B71] focus:ring-2 focus:ring-[#8A79E2]/20 outline-none">
                  <option value="Faible">🟢 Faible</option>
                  <option value="Moyenne">🟡 Moyenne</option>
                  <option value="Haute">🟠 Haute</option>
                  <option value="Critique">🔴 Critique</option>
                </select>
              </div>

              <div class="group col-span-2">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Lier à un Axe d'Amélioration</label>
                <select 
                  :value="incident.axeAmelioration?._id || ''" 
                  @change="(e) => updateField('axeAmelioration', (e.target as HTMLSelectElement).value || null)" 
                  class="w-full px-3 py-2 bg-[#EFEAFB] border border-transparent rounded-lg text-sm font-bold text-[#8A79E2] focus:ring-2 focus:ring-[#8A79E2]/30 outline-none cursor-pointer"
                >
                  <option value="">-- Aucun axe lié (Incident isolé) --</option>
                  <option v-for="axe in axesList" :key="axe._id" :value="axe._id">
                    {{ axe.titre }} ({{ axe.statut }})
                  </option>
                </select>
              </div>

              <div class="group">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Nature</label>
                <input v-model="incident.nature" @blur="updateField('nature', incident.nature)" type="text" placeholder="Ex: Pédagogique, Matériel..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#423B71] outline-none focus:border-[#8A79E2]">
              </div>

              <div class="group">
                <label class="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Cause racine</label>
                <input v-model="incident.cause" @blur="updateField('cause', incident.cause)" type="text" placeholder="Ex: Mauvaise configuration" class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-[#423B71] outline-none focus:border-[#8A79E2]">
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 class="text-xs font-black text-[#8A79E2] uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">
              <i class="fas fa-tools mr-2"></i>Actions Correctives ({{ incident.actionsCorrectives?.length || 0 }})
            </h3>

            <div v-if="incident.actionsCorrectives?.length > 0" class="space-y-3 mb-6">
              <div v-for="action in incident.actionsCorrectives" :key="action._id" class="p-3 bg-green-50/50 border border-green-100 rounded-xl flex gap-3">
                <div class="mt-0.5 text-green-500"><i class="fas fa-check-circle"></i></div>
                <div>
                  <p class="text-sm font-bold text-gray-800">{{ action.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">
                    Prévue le {{ formatDate(action.dateMiseEnOeuvre) }} • Par {{ action.responsable?.prenom }}
                  </p>
                </div>
              </div>
            </div>
<div v-else class="text-center py-4 bg-gray-50 rounded-xl mb-6">
              <p class="text-xs font-bold text-gray-400">Aucune action corrective enregistrée.</p>
            </div>

            <form @submit.prevent="submitAction" class="bg-gray-50 p-4 rounded-xl border border-gray-100 border-dashed">
              <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Ajouter une action</h4>
              <div class="space-y-3">
                <textarea 
                  v-model="newActionDesc" 
                  rows="2" 
                  class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:border-[#8A79E2] resize-none"
                  placeholder="Que faut-il faire ?"
                ></textarea>
                
                <div class="flex items-center gap-3">
                  <input 
                    type="date" 
                    v-model="newActionDate"
                    class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none focus:border-[#8A79E2]"
                  >
                  <button 
                    type="submit" 
                    :disabled="isAddingAction || !newActionDesc.trim()"
                    class="px-4 py-2 bg-[#8A79E2] text-white rounded-lg text-xs font-bold uppercase hover:bg-[#7262c8] transition-colors disabled:opacity-50"
                  >
                    <i v-if="isAddingAction" class="fas fa-spinner fa-spin mr-1"></i>
                    Ajouter
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="pt-8 mt-4 border-t border-gray-100">
            <div class="bg-red-50/50 rounded-2xl p-5 border border-red-100 flex items-center justify-between gap-4">
              <div>
                <h4 class="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Zone de danger</h4>
                <p class="text-[10px] text-red-400 font-medium italic">Suppression définitive de ce ticket d'incident.</p>
              </div>
              <button 
                @click="handleDelete" 
                :disabled="isDeleting"
                class="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all active:scale-95 disabled:opacity-50"
              >
                <i v-if="isDeleting" class="fas fa-spinner fa-spin mr-2"></i>
                <i v-else class="fas fa-trash-alt mr-2"></i>
                Supprimer
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>s

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease-in-out;
}
.slide-enter-from { opacity: 0; }
.slide-enter-from .transform { transform: translateX(100%); }
.slide-leave-to { opacity: 0; }
.slide-leave-to .transform { transform: translateX(100%); }
</style>