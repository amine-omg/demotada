<template>
  <div class="min-h-screen flex bg-white font-sans">
    
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 py-12">
      
      <div class="absolute top-8 left-8 sm:top-12 sm:left-12 xl:left-32">
        <router-link to="/">
          <img 
            src="/flamingo(1).png" 
            alt="Syali Logo" 
            class="h-24 w-auto object-contain" 
          />
        </router-link>
      </div>

      <div class="w-full max-w-md mx-auto mt-24 lg:mt-32">
        
        <div v-if="!emailSent">
          <div class="mb-10 text-center lg:text-left">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-2xl mb-6 mx-auto lg:mx-0 shadow-sm border border-indigo-100">
              <i class="fas fa-key"></i>
            </div>
            <h1 class="text-3xl font-black mb-3 tracking-tight text-gray-900">Mot de passe oublié ?</h1>
            <p class="text-gray-500 font-medium leading-relaxed">
              Pas d'inquiétude. Entrez votre adresse email ci-dessous pour recevoir un lien de réinitialisation sécurisé.
            </p>
          </div>

          <form @submit.prevent="handleForgotPassword" novalidate class="space-y-6">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Votre adresse email</label>
              <input 
                type="email" 
                v-model="email" 
                class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all font-medium text-gray-800 placeholder-gray-400 shadow-inner" 
                placeholder="votre.email@exemple.com" 
                required
              >
            </div>

            <button 
              type="submit" 
              :disabled="isLoading"
              class="w-full py-4 bg-[#423B71] hover:bg-indigo-700 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase text-xs tracking-widest"
            >
              <i v-if="isLoading" class="fas fa-circle-notch fa-spin"></i>
              {{ isLoading ? 'Envoi en cours...' : 'Envoyer le lien de récupération' }}
            </button>
          </form>
        </div>

        <div v-else class="text-center lg:text-left animate-in fade-in zoom-in duration-500">
          <div class="w-20 h-20 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center text-3xl mb-8 mx-auto lg:mx-0 shadow-sm border border-green-100">
            <i class="fas fa-paper-plane"></i>
          </div>
          <h2 class="text-3xl font-black text-gray-900 mb-4">Vérifiez votre boîte mail</h2>
          <p class="text-gray-500 font-medium leading-relaxed mb-8">
            Si l'adresse <span class="text-[#423B71] font-bold">{{ email }}</span> existe dans notre système, un lien vous sera envoyé d'ici 2 minutes.
          </p>
          
          <div class="p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-8">
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Vous n'avez rien reçu ?</p>
            <ul class="text-sm text-gray-500 space-y-2 font-medium">
              <li>• Regardez dans vos **Spams** (courriers indésirables).</li>
              <li>• Vérifiez l'exactitude de l'adresse email saisie.</li>
            </ul>
          </div>

          <button @click="router.push('/login')" class="font-black text-[#423B71] hover:underline transition-all flex items-center gap-2 mx-auto lg:mx-0">
            <i class="fas fa-arrow-left text-sm"></i> Retour à la connexion
          </button>
        </div>

        <p v-if="!emailSent" class="text-sm text-center text-gray-500 font-medium mt-10">
          Je me souviens de mon mot de passe ! 
          <router-link to="/login" class="font-bold text-[#423B71] hover:underline transition-colors">Se connecter</router-link>
        </p>
      </div>
    </div>

    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
      <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover opacity-60">
        <source src="/img/320.mp4" type="video/mp4" />
      </video>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div class="absolute inset-0 bg-[#423B71] opacity-30"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api';

const email = ref('');
const emailSent = ref(false);
const isLoading = ref(false);
const router = useRouter();

const handleForgotPassword = async () => {
  if (!email.value) return;
  isLoading.value = true;
  try {
    // Appel au backend
    await api.post('/api/auth/forgot-password', { email: email.value });
    emailSent.value = true;
  } catch (error) {
    // Par sécurité, on affiche quand même "envoyé" pour éviter l'énumération de comptes
    emailSent.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>