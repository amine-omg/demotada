<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useEtablissementsStore } from '../stores/etablissementsStore';

import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import TheHeader from '../components/TheHeader.vue';
import AppTabs, { type Tab } from '../components/AppTabs.vue';
import CreateEtablissementModal from '../components/modals/CreateEtablissementModal.vue';
import EtablissementAcces from '../components/etablissement/EtablissementAcces.vue';
import EtablissementGeneral from '../components/etablissement/EtablissementGeneral.vue';
import HandicapPage from '../components/etablissement/HandicapPage.vue';

import EmailsPage from '../pages/EmailsPage.vue';
import DevisPage from '../components/etablissement/DevisPage.vue';
import FacturesPage from '../components/etablissement/FacturesPage.vue';
import LieuxPage from '../components/etablissement/LieuxPage.vue';


const router = useRouter(); 


const activeTab = ref('general');
const etablissementsStore = useEtablissementsStore();
const userStore = useUserStore();

const showCreateModal = ref(false);

const etablissement = computed(() => etablissementsStore.currentEtablissement);

const etablissementName = computed(() => {
  return etablissementsStore.currentEtablissement?.nom || '';
});


const ecoleIdToFetch = computed(() => {
  // Priorité 1: Le contexte sélectionné par l'admin
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext._id;
  }
  // Priorité 2: L'école associée à l'utilisateur (pour le rôle 'ecole')
  if (userStore.userRole === 'ecole' && userStore.user.associatedEntity) {
    return userStore.user.associatedEntity._id;
  }
  return null; // Si aucun contexte n'est applicable
});

// --- CORRECTION PRINCIPALE ICI ---
// On remplace l'ancien watcher par un qui observe directement la source de vérité :
// le contexte sélectionné dans le userStore.
watch(
  () => userStore.adminSelectedContext,
  (newContext) => {
    // Ce watcher se déclenche à chaque fois que l'admin change de contexte dans le header.
    const role = userStore.userRole;
    
    if (role === 'admin') {
      if (newContext && newContext._id) {
        // Si un nouveau contexte est sélectionné, on charge les données de cet établissement.
        etablissementsStore.fetchEtablissementById(newContext._id);
      } else {
        // Si aucun contexte n'est sélectionné, on vide les données.
        etablissementsStore.currentEtablissement = null;
      }
    }
  },
  {
    deep: true, // 'deep' est important pour observer les changements à l'intérieur de l'objet contexte.
    immediate: true // 'immediate' s'assure que le watcher s'exécute au chargement initial de la page.
  }
);

// On garde cette logique pour le rôle 'ecole' qui n'a pas de sélecteur de contexte.
watch(() => userStore.user.associatedEntity, (newEntity) => {
    if (userStore.userRole === 'ecole' && newEntity) {
        etablissementsStore.fetchEtablissementById(newEntity._id);
    }
}, { immediate: true });
// --- FIN DE LA CORRECTION ---

