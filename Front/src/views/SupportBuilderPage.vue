<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import TheHeader from '../components/TheHeader.vue';
// Import corrigé pour le build Vercel (identique à ton store)
import api from '/services/api'; 

// --- Initialisation ---
const route = useRoute();
const router = useRouter();
const store = useFormationBuilderStore();

// --- Récupération des IDs depuis l'URL ---
const formationId = computed(() => route.params.formationId as string);
const supportId = computed(() => route.params.supportId as string);

// --- État local pour les données du support ---
const supportTitle = ref('');
const supportPdfUrl = ref('');
const isLoading = ref(true);

// --- Chargement des données au montage ---
onMounted(async () => {
  if (supportId.value) {
    try {
      const supportData = await store.fetchSupportDetails(supportId.value);
      if (supportData) {
        supportTitle.value = supportData.title;
        supportPdfUrl.value = supportData.pdfUrl || '';
      }
    } catch (error) {
      console.error("Erreur lors du chargement du support:", error);
      alert("Impossible de charger les données de ce support.");
    } finally {
      isLoading.value = false;
    }
  }
});

// --- Logique d'upload ---
const pdfInput = ref<HTMLInputElement | null>(null);
const triggerPdfUpload = () => pdfInput.value?.click();

const handlePdfUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || !target.files[0]) return;
  
  const file = target.files[0];

  if (file.type !== 'application/pdf') {
    alert("Veuillez sélectionner un fichier PDF uniquement.");
    return;
  }

  try {
    // 1. Demander l'URL de signature
    const response = await api.post('/api/upload/presigned', {
      fileName: file.name,
      fileType: file.type
    });

    // --- SÉCURITÉ ICI ---
    // On vérifie si les données sont dans 'response.data' ou directement dans 'response'
    const result = response.data || response;
    const uploadUrl = result.uploadUrl;
    const publicUrl = result.publicUrl;

    if (!uploadUrl) {
      console.error("Réponse reçue du serveur :", response);
      throw new Error("Le serveur a répondu mais n'a pas inclus l'URL d'upload.");
    }

    // 2. Upload DIRECT vers Cloudflare R2
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file 
    });

    if (!uploadRes.ok) throw new Error("Échec du transfert direct vers Cloudflare R2.");

    // 3. Succès
    supportPdfUrl.value = publicUrl;
    alert("Fichier prêt ! Cliquez sur Sauvegarder pour terminer.");

  } catch (error: any) {
    console.error("Erreur d'upload:", error);
    alert("Erreur : " + (error.message || "Inconnue"));
  } finally {
    target.value = ''; 
  }
};

// --- Sauvegarde des modifications ---
const saveAndClose = async () => {
  try {
    await store.saveSupport({
      supportId: supportId.value,
      supportData: {
        title: supportTitle.value,
        pdfUrl: supportPdfUrl.value,
      },
    });
    router.push({ name: 'formation-builder', params: { id: formationId.value } });
  } catch (error) {
    alert("Erreur de sauvegarde. Vérifiez la console.");
  }
};
</script>

<template>
  <div>
    <TheHeader pageTitle="Éditeur de Support" :showBackButton="true" />
    <main class="p-6 md:p-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-[#423B71]">Éditeur de Support</h1>
            <p class="text-gray-600 mt-1">Modifiez le titre et le fichier PDF de ce support.</p>
          </div>
          <button @click="saveAndClose" class="btn-primary" :disabled="isLoading">
            Sauvegarder et Fermer
          </button>
        </div>

        <div v-if="isLoading" class="text-center py-10">Chargement...</div>
        
        <div v-else class="bg-white p-8 rounded-lg shadow-md space-y-6">
          <div>
            <label class="label">Titre du Support</label>
            <input type="text" v-model="supportTitle" class="input-field" placeholder="Ex: Guide de démarrage">
          </div>

          <div>
            <label class="label">Fichier PDF</label>
            
            <div v-if="supportPdfUrl" class="text-sm text-green-700 bg-green-50 p-3 rounded-md my-2 flex items-center justify-between">
              <span class="truncate mr-2">Fichier actuel : {{ supportPdfUrl.split('/').pop() }}</span>
              <a :href="supportPdfUrl" target="_blank" class="underline font-bold">Voir</a>
            </div>

            <button @click="triggerPdfUpload" class="btn-secondary w-full">
              {{ supportPdfUrl ? 'Remplacer le PDF...' : 'Uploader un PDF...' }}
            </button>
            
            <input 
              type="file" 
              ref="pdfInput" 
              @change="handlePdfUpload" 
              class="hidden" 
              accept="application/pdf" 
            />
            <p class="text-xs text-gray-500 mt-2">
              Pas de limite de taille (jusqu'à 100 Mo recommandés). Stockage sécurisé sur R2.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-75 focus:ring-[#FF8B7D] focus:border-[#FF8B7D]; }
.btn-primary { @apply bg-[#B2E9E1] text-[#443E73] font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-[#FF8B7D] transition-colors disabled:opacity-50; }
.btn-secondary { @apply bg-gray-100 text-gray-700 font-medium px-6 py-3 rounded transition-all duration-200 hover:bg-gray-200; }
</style>