<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" @click="$emit('cancel')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4" @click.stop>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-[#62D6CA] rounded flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </div>
            <span class="text-lg font-medium text-gray-800">Ajouter une image</span>
          </div>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Collez le lien de votre image</label>
              <input
                v-model="imageUrl"
                type="url"
                class="input-field w-full"
                placeholder="https://exemple.com/image.jpg"
              >
            </div>

            <div class="mt-4">
               <label class="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
               <div class="w-full h-48 bg-gray-100 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden">
                 <div v-if="!imageUrl" class="text-center text-gray-500">
                   <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                   <p class="text-sm">L'aperçu apparaîtra ici</p>
                 </div>
                 <img
                   v-else
                   :src="imageUrl"
                   alt="Aperçu de l'image"
                   class="w-full h-full object-contain"
                   @error="imageUrl = ''"
                 >
               </div>
            </div>
        </div>

        <div class="flex justify-end space-x-3 mt-6">
          <button @click="$emit('cancel')" class="btn-secondary">Annuler</button>
          <button @click="saveImage" class="btn-primary">Ajouter</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const emit = defineEmits(['save', 'cancel'])
const props = defineProps<{
  block: { title: string, url: string } | null
}>()

const imageUrl = ref('')

onMounted(() => {
  if (props.block) {
    imageUrl.value = props.block.url || ''
  }
})

const saveImage = () => {
  if (!imageUrl.value) {
    alert('Veuillez coller une URL d\'image.')
    return
  }

  const imageData = {
    title: 'Image', 
    url: imageUrl.value,
  }

  emit('save', imageData)
}
</script>
