<template>
  <div class="min-h-screen bg-gray-100">
    <TheHeader pageTitle="Édition de session" :showBackButton="true" backButtonRoute="/sessions" />

    <main class="container mx-auto px-4 py-8">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-[#423B71] mb-2">Éditer la session</h1>
        <p class="text-lg text-gray-600">Modifiez les détails de votre session programmée.</p>
      </div>

      <div v-if="isLoadingSession" class="text-center py-10 text-gray-500 font-medium">Chargement de la session...</div>
      <div v-else-if="errorSession" class="text-center text-red-600 text-lg">{{ errorSession }}</div>
      <div v-else-if="!session" class="text-center py-16 bg-white rounded-lg border border-dashed">
        <h3 class="text-xl font-semibold text-[#423B71]">Session non trouvée.</h3>
        <p class="text-gray-500 mt-2">Veuillez vérifier l'ID de la session.</p>
      </div>
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <!-- Colonne de gauche: Détails généraux de la session -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <form @submit.prevent="saveSession" class="space-y-6">
            <!-- Champs de la session -->
            <div>
              <label for="session-title" class="label">Titre de la session</label>
              <input type="text" id="session-title" v-model="session.title" class="input-field" placeholder="Titre de la session" />
            </div>
            <div>
              <label for="session-description" class="label">Description</label>
              <textarea id="session-description" v-model="session.description" class="input-field" rows="3" placeholder="Description de la session"></textarea>
            </div>
            <div>
              <label for="session-date-debut" class="label">Date de début</label>
              <input type="date" id="session-date-debut" v-model="session.dateDebut" class="input-field" />
            </div>
            <div>
              <label for="session-date-fin" class="label">Date de fin</label>
              <input type="date" id="session-date-fin" v-model="session.dateFin" class="input-field" />
            </div>
            <div>
              <label for="session-date-examen" class="label">Date d'examen (optionnel)</label>
              <input type="date" id="session-date-examen" v-model="session.dateExamen" class="input-field" />
            </div>
            <div>
              <label for="session-lieu" class="label">Lieu</label>
              <input type="text" id="session-lieu" v-model="session.lieu" class="input-field" placeholder="Lieu ou lien de la session" />
            </div>

            <!-- Afficher la formation liée (non modifiable ici) -->
            <div v-if="session.formation" class="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 class="text-lg font-semibold text-gray-800 mb-2">Formation liée</h3>
              <div class="flex items-center">
                <img
                  :src="(session.formation as PopulatedFormation)?.image || '/default-formation.png'"
                  alt="Logo Formation"
                  class="w-12 h-12 object-cover rounded-full mr-3 border-2 border-gray-200"
                />
                <p class="font-medium text-gray-700">
                  {{ (session.formation as PopulatedFormation)?.title || 'Formation inconnue' }}
                </p>
              </div>
            </div>

            <!-- Boutons d'action -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="router.back()" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
              <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Sauvegarder les modifications</button>
            </div>
          </form>
        </div>

        <!-- Colonne de droite: Gestion des journées de cours -->
        <div class="lg:col-span-1 bg-white rounded-lg shadow-md p-6 h-fit sticky top-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Journées de cours</h2>
          <p class="text-gray-600 text-sm mb-4">Gérez les jours spécifiques de cours pour cette session.</p>

          <div v-if="isLoadingCours" class="text-center py-4 text-gray-500">Chargement des cours...</div>
          <div v-else-if="errorCours" class="text-center text-red-600">{{ errorCours }}</div>
          <div v-else-if="cours.length === 0" class="text-center py-4 text-gray-500 text-sm">
            Aucune journée de cours générée.
            <button @click="generateCours" class="text-indigo-600 hover:underline mt-2">Générer automatiquement</button>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="jourCours in cours"
              :key="jourCours._id"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
            >
              <div>
                <p class="font-medium text-gray-800">{{ jourCours.title }}</p>
                <p class="text-sm text-gray-600">{{ new Date(jourCours.date).toLocaleDateString('fr-FR') }}</p>
              </div>
              <div class="flex space-x-2">
                <button @click="editCours(jourCours)" class="p-1 text-blue-600 hover:text-blue-800" title="Éditer le cours">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteCours(jourCours._id)" class="p-1 text-red-600 hover:text-red-800" title="Supprimer le cours">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <button v-if="cours.length > 0" @click="generateCours" class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out mt-4">
            Regénérer les cours
          </button>
        </div>
      </div>
    </main>

    <!-- Modal d'édition/création de cours (à créer) -->
    <div v-if="showCoursModal" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-2xl w-full max-w-lg p-8" @click.stop>
        <h3 class="text-2xl font-bold text-gray-800 mb-4">{{ isEditingCours ? 'Modifier le cours' : 'Ajouter un cours' }}</h3>
        <form @submit.prevent="saveCours">
          <div>
            <label for="cours-title" class="label">Titre du cours</label>
            <input type="text" id="cours-title" v-model="currentCours.title" class="input-field" />
          </div>
          <div>
            <label for="cours-date" class="label">Date du cours</label>
            <input type="date" id="cours-date" v-model="currentCours.date" class="input-field" />
          </div>
          <div>
            <label for="cours-meetlink" class="label">Lien Meet/Zoom</label>
            <input type="url" id="cours-meetlink" v-model="currentCours.meetLink" class="input-field" />
          </div>
          <div class="flex items-center space-x-4 mt-4">
            <label class="flex items-center">
              <input type="checkbox" v-model="currentCours.isMorningActive" class="h-4 w-4 text-indigo-600" />
              <span class="ml-2 text-sm text-gray-700">Matin actif</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" v-model="currentCours.isAfternoonActive" class="h-4 w-4 text-indigo-600" />
              <span class="ml-2 text-sm text-gray-700">Après-midi actif</span>
            </label>
          </div>
          <div class="flex justify-end space-x-3 mt-6">
            <button type="button" @click="showCoursModal = false" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Annuler</button>
            <button type="submit" class="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Sauvegarder</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TheHeader from '../components/TheHeader.vue';
import { useSessionStore } from '../stores/sessionStore';
import { useCoursStore } from '../stores/coursStore'; // NOUVEAU : Import du store des cours
import type { Session, PopulatedFormation } from '../stores/sessionStore';
import type { Cours } from '../stores/coursStore'; // NOUVEAU : Import du type Cours

// Stores
const sessionStore = useSessionStore();
const coursStore = useCoursStore(); // NOUVEAU : Initialisation du store des cours
const route = useRoute();
const router = useRouter();

// États pour la session
const sessionId = computed(() => route.params.id as string);
const session = ref<Session | null>(null);
const isLoadingSession = ref(false); // Renommé pour éviter conflit
const errorSession = ref<string | null>(null); // Renommé

// États pour les cours
const cours = computed(() => coursStore.getSortedCours);
const isLoadingCours = computed(() => coursStore.isLoading);
const errorCours = computed(() => coursStore.error);
const showCoursModal = ref(false); // Contrôle la visibilité du modal de cours
const currentCours = ref<Cours | Partial<Cours>>({} as Cours); // Cours en cours d'édition/création
const isEditingCours = computed(() => !!(currentCours.value && (currentCours.value as Cours)._id)); // Vérifie si on est en mode édition

// Charger la session et ses cours au montage
onMounted(async () => {
  if (!sessionId.value) {
    errorSession.value = "ID de session manquant.";
    return;
  }
  isLoadingSession.value = true;
  errorSession.value = null;
  try {
    const fetchedSession = await sessionStore.fetchSessionById(sessionId.value);
    if (fetchedSession) {
      session.value = {
        ...fetchedSession,
        dateDebut: fetchedSession.dateDebut ? new Date(fetchedSession.dateDebut).toISOString().slice(0, 10) : undefined,
        dateFin: fetchedSession.dateFin ? new Date(fetchedSession.dateFin).toISOString().slice(0, 10) : undefined,
        dateExamen: fetchedSession.dateExamen ? new Date(fetchedSession.dateExamen).toISOString().slice(0, 10) : undefined,
      };
      // Charger les cours associés à cette session
      await coursStore.fetchCoursForSession(sessionId.value);
    } else {
      errorSession.value = "Session non trouvée.";
    }
  } catch (err: any) {
    errorSession.value = err.response?.data?.message || 'Erreur lors du chargement de la session.';
    console.error('Erreur SessionEditorPage (chargement session):', err);
  } finally {
    isLoadingSession.value = false;
  }
});

// Générer les cours (déclenche la fonction du backend)
const generateCours = async () => {
  if (!session.value || !session.value.dateDebut || !session.value.dateFin) {
    alert("Veuillez définir les dates de début et de fin de la session pour générer les cours.");
    return;
  }
  try {
    // L'appel à updateSession du store va déclencher la génération côté backend
    // et rafraîchir la liste des cours via le store de sessions.
    // Nous devons ensuite rafraîchir le coursStore
    await sessionStore.updateSession(session.value._id, {
        dateDebut: session.value.dateDebut,
        dateFin: session.value.dateFin
    }, 'none'); // Pas de refresh global/formation ici, on gère le refresh du coursStore

    await coursStore.fetchCoursForSession(sessionId.value); // Rafraîchir la liste des cours après génération
    alert("Journées de cours générées/régénérées !");
  } catch (error) {
    alert("Erreur lors de la génération des cours.");
    console.error("Erreur génération cours:", error);
  }
};

// Ouvrir le modal pour éditer un cours
const editCours = (coursToEdit: Cours) => {
  currentCours.value = { ...coursToEdit, date: new Date(coursToEdit.date).toISOString().slice(0, 10) }; // Formater la date
  showCoursModal.value = true;
};

// Supprimer un cours
const deleteCours = async (coursId: string) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette journée de cours ?")) {
    try {
      await coursStore.deleteCours(coursId);
      alert("Journée de cours supprimée.");
    } catch (error) {
      alert("Erreur lors de la suppression du cours.");
      console.error("Erreur suppression cours:", error);
    }
  }
};

