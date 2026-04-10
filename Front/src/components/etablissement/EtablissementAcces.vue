<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEtablissementsStore } from '../../stores/etablissementsStore';

const props = defineProps<{
  etablissementId: string;
}>();

const etablissementsStore = useEtablissementsStore();

// --- DONNÉES ---
const etablissement = computed(() => etablissementsStore.currentEtablissement);

// On s'assure de n'afficher que les administrateurs dont les données sont bien présentes
const activeAdmins = computed(() => {
  return etablissement.value?.administrateurs?.filter((a: any) => a && a.email) || [];
});

const newEmail = ref('');
const isLoading = ref(false);

onMounted(async () => {
  await etablissementsStore.fetchEtablissementById(props.etablissementId);
});

// --- LOGIQUE D'AJOUT ---
const handleAddAdmin = async () => {
  if (!newEmail.value.trim()) return;
  isLoading.value = true;
  try {
    // Appel pour ajouter par email
    await etablissementsStore.updateEtablissement(props.etablissementId, {
      // @ts-ignore
      addAdminByEmail: newEmail.value.trim() 
    });
    
    // Rafraîchissement immédiat pour peupler les données (Nom, Photo...)
    await etablissementsStore.fetchEtablissementById(props.etablissementId);
    
    newEmail.value = '';
  } catch (error) {
    alert("Impossible d'ajouter cet utilisateur.");
  } finally {
    isLoading.value = false;
  }
};

const handleRemoveAdmin = async (userId: string) => {
  if (confirm("Révoquer l'accès à ce membre de la direction ?")) {
    try {
      const updatedIds = activeAdmins.value
        .filter((a: any) => a._id !== userId)
        .map((a: any) => a._id);

      await etablissementsStore.updateEtablissement(props.etablissementId, {
        // @ts-ignore
        administrateurs: updatedIds
      });
      await etablissementsStore.fetchEtablissementById(props.etablissementId);
    } catch (error) {
      console.error(error);
    }
  }
};

const getInitials = (user: any) => {
  if (!user.prenom && !user.nom) return 'U';
  return `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase();
};
</script>

<template>
  <div class="w-full space-y-6">
    
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h4 class="text-lg font-black text-[#423B71] tracking-tighter">Équipe de Direction</h4>
        <p class="text-xs font-bold text-gray-400">Gérez les accès administratifs de l'établissement.</p>
      </div>

      <form @submit.prevent="handleAddAdmin" class="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100 w-full md:w-[400px]">
        <input 
          type="email" 
          v-model="newEmail" 
          placeholder="Email du nouvel admin..." 
          class="bg-transparent border-none outline-none px-4 py-2 text-sm font-bold text-[#423B71] placeholder:text-gray-300 flex-grow"
          required
        />
        <button 
          type="submit" 
          :disabled="isLoading"
          class="bg-[#B2E9E1] text-[#423B71] px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-[#423B71] hover:text-white transition-all disabled:opacity-50"
        >
          <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
          <span v-else>Inviter</span>
        </button>
      </form>
    </div>

    <div v-if="activeAdmins.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div 
        v-for="admin in activeAdmins" 
        :key="admin._id"
        class="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center text-center"
      >
        <div class="relative mb-4">
          <div class="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-[#EFEAFB] shadow-inner">
            <img v-if="admin.photo" :src="admin.photo" class="w-full h-full object-cover" alt="Profile">
            <div v-else class="w-full h-full bg-gradient-to-br from-[#DCD8F4] to-[#EFEAFB] flex items-center justify-center text-lg font-black text-[#8A79E2]">
              {{ getInitials(admin) }}
            </div>
          </div>
          <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
        </div>

        <h5 class="text-sm font-black text-[#423B71] leading-tight">
          {{ admin.prenom }} {{ admin.nom }}
        </h5>
        <p class="text-[10px] font-bold text-gray-400 mb-4 truncate w-full px-2">{{ admin.email }}</p>

        <button 
          @click="handleRemoveAdmin(admin._id)"
          class="mt-auto pt-4 border-t border-gray-50 w-full text-[10px] font-black uppercase tracking-tighter text-gray-300 hover:text-red-500 transition-colors"
        >
          Révoquer l'accès
        </button>
      </div>
    </div>

    <div v-else class="w-full bg-white rounded-2xl p-16 text-center border border-dashed border-gray-200">
      <p class="text-sm font-bold text-gray-400 italic">Aucun administrateur supplémentaire n'est enregistré.</p>
    </div>

  </div>
</template>