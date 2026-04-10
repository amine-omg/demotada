<script setup lang="ts">
import { useRouter } from 'vue-router';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
});

const router = useRouter();

const navigate = () => {
  router.push(props.to);
};
</script>

<template>
  <div
    @click="navigate"
    class="group relative flex h-64 max-w-xl cursor-pointer overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl"
  >
    <div class="relative w-2/5">
      <img
        :src="imageUrl"
        alt="Image de la fonctionnalité"
        class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div
        class="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-white/0"
      ></div>
    </div>

    <div class="flex w-3/5 flex-col justify-center p-6">
      <h3 class="text-xl font-bold text-[#423B71]">
        {{ title }}
      </h3>
      <p class="mt-2 text-sm text-gray-600">
        {{ description }}
      </p>
      <div
        class="absolute bottom-6 right-6 text-gray-400 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:right-5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-8 w-8"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m12 16 4-4-4-4" />
          <path d="M8 12h8" />
        </svg>
      </div>
    </div>
  </div>
</template>
