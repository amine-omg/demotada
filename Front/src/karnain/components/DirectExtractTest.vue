<template>
  <div class="extract-test-container">
    <h3>⚡ Test d'Extraction Directe (En mémoire)</h3>
    <p class="description">
      Uploadez un PDF ici. Le fichier ne sera pas sauvegardé sur Cloudflare ni en base de données, il sera juste lu "au vol".
    </p>

    <input 
      type="file" 
      accept="application/pdf" 
      @change="handleFileUpload"
      :disabled="loading"
      class="file-input"
    />

    <p v-if="loading" class="status loading">
      ⏳ Extraction en cours (Ctrl+A / Ctrl+C)...
    </p>

    <div v-if="stats !== null" class="result-area">
      <p class="status success">
        ✅ Texte extrait ({{ stats }} caractères) :
      </p>
      <textarea 
        readonly
        v-model="extractedText"
        class="result-box"
      ></textarea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

// États réactifs
const extractedText = ref<string>('');
const loading = ref<boolean>(false);
const stats = ref<number | null>(null);

// Fonction appelée lors de la sélection du fichier
const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  loading.value = true;
  extractedText.value = '';
  stats.value = null;

  // Préparation du payload
  const formData = new FormData();
  formData.append('pdf', file);

  try {
    // Remplace par l'URL exacte de ton API backend
    const response = await axios.post('/api/templates/test-extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (response.data.success) {
      extractedText.value = response.data.text;
      stats.value = response.data.length;
    }
  } catch (error) {
    console.error("Erreur d'extraction :", error);
    extractedText.value = "❌ Une erreur est survenue lors de la lecture du PDF.";
  } finally {
    loading.value = false;
    // Optionnel : réinitialise l'input pour pouvoir re-sélectionner le même fichier
    target.value = '';
  }
};
</script>

<style scoped>
.extract-test-container {
  padding: 20px;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  background-color: #eff6ff;
  margin-bottom: 20px;
}

h3 {
  color: #1d4ed8;
  margin: 0 0 10px 0;
}

.description {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 15px;
}

.file-input {
  margin-bottom: 15px;
}

.status {
  font-weight: bold;
}

.loading {
  color: #d97706;
}

.success {
  color: #16a34a;
}

.result-area {
  margin-top: 15px;
}

.result-box {
  width: 100%;
  height: 300px;
  padding: 10px;
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-family: monospace;
  font-size: 12px;
  resize: vertical;
}
</style>