<script setup lang="ts">
const props = defineProps<{
  fileInput: HTMLInputElement | null; 
}>();

const emit = defineEmits<{
  (e: 'export-csv'): void;
  (e: 'invite-apprenant'): void;
  (e: 'add-apprenant'): void;
  (e: 'trigger-file-input'): void; 
  (e: 'import-csv', event: Event): void; 
}>();

const handleImportCsvFile = (event: Event) => {
  emit('import-csv', event);
};
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div class="text-sm text-gray-600">
      <slot name="results" /> </div>
    <div class="flex space-x-3">
      <button @click="emit('export-csv')" class="btn-primary flex items-center text-sm px-4 py-2">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        Export CSV
      </button>
      <button @click="emit('invite-apprenant')" class="btn-primary flex items-center text-sm px-4 py-2">
        <svg class="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
        </svg>
        Inviter un apprenant
      </button>
      <button @click="emit('add-apprenant')" class="btn-primary flex items-center text-sm px-4 py-2">
        <svg class="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2 5a4 4 0 01-1.428-7.75 5 5 0 111.428 7.75z"/>
        </svg>
        Ajouter un apprenant
      </button>
      <button @click="emit('trigger-file-input')" class="btn-primary flex items-center text-sm px-4 py-2">
        <svg class="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
        </svg>
        Import CSV
      </button>
      <input
        :ref="fileInput"
        type="file"
        accept=".csv"
        @change="handleImportCsvFile"
        class="hidden"
      >
    </div>
  </div>
</template>
