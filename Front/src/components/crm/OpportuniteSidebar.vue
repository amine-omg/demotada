<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  opportunite: any;
  formations: any[];
  sessionsDisponibles: any[];
  availableManagers: any[];
  isAddingApprenant: boolean;
}>();

const emit = defineEmits([
  'add-apprenant', 
  'update-cursus', 
  'update-manager', 
  'create-document',
  'start-edit-cursus'
]);

const router = useRouter();

// --- ÉTATS LOCAUX (Formulaires) ---
const emailToAdd = ref('');

const isAssociatingFormation = ref(false);
const selectedFormationId = ref('');
const selectedSessionId = ref('');

const isEditingManager = ref(false);
const selectedManagerId = ref('');

// --- LOGIQUE CLIENT ---
const handleAddApprenant = () => {
  if (!emailToAdd.value.trim()) return;
  emit('add-apprenant', emailToAdd.value.trim());
  emailToAdd.value = '';
};

// --- LOGIQUE CURSUS ---
const startEditingCursus = () => {
  isAssociatingFormation.value = true;
  selectedFormationId.value = props.opportunite.formation?._id || '';
  selectedSessionId.value = props.opportunite.session?._id || '';
  emit('start-edit-cursus', selectedFormationId.value);
};

// On observe le changement de formation pour notifier le parent de filtrer les sessions
watch(selectedFormationId, (newId) => {
  if (isAssociatingFormation.value) {
    emit('start-edit-cursus', newId);
  }
});

const confirmCursus = () => {
  emit('update-cursus', {
    formationId: selectedFormationId.value,
    sessionId: selectedSessionId.value
  });
  isAssociatingFormation.value = false;
};

// --- LOGIQUE MANAGER ---
const startEditingManager = () => {
  isEditingManager.value = true;
  selectedManagerId.value = props.opportunite.proprietaire?._id || '';
};

const confirmManager = () => {
  emit('update-manager', selectedManagerId.value);
  isEditingManager.value = false;
};
</script>

