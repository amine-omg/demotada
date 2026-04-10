<template>
  <div :class="isMobile ? 'h-[100dvh]' : 'min-h-screen'" class="w-full max-w-[100vw] bg-[#F8F9FA] font-sans text-[#1A1A1A] flex flex-col overflow-x-hidden relative min-w-0">
    
    <TheHeader pageTitle="Mon Profil" :showBackButton="true" @back="$router.push('/formations')" class="shrink-0 w-full z-40" />

    <input
      type="file"
      ref="profileFileInputRef"
      @change="handleFileSelected"
      class="hidden"
      accept="image/png, image/jpeg, image/gif"
    />

    <div v-if="isMobile" class="flex-1 flex flex-col w-full overflow-y-auto custom-scrollbar-hide min-w-0 pb-20">
      
      <div class="bg-white border-b-2 border-black p-6 flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-sm">
        <div class="absolute top-0 left-0 w-full h-1/2 bg-[#1A1A1A]"></div>
        
        <div class="relative z-10 w-24 h-24 rounded-[1.5rem] border-4 border-white bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden mb-4 mt-2">
          <img v-if="userProfile.photo" :src="userProfile.photo" alt="Photo" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-3xl">👤</div>
        </div>

        <button @click="triggerProfileFileUpload" class="mb-4 bg-white border-2 border-black text-[#1A1A1A] px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-transform">
          Modifier la photo
        </button>

        <h1 class="text-2xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none text-center">{{ userProfile.prenom }} {{ userProfile.nom }}</h1>
        <p class="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mt-2 mb-1">{{ userProfile.role }}</p>
        <p class="text-xs font-bold text-gray-500">{{ userProfile.email }}</p>
      </div>

      <div class="p-4 space-y-6">
        
        <div class="bg-white p-5 rounded-[1.5rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full min-w-0">
          <h3 class="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-[#D4AF37]"></span> Mes Informations
          </h3>
          <div class="space-y-3">
            <div class="flex gap-3">
              <div class="flex-1 space-y-1.5">
                <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Prénom</label>
                <input type="text" v-model="userProfile.prenom" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold outline-none text-xs transition-colors"/>
              </div>
              <div class="flex-1 space-y-1.5">
                <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Nom</label>
                <input type="text" v-model="userProfile.nom" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold outline-none text-xs transition-colors"/>
              </div>
            </div>
            <div class="space-y-1.5">
              <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Téléphone</label>
              <input type="tel" v-model="userProfile.telephone" placeholder="06 12 34 56 78" class="w-full bg-gray-50 border border-gray-200 focus:border-[#D4AF37] rounded-xl p-3 text-[#1A1A1A] font-bold outline-none text-xs transition-colors"/>
            </div>
            <p class="text-[9px] text-gray-400 font-bold italic leading-tight pt-2">Pour modifier votre email ou votre rôle, contactez notre support.</p>
          </div>
          <button @click="saveMyInformation" class="w-full mt-5 bg-[#1A1A1A] text-white py-3.5 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-[3px_3px_0px_0px_rgba(212,175,55,0.4)] active:scale-95 transition-all">
            Enregistrer les infos
          </button>
        </div>

        <div class="bg-white p-5 rounded-[1.5rem] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full min-w-0">
          <h3 class="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-black"></span> Sécurité
          </h3>
          <div class="space-y-3">
            <div class="space-y-1.5">
              <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Mot de passe actuel</label>
              <input type="password" v-model="passwordForm.current" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 focus:border-black rounded-xl p-3 text-[#1A1A1A] font-bold outline-none text-xs transition-colors"/>
            </div>
            <div class="space-y-1.5">
              <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Nouveau mot de passe</label>
              <input type="password" v-model="passwordForm.new" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 focus:border-black rounded-xl p-3 text-[#1A1A1A] font-bold outline-none text-xs transition-colors"/>
            </div>
            <div class="space-y-1.5">
              <label class="text-[8px] font-black text-gray-500 uppercase tracking-widest">Confirmer le nouveau</label>
              <input type="password" v-model="passwordForm.confirm" placeholder="••••••••" class="w-full bg-gray-50 border border-gray-200 focus:border-black rounded-xl p-3 text-[#1A1A1A] font-bold outline-none text-xs transition-colors"/>
            </div>
            <p class="text-[9px] text-gray-400 font-bold italic leading-tight pt-2">8 caractères minimum.</p>
          </div>
          <button @click="handlePasswordChange" class="w-full mt-5 bg-[#1A1A1A] hover:bg-black text-[#D4AF37] py-3.5 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all">
            Mettre à jour Mdp
          </button>
        </div>

      </div>
    </div>


    <div v-else class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 w-full min-w-0 relative">
      
      <div class="max-w-5xl mx-auto space-y-10 pb-20">
        
        <div class="flex items-end gap-8 bg-white p-8 rounded-[2.5rem] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div class="absolute top-0 right-0 w-64 h-64 bg-[#F5F2ED] rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
          
          <div class="relative group">
            <div class="w-32 h-32 rounded-[2rem] border-4 border-black overflow-hidden shadow-sm bg-gray-100 shrink-0">
              <img v-if="userProfile.photo" :src="userProfile.photo" alt="Photo" class="w-full h-full object-cover">
              <div v-else class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-5xl">👤</div>
            </div>
            <button @click="triggerProfileFileUpload" class="absolute inset-0 bg-black/60 rounded-[2rem] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer border-4 border-transparent">
              <svg class="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <span class="text-white text-[9px] font-black uppercase tracking-widest text-center">Modifier<br>Photo</span>
            </button>
          </div>
          
          <div class="pb-2 z-10">
            <h1 class="text-4xl font-black text-[#1A1A1A] tracking-tighter uppercase leading-none">{{ userProfile.prenom }} {{ userProfile.nom }}</h1>
            <p class="text-xs font-black text-[#D4AF37] uppercase tracking-[0.2em] mt-3 mb-1">{{ userProfile.role }}</p>
            <p class="text-sm font-bold text-gray-500 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              {{ userProfile.email }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-8">
          
          <div class="bg-white rounded-[2rem] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span class="w-3 h-3 rounded-full border-2 border-black bg-[#D4AF37]"></span> 
                Mes Informations
              </h3>
              <div class="space-y-5">
                <div class="flex gap-4">
                  <div class="flex-1 space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Prénom</label>
                    <input type="text" v-model="userProfile.prenom" class="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold outline-none text-sm transition-all"/>
                  </div>
                  <div class="flex-1 space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nom</label>
                    <input type="text" v-model="userProfile.nom" class="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold outline-none text-sm transition-all"/>
                  </div>
                </div>
                <div class="space-y-2">
                  <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Numéro de téléphone</label>
                  <input type="tel" v-model="userProfile.telephone" placeholder="06 12 34 56 78" class="w-full bg-gray-50 border-2 border-transparent focus:border-[#D4AF37] focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold outline-none text-sm transition-all"/>
                </div>
                <p class="text-[10px] text-gray-400 font-bold italic mt-2">Pour modifier votre email ou votre rôle, contactez notre équipe de support.</p>
              </div>
            </div>
            
            <div class="mt-8 text-right">
              <button @click="saveMyInformation" class="bg-[#1A1A1A] hover:bg-black text-[#D4AF37] px-6 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(212,175,55,1)] transition-all hover:-translate-y-0.5">
                Enregistrer les infos
              </button>
            </div>
          </div>

          <div class="bg-white rounded-[2rem] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 flex flex-col justify-between">
            <div>
              <h3 class="text-xs font-black text-[#1A1A1A] uppercase tracking-widest mb-6 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span class="w-3 h-3 rounded-full border-2 border-black bg-[#1A1A1A]"></span> 
                Sécurité
              </h3>
              <div class="space-y-5">
                <div class="space-y-2">
                  <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Mot de passe actuel</label>
                  <input type="password" v-model="passwordForm.current" placeholder="••••••••" class="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold outline-none text-sm transition-all"/>
                </div>
                <div class="flex gap-4">
                  <div class="flex-1 space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Nouveau mot de passe</label>
                    <input type="password" v-model="passwordForm.new" placeholder="••••••••" class="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold outline-none text-sm transition-all"/>
                  </div>
                  <div class="flex-1 space-y-2">
                    <label class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Confirmer le nouveau</label>
                    <input type="password" v-model="passwordForm.confirm" placeholder="••••••••" class="w-full bg-gray-50 border-2 border-transparent focus:border-black focus:bg-white rounded-xl p-4 text-[#1A1A1A] font-bold outline-none text-sm transition-all"/>
                  </div>
                </div>
                <p class="text-[10px] text-gray-400 font-bold italic mt-2">Le mot de passe doit contenir au moins 8 caractères.</p>
              </div>
            </div>
            
            <div class="mt-8 text-right">
              <button @click="handlePasswordChange" class="bg-white border-2 border-black hover:bg-gray-50 text-[#1A1A1A] px-6 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5">
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-8">
          <div class="bg-[#F5F2ED] rounded-[2rem] border-2 border-dashed border-gray-300 p-8 text-center py-16 text-gray-500 flex flex-col items-center justify-center">
            <svg class="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            <h3 class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] mb-1">Abonnement & Facturation</h3>
            <p class="text-[10px] font-bold">Cette section sera développée plus tard.</p>
          </div>
          <div class="bg-[#F5F2ED] rounded-[2rem] border-2 border-dashed border-gray-300 p-8 text-center py-16 text-gray-500 flex flex-col items-center justify-center">
            <svg class="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <h3 class="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A] mb-1">Paramètres de notification</h3>
            <p class="text-[10px] font-bold">Cette section sera développée plus tard.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useUserStore } from '../stores/user';
import TheHeader from '../components/TheHeader.vue'; 

// ---- GESTION DU RESPONSIVE (Render Adaptatif) ----
const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768; // 768px = point de bascule standard
};

const userStore = useUserStore();
const userProfile = computed(() => userStore.user);

const profileFileInputRef = ref<HTMLInputElement | null>(null);

// Formulaire de changement de mot de passe
const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
});

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  userStore.fetchUserProfile();
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
});

