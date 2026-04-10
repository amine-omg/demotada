// src/main.ts
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css'; 

import axios from 'axios';
import { useUserStore } from './stores/user';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia); 

const userStore = useUserStore(); 
if (userStore.authToken && !userStore.user.id) {
  userStore.fetchUserProfile().catch(error => {
    console.error("Erreur lors du chargement initial du profil utilisateur:", error);
    userStore.logout();
  });
}

app.use(router); 

app.mount('#app');
