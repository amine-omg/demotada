<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  show: boolean;
  support: any;
}>();

const emit = defineEmits(['close']);

const fileUrl = computed(() => props.support?.resourceUrl || props.support?.pdfUrl || '');
const fileExt = computed(() => props.support?.title?.split('.').pop()?.toLowerCase() || '');

const isPDF = computed(() => fileExt.value === 'pdf');
const isImage = computed(() => ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(fileExt.value));

const getFileIcon = (title: string) => {
  if (['doc', 'docx'].includes(fileExt.value)) return { icon: 'fa-file-word', color: 'text-blue-500' };
  if (['xls', 'xlsx'].includes(fileExt.value)) return { icon: 'fa-file-excel', color: 'text-green-600' };
  return { icon: 'fa-file-alt', color: 'text-gray-400' };
};

const handleDownload = () => {
  if (fileUrl.value) window.open(fileUrl.value, '_blank');
};
</script>

<template>
  <Transition name="modal">
    <div v-if="show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-gray-900/40" @click.self="emit('close')">
      <div class="bg-[#DCD8F4] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] w-full max-w-2xl p-8 relative overflow-hidden" @click.stop>
        
        <button @click="emit('close')" class="absolute top-6 right-6 w-10 h-10 z-20 flex items-center justify-center rounded-full bg-white/50 text-[#423B71] hover:bg-white transition-colors">
          <i class="fas fa-times"></i>
        </button>

        <div class="relative z-10 flex flex-col items-center">
          <div class="w-full bg-white rounded-2xl shadow-xl mb-6 overflow-hidden border border-white flex items-center justify-center min-h-[300px] max-h-[50vh]">
            
            <iframe 
              v-if="isPDF && fileUrl" 
              :src="`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`" 
              class="w-full h-[50vh] border-none"
            ></iframe>

            <img 
              v-else-if="isImage && fileUrl" 
              :src="fileUrl" 
              class="max-w-full max-h-[50vh] object-contain"
            />

            <div v-else class="flex flex-col items-center p-12">
              <i :class="['fas text-7xl mb-4', getFileIcon(support?.title).icon, getFileIcon(support?.title).color]"></i>
              <p class="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Aperçu indisponible</p>
            </div>
          </div>

          <div class="text-center w-full px-4">
            <h3 class="text-2xl font-black text-[#423B71] mb-1 tracking-tight truncate">{{ support?.title }}</h3>
            <p class="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-6">Type: {{ support?.resourceType || 'Document' }}</p>

            <div class="flex flex-col sm:flex-row gap-3 w-full">
              <button 
                @click="handleDownload"
                class="flex-1 py-4 bg-[#B2E9E1] text-[#423B71] rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <i class="fas fa-external-link-alt"></i> Ouvrir / Télécharger
              </button>
              
              <button 
                @click="emit('close')"
                class="sm:w-32 py-4 bg-white/50 text-[#423B71] rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>

        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-[#B2E9E1] rounded-full opacity-20 blur-3xl pointer-events-none"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease-out; }
.modal-enter-from { opacity: 0; transform: scale(0.9) translateY(20px); }
.modal-leave-to { opacity: 0; transform: scale(0.95); }

iframe::-webkit-scrollbar {
  display: none;
}
</style>