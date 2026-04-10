<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated, h } from 'vue';
import { useRouter } from 'vue-router';
import { useFormationsStore } from "../stores/formations";
import { useUserStore } from '../stores/user';
import { useCategoriesStore } from '../stores/categories';

import FormationCard from '../components/FormationCard.vue';
import ScormImportModal from '../components/ScormImportModal.vue';
import TheHeader from '../components/TheHeader.vue';

import { Swiper, SwiperSlide } from 'swiper/vue';
import { Mousewheel, Keyboard } from 'swiper/modules';

import { useSessionStore } from '../stores/sessionStore';
const sessionStore = useSessionStore();

const FORMATION_STATUSES = [
  { name: 'draft', label: 'Brouillon', iconPath: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>' },
  { name: 'public', label: 'Publié', iconPath: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>' },
  { name: 'disabled', label: 'Archivé', iconPath: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>' }
];

const router = useRouter();
const formationsStore = useFormationsStore();
const userStore = useUserStore();
const categoriesStore = useCategoriesStore();

const currentUserId = computed(() => userStore.user.id);
const swiperModules = [Mousewheel, Keyboard];

const isLoading = ref(true);
const activeStatusMenuId = ref<string | null>(null);

const showCreateModal = ref(false);
const showScormModal = ref(false);
const newFormation = ref({ title: '', description: '', category: null as string | null });
const errors = ref({ title: false });

const showCreateCategoryModal = ref(false);
const newCategoryName = ref('');
const categoryErrors = ref({ name: false });
const editingCategory = ref(null);

const dataContext = computed(() => {
  const role = userStore.userRole;
  
  if (role === 'admin' && userStore.adminSelectedContext) {
    return { ecoleId: userStore.adminSelectedContext._id, name: userStore.adminSelectedContext.nom };
  }
  if (role === 'ecole' && userStore.user.associatedEntity) {
    return { ecoleId: userStore.user.associatedEntity._id, name: userStore.user.associatedEntity.nom };
  }
  if (role === 'formateur') {
    return { createdByUserId: userStore.user.id, name: '' };
  }
  return { name: '' };
});

const etablissementName = computed(() => dataContext.value.name);

const loadData = async (context: any) => {
  isLoading.value = true;
  formationsStore.formations = [];
  categoriesStore.allCategories = [];

  if (userStore.userRole === 'admin' && !context.ecoleId) {
    isLoading.value = false;
    return;
  }

  try {
    await Promise.all([
      categoriesStore.fetchCategories(context),
      formationsStore.fetchFormations(context)
    ]);
  } catch (error) {
    console.error("Erreur chargement formations:", error);
  } finally {
    isLoading.value = false;
  }

  try {
    const sessionContext = {
      ...context,
      role: userStore.userRole,
      userId: userStore.user.id
    };
    await sessionStore.fetchSessions(sessionContext);
  } catch (error) {
    console.error("Erreur chargement sessions:", error);
  }
};

onMounted(() => {
  if (currentUserId.value) {
    loadData(dataContext.value);
  }
});

onActivated(() => {
  if (currentUserId.value) {
    loadData(dataContext.value);
  }
});

watch(dataContext, (newContext) => {
  loadData(newContext);
}, { deep: true });

const handleViewFormation = (formationId: string) => {
  router.push(`/formations/${formationId}`);
};

const editFormation = (id: string) => {
  router.push(`/formations/${id}`);
};

const openCreateModal = () => {
  showCreateModal.value = true;
  newFormation.value = { title: '', description: '', category: null };
  errors.value = { title: false };
};

const closeCreateModal = () => {
  showCreateModal.value = false;
};

const createFormation = async () => {
  errors.value.title = false;
  if (!newFormation.value.title.trim()) {
    errors.value.title = true;
    return;
  }
  try {
    const createdFormation = await formationsStore.createFormation({
      title: newFormation.value.title,
      description: newFormation.value.description,
      category: newFormation.value.category,
      ecole: dataContext.value.ecoleId || null
    });
    closeCreateModal();
    router.push(`/formations/${createdFormation._id}`);
  } catch (error) {
    alert('Erreur lors de la création de la formation.');
  }
};

const handleDeleteFormation = async (formationId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.')) {
    try {
      await formationsStore.deleteFormation(formationId);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  }
};

const handleArchiveFormation = async (formationId: string) => {
  try {
    await formationsStore.updateFormationStatus(formationId, 'disabled');
  } catch (error) {
    console.error('Erreur lors de l\'archivage:', error);
    alert('Une erreur est survenue lors de l\'archivage.');
  }
};

const handlePublishFormation = async (formationId: string) => {
  if (confirm('Voulez-vous vraiment envoyer cette formation pour validation ?')) {
    try {
      await formationsStore.updateFormationValidationStatus(formationId, 'pending');
    } catch (error) {
      console.error('Erreur lors de l\'envoi pour validation:', error);
      alert('Une erreur est survenue.');
    }
  }
};

const handlePublishDirect = async (formationId: string) => {
  if (confirm('Voulez-vous vraiment publier cette formation directement ?')) {
    try {
      await formationsStore.updateFormationValidationStatus(formationId, 'approved');
      await formationsStore.updateFormationStatus(formationId, 'public');
      alert('Formation publiée avec succès.');
    } catch (error) {
      console.error('Erreur lors de la publication directe:', error);
      alert('Une erreur est survenue.');
    }
  }
};

const handleReindexFormation = async (formationId: string) => {
  try {
    await formationsStore.updateFormationStatus(formationId, 'draft');
    await formationsStore.updateFormationValidationStatus(formationId, 'rejected');
    alert('Formation réindexée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la réindexation:', error);
    alert('Une erreur est survenue lors de la réindexation.');
  }
};

const handleChangeStatus = async (formationId: string, newStatus: string) => {
  try {
    await formationsStore.updateFormationStatus(formationId, newStatus);
    closeStatusMenus();
  } catch (error) {
    alert('Erreur lors du changement de statut.');
    console.error('Erreur changement statut:', error);
  }
};

const openCreateCategoryModal = () => {
  newCategoryName.value = '';
  categoryErrors.value.name = false;
  showCreateCategoryModal.value = true;
};

const closeCreateCategoryModal = () => {
  showCreateCategoryModal.value = false;
};

const handleCreateCategory = async () => {
  categoryErrors.value.name = false;
  if (!newCategoryName.value.trim()) {
    categoryErrors.value.name = true;
    return;
  }
  try {
    await categoriesStore.createCategory({ name: newCategoryName.value });
    closeCreateCategoryModal();
    loadData(dataContext.value);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    alert("Erreur lors de la création de la catégorie.");
  }
};

const handleEditCategory = async (category: any) => {
  const newName = prompt('Nouveau nom pour la catégorie :', category.name);
  if (newName && newName.trim() !== '' && newName.trim() !== category.name) {
    try {
      await categoriesStore.updateCategory(category._id, { name: newName.trim() });
    } catch (error) {
      alert('Erreur lors du renommage de la catégorie.');
    }
  }
};

const handleDeleteCategory = async (categoryId: string) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les formations liées ne seront plus catégorisées.')) {
    try {
      await categoriesStore.deleteCategory(categoryId);
      loadData(dataContext.value);
    } catch (error) {
      alert('Erreur lors de la suppression de la catégorie.');
    }
  }
};

const openScormModal = () => {
  showScormModal.value = true;
};

const closeScormModal = () => {
  showScormModal.value = false;
};

const handleScormImport = async (file: File) => {
  try {
    const importedFormation = await formationsStore.importScormFormation(file);
    closeScormModal();
    if (importedFormation && importedFormation._id) {
      router.push(`/formations/${importedFormation._id}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'import SCORM depuis la page:", error);
    alert("L'importation a échoué. Veuillez vérifier le fichier et réessayer.");
  }
};

const uncategorizedFormations = computed(() => formationsStore.uncategorizedFormations);
const getFormationsByCategoryId = (id: string) => formationsStore.getFormationsByCategoryId(id);

const getStatusDisplay = (statusName: string) => FORMATION_STATUSES.find(s => s.name === statusName) || FORMATION_STATUSES[0];
const formatDate = (date: string) => new Date(date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const getStatusIcon = (statusName: string) => {
  const status = FORMATION_STATUSES.find(s => s.name === statusName);
  if (status && status.iconPath) {
    return h('svg', {
      class: 'w-4 h-4 text-white',
      fill: 'currentColor',
      viewBox: '0 0 24 24',
      innerHTML: status.iconPath
    });
  }
  return h('svg', {
    class: 'w-4 h-4 text-white',
    fill: 'currentColor',
    viewBox: '0 0 24 24',
    innerHTML: '<path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 100 16 8 8 0 000-16z"></path>'
  });
};

const getValidationStatusDisplay = (validationStatus: string) => {
  switch (validationStatus) {
    case 'pending': return { label: 'En attente', badgeClass: 'bg-yellow-100 text-yellow-800' };
    case 'approved': return { label: 'Validée', badgeClass: 'bg-green-100 text-green-800' };
    case 'rejected': return { label: 'Rejetée', badgeClass: 'bg-red-100 text-red-800' };
    default: return { label: 'Inconnu', badgeClass: 'bg-gray-100 text-gray-800' };
  }
};

const toggleStatusMenu = (formationId: string) => {
  activeStatusMenuId.value = activeStatusMenuId.value === formationId ? null : formationId;
};

const closeStatusMenus = () => {
  activeStatusMenuId.value = null;
};
</script>
<template>
<div class="min-h-screen flex flex-col bg-gray-50/50 mobile-wrapper">    
  <TheHeader pageTitle="Vos formations" :showBackButton="false" />
    
   <main class="flex-1 w-full p-4 md:p-6 lg:p-8 bg-transparent">
      
      <div class="flex flex-row items-center justify-between gap-4 mb-8">
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl md:text-4xl font-black text-[#423B71] tracking-tight truncate flex items-center gap-2">
            Formations
            <span v-if="etablissementName" class="text-gray-400 font-medium text-lg md:text-2xl hidden sm:inline">
              - {{ etablissementName }}
            </span>
          </h1>
          <p class="hidden md:block text-sm text-gray-500 mt-2 font-medium">Gérez, modifiez et créez vos programmes.</p>
        </div>
        
        <div class="flex items-center gap-2">
          <button @click="openScormModal" class="w-10 h-10 md:w-auto md:px-5 md:py-2.5 bg-white border border-gray-200 text-[#423B71] rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest hover:border-indigo-300 transition-all shadow-sm" title="Importer SCORM">
            <i class="fas fa-file-import"></i>
            <span class="hidden md:inline ml-2">Importer</span>
          </button>
          <button @click="openCreateModal" class="w-10 h-10 md:w-auto md:px-5 md:py-2.5 bg-[#B2E9E1] text-[#423B71] rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest hover:bg-[#FF8B7D] transition-all shadow-md active:scale-95" title="Ajouter une formation">
            <i class="fas fa-plus"></i>
            <span class="hidden md:inline ml-2">Ajouter</span>
          </button>
        </div>
      </div>

      <div class="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div class="relative flex-grow w-full">
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input 
            type="text" 
            placeholder="Rechercher une formation..." 
            class="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm"
            v-model="formationsStore.filters.search"
          >
        </div>
        <button @click="formationsStore.toggleArchivedView()" class="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors shrink-0">
          <i :class="formationsStore.showArchived ? 'fas fa-eye-slash' : 'fas fa-eye'" class="mr-2"></i>
          {{ formationsStore.showArchived ? 'Cacher archives' : 'Voir archives' }}
        </button>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 opacity-50">
        <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-xs font-black uppercase tracking-widest text-gray-400">Chargement du catalogue...</p>
      </div>

      <div v-else class="space-y-12">
        
        <section v-for="category in categoriesStore.allCategories" :key="category._id" class="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div class="flex items-center justify-between mb-5 border-b border-gray-100 pb-2 px-1">
            <h2 class="text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
              {{ category.name }}
            </h2>
            <div class="flex gap-4">
              <button @click="handleEditCategory(category)" class="text-gray-300 hover:text-indigo-500 transition-colors" title="Renommer">
                <i class="fas fa-pen text-xs"></i>
              </button>
              <button @click="handleDeleteCategory(category._id)" class="text-gray-300 hover:text-red-500 transition-colors" title="Supprimer">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>

          <div v-if="getFormationsByCategoryId(category._id).length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <FormationCard 
                v-for="formation in getFormationsByCategoryId(category._id)" 
                :key="formation._id" 
                :formation="formation" 
                @view="handleViewFormation" 
                @delete="handleDeleteFormation" 
                @archive="handleArchiveFormation" 
                @reindex="handleReindexFormation" 
                @publish="handlePublishFormation" 
                @publish-direct="handlePublishDirect"
              />
          </div>
          <div v-else class="py-8 bg-white rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center">
            <p class="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">Aucune formation dans cette catégorie</p>
          </div>
        </section>

        <section class="animate-in fade-in duration-700">
          <div class="flex items-center justify-between mb-5 border-b border-gray-100 pb-2 px-1">
            <h2 class="text-xs md:text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Sans catégorie</h2>
            <button @click="openCreateCategoryModal" class="text-[10px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg uppercase tracking-widest hover:bg-indigo-100 transition-all">
              <i class="fas fa-plus mr-1"></i> Catégorie
            </button>
          </div>

          <div v-if="uncategorizedFormations.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <FormationCard 
                v-for="formation in uncategorizedFormations" 
                :key="formation._id" 
                :formation="formation" 
                @view="handleViewFormation" 
                @delete="handleDeleteFormation" 
                @archive="handleArchiveFormation" 
                @reindex="handleReindexFormation" 
                @publish="handlePublishFormation" 
                @publish-direct="handlePublishDirect"
              />
          </div>
          <div v-else class="py-8 text-center text-gray-300 text-[10px] font-bold uppercase tracking-widest italic opacity-50">
            Toutes vos formations sont classées !
          </div>
        </section>
      </div>
    </main>

    <ScormImportModal
      :show-modal="showScormModal"
      :is-loading="formationsStore.isLoading"
      @close="closeScormModal"
      @import-scorm="handleScormImport"
    />

    <div v-if="showCreateModal" class="fixed inset-0 bg-[#1A1A2E]/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100]" @click="closeCreateModal">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300" @click.stop>
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            <i class="fas fa-magic"></i>
          </div>
          <h3 class="text-2xl font-black text-[#423B71] uppercase tracking-tight">Nouvelle formation</h3>
          <p class="text-gray-400 text-sm font-medium mt-2">Donnez un titre inspirant pour commencer.</p>
        </div>
        
        <form @submit.prevent="createFormation" class="space-y-6">
          <div>
            <input 
              type="text" 
              class="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-0 outline-none font-bold text-gray-700 transition-all" 
              :class="errors.title ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-indigo-300 shadow-inner'"
              v-model="newFormation.title" 
              placeholder="Ex: Masterclass sur la Vente"
            >
            <p v-if="errors.title" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">Le titre est requis.</p>
          </div>
          <div class="flex gap-3">
            <button type="button" @click="closeCreateModal" class="flex-1 py-4 font-black text-gray-400 uppercase text-xs tracking-widest hover:text-gray-600 transition-colors">Annuler</button>
            <button type="submit" class="flex-1 py-4 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:shadow-indigo-200 transition-all active:scale-95">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showCreateCategoryModal" class="fixed inset-0 bg-[#1A1A2E]/80 backdrop-blur-sm flex items-center justify-center p-6 z-[100]" @click="closeCreateCategoryModal">
      <div class="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in duration-300" @click.stop>
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            <i class="fas fa-folder-plus"></i>
          </div>
          <h3 class="text-2xl font-black text-[#423B71] uppercase tracking-tight">Nouvelle catégorie</h3>
          <p class="text-gray-400 text-sm font-medium mt-2">Organisez vos programmes de formation.</p>
        </div>
        
        <form @submit.prevent="handleCreateCategory" class="space-y-6">
          <div>
            <input 
              type="text" 
              class="w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-0 outline-none font-bold text-gray-700 transition-all" 
              :class="categoryErrors.name ? 'border-red-300 bg-red-50' : 'border-transparent focus:border-purple-300 shadow-inner'"
              v-model="newCategoryName" 
              placeholder="Ex: Marketing Digital"
            >
            <p v-if="categoryErrors.name" class="text-red-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-2">Le nom est requis.</p>
          </div>
          <div class="flex gap-3">
            <button type="button" @click="closeCreateCategoryModal" class="flex-1 py-4 font-black text-gray-400 uppercase text-xs tracking-widest hover:text-gray-600 transition-colors">Annuler</button>
            <button type="submit" class="flex-1 py-4 bg-purple-100 text-purple-700 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-purple-200 transition-all active:scale-95">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>