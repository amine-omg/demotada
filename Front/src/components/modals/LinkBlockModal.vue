<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-30 flex items-center justify-center z-50" @click="$emit('cancel')">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-[#62D6CA] rounded flex items-center justify-center mr-3">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
            </div>
            <span class="text-lg font-medium text-[#62D6CA]">Ajouter un lien</span>
          </div>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="border-2 border-dashed border-[#62D6CA] rounded-lg p-6 mb-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Texte du lien</label>
              <input
                v-model="linkText"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA]"
                placeholder="Texte à afficher"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">URL de destination</label>
              <input
                v-model="linkUrl"
                type="url"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA]"
                placeholder="https://example.com"
              >
            </div>

            <div class="flex items-center">
              <input
                v-model="openInNewTab"
                type="checkbox"
                class="w-4 h-4 text-[#62D6CA] bg-gray-100 border-gray-300 rounded focus:ring-[#62D6CA] focus:ring-2"
              >
              <label class="ml-2 text-sm text-gray-700">Ouvrir dans un nouvel onglet</label>
            </div>
          </div>

          <div v-if="linkText && linkUrl" class="mt-6 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">Aperçu :</p>
            <a
              :href="linkUrl"
              :target="openInNewTab ? '_blank' : '_self'"
              class="text-[#62D6CA] hover:text-[#4FC3B7] underline"
              @click.prevent
            >
              {{ linkText }}
            </a>
            <span v-if="openInNewTab" class="ml-1 text-gray-400 text-xs">↗</span>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            @click="saveLink"
            :disabled="!linkText || !linkUrl"
            class="px-4 py-2 bg-[#62D6CA] text-white rounded hover:bg-[#4FC3B7] disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Ajouter
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['save', 'cancel'])
const props = defineProps(['block'])

const linkText = ref(props.block?.text || '')
const linkUrl = ref(props.block?.url || '')
const openInNewTab = ref(props.block?.openInNewTab || true)

const saveLink = () => {
  if (!linkText.value || !linkUrl.value) {
    alert('Veuillez remplir tous les champs')
    return
  }

  const linkData = {
    title: linkText.value,
    text: linkText.value,
    url: linkUrl.value,
    openInNewTab: openInNewTab.value
  }

  emit('save', linkData)
}
</script>