// --- GESTION PHOTO DE PROFIL ---
const handleFileSelected = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  const formData = new FormData();
  formData.append('profilePhoto', file);

  await userStore.uploadProfilePhoto(formData);
};

const triggerProfileFileUpload = () => {
  profileFileInputRef.value?.click();
};

// --- SAUVEGARDE INFORMATIONS ---
const saveMyInformation = async () => {
  try {
    await userStore.updateUserProfile({
      nom: userProfile.value.nom,
      prenom: userProfile.value.prenom,
      telephone: userProfile.value.telephone,
    });
    alert('Vos informations ont été mises à jour avec succès !');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations:', error);
    alert('Erreur lors de la mise à jour de vos informations.');
  }
};

// --- CHANGEMENT MOT DE PASSE ---
const handlePasswordChange = async () => {
  const { current, new: newPass, confirm } = passwordForm.value;

  if (!current || !newPass || !confirm) {
    alert('Veuillez remplir tous les champs de mot de passe.');
    return;
  }
  if (newPass !== confirm) {
    alert('Le nouveau mot de passe et la confirmation ne correspondent pas.');
    return;
  }
  if (newPass.length < 8) {
    alert('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    return;
  }
  if (current === newPass) {
    alert('Le nouveau mot de passe doit être différent du mot de passe actuel.');
    return;
  }

  try {
    await userStore.changePassword({ currentPassword: current, newPassword: newPass });
    
    // Réinitialiser le formulaire
    passwordForm.value = { current: '', new: '', confirm: '' };
    alert('Mot de passe mis à jour avec succès !');
  } catch (error: any) {
    console.error('Erreur lors du changement de mot de passe:', error);
    alert('Erreur lors du changement de mot de passe : ' + (error.response?.data?.message || error.message));
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.1); border-radius: 10px; }
.custom-scrollbar-hide::-webkit-scrollbar { display: none; }
</style>