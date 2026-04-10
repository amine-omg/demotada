<script setup lang="ts">
defineProps<{
  questions: any[];
  selectedQuestionId: string | null;
}>();
const emit = defineEmits(['select-question', 'add-question', 'delete-question']);
</script>


<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b">
      <h3 class="font-semibold text-lg">Questions</h3>
    </div>
    <div class="flex-1 overflow-y-auto">
      <div
        v-for="(question, index) in questions"
        :key="question._id"
        :class="['flex items-center justify-between p-4 border-b hover:bg-gray-50 cursor-pointer', { 'bg-[#DCD8F4] text-[#876EC8] font-semibold': question._id === selectedQuestionId }]"
      >
        <span @click="$emit('select-question', question._id)" class="flex-grow">Question {{ index + 1 }}</span>
        <button
          @click.stop="$emit('delete-question', question._id)"
          class="text-gray-400 hover:text-red-600 p-1 rounded-full flex-shrink-0"
          title="Supprimer la question"
        >
          <i class="fas fa-trash-alt fa-sm"></i>
        </button>
      </div>
    </div>
    <div class="p-4 border-t">
      <button @click="$emit('add-question')" class="btn-secondary w-full">
        + Ajouter une question
      </button>
    </div>
  </aside>
</template>