<template>
  <div class="h-screen bg-gray-100 flex flex-col">
    <LessonBuilderHeader
      :formation-id="formationId"
      @save="saveLesson"
      @close="closeLesson"
    />
    <div class="flex-1 flex flex-row overflow-hidden">
      
      <LessonBuilderContent
        :lesson-title="lessonTitle"
        :lesson-blocks="lessonBlocks"
        @add-block="addBlock"
        @edit-block="editBlock"
        @save-block="saveBlock"
        @cancel-block="cancelBlock"
      />
      
      <LessonBuilderSidebar
        v-model:activeTab="activeTab"
        v-model:lessonTitle="lessonTitle"
        :lesson-blocks="lessonBlocks"
        :highlight="highlightBlocksTab"
        :duree-estimee="dureeEstimee"
        :pdf-url="pdfUrl"  
        @update:pdf-url="newValue => pdfUrl = newValue"
        :objectifs="objectifs"
        :notes-pedagogiques="notesPedagogiques"  
        @update:duree-estimee="newValue => dureeEstimee = newValue"
        @update:objectifs="newValue => objectifs = newValue"
        @update:notes-pedagogiques="newValue => notesPedagogiques = newValue" 
        @edit-block="editBlock"
        @delete-block="requestDeleteBlock"
        @open-block-modal="addBlock"
        @save-lesson="saveLesson"
      />
      </div>
    </div>
</template>

// souci la nan

// encore un essai deploiement

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useFormationBuilderStore } from '../stores/formationBuilder';

// Import des composants
import LessonBuilderSidebar from '../components/lesson-builder/LessonBuilderSidebar.vue';
import LessonBuilderHeader from '../components/lesson-builder/LessonBuilderHeader.vue';
import LessonBuilderContent from '../components/lesson-builder/LessonBuilderContent.vue';
import ConfirmationModal from '../components/modals/ConfirmationModal.vue';

const router = useRouter();
const route = useRoute();
const formationBuilderStore = useFormationBuilderStore();


// On récupère les IDs depuis les paramètres de la route DE MANIÈRE SÉCURISÉE
const formationId = route.params.formationId as string;
const chapterId = route.params.chapterId as string;
const lessonId = route.params.lessonId as string;

const activeTab = ref('lesson');
const lessonTitle = ref('');
const highlightBlocksTab = ref(false);
const blockToDeleteId = ref<string | null>(null);
const dureeEstimee = ref(0);
const objectifs = ref<string[]>([]);
const lessonBlocks = ref<any[]>([]);
const notesPedagogiques = ref('');

const isLoading = ref(true);

const pdfUrl = ref('');

onMounted(async () => {
  isLoading.value = true;
  try {
    // On appelle directement notre nouvelle action pour récupérer la leçon
    const lessonData = await formationBuilderStore.fetchAndSetCurrentLesson(lessonId);

    if (lessonData) {
      // On remplit nos refs avec les données fiables reçues
      lessonTitle.value = lessonData.title;
      dureeEstimee.value = lessonData.dureeEstimee || 0;
      objectifs.value = lessonData.objectifs || [];
      pdfUrl.value = lessonData.pdfUrl || '';
      notesPedagogiques.value = lessonData.notesPedagogiques || '';
      // On s'assure que lesson.blocks est toujours un tableau
      lessonBlocks.value = lessonData.blocks || [];
    } else {
      // Si la leçon n'est pas trouvée, on redirige
      router.push(`/formations/${formationId}`);
    }
  } catch (error) {
    console.error("Erreur critique lors du chargement de la leçon:", error);
    router.push('/formations'); 
  } finally {
    isLoading.value = false;
  }
});

// Watcher pour l'animation de la sidebar
watch(activeTab, (newTab, oldTab) => {
    if (newTab === 'blocks' && oldTab === 'lesson') {
        highlightBlocksTab.value = true;
        setTimeout(() => { highlightBlocksTab.value = false; }, 1000);
    }
});

