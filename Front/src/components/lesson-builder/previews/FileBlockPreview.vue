<script setup lang="ts">
import { ref, watch } from 'vue';
import { useFormationBuilderStore } from '../../../stores/formationBuilder';

const props = defineProps<{
  block: any;
}>();

const emit = defineEmits(['edit-block', 'save-block', 'cancel-block']);

// Refs locales pour l'édition du titre et de l'URL du fichier
const editedTitle = ref(props.block.title || '');
const editedSrc = ref(props.block.src || '');

// On s'assure que si le bloc parent change, les refs locales sont mises à jour
watch(() => props.block, (newBlock) => {
  editedTitle.value = newBlock.title || '';
  editedSrc.value = newBlock.src || '';
}, { deep: true });

const formationBuilderStore = useFormationBuilderStore();
const isLoading = ref(false);
const uploadInput = ref<HTMLInputElement | null>(null);

// La fonction 'save' émet maintenant le titre ET l'URL
const save = () => {
  emit('save-block', { 
    title: editedTitle.value,
    src: editedSrc.value 
  });
};

const cancel = () => {
  emit('cancel-block');
}

// Gère l'upload du fichier
const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;

  const file = target.files[0];
  isLoading.value = true;

  try {
    const fileUrl = await formationBuilderStore.uploadLessonFile(file);
    
    // Met à jour la source avec la nouvelle URL
    editedSrc.value = fileUrl;

    // Si le titre est vide, on utilise le nom du fichier comme titre par défaut
    if (!editedTitle.value) {
      editedTitle.value = file.name;
    }

    // On sauvegarde immédiatement
    save();

  } catch (error) {
    alert("L'upload a échoué. Assurez-vous que le fichier est un PDF valide et ne dépasse pas 10MB.");
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg border group relative hover:border-purple-300 transition-colors">
    <div v-if="!block.isEditing">
      <a
        v-if="block.src"
        :href="block.src"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
      >
        <i class="fas fa-file-pdf text-2xl text-red-500 mr-4"></i>
        <span class="font-semibold text-gray-800 underline">
          {{ block.title || 'Voir le document' }}
        </span>
      </a>
      <div v-else class="text-center text-gray-400 italic py-8 cursor-pointer" @click="emit('edit-block')">
        Aucun fichier. Cliquez pour en ajouter un.
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
        <p class="text-gray-600 font-semibold">Chargement du fichier en cours...</p>
      </div>
      <div v-else>
        <label class="font-semibold text-sm text-gray-600 mb-1 block">Titre du document</label>
        <input
          v-model="editedTitle"
          type="text"
          class="w-full p-2 border rounded-md focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition"
          placeholder="Ex: Support de cours Chapitre 1"
        />
        
        <div class="relative my-4">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-300"></div></div>
          <div class="relative flex justify-center"><span class="bg-white px-2 text-sm text-gray-500">Puis</span></div>
        </div>
        
        <button 
          @click="uploadInput?.click()" 
          class="w-full text-center py-2.5 bg-gray-50 border rounded-md hover:bg-gray-100 transition-colors"
        >
          <i class="fas fa-upload mr-2 text-gray-500"></i>
          <span class="text-sm font-semibold text-gray-700">
            {{ editedSrc ? 'Changer le fichier' : 'Uploader un fichier...' }}
          </span>
        </button>
        <input type="file" ref="uploadInput" @change="handleFileSelected" class="hidden" accept="application/pdf" />
        <p v-if="editedSrc" class="text-xs text-green-600 mt-1 truncate">
          Fichier actuel : {{ editedSrc.split('/').pop() }}
        </p>

        <div class="mt-4 flex justify-end space-x-2">
          <button @click="cancel" class="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm font-semibold hover:bg-gray-300">Annuler</button>
          <button @click="save" class="px-4 py-1.5 bg-teal-500 text-white rounded-md text-sm font-semibold hover:bg-teal-600">Enregistrer</button>
        </div>
      </div>
    </div>
  </div>
</template>