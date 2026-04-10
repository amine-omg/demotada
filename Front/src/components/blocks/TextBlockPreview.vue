<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="prose max-w-none">
      <div
        v-if="block.formattedContent"
        class="text-gray-800"
        v-html="block.formattedContent"
      />
      <div v-else-if="block.content" class="text-gray-800 max-h-[400px] whitespace-pre-wrap">
        {{ block.content }}
      </div>
      <div v-else class="text-gray-500 italic">
        Contenu de texte vide
      </div>
    </div>

    <div class="flex justify-center mt-4">
      <button
        @click="$emit('edit')"
        class="text-xs px-3 py-1 bg-[#62D6CA] text-white rounded hover:bg-[#4FC3B7]"
      >
        Modifier le texte
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['edit'])
defineProps<{ block: any }>();
</script>