const etablissementTabs: Tab[] = [
  { id: 'general', label: 'Général', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48"><path d="M43.428,13.096l-19-9c-0.271-0.128-0.585-0.128-0.856,0l-19,9C4.223,13.262,4,13.614,4,14v4c0,0.265,0.105,0.52,0.293,0.707 L5,19.414V39c0,1.654,1.346,3,3,3h32c1.654,0,3-1.346,3-3V19.414l0.707-0.707C43.895,18.52,44,18.265,44,18v-4 C44,13.614,43.777,13.262,43.428,13.096z"></path><path fill="#fff" d="M40,39H8c-1.105,0-2-0.895-2-2V17l-1-1v-4l19-9l19,9v4l-1,1v20C42,38.105,41.105,39,40,39z"></path><path d="M40,40H8c-1.654,0-3-1.346-3-3V17.414l-0.707-0.707C4.105,16.52,4,16.265,4,16v-4c0-0.386,0.223-0.738,0.572-0.904l19-9 c0.271-0.128,0.585-0.128,0.856,0l19,9C43.777,11.262,44,11.614,44,12v4c0,0.265-0.105,0.52-0.293,0.707L43,17.414V37 C43,38.654,41.654,40,40,40z M6,15.586l0.707,0.707C6.895,16.48,7,16.735,7,17v20c0,0.551,0.449,1,1,1h32c0.551,0,1-0.449,1-1V17 c0-0.265,0.105-0.52,0.293-0.707L42,15.586v-2.953L24,4.106L6,12.633V15.586z"></path><path d="M24.428,7.096c-0.271-0.128-0.585-0.128-0.856,0l-18,8.526l0.856,1.808L24,9.106l17.572,8.324l0.856-1.808L24.428,7.096z"></path><path d="M28,21h-8c-1.654,0-3,1.346-3,3v15h2V24c0-0.551,0.449-1,1-1h8c0.551,0,1,0.449,1,1v15h2V24C31,22.346,29.654,21,28,21z"></path></svg>` },
    { id: 'lieux', label: 'Lieux', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M42,20c0-9.925-8.075-18-18-18S6,10.075,6,20c0,0.37,0,1.687,0,2c0,9.196,6.412,13.629,10.654,16.563  C17.287,39,17.878,39.409,18.4,39.8c0.968,0.727,1.649,2.104,2.25,3.318c0.819,1.655,1.666,3.367,3.35,3.367s2.53-1.712,3.35-3.367  c0.601-1.215,1.282-2.592,2.25-3.318c0.522-0.391,1.113-0.799,1.746-1.237C35.588,35.629,42,31.196,42,22C42,21.687,42,20.37,42,20z"></path><path fill="#fff" d="M24,43.485c2,0,2.526-4.63,5-6.485c4-3,12-7,12-17c0-9.389-7.611-17-17-17S7,10.611,7,20  c0,10,8,14,12,17C21.474,38.855,22,43.485,24,43.485z"></path><path d="M24,44.485c-1.684,0-2.53-1.712-3.35-3.367c-0.601-1.215-1.282-2.592-2.25-3.318c-0.522-0.391-1.113-0.799-1.746-1.237 C12.412,33.629,6,29.196,6,20c0-9.925,8.075-18,18-18s18,8.075,18,18c0,9.196-6.412,13.629-10.654,16.563 C30.713,37,30.122,37.409,29.6,37.8c-0.968,0.727-1.649,2.104-2.25,3.318C26.53,42.773,25.684,44.485,24,44.485z M24,4  C15.178,4,8,11.178,8,20c0,8.148,5.659,12.061,9.792,14.918c0.655,0.453,1.268,0.876,1.808,1.282 c1.351,1.012,2.144,2.616,2.844,4.031c0.471,0.952,1.115,2.254,1.557,2.254s1.086-1.303,1.557-2.254  c0.7-1.415,1.493-3.019,2.844-4.031c0.54-0.406,1.152-0.829,1.808-1.282C34.341,32.061,40,28.148,40,20C40,11.178,32.822,4,24,4z"></path><circle cx="24" cy="20" r="5"></circle>
</svg>` },
  { id: 'acces', label: 'Rôles', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48"><path d="M43,17H5v23c0,1.657,1.343,3,3,3h32c1.657,0,3-1.343,3-3V17z"></path><path fill="#fff" d="M40,40H8c-1.105,0-2-0.895-2-2V16h36v22C42,39.105,41.105,40,40,40z"></path><path d="M40,41H8c-1.654,0-3-1.346-3-3V16c0-0.552,0.448-1,1-1h36c0.552,0,1,0.448,1,1v22C43,39.654,41.654,41,40,41z M7,17v21 c0,0.551,0.449,1,1,1h32c0.551,0,1-0.449,1-1V17H7z"></path><path d="M24,0c-6.065,0-11,4.935-11,11v5h2v-5c0-4.962,4.038-9,9-9s9,4.038,9,9v5h2v-5C35,4.935,30.065,0,24,0z"></path><path d="M24,36c-4.411,0-8-3.589-8-8s3.589-8,8-8s8,3.589,8,8S28.411,36,24,36z M24,22c-3.309,0-6,2.691-6,6s2.691,6,6,6 s6-2.691,6-6S27.309,22,24,22z"></path><path d="M26.571,27.428c-1.104,0-2-0.896-2-2c0-0.492,0.184-0.936,0.479-1.285C24.715,24.053,24.364,24,24,24c-2.209,0-4,1.791-4,4 s1.791,4,4,4s4-1.791,4-4c0-0.364-0.053-0.715-0.144-1.051C27.507,27.244,27.063,27.428,26.571,27.428z"></path></svg>` },
    { id: 'handicap', label: 'Accessibilité', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path fill-rule="evenodd" d="M10.001,31.998v2.001h5.001v-2.001  H10.001z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M35.001,32.997v2.001h5.001v-2.001 H35.001z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M13.002,16.998v2.001h5.001v-2.001 H13.002z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M32.001,16.997v2.001h5.001v-2.001 H32.001z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M34.002,7.437v2.001h11.001V7.437  H34.002z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M10.002,33.998  c0-7.175,5.824-12.999,13-12.999c0.449,0,0.895,0.024,1.335,0.068l2.172-2.923l-2.336-2.18l-6.112,5.208l-0.409,0.332 c-1.164,0.771-2.748,0.643-3.772-0.384c-1.172-1.171-1.172-3.072,0-4.243l8-8c1.045-1.045,2.699-1.173,3.899-0.295l9.868,7.46 c1.599,1.185,1.803,3.731,0.5,5.405l-3.163,4.227c1.109,1.328,1.959,2.881,2.468,4.58l2.339,1.167  c1.893,0.947,2.721,3.207,1.888,5.153l-3,7c-0.871,2.028-3.223,2.971-5.253,2.101c-0.48-0.205-0.899-0.493-1.247-0.84 c-2.057,1.367-4.524,2.161-7.176,2.161C15.826,46.998,10.002,41.174,10.002,33.998z M34.002,9.498c0-3.035,2.464-5.499,5.5-5.499  c3.035,0,5.499,2.464,5.499,5.499c0,3.036-2.464,5.5-5.499,5.5C36.466,14.998,34.002,12.534,34.002,9.498z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M23.609,26.641  c-1.307-1.016-1.543-2.903-0.525-4.209l4.763-6.408l-3.643-3.399l-6.788,5.788c-0.78,0.781-2.048,0.781-2.828,0 c-0.781-0.78-0.781-2.048,0-2.828l8-8c0.697-0.697,1.799-0.783,2.595-0.2l9.865,7.459c1.085,0.804,1.321,2.691,0.304,3.997l-5.983,8 C28.353,28.147,24.03,26.97,23.609,26.641z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M26.295,28.367 c-1.259-0.155-2.568-0.523-3.081-0.796c-0.057-0.031-0.139-0.077-0.221-0.141c-1.741-1.355-2.056-3.869-0.705-5.604l4.221-5.681 l-2.336-2.18l-6.112,5.208l-0.409,0.332c-1.164,0.771-2.748,0.643-3.772-0.384c-1.172-1.171-1.172-3.072,0-4.243l8-8  c1.045-1.045,2.699-1.173,3.899-0.295l9.868,7.46c1.599,1.185,1.803,3.731,0.5,5.405l-6.003,8.023  C29.245,28.597,27.358,28.498,26.295,28.367z M28.019,26.41c0.437-0.06,0.553-0.176,0.556-0.179l5.98-7.997 c0.732-0.939,0.464-2.167-0.108-2.589l-9.863-7.457c-0.392-0.287-0.941-0.244-1.291,0.105l-8,8c-0.391,0.389-0.391,1.024,0,1.413  c0.389,0.391,1.024,0.391,1.413,0.001l0.059-0.055l6.788-5.788c0.387-0.329,0.96-0.317,1.331,0.029l3.643,3.399 c0.372,0.348,0.424,0.92,0.12,1.328l-4.769,6.417c-0.599,0.769-0.553,1.829,0.052,2.536l0.261,0.249l0.072,0.032  c0.344,0.135,1.264,0.404,2.276,0.527C27.099,26.45,27.615,26.465,28.019,26.41z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M31.819,42.757 c-1.521-0.653-2.228-2.417-1.576-3.94l1.887-4.4l-3.471-1.735c-1.481-0.74-2.081-2.544-1.341-4.025 c0.74-1.481,2.544-2.081,4.025-1.341l6,3c1.42,0.711,2.041,2.405,1.416,3.865l-3,7C35.106,42.702,33.342,43.409,31.819,42.757z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M31.425,43.677  c-2.028-0.871-2.971-3.223-2.101-5.253l1.515-3.533l-2.627-1.313c-1.976-0.987-2.775-3.392-1.788-5.367 c0.987-1.976,3.392-2.775,5.367-1.788l6,3c1.893,0.947,2.721,3.207,1.888,5.153l-3,7C35.807,43.603,33.455,44.546,31.425,43.677z M34.839,40.787l3-7c0.417-0.973,0.003-2.103-0.944-2.577l-6-3c-0.988-0.493-2.191-0.092-2.684,0.895 c-0.493,0.988-0.092,2.191,0.895,2.684l3.471,1.735c0.473,0.236,0.68,0.801,0.472,1.288l-1.887,4.4 c-0.435,1.015,0.036,2.191,1.051,2.627C33.227,42.273,34.403,41.802,34.839,40.787z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M23.002,19.998  c6.624,0,12,5.376,12,12s-5.376,12-12,12s-12-5.376-12-12S16.378,19.998,23.002,19.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M10.002,31.998  c0-7.175,5.824-12.999,13-12.999c7.175,0,12.999,5.824,12.999,12.999c0,7.176-5.824,13-12.999,13 C15.826,44.998,10.002,39.174,10.002,31.998z M34.002,31.998c0-6.072-4.928-11-11-11c-6.073,0-11.001,4.928-11.001,11 c0,6.073,4.928,11.001,11.001,11.001C29.074,42.999,34.002,38.071,34.002,31.998z" clip-rule="evenodd"></path><path fill="#fff" fill-rule="evenodd" d="M39.502,2.999 c2.484,0,4.5,2.016,4.5,4.5c0,2.484-2.016,4.5-4.5,4.5s-4.5-2.016-4.5-4.5C35.002,5.015,37.018,2.999,39.502,2.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M34.002,7.499  c0-3.035,2.464-5.499,5.5-5.499c3.035,0,5.499,2.464,5.499,5.499c0,3.036-2.464,5.5-5.499,5.5  C36.466,12.999,34.002,10.535,34.002,7.499z M43.002,7.499c0-1.932-1.568-3.5-3.5-3.5c-1.933,0-3.501,1.568-3.501,3.5 c0,1.933,1.568,3.501,3.501,3.501C41.434,11.001,43.002,9.433,43.002,7.499z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M2.002,31.998c0-0.551,0.448-1,1-1h18 c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1h-18C2.45,32.998,2.002,32.55,2.002,31.998z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M6.002,26.999c0-0.551,0.448-1,1-1h10  c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1h-10C6.45,27.999,6.002,27.551,6.002,26.999z" clip-rule="evenodd"></path><path fill-rule="evenodd" d="M6.002,36.998c0-0.551,0.448-1,1-1h10 c0.551,0,1,0.449,1,1c0,0.552-0.449,1-1,1h-10C6.45,37.998,6.002,37.55,6.002,36.998z" clip-rule="evenodd"></path>
</svg>
` },

    { id: 'mailing', label: 'Mailing', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M44,18H4v20c0,1.657,1.343,3,3,3h34c1.657,0,3-1.343,3-3V18z"></path><path fill="#fff" d="M41,38H7c-1.105,0-2-0.895-2-2V8h38v28C43,37.105,42.105,38,41,38z"></path><path d="M41,39H7c-1.654,0-3-1.346-3-3V8c0-0.552,0.448-1,1-1h38c0.552,0,1,0.448,1,1v28C44,37.654,42.654,39,41,39z M6,9v27 c0,0.551,0.449,1,1,1h34c0.551,0,1-0.449,1-1V9H6z"></path><path d="M43,20l-17.258,7.266c-1.103,0.464-2.356,0.411-3.415-0.147L5,18v-2l18.612,7.837c0.248,0.104,0.528,0.104,0.776,0L43,16V20 z"></path><path d="M37,31h-4c-0.552,0-1,0.448-1,1s0.448,1,1,1h4c0.552,0,1-0.448,1-1S37.552,31,37,31z"></path>
</svg>` },

    { id: 'devis', label: 'Devis', icon: `<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M41,36H7v6c0,1.657,1.343,3,3,3h28c1.657,0,3-1.343,3-3V36z"></path><path fill="#fff" d="M38,42H10c-1.105,0-2-0.895-2-2V4h21l11,11v25C40,41.105,39.105,42,38,42z"></path><path d="M38,43H10c-1.654,0-3-1.346-3-3V4c0-0.552,0.447-1,1-1h21c0.266,0,0.52,0.105,0.707,0.293l11,11 C40.895,14.48,41,14.735,41,15v25C41,41.654,39.654,43,38,43z M9,5v35c0,0.551,0.448,1,1,1h28c0.552,0,1-0.449,1-1V15.414L28.586,5  H9z"></path><path d="M40,16H29c-0.553,0-1-0.448-1-1V4c0-0.552,0.447-1,1-1s1,0.448,1,1v10h10c0.553,0,1,0.448,1,1S40.553,16,40,16z"></path><path d="M25.124,19.008c-0.553-0.065-1.048,0.32-1.116,0.868l-2,16c-0.068,0.548,0.32,1.048,0.868,1.116  C22.918,36.997,22.96,37,23.001,37c0.497,0,0.928-0.37,0.991-0.876l2-16C26.061,19.576,25.672,19.076,25.124,19.008z"></path><path d="M33.8,27.4l-3-4c-0.332-0.443-0.958-0.531-1.399-0.2c-0.442,0.331-0.532,0.958-0.2,1.399l2.55,3.4l-2.55,3.4  c-0.332,0.441-0.242,1.068,0.2,1.399c0.18,0.135,0.39,0.2,0.599,0.2c0.305,0,0.604-0.138,0.801-0.4l3-4 C34.066,28.244,34.066,27.756,33.8,27.4z"></path><path d="M18.6,23.2c-0.44-0.33-1.068-0.242-1.399,0.2l-3,4c-0.267,0.355-0.267,0.844,0,1.199l3,4c0.196,0.263,0.496,0.4,0.801,0.4  c0.209,0,0.419-0.065,0.599-0.2c0.442-0.331,0.532-0.958,0.2-1.399L16.25,28l2.55-3.4C19.132,24.158,19.042,23.531,18.6,23.2z"></path>
</svg>` },

    { id: 'factures', label: 'Factures', icon:`<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
<path d="M41,36H7v6c0,1.657,1.343,3,3,3h28c1.657,0,3-1.343,3-3V36z"></path><path fill="#fff" d="M38,42H10c-1.105,0-2-0.895-2-2V4h21l11,11v25C40,41.105,39.105,42,38,42z"></path><path d="M38,43H10c-1.654,0-3-1.346-3-3V4c0-0.552,0.447-1,1-1h21c0.266,0,0.52,0.105,0.707,0.293l11,11 C40.895,14.48,41,14.735,41,15v25C41,41.654,39.654,43,38,43z M9,5v35c0,0.551,0.448,1,1,1h28c0.552,0,1-0.449,1-1V15.414L28.586,5  H9z"></path><path d="M40,16H29c-0.553,0-1-0.448-1-1V4c0-0.552,0.447-1,1-1s1,0.448,1,1v10h10c0.553,0,1,0.448,1,1S40.553,16,40,16z"></path><path d="M33,24H16c-0.553,0-1,0.448-1,1s0.447,1,1,1h17c0.553,0,1-0.448,1-1S33.553,24,33,24z"></path><path d="M27,29H16c-0.553,0-1,0.448-1,1s0.447,1,1,1h11c0.553,0,1-0.448,1-1S27.553,29,27,29z"></path>
</svg> `},
];

onMounted(() => {
  const etablissementId = userStore.user.associatedEntity?._id;
  if (etablissementId) {
    etablissementsStore.fetchEtablissementById(etablissementId);
  }
});

const handleCreateEtablissement = async (nom: string) => {
  try {
    await etablissementsStore.createMyEtablissement({ nom });
    showCreateModal.value = false;
  } catch (error) {
    console.error("Erreur lors de la création de l'établissement:", error);
    alert("La création a échoué. Veuillez réessayer.");
  }
};

const handleChangeTab = (tabId: string) => {
  if (tabId === 'pipeline') {
    if (etablissement.value) {
      router.push({ name: 'pipeline', query: { ecoleId: etablissement.value._id } });
    }
  } else {
    activeTab.value = tabId;
  }
};
</script>

<template>
  <div class="page-container">
    <TheHeader 
      :pageTitle="etablissement ? etablissement.nom : 'Mon Établissement'" 
      :showBackButton="false"
      backButtonRoute="/dashboard"
    />

    <main class="flex-1 p-6 md:p-8">
      <div v-if="etablissement">
        
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div class="flex-1 min-w-0">
            <h1 class="text-3xl md:text-4xl font-black text-[#423B71] tracking-tight flex flex-col sm:flex-row sm:items-baseline gap-2 break-words">
              Gestion de l'Établissement
              <span v-if="etablissementName" class="text-gray-400 font-medium text-xl sm:text-2xl truncate">
                <span class="hidden sm:inline">-</span> {{ etablissementName }}
              </span>
            </h1>
            <p class="text-sm text-gray-500 mt-2 font-medium">Gérez les informations, l'identité visuelle et les paramètres de votre établissement.</p>
          </div>
        </div>

        <AppTabs
          :active-tab="activeTab"
          :tabs="etablissementTabs"
          @change-tab="tab => activeTab = tab"
        />
        
        <div class="mt-6" :key="etablissement._id">
          <EtablissementGeneral v-if="activeTab === 'general'" :etablissement="etablissement" />
          <LieuxPage v-if="activeTab === 'lieux'" :etablissement-id="etablissement._id" />
          <EtablissementAcces v-if="activeTab === 'acces'" :etablissement-id="etablissement._id" />
          <HandicapPage v-if="activeTab === 'handicap'" :etablissement-id="etablissement._id" />
          <EmailsPage v-if="activeTab === 'mailing'" :etablissement-id="etablissement._id" />
          <DevisPage v-if="activeTab === 'devis'" :etablissement-id="etablissement._id" />
          <FacturesPage v-if="activeTab === 'factures'" :etablissement-id="etablissement._id" />
        </div>
      </div>
      
      <!-- Cas où aucun établissement n'est lié -->
      <div v-else class="text-center py-12">
        <div v-if="etablissementsStore.isLoading">
          <p class="text-gray-500">Chargement...</p>
        </div>
        <div v-else-if="userStore.userRole === 'ecole'">
          <h2 class="text-2xl font-bold text-[#423B71]">Bienvenue !</h2>
          <p class="text-gray-600 mt-2 mb-6">Vous n'avez pas encore d'établissement. Créez-le maintenant pour commencer.</p>
          <button @click="showCreateModal = true" class="btn-primary">
            Créer mon Établissement
          </button>
        </div>
        <div v-else>
           <p class="text-gray-500">Aucun établissement n'est associé à votre compte.</p>
        </div>
      </div>
    </main>
    
    <CreateEtablissementModal
      :show-modal="showCreateModal"
      @close="showCreateModal = false"
      @create="handleCreateEtablissement"
    />
  </div>
</template>

<style scoped>
.page-container {
  background-color: #f8f9fa;
  min-height: 100vh;
}
.btn-primary {
  @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors duration-300;
}
</style>