<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAssignmentStore, type Assignment, type Submission } from '../stores/assignmentStore';
import { useUserStore } from '../stores/user';
import { useSessionStore, type SessionUser } from '../stores/sessionStore';

const props = defineProps<{
  sessionId: string;
}>();

const assignmentStore = useAssignmentStore();
const userStore = useUserStore();
const sessionStore = useSessionStore();

const newAssignmentTitle = ref('');
const newAssignmentDescription = ref('');
const newAssignmentFileUrl = ref('');
const newAssignmentDueDate = ref('');
const isCreatingAssignment = ref(false);

const assignments = computed(() => assignmentStore.assignments);
const isLoading = computed(() => assignmentStore.isLoading);
const error = computed(() => assignmentStore.error);

const filteredAssignments = computed(() => {
  return assignments.value.filter(assignment => assignment.session === props.sessionId);
});

const canAddAssignment = computed(() => {
  const role = userStore.userRole;
  console.log(`[ClassAssignments DEBUG] userStore.userRole: ${role}, canAddAssignment: ${role === 'admin' || role === 'formateur'}`);
  return role === 'admin' || role === 'formateur';
});

const canSubmitAssignment = computed(() => {
  return userStore.userRole === 'apprenant';
});

const canGradeAssignment = computed(() => {
  const role = userStore.userRole;
  return role === 'admin' || role === 'formateur';
});


onMounted(() => {
  console.log(`[ClassAssignments] Composant monté pour la session ID: ${props.sessionId}`);
});

watch(() => [props.sessionId, userStore.isAuthenticated], async ([currentSessionId, isAuthenticated]) => {
  if (currentSessionId && isAuthenticated) {
    console.log(`[ClassAssignments] Watch: Authentifié et Session ID ${currentSessionId} disponible. Chargement des devoirs et membres...`);
    await assignmentStore.fetchAssignments({ sessionId: currentSessionId });
    if (!sessionStore.currentSession || sessionStore.currentSession._id !== currentSessionId) {
        await sessionStore.fetchSessionById(currentSessionId); 
    }
  } else if (!isAuthenticated) {
    console.log("[ClassAssignments] Watch: Non authentifié. Réinitialisation des devoirs.");
    assignmentStore.assignments = [];
    sessionStore.currentSession = null;
  }
}, { immediate: true });


const handleCreateAssignment = async () => {
  if (!newAssignmentTitle.value.trim() || !newAssignmentFileUrl.value.trim() || !newAssignmentDueDate.value.trim()) {
    alert('Le titre, l\'URL du fichier et la date d\'échéance du devoir sont requis.');
    return;
  }
  if (!props.sessionId || !userStore.user.id) {
    alert('Impossible de créer le devoir : informations de session ou d\'utilisateur manquantes.');
    return;
  }
  if (!canAddAssignment.value) {
    alert('Vous n\'êtes pas autorisé à ajouter des devoirs.');
    return;
  }

  try {
    const assignmentData: Partial<Assignment> = {
      title: newAssignmentTitle.value,
      description: newAssignmentDescription.value,
      fileUrl: newAssignmentFileUrl.value,
      dueDate: new Date(newAssignmentDueDate.value).toISOString(),
      session: props.sessionId,
      formation: sessionStore.currentSession?.formation ? (typeof sessionStore.currentSession.formation === 'object' ? sessionStore.currentSession.formation._id : sessionStore.currentSession.formation) : '',
      createdBy: userStore.user.id,
    };

    await assignmentStore.createAssignment(assignmentData);
    await assignmentStore.fetchAssignments({ sessionId: props.sessionId }); 
    
    newAssignmentTitle.value = '';
    newAssignmentDescription.value = '';
    newAssignmentFileUrl.value = '';
    newAssignmentDueDate.value = '';
    isCreatingAssignment.value = false;
  } catch (err: any) {
    console.error('Erreur lors de la création du devoir:', err);
    alert(`Erreur lors de la création du devoir: ${err.message || 'Vérifiez la console.'}`);
  }
};

const showAssignmentModal = ref(false);
const selectedAssignment = ref<Assignment | null>(null);

const newSubmissionUrl = ref('');
const submissionError = ref('');

const gradeToSubmit = ref<number | null>(null);
const gradeError = ref('');
const selectedSubmissionToGrade = ref<Submission | null>(null);

