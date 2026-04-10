<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
import { useFormationBuilderStore } from '../../stores/formationBuilder'; // Pour l'upload

// --- Interface pour typer nos données ---
interface Question {
  _id: string;
  questionText: string;
  images: string[];
  order: number;
}

// --- Props ---
const props = defineProps({
  question: {
    type: Object as PropType<Question | null>,
    required: true
  },
  exerciseTitle: {
    type: String,
    required: true
  },
  questionIndex: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['save-question', 'update:question', 'delete-image']);

const store = useFormationBuilderStore();

// --- État local ---
const localQuestion = ref<Question | null>(null);

// --- Watcher pour synchroniser la prop avec l'état local ---
watch(() => props.question, (newVal) => {
  if (newVal) {
    // On fait une copie profonde pour éviter les mutations de prop
    localQuestion.value = JSON.parse(JSON.stringify(newVal));
    // On s'assure que le tableau 'images' existe toujours
    if (!localQuestion.value.images) {
      localQuestion.value.images = [];
    }
  }
}, { immediate: true, deep: true });


// --- Logique d'upload d'image ---
const imageInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const imageIndexToUpload = ref(0);

const triggerImageUpload = (index: number) => {
  imageIndexToUpload.value = index;
  imageInput.value?.click();
};

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0] || !localQuestion.value) return;
  
  isUploading.value = true;
  try {
    // On utilise l'action d'upload universelle
    const newUrl = await store.uploadLessonFile(target.files[0]);
    localQuestion.value.images[imageIndexToUpload.value] = newUrl;
  } catch (error) {
    alert("L'upload de l'image a échoué.");
  } finally {
    isUploading.value = false;
  }
};

const addImageField = () => {
  if (localQuestion.value && localQuestion.value.images.length < 4) {
    localQuestion.value.images.push('');
  }
};

const removeImageField = (index: number) => {
  if (localQuestion.value) {
    localQuestion.value.images.splice(index, 1);
  }
};

</script>

<template>
  <div class="flex-1 p-8 overflow-y-auto bg-gray-50">
    <div v-if="localQuestion">
      <h1 class="text-3xl font-bold text-gray-800">{{ exerciseTitle }}</h1>
      <h2 class="text-xl font-semibold text-[#876EC8] mb-6">Question {{ questionIndex + 1 }}</h2>
      
      <div class="mb-6">
        <label class="label">Énoncé de la question</label>
        <textarea v-model="localQuestion.questionText" rows="8" class="input-field"></textarea>
      </div>

      <div class="mb-6">
        <label class="label">Images (jusqu'à 4)</label>
        <div v-for="(imgUrl, index) in localQuestion.images" :key="index" class="flex items-center mb-3 p-3 border rounded-lg bg-white shadow-sm">
          <div class="flex-grow mr-4">
            <input 
              type="text" 
              v-model="localQuestion.images[index]" 
              class="input-field" 
              placeholder="Collez une URL ou uploadez un fichier"
            >
            <button @click="triggerImageUpload(index)" class="text-sm btn-secondary mt-2 w-full">
              Uploader une image...
            </button>
          </div>
          <div v-if="imgUrl" class="flex-shrink-0">
            <img :src="imgUrl" alt="Aperçu" class="w-20 h-20 object-cover rounded-md border">
          </div>
          <button @click="removeImageField(index)" class="ml-4 text-red-500 p-2 rounded-full hover:bg-red-100">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
        <button v-if="localQuestion.images.length < 4" @click="addImageField" class="text-sm btn-secondary mt-2">
          + Ajouter un champ d'image
        </button>
        <input type="file" ref="imageInput" @change="handleImageUpload" class="hidden" accept="image/*" />
      </div>
      
      <button @click="$emit('save-question', localQuestion)" class="btn-primary">
        Enregistrer les modifications
      </button>
    </div>
    <div v-else class="text-center text-gray-500 mt-16">
      <p>Sélectionnez une question pour l'éditer.</p>
    </div>
  </div>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-2; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md; }
.btn-primary { @apply bg-[#876EC8] text-white font-bold py-2 px-4 rounded-lg; }
.btn-secondary { @apply bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300; }
</style>