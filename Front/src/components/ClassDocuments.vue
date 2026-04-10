<script setup lang="ts">
import { ref, onMounted, computed, watchEffect } from 'vue';
import { useDocumentStore, type Document } from '../stores/documentStore';
import { useUserStore } from '../stores/user';

const props = defineProps<{
  sessionId: string;
}>();

const documentStore = useDocumentStore();
const userStore = useUserStore();

const newDocumentTitle = ref('');
const newDocumentType = ref<'support' | 'attestation' | 'diplome' | 'transactionnel' | 'emargement'>('support');
const newDocumentFileUrl = ref('');
const newDocumentDescription = ref('');
const newDocumentIssueDate = ref('');
const newDocumentRelatedToUser = ref('');

const isCreatingDocument = ref(false); 

const documents = computed(() => documentStore.documents);
const isLoading = computed(() => documentStore.isLoading);
const error = computed(() => documentStore.error);

const filteredDocuments = computed(() => {
  console.log("[ClassDocuments DEBUG] Computed filteredDocuments déclenché.");
  console.log("[ClassDocuments DEBUG] documents.value (du store):", documents.value);
  console.log("[ClassDocuments DEBUG] props.sessionId:", props.sessionId);

  const filtered = documents.value.filter(doc => {
    const docSessionId = typeof doc.session === 'object' && doc.session !== null ? String(doc.session._id) : doc.session;
    return docSessionId === props.sessionId;
  });
  
  console.log("[ClassDocuments DEBUG] Documents filtrés pour cette session:", filtered);
  return filtered;
});

const canAddDocument = computed(() => {
  const role = userStore.userRole;
  return role === 'admin' || role === 'formateur';
});

const documentTypeOptions = computed(() => {
  return [
    { value: 'support', label: 'Support de cours' },
  ];
});


onMounted(() => {
  console.log(`[ClassDocuments] Composant monté pour la session ID: ${props.sessionId}`);
});

watchEffect(async () => {
  if (props.sessionId && userStore.isAuthenticated) {
    console.log(`[ClassDocuments] watchEffect: Authentifié et Session ID ${props.sessionId} disponible. Chargement des documents...`);
    await documentStore.fetchDocuments({ sessionId: props.sessionId, type: 'support' }); 
  } else if (!userStore.isAuthenticated) {
    console.log("[ClassDocuments] watchEffect: Non authentifié. Réinitialisation des documents.");
    documentStore.documents = [];
  }
});


const handleCreateDocument = async () => {
  if (!newDocumentTitle.value.trim() || !newDocumentFileUrl.value.trim()) {
    alert('Le titre et l\'URL du fichier sont requis.');
    return;
  }
  if (!props.sessionId || !userStore.user.id) {
    alert('Impossible de créer le document : informations de session ou d\'utilisateur manquantes.');
    return;
  }
  if (!canAddDocument.value) {
    alert('Vous n\'êtes pas autorisé à ajouter des documents.');
    return;
  }

  try {
    const documentData: Partial<Document> = {
      title: newDocumentTitle.value,
      description: newDocumentDescription.value,
      type: newDocumentType.value, 
      fileUrl: newDocumentFileUrl.value,
      session: props.sessionId,
      createdBy: userStore.user.id,
    };

    if (['attestation', 'diplome', 'transactionnel', 'emargement'].includes(newDocumentType.value) && newDocumentIssueDate.value) {
        documentData.issueDate = new Date(newDocumentIssueDate.value).toISOString();
    }
    if (['attestation', 'diplome', 'transactionnel', 'emargement'].includes(newDocumentType.value) && newDocumentRelatedToUser.value) {
        documentData.relatedToUser = newDocumentRelatedToUser.value;
    }


    await documentStore.createDocument(documentData);
    newDocumentTitle.value = '';
    newDocumentType.value = 'support'; 
    newDocumentFileUrl.value = '';
    newDocumentDescription.value = '';
    newDocumentIssueDate.value = '';
    newDocumentRelatedToUser.value = '';
    isCreatingDocument.value = false; 
  } catch (err: any) {
    console.error('Erreur lors de la création du document:', err);
    alert(`Erreur lors de la création du document: ${err.message || 'Vérifiez la console.'}`);
  }
};


</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md h-fit">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Ressources & Infos</h2>

    <div v-if="canAddDocument" class="mb-6">
      <button
        v-if="!isCreatingDocument"
        @click="isCreatingDocument = true"
        class="w-full bg-[#876EC8] text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center hover:bg-[#A081D4] focus:outline-none focus:ring-2 focus:ring-[#876EC8] focus:ring-opacity-50"
      >
       <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
