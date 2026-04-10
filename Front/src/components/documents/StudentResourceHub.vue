<script setup lang="ts">
import { ref } from 'vue';

// Mock data pour l'exemple (à brancher sur ton store session)
const myResources = ref([
  { id: 1, title: 'Design Thinking Pro', files: 3, color: 'bg-blue-500' },
  { id: 2, title: 'Marketing Digital', files: 5, color: 'bg-purple-500' },
  { id: 3, title: 'Gestion de Projet', files: 2, color: 'bg-teal-500' }
]);
</script>

<template>
  <div class="min-h-screen bg-[#DCD8F4]/20 p-6 md:p-10">
    <div class="max-w-5xl mx-auto">
      
      <header class="text-center mb-12">
        <div class="w-20 h-20 bg-white rounded-[2rem] shadow-xl shadow-indigo-200 flex items-center justify-center mx-auto mb-6 animate-bounce">
          <i class="fas fa-rocket text-3xl text-[#423B71]"></i>
        </div>
        <h1 class="text-4xl font-black text-[#423B71] tracking-tighter">Ton Sac à dos</h1>
        <p class="text-gray-500 font-medium italic mt-2">Retrouve ici tout ce dont tu as besoin pour réussir !</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="space-y-6">
          <h2 class="text-[10px] font-black text-[#423B71] uppercase tracking-[0.3em] ml-4">Tes Supports de cours</h2>
          
          <div v-for="res in myResources" :key="res.id" class="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-transparent hover:border-[#B2E9E1] transition-all group cursor-pointer">
            <div class="flex items-center gap-5">
              <div :class="[res.color, 'w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-inner']">
                <i class="fas fa-folder-open text-xl"></i>
              </div>
              <div>
                <h3 class="font-black text-[#423B71] text-lg leading-tight">{{ res.title }}</h3>
                <p class="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{{ res.files }} fichiers disponibles</p>
              </div>
              <i class="fas fa-chevron-right ml-auto text-gray-200 group-hover:text-[#B2E9E1] transition-colors"></i>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <h2 class="text-[10px] font-black text-[#423B71] uppercase tracking-[0.3em] ml-4">Zone de rendu</h2>
          
          <div class="bg-[#B2E9E1] p-10 rounded-[3rem] text-center shadow-xl shadow-teal-100 border-4 border-white relative overflow-hidden group">
            <div class="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
            
            <div class="relative z-10">
              <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <i class="fas fa-cloud-upload-alt text-2xl text-[#423B71]"></i>
              </div>
              <h3 class="text-xl font-black text-[#423B71] mb-2 uppercase tracking-tighter">Déposer un devoir</h3>
              <p class="text-[#423B71]/70 text-sm font-medium mb-6">PDF, Images ou ZIP. <br>Ton formateur sera notifié.</p>
              <button class="bg-[#423B71] text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#FF8B7D] transition-all active:scale-95">
                Choisir un fichier
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>