const openAssignmentModal = (assignment: Assignment) => {
  selectedAssignment.value = assignment;
  submissionError.value = '';
  gradeError.value = '';

  if (canSubmitAssignment.value && assignment.submissions) {
    const studentSubmission = assignment.submissions.find(s => String(s.student._id || s.student) === userStore.user.id);
    if (studentSubmission) {
      newSubmissionUrl.value = studentSubmission.submissionUrl;
    } else {
      newSubmissionUrl.value = '';
    }
  }

  showAssignmentModal.value = true;
};

const closeAssignmentModal = () => {
  showAssignmentModal.value = false;
  selectedAssignment.value = null;
  newSubmissionUrl.value = '';
  submissionError.value = '';
  gradeToSubmit.value = null;
  gradeError.value = '';
  selectedSubmissionToGrade.value = null;
};

const handleAssignmentSubmission = async () => {
  if (!selectedAssignment.value?._id || !newSubmissionUrl.value.trim()) {
    submissionError.value = "Veuillez fournir l'URL de votre travail.";
    return;
  }
  try {
    await assignmentStore.submitAssignment(selectedAssignment.value._id, newSubmissionUrl.value.trim());
    alert('Devoir soumis avec succès !');
    closeAssignmentModal();
   
    await assignmentStore.fetchAssignments({ sessionId: props.sessionId }); 
  } catch (err: any) {
    console.error('Erreur lors de la soumission du devoir:', err);
    submissionError.value = err.message || 'Erreur lors de la soumission du devoir.';
  }
};

const handleGradeSubmission = async (submissionId: string, currentGrade: number | null) => {
    if (currentGrade === null || currentGrade === undefined || currentGrade < 0 || currentGrade > 100) {
        gradeError.value = "Veuillez entrer une note valide entre 0 et 100.";
        return;
    }

    try {
        await assignmentStore.gradeSubmission(selectedAssignment.value!._id, submissionId, currentGrade);
        alert(`Soumission notée avec succès: ${currentGrade}/100 !`);
        await assignmentStore.fetchAssignments({ sessionId: props.sessionId });
    } catch (err: any) {
        console.error('Erreur lors de la notation de la soumission:', err);
        gradeError.value = err.message || 'Erreur lors de la notation de la soumission.';
    }
};


const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const getAssignmentStatusClasses = (assignment: Assignment) => {
  const userId = userStore.user.id;
  const studentSubmission = (assignment.submissions || []).find(s => String(s.student._id || s.student) === userId);

  if (studentSubmission?.submissionUrl) { 
    return 'text-green-700 bg-green-100 px-2 py-0.5 rounded-full text-xs font-semibold';
  } else if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    return 'text-red-700 bg-red-100 px-2 py-0.5 rounded-full text-xs font-semibold'; 
  } else {
    return 'text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-xs font-semibold'; 
  }
};

const getAssignmentStatusText = (assignment: Assignment) => {
  const userId = userStore.user.id;
  const studentSubmission = (assignment.submissions || []).find(s => String(s.student._id || s.student) === userId);

  if (studentSubmission?.submissionUrl) { // Le devoir est "rendu" si submissionUrl existe
    return 'Rendu';
  } else if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    return 'En retard';
  } else {
    return 'À rendre';
  }
};

const currentSessionMembers = computed(() => {
  if (!sessionStore.currentSession) return [];
  return sessionStore.currentSession.elevesInscrits;
});

const getSubmissionDetailsForStudent = (studentId: string): { status: 'rendu' | 'pas rendu'; url?: string | null; grade?: number | null; submissionDate?: string | null; submissionId?: string | null } => {
  if (!selectedAssignment.value) return { status: 'pas rendu' };
  const submission = (selectedAssignment.value.submissions || []).find(s => String(s.student._id || s.student) === studentId);
  if (submission) {
    return {
      status: 'rendu',
      url: submission.submissionUrl,
      grade: submission.grade,
      submissionDate: submission.submissionDate,
      submissionId: submission._id
    };
  }
  return { status: 'pas rendu' };
};
</script>

