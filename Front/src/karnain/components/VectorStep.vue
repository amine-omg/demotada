<template>
  <div class="h-full flex flex-col lg:flex-row gap-8 animate-in">
    
    <div class="lg:w-1/2 flex flex-col">
      <div class="flex items-center justify-between mb-4 px-2">
        <h4 class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <span class="w-2 h-2 bg-red-400 rounded-full"></span> 
          Cartographie des Calques
        </h4>
        <span class="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest">
          {{ vectorCount }} Objets détectés
        </span>
      </div>
      
      <div class="flex-grow bg-[#F8F9FD] rounded-[2.5rem] border border-gray-100 shadow-inner relative flex items-center justify-center overflow-hidden min-h-[450px]">
        <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: linear-gradient(#1A1633 1px, transparent 1px), linear-gradient(90deg, #1A1633 1px, transparent 1px); background-size: 30px 30px;"></div>

        <div class="relative group scale-90 lg:scale-100 transition-transform">
          <div class="relative inline-block shadow-2xl rounded-sm overflow-hidden">
            <img v-if="templateBackgroundUrl" 
                 :src="`http://localhost:3000${templateBackgroundUrl}`" 
                 class="max-h-[60vh] object-contain block grayscale opacity-40 mix-blend-multiply" />
            
            <div class="absolute inset-0 pointer-events-none">
              <div v-for="vector in vectors" :key="vector._id"
                   class="absolute border-2 border-dashed border-red-500 bg-red-500/10 transition-all duration-300"
                   :class="{ 'bg-red-500/40 border-solid z-10 scale-105 shadow-lg': activeBox === vector._id }"
                   :style="{ 
                     left: vector.boundingBox.x + '%', 
                     top: vector.boundingBox.y + '%', 
                     width: vector.boundingBox.width + '%', 
                     height: vector.boundingBox.height + '%' 
                   }">
                <span v-if="activeBox === vector._id" class="absolute -top-5 left-0 bg-red-500 text-white text-[7px] font-black px-1 uppercase tracking-tighter">
                   {{ vector.type }} : {{ vector.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:w-1/2 flex flex-col">
      <div class="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm h-full flex flex-col">
        <div class="p-6 bg-gray-50/50 border-b border-gray-50">
          <span class="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ressources Extraites</span>
          <h4 class="text-xs font-black text-[#443E73] uppercase tracking-[0.1em]">Assets Vectoriels & Images</h4>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          <div v-for="(vector, index) in vectors" :key="vector._id" 
               @mouseenter="activeBox = vector._id"
               @mouseleave="activeBox = null"
               class="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 bg-white hover:border-red-200 hover:shadow-md transition-all cursor-pointer group">
            
            <div class="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <img v-if="vector.originalImageUrl" :src="`http://localhost:3000${vector.originalImageUrl}`" class="w-full h-full object-contain p-1" />
              <span v-else class="text-gray-300">📦</span>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-bold text-red-400 font-mono">#{{ index + 1 }}</span>
                <h5 class="text-[10px] font-black text-[#443E73] uppercase tracking-widest truncate">{{ vector.name || 'Unnamed Asset' }}</h5>
              </div>
              <p class="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-tighter">
                Coords: {{ Math.round(vector.boundingBox.x) }}x, {{ Math.round(vector.boundingBox.y) }}y | Type: {{ vector.type }}
              </p>
            </div>

            <div class="opacity-0 group-hover:opacity-100 transition-opacity">
               <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke-width="2"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '/services/api'; 

const props = defineProps({
  templateId: { type: String, required: true },
  status: { type: String, default: 'none' }
});

const vectors = ref([]);
const templateBackgroundUrl = ref('');
const vectorCount = ref(0);
const activeBox = ref(null);
const localStatus = ref(props.status);

const loadData = async () => {
  try {
    // 🔗 On récupère les vecteurs existants
    const response = await api.get(`/api/vectors/${props.templateId}`);
    vectors.value = response.data || [];
    vectorCount.value = vectors.value.length;
    templateBackgroundUrl.value = `/uploads/backgrounds/${props.templateId}_p1.png`;
    localStatus.value = 'complete';
  } catch (error) {
    console.error("Erreur chargement vecteurs:", error);
  }
};

onMounted(loadData);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #fee2e2; border-radius: 10px; }
.animate-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>