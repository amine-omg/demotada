<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormationBuilderStore, type Module, type Chapter } from '../stores/formationBuilder';
import { useSessionStore } from '../stores/sessionStore';
import draggable from 'vuedraggable';
import api from '/services/api';

// Import des composants principaux
import TheHeader from '../components/TheHeader.vue';
import AppTabs, { type Tab } from '../components/AppTabs.vue';
// NOTE : FormationContentSection n'est plus utilisé directement pour la boucle, la logique est maintenant dans ce composant.
import FormationSessionsSection from '../components/FormationSessionsSection.vue';
import FormationParametersSection from '../components/FormationParametersSection.vue';
import FormationPricingSection from '../components/FormationPricingSection.vue';
import FormationDescriptionSection from '../components/FormationDescriptionSection.vue';
import FormationApprovedInstructorsSection from '../components/FormationApprovedInstructorsSection.vue';
import FormationImagesSection from '../components/FormationImagesSection.vue';
import FormationProgrammeSection from '../components/FormationProgrammeSection.vue';
import FormationPreFormationSection from '../components/FormationPreFormationSection.vue';

import type { ActivityContent } from '../stores/formationBuilder';

// Import des modales
import CreateModuleModal from '../components/CreateModuleModal.vue'; // NOUVEAU
import EditModuleModal from '../components/EditModuleModal.vue';     // NOUVEAU
import CreateChapterModal from '../components/CreateChapterModal.vue';
import EditChapterModal from '../components/EditChapterModal.vue';
import AddContentModal from '../components/AddContentModal.vue';
import CreateProgrammedSessionModal from '../components/modals/CreateProgrammedSessionModal.vue';
import FormationEvaluationsSection from '../components/FormationEvaluationsSection.vue'; 

// --- Initialisation des stores et du routeur ---
const route = useRoute();
const router = useRouter();
const formationBuilderStore = useFormationBuilderStore();
const sessionStore = useSessionStore();

// --- Computed Properties pour l'état de la formation ---
const formation = computed(() => formationBuilderStore.formation);
const modules = computed(() => formation.value.modules); // NOUVEAU : La source de vérité est maintenant 'modules'
const formationId = computed(() => formation.value._id);
const formationTitle = computed(() => formation.value.title);
const currentStatus = computed(() => formation.value.status);
const currentValidationStatus = computed(() => formation.value.validationStatus);

// --- État local pour les UI (onglets, modales, etc.) ---
const activeTab = ref('contenu');
const activeDropdown = ref<string | null>(null);

const isDuplicateModalOpen = ref(false);
const duplicateType = ref<'Module' | 'Chapter' | 'Content'>('Module');
const selectedItem = ref<any>(null);

const targetFormationId = ref('');
const targetModuleId = ref('');
const targetChapterId = ref('');

const allFormations = ref<any[]>([]);

// 2. Propriétés calculées pour rendre les sélecteurs dynamiques (dépendants les uns des autres)
const modulesOfTargetFormation = computed(() => {
  if (!targetFormationId.value) return [];
  // Si on cible la formation en cours d'édition, on a déjà les modules
  if (targetFormationId.value === formation.value?._id) {
    return formation.value?.modules || [];
  }
  // Si c'est une autre formation, on la cherche dans la liste chargée
  const target = allFormations.value.find(f => f._id === targetFormationId.value);
  return target?.modules || [];
});

const chaptersOfTargetModule = computed(() => {
  if (!targetModuleId.value) return [];
  const targetMod = modulesOfTargetFormation.value.find((m: any) => m._id === targetModuleId.value);
  return targetMod?.chapters || [];
});

const isReadyToDuplicate = computed(() => {
  if (!targetFormationId.value) return false;
  if (duplicateType.value === 'Chapter' && !targetModuleId.value) return false;
  if (duplicateType.value === 'Content' && (!targetModuleId.value || !targetChapterId.value)) return false;
  return true;
});

// 3. Fonctions d'ouverture et de confirmation
const openDuplicateModal = async (type: 'Module' | 'Chapter' | 'Content', item: any) => {
  duplicateType.value = type;
  selectedItem.value = item;
  
  // Réinitialiser les cibles (par défaut sur la formation actuelle)
  targetFormationId.value = formation.value?._id || '';
  targetModuleId.value = '';
  targetChapterId.value = '';
  
  // Charger la liste complète des formations (si pas encore fait)
  if (allFormations.value.length === 0) {
    try {
      // On utilise l'API directe pour récupérer les formations de l'école/formateur
      const response = await api.get('/api/formations');
      allFormations.value = response.data;
    } catch (error) {
      console.error("Erreur lors du chargement des formations pour duplication", error);
    }
  }
  
  isDuplicateModalOpen.value = true;
};

const handleDuplicate = async () => {
  if (!isReadyToDuplicate.value) return;

  try {
    formationBuilderStore.isLoading = true;
    
    // On prépare le payload exact pour le backend
    const payload = {
      sourceId: selectedItem.value._id,
      type: duplicateType.value,
      targetFormationId: targetFormationId.value,
      targetModuleId: targetModuleId.value,
      contentType: selectedItem.value?.type,
      targetChapterId: targetChapterId.value
    };

    // Appel à la nouvelle action du store (que tu dois créer ensuite)
    await formationBuilderStore.duplicateElement(payload);
    
    alert(`Le ${duplicateType.value === 'Module' ? 'bloc' : duplicateType.value === 'Chapter' ? 'chapitre' : 'contenu'} a été dupliqué avec succès !`);
    isDuplicateModalOpen.value = false;
    
    // Si la duplication s'est faite dans la formation qu'on regarde actuellement, on recharge !
    if (targetFormationId.value === formation.value?._id) {
        await formationBuilderStore.loadFormation(formation.value._id);
    }
    
  } catch (err: any) {
    console.error("Erreur lors de la duplication:", err);
    alert("Une erreur est survenue lors de la duplication : " + (err.response?.data?.message || err.message));
  } finally {
    formationBuilderStore.isLoading = false;
  }
};

// État pour les modules
const showCreateModuleModal = ref(false);
const showEditModuleModal = ref(false);
const editingModule = ref<Module | null>(null);

// État pour les chapitres
const showCreateChapterModal = ref(false);
const showEditChapterModal = ref(false);
const editingChapter = ref<Chapter | null>(null);
const currentModuleIdForNewChapter = ref<string | null>(null); // Pour savoir où ajouter le nouveau chapitre

// État pour les sessions
const showSessionModal = ref(false);
const editingSessionId = ref<string | null>(null);

const formationStatuses = ref([
  { value: 'draft', label: 'Brouillon', description: 'Visible par vous uniquement', dotClass: 'bg-yellow-400', badgeClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'public', label: 'Public', description: 'Visible par tous', dotClass: 'bg-teal-500', badgeClass: 'bg-teal-100 text-teal-800' },
]);

// --- Watchers ---
watch(() => route.params.id, async (id) => {
  formationBuilderStore.resetFormation();
  if (id && id !== 'new') {
    try {
      await formationBuilderStore.loadFormation(id as string);
      if (formationBuilderStore.formation._id) {
        await sessionStore.fetchSessionsAndContinuousData(formationBuilderStore.formation._id);
      }
    } catch (error) {
      console.error("FormationBuilderPage: Erreur lors du chargement de la formation:", error);
      router.push('/formations');
    }
  }
}, { immediate: true });

watch(activeTab, async (newVal) => {
  if (newVal === 'sessions' && formationId.value) {
    await sessionStore.fetchSessionsAndContinuousData(formationId.value);
  }
});

const handleEditContent = (chapter: Chapter, content: ActivityContent) => {
  const currentFormationId = formation.value?._id;
  if (!currentFormationId) {
    console.error("ID de formation manquant, navigation annulée.");
    return;
  }

  // On utilise un switch pour plus de clarté
  switch (content.type) {
    case 'Lesson':
      router.push({ 
        name: 'edit-lesson', 
        params: { 
          formationId: String(currentFormationId), 
          chapterId: String(chapter._id), 
          lessonId: String(content._id)
        } 
      });
      break;
    
    case 'Quiz':
      router.push({
        name: 'quiz-builder',
        params: { quizId: content._id }
      });
      break;
      
    case 'Exercise':
      router.push({
        name: 'exercise-builder',
        params: {
          formationId: String(currentFormationId),
          chapterId: String(chapter._id),
          exerciseId: content._id
        }
      });
      break;

    // --- CORRECTION POUR LE SUPPORT ---
    case 'Support':
      router.push({
        name: 'support-builder',
        params: {
          formationId: String(currentFormationId),
          chapterId: String(chapter._id),
          supportId: content._id
        }
      });
      break;
    // ---------------------------------
  }
};
const handleDeleteContent = async (chapterId: string, content: ActivityContent) => {
  if (confirm(`Êtes-vous sûr de vouloir supprimer "${content.title}" ?`)) {
    try {
      await formationBuilderStore.deleteContent(chapterId, content);
    } catch (error) {
      console.error("Erreur lors de la suppression du contenu:", error);
      alert("La suppression a échoué.");
    }
  }
};

