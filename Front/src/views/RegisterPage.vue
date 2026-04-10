<template>
  <div class="min-h-screen flex bg-white font-sans">
    
    <div class="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10 py-12">
      
      <div class="absolute top-8 left-8 sm:top-12 sm:left-12 xl:left-32">
        <router-link to="/">
          <img 
            v-if="tenantConfig?.found && tenantConfig.customization?.logoUrl" 
            :src="tenantConfig.customization.logoUrl" 
            :alt="`Logo de ${tenantConfig.name}`" 
            class="h-24 w-auto object-contain" 
          />
          <img 
            v-else 
            src="/flamingo(1).png" 
            alt="Syali Logo" 
            class="h-24 w-auto object-contain" 
          />
        </router-link>
      </div>

      <div class="w-full max-w-md mx-auto mt-24 lg:mt-32">
        <div class="mb-10 text-center lg:text-left">
          <h1 class="text-3xl font-black mb-3 tracking-tight text-gray-900">
            Rejoignez-nous
          </h1>
          <p class="text-gray-500 font-medium">
            Créez votre compte gratuitement et accédez à votre espace d'apprentissage.
          </p>
        </div>

        <form @submit.prevent="handleRegister" novalidate class="space-y-5">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Prénom</label>
              <input 
                type="text" 
                v-model="prenom" 
                class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-opacity-50 focus:ring-2 outline-none transition-all font-medium text-gray-800 placeholder-gray-400" 
                :style="{ '--tw-ring-color': tenantPrimaryColor + '80' }"
                placeholder="Jean" 
                required
              >
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Nom</label>
              <input 
                type="text" 
                v-model="nom" 
                class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-opacity-50 focus:ring-2 outline-none transition-all font-medium text-gray-800 placeholder-gray-400" 
                :style="{ '--tw-ring-color': tenantPrimaryColor + '80' }"
                placeholder="Dupont" 
                required
              >
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Adresse email</label>
            <input 
              type="email" 
              v-model="email" 
              class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-opacity-50 focus:ring-2 outline-none transition-all font-medium text-gray-800 placeholder-gray-400" 
              :style="{ '--tw-ring-color': tenantPrimaryColor + '80' }"
              placeholder="votre.email@exemple.com" 
              required
            >
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Mot de passe</label>
            <input 
              type="password" 
              v-model="password" 
              class="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-opacity-50 focus:ring-2 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
              :style="{ '--tw-ring-color': tenantPrimaryColor + '80' }"
              placeholder="••••••••" 
              required
            >
          </div>

          <button 
            type="submit" 
            class="w-full py-4 rounded-2xl font-black text-white shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            :style="buttonStyle"
          >
            S'inscrire <i class="fas fa-check text-sm"></i>
          </button>
        </form>

        <div class="relative flex items-center py-8">
            <div class="flex-grow border-t border-gray-200"></div>
            <span class="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-widest">Ou s'inscrire avec</span>
            <div class="flex-grow border-t border-gray-200"></div>
        </div>
        
        <div class="mb-8 flex justify-center">
            <div id="g_id_onload" 
                 data-client_id="1032892697546-ba0uv72lcdgpkl1abu745dt5tr3qfr2l.apps.googleusercontent.com" 
                 data-callback="handleGoogleLogin" 
                 data-auto_prompt="false">
            </div>
            <div class="g_id_signin w-full flex justify-center" 
                 data-type="standard" 
                 data-size="large" 
                 data-theme="outline" 
                 data-text="signup_with" 
                 data-shape="pill" 
                 data-logo_alignment="left" 
                 data-width="400">
            </div>
        </div>

        <p class="text-sm text-center text-gray-500 font-medium">
          Déjà un compte ?
          <router-link to="/" class="font-bold transition-colors hover:underline" :style="{ color: tenantPrimaryColor }">
            Se connecter
          </router-link>
        </p>
      </div>
    </div>

    <div class="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
      <video autoplay muted loop playsinline class="absolute inset-0 w-full h-full object-cover opacity-60">
        <source src="/img/320.mp4" type="video/mp4" />
        <img src="/img/omg.png" class="w-full h-full object-cover" />
      </video>

      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div class="absolute inset-0" :style="{ backgroundColor: tenantPrimaryColor, opacity: 0.2 }"></div>

      <div class="relative z-10 p-12 max-w-lg">
        <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[2.5rem] shadow-2xl">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 text-white text-2xl border border-white/30">
            <i class="fas fa-rocket"></i>
          </div>
          <h2 class="text-3xl font-black text-white leading-tight mb-4">
            Propulsez votre carrière au niveau supérieur.
          </h2>
          <p class="text-white/80 font-medium text-lg leading-relaxed mb-6">
            Développez de nouvelles compétences, interagissez avec vos formateurs et suivez votre progression en temps réel.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '/services/api'; 
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();

const nom = ref('');
const prenom = ref('');
const email = ref('');
const password = ref('');
const role = ref('apprenant');
const tenantConfig = ref<any>(null);

const tenantPrimaryColor = computed(() => {
  return tenantConfig.value?.found ? tenantConfig.value.customization.primaryColor : '#423B71';
});

const buttonStyle = computed(() => ({
  backgroundColor: tenantPrimaryColor.value,
  boxShadow: `0 10px 25px -5px ${tenantPrimaryColor.value}60`
}));

const handleRegister = async () => {
  // 1. Validation de la longueur du mot de passe (8 caractères min)
  if (password.value.length < 8) {
    alert("Le mot de passe doit contenir au moins 8 caractères.");
    return;
  }

  try {
    // 2. Normalisation de l'email (minuscules et retrait des espaces)
    const cleanEmail = email.value.trim().toLowerCase();

    // 3. Appel API avec les données nettoyées
    const response = await api.post('/api/auth/register', {
      nom: nom.value,
      prenom: prenom.value,
      email: cleanEmail,
      password: password.value,
      role: role.value,
    });

    // 4. Succès et redirection
    alert(response.data.message);
    router.push('/');
  } catch (error: any) {
    // Gestion des erreurs serveurs (ex: email déjà utilisé)
    console.error('Erreur de registre :', error.response ? error.response.data : error.message);
    alert('Erreur lors de l\'enregistrement : ' + (error.response?.data?.message || error.message));
  }
};

// @ts-ignore
window.handleGoogleLogin = async (response) => {
  try {
    const res = await api.post('/api/auth/google', { idToken: response.credential });
    userStore.setUserData(res.data.user);
    userStore.setAuthToken(res.data.token);
    router.push('/formations'); 
  } catch (error: any) {
    alert('Erreur Google : ' + (error.response?.data?.message || error.message));
  }
};

onMounted(async () => {
  try {
    const response = await api.get('/api/tenant/config');
    tenantConfig.value = response.data;
  } catch (error) {
    tenantConfig.value = { found: false };
  }
});
</script>