const saveLesson = async () => {
  console.log("1. Entrée dans la fonction saveLesson.");

  if (!lessonTitle.value.trim()) {
    console.log("Arrêt : le titre est vide.");
    return alert('Veuillez donner un titre à la leçon.');
  }
  
  try {
    console.log("2. Début du bloc try-catch.");

    const lessonDataToSave = {
      title: lessonTitle.value,
      dureeEstimee: dureeEstimee.value,
      objectifs: objectifs.value,
      notesPedagogiques: notesPedagogiques.value,
      blocks: lessonBlocks.value,
      pdfUrl: pdfUrl.value,
    };
    
    console.log("3. Données prêtes à être envoyées :", JSON.parse(JSON.stringify(lessonDataToSave)));

    await formationBuilderStore.saveLesson({
      lessonId: lessonId,
      lessonData: lessonDataToSave
    });
    
    console.log("4. Appel au store terminé avec succès.");

    alert('Leçon sauvegardée avec succès !');
    router.push(`/formations/${formationId}`);
    
  } catch (error) {
    console.error("5. ERREUR attrapée dans la page :", error);
    alert('Une erreur est survenue lors de la sauvegarde.');
  }
};



const closeLesson = () => {
  router.push(`/formations/${formationId}`);
};



const addBlock = (type: string) => {
  // 1. Vérification de la limite
  if (lessonBlocks.value.length >= 15) {
    alert("Limite atteinte : Une leçon ne peut pas contenir plus de 15 éléments de contenu.");
    return;
  }

  // 2. Désactiver le mode édition sur tous les autres blocs 
  // pour éviter d'avoir plusieurs formulaires ouverts en même temps
  lessonBlocks.value.forEach(block => {
    block.isEditing = false;
  });

  // 3. Création du nouveau bloc avec une structure complète et propre
  const newBlock = {
    // On peut utiliser un ID temporaire basé sur le timestamp pour la clé v-for
    _id: null, 
    type: type,
    title: '', // Titre vide par défaut
    content: '', // Utile pour le type 'text'
    src: '', // Utile pour 'image', 'video', 'file', 'google-docs'
    order: lessonBlocks.value.length, // Place le bloc à la fin
    isEditing: true, // Ouvre directement le formulaire d'édition
    isDraft: true,
    isValidated: false,
  };

  // 4. Ajout au tableau réactif
  lessonBlocks.value.push(newBlock);

  // 5. Switch automatique sur l'onglet 'lesson' pour voir le bloc apparaître immédiatement
  activeTab.value = 'lesson';
  
  console.log(`Nouveau bloc de type "${type}" ajouté à l'index ${newBlock.order}`);
};

const editBlock = (blockId: string) => {
    if (lessonBlocks.value.some(b => b.isEditing)) return;
    const block = lessonBlocks.value.find(b => b._id === blockId);
    if (block) block.isEditing = true;
};

const saveBlock = (block: any, newData: any) => {
  const blockIndex = lessonBlocks.value.findIndex(b => b === block || (b._id && b._id === block._id));
  if (blockIndex !== -1) {
    const updatedBlock = { ...lessonBlocks.value[blockIndex], ...newData, isEditing: false };
    lessonBlocks.value[blockIndex] = updatedBlock;
  }
};

const cancelBlock = (block: any) => {
  if (!block._id) {
    lessonBlocks.value = lessonBlocks.value.filter(b => b !== block);
  } else {
    const blockToCancel = lessonBlocks.value.find(b => b._id === block._id);
    if(blockToCancel) blockToCancel.isEditing = false;
  }
};

const requestDeleteBlock = (id: string) => { blockToDeleteId.value = id; };
const cancelDelete = () => { blockToDeleteId.value = null; };
const confirmDelete = () => {
  if (blockToDeleteId.value) {
    lessonBlocks.value = lessonBlocks.value.filter(b => b._id !== blockToDeleteId.value);
    blockToDeleteId.value = null;
  }
};
</script>