// --- Fonctions de gestion des MODULES (NOUVEAU) ---
const openCreateModuleModal = () => showCreateModuleModal.value = true;
const handleCreateModule = async (moduleName: string) => {
  await formationBuilderStore.addModule({ name: moduleName });
  showCreateModuleModal.value = false;
};
const openEditModuleModal = (module: Module) => {
  editingModule.value = module;
  showEditModuleModal.value = true;
};
const handleUpdateModule = async (moduleId: string, newTitle: string) => {
  await formationBuilderStore.updateModule(moduleId, { name: newTitle });
  showEditModuleModal.value = false;
};
const handleDeleteModule = async (moduleId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce module et tous ses chapitres ?')) {
    await formationBuilderStore.deleteModule(moduleId);
  }
};
const onModuleDragEnd = async () => {
  const orderedIds = modules.value.map(module => module._id!);
  await formationBuilderStore.reorderModules(orderedIds);
};

// --- Fonctions de gestion des CHAPITRES (MISES À JOUR) ---
const openCreateChapterModal = (moduleId: string) => {
  currentModuleIdForNewChapter.value = moduleId;
  showCreateChapterModal.value = true;
};
const handleCreateChapter = async (chapterTitle: string) => {
  if (!currentModuleIdForNewChapter.value) return;
  await formationBuilderStore.addChapter(currentModuleIdForNewChapter.value, { title: chapterTitle });
  showCreateChapterModal.value = false;
};
const openEditChapterModal = (chapter: Chapter) => {
  editingChapter.value = chapter;
  showEditChapterModal.value = true;
};
const handleUpdateChapter = async (chapterId: string, newTitle: string) => {
  await formationBuilderStore.updateChapter(chapterId, { title: newTitle });
  showEditChapterModal.value = false;
};
const handleDeleteChapter = async (moduleId: string, chapterId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce chapitre ?')) {
    await formationBuilderStore.deleteChapter(moduleId, chapterId);
  }
};
const onChapterDragEnd = async (moduleId: string) => {
  const module = modules.value.find(m => m._id === moduleId);
  if (module) {
    const orderedIds = module.chapters.map(chapter => chapter._id!);
    await formationBuilderStore.reorderChapters(moduleId, orderedIds);
  }
};

// --- Fonctions de gestion du CONTENU (inchangées) ---
const handleOpenContentModal = (chapterId: string) => formationBuilderStore.openContentModal(chapterId);

const handleAddContent = async (contentData: { type: 'lesson' | 'quiz' | 'assignment' | 'task', title: string }) => {
  await formationBuilderStore.addContentToChapter(contentData);
};

// --- Fonctions de gestion des SESSIONS (inchangées) ---
const handleOpenProgrammedSessionModal = (sessionId: string | null = null) => {
  editingSessionId.value = sessionId;
  showSessionModal.value = true;
};
const handleCloseProgrammedSessionModal = () => {
  showSessionModal.value = false;
  editingSessionId.value = null;
};
const handleSaveProgrammedSession = async (sessionData: any) => {
    if (!formationId.value) return;
    const payload = { ...sessionData, formation: formationId.value, type: 'programme' };
    if (editingSessionId.value) {
      await sessionStore.updateSession(editingSessionId.value, payload, 'formation');
    } else {
      await sessionStore.createSession(payload, 'formation');
    }
    handleCloseProgrammedSessionModal();
};
const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?') && formationId.value) {
        await sessionStore.deleteSession(sessionId, formationId.value, 'formation');
    }
};

const toggleDropdown = (id: string, event: Event) => {
  event.stopPropagation(); // Empêche le clic de se propager au document et de fermer immédiatement le menu
  if (activeDropdown.value === id) {
    activeDropdown.value = null; // Ferme si on reclique sur le même
  } else {
    activeDropdown.value = id; // Ouvre le nouveau
  }
};

const closeDropdowns = () => {
  activeDropdown.value = null; // Ferme tout
};

const handleToggleContinuousEnrollment = async (isEnabled: boolean) => {
    if (!formationId.value) return;
    formationBuilderStore.toggleContinuousEnrollment(isEnabled);
    await formationBuilderStore.saveFormation();
};

// --- Autres fonctions (inchangées) ---
const handleChangeFormationStatus = async (newStatus: string) => {
  if (formationId.value) await formationBuilderStore.updateFormationStatus(formationId.value, newStatus);
};
const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};


const handleDeletePositioningTest = async () => {
  // 1. Confirmation de sécurité
  if (!confirm("Voulez-vous vraiment supprimer ce test ?")) return;

  try {
    // 2. On envoie un objet vide au backend
    await formationBuilderStore.savePositioningTest(formationId.value, {
      text: "Test de positionnement",
      questions: []
    });
    
    // 3. CRUCIAL : On met à jour le store localement pour que le v-if détecte le changement
    // Sans cette ligne, l'interface attendra le prochain rafraîchissement de page
    formationBuilderStore.formation.positioningTest = {
      text: "Test de positionnement",
      questions: []
    };

    console.log("Test supprimé avec succès");
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
    alert("Erreur lors de la suppression du test.");
  }
};

