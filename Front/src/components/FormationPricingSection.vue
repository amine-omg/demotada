<script setup lang="ts">
const props = defineProps<{
  prix: string
  prixPromotionnel: string
  tva: string
}>()

const emit = defineEmits<{
  (e: 'update:prix', value: string): void
  (e: 'update:prixPromotionnel', value: string): void
  (e: 'update:tva', value: string): void
  (e: 'save-prix'): void
}>()

const updatePrix = (event: Event) => {
  emit('update:prix', (event.target as HTMLInputElement).value)
}
const updatePrixPromotionnel = (event: Event) => {
  emit('update:prixPromotionnel', (event.target as HTMLInputElement).value)
}
const updateTva = (event: Event) => {
  emit('update:tva', (event.target as HTMLInputElement).value)
}

const savePrix = () => {
  emit('save-prix')
}
</script>

<template>
  <div class="max-w-4xl">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-1 bg-gray-100 rounded-lg p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tarif de votre formation</h3>

        <div class="mb-4">
          <p class="text-sm text-gray-700 mb-2">
            Détaillez tous les aspects tarifaires de votre formation comme le prix (en €) ou encore la TVA.
          </p>
        </div>

        <div class="mb-4">
          <p class="text-sm text-gray-700">
            Vous avez la possibilité de définir un prix promotionnel. <span class="font-medium">Mais attention,</span> dans ce cas, <span class="font-medium">les codes promo ne s'appliqueront pas lors de l'achat de la formation.</span>
          </p>
        </div>

        <div class="mt-8">
          <h4 class="text-lg font-semibold text-gray-900 mb-4">Ajoutez des facilités de paiements</h4>
          <p class="text-sm text-gray-700 mb-2">Votre formation a un prix élevé ?</p>
          <p class="text-sm text-gray-700">Proposez à vos clients de la <span class="font-medium">payer en plusieurs fois.</span></p>
        </div>
      </div>

      <div class="lg:col-span-2 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prix (TTC)</label>
            <div class="relative">
              <input
                :value="prix"
                @input="updatePrix"
                type="number"
                step="0.01"
                class="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:border-transparent"
                placeholder="0"
              >
              <span class="absolute right-3 top-3 text-gray-400">€</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Prix promotionnel (TTC)</label>
            <div class="relative">
              <input
                :value="prixPromotionnel"
                @input="updatePrixPromotionnel"
                type="number"
                step="0.01"
                class="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:border-transparent"
                placeholder="0"
              >
              <span class="absolute right-3 top-3 text-gray-400">€</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">% de TVA (inclus dans le prix)</label>
          <input
            :value="tva"
            @input="updateTva"
            type="text"
            class="w-full px-4 py-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:border-transparent"
            placeholder="Par défaut : 20%"
          >
        </div>

        <div class="flex justify-end">
          <button
            @click="savePrix"
            class="px-6 py-3 bg-[#62D6CA] text-white rounded-md hover:bg-[#4FC3B7] focus:outline-none focus:ring-2 focus:ring-[#62D6CA] focus:ring-offset-2 font-medium"
          >
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
