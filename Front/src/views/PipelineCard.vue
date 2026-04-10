<template>
  <div class="bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all group relative overflow-hidden">
    <div class="flex justify-between items-start mb-3">
      <div class="truncate pr-4 text-left">
        <h3 class="font-black text-[11px] uppercase truncate text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors">
          {{ dossier.installateur || 'Artisan CEE' }}
        </h3>
        <p class="text-[9px] font-bold text-gray-400 uppercase tracking-tighter truncate">{{ dossier.client || 'Client Mandat' }}</p>
      </div>
      <span class="shrink-0 bg-[#F5F2ED] text-[#D4AF37] border border-[#D4AF37]/30 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
        {{ dossier.ficheCee || 'BAR-101' }}
      </span>
    </div>

    <div class="flex justify-between items-end border-t border-gray-100 pt-3">
      <div class="text-left">
        <p class="text-[8px] font-black text-gray-400 uppercase">MWh</p>
        <p class="text-[11px] font-black">{{ dossier.simulation?.kwhCumac || 0 }}</p>
      </div>
      <div class="text-right">
        <p class="text-[8px] font-black text-gray-400 uppercase">Prime Est.</p>
        <p class="text-[11px] font-black text-[#D4AF37]">{{ dossier.simulation?.primeEstimee || 0 }} €</p>
      </div>
    </div>

    <div class="absolute inset-0 bg-white/95 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
      <button v-if="canMoveLeft" @click.stop="$emit('moveLeft')" class="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-90 transition-transform">
        <svg class="w-5 h-5 rotate-180 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
      
      <button @click.stop="$emit('click')" class="bg-black text-[#D4AF37] px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-lg">Détails</button>

      <button v-if="canMoveRight" @click.stop="$emit('moveRight')" class="w-10 h-10 bg-[#D4AF37] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-90 transition-transform">
        <svg class="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps(['dossier', 'canMoveLeft', 'canMoveRight']);
defineEmits(['moveLeft', 'moveRight', 'click']);
</script>