<path d="M44,24H4c0,0.338,0,1.662,0,2c0,11.028,8.972,20,20,20s20-8.972,20-20C44,25.662,44,24.338,44,24z"></path><circle cx="24" cy="24" r="19" fill="#fff"></circle><path d="M24,44C12.972,44,4,35.028,4,24S12.972,4,24,4s20,8.972,20,20S35.028,44,24,44z M24,6C14.075,6,6,14.075,6,24  s8.075,18,18,18s18-8.075,18-18S33.925,6,24,6z"></path><path d="M31,23h-6v-6c0-0.553-0.447-1-1-1s-1,0.447-1,1v6h-6c-0.553,0-1,0.447-1,1s0.447,1,1,1h6v6c0,0.553,0.447,1,1,1s1-0.447,1-1  v-6h6c0.553,0,1-0.447,1-1S31.553,23,31,23z"></path>
</svg>
        &nbsp;Ajouter un support
      </button>

      <div v-if="isCreatingDocument" class="bg-gray-50 p-4 rounded-lg shadow-inner">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">Nouveau Support de cours</h3>

        <div class="mb-3">
          <label for="docTitle" class="block text-sm font-medium text-gray-700">Titre</label>
          <input type="text" id="docTitle" v-model="newDocumentTitle" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Titre du support">
        </div>

        <div class="mb-3">
          <label for="docType" class="block text-sm font-medium text-gray-700">Type de document</label>
          <select id="docType" v-model="newDocumentType" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
            <option v-for="option in documentTypeOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div class="mb-3">
          <label for="docFileUrl" class="block text-sm font-medium text-gray-700">URL du fichier</label>
          <input type="text" id="docFileUrl" v-model="newDocumentFileUrl" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: https://exemple.com/mon_fichier.pdf">
          <p class="text-xs text-gray-500 mt-1">Lien vers le fichier du support (PDF, PPTX, etc.).</p>
        </div>

        <div class="mb-3">
          <label for="docDescription" class="block text-sm font-medium text-gray-700">Description (optionnel)</label>
          <textarea id="docDescription" v-model="newDocumentDescription" rows="2" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Description du support"></textarea>
        </div>

        <div v-if="['attestation', 'diplome', 'transactionnel', 'emargement'].includes(newDocumentType)" class="mb-3">
          <label for="docIssueDate" class="block text-sm font-medium text-gray-700">Date d'émission</label>
          <input type="date" id="docIssueDate" v-model="newDocumentIssueDate" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
        </div>
        <div v-if="['attestation', 'diplome', 'transactionnel', 'emargement'].includes(newDocumentType)" class="mb-3">
          <label for="docRelatedToUser" class="block text-sm font-medium text-gray-700">Utilisateur lié (ID)</label>
          <input type="text" id="docRelatedToUser" v-model="newDocumentRelatedToUser" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="ID utilisateur">
        </div>


        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click="isCreatingDocument = false; newDocumentTitle = ''; newDocumentType = 'support'; newDocumentFileUrl = ''; newDocumentDescription = ''; newDocumentIssueDate = ''; newDocumentRelatedToUser = ''"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150"
          >
            Annuler
          </button>
          <button
            @click="handleCreateDocument"
            class="px-4 py-2 bg-[#B2E9E0] text-[#423B72] font-bold rounded-md hover:bg-[#FF8B7D] transition duration-150"
          >
            Créer
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center text-gray-600 mt-4">Chargement des documents...</div>
    <div v-else-if="error" class="text-center text-red-600 mt-4">
      Erreur lors du chargement des documents : {{ error }}
    </div>
    <div v-else-if="filteredDocuments.length === 0" class="text-center text-gray-500 mt-4">
      Aucun support de cours pour le moment.
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="doc in filteredDocuments"
        :key="doc._id"
        :class="['bg-gray-100 p-3 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-200 transition duration-150']"
        @click="doc.fileUrl ? window.open(doc.fileUrl, '_blank') : alert('Aucun fichier disponible.')"
      >
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 48 48"> <path d="M41,36H7v6c0,1.657,1.343,3,3,3h28c1.657,0,3-1.343,3-3V36z"></path><path fill="#fff" d="M38,42H10c-1.105,0-2-0.895-2-2V4h21l11,11v25C40,41.105,39.105,42,38,42z"></path><path d="M38,43H10c-1.654,0-3-1.346-3-3V4c0-0.552,0.447-1,1-1h21c0.266,0,0.52,0.105,0.707,0.293l11,11 C40.895,14.48,41,14.735,41,15v25C41,41.654,39.654,43,38,43z M9,5v35c0,0.551,0.448,1,1,1h28c0.552,0,1-0.449,1-1V15.414L28.586,5 H9z"></path><path d="M40,16H29c-0.553,0-1-0.448-1-1V4c0-0.552,0.447-1,1-1s1,0.448,1,1v10h10c0.553,0,1,0.448,1,1S40.553,16,40,16z"></path><path d="M34.707,31.708l-6.414-6.415C28.105,25.105,27.852,25,27.586,25h-0.172c-0.266,0-0.52,0.105-0.707,0.293L24,28l-4.707-4.707 C19.105,23.105,18.852,23,18.586,23h-0.172c-0.266,0-0.52,0.105-0.707,0.293l-4.414,4.415C13.105,27.896,13,28.149,13,28.415V34 c0,1.654,1.346,3,3,3h16c1.654,0,3-1.346,3-3v-1.585C35,32.149,34.895,31.896,34.707,31.708z M33,34c0,0.552-0.448,1-1,1H16 c-0.552,0-1-0.448-1-1v-5.171l3.5-3.501l6.086,6.086c0.391,0.391,1.023,0.391,1.414,0s0.391-1.023,0-1.414l-0.586-0.586l2.086-2.086 l5.5,5.501V34z"></path><circle cx="31.5" cy="21.5" r="2.5"></circle> </svg>

          <div>
            <a :href="doc.fileUrl" target="_blank" class="font-medium text-gray-800 hover:underline" @click.stop>&nbsp;&nbsp;{{ doc.title }}</a>
            <p class="text-xs text-gray-500">&nbsp;&nbsp;{{ doc.description || allDocumentTypesForDisplay.find(opt => opt.value === doc.type)?.label || doc.type.charAt(0).toUpperCase() + doc.type.slice(1) }}</p>
          </div>
        </div>
        <div class="flex items-center text-sm text-gray-600">
            <span v-if="doc.dueDate">Échéance: {{ formatDate(doc.dueDate) }}</span>
            <span v-else-if="doc.issueDate">Émis le: {{ formatDate(doc.issueDate) }}</span>
            <button
              v-if="canAddDocument"
              @click="handleDeleteDocument(doc._id)"
              class="ml-3 p-1 rounded-full hover:bg-gray-200 transition duration-150"
              title="Supprimer le document"
            >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 48 48">
