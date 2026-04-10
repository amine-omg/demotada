<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <TheHeader
      pageTitle="Cours en direct"
      :showBackButton="true"
      :backButtonRoute="`/classe/${sessionId}`"
    />

    <main class="flex-1 p-4 md:p-8 flex items-center justify-center">
      <div id="meetingSDKElement" class="relative w-full h-full bg-black">
        <p v-if="isLoading" class="text-white text-center pt-10">Chargement de la session de cours...</p>
        <p v-if="error" class="text-red-400 text-center pt-10">{{ error }}</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ZoomMtgEmbedded from '@zoom/meetingsdk/embedded'; 
import TheHeader from '../components/TheHeader.vue';
import { useUserStore } from '../stores/user';
import api from '/services/api'; 
import { useCoursStore } from '../stores/coursStore'; 
import { useStudyTracker } from '../composables/useStudyTracker';


const route = useRoute();

useStudyTracker(() => route.params.id as string, 'live');

const userStore = useUserStore();
const coursStore = useCoursStore();
const nextCours = coursStore.nextCoursData.nextCours;


const client = ref<any>(null);

const isLoading = ref(true);
const error = ref<string | null>(null);

const sessionId = route.params.id as string;
const coursId = route.params.coursId as string;

const role = (userStore.user.role === 'admin' || userStore.user.role === 'formateur') ? 1 : 0;
const meetingNumber = nextCours?.meetingNumber || '';
const passWord = nextCours?.passWord || '';

async function getSignature(meetingNumber: string, role: number) {
  try {
    const { data } = await api.post(
      `/api/sessions/zoom/signature`,
      {
        meetingNumber,
        role,
      }
    );
    return data.signature;
  } catch (err) {
    console.error("Erreur pour obtenir la signature", err);
    throw new Error("Impossible de récupérer la signature d'authentification.");
  }
}
async function startMeeting() {
  const meetingSDKElement = document.getElementById('meetingSDKElement');
  if (!meetingSDKElement) {
    error.value = "L'élément de montage du SDK est introuvable.";
    isLoading.value = false;
    return;
  }

  try {
    // 1. On va chercher le lien Zoom unique de la session
    const authToken = localStorage.getItem('authToken');
    const response = await api.get(
      `/api/sessions/${sessionId}/live-details`
    );
    const { lienZoom } = response.data; 

    const meetingUrl = new URL(lienZoom);
    const meetingNumber = meetingUrl.pathname.split('/').pop() || '';
    const passWord = meetingUrl.searchParams.get('pwd') || '';

    const role = (userStore.user.role === 'admin' || userStore.user.role === 'formateur') ? 1 : 0;
    const signature = await getSignature(meetingNumber, role);
    
    client.value = ZoomMtgEmbedded.createClient();
    await client.value.init({
      zoomAppRoot: meetingSDKElement,
      language: 'fr-FR',
      patchJsMedia: true,
    });
    await client.value.join({
      signature: signature,
      meetingNumber: meetingNumber,
      userName: `${userStore.user.prenom} ${userStore.user.nom}`,
      password: passWord,
      userEmail: userStore.user.email,
    });
    
    isLoading.value = false;

  } catch (e: any) {
    console.error("Erreur lors du démarrage de la réunion", e);
    error.value = e.message || "Une erreur inconnue est survenue.";
    isLoading.value = false;
  }
}
onMounted(() => {
  startMeeting();
});

onUnmounted(() => {
  if (client.value) {
    client.value.leave();
    console.log("Session quittée proprement.");
  }
});
</script>

<style scoped>
#meetingSDKElement {
  min-height: 500px; 
}
</style>