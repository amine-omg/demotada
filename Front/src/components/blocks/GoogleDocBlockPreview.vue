<template>
  <div>
    <h3 v-if="block.title" class="text-xl font-semibold mb-4">{{ block.title }}</h3>

    <div class="google-doc-container" v-html="block.src"></div>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  block: {
    title?: string;
    src: string;
  }
}>();
</script>

<style scoped>
.google-doc-container :deep(iframe) {
  width: 100% !important;
  height: 500px !important; 
  border: none;
}
</style>
