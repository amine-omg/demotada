<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  block: { title: string, url: string }
}>()

const emit = defineEmits<{
  (e: 'edit', block: any): void
}>()

const videoId = computed(() => {
  const url = props.block.url
  if (!url) return null
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
  const match = url.match(regex)
  return match ? match[1] : null
})

const embedUrl = computed(() => {
  return videoId.value ? `https://www.youtube.com/embed/${videoId.value}` : ''
})
</script>

<template>
  <div>
    <h3 v-if="block.title" class="text-lg font-semibold text-gray-800 mb-2">{{ block.title }}</h3>
    <div v-if="embedUrl" class="aspect-w-16 aspect-h-9">
      <iframe
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="w-full h-full rounded-lg"
      ></iframe>
    </div>
    <div v-else class="text-center p-4 bg-gray-100 rounded-lg">
      <p class="text-sm text-red-600">URL de la vidéo invalide ou non reconnue.</p>
    </div>

    <div class="text-center mt-4">
      <button @click="emit('edit', block)" class="btn-secondary text-sm">Modifier la vidéo</button>
    </div>
  </div>
</template>
