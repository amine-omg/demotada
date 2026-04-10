<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCrmStore } from '../stores/crm';
import { useFormationsStore } from '../stores/formations';
import { useSessionStore } from '../stores/sessionStore'; 
import { useEtablissementsStore } from '../stores/etablissementsStore';
import { useUserStore } from '../stores/user';
import api from '/services/api';

// Composants de structure
import TheHeader from '../components/TheHeader.vue';
import OpportuniteHeader from '../components/crm/OpportuniteHeader.vue';
import JournalActions from '../components/crm/JournalActions.vue';
import OpportuniteSidebar from '../components/crm/OpportuniteSidebar.vue';

// Modaux
import CreateProspectModal from '../components/modals/CreateProspectModal.vue';
import SendSignatureModal from '../components/modals/SendSignatureModal.vue';

// Utils
import { generateConventionPDF } from '../utils/pdfConvention';
import { generateDevisPDF } from '../utils/pdfDevis';

const userStore = useUserStore();
const crmStore = useCrmStore();
const formationStore = useFormationsStore();
const sessionStore = useSessionStore();
const etablissementsStore = useEtablissementsStore();
const route = useRoute();

const opportuniteId = route.params.id as string;
const isLoading = ref(true);

// États pour les modaux
const showProspectModal = ref(false);
const unknownEmail = ref('');
const showSignatureModal = ref(false);
const docToSignName = ref('');
const selectedActivityId = ref('');

// États de chargement spécifiques
const isAddingApprenant = ref(false);
const isGeneratingDoc = ref(false);
const isGeneratingDevis = ref(false);
const sessionsDisponibles = ref<any[]>([]);

const currencyFormatter = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

// --- INITIALISATION ---
onMounted(async () => {
  if (opportuniteId) {
    await Promise.all([
      crmStore.fetchOpportuniteById(opportuniteId),
      formationStore.fetchFormations()
    ]);
    
    const ecoleId = userStore.adminSelectedContext?._id || userStore.user.associatedEntity?._id;
    if (ecoleId) {
      // On charge l'établissement ET la config CRM (pour avoir les étapes dynamiques du pipeline)
      await Promise.all([
        etablissementsStore.fetchEtablissementById(ecoleId),
        crmStore.fetchCrmConfig(ecoleId)
      ]);
    }
    
    isLoading.value = false;
  }
});

// --- COMPUTED ---
const opportunite = computed(() => crmStore.selectedOpportunite);
const formations = computed(() => formationStore.formations);
const historiqueActivites = computed(() => (opportunite.value?.activites || []).slice().reverse());
const availableManagers = computed(() => etablissementsStore.currentEtablissement?.administrateurs || []);

// Récupération dynamique des étapes du pipeline triées par ordre
const availableStages = computed(() => {
  if (!crmStore.config?.pipelineStages) return [];
  return [...crmStore.config.pipelineStages]
    .sort((a, b) => a.order - b.order)
    .map(stage => stage.name);
});

const defaultRecipientEmail = computed(() => {
  if (opportunite.value?.apprenants?.length) return opportunite.value.apprenants[0].email;
  if (opportunite.value?.prospects?.length) return opportunite.value.prospects[0].email;
  return '';
});

// --- LOGIQUE HEADER (Mises à jour rapides) ---

const handleUpdateStage = async (newStage: string) => {
  try {
    await api.put(`/api/crm/opportunites/${opportuniteId}`, { currentStage: newStage });
    await crmStore.fetchOpportuniteById(opportuniteId);
  } catch (error) { console.error(error); }
};

const handleUpdateStatus = async (newStatus: string) => {
  try {
    await api.put(`/api/crm/opportunites/${opportuniteId}`, { statutOpportunite: newStatus });
    await crmStore.fetchOpportuniteById(opportuniteId);
  } catch (error) { console.error(error); }
};

const handleUpdateValue = async (payload: { valeur: number, isCustomValue: boolean }) => {
  try {
    await api.put(`/api/crm/opportunites/${opportuniteId}`, { 
      valeur: payload.valeur,
      isCustomValue: payload.isCustomValue // Clé pour informer Mongoose d'écraser le calcul auto
    });
    await crmStore.fetchOpportuniteById(opportuniteId);
  } catch (error) { console.error(error); }
};

// --- LOGIQUE CORE (ACTIONS) ---

const pushActivityToDb = async (activity: any) => {
  try {
    const currentActivities = opportunite.value.activites || [];
    await api.put(`/api/crm/opportunites/${opportuniteId}`, { 
      activites: [...currentActivities, activity] 
    });
    await crmStore.fetchOpportuniteById(opportuniteId);
  } catch (err) { console.error(err); }
};

const handleSaveActivity = async (payload: { type: string, content: string }) => {
  await pushActivityToDb({
    type: payload.type,
    title: payload.type,
    content: payload.content,
    date: new Date()
  });
};

const handleAddApprenant = async (email: string) => {
  isAddingApprenant.value = true;
  try {
    await api.post(`/api/crm/opportunites/${opportuniteId}/apprenants`, { email });
    await crmStore.fetchOpportuniteById(opportuniteId); 
  } catch (error: any) {
    if (error.response?.status === 404) {
      unknownEmail.value = email;
      showProspectModal.value = true;
    } else {
      alert(error.response?.data?.message || "Erreur système.");
    }
  } finally { isAddingApprenant.value = false; }
};

