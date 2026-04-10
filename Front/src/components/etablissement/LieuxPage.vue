<script setup lang="ts">
import api from '/services/api';
import { ref, computed, watch } from 'vue';
import { useLieuxStore, type Lieu } from '../../stores/LieuxStore';
import LieuItem from './lieux/LieuItem.vue';
import LieuFormModal from './lieux/LieuFormModal.vue';
import DeleteLieuModal from './lieux/DeleteLieuModal.vue';

const props = defineProps<{
  etablissementId: string;
}>();

// Store Pinia
const lieuxStore = useLieuxStore();

const isModalOpen = ref(false);
const lieuToEdit = ref<Lieu | null>(null);

const isDeleteModalOpen = ref(false);
const lieuToDelete = ref<Lieu | null>(null);

const sortedLieux = computed(() => {
  return [...lieuxStore.lieux].sort((a, b) => {
    if (a.statut === 'Actif' && b.statut !== 'Actif') return -1;
    if (b.statut === 'Actif' && a.statut !== 'Actif') return 1;
    return 0;
  });
});

const isLoading = computed(() => lieuxStore.isLoading);
const error = computed(() => lieuxStore.error);

// Methods
const openAddModal = () => {
  lieuToEdit.value = null;
  isModalOpen.value = true;
};

const openEditModal = (lieu: Lieu) => {
  lieuToEdit.value = lieu;
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  lieuToEdit.value = null;
};

const openDeleteModal = (lieu: Lieu) => {
  lieuToDelete.value = lieu;
  isDeleteModalOpen.value = true;
};

const handleConfirmDelete = async () => {
    if (!lieuToDelete.value) return;
    try {
        await lieuxStore.deleteLieu(lieuToDelete.value._id);
    } catch (e) {
        console.error("Échec de la suppression du lieu:", e);
        alert(lieuxStore.error || "Une erreur est survenue.");
    } finally {
        isDeleteModalOpen.value = false;
        lieuToDelete.value = null;
    }
};

const handleSaveLieu = async (lieuData: any) => {
  try {
    if (lieuData.adresse && lieuData.adresse.formattedAddress) {
      const response = await api.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: lieuData.adresse.formattedAddress,
          format: 'json',
          limit: 1 
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        lieuData.adresse.lat = parseFloat(result.lat);
        lieuData.adresse.lng = parseFloat(result.lon); 
      }
    }

    if (lieuToEdit.value) {
      await lieuxStore.updateLieu(lieuToEdit.value._id, lieuData);
    } else {
      const dataToSave = {
        ...lieuData,
        ecole: props.etablissementId 
      };
      await lieuxStore.createLieu(dataToSave);
    }

    handleCloseModal();

  } catch (e) {
    console.error("Échec de la sauvegarde ou du géocodage du lieu:", e);
    alert("Impossible de sauvegarder le lieu. Vérifiez votre connexion ou l'adresse fournie.");
  }
};

// Utilisé en fallback direct si besoin
const handleDeleteLieu = async (lieuId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce lieu ? Cette action est irréversible.")) {
        try {
            await lieuxStore.deleteLieu(lieuId);
        } catch (e) {
            console.error("Échec de la suppression du lieu:", e);
            alert(lieuxStore.error || "Une erreur est survenue.");
        }
    }
};

const handleDeleteFromModal = (lieuId: string) => {
  handleCloseModal();
  handleDeleteLieu(lieuId);
};

const handleUpdateStatus = async (lieu: Lieu) => {
    const newStatus = lieu.statut === 'Actif' ? 'Inactif' : 'Actif';
    try {
        await lieuxStore.updateLieu(lieu._id, { statut: newStatus });
    } catch (e) {
        console.error("Échec de la mise à jour du statut:", e);
        alert(lieuxStore.error || "Une erreur inattendue est survenue.");
    }
};

watch(() => props.etablissementId, (newId) => {
  if (newId) {
    lieuxStore.fetchLieux(newId);
  }
}, { 
  immediate: true 
});
</script>

<template>
  <div class="animate-in fade-in duration-500 w-full pb-10">
    
    <div class="flex justify-between items-center mb-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm w-full">
      <div>
        <h2 class="text-xl font-bold text-[#423B71] tracking-tight">Gestion des Lieux</h2>
        <p class="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
          Ajoutez, modifiez et gérez les lieux de formation
        </p>
      </div>
      <button 
        @click="openAddModal" 
        class="px-4 py-2.5 sm:px-5 sm:py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-[#FF8B7D] hover:text-white transition-all shadow-md active:scale-95 shrink-0 flex items-center"
      >
        <i class="fas fa-plus mr-1.5 sm:mr-2"></i> Ajouter un lieu
      </button>
    </div>

    <div class="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
      
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 opacity-50">
        <div class="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-xs font-black uppercase tracking-widest text-gray-400">Chargement des lieux...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 p-6 rounded-xl border border-red-100 text-center text-red-500 font-bold text-sm">
        <i class="fas fa-exclamation-triangle mr-2"></i> Erreur: {{ error }}
      </div>

      <div v-else-if="sortedLieux.length === 0" class="py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center">
          <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-300 mb-4">
             <i class="fas fa-map-marked-alt text-2xl"></i>
          </div>
          <p class="text-xs font-bold text-[#423B71] uppercase tracking-widest text-center mb-1">Aucun lieu configuré</p>
          <p class="text-sm text-gray-400 font-medium">Commencez par ajouter votre premier lieu de formation.</p>
      </div>

      <div v-else class="space-y-4">
        <LieuItem
          v-for="lieu in sortedLieux"
          :key="lieu._id"
          :lieu="lieu"
          @edit="openEditModal(lieu)"
          @open-delete-modal="openDeleteModal(lieu)"
          @update-status="handleUpdateStatus(lieu)"
        />
      </div>

    </div>

    <LieuFormModal
      :show-modal="isModalOpen"
      :lieu="lieuToEdit"
      @close="handleCloseModal"
      @save="handleSaveLieu"
    />
    
    <DeleteLieuModal
      :show-modal="isDeleteModalOpen"
      :lieu-to-delete="lieuToDelete"
      @close="isDeleteModalOpen = false"
      @confirm-delete="handleConfirmDelete"
    />
  </div>
</template>

<style scoped>
/* Suppression des classes CSS devenues inutiles grâce aux classes utilitaires Tailwind */
</style>