const formationTabs: Tab[] = [
  { id: 'contenu', label: 'Contenu', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M42,27H6v15c0,1.657,1.343,3,3,3h22.172c0.795,0,1.558-0.316,2.121-0.878l7.829-7.829C41.684,35.73,42,34.967,42,34.172V27z"></path><path fill="#fff" d="M31.172,41H9c-1.105,0-2-0.895-2-2V7h34v24.172c0,0.53-0.211,1.039-0.586,1.414l-7.828,7.828 C32.211,40.789,31.702,41,31.172,41z"></path><path d="M31.172,42H9c-1.654,0-3-1.346-3-3V7c0-0.553,0.447-1,1-1h34c0.553,0,1,0.447,1,1v24.172c0,0.801-0.313,1.555-0.879,2.121  l-7.828,7.828C32.727,41.688,31.973,42,31.172,42z M8,8v31c0,0.552,0.448,1,1,1h22.172c0.263,0,0.521-0.106,0.707-0.293l7.828-7.828 C39.894,31.692,40,31.435,40,31.172V8H8z"></path><path d="M41,30H31c-0.553,0-1,0.447-1,1v10h2v-9h9V30z"></path><path d="M33,18H15c-0.553,0-1,0.448-1,1s0.447,1,1,1h18c0.553,0,1-0.448,1-1S33.553,18,33,18z"></path><path d="M29,24H15c-0.553,0-1,0.448-1,1s0.447,1,1,1h14c0.553,0,1-0.448,1-1S29.553,24,29,24z"></path>
</svg>` },
  { id: 'descriptions', label: 'Descriptions', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M9.6,37c-0.282,0-0.552-0.119-0.742-0.33c-0.197-0.219-0.289-0.514-0.248-0.807c2.018-14.685,7.345-19.95,12.802-23.453l0,0  c4.254-2.731,9.137-4.542,13.445-6.14c3.802-1.41,7.085-2.627,8.437-3.979c0.287-0.287,0.717-0.372,1.09-0.217  C44.757,2.231,45,2.596,45,3v2c0,0.066-0.007,0.131-0.02,0.196C38.896,35.62,9.927,36.989,9.635,37C9.623,37,9.611,37,9.6,37z"></path><path fill="#fff" d="M21.951,11.253C16.396,14.819,11.534,19.921,9.6,34C9.6,34,38,33,44,3  C40.899,6.101,30.041,6.06,21.951,11.253z"></path><path d="M9.6,35c-0.282,0-0.552-0.119-0.742-0.33c-0.197-0.219-0.289-0.514-0.248-0.807c2.018-14.685,7.345-19.95,12.802-23.453l0,0 c4.5-2.889,9.848-4.212,14.146-5.276c3.489-0.863,6.503-1.609,7.736-2.842c0.312-0.312,0.792-0.383,1.179-0.175 c0.389,0.208,0.596,0.646,0.509,1.078C38.896,33.62,9.927,34.989,9.635,35C9.623,35,9.611,35,9.6,35z M22.491,12.094  c-5.655,3.63-9.827,8.604-11.722,20.815c5.271-0.541,25.774-4.151,31.723-27.768c-1.681,0.754-3.893,1.301-6.455,1.936  C31.666,8.158,26.713,9.384,22.491,12.094L22.491,12.094z"></path><path d="M8,45c-0.553,0-1-0.448-1-1s0.447-1,1-1c25.112,0,26.887-2.427,27.006-2.704c-0.006-0.485-2.551-0.936-3.637-1.128 c-2.545-0.451-5.429-0.962-5.402-3.257C25.986,34.232,27.357,32,39,32c0.553,0,1,0.448,1,1s-0.447,1-1,1  c-8.988,0-11.027,1.433-11.033,1.934c-0.007,0.599,2.531,1.049,3.751,1.265C34.314,37.659,37,38.135,37,40.333C37,41.848,37,45,8,45 z"></path><path d="M3.999,45c-0.151,0-0.306-0.035-0.451-0.108c-0.492-0.25-0.689-0.851-0.44-1.344C3.2,43.366,12.499,25.189,26.38,14.215  c0.435-0.343,1.062-0.267,1.404,0.165c0.343,0.433,0.27,1.062-0.164,1.405C14.091,26.48,4.982,44.273,4.893,44.452  C4.716,44.8,4.364,45,3.999,45z"></path><path d="M28.999,28c-0.14,0-0.282-0.029-0.418-0.092c-0.047-0.021-1.935-0.848-5.598-0.908c-0.552-0.009-0.992-0.464-0.983-1.017  C22.009,25.437,22.455,25,23,25c0.005,0,0.011,0,0.017,0c4.165,0.068,6.317,1.052,6.407,1.094c0.5,0.233,0.716,0.829,0.482,1.329  C29.736,27.787,29.376,28,28.999,28z"></path><path d="M35.682,21.893c-0.098,0-0.197-0.015-0.296-0.045c-0.713-0.221-2.765-0.745-6.414-0.848 c-0.552-0.016-0.987-0.476-0.972-1.028s0.486-1.007,1.028-0.971c3.896,0.11,6.157,0.692,6.949,0.937  c0.527,0.163,0.822,0.723,0.659,1.251C36.504,21.617,36.108,21.893,35.682,21.893z"></path><path d="M39.736,15.793c-0.102,0-0.206-0.016-0.308-0.049c-0.883-0.286-2.376-0.647-4.476-0.745 c-0.552-0.026-0.978-0.494-0.952-1.045c0.026-0.552,0.458-0.967,1.046-0.953c1.862,0.087,3.544,0.37,4.997,0.84 c0.525,0.17,0.813,0.734,0.644,1.259C40.551,15.523,40.158,15.793,39.736,15.793z"></path>
</svg>` },

  { id: 'programme', label: 'Programme', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M41,36H7v6c0,1.657,1.343,3,3,3h28c1.657,0,3-1.343,3-3V36z"></path><path fill="#fff" d="M38,42H10c-1.105,0-2-0.895-2-2V4h21l11,11v25C40,41.105,39.105,42,38,42z"></path><path d="M38,43H10c-1.654,0-3-1.346-3-3V4c0-0.552,0.447-1,1-1h21c0.266,0,0.52,0.105,0.707,0.293l11,11 C40.895,14.48,41,14.735,41,15v25C41,41.654,39.654,43,38,43z M9,5v35c0,0.551,0.448,1,1,1h28c0.552,0,1-0.449,1-1V15.414L28.586,5  H9z"></path><path d="M40,16H29c-0.553,0-1-0.448-1-1V4c0-0.552,0.447-1,1-1s1,0.448,1,1v10h10c0.553,0,1,0.448,1,1S40.553,16,40,16z"></path><path d="M32.932,29.898c-0.583-0.301-1.306-0.442-2.14-0.506c-1.081-0.08-2.377,0.03-3.723,0.211 c-0.891-0.958-1.654-2.093-2.253-3.291c0.492-1.527,0.877-3.013,0.978-4.232c0.067-0.837,0.044-1.56-0.191-2.173  c-0.234-0.616-0.834-1.135-1.537-1.135c-0.65,0-1.249,0.365-1.557,0.884c-0.305,0.519-0.405,1.142-0.402,1.835  c0.007,1.383,0.459,3.094,1.235,4.811c0.023,0.05,0.057,0.094,0.08,0.141c-0.124,0.372-0.211,0.723-0.355,1.098 c-0.442,1.162-0.974,2.297-1.533,3.358c-0.927,0.325-1.818,0.686-2.585,1.098c-0.824,0.442-1.527,0.927-2.056,1.483 C16.368,34.036,16,34.699,16,35.436c0,0.75,0.676,1.336,1.493,1.336c0.727,0,1.39-0.355,2.006-0.867s1.199-1.205,1.768-2.019  c0.395-0.566,0.76-1.252,1.128-1.919c0.884-0.291,1.808-0.552,2.742-0.757c0.482-0.104,0.944-0.147,1.42-0.224  c0.027,0.023,0.04,0.05,0.064,0.074c1.39,1.319,3.087,2.247,4.982,2.247c0.556,0,1.098-0.067,1.574-0.348 C33.655,32.677,34,32.101,34,31.465C34,30.772,33.518,30.199,32.932,29.898z M20.212,33.149c-0.522,0.753-1.055,1.369-1.537,1.768 c-0.482,0.402-0.897,0.569-1.182,0.569c-0.164,0-0.198-0.064-0.204-0.074c0.007-0.301,0.164-0.65,0.539-1.048 c0.388-0.408,0.988-0.834,1.731-1.232c0.254-0.137,0.599-0.244,0.884-0.375C20.366,32.878,20.292,33.035,20.212,33.149z M23.393,21.481c-0.003-0.549,0.1-0.961,0.221-1.169c0.124-0.208,0.188-0.254,0.452-0.254c0.214,0,0.221,0.003,0.335,0.301 c0.114,0.301,0.171,0.884,0.11,1.614c-0.057,0.713-0.224,1.574-0.459,2.494C23.667,23.349,23.4,22.274,23.393,21.481z M24.866,29.955c-0.562,0.124-1.105,0.305-1.657,0.455c0.372-0.79,0.747-1.587,1.061-2.407c0.003-0.01,0.003-0.017,0.007-0.023 c0.392,0.66,0.834,1.266,1.319,1.858C25.348,29.888,25.114,29.901,24.866,29.955z M32.523,31.85  c-0.154,0.09-0.492,0.171-0.921,0.171c-1.152,0-2.23-0.539-3.241-1.289c0.425-0.037,0.844-0.064,1.239-0.074  c0.392-0.01,0.763-0.007,1.098,0.017c0.733,0.057,1.319,0.198,1.647,0.365c0.328,0.171,0.368,0.251,0.368,0.425 C32.714,31.736,32.677,31.76,32.523,31.85z"></path>
</svg>` },


{ id: 'evaluations', label: 'Evaluations', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M26.454,34c-0.886,0-1.719-0.345-2.346-0.971l-9.038-9.042c-1.293-1.293-1.293-3.397,0-4.691  c1.294-1.294,3.398-1.292,4.69,0l6.693,6.695l13.883-13.883c1.074-1.074,2.711-1.256,3.975-0.544 c0.328-0.304,0.703-0.274,0.884-0.234C45.384,11.371,46,11.576,46,12.454v2c0,0.885-0.345,1.718-0.972,2.345L28.8,33.028  C28.173,33.655,27.34,34,26.454,34z"></path><path d="M44,24H4c0,0.338,0,1.662,0,2c0,11.028,8.972,20,20,20s20-8.972,20-20C44,25.662,44,24.338,44,24z"></path><circle cx="24" cy="24" r="19" fill="#fff"></circle><path d="M24,44C12.972,44,4,35.028,4,24S12.972,4,24,4s20,8.972,20,20S35.028,44,24,44z M24,6C14.075,6,6,14.075,6,24 s8.075,18,18,18s18-8.075,18-18S33.925,6,24,6z"></path><path fill="#fff" d="M26.454,31L26.454,31c-0.616,0-1.204-0.244-1.638-0.679l-8.039-8.041 c-0.905-0.905-0.905-2.372,0-3.277c0.905-0.905,2.372-0.905,3.277,0l6.4,6.402l14.59-14.59c0.905-0.905,2.372-0.905,3.277,0 c0.905,0.905,0.905,2.372,0,3.277L28.093,30.321C27.658,30.756,27.07,31,26.454,31z"></path><path d="M26.454,32c-0.886,0-1.719-0.345-2.346-0.971l-8.038-8.042c-1.293-1.293-1.293-3.397,0-4.691 c1.291-1.292,3.396-1.294,4.69,0l5.693,5.695l13.883-13.882c1.293-1.294,3.398-1.294,4.691,0C45.655,10.735,46,11.568,46,12.454 s-0.345,1.719-0.972,2.346L28.8,31.028C28.173,31.655,27.34,32,26.454,32z M18.416,19.324c-0.352,0-0.683,0.137-0.932,0.386 c-0.514,0.514-0.514,1.349,0,1.863l8.038,8.041c0.498,0.497,1.365,0.498,1.863,0l16.229-16.228C43.863,13.137,44,12.806,44,12.454 s-0.137-0.682-0.386-0.931c-0.515-0.515-1.351-0.514-1.863,0l-14.59,14.59c-0.188,0.188-0.441,0.293-0.707,0.293l0,0  c-0.266,0-0.52-0.105-0.707-0.293l-6.4-6.402C19.098,19.461,18.767,19.324,18.416,19.324z"></path>
</svg>` },

  { id: 'sessions', label: 'Sessions', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M39,44H9c-1.657,0-3-1.343-3-3v-6h36v6C42,42.657,40.657,44,39,44z"></path><path fill="#fff" d="M39,41H9c-1.105,0-2-0.895-2-2V7h34v32C41,40.105,40.105,41,39,41z"></path><path d="M39,42H9c-1.654,0-3-1.346-3-3V7c0-0.553,0.447-1,1-1h34c0.553,0,1,0.447,1,1v32C42,40.654,40.654,42,39,42z M8,8v31 c0,0.552,0.448,1,1,1h30c0.552,0,1-0.448,1-1V8H8z"></path><rect width="34" height="2" x="7" y="14"></rect><path fill="#fff" d="M12,6v2c0,1.105,0.895,2,2,2h0c1.105,0,2-0.895,2-2V6c0-1.105-0.895-2-2-2h0C12.895,4,12,4.895,12,6z"></path><path d="M14,11c-1.654,0-3-1.346-3-3V6c0-1.654,1.346-3,3-3s3,1.346,3,3v2C17,9.654,15.654,11,14,11z M14,5c-0.552,0-1,0.448-1,1v2 c0,0.552,0.448,1,1,1s1-0.448,1-1V6C15,5.448,14.552,5,14,5z"></path><path fill="#fff" d="M32,6v2c0,1.105,0.895,2,2,2h0c1.105,0,2-0.895,2-2V6c0-1.105-0.895-2-2-2h0C32.895,4,32,4.895,32,6z"></path><path d="M34,11c-1.654,0-3-1.346-3-3V6c0-1.654,1.346-3,3-3s3,1.346,3,3v2C37,9.654,35.654,11,34,11z M34,5c-0.552,0-1,0.448-1,1v2 c0,0.552,0.448,1,1,1s1-0.448,1-1V6C35,5.448,34.552,5,34,5z"></path><path d="M34,19H19c-0.552,0-1,0.447-1,1v4h-4c-0.552,0-1,0.447-1,1v5v5c0,0.553,0.448,1,1,1h15c0.552,0,1-0.447,1-1v-4h4  c0.552,0,1-0.447,1-1v-5v-5C35,19.447,34.552,19,34,19z M33,24h-3v-3h3V24z M28,29h-3v-3h3V29z M20,29v-3h3v3H20z M23,31v3h-3v-3H23 z M25,24v-3h3v3H25z M20,21h3v3h-3V21z M15,26h3v3h-3V26z M15,31h3v3h-3V31z M28,34h-3v-3h3V34z M33,29h-3v-3h3V29z"></path>
</svg>` },
  { id: 'formateurs', label: 'Formateurs', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M40.997,38.998c0-0.392-0.229-0.748-0.587-0.911l-10.413-4.733v-1.915  c1.429-1.112,2.613-2.611,3.381-4.347c1.512-0.408,2.619-1.797,2.619-3.403v-2.847c0-0.531-0.731-0.428-0.999-0.844 c-0.255-0.397-0.039-1.321-0.461-1.541l0.456-5.376c0.004-0.028,0.004-0.057,0.004-0.087c-0.004-0.159,0-1.975,0-2.005  l-21.999-0.023c-0.001,0.039,0,2.02,0,2.044c0,0.024,0.001,0.047,0.003,0.071l0.457,5.376c-0.409,0.213-0.205,1.159-0.46,1.541  c-0.281,0.423-1,0.297-1,0.844v2.847c0,1.605,1.107,2.995,2.617,3.403c0.769,1.736,1.953,3.235,3.381,4.348v1.913L7.583,38.087  c-0.357,0.163-0.585,0.519-0.585,0.911v2.867c0,1.727,1.405,3.132,3.133,3.132h27.731c1.728,0,3.135-1.405,3.135-3.132V38.998z"></path><path fill-rule="evenodd" d="M-0.002,38.999v-2 c0-0.395,0.232-0.753,0.593-0.913l8.403-2.735v-1.38c-1.064-0.757-1.941-1.692-2.565-2.843l-0.112-0.235l-0.439-0.153 c-1.06-0.495-1.88-1.625-1.88-2.741v-1.999c0-0.541,0.216-1.033,0.564-1.393l0.331-0.265l18.104-0.069l0.045,0.02 c0.571,0.351,0.956,0.984,0.956,1.707v1.999c0,1.116-0.824,2.247-1.884,2.741l-0.437,0.153l-0.112,0.235  c-0.625,1.151-1.504,2.085-2.568,2.844v1.379l8.407,2.735c0.361,0.16,0.595,0.519,0.595,0.913v2c0,1.656-1.344,3.001-3,3.001  l-22,0.001C1.341,42.001-0.002,40.655-0.002,38.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M19.998,38.998v-2 c0-0.395,0.232-0.753,0.593-0.913l8.403-2.735v-1.38c-1.064-0.757-1.941-1.692-2.565-2.843l-0.112-0.235l-0.439-0.153 c-1.06-0.495-1.88-1.625-1.88-2.741v-1.999c0-0.541,0.216-1.033,0.564-1.393l0.331-0.265l18.104-0.069l0.045,0.02 c0.571,0.351,0.956,0.984,0.956,1.707v1.999c0,1.116-0.824,2.247-1.884,2.741l-0.437,0.153l-0.112,0.235  c-0.625,1.151-1.504,2.085-2.568,2.844v1.379l8.407,2.735c0.361,0.16,0.595,0.519,0.595,0.913v2c0,1.656-1.344,3.001-3,3.001  l-22,0.001C21.341,41.999,19.998,40.654,19.998,38.998z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M9.997,28.001v8.999  h8.001v-8.999H9.997z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M8.997,36.999v-8.999  c0-0.551,0.448-1,1-1h8.001c0.551,0,1,0.449,1,1v8.999c0,0.552-0.449,1-1,1H9.997C9.445,37.999,8.997,37.551,8.997,36.999z M16.998,35.999v-6.999h-6.001v6.999H16.998z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M21.998,13.998 c-1.023-1.199-2.401-1.789-4-1.999l-2-2c-4.824,0-8.757,1.619-11,4l1,7c-0.552,0-1,0.448-1,1.001v1.999c0,0.943,1.023,2,2,2 c0.744,1.784,2.133,3.075,4,4c0.769,0.728,1.769,1.06,3,0.999c1.231,0.061,2.231-0.272,3-1c1.867-0.925,3.256-2.216,4-4 c0.977,0,2-1.057,2-2v-1.999c0-0.553-0.448-1.001-1-1.001V13.998z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M0.998,36.999v-1l9-4 c0,1.656,1.792,3,4,3s4-1.344,4-3l-0.001-0.001l9.001,4v1c0,1.104-0.896,2.001-2,2.001l-22,0.001 C1.894,39.001,0.998,38.103,0.998,36.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M10.434,30.833l-0.621-0.335 c-1.435-0.837-2.605-1.937-3.384-3.369l-0.112-0.235l-0.439-0.153c-1.06-0.495-1.88-1.625-1.88-2.741v-1.999  c0-0.541,0.216-1.033,0.564-1.393l0.331-0.265l-0.885-6.2c-0.043-0.301,0.053-0.607,0.263-0.828  c2.476-2.629,6.701-4.315,11.728-4.315c0.264,0,0.519,0.107,0.707,0.293l1.789,1.791l0.931,0.188 c1.264,0.353,2.413,1.001,3.333,2.079c0.155,0.18,0.24,0.411,0.24,0.648l-0.001,6.275l0.045,0.02 c0.571,0.351,0.956,0.984,0.956,1.707v1.999c0,1.116-0.824,2.247-1.884,2.741l-0.437,0.153l-0.112,0.235  c-0.779,1.432-1.949,2.532-3.384,3.369l-0.621,0.335l-0.264,0.224c-0.668,0.507-1.44,0.803-2.292,0.908l-0.957,0.035l-0.049-0.001 l-0.049,0.001l-0.957-0.035c-0.851-0.104-1.624-0.4-2.292-0.907L10.434,30.833z M16.31,29.273c0.072-0.068,0.155-0.125,0.243-0.169  c1.708-0.847,2.892-1.98,3.521-3.489c0.156-0.373,0.52-0.616,0.924-0.616c0.409,0,1-0.603,1-1l-0.001-2l-0.388-0.077  c-0.359-0.152-0.611-0.508-0.611-0.923v-6.576l-0.433-0.412c-0.729-0.556-1.628-0.879-2.697-1.019  c-0.219-0.028-0.421-0.128-0.577-0.284l-1.692-1.691l-1.287,0.055c-3.276,0.28-5.953,1.364-7.759,2.844l-0.492,0.459l0.927,6.484  c0.085,0.603-0.381,1.141-0.989,1.143v1.999c0,0.393,0.584,1,1,1c0.403,0,0.767,0.243,0.923,0.616  c0.629,1.509,1.813,2.643,3.521,3.489c0.088,0.044,0.171,0.101,0.243,0.169c0.537,0.508,1.256,0.776,2.263,0.725h0.1  C15.054,30.05,15.771,29.782,16.31,29.273z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M-0.002,36.999v-1  c0-0.395,0.232-0.753,0.593-0.913l9-4c0.66-0.293,1.407,0.192,1.407,0.913c0,0.972,1.231,2,3,2c1.643,0,2.841-0.891,2.985-1.815 l0.009-0.121c-0.033-0.672,0.653-1.313,1.409-0.979l9.001,4c0.361,0.16,0.595,0.519,0.595,0.913v1c0,1.656-1.344,3.001-3,3.001  l-22,0.001C1.341,40.001-0.002,38.655-0.002,36.999z M2.997,38.001l22-0.001c0.552,0,1.001-0.448,1.001-1.001l-0.001-0.348  l-7.313-3.251l-0.084,0.181c-0.767,1.443-2.556,2.419-4.601,2.419c-2.043,0-3.835-0.972-4.603-2.416l-0.084-0.184L1.998,36.65v0.349 C1.998,37.553,2.446,38.001,2.997,38.001z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M29.997,27.999v8.999  h8.001v-8.999H29.997z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M28.997,36.998v-8.999  c0-0.551,0.448-1,1-1h8.001c0.551,0,1,0.449,1,1v8.999c0,0.552-0.449,1-1,1h-8.001C29.445,37.998,28.997,37.55,28.997,36.998z M36.998,35.998v-6.999h-6.001v6.999H36.998z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M41.998,13.997  c-1.023-1.199-2.401-1.789-4-1.999l-2-2c-4.824,0-8.757,1.619-11,4l1,7c-0.552,0-1,0.448-1,1.001v1.999c0,0.943,1.023,2,2,2 c0.744,1.784,2.133,3.075,4,4c0.769,0.728,1.769,1.06,3,0.999c1.231,0.061,2.231-0.272,3-1c1.867-0.925,3.256-2.216,4-4 c0.977,0,2-1.057,2-2v-1.999c0-0.553-0.448-1.001-1-1.001V13.997z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M20.998,36.998v-1l9-4  c0,1.656,1.792,3,4,3s4-1.344,4-3l-0.001-0.001l9.001,4v1c0,1.104-0.896,2.001-2,2.001l-22,0.001 C21.894,38.999,20.998,38.102,20.998,36.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M30.434,30.831l-0.621-0.335  c-1.435-0.837-2.605-1.937-3.384-3.369l-0.112-0.235l-0.439-0.153c-1.06-0.495-1.88-1.625-1.88-2.741v-1.999  c0-0.541,0.216-1.033,0.564-1.393l0.331-0.265l-0.885-6.2c-0.043-0.301,0.053-0.607,0.263-0.828  c2.476-2.629,6.701-4.315,11.728-4.315c0.264,0,0.519,0.107,0.707,0.293l1.789,1.791l0.931,0.188 c1.264,0.353,2.413,1.001,3.333,2.079c0.155,0.18,0.24,0.411,0.24,0.648l-0.001,6.275l0.045,0.02 c0.571,0.351,0.956,0.984,0.956,1.707v1.999c0,1.116-0.824,2.247-1.884,2.741l-0.437,0.153l-0.112,0.235  c-0.779,1.432-1.949,2.532-3.384,3.369l-0.621,0.335l-0.264,0.224c-0.668,0.507-1.44,0.803-2.292,0.908l-0.957,0.035l-0.049-0.001 l-0.049,0.001l-0.957-0.035c-0.851-0.104-1.624-0.4-2.292-0.907L30.434,30.831z M36.31,29.271c0.072-0.068,0.155-0.125,0.243-0.169  c1.708-0.847,2.892-1.98,3.521-3.489c0.156-0.373,0.52-0.616,0.924-0.616c0.409,0,1-0.603,1-1l-0.001-2l-0.388-0.077  c-0.359-0.152-0.611-0.508-0.611-0.923v-6.576l-0.433-0.412c-0.729-0.556-1.628-0.879-2.697-1.019  c-0.219-0.028-0.421-0.128-0.577-0.284l-1.692-1.691l-1.287,0.055c-3.276,0.28-5.953,1.364-7.759,2.844l-0.492,0.459l0.927,6.484  c0.085,0.603-0.381,1.141-0.989,1.143v1.999c0,0.393,0.584,1,1,1c0.403,0,0.767,0.243,0.923,0.616  c0.629,1.509,1.813,2.643,3.521,3.489c0.088,0.044,0.171,0.101,0.243,0.169c0.537,0.508,1.256,0.776,2.263,0.725h0.1  C35.054,30.049,35.771,29.781,36.31,29.271z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M19.998,36.998v-1 c0-0.395,0.232-0.753,0.593-0.913l9-4c0.66-0.293,1.407,0.192,1.407,0.913c0,0.972,1.231,2,3,2c1.643,0,2.841-0.891,2.985-1.815 l0.009-0.121c-0.033-0.672,0.653-1.313,1.409-0.979l9.001,4c0.361,0.16,0.595,0.519,0.595,0.913v1c0,1.656-1.344,3.001-3,3.001  l-22,0.001C21.341,39.999,19.998,38.654,19.998,36.998z M22.997,37.999l22-0.001c0.552,0,1.001-0.448,1.001-1.001l-0.001-0.348  l-7.313-3.251l-0.084,0.181c-0.767,1.443-2.556,2.419-4.601,2.419c-2.043,0-3.835-0.972-4.603-2.416l-0.084-0.184l-7.313,3.251  v0.349C21.998,37.551,22.446,37.999,22.997,37.999z" clip-rule="evenodd"></path><path fill="#fff" d="M28.997,32.998h-10l-10.999,5v1.867 c0,1.177,0.955,2.133,2.132,2.133h27.732c1.18,0,2.135-0.956,2.135-2.133v-1.867L28.997,32.998z"></path><path d="M37.862,42.997H10.131c-1.728,0-3.133-1.405-3.133-3.132v-1.867 c0-0.392,0.228-0.748,0.585-0.911l11-5c0.129-0.059,0.271-0.089,0.413-0.089h10c0.143,0,0.284,0.031,0.415,0.089l10.999,5 c0.357,0.163,0.587,0.519,0.587,0.911v1.867C40.997,41.591,39.59,42.997,37.862,42.997z M8.998,38.642v1.223  c0,0.625,0.508,1.132,1.133,1.132h27.731c0.625,0,1.135-0.507,1.135-1.132v-1.223l-10.217-4.644h-9.565L8.998,38.642z"></path><path fill="#fff" d="M18.997,25.998v7l5,4l5-4v-7H18.997z"></path><path d="M23.997,37.998c-0.221,0-0.441-0.073-0.625-0.22l-5-3.999 c-0.236-0.191-0.375-0.477-0.375-0.781v-7c0-0.552,0.448-1,1-1h10c0.553,0,1,0.448,1,1v7c0,0.304-0.137,0.591-0.375,0.781l-5,3.999  C24.439,37.925,24.218,37.998,23.997,37.998z M19.997,32.518l4,3.2l4-3.2v-5.52h-8V32.518z"></path><path fill="#fff" d="M33.305,19.153l0.692-8.155c0,0-2.215-3.1-5.6-3.1l-2.4-1.899  c-8.461,0-12,4.999-12,4.999l0.693,8.155c-0.935,0-1.693,0.756-1.693,1.691v0.847c0,1.332,1.029,2.412,2.333,2.517  c0.996,2.584,3.088,4.845,5.667,5.791c0.844,0.725,1.872,1,3,1s2.157-0.275,3-1c2.579-0.945,4.671-3.207,5.667-5.791  c1.304-0.105,2.333-1.185,2.333-2.517v-0.847C34.997,19.909,34.238,19.153,33.305,19.153z"></path><path d="M23.997,31.998c-1.395,0-2.573-0.379-3.509-1.124 c-2.536-0.985-4.691-3.113-5.872-5.781c-1.511-0.409-2.617-1.797-2.617-3.403v-0.847c0-1.104,0.668-2.055,1.623-2.469l-0.62-7.292 c-0.02-0.235,0.045-0.469,0.181-0.661c0.156-0.221,3.939-5.421,12.815-5.421c0.227,0,0.444,0.076,0.621,0.215l2.14,1.695  c3.645,0.2,5.952,3.369,6.052,3.509c0.14,0.192,0.204,0.428,0.183,0.665l-0.619,7.291c0.953,0.415,1.623,1.365,1.623,2.469v0.847  c0,1.605-1.107,2.993-2.619,3.403c-1.181,2.668-3.336,4.796-5.872,5.781C26.571,31.619,25.391,31.998,23.997,31.998z M15.027,11.31  l0.657,7.759c0.025,0.279-0.069,0.555-0.259,0.76c-0.189,0.207-0.457,0.324-0.736,0.324c-0.381,0-0.693,0.309-0.693,0.691v0.847 c0,0.803,0.608,1.456,1.415,1.521c0.383,0.031,0.715,0.279,0.853,0.636c0.925,2.405,2.872,4.403,5.076,5.211  c0.113,0.041,0.219,0.103,0.309,0.181c0.591,0.511,1.36,0.759,2.347,0.759c0.988,0,1.756-0.248,2.348-0.759 c0.091-0.077,0.195-0.14,0.309-0.181c2.204-0.808,4.151-2.804,5.076-5.209c0.14-0.357,0.471-0.605,0.853-0.637  c0.807-0.065,1.413-0.719,1.413-1.521v-0.847c0-0.381-0.311-0.691-0.692-0.691c-0.28,0-0.547-0.117-0.736-0.324 c-0.189-0.207-0.284-0.481-0.26-0.76l0.657-7.756c-0.583-0.679-2.296-2.415-4.569-2.415c-0.225,0-0.444-0.076-0.621-0.215 l-2.123-1.681C19.109,7.111,15.861,10.335,15.027,11.31z"></path>
</svg>` },
  { id: 'prix', label: 'Prix', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M46.352,8.426c-0.287-0.184-0.646-0.209-0.955-0.07L21.499,19.212l-5.538,1.886c-0.911,0.31-1.709,0.873-2.308,1.628 L5.517,33H2c-0.552,0-1,0.448-1,1v9c0,1.654,1.346,3,3,3h10.921c2.491,0,4.874-1.184,6.375-3.167 c0.843-1.114,1.892-2.481,2.978-3.892l8.439,3.541c0.244,0.103,0.52,0.104,0.765,0.004c0.246-0.101,0.441-0.294,0.543-0.539 l12.711-30.293c0.052-0.123,0.078-0.254,0.078-0.387v-2C46.81,8.927,46.637,8.61,46.352,8.426z"></path><path fill="#fff" d="M28.585,2.04l-6.764,16.12l-5.538,1.886c-0.728,0.248-1.369,0.7-1.846,1.303L6,32H2v9 c0,1.105,0.895,2,2,2h10.921c2.192,0,4.254-1.022,5.577-2.77c0.967-1.277,2.204-2.888,3.458-4.516L24,35.742l9.099,3.818  L45.81,9.267L28.585,2.04z"></path><path d="M33.099,40.561c-0.129,0-0.26-0.025-0.386-0.079l-9.099-3.818c-0.509-0.213-0.749-0.799-0.536-1.309 c0.214-0.509,0.798-0.749,1.309-0.536l8.177,3.431L44.501,9.802L29.12,3.349L17.385,31.317c-0.213,0.509-0.8,0.75-1.309,0.535 c-0.509-0.213-0.749-0.799-0.536-1.309L27.663,1.653c0.103-0.245,0.298-0.438,0.544-0.539c0.246-0.1,0.521-0.099,0.765,0.004  l17.225,7.228c0.509,0.213,0.749,0.799,0.536,1.309L34.021,39.947C33.86,40.33,33.489,40.561,33.099,40.561z"></path><path d="M30.047,26.523c-0.791,0-1.582-0.157-2.329-0.471c-3.077-1.291-4.53-4.844-3.24-7.922c1.292-3.078,4.847-4.53,7.923-3.239 c1.399,0.587,2.516,1.667,3.143,3.043c0.229,0.502,0.007,1.095-0.496,1.325c-0.502,0.228-1.095,0.007-1.325-0.496 c-0.417-0.916-1.162-1.636-2.096-2.028c-2.062-0.865-4.439,0.108-5.305,2.168c-0.419,1-0.425,2.101-0.016,3.102 c0.409,1,1.185,1.783,2.185,2.202c0.935,0.393,1.971,0.42,2.916,0.075c0.519-0.189,1.093,0.08,1.282,0.598  c0.188,0.519-0.079,1.093-0.598,1.282C31.428,26.403,30.738,26.523,30.047,26.523z"></path><path d="M34.351,28.798c-0.129,0-0.26-0.025-0.386-0.079c-0.509-0.213-0.749-0.799-0.535-1.309l3.942-9.396  c0.213-0.509,0.801-0.75,1.309-0.535c0.509,0.213,0.749,0.799,0.535,1.309l-3.942,9.396C35.113,28.567,34.742,28.798,34.351,28.798z"></path><path d="M40.707,13.651c-0.129,0-0.26-0.025-0.387-0.079c-0.509-0.213-0.749-0.8-0.535-1.309l0.27-0.644l-0.644-0.271  c-0.509-0.213-0.749-0.8-0.535-1.309c0.213-0.509,0.8-0.749,1.309-0.535l1.566,0.657c0.509,0.213,0.749,0.8,0.535,1.309 l-0.657,1.566C41.468,13.421,41.097,13.651,40.707,13.651z"></path><path d="M29.745,9.052c-0.129,0-0.26-0.025-0.387-0.079c-0.509-0.213-0.749-0.8-0.535-1.309l0.657-1.566  c0.214-0.509,0.798-0.75,1.309-0.535l1.566,0.657c0.509,0.213,0.749,0.8,0.535,1.309c-0.213,0.509-0.797,0.75-1.309,0.535 l-0.644-0.27l-0.271,0.644C30.507,8.821,30.136,9.052,29.745,9.052z"></path><path d="M31.281,36.115c-0.129,0-0.26-0.025-0.386-0.078l-1.566-0.657c-0.509-0.214-0.749-0.8-0.536-1.309 c0.214-0.51,0.8-0.749,1.309-0.536l0.644,0.271l0.271-0.644c0.214-0.51,0.8-0.749,1.309-0.535s0.749,0.8,0.535,1.309l-0.657,1.565 C32.042,35.884,31.671,36.115,31.281,36.115z"></path><path d="M14.921,44H4c-1.654,0-3-1.346-3-3v-9c0-0.552,0.448-1,1-1h3.517l8.137-10.273c0.599-0.755,1.396-1.318,2.308-1.628  l5.538-1.886c0.522-0.176,1.091,0.102,1.269,0.625c0.178,0.523-0.102,1.091-0.625,1.269l-5.538,1.886 c-0.547,0.186-1.025,0.524-1.385,0.977L6.784,32.621C6.594,32.86,6.306,33,6,33H3v8c0,0.551,0.449,1,1,1h10.921 c1.868,0,3.655-0.887,4.78-2.374c2.769-3.657,5.579-7.363,6.872-8.983c1.409-1.765,1.351-3.86,0.689-4.586  c-0.119-0.13-0.399-0.437-1.137,0.05c-1.571,1.032-8.832,5.485-9.14,5.675c-0.471,0.289-1.086,0.141-1.375-0.33 c-0.289-0.471-0.141-1.086,0.33-1.375c0.075-0.046,7.542-4.626,9.087-5.642c1.335-0.877,2.758-0.773,3.713,0.274  c1.315,1.442,1.458,4.598-0.604,7.181c-1.278,1.601-4.201,5.455-6.84,8.942C19.795,42.816,17.412,44,14.921,44z"></path>
</svg>` },
  { id: 'parametres', label: 'Paramètres', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M45.345,20.262l-3.825-1.403c-0.364-1.542-0.939-3.016-1.697-4.411l1.206-2.603c0.075-0.162,0.095-0.337,0.08-0.507h0.009  V9.47h-0.006c0.012-0.275-0.08-0.55-0.283-0.753l-2.546-2.546c-0.297-0.297-0.749-0.377-1.127-0.2l-3.704,1.716 C31.8,6.662,30.019,5.923,28.142,5.48l-1.403-3.825C26.594,1.262,26.22,1,25.8,1h-3.6c-0.42,0-0.794,0.262-0.938,0.655L19.858,5.48  c-1.877,0.442-3.658,1.182-5.311,2.206l-3.704-1.716c-0.378-0.177-0.83-0.097-1.127,0.2L7.171,8.717  C6.968,8.92,6.875,9.195,6.888,9.47H6.882v1.868h0.009c-0.015,0.17,0.004,0.344,0.08,0.507l1.206,2.603 c-0.758,1.395-1.333,2.868-1.697,4.411l-3.825,1.403C2.262,20.406,2,20.78,2,21.2v5.6c0,0.42,0.262,0.794,0.655,0.938l3.825,1.403 c0.364,1.542,0.939,3.016,1.697,4.41l-1.206,2.604c-0.059,0.128-0.079,0.262-0.082,0.397H6.879v2.084H6.89  c0.015,0.238,0.104,0.469,0.281,0.646l2.546,2.546c0.297,0.297,0.748,0.376,1.128,0.2l3.702-1.717  c1.652,1.024,3.435,1.765,5.312,2.207l1.403,3.825C21.406,46.738,21.78,47,22.2,47h3.6c0.42,0,0.794-0.262,0.938-0.655l1.403-3.825  c1.877-0.442,3.659-1.183,5.312-2.207l3.702,1.717c0.38,0.176,0.831,0.097,1.128-0.2l2.546-2.546 c0.177-0.177,0.266-0.408,0.281-0.646h0.011v-2.084h-0.009c-0.003-0.135-0.023-0.27-0.082-0.397l-1.206-2.604 c0.758-1.395,1.333-2.868,1.697-4.41l3.825-1.403C45.738,27.594,46,27.22,46,26.8v-5.6C46,20.78,45.738,20.406,45.345,20.262z M24,28.611c-2.752,0-5.043-1.994-5.517-4.611c0.474-2.618,2.765-4.611,5.517-4.611s5.043,1.994,5.517,4.611 C29.043,26.618,26.752,28.611,24,28.611z"></path><path fill="#fff" d="M45,24.8v-3.6l-4.34-1.591c-0.44-2.175-1.3-4.197-2.485-5.984l1.947-4.201l-2.546-2.546 l-4.201,1.947c-1.788-1.185-3.809-2.044-5.984-2.485L25.8,2h-3.6l-1.591,4.34c-2.175,0.44-4.197,1.3-5.984,2.485l-4.201-1.947 L7.878,9.424l1.947,4.201c-1.185,1.788-2.044,3.809-2.485,5.984L3,21.2v3.6l4.34,1.591c0.44,2.175,1.3,4.197,2.485,5.984 l-1.947,4.201l2.546,2.546l4.201-1.947c1.788,1.185,3.809,2.044,5.984,2.485L22.2,44h3.6l1.591-4.34 c2.175-0.44,4.197-1.3,5.984-2.485l4.201,1.947l2.546-2.546l-1.947-4.201c1.185-1.788,2.044-3.809,2.485-5.984L45,24.8z M24,29.611 c-3.651,0-6.611-2.96-6.611-6.611c0-3.651,2.96-6.611,6.611-6.611s6.611,2.96,6.611,6.611C30.611,26.651,27.651,29.611,24,29.611z"></path><path d="M25.8,45h-3.6c-0.42,0-0.794-0.262-0.938-0.656l-1.403-3.825c-1.876-0.442-3.658-1.182-5.312-2.206l-3.702,1.716 c-0.38,0.176-0.831,0.097-1.128-0.2l-2.546-2.546c-0.297-0.296-0.377-0.747-0.2-1.127l1.716-3.703 C7.662,30.8,6.923,29.018,6.48,27.142l-3.825-1.403C2.262,25.594,2,25.219,2,24.8v-3.6c0-0.419,0.262-0.794,0.655-0.939 l3.825-1.403c0.442-1.876,1.183-3.659,2.206-5.312L6.971,9.844c-0.177-0.381-0.097-0.831,0.2-1.127l2.546-2.545 c0.297-0.297,0.748-0.377,1.128-0.2l3.703,1.716c1.652-1.024,3.435-1.764,5.311-2.206l1.403-3.825C21.406,1.262,21.78,1,22.2,1h3.6 c0.42,0,0.794,0.262,0.938,0.656l1.403,3.825c1.876,0.442,3.658,1.182,5.311,2.206l3.703-1.716c0.38-0.177,0.831-0.097,1.128,0.2 l2.546,2.545c0.297,0.296,0.377,0.747,0.2,1.127l-1.716,3.703c1.023,1.653,1.764,3.435,2.206,5.312l3.825,1.403 C45.738,20.406,46,20.781,46,21.2v3.6c0,0.419-0.262,0.794-0.655,0.939l-3.825,1.403c-0.442,1.876-1.182,3.659-2.206,5.312 l1.716,3.703c0.177,0.381,0.097,0.831-0.2,1.127l-2.546,2.546c-0.297,0.297-0.748,0.376-1.128,0.2l-3.702-1.716 c-1.653,1.024-3.436,1.764-5.312,2.206l-1.403,3.825C26.594,44.738,26.22,45,25.8,45z M22.898,43h2.203l1.352-3.684 c0.119-0.326,0.399-0.567,0.74-0.636c2.008-0.407,3.902-1.193,5.63-2.338c0.29-0.192,0.657-0.22,0.974-0.074l3.566,1.653 l1.558-1.558l-1.652-3.567c-0.146-0.315-0.118-0.683,0.073-0.973c1.145-1.727,1.932-3.622,2.338-5.63 c0.069-0.341,0.31-0.621,0.636-0.741L44,24.102v-2.203l-3.685-1.351c-0.326-0.12-0.566-0.4-0.636-0.741 c-0.406-2.008-1.193-3.903-2.338-5.63c-0.191-0.29-0.22-0.658-0.073-0.973l1.652-3.567l-1.558-1.558l-3.567,1.653 c-0.316,0.146-0.684,0.118-0.974-0.074c-1.727-1.145-3.621-1.932-5.629-2.338c-0.341-0.069-0.621-0.31-0.74-0.636L25.102,3h-2.203 l-1.352,3.684c-0.119,0.326-0.399,0.567-0.74,0.636c-2.008,0.407-3.902,1.193-5.629,2.338c-0.29,0.192-0.655,0.22-0.974,0.074 l-3.567-1.653L9.079,9.637l1.652,3.567c0.146,0.315,0.118,0.683-0.073,0.973c-1.145,1.727-1.932,3.622-2.338,5.63 c-0.069,0.341-0.31,0.621-0.636,0.741L4,21.898v2.203l3.685,1.351c0.326,0.12,0.566,0.4,0.636,0.741 c0.406,2.008,1.193,3.903,2.338,5.63c0.191,0.29,0.22,0.658,0.073,0.973l-1.652,3.567l1.558,1.558l3.566-1.653 c0.316-0.146,0.684-0.119,0.974,0.074c1.728,1.145,3.622,1.932,5.63,2.338c0.341,0.069,0.621,0.31,0.74,0.636L22.898,43z M45,24.8 h0.01H45z M24,30.611c-4.197,0-7.611-3.415-7.611-7.611s3.414-7.611,7.611-7.611s7.611,3.415,7.611,7.611S28.197,30.611,24,30.611z M24,17.389c-3.094,0-5.611,2.517-5.611,5.611s2.518,5.611,5.611,5.611s5.611-2.517,5.611-5.611S27.094,17.389,24,17.389z"></path>
</svg>` },
];

