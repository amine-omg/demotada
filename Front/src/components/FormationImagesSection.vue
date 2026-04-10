<script setup lang="ts">
import { useFormationBuilderStore } from '../stores/formationBuilder';
import ImageUploader from './ImageUploader.vue';

const formationBuilderStore = useFormationBuilderStore();

// Cette fonction reçoit le fichier File envoyé par ImageUploader
const handleImageUpdate = async (file: File) => {
  try {
    // ON LANCE LE VRAI UPLOAD VERS LE STORE (R2/S3)
    await formationBuilderStore.uploadFormationImage(file);
  } catch (error) {
    alert("Erreur lors de l'upload de l'image.");
  }
};

const handleImageRemove = () => {
  if (confirm("Voulez-vous vraiment supprimer l'image de couverture ?")) {
    formationBuilderStore.formation.image = '';
  }
};

const saveChanges = async () => {
  try {
    await formationBuilderStore.saveFormation();
    alert('Les modifications ont été enregistrées avec succès !');
  } catch (error) {
    alert('Erreur lors de la sauvegarde.');
  }
};
</script>

<template>
  <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h3 class="text-2xl font-bold text-[#443E73]">Image de Couverture</h3>
        <p class="text-gray-500 text-sm mt-1">
          Choisissez une image attrayante pour votre formation (Max 10MB).
        </p>
      </div>
      <button 
        @click="saveChanges" 
        class="px-6 py-3 bg-[#A7F3E9] text-[#004D40] font-bold rounded-lg shadow-sm hover:bg-[#95eeda] transition-colors flex items-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Enregistrer les modifications
      </button>
    </div>

    <ImageUploader 
      :image-url="formationBuilderStore.formation.image"
      label="Aperçu du catalogue"
      @update:image="handleImageUpdate"
      @remove:image="handleImageRemove"
    />
    
  </div>
</template>