<template>
  <div class="bg-white p-6 rounded-lg shadow-md h-fit">
    <h2 class="text-xl font-semibold text-gray-800 mb-4">Devoirs</h2>


    <div v-if="canAddAssignment" class="mb-6">
      <button
        v-if="!isCreatingAssignment"
        @click="isCreatingAssignment = true"
        class="w-full bg-[#423B72] text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center mb-4 hover:bg-[#5C4F8D] focus:outline-none focus:ring-2 focus:ring-[#423B72] focus:ring-opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0 0 48 48">
<path d="M44,24H4c0,0.338,0,1.662,0,2c0,11.028,8.972,20,20,20s20-8.972,20-20C44,25.662,44,24.338,44,24z"></path><circle cx="24" cy="24" r="19" fill="#fff"></circle><path d="M24,44C12.972,44,4,35.028,4,24S12.972,4,24,4s20,8.972,20,20S35.028,44,24,44z M24,6C14.075,6,6,14.075,6,24  s8.075,18,18,18s18-8.075,18-18S33.925,6,24,6z"></path><path d="M31,23h-6v-6c0-0.553-0.447-1-1-1s-1,0.447-1,1v6h-6c-0.553,0-1,0.447-1,1s0.447,1,1,1h6v6c0,0.553,0.447,1,1,1s1-0.447,1-1  v-6h6c0.553,0,1-0.447,1-1S31.553,23,31,23z"></path>
</svg>
        &nbsp;Ajouter un devoir
      </button>

      <div v-if="isCreatingAssignment" class="bg-gray-50 p-4 rounded-lg shadow-inner">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">Nouveau Devoir</h3>

        <div class="mb-3">
          <label for="assignTitle" class="block text-sm font-medium text-gray-700">Titre</label>
          <input type="text" id="assignTitle" v-model="newAssignmentTitle" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Titre du devoir">
        </div>

        <div class="mb-3">
          <label for="assignFileUrl" class="block text-sm font-medium text-gray-700">URL du sujet</label>
          <input type="text" id="assignFileUrl" v-model="newAssignmentFileUrl" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Ex: https://exemple.com/sujet_devoir.pdf">
          <p class="text-xs text-gray-500 mt-1">Lien vers le fichier du devoir à télécharger par les élèves.</p>
        </div>

        <div class="mb-3">
          <label for="assignDueDate" class="block text-sm font-medium text-gray-700">Date d'échéance</label>
          <input type="date" id="assignDueDate" v-model="newAssignmentDueDate" class="mt-1 block w-full p-2 border border-gray-300 rounded-md">
        </div>

        <div class="mb-3">
          <label for="assignDescription" class="block text-sm font-medium text-gray-700">Description (optionnel)</label>
          <textarea id="assignDescription" v-model="newAssignmentDescription" rows="2" class="mt-1 block w-full p-2 border border-gray-300 rounded-md" placeholder="Description du devoir"></textarea>
        </div>

        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click="isCreatingAssignment = false; newAssignmentTitle = ''; newAssignmentDescription = ''; newAssignmentFileUrl = ''; newAssignmentDueDate = ''"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150"
          >
            Annuler
          </button>
          <button
            @click="handleCreateAssignment"
            class="px-4 py-2 bg-[#B2E9E0] text-[#423B72] font-bold rounded-md hover:bg-[#FF8B7D] transition duration-150"
          >
            Créer le devoir
          </button>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="text-center text-gray-600 mt-4">Chargement des devoirs...</div>
    <div v-else-if="error" class="text-center text-red-600 mt-4">
      Erreur lors du chargement des devoirs : {{ error }}
    </div>
    <div v-else-if="filteredAssignments.length === 0" class="text-center text-gray-500 mt-4">
      Aucun devoir pour le moment.
    </div>
    <div v-else class="space-y-4">
      <div
        v-for="assignment in filteredAssignments"
        :key="assignment._id"
        @click="openAssignmentModal(assignment)"
        class="bg-gray-100 p-3 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-200 transition duration-150"
      >
        <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15" height="15" viewBox="0 0 48 48">
