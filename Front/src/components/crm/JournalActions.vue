<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  historiqueActivites: any[];
  isGeneratingDoc: boolean;
  isGeneratingDevis: boolean;
}>();

const emit = defineEmits(['save-activity', 'view-document', 'trigger-signature']);

// États locaux pour le formulaire de saisie
const activityType = ref('Note');
const noteContent = ref('');

const handleSave = () => {
  if (!noteContent.value.trim()) return;
  emit('save-activity', {
    type: activityType.value,
    content: noteContent.value
  });
  noteContent.value = ''; // Reset après envoi
};

// Helpers visuels (identiques à l'original)
const getIconClass = (type: string) => {
  if (type === 'Note') return 'bg-gray-100 text-[#423B71]';
  if (type === 'Appel') return 'bg-blue-100 text-blue-500';
  if (type === 'Email') return 'bg-purple-100 text-[#8A79E2]';
  if (type === 'WhatsApp') return 'bg-green-100 text-green-500';
  if (type === 'Convention') return 'bg-blue-50 text-blue-500 border border-blue-100';
  if (type === 'Devis') return 'bg-purple-50 text-purple-500 border border-purple-100';
  return 'bg-gray-100 text-gray-500';
};

const getIcon = (type: string) => {
  if (type === 'Note') return 'fas fa-pen';
  if (type === 'Appel') return 'fas fa-phone-alt';
  if (type === 'Email') return 'fas fa-envelope';
  if (type === 'WhatsApp') return 'fab fa-whatsapp';
  if (type === 'Convention') return 'fas fa-file-signature';
  if (type === 'Devis') return 'fas fa-file-invoice-dollar';
  return 'fas fa-circle';
};
</script>

<template>
  <div class="bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 w-full flex flex-col">
    <h2 class="text-lg md:text-xl font-black text-[#423B71] mb-6 flex items-center gap-3">
      <div class="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
        <i class="fas fa-stream"></i>
      </div>
      Journal & Actions
    </h2>

    <div class="flex gap-3 sm:gap-4 mb-8 overflow-x-auto pb-3 pt-1 -mx-2 px-2 scrollbar-hide">
      <button v-for="type in ['Note', 'Appel', 'Email', 'WhatsApp']" :key="type"
        @click="activityType = type"
        :class="['flex flex-col items-center justify-center w-[75px] h-[75px] sm:w-[85px] sm:h-[85px] flex-shrink-0 rounded-[1.2rem] transition-all duration-300', 
        activityType === type ? 'bg-[#B2E9E1] text-[#423B71] shadow-md scale-105 border-transparent' : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-white hover:border-[#B2E9E1] hover:text-[#423B71] hover:shadow-sm']">
        <i :class="getIcon(type)" class="text-xl sm:text-2xl mb-1 sm:mb-2"></i>
        <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{{ type }}</span>
      </button>
    </div>

    <div :class="['flex gap-3 md:gap-4 w-full p-4 md:p-5 rounded-3xl border transition-colors duration-300 mb-8', 
      activityType === 'Note' ? 'bg-gray-50 border-gray-100' : 
      activityType === 'Appel' ? 'bg-blue-50/50 border-blue-100' : 
      activityType === 'Email' ? 'bg-purple-50/50 border-purple-100' : 
      activityType === 'WhatsApp' ? 'bg-green-50/50 border-green-100' : '']">
      
      <div class="hidden sm:flex w-12 h-12 bg-white shadow-sm rounded-full flex-shrink-0 items-center justify-center">
        <i :class="[getIcon(activityType), activityType === 'Note' ? 'text-[#423B71]' : activityType === 'Appel' ? 'text-[#007AFF]' : activityType === 'Email' ? 'text-[#8A79E2]' : 'text-[#25D366]']"></i>
      </div>

      <div class="flex-1">
        <textarea v-model="noteContent" 
          class="w-full bg-transparent border-none p-0 text-sm font-medium text-gray-700 focus:ring-0 outline-none resize-none min-h-[80px]" 
          :placeholder="`Saisir les détails de votre ${activityType.toLowerCase()}...`"></textarea>
        <div class="mt-3 flex justify-end border-t border-gray-200/60 pt-3">
          <button @click="handleSave" 
            class="w-full sm:w-auto px-6 py-2.5 bg-[#B2E9E1] text-[#423B71] text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#FF8B7D] hover:text-white transition-all shadow-sm active:scale-95">
            Enregistrer
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 border-t border-gray-100 pt-8">
      <div v-if="historiqueActivites.length === 0" class="text-center py-10">
        <i class="fas fa-history text-gray-200 text-5xl mb-4"></i>
        <p class="text-sm font-bold text-gray-400">Aucune activité récente sur ce dossier.</p>
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="act in historiqueActivites" :key="act._id" 
          class="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" :class="getIconClass(act.type)">
              <i :class="getIcon(act.type)"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">{{ act.type }}</span>
                <span class="text-[9px] font-bold text-gray-300">• {{ new Date(act.date).toLocaleDateString() }} {{ new Date(act.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
              <p v-if="act.content" class="text-sm font-medium text-[#423B71] leading-snug">{{ act.content }}</p>
              <p v-else class="text-sm font-black text-[#423B71] leading-snug">{{ act.title }}</p>
            </div>
          </div>

          <div v-if="act.type === 'Devis' || act.type === 'Convention'" class="flex items-center gap-2 self-start md:self-auto pl-14 md:pl-0">
            <button @click="emit('view-document', act)" 
              class="px-3 py-1.5 bg-gray-50 border border-gray-100 text-gray-500 hover:text-[#8A79E2] hover:border-[#8A79E2] text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors flex items-center gap-1">
              <i v-if="(act.type === 'Convention' && isGeneratingDoc) || (act.type === 'Devis' && isGeneratingDevis)" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-eye"></i> Voir
            </button>
            
            <button v-if="act.status === 'generated'" @click="emit('trigger-signature', act)" 
              class="px-3 py-1.5 bg-[#B2E9E1] text-[#423B71] hover:bg-[#FF8B7D] hover:text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-sm flex items-center gap-1">
              <i class="fas fa-signature"></i> Signature
            </button>
            
            <span v-else-if="act.status === 'pending_signature'" 
              class="px-3 py-1.5 bg-yellow-50 text-yellow-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-yellow-100 flex items-center gap-1">
              <i class="fas fa-hourglass-half"></i> En attente
            </span>

            <span v-else-if="act.status === 'signed'" 
              class="px-3 py-1.5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100 flex items-center gap-1">
              <i class="fas fa-check-circle"></i> Signé
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>