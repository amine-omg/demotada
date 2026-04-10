<template>
  <div class="flex flex-col items-center group/step">
    <span class="text-[9px] font-black text-gray-400 uppercase mb-3 tracking-[0.15em] group-hover/step:text-[#443E73] transition-colors select-none">
      {{ label }}
    </span>
    
    <button 
      type="button"
      @click.stop="handleAction"
      :disabled="isProcessing" 
      class="relative flex items-center justify-center p-4 -m-4 transition-all duration-300 z-30"
      :class="[
        isProcessing ? 'cursor-wait' : 'cursor-pointer hover:scale-125 active:scale-90',
      ]"
    >
      <div v-if="isProcessing" 
           class="absolute w-8 h-8 bg-amber-400/30 rounded-full animate-ping"></div>
      
      <div 
        class="w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all duration-500 relative z-10"
        :class="statusClasses"
      ></div>

      <div v-if="isCompleted" 
           class="absolute inset-0 bg-emerald-400/10 blur-xl rounded-full scale-150 pointer-events-none"></div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  status: {
    type: String,
    default: 'none' // none, processing, complete, failed
  },
  templateId: String
});

const emit = defineEmits(['run-step']);

// Sécurité : on vérifie 'complete' (sans 'd') car c'est ce que tu reçois souvent de l'API
const isCompleted = computed(() => props.status === 'complete' || props.status === 'completed');
const isProcessing = computed(() => props.status === 'processing');

const statusClasses = computed(() => {
  switch (props.status) {
    case 'complete':
    case 'completed': 
      return 'bg-[#B2E9E1] shadow-[0_0_12px_rgba(178,233,225,0.8)]'; 
    case 'processing': 
      return 'bg-amber-400';
    case 'failed': 
      return 'bg-[#FF8B7D]'; 
    default: 
      return 'bg-gray-200 group-hover/step:bg-gray-300'; 
  }
});

const handleAction = (event) => {
  if (!isProcessing.value) {
    console.log(`[Step] Clicked on: ${props.label}`); // Pour ton débug
    emit('run-step');
  }
};
</script>