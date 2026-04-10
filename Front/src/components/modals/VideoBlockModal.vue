<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const props = defineProps<{
  block: { title: string, url: string } | null
}>()

const emit = defineEmits<{
  (e: 'save', payload: { title: string, url: string }): void
  (e: 'cancel'): void
}>()

const title = ref('Vidéo')
const videoUrl = ref('')

onMounted(() => {
  if (props.block) {
    title.value = props.block.title || 'Vidéo'
    videoUrl.value = props.block.url || ''
  }
})

const videoId = computed(() => {
  const url = videoUrl.value
  if (!url) return null
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
})

const thumbnailUrl = computed(() => {
  return videoId.value ? `https://img.youtube.com/vi/${videoId.value}/hqdefault.jpg` : ''
})

const save = () => {
  if (!videoId.value) {
    alert("Veuillez insérer une URL YouTube valide.")
    return
  }
  emit('save', { title: title.value, url: videoUrl.value })
}
</script>

<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50" @click.self="emit('cancel')">
    <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Éditeur de bloc Vidéo</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Titre du bloc (optionnel)</label>
          <input v-model="title" type="text" class="input-field" placeholder="Ex: Tutoriel d'introduction">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL de la vidéo YouTube</label>
          <input v-model="videoUrl" type="url" class="input-field w-full" placeholder="https://www.youtube.com/watch?v=...">
        </div>
        <div v-if="thumbnailUrl" class="mt-4">
           <label class="block text-sm font-medium text-gray-700 mb-2">Aperçu</label>
           <img :src="thumbnailUrl" alt="Aperçu de la vidéo" class="w-full rounded-lg border">
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button @click="emit('cancel')" class="btn-secondary">Annuler</button>
        <button @click="save" class="btn-primary">Enregistrer la vidéo</button>
      </div>
    </div>
  </div>
</template>
