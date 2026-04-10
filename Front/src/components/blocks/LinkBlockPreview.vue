<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="text-center">
      <div class="inline-flex items-center p-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors">
        <svg class="w-4 h-4 text-[#62D6CA] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
        <span class="text-[#62D6CA] hover:text-[#4FC3B7] font-medium">
          {{ block.text || 'Lien' }}
        </span>
        <span v-if="block.openInNewTab" class="ml-1 text-gray-400 text-xs">↗</span>
      </div>

      <div class="mt-2 text-xs text-gray-500">
        {{ block.url || 'URL non définie' }}
      </div>
    </div>

    <div class="flex justify-center mt-4">
      <button
        @click="$emit('edit')"
        class="text-xs px-3 py-1 bg-[#62D6CA] text-white rounded hover:bg-[#4FC3B7]"
      >
        Modifier le lien
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps(['block'])
defineEmits(['edit'])
</script>
