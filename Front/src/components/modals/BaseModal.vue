<script setup lang="ts">
import { watchEffect } from 'vue'; 

const props = defineProps<{
  show: boolean; 
  maxWidth?: string; 
  closeOnClickOutside?: boolean; 
}>();

const emit = defineEmits<{
  (e: 'close'): void; 
}>();

watchEffect(() => {
  if (props.show) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

const handleClickOutside = () => {
  if (props.closeOnClickOutside !== false) { 
    emit('close');
  }
};

const handleModalContentClick = (event: Event) => {
  event.stopPropagation(); 
};
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50 p-4"
      @click="handleClickOutside"
    >
      <div
        class="bg-white rounded-lg shadow-xl w-full max-h-[90vh] overflow-y-auto"
        :class="{
          'max-w-sm': !maxWidth, 
          'max-w-md': maxWidth === 'md',
          'max-w-lg': maxWidth === 'lg',
          'max-w-xl': maxWidth === 'xl',
          'max-w-2xl': maxWidth === '2xl',
          'max-w-4xl': maxWidth === '4xl',
          'max-w-full': maxWidth === 'full' 
        }"
        @click="handleModalContentClick"
      >
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-semibold text-[#F04636]">
            <slot name="header">Titre du Modal</slot>
          </h3>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-6">
          <slot>Contenu par défaut du modal.</slot>
        </div>

        <div v-if="$slots.footer" class="px-6 py-4 border-t flex justify-end space-x-3">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Transition>

  <style>
  .modal-fade-enter-active,
  .modal-fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .modal-fade-enter-from,
  .modal-fade-leave-to {
    opacity: 0;
  }

  .modal-fade-enter-active .modal-content,
  .modal-fade-leave-active .modal-content {
    transition: transform 0.3s ease;
  }
  .modal-fade-enter-from .modal-content {
    transform: scale(0.9);
  }
  .modal-fade-leave-to .modal-content {
    transform: scale(0.9);
  }
  </style>
</template>
