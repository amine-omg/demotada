<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits(['confirm']);
const signaturePad = ref(null);
const signatureType = ref('draw');
const initials = ref('');

const clear = () => {
  if (signatureType.value === 'draw') {
    // @ts-ignore
    signaturePad.value?.clearSignature();
  } else {
    initials.value = '';
  }
};

const save = () => {
  if (signatureType.value === 'draw') {
    // @ts-ignore
    const { isEmpty, data } = signaturePad.value?.saveSignature();
    if (!isEmpty) {
      emit('confirm', data);
    } else {
      alert("Veuillez dessiner votre signature.");
    }
  } else {
    if (initials.value.trim()) {
      // Création d'un canvas invisible pour transformer le texte en image PNG
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fond transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configuration de la police (Dancing Script importée en bas)
        ctx.font = 'italic 70px "Dancing Script", cursive';
        ctx.fillStyle = '#000000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // On dessine le texte au centre du canvas
        ctx.fillText(initials.value, canvas.width / 2, canvas.height / 2);
        
        // On émet l'image en base64
        emit('confirm', canvas.toDataURL('image/png'));
      }
    } else {
      alert("Veuillez taper vos initiales.");
    }
  }
};
</script>

<template>
  <div class="w-full bg-white rounded-3xl p-6 border-2 border-dashed border-gray-200">
    <div class="flex gap-4 mb-6">
      <button 
        @click="signatureType = 'draw'" 
        :class="['px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all', signatureType === 'draw' ? 'bg-[#423B71] text-white' : 'bg-gray-100 text-gray-400']"
      >
        Dessiner
      </button>
      <button 
        @click="signatureType = 'text'" 
        :class="['px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all', signatureType === 'text' ? 'bg-[#423B71] text-white' : 'bg-gray-100 text-gray-400']"
      >
        Initiales
      </button>
    </div>

    <div v-if="signatureType === 'draw'" class="h-64 bg-gray-50 rounded-2xl relative overflow-hidden border border-gray-100">
      <VueSignaturePad 
        ref="signaturePad" 
        width="100%" 
        height="100%" 
        :options="{ penColor: '#000000', velocityFilterWeight: 0.7 }" 
      />
    </div>

    <div v-else class="h-64 bg-gray-50 rounded-2xl flex items-center justify-center p-8 border border-gray-100">
      <input 
        v-model="initials" 
        type="text" 
        maxlength="10"
        placeholder="Vos initiales..." 
        class="w-full bg-transparent border-b-2 border-[#423B71] text-center text-5xl font-serif outline-none py-4 text-[#423B71] placeholder-gray-300"
      >
    </div>

    <div class="flex justify-between items-center mt-6">
      <button 
        @click="clear" 
        class="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
      >
        Effacer
      </button>
      <button 
        @click="save" 
        class="px-8 py-3 bg-[#B2E9E1] text-[#423B71] rounded-xl font-black uppercase tracking-widest text-xs shadow-md hover:bg-[#FF8B7D] hover:text-white transition-all active:scale-95"
      >
        Valider la signature
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');

/* Empêche le défilement de la page sur mobile quand on dessine */
:deep(canvas) {
  touch-action: none !important; 
  cursor: crosshair;
  width: 100% !important;
  height: 100% !important;
}

/* Style spécifique pour l'input mode texte */
input {
  font-family: 'Dancing Script', cursive;
}
</style>