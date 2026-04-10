<template>
  <div class="min-h-screen flex bg-white font-sans">
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">
      
      <div class="absolute top-8 left-8 sm:top-12 sm:left-12 xl:left-32">
        <router-link to="/"><img src="/flamingo(1).png" alt="Syali" class="h-12 w-auto" /></router-link>
      </div>

      <div class="w-full max-w-md mx-auto mt-16 lg:mt-0">
        <div class="mb-10 text-center lg:text-left">
          <h1 class="text-3xl font-black mb-3 tracking-tight text-gray-900">Nouveau mot de passe</h1>
          <p class="text-gray-500 font-medium">Saisissez votre nouveau mot de passe pour retrouver l'accès à votre compte.</p>
        </div>

        <div v-if="success" class="p-6 bg-green-50 rounded-2xl border border-green-200 text-green-800 text-center">
          <i class="fas fa-check-circle text-4xl mb-3 text-green-500"></i>
          <h3 class="font-black text-lg mb-1">Mot de passe modifié</h3>
          <p class="text-sm font-medium">Votre mot de passe a bien été mis à jour.</p>
          <button @click="router.push('/')" class="mt-6 w-full py-3 bg-green-600 text-white rounded-xl font-bold">Se connecter</button>
        </div>

        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Nouveau mot de passe</label>
            <input type="password" v-model="password" class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-300 outline-none font-medium text-gray-800" placeholder="••••••••" required>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Confirmez le mot de passe</label>
            <input type="password" v-model="confirmPassword" class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-300 outline-none font-medium text-gray-800" placeholder="••••••••" required>
          </div>

          <p v-if="error" class="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg"><i class="fas fa-exclamation-circle mr-1"></i> {{ error }}</p>

          <button type="submit" :disabled="isLoading" class="w-full py-4 bg-[#423B71] hover:bg-indigo-700 rounded-2xl font-black text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50">
            <i v-if="isLoading" class="fas fa-circle-notch fa-spin mr-2"></i> Mettre à jour
          </button>
        </form>
      </div>
    </div>
    
    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
      <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover opacity-60"><source src="/img/320.mp4" type="video/mp4" /></video>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div><div class="absolute inset-0 bg-[#423B71] opacity-30"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '/services/api';

const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref(false);
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();

const handleResetPassword = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = "Les mots de passe ne correspondent pas.";
    return;
  }
  isLoading.value = true;
  error.value = '';
  try {
    const token = route.params.token; // Récupère le token depuis l'URL /reset-password/:token
    await api.post(`/api/auth/reset-password/${token}`, { password: password.value });
    success.value = true;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Le lien est invalide ou a expiré.";
  } finally {
    isLoading.value = false;
  }
};
</script>