const onActivityDragEnd = async (chapter: any) => {
  // 1. Extraire les IDs dans le nouvel ordre
  const orderedContentIds = chapter.contents.map((a: any) => a._id);
  
  console.log(`📤 Sauvegarde de l'ordre des activités pour le chapitre ${chapter.title}...`, orderedContentIds);

  try {
    // 2. Appeler l'action du store (à créer ci-dessous)
    await formationBuilderStore.reorderActivities(chapter._id, orderedContentIds);
    console.log("✅ Ordre des activités mis à jour");
  } catch (error) {
    console.error("❌ Erreur lors du réordonnancement des activités:", error);
    // Optionnel : recharger la formation pour annuler le changement visuel
    formationBuilderStore.loadFormation(formationId.value);
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>
<template>
  <div class="page-container">
    <TheHeader
      pageTitle="Retour"
      :showBackButton="true"
      backButtonRoute="/formations"
      :formationId="formationId"
      :formationTitle="formationTitle"
      :currentStatus="currentStatus"
      :formationStatuses="formationStatuses"
      :validationStatus="currentValidationStatus"
      @change-formation-status="handleChangeFormationStatus"
    />

<main class="flex-1 p-6 overflow-x-hidden w-full max-w-none">
      <AppTabs
        :active-tab="activeTab"
        :tabs="formationTabs"
        @change-tab="tab => activeTab = tab"
      />

      <div class="mt-8 space-y-6">
        <div v-if="activeTab === 'contenu'">
          
          <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div>
              <h2 class="text-xl font-bold text-[#423B71] tracking-tight">Structure du Cours</h2>
              <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                {{ modules.length }} Blocs de compétences configurés
              </p>
            </div>
            <button @click="openCreateModuleModal" class="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-[#FF8B7D] transition-all shadow-md active:scale-95 shrink-0">
              <i class="fas fa-plus mr-1.5 sm:mr-2"></i> Ajouter un module
            </button>
          </div>
          
          <draggable
            v-model="formation.modules"
            item-key="_id"
            handle=".handle-module"
            @end="onModuleDragEnd"
            class="space-y-6 w-full"
          >
            <template #item="{ element: module, index: mIdx }">
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all w-full">
                
                <div class="p-5 border-b border-gray-50 flex items-center justify-between bg-white">
                  <div class="flex items-center gap-4">
                    <div class="handle-module cursor-grab active:cursor-grabbing w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 hover:text-indigo-500 transition-colors">
                      <i class="fas fa-grip-vertical text-sm"></i>
                    </div>
                    <div>
                      <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">Module {{ (mIdx + 1).toString().padStart(2, '0') }}</span>
                      <h3 class="font-bold text-base text-[#423B71] tracking-tight">{{ module.name }}</h3>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <button 
                      @click="openCreateChapterModal(module._id!)" 
                      class="text-[10px] font-bold uppercase tracking-widest text-[#423B71] hover:text-indigo-800 transition-colors px-3 py-1.5"
                    >
                      + Chapitre
                    </button>
                    
                    <div class="relative inline-block">
                        <button @click="(e) => toggleDropdown('module-' + module._id, e)" class="w-8 h-8 rounded-lg hover:bg-gray-50 flex items-center justify-center text-gray-400 focus:outline-none">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div v-show="activeDropdown === 'module-' + module._id" class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20">
                            <button @click="openEditModuleModal(module)" class="block w-full text-left px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Renommer</button>
                            <button @click="openDuplicateModal('Module', module)" class="block w-full text-left px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Dupliquer</button>
                            <hr class="my-1 border-gray-50">
                            <button @click="handleDeleteModule(module._id!)" class="block w-full text-left px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-50">Supprimer</button>
                        </div>
                    </div>
                  </div>
                </div>

                <div class="p-5">
                  <draggable 
                    v-model="module.chapters" 
                    item-key="_id" 
                    group="chapters" 
                    handle=".handle-chapter" 
                    @end="() => onChapterDragEnd(module._id!)" 
                    class="pl-4 space-y-3 border-l border-gray-100 w-full"
                  >
                    <template #item="{ element: chapter }">
                      <div class="bg-gray-50/60 p-4 rounded-xl border border-gray-100 hover:bg-gray-100/50 transition-all w-full">
                        <div class="flex items-center justify-between mb-4">
                          <div class="flex items-center gap-3">
                            <span class="handle-chapter cursor-grab active:cursor-grabbing text-gray-300 hover:text-indigo-400"><i class="fas fa-grip-lines"></i></span>
                            <span class="font-bold text-sm text-[#423B71]">{{ chapter.title }}</span>
                          </div>
                          <div class="flex items-center gap-3">
                            <button @click="handleOpenContentModal(chapter._id!)" class="text-[9px] font-black uppercase tracking-widest text-[#423B71]">
                              + Ajouter contenu
                            </button>
                            <div class="relative inline-block">
                                <button @click="(e) => toggleDropdown('chapter-' + chapter._id, e)" class="p-1 text-gray-300 hover:text-gray-500 focus:outline-none">
                                    <i class="fas fa-ellipsis-v text-xs"></i>
                                </button>
                                <div v-show="activeDropdown === 'chapter-' + chapter._id" class="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
                                    <button @click="openEditChapterModal(chapter)" class="block w-full text-left px-4 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50">Renommer</button>
                                    <button @click="openDuplicateModal('Chapter', chapter)" class="block w-full text-left px-4 py-2 text-[11px] font-bold text-gray-600 hover:bg-gray-50">Dupliquer</button>
                                    <button @click="handleDeleteChapter(module._id!, chapter._id!)" class="block w-full text-left px-4 py-2 text-[11px] font-bold text-red-400 hover:bg-red-50">Supprimer</button>
                                </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="pl-4 space-y-2 w-full">
                          <draggable 
                            v-model="chapter.contents" 
                            item-key="_id"
                            handle=".handle-content"
                            @end="() => onActivityDragEnd(chapter)"
                            class="space-y-2 w-full"
                          >
                            <template #item="{ element: content }">
                              <div class="bg-white p-2.5 rounded-lg border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all w-full">
                                <div class="flex items-center gap-4">
                                  <span class="handle-content cursor-grab active:cursor-grabbing text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <i class="fas fa-grip-vertical text-[10px]"></i>
                                  </span>

                                  <div class="w-9 h-9 rounded-lg flex items-center justify-center text-sm bg-gray-50 text-gray-400 shadow-inner group-hover:bg-gray-100 group-hover:text-gray-500 transition-colors">
                                      <i v-if="content.type === 'Lesson'" class="fas fa-play-circle"></i>
                                      <i v-if="content.type === 'Quiz'" class="fas fa-bolt"></i>
                                      <i v-if="content.type === 'Exercise'" class="fas fa-pencil-ruler"></i>
                                      <i v-if="content.type === 'Support'" class="fas fa-download"></i>
                                  </div>

                                  <span class="text-sm font-semibold text-gray-700">{{ content.title }}</span>
                                </div>

                                <div class="relative px-2">
                                    <button @click="(e) => toggleDropdown('content-' + content._id, e)" class="w-8 h-8 rounded-lg text-gray-300 hover:bg-gray-50 flex items-center justify-center focus:outline-none">
                                        <i class="fas fa-cog text-xs"></i>
                                    </button>
                                    <div v-show="activeDropdown === 'content-' + content._id" class="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-30">
                                        <button @click="handleEditContent(chapter, content)" class="block w-full text-left px-4 py-2 text-[10px] font-black uppercase text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2">
                                            <i class="fas fa-edit opacity-40"></i> Ouvrir
                                        </button>
                                        <button @click="openDuplicateModal('Content', content)" class="block w-full text-left px-4 py-2 text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                            <i class="fas fa-clone opacity-40"></i> Dupliquer
                                        </button>
                                        <hr class="my-1 border-gray-50">
                                        <button @click="handleDeleteContent(chapter._id!, content)" class="block w-full text-left px-4 py-2 text-[10px] font-black uppercase text-red-400 hover:bg-red-50 flex items-center gap-2">
                                            <i class="fas fa-trash opacity-40"></i> Supprimer
                                        </button>
                                    </div>
                                </div>
                              </div>
                            </template>
                          </draggable>
                        </div>

                        <div v-if="!chapter.contents?.length" @click="handleOpenContentModal(chapter._id!)" class="mt-4 border border-dashed border-gray-200 rounded-xl py-5 flex flex-col items-center justify-center text-gray-300 hover:text-indigo-400 hover:border-indigo-100 cursor-pointer transition-all">
                             <i class="fas fa-plus-circle mb-1"></i>
                             <span class="text-[9px] font-black uppercase tracking-widest">Ajouter une ressource</span>
                        </div>
                      </div>
                    </template>
                  </draggable>

                  <div v-if="!module.chapters?.length" class="text-center py-10 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                      <p class="text-xs font-bold text-gray-400 uppercase tracking-widest italic">Aucun chapitre dans ce bloc</p>
                  </div>
                </div>
              </div>
            </template>
          </draggable>

          <div class="mt-8">
             <button @click="openCreateModuleModal" class="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:bg-white hover:border-indigo-200 hover:text-indigo-400 transition-all flex flex-col items-center justify-center gap-2 group">
                <i class="fas fa-layer-group text-xl opacity-20 group-hover:opacity-100 transition-opacity"></i>
                <span class="text-xs font-black uppercase tracking-widest">Nouveau Bloc de Compétences</span>
             </button>
          </div>
        </div>

        <FormationDescriptionSection v-if="activeTab === 'descriptions'" />
        <FormationImagesSection v-if="activeTab === 'images'" />
        <FormationSessionsSection
          v-if="activeTab === 'sessions'"
          :formatDate="formatDate"
          @toggle-continuous-enrollment="handleToggleContinuousEnrollment"
          @delete-session="handleDeleteSession"
          @edit-session="handleOpenProgrammedSessionModal"
          @open-create-programmed-session-modal="handleOpenProgrammedSessionModal()"
        />
        <FormationProgrammeSection v-if="activeTab === 'programme'" />
        <FormationApprovedInstructorsSection v-if="activeTab === 'formateurs'" :formationId="formationId || ''" />
        <FormationPricingSection v-if="activeTab === 'prix'" />
        <FormationParametersSection v-if="activeTab === 'parametres'" />
        <FormationEvaluationsSection v-if="activeTab === 'evaluations'" />

      </div>
    </main>

    <CreateModuleModal
      :show-modal="showCreateModuleModal"
      @close="showCreateModuleModal = false"
      @create-module="handleCreateModule"
    />

    <EditModuleModal
      :show-modal="showEditModuleModal"
      :module="editingModule"
      @close="showEditModuleModal = false"
      @update-module="handleUpdateModule"
    />

    <CreateChapterModal
      :show-modal="showCreateChapterModal"
      @close="showCreateChapterModal = false"
      @create-chapter="handleCreateChapter"
    />

    <EditChapterModal
      :show-modal="showEditChapterModal"
      :chapter-id="editingChapter?._id"
      :initial-title="editingChapter?.title"
      @close="showEditChapterModal = false"
      @update-chapter="handleUpdateChapter"
    />

    <AddContentModal
      :show-modal="formationBuilderStore.isContentModalVisible"
      @close="formationBuilderStore.closeContentModal()"
      @add-content="handleAddContent"
    />

    <CreateProgrammedSessionModal
      :show-modal="showSessionModal"
      :session-id="editingSessionId"
      :formation-id="formationId || ''"
      :initial-session-type="'programme'"
      @close="handleCloseProgrammedSessionModal"
      @save-session="handleSaveProgrammedSession"
    />

    <div v-if="isDuplicateModalOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-800">
                <i class="fas fa-copy text-indigo-500 mr-2"></i>
                Dupliquer "{{ selectedItem?.title || selectedItem?.name }}"
            </h3>
            <button @click="isDuplicateModalOpen = false" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="p-6 space-y-5">
            <p class="text-sm text-gray-600 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                Sélectionnez la destination. Une copie indépendante sera créée.
            </p>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Formation de destination</label>
                <select 
                    v-model="targetFormationId" 
                    class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                >
                    <option :value="formation._id">{{ formation.title }} (Formation actuelle)</option>
                    <option v-for="f in allFormations" :key="f._id" :value="f._id" v-show="f._id !== formation._id">
                        {{ f.title }}
                    </option>
                </select>
            </div>

            <div v-if="duplicateType === 'Chapter' || duplicateType === 'Content'">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Module de destination</label>
                <select 
                    v-model="targetModuleId" 
                    class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                >
                    <option value="" disabled selected>-- Sélectionnez un module --</option>
                    <option v-for="m in modulesOfTargetFormation" :key="m._id" :value="m._id">
                        {{ m.name }}
                    </option>
                </select>
            </div>

            <div v-if="duplicateType === 'Content' && targetModuleId">
                <label class="block text-sm font-medium text-gray-700 mb-1.5">Chapitre de destination</label>
                <select 
                    v-model="targetChapterId" 
                    class="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                >
                    <option value="" disabled selected>-- Sélectionnez un chapitre --</option>
                    <option v-for="c in chaptersOfTargetModule" :key="c._id" :value="c._id">
                        {{ c.title }}
                    </option>
                </select>
            </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
                @click="isDuplicateModalOpen = false" 
                class="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Annuler
            </button>
            <button 
                @click="handleDuplicate" 
                class="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!isReadyToDuplicate"
            >
                <span v-if="formationBuilderStore.isLoading"><i class="fas fa-spinner animate-spin mr-2"></i>Duplication...</span>
                <span v-else><i class="fas fa-check mr-2"></i>Confirmer</span>
            </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media (max-width: 767px) {
  .page-container {
    width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
  }
}
</style>