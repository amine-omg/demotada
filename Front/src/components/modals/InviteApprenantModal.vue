<script setup lang="ts">

import { ref, computed, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  email: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'send-invitation', email: string): void;
  (e: 'update:email', value: string): void;
}>();

const inviteEmail = ref(props.email); 

watch(() => props.email, (newEmail) => {
  inviteEmail.value = newEmail;
});

const sendInvitation = () => {
  emit('send-invitation', inviteEmail.value);
};
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50"
    @click="emit('close')"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
      @click.stop
    >
      <div class="p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-[#F04636]">Inviter un apprenant</h3>
          <button
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="sendInvitation">
          <div class="mb-4">
            <label class="label">Adresse email</label>
            <input
              v-model="inviteEmail"
              type="email"
              class="input-field"
              placeholder="exemple@email.com"
              required
            >
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="emit('close')"
              class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              class="btn-primary"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
