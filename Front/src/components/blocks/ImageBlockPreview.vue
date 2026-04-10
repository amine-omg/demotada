<script setup lang="ts">
const props = defineProps<{
  block: { title: string, url: string }
}>()

const emit = defineEmits<{
  (e: 'edit', block: any): void
}>()
</script>

<template>
  <div>
    <h3 v-if="block.title" class="text-lg font-semibold text-gray-800 mb-2">{{ block.title }}</h3>

    <div class="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg border overflow-hidden">
      <img
        :src="block.url"
        :alt="block.title || 'Image du bloc'"
        class="w-full h-full object-cover"
      >
    </div>

    <div class="text-center mt-4">
      <button @click="emit('edit', block)" class="btn-secondary text-sm">Modifier l'image</button>
    </div>
  </div>
</template>
