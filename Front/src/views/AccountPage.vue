<template>
  <div class="min-h-screen bg-gray-50 font-sans flex flex-col">
    <TheHeader pageTitle="Mon Profil" :showBackButton="true" backButtonRoute="/formations" />

    <div class="flex-1 p-0">
      
      <div class="h-80 bg-gradient-to-r from-indigo-100 to-purple-100 relative shadow-inner">
         <div class="absolute -bottom-24 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 w-48 h-48 rounded-[2rem] overflow-hidden bg-gray-200 border-8 border-white flex items-center justify-center shadow-xl z-10 transition-all">
            <img v-if="userProfile.photo" :src="userProfile.photo" alt="Photo de profil" class="w-full h-full object-cover">
            <svg v-else class="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clip-rule="evenodd"/>
            </svg>
         </div>
         
         <div class="absolute inset-0 bg-black/5 flex items-center justify-center">
            <h1 class="text-4xl md:text-6xl font-extrabold text-[#423B71] tracking-tighter uppercase opacity-30">Mon Compte Syali</h1>
         </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-6 py-32 md:py-24 space-y-12">
         
         <div class="text-center md:text-left md:pl-28 space-y-4">
             <div class="space-y-1">
               <h1 class="text-5xl font-extrabold text-gray-900 tracking-tight">{{ userProfile.prenom }} {{ userProfile.nom }}</h1>
               <p class="text-xl font-bold text-gray-500 uppercase tracking-widest">{{ userProfile.role }}</p>
               <p class="text-base text-gray-600 font-medium italic flex items-center gap-2 justify-center md:justify-start">
                 <i class="far fa-envelope text-indigo-400"></i>
                 {{ userProfile.email }}
               </p>
             </div>
             
             <div class="flex justify-center md:justify-start pt-3">
               <input
                type="file"
                ref="profileFileInputRef"
                @change="handleFileSelected"
                class="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
              <button @click="triggerProfileFileUpload" class="btn-primary flex items-center gap-2.5">
                <i class="fas fa-camera text-sm"></i> Modifier la photo de profil
              </button>
             </div>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div class="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-10 space-y-6">
                <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                   <span class="w-1.5 h-6 bg-indigo-500 rounded-full"></span> Mes Informations
                </h3>
                <div class="space-y-4 pt-2">
                  <div>
                    <label for="profile-prenom" class="label">Prénom</label>
                    <input id="profile-prenom" type="text" v-model="userProfile.prenom" class="input-field">
                  </div>
                  <div>
                    <label for="profile-nom" class="label">Nom</label>
                    <input id="profile-nom" type="text" v-model="userProfile.nom" class="input-field">
                  </div>
                  <div>
                    <label for="profile-telephone" class="label">Numéro de téléphone</label>
                    <input id="profile-telephone" type="tel" v-model="userProfile.telephone" class="input-field" placeholder="06 12 34 56 78">
                  </div>
                  <p class="text-xs text-gray-500 font-medium italic">Pour modifier votre email ou votre rôle, contactez notre équipe de support.</p>
                </div>
                <div class="mt-8 text-right">
                  <button @click="saveMyInformation" class="btn-primary">Enregistrer les modifications</button>
                </div>
             </div>

             <div class="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-10 space-y-6">
                <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <span class="w-1.5 h-6 bg-purple-500 rounded-full"></span> Sécurité (Mot de passe)
                </h3>
                <div class="space-y-4 pt-2">
                    <div>
                        <label for="current-password" class="label">Mot de passe actuel</label>
                        <input id="current-password" type="password" v-model="passwordForm.current" class="input-field" placeholder="••••••••">
                    </div>
                    <div>
                        <label for="new-password" class="label">Nouveau mot de passe</label>
                        <input id="new-password" type="password" v-model="passwordForm.new" class="input-field" placeholder="••••••••">
                    </div>
                    <div>
                        <label for="confirm-password" class="label">Confirmer le nouveau mot de passe</label>
                        <input id="confirm-password" type="password" v-model="passwordForm.confirm" class="input-field" placeholder="••••••••">
                    </div>
                    <p class="text-xs text-gray-500 font-medium italic">Le mot de passe doit contenir au moins 8 caractères.</p>
                </div>
                <div class="mt-8 text-right">
                  <button @click="handlePasswordChange" class="btn-primary bg-purple-600 hover:bg-purple-700">Mettre à jour le mot de passe</button>
                </div>
             </div>
         </div>
         
         <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div class="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-10 text-center py-20 text-gray-500">
               <h3 class="text-xl font-bold text-gray-900 mb-2">Abonnement & Facturation</h3>
               <p>Cette section sera développée plus tard.</p>
             </div>
             <div class="bg-white rounded-[2rem] shadow-xl border border-gray-100 p-8 md:p-10 text-center py-20 text-gray-500">
               <h3 class="text-xl font-bold text-gray-900 mb-2">Paramètres de notification</h3>
               <p>Cette section sera développée plus tard.</p>
             </div>
         </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '../stores/user';
import TheHeader from '../components/TheHeader.vue'; 

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
  userStore.fetchUserProfile();
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
    // Appel d'une méthode fictive car elle n'est pas présente dans le store fourni
    // Vous devrez implémenter la méthode 'changePassword' dans '../stores/user'
    // qui appellera l'endpoint de changement de mot de passe de votre backend.
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