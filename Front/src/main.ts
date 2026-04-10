// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css'; // <-- C'EST CETTE LIGNE QUI ÉTAIT PROBABLEMENT MANQUANTE

// Importez axios si votre store Pinia l'utilise pour des actions initiales (comme fetchUserProfile)
import axios from 'axios';
// Importer votre store utilisateur
import { useUserStore } from './stores/user';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); // Utiliser Pinia avec l'application

// --- LOGIQUE CRUCIALE POUR L'ONBOARDING ET LE ROUTEUR ---
// Initialiser le store utilisateur et charger les données de l'utilisateur
// avant que le routeur ne soit monté, pour éviter les redirections prématurées.
const userStore = useUserStore(); // Initialise le store Pinia
if (userStore.authToken && !userStore.user.id) {
  // Si un token existe mais que les données utilisateur ne sont pas encore chargées,
  // tentez de les récupérer. C'est crucial pour le premier chargement et les rafraîchissements de page.
  userStore.fetchUserProfile().catch(error => {
    console.error("Erreur lors du chargement initial du profil utilisateur:", error);
    // En cas d'erreur de chargement (ex: token expiré), déconnecter l'utilisateur
    userStore.logout();
  });
}
// --- FIN LOGIQUE CRUCIALE ---

app.use(router); // Utiliser le routeur avec l'application, APRÈS que le store soit potentiellement initialisé

app.mount('#app');
