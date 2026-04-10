<script setup lang="ts">
import { ref } from 'vue';
// NOUVEAU : On importe le store pour accéder à l'action d'upload
import { useFormationBuilderStore } from '../../../stores/formationBuilder'; 

const props = defineProps<{
  block: any;
}>();

const emit = defineEmits(['edit-block', 'save-block', 'cancel-block']);

// On garde ta logique pour l'input URL
const editedSrc = ref(props.block.src || '');

// NOUVEAU : On ajoute une référence pour le store et l'état de chargement
const formationBuilderStore = useFormationBuilderStore();
const isLoading = ref(false);
const uploadInput = ref<HTMLInputElement | null>(null); // Référence pour l'input fichier

// Ta fonction 'save' reste inchangée
const save = () => {
  emit('save-block', { src: editedSrc.value });
};

// Ta fonction 'cancel' reste inchangée
const cancel = () => {
    if (!props.block._id) {
        emit('cancel-block');
    } else {  
        editedSrc.value = props.block.src;
        emit('cancel-block');
    }
}

// NOUVEAU : La fonction qui gère l'upload de fichier
const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;

  const file = target.files[0];
  isLoading.value = true;

  try {
    // 1. On appelle l'action du store qui fait l'upload et renvoie l'URL
    const fileUrl = await formationBuilderStore.uploadLessonFile(file);
    
    // 2. On met à jour la valeur locale avec la nouvelle URL
    editedSrc.value = fileUrl;

    // 3. On sauvegarde immédiatement le bloc pour que le parent mette à jour l'état
    save();

  } catch (error) {
    alert("L'upload a échoué. Assurez-vous que le fichier est une image valide et ne dépasse pas 10MB.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg border group relative hover:border-purple-300 transition-colors">
    <div v-if="!block.isEditing">
      <img
        v-if="block.src"
        :src="block.src"
        alt="Aperçu du support"
        class="w-full h-auto rounded-md max-h-96 object-contain bg-gray-100"
      />
      <div v-else class="text-center text-gray-400 italic py-8 cursor-pointer" @click="emit('edit-block')">
        Aucune image. Cliquez pour en ajouter une.
      </div>
      <button
        @click="emit('edit-block')"
        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md hover:bg-gray-200"
      >
        Modifier
      </button>
    </div>

    <div v-else>
      <div v-if="isLoading" class="text-center py-10">
        <p class="text-gray-600 font-semibold">Chargement en cours...</p>
        <p class="text-sm text-gray-500">Veuillez patienter.</p>
      </div>

      <div v-else>
        <label class="font-semibold text-sm text-gray-600 mb-1 block">URL de l'image</label>
        <input
          v-model="editedSrc"
          type="text"
          class="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
          placeholder="https://exemple.com/image.png"
        />
        <p class="text-xs text-gray-500 mt-1">Collez le lien direct vers votre image.</p>
        
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="bg-white px-2 text-sm text-gray-500">OU</span>
          </div>
        </div>
        
        <button 
          @click="uploadInput?.click()" 
          class="w-full text-center py-2.5 bg-gray-50 border rounded-md hover:bg-gray-100 transition-colors"
        >
          <i class="fas fa-upload mr-2 text-gray-500"></i>
          <span class="text-sm font-semibold text-gray-700">Uploader depuis mon ordinateur...</span>
        </button>
        <input type="file" ref="uploadInput" @change="handleFileSelected" class="hidden" accept="image/*" />

        <div class="mt-4 flex justify-end space-x-2">
          <button @click="cancel" class="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-300">Annuler</button>
          <button @click="save" class="px-4 py-1.5 bg-teal-500 text-white rounded-md text-sm font-semibold hover:bg-teal-600">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>