// Sauvegarder un cours (création ou mise à jour via modal)
const saveCours = async () => {
  if (!currentCours.value.title || !currentCours.value.date || !sessionId.value) {
    alert("Le titre et la date du cours sont requis.");
    return;
  }
  try {
    const coursDataToSave = {
      ...currentCours.value,
      session: sessionId.value, // S'assurer que la session est liée
      date: new Date(currentCours.value.date), // Convertir la date en objet Date pour MongoDB
    };

    if (isEditingCours.value && (currentCours.value as Cours)._id) {
      await coursStore.updateCours((currentCours.value as Cours)._id, coursDataToSave);
      alert("Cours modifié avec succès !");
    } else {
      await coursStore.createCours(coursDataToSave);
      alert("Cours ajouté avec succès !");
    }
    showCoursModal.value = false; // Fermer le modal
  } catch (error) {
    alert("Erreur lors de la sauvegarde du cours.");
    console.error("Erreur sauvegarde cours:", error);
  }
};

// Sauvegarder les modifications de la session
const saveSession = async () => {
  if (!session.value || !sessionId.value) return;

  const sessionDataToSave = {
    ...session.value,
    formation: typeof session.value.formation === 'object' ? session.value.formation._id : session.value.formation,
    // Les IDs des cours sont gérés côté backend après génération, pas besoin de les envoyer ici
    cours: undefined, // Exclure le tableau 'cours' du payload de updateSession
  };

  try {
    await sessionStore.updateSession(sessionId.value, sessionDataToSave, 'none'); // Pas de refresh global/formation
    alert('Session modifiée avec succès !');
    // Si les dates ont changé, la régénération des cours est déjà gérée par le backend updateSession
    // et le fetchCoursForSession est appelé par le onMounted ou generateCours.
  } catch (err) {
    alert('Erreur lors de la sauvegarde de la session.');
    console.error('Erreur saveSession:', err);
  }
};

// Styles Tailwind pour les inputs
const inputField = 'w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent';
const label = 'block text-sm font-medium text-gray-700 mb-1';
</script>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent; }
</style>