const saveNewProspect = async (prospectData: any) => {
  try {
    await api.post(`/api/crm/opportunites/${opportuniteId}/prospects`, prospectData);
    await crmStore.fetchOpportuniteById(opportuniteId);
    showProspectModal.value = false;
  } catch (error: any) { alert("Erreur création prospect."); }
};

const handleUpdateCursus = async (data: { formationId: string, sessionId: string }) => {
  try {
    const payload: any = { formation: data.formationId };
    if (data.sessionId) payload.session = data.sessionId;
    await api.put(`/api/crm/opportunites/${opportuniteId}`, payload);
    await crmStore.fetchOpportuniteById(opportuniteId);
  } catch (error) { console.error(error); }
};

const handleStartEditCursus = async (formationId: string) => {
  if (!formationId) {
    sessionsDisponibles.value = [];
    return;
  }
  await sessionStore.fetchSessions();
  sessionsDisponibles.value = sessionStore.sessions.filter(
    (sess) => sess.formation?._id === formationId || sess.formation === formationId
  );
};

const handleUpdateManager = async (managerId: string) => {
  try {
    await api.put(`/api/crm/opportunites/${opportuniteId}`, { proprietaire: managerId });
    await crmStore.fetchOpportuniteById(opportuniteId);
  } catch (error) { console.error(error); }
};

// --- GESTION DOCUMENTS ---

const handleCreateDocument = async (type: 'Convention' | 'Devis') => {
  await pushActivityToDb({
    type,
    title: type === 'Convention' ? 'Convention de formation' : 'Devis Commercial',
    date: new Date(),
    status: 'generated'
  });
};

const handleViewDocument = async (act: any) => {
  const etablissement = userStore.adminSelectedContext || userStore.user.associatedEntity;
  if (act.type === 'Convention') {
    isGeneratingDoc.value = true;
    await generateConventionPDF(opportunite.value, etablissement);
    isGeneratingDoc.value = false;
  } else if (act.type === 'Devis') {
    isGeneratingDevis.value = true;
    await generateDevisPDF(opportunite.value, etablissement);
    isGeneratingDevis.value = false;
  }
};

const handleTriggerSignature = (activity: any) => {
  selectedActivityId.value = activity._id;
  docToSignName.value = activity.title;
  showSignatureModal.value = true;
};

const confirmSignatureSend = async (formData: any) => {
  try {
    const activity = opportunite.value.activites.find((a: any) => a._id === selectedActivityId.value);
    if (!activity) return;

    await api.post('/api/signatures/request', {
      opportuniteId,
      activityId: selectedActivityId.value,
      documentType: activity.type,
      recipientEmail: formData.email,
      customMessage: formData.message
    });

    await crmStore.fetchOpportuniteById(opportuniteId);
    showSignatureModal.value = false;
  } catch (err) { alert("Erreur lors de l'envoi de la signature."); }
};
</script>

<template>
  <div class="min-h-screen bg-[#f8f9fa] font-sans flex flex-col w-full">
    <TheHeader pageTitle="Détail de l'opportunité" :showBackButton="true" backButtonRoute="/pipeline" />
    
    <main class="flex-1 w-full p-4 md:p-8">
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <i class="fas fa-circle-notch fa-spin text-4xl text-[#8A79E2]"></i>
      </div>

      <div v-else-if="opportunite" class="w-full">
        <OpportuniteHeader 
          :opportunite="opportunite" 
          :currencyFormatter="currencyFormatter"
          :availableStages="availableStages"
          @update-stage="handleUpdateStage"
          @update-status="handleUpdateStatus"
          @update-value="handleUpdateValue"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full items-start">
          <div class="lg:col-span-2 w-full">
            <JournalActions 
              :historiqueActivites="historiqueActivites"
              :isGeneratingDoc="isGeneratingDoc"
              :isGeneratingDevis="isGeneratingDevis"
              @save-activity="handleSaveActivity"
              @view-document="handleViewDocument"
              @trigger-signature="handleTriggerSignature"
            />
          </div>

          <div class="w-full">
            <OpportuniteSidebar 
              :opportunite="opportunite"
              :formations="formations"
              :sessionsDisponibles="sessionsDisponibles"
              :availableManagers="availableManagers"
              :isAddingApprenant="isAddingApprenant"
              @add-apprenant="handleAddApprenant"
              @update-cursus="handleUpdateCursus"
              @update-manager="handleUpdateManager"
              @create-document="handleCreateDocument"
              @start-edit-cursus="handleStartEditCursus"
            />
          </div>
        </div>
      </div>
    </main>

    <CreateProspectModal 
      :showModal="showProspectModal" 
      :initialEmail="unknownEmail" 
      @close="showProspectModal = false" 
      @save-prospect="saveNewProspect" 
    />

    <SendSignatureModal 
      :showModal="showSignatureModal" 
      :documentName="docToSignName" 
      :recipientEmail="defaultRecipientEmail" 
      @close="showSignatureModal = false" 
      @confirm-send="confirmSignatureSend" 
    />
  </div>
</template>