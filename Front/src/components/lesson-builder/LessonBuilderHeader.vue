<template>
  <header class="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between z-10">
    <router-link :to="`/formations/${formationId}`" class="flex items-center text-gray-700 hover:text-gray-900">
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
      Retour
    </router-link>
    <div class="flex items-center space-x-3">
      <button @click="$emit('save')" class="btn-primary">Sauvegarder</button>
      <button @click="$emit('close')" class="p-2 text-gray-500 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ formationId: string | string[] }>();
defineEmits(['save', 'close']);
</script>
