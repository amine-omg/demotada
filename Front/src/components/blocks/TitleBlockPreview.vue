<template>
  <div class="my-6">
    <component :is="block.level" :class="titleSizeClass" class="text-gray-800 break-words">
      {{ block.text }}
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  block: {
    text: string;
    level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  }
}>();

const titleSizeClass = computed(() => {
  switch (props.block.level) {
    case 'h1': return 'text-4xl font-bold';
    case 'h2': return 'text-3xl font-bold';
    case 'h3': return 'text-2xl font-semibold';
    case 'h4': return 'text-xl font-semibold';
    case 'h5': return 'text-lg font-medium';
    default: return 'text-3xl font-bold';
  }
});
</script>
