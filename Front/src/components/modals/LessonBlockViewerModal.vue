<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  lesson: any | null;
}>();

const emit = defineEmits(['close', 'on-complete']);

const pageIndex = ref(0);
const rotation = ref(0); // État de la rotation (0, 90, 180, 270)

const blocks = computed(() => props.lesson?.blocks || []);
const pageCount = computed(() => blocks.value.length);
const currentBlock = computed(() => blocks.value[pageIndex.value]);

const isLastPage = computed(() => pageIndex.value === pageCount.value - 1 && pageCount.value > 0);

// On réinitialise la rotation quand on change de page ou de leçon
watch(pageIndex, () => {
  rotation.value = 0;
});

watch(() => props.lesson, () => {
  pageIndex.value = 0;
  rotation.value = 0;
});

function rotateRight() {
  rotation.value = (rotation.value + 90) % 360;
}

function prevPage() {
  if (pageIndex.value > 0) pageIndex.value--;
}

function nextPage() {
  if (pageIndex.value < pageCount.value - 1) pageIndex.value++;
}

function completeLesson() {
  emit('on-complete');
}

const embedUrl = computed(() => {
  if (currentBlock.value?.type !== 'video' || !currentBlock.value?.src) return '';
  const url = currentBlock.value.src;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?rel=0&showinfo=0&modestbranding=1`;
  }
  return url;
});
</script>

<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 text-left">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-left">
      
      <div class="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 class="font-bold text-gray-700 truncate mr-4">{{ lesson?.title }}</h2>
        
        <div class="flex items-center gap-4">
          <button 
            v-if="currentBlock?.type === 'image' || currentBlock?.type === 'file'"
            @click="rotateRight"
            class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-600 hover:bg-gray-50 transition-all active:scale-95"
            title="Faire pivoter"
          >
            <i class="fas fa-sync-alt"></i>
            <span class="text-xs font-bold uppercase tracking-wider"></span>
          </button>

          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
        <div v-if="currentBlock" class="w-full mx-auto">
          
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 leading-tight">
            {{ currentBlock.title }}
          </h1>

          <div :style="{ transform: `rotate(${rotation}deg)` }" class="transition-transform duration-300 ease-in-out origin-center">
            
            <div v-if="currentBlock.type === 'text'" 
                 class="prose prose-lg max-w-none text-gray-800 leading-relaxed"
                 v-html="currentBlock.formattedContent || currentBlock.content">
            </div>

            <div v-else-if="currentBlock.type === 'image'" class="w-full flex justify-center">
              <img 
                :src="currentBlock.src" 
                :alt="currentBlock.title"
                class="w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>

           <div v-else-if="currentBlock.type === 'video'" class="w-full">
  <div class="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-black">
    <iframe 
      :src="embedUrl" 
      class="w-full h-full" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen
    ></iframe>
  </div>
  <p class="mt-4 text-gray-500 text-sm italic text-center">Visionnez la vidéo ci-dessus pour compléter cette étape.</p>
</div>

            <div v-else-if="currentBlock.type === 'file'" class="bg-gray-50 p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
              <i class="fas fa-file-pdf text-7xl text-red-500 mb-6"></i>
              <div class="block">
                  <a :href="currentBlock.src" target="_blank" class="text-2xl font-bold text-indigo-600 hover:underline transition-colors">
                      Ouvrir le document : {{ currentBlock.title || 'Support de cours' }}
                  </a>
                  <p class="text-gray-400 mt-2 italic text-sm">Cliquez pour consulter le fichier</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div class="flex justify-between items-center p-6 border-t bg-white">
        <button @click="prevPage" :disabled="pageIndex === 0" class="btn-nav bg-[#62D6CA] text-white hover:bg-[#FF9F64] border-none shadow-md">
          <i class="fas fa-arrow-left mr-2"></i> Précédent
        </button>
        
        <span class="text-gray-500 font-bold bg-gray-100 px-4 py-1 rounded-full text-sm">
            {{ pageIndex + 1 }} / {{ pageCount }}
        </span>
        
        <button v-if="!isLastPage" @click="nextPage" class="btn-nav bg-[#62D6CA] text-white hover:bg-[#FF9F64] border-none shadow-md">
          Suivant <i class="fas fa-arrow-right ml-2"></i>
        </button>
        
        <button v-else @click="completeLesson" class="px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all shadow-md">
          <i class="fas fa-check-circle mr-2"></i> Terminer la leçon
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-nav {
  @apply px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-gray-200 hover:bg-gray-50 text-gray-600;
}

.origin-center {
  transform-origin: center center;
}

iframe {
  display: block;
  width: 100% !important;
}
</style>