<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  showModal: boolean;
  documentName: string;
  recipientEmail: string;
}>();

const emit = defineEmits(['close', 'confirm-send']);

const email = ref('');
const message = ref('');
const isLoading = ref(false);

watch(() => props.showModal, (newVal) => {
  if (newVal) {
    email.value = props.recipientEmail;
    message.value = `Bonjour,\n\nVeuillez trouver ci-joint le document "${props.documentName}" pour signature.\n\nCordialement,`;
    isLoading.value = false;
  }
});

const handleSend = () => {
  if (!email.value) return;
  isLoading.value = true;
  
  emit('confirm-send', {
    email: email.value,
    message: message.value
  });
  
  isLoading.value = false;
};

const closeModal = () => emit('close');
</script>

<template>
  <Transition name="modal">
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40" @click.self="closeModal">
      <div class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-lg p-6 md:p-10 relative overflow-hidden" @click.stop>
        <button @click="closeModal" class="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 text-[#423B71] hover:bg-white transition-colors">
          <i class="fas fa-times"></i>
        </button>

        <div class="absolute -top-24 -left-24 w-48 h-48 bg-[#B2E9E1] rounded-full opacity-40 blur-3xl"></div>

        <div class="relative z-10">
          <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl text-[#8A79E2] shadow-sm mb-6">
            <i class="fas fa-paper-plane"></i>
          </div>

          <h3 class="text-2xl font-black text-[#423B71] mb-2 tracking-tighter leading-tight">Envoyer pour signature</h3>
          <p class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">{{ documentName }}</p>
          
          <form @submit.prevent="handleSend" class="space-y-4">
            <div>
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Destinataire</label>
              <input type="email" v-model="email" required class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-[#423B71] font-bold focus:border-[#B2E9E1]">
            </div>

            <div>
              <label class="block text-[10px] font-black text-[#423B71] uppercase tracking-widest mb-2 ml-1">Message d'accompagnement</label>
              <textarea v-model="message" rows="4" class="w-full px-5 py-4 bg-white border-2 border-transparent rounded-2xl shadow-inner outline-none text-sm text-gray-600 font-medium resize-none focus:border-[#B2E9E1]"></textarea>
            </div>

            <div class="flex flex-col sm:flex-row sm:justify-end items-center gap-4 pt-4">
              <button type="button" @click="closeModal" class="w-full sm:w-auto px-6 py-3 text-xs font-black uppercase tracking-widest text-[#423B71] hover:text-indigo-900 transition-all">
                Annuler
              </button>
              <button type="submit" :disabled="isLoading || !email" class="w-full sm:w-auto px-8 py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50">
                <i v-if="isLoading" class="fas fa-spinner fa-spin"></i>
                <i v-else class="fas fa-signature"></i>
                Envoyer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease-out; }
.modal-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.modal-leave-to { opacity: 0; transform: scale(0.95); }
</style>