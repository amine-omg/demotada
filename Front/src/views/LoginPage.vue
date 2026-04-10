<template>
  <div class="min-h-screen flex bg-[#FDFCFB] font-sans overflow-hidden">
    
    <div class="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-16 md:px-24 relative z-10 py-12 bg-white shadow-[20px_0_60px_rgba(0,0,0,0.02)]">
      
      <div class="absolute top-12 left-12">
        <router-link to="/" class="flex items-center gap-3 group">
          <img 
            src="https://demotada.onrender.com/uploads/horns.png" 
            alt="Logo" 
            class="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
          />
          <span class="text-2xl font-black text-[#050505] tracking-tighter italic ">
            Karnain<span class="text-[#E5E5D1]">.</span>
          </span>
        </router-link>
      </div>

      <div class="w-full max-w-sm mx-auto mt-24">
        <div class="mb-12">
          <h1 class="text-4xl font-black text-[#050505] mb-4 tracking-tighter leading-none italic">
            Connexion<span class="text-[#E5E5D1]">.</span>
          </h1>
          <p class="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
            Identifiez-vous pour accéder à l'Engine v3
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Référence Email</label>
            <input 
              v-model="email" 
              type="email" 
              required
              class="w-full px-5 py-4 bg-[#FDFCFB] border border-[#E5E5D1] rounded-2xl focus:border-[#050505] focus:ring-0 transition-all text-sm font-bold placeholder:text-slate-300"
              placeholder="nom@exemple.com"
            />
          </div>

          <div class="space-y-2">
            <div class="flex justify-between items-center px-1">
              <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clé d'accès</label>
              <a href="#" class="text-[9px] font-black text-[#E5E5D1] hover:text-[#050505] uppercase tracking-widest transition-colors">Oubliée ?</a>
            </div>
            <div class="relative">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                required
                class="w-full px-5 py-4 bg-[#FDFCFB] border border-[#E5E5D1] rounded-2xl focus:border-[#050505] focus:ring-0 transition-all text-sm font-bold"
              />
              <button 
                type="button" 
                @click="togglePassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#050505]"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"/></svg>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            class="w-full py-5 bg-[#E5E5D1] text-[#050505] rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#D8D8C4] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm mt-4"
          >
            Se connecter
          </button>
        </form>

        <div class="mt-8 pt-8 border-t border-[#E5E5D1]/50">
          <div id="google-login-btn" class="flex justify-center"></div>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex lg:w-7/12 bg-[#050505] relative items-center justify-center p-20">
      <div class="absolute inset-0 opacity-[0.1]" 
           style="background-image: linear-gradient(#E5E5D1 1px, transparent 1px), linear-gradient(90deg, #E5E5D1 1px, transparent 1px); background-size: 50px 50px;">
      </div>
      
      <div class="relative w-full h-full border border-white/5 rounded-[3rem] flex items-center justify-center overflow-hidden">
        <div class="absolute -top-10 -right-10 text-white/5 font-black text-[250px] leading-none select-none tracking-tighter">
          03
        </div>
        
        <div class="z-10 text-center space-y-8 max-w-lg">
          <div class="inline-flex items-center gap-3 px-4 py-1.5 bg-[#E5E5D1] text-[#050505] text-[9px] font-black uppercase tracking-[0.4em] mb-4">
            System Active
          </div>
          
          <h2 class="text-6xl font-black text-white tracking-tighter leading-[0.9] text-center italic">
            Vous allez devenir ami avec vos PDF
          </h2>
          
          <div class="flex items-center justify-center gap-6">
            <div class="h-px w-12 bg-white/20"></div>
            <p class="text-slate-500 font-bold text-[11px] uppercase tracking-widest">
              Analyse structurelle
            </p>
            <div class="h-px w-12 bg-white/20"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* Petit hack pour que le bouton Google s'intègre mieux au design sombre/beige */
#google-login-btn {
  filter: grayscale(1) invert(0.1);
  opacity: 0.8;
  transition: all 0.3s;
}
#google-login-btn:hover {
  filter: grayscale(0);
  opacity: 1;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const showPassword = ref(false)

const isFocusedEmail = ref(false)
const isFocusedPwd = ref(false)
const tenantConfig = ref<any>(null)

const tenantPrimaryColor = computed(() => {
  return tenantConfig.value?.found ? tenantConfig.value.customization.primaryColor : '#423B71'
})

const buttonStyle = computed(() => ({
  backgroundColor: tenantPrimaryColor.value,
  boxShadow: `0 10px 25px -5px ${tenantPrimaryColor.value}60`
}))

const togglePassword = () => { showPassword.value = !showPassword.value }

const handleLogin = async () => {
  try {
    // 1. On garde la normalisation de l'email (indispensable)
    const cleanEmail = email.value.trim().toLowerCase();

    // 2. ON SUPPRIME le bloc "if (password.value.length < 8)" 
    // pour permettre aux anciens comptes de se connecter.

    // 3. Tentative de connexion via le store
    await userStore.login(cleanEmail, password.value);

    // 4. Redirection en cas de succès
    router.push('/formations');
  } catch (error: any) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    alert('Connexion échouée : identifiants invalides ou erreur serveur.');
  }
};

// @ts-ignore
window.handleGoogleLogin = async (response) => {
  try {
    const res = await api.post('/api/auth/google', { idToken: response.credential })
    userStore.setUserData(res.data.user)
    userStore.setAuthToken(res.data.token)
    router.push('/formations')
  } catch (error: any) {
    console.error('Erreur lors de la connexion Google :', error.response ? error.response.data : error.message)
    alert('Erreur lors de la connexion Google : ' + (error.response?.data?.message || error.message))
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/api/tenant/config')
    tenantConfig.value = response.data
  } catch (error) {
    console.error('Erreur config tenant :', error)
    tenantConfig.value = { found: false }
  }
})
</script>