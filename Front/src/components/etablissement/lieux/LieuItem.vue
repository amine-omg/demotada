<script setup lang="ts">
import { computed } from 'vue';
import type { Lieu } from '../../../stores/lieuxStore';
import MapPreview from './MapPreview.vue';

const props = defineProps<{
  lieu: Lieu;
}>();

const emit = defineEmits(['edit', 'open-delete-modal', 'update-status']);

const isDistanciel = computed(() => props.lieu.isDefault);

const toggleStatus = () => {
  emit('update-status', props.lieu);
}
</script>

<template>
  
  <div 
    class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-colors duration-300"
    :style="lieu.statut === 'Inactif' ? { backgroundColor: '#f5f2f2' } : {}"
  >
    <div class="flex flex-col md:flex-row gap-6">
      <div class="flex-grow">
        <h3 class="text-2xl font-bold text-[#423B71]">{{ lieu.nom }}</h3>
        <p v-if="lieu.adresse?.formattedAddress" class="text-sm text-gray-500 mt-1">
          {{ lieu.adresse.formattedAddress }}
        </p>
        <br>
        <div class="mt-4 flex items-center gap-4">
          
          
          <div class="flex items-center">
            <label :for="'toggle-' + lieu._id" class="mr-2 text-sm font-medium text-gray-700">
              {{ lieu.statut }}
            </label>

            <button
              @click="$emit('update-status', lieu)"
              :class="[lieu.statut === 'Actif' ? 'bg-green-500' : 'bg-gray-300']"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              role="switch"
              :aria-checked="lieu.statut === 'Actif'"
            >
              <span
                :class="[lieu.statut === 'Actif' ? 'translate-x-5' : 'translate-x-0']"
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              ></span>
            </button>
&nbsp;&nbsp;&nbsp;

                    <button @click="$emit('edit')" class="btn-secondary">Modifier le lieu</button>
 &nbsp;&nbsp;&nbsp;
         <button @click="$emit('open-delete-modal', lieu)" class="text-gray-400 hover:text-red-600 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" class="w-6 h-6" viewBox="0 0 48 48">
        <path d="M39,16H9c-1.654,0-3-1.346-3-3V9c0-0.52,0.398-0.953,0.917-0.997l12-1L29,7c0.027,0,0.056,0.001,0.083,0.003l12,1 C41.602,8.047,42,8.48,42,9v4C42,14.654,40.654,16,39,16z"></path>
        <path d="M36,47H12c-1.654,0-3-1.346-3-3V14c0-0.552,0.447-1,1-1h28c0.553,0,1,0.448,1,1v30C39,45.654,37.654,47,36,47z"></path>
        <path fill="#fff" d="M36,44H12c-1.105,0-2-0.895-2-2V12h28v30C38,43.105,37.105,44,36,44z"></path>
        <path d="M36,45H12c-1.654,0-3-1.346-3-3V12c0-0.552,0.447-1,1-1h28c0.553,0,1,0.448,1,1v30C39,43.654,37.654,45,36,45z M11,13v29 c0,0.551,0.448,1,1,1h24c0.552,0,1-0.449,1-1V13H11z"></path>
        <path fill="#fff" d="M29,6H19L7,9v2c0,1.105,0.895,2,2,2h30c1.105,0,2-0.895,2-2V9L29,6z"></path>
        <path d="M39,14H9c-1.654,0-3-1.346-3-3V9c0-0.459,0.312-0.859,0.758-0.97l12-3C18.837,5.01,18.918,5,19,5h10 c0.082,0,0.163,0.01,0.242,0.03l12,3C41.688,8.141,42,8.541,42,9v2C42,12.654,40.654,14,39,14z M8,9.781V11c0,0.551,0.448,1,1,1h30 c0.552,0,1-0.449,1-1V9.781L28.877,7h-9.754L8,9.781z"></path>
        <path d="M30,6h-2V4c0-0.551-0.448-1-1-1h-6c-0.552,0-1,0.449-1,1v2h-2V4c0-1.654,1.346-3,3-3h6c1.654,0,3,1.346,3,3V6z"></path>
        <path d="M24,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C25,37.552,24.553,38,24,38z"></path>
        <path d="M31,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C32,37.552,31.553,38,31,38z"></path>
        <path d="M17,38c-0.553,0-1-0.448-1-1V19c0-0.552,0.447-1,1-1s1,0.448,1,1v18C18,37.552,17.553,38,17,38z"></path>
      </svg>
    </button>
          </div>
        </div>
      </div>

       <div class="w-full md:w-1/3 h-32 rounded-md">
        
        <div v-if="lieu.isDefault" class="w-full h-full">
          <img 
            src="/img/distanciel.png" 
            alt="Formation à distance" 
            class="w-full h-full object-cover rounded-md"
          >
        </div>

        <MapPreview 
          v-else-if="lieu.adresse?.lat && lieu.adresse?.lng"
          :lat="lieu.adresse.lat" 
          :lng="lieu.adresse.lng" 
        />
        
        <div v-else class="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
            <p class="text-gray-500 text-sm text-center px-2">Adresse non géolocalisée</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.btn-secondary {
  @apply bg-white text-[#443E73] font-semibold py-2 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors duration-200;
}

/* Styles pour le switch */
input:checked ~ .dot {
  transform: translateX(100%);
  background-color: #B2E9E1;
}
input:checked ~ .block {
    background-color: #443E73;
}
</style>