<path d="M39,16H9c-1.654,0-3-1.346-3-3V9c0-0.52,0.398-0.953,0.917-0.997l12-1L29,7c0.027,0,0.056,0.001,0.083,0.003l12,1  C41.602,8.047,42,8.48,42,9v4C42,14.654,40.654,16,39,16z"></path><path d="M36,47H12c-1.654,0-3-1.346-3-3V14c0-0.552,0.447-1,1-1h28c0.553,0,1,0.448,1,1v30C39,45.654,37.654,47,36,47z"></path><path fill="#fff" d="M36,44H12c-1.105,0-2-0.895-2-2V12h28v30C38,43.105,37.105,44,36,44z"></path><path d="M36,45H12c-1.654,0-3-1.346-3-3V12c0-0.552,0.447-1,1-1h28c0.553,0,1,0.448,1,1v30C39,43.654,37.654,45,36,45z M11,13v29 c0,0.551,0.448,1,1,1h24c0.552,0,1-0.449,1-1V13H11z"></path><path fill="#fff" d="M29,6H19L7,9v2c0,1.105,0.895,2,2,2h30c1.105,0,2-0.895,2-2V9L29,6z"></path><path d="M39,14H9c-1.654,0-3-1.346-3-3V9c0-0.459,0.312-0.859,0.758-0.97l12-3C18.837,5.01,18.918,5,19,5h10 c0.082,0,0.163,0.01,0.242,0.03l12,3C41.688,8.141,42,8.541,42,9v2C42,12.654,40.654,14,39,14z M8,9.781V11c0,0.551,0.448,1,1,1h30  c0.552,0,1-0.449,1-1V9.781L28.877,7h-9.754L8,9.781z"></path><path d="M30,6h-2V4c0-0.551-0.448-1-1-1h-6c-0.552,0-1,0.449-1,1v2h-2V4c0-1.654,1.346-3,3-3h6c1.654,0,3,1.346,3,3V6z"></path><path d="M24,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C25,37.552,24.553,38,24,38z"></path><path d="M31,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C32,37.552,31.553,38,31,38z"></path><path d="M17,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C18,37.552,17.553,38,17,38z"></path>
</svg>
            </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
</style>