<template>
  <aside class="space-y-6 w-full">
    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-full">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <i class="fas fa-user-circle text-gray-300 text-sm"></i> Client / Apprenant
        </h3>
        <span v-if="opportunite.apprenants?.length || opportunite.prospects?.length" 
              class="bg-green-50 text-green-600 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-green-100">En cours</span>
        <span v-else class="bg-yellow-50 text-yellow-600 px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-yellow-100">En attente</span>
      </div>

      <div class="space-y-3">
        <div v-for="apprenant in opportunite.apprenants" :key="apprenant._id" 
             class="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:border-[#8A79E2] hover:bg-white transition-all group">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#EFEAFB] to-[#DCD8F4] flex items-center justify-center shadow-inner relative flex-shrink-0">
            <img v-if="apprenant.photo" :src="apprenant.photo" class="w-full h-full object-cover rounded-full" />
            <span v-else class="text-[#423B71] font-black text-lg">{{ apprenant.prenom?.charAt(0) }}{{ apprenant.nom?.charAt(0) }}</span>
            <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <h4 class="text-sm font-black text-[#423B71] leading-tight truncate group-hover:text-[#8A79E2] transition-colors">{{ apprenant.prenom }} {{ apprenant.nom }}</h4>
            <div class="flex items-center gap-2 mt-0.5">
              <p class="text-[10px] font-medium text-gray-500 truncate">{{ apprenant.email }}</p>
              <span class="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Inscrit</span>
            </div>
          </div>
          <button @click="router.push(`/apprenants/${apprenant._id}`)" 
                  class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#EFEAFB] group-hover:text-[#8A79E2] group-hover:border-transparent transition-all flex-shrink-0">
            <i class="fas fa-arrow-right text-xs"></i>
          </button>
        </div>

        <div v-for="prospect in opportunite.prospects" :key="prospect._id" 
             class="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl border border-gray-100 transition-all group">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-inner relative flex-shrink-0">
            <span class="text-[#423B71] font-black text-lg">{{ prospect.prenom?.charAt(0) }}{{ prospect.nom?.charAt(0) }}</span>
            <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-yellow-400 border-2 border-white rounded-full"></div>
          </div>
          <div class="flex-1 overflow-hidden">
            <h4 class="text-sm font-black text-[#423B71] leading-tight truncate">{{ prospect.prenom }} {{ prospect.nom }}</h4>
            <div class="flex items-center gap-2 mt-0.5">
              <p class="text-[10px] font-medium text-gray-500 truncate">{{ prospect.email }}</p>
              <span class="text-[8px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">Prospect</span>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-gray-50">
        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Associer un contact</p>
        <div class="flex items-center gap-2">
          <input type="email" v-model="emailToAdd" placeholder="Email exact..." 
                 class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#423B71] outline-none transition-all focus:ring-2 focus:ring-[#8A79E2]/20" 
                 @keyup.enter="handleAddApprenant">
          <button @click="handleAddApprenant" :disabled="!emailToAdd || isAddingApprenant" 
                  class="bg-[#B2E9E1] text-[#423B71] w-10 h-10 flex-shrink-0 rounded-xl hover:bg-[#FF8B7D] hover:text-white transition-colors shadow-sm disabled:opacity-50">
            <i v-if="isAddingApprenant" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-full">
      <div class="flex justify-between items-center mb-5">
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <i class="fas fa-graduation-cap text-gray-300 text-sm"></i> Cursus visé
        </h3>
        <button v-if="opportunite.formation && !isAssociatingFormation" @click="startEditingCursus" 
                class="text-[9px] text-gray-500 hover:text-[#8A79E2] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 px-2 py-1 rounded-md transition-colors">
          <i class="fas fa-pen mr-1"></i> Éditer
        </button>
      </div>

      <div v-if="!isAssociatingFormation">
        <div v-if="opportunite.formation" class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#EFEAFB] text-[#8A79E2] flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-book-open text-xs"></i></div>
            <div>
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Programme</p>
              <p class="text-sm font-black text-[#423B71] leading-tight">{{ opportunite.formation.title }}</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 mt-0.5"><i class="fas fa-calendar-check text-xs"></i></div>
            <div class="w-full">
              <p class="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Session</p>
              <p v-if="opportunite.session" class="text-sm font-bold text-[#423B71] leading-tight">{{ opportunite.session.title }}</p>
              <p v-else class="text-xs font-bold text-yellow-600 italic bg-yellow-50 px-2 py-1 rounded border border-yellow-100 inline-block mt-0.5">À définir</p>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-col items-center justify-center py-6 bg-yellow-50/50 rounded-xl border border-yellow-100 border-dashed">
          <i class="fas fa-exclamation-triangle text-yellow-400 text-2xl mb-2"></i>
          <p class="text-xs font-bold text-yellow-700">Aucun cursus rattaché</p>
          <button @click="startEditingCursus" class="mt-3 bg-white px-4 py-2 rounded-lg text-[10px] font-black text-yellow-700 border border-yellow-200 uppercase tracking-widest">Configurer</button>
        </div>
      </div>

      <div v-else class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div class="space-y-3">
          <div>
            <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">1. Formation</label>
            <select v-model="selectedFormationId" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#423B71] outline-none">
              <option value="" disabled>Sélectionner...</option>
              <option v-for="form in formations" :key="form._id" :value="form._id">{{ form.title }}</option>
            </select>
          </div>
          <div v-if="selectedFormationId">
            <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block">2. Session (Optionnel)</label>
            <select v-model="selectedSessionId" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#423B71] outline-none">
              <option value="">-- Sans session --</option>
              <option v-for="sess in sessionsDisponibles" :key="sess._id" :value="sess._id">{{ sess.title }}</option>
            </select>
          </div>
        </div>
        <div class="flex gap-2 pt-4 mt-2 border-t border-gray-200/60">
          <button @click="isAssociatingFormation = false" class="w-1/3 bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Annuler</button>
          <button @click="confirmCursus" :disabled="!selectedFormationId" class="w-2/3 bg-[#B2E9E1] text-[#423B71] px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50">Valider</button>
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-full">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <i class="fas fa-briefcase text-gray-300 text-sm"></i> Manager
        </h3>
        <button v-if="opportunite.proprietaire && !isEditingManager" @click="startEditingManager" class="text-[9px] text-gray-500 hover:text-[#8A79E2] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 px-2 py-1 rounded-md transition-colors"><i class="fas fa-pen mr-1"></i> Éditer</button>
      </div>
      
      <div v-if="!isEditingManager">
        <div v-if="opportunite.proprietaire" class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-black text-xl shadow-inner flex-shrink-0">
            {{ opportunite.proprietaire.nom?.charAt(0) || '?' }}
          </div>
          <div class="flex-1 overflow-hidden">
            <p class="font-black text-[#423B71] text-sm leading-tight truncate">{{ opportunite.proprietaire.prenom }} {{ opportunite.proprietaire.nom }}</p>
            <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Responsable Commercial</p>
          </div>
        </div>
        <div v-else class="text-center py-4 bg-yellow-50/50 rounded-xl border border-yellow-100 border-dashed">
          <p class="text-xs font-bold text-yellow-700 mb-2">Non assigné</p>
          <button @click="startEditingManager" class="bg-white px-3 py-1 rounded-md text-[9px] font-black text-yellow-700 border border-yellow-200 uppercase tracking-widest">Assigner</button>
        </div>
      </div>

      <div v-else class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <select v-model="selectedManagerId" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-[#423B71] outline-none">
          <option value="" disabled>Choisir...</option>
          <option v-for="manager in availableManagers" :key="manager._id" :value="manager._id">{{ manager.prenom }} {{ manager.nom }}</option>
        </select>
        <div class="flex gap-2 pt-3 mt-3 border-t border-gray-200/60">
          <button @click="isEditingManager = false" class="w-1/3 bg-white border border-gray-200 text-gray-500 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Annuler</button>
          <button @click="confirmManager" :disabled="!selectedManagerId" class="w-2/3 bg-[#B2E9E1] text-[#423B71] px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">Valider</button>
        </div>
      </div>
    </div>

    <div class="bg-white p-5 rounded-2xl shadow-lg border-2 border-[#EFEAFB] relative overflow-hidden w-full">
      <div class="absolute -right-4 -top-4 text-[#EFEAFB] opacity-40 text-7xl pointer-events-none transform rotate-12"><i class="fas fa-file-contract"></i></div>
      <h3 class="text-[10px] font-black text-[#8A79E2] uppercase tracking-widest mb-4 relative z-10">Création de documents</h3>
      <div class="space-y-3 relative z-10 w-full">
        <button @click="emit('create-document', 'Convention')" :disabled="!opportunite.formation" 
                class="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#8A79E2] hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors flex-shrink-0">
              <i class="fas fa-file-signature text-base"></i>
            </div>
            <div class="truncate">
              <p class="font-black text-xs text-[#423B71] truncate">Convention</p>
              <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Modèle légal</p>
            </div>
          </div>
          <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#EFEAFB] transition-colors flex-shrink-0">
            <i class="fas fa-plus text-gray-400 group-hover:text-[#8A79E2] text-sm"></i>
          </div>
        </button>

        <button @click="emit('create-document', 'Devis')" :disabled="!opportunite.formation" 
                class="w-full flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#8A79E2] hover:shadow-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed">
          <div class="flex items-center gap-3 overflow-hidden">
            <div class="w-10 h-10 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors flex-shrink-0">
              <i class="fas fa-file-invoice-dollar text-base"></i>
            </div>
            <div class="truncate">
              <p class="font-black text-xs text-[#423B71] truncate">Devis Commercial</p>
              <p class="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Calculer tarif</p>
            </div>
          </div>
          <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-[#EFEAFB] transition-colors flex-shrink-0">
            <i class="fas fa-plus text-gray-400 group-hover:text-[#8A79E2] text-sm"></i>
          </div>
        </button>
      </div>
      <div v-if="!opportunite.formation" class="mt-4 p-3 bg-red-50 rounded-xl border border-red-100 relative z-10 flex items-start gap-2 w-full">
        <i class="fas fa-exclamation-circle text-red-500 mt-0.5 text-[10px] flex-shrink-0"></i>
        <p class="text-[9px] text-red-600 font-medium leading-tight">La formation doit être validée pour générer des documents.</p>
      </div>
    </div>
  </aside>
</template>