<path fill-rule="evenodd" d="M46.003,35.002v2.001h1.999v-2.001  H46.003z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M37.003,26.002  c6.072,0,11,4.928,11,11s-4.928,11-11,11s-11-4.928-11-11S30.931,26.002,37.003,26.002z" clip-rule="evenodd"></path><path d="M41.003,36.003H7.004v6c0,1.656,1.343,2.999,3,2.999h27.999c1.657,0,3-1.343,3-2.999 V36.003z"></path><path fill="#fff" d="M38.003,42.003H10.004c-1.105,0-2-0.896-2-2V4.005h20.999 l11,10.999v25C40.003,41.107,39.108,42.003,38.003,42.003z"></path><path d="M38.003,43.003H10.004c-1.655,0-3-1.347-3-3V4.005c0-0.552,0.447-1,1-1h20.999 c0.267,0,0.52,0.104,0.708,0.292l10.999,11c0.188,0.187,0.293,0.443,0.293,0.707v25C41.003,41.657,39.657,43.003,38.003,43.003z M9.004,5.005v34.999c0,0.551,0.448,1,1,1h27.999c0.552,0,1-0.449,1-1V15.418L28.589,5.005H9.004z"></path><path d="M40.003,16.003h-11c-0.552,0-1-0.448-1-1V4.005c0-0.552,0.448-1,1-1  c0.553,0,1,0.448,1,1v9.999h10c0.553,0,1,0.448,1,1C41.003,15.555,40.556,16.003,40.003,16.003z"></path><path fill="#fff" fill-rule="evenodd" d="M37.003,25.002  c5.52,0,10,4.48,10,10s-4.48,10-10,10s-10-4.48-10-10S31.483,25.002,37.003,25.002z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M26.003,35.002  c0-6.072,4.927-11,11-11c6.072,0,11,4.928,11,11c0,6.073-4.928,11-11,11C30.929,46.002,26.003,41.075,26.003,35.002z M46.003,35.002 c0-4.967-4.033-9-9-9c-4.968,0-9,4.033-9,9c0,4.968,4.032,9,9,9C41.969,44.002,46.003,39.97,46.003,35.002z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M36.003,35.002v-10 c0-0.551,0.448-1,1-1c0.551,0,1,0.449,1,1v9h9c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1h-10  C36.451,36.002,36.003,35.554,36.003,35.002z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M37.003,35.002v-10 c5.52,0,10,4.48,10,10H37.003z" clip-rule="evenodd"></path>
</svg>
          <div>
            <span class="font-medium text-gray-800">&nbsp;&nbsp;{{ assignment.title }}</span>
            <p v-if="assignment.dueDate" class="text-xs text-gray-500">&nbsp;&nbsp;Échéance: {{ formatDate(assignment.dueDate) }}</p>
          </div>
        </div>
        <div class="flex items-center text-sm text-gray-600">
            <span v-if="canSubmitAssignment" :class="['px-2 py-0.5 rounded-full text-xs font-semibold', getAssignmentStatusClasses(assignment)]">
              {{ getAssignmentStatusText(assignment) }}
            </span>
            <span v-else-if="canGradeAssignment" class="text-sm text-gray-700 bg-gray-200 px-2 py-0.5 rounded-full font-semibold">
                {{ (assignment.submissions || []).length }} / {{ currentSessionMembers.length }} rendus
            </span>
        </div>
      </div>
    </div>

    <div v-if="showAssignmentModal && selectedAssignment" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ selectedAssignment.title }}</h3>
          <button @click="closeAssignmentModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div class="mb-4">
          <p class="text-gray-700 mb-2">{{ selectedAssignment.description || 'Pas de description.' }}</p>
          <p v-if="selectedAssignment.dueDate" class="text-sm text-gray-600">
            Date d'échéance: <span class="font-medium">{{ formatDate(selectedAssignment.dueDate) }}</span>
          </p>
        </div>

        <div class="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 class="font-semibold text-gray-800 mb-2">Sujet du devoir</h4>
          <a :href="selectedAssignment.fileUrl" target="_blank" class="w-full flex items-center justify-center bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-150">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Télécharger le sujet du devoir
          </a>
        </div>

        <div v-if="canSubmitAssignment && getSubmissionDetailsForStudent(userStore.user.id!).status === 'pas rendu'" class="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h4 class="font-semibold text-gray-800 mb-2">Rendre mon devoir</h4>
          <div class="mb-3">
            <label for="submissionUrl" class="block text-sm font-medium text-gray-700 mb-1">URL de votre travail</label>
            <input
              type="text"
              id="submissionUrl"
              v-model="newSubmissionUrl"
              class="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Ex: https://votre-drive.com/mon-devoir.pdf"
            >
            <p class="text-xs text-gray-500 mt-1">Lien vers votre document (Google Drive, OneDrive, etc.).</p>
          </div>
          <div v-if="submissionError" class="text-red-500 text-sm mb-4">{{ submissionError }}</div>
          <button @click="handleAssignmentSubmission" class="w-full flex items-center justify-center bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-150">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v8"></path></svg>
            Rendre le devoir
          </button>
        </div>

     
        <div v-if="canSubmitAssignment && getSubmissionDetailsForStudent(userStore.user.id!).status === 'rendu'" class="mb-6 p-4 bg-green-50 rounded-lg">
          <h4 class="font-semibold text-gray-800 mb-2">Devoir rendu !</h4>
          <p class="text-gray-700 text-sm">Votre travail a été soumis le {{ formatDate(getSubmissionDetailsForStudent(userStore.user.id!).submissionDate) }}.</p>
          <a :href="getSubmissionDetailsForStudent(userStore.user.id!).url" target="_blank" class="text-blue-600 hover:underline text-sm block mt-1">Voir votre soumission</a>
          <p v-if="getSubmissionDetailsForStudent(userStore.user.id!).grade !== null" class="text-sm text-green-700 font-semibold mt-2">
            Note : {{ getSubmissionDetailsForStudent(userStore.user.id!).grade }}/100
          </p>
        </div>

        <div v-if="canGradeAssignment" class="mb-6 p-4 bg-purple-50 rounded-lg">
            <h4 class="font-semibold text-gray-800 mb-3">Soumissions des élèves ({{ (selectedAssignment?.submissions || []).length || 0 }} / {{ currentSessionMembers.length }})</h4>
            <div v-if="currentSessionMembers.length === 0" class="text-gray-500 text-sm mb-3">
                Aucun élève inscrit à cette session.
            </div>
            <ul class="space-y-2 mb-4">
                <li v-for="member in currentSessionMembers" :key="member.userId" class="flex items-center justify-between p-2 rounded-md"
                    :class="getSubmissionDetailsForStudent(member.userId).status === 'rendu' ? 'bg-green-50' : 'bg-gray-100'">
                    <div class="flex items-center">
                        <img v-if="member.photo" :src="member.photo" alt="Photo" class="w-8 h-8 rounded-full mr-2 object-cover">
                        <div v-else class="w-8 h-8 rounded-full mr-2 bg-gray-200 flex items-center justify-center text-gray-500"><i class="fas fa-user"></i></div>
                        <span class="font-medium">{{ member.prenom }} {{ member.nom }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span :class="['text-sm font-semibold', getSubmissionDetailsForStudent(member.userId).status === 'rendu' ? 'text-green-700' : 'text-red-700']">
                            {{ getSubmissionDetailsForStudent(member.userId).status === 'rendu' ? 'Rendu' : 'Pas rendu' }}
                        </span>
                        <a v-if="getSubmissionDetailsForStudent(member.userId).status === 'rendu' && getSubmissionDetailsForStudent(member.userId).url"
                           :href="getSubmissionDetailsForStudent(member.userId).url" target="_blank"
                           class="text-blue-500 hover:underline text-sm" title="Télécharger la soumission">
                           <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </a>
                        <div v-if="getSubmissionDetailsForStudent(member.userId).status === 'rendu'" class="flex items-center">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                :value="getSubmissionDetailsForStudent(member.userId).grade"
                                @input="event => {
                                    const newGrade = Number(event.target.value);
                                    if (!isNaN(newGrade) && newGrade >= 0 && newGrade <= 100) {
                                        handleGradeSubmission(getSubmissionDetailsForStudent(member.userId).submissionId!, newGrade);
                                    } else {
                                        gradeError = 'Note invalide';
                                    }
                                }"
                                class="w-16 text-center border border-gray-300 rounded-md py-1"
                            />
                            <span v-if="getSubmissionDetailsForStudent(member.userId).grade !== null" class="font-bold text-gray-800 ml-1">
                                ({{ getSubmissionDetailsForStudent(member.userId).grade }}/100)
                            </span>
                        </div>
                    </div>
                </li>
            </ul>
            <p v-if="gradeError" class="text-red-500 text-sm mb-4">{{ gradeError }}</p>
        </div>


        <div class="flex justify-end">
          <button @click="closeAssignmentModal" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-150">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
