<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  filters: {
    search: string;
    type: string;
    sortBy: string;
  }
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: typeof props.filters): void;
}>();

const updateFilter = (key: 'search' | 'type' | 'sortBy', value: string) => {
  emit('update:filters', { ...props.filters, [key]: value });
};
</script>

<template>
  <div class="mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Filtrer par</label>
      <input
        type="text"
        placeholder="Filtrer par email, prénom, nom, tag ou lien UTM"
        class="input-field"
        :value="filters.search"
        @input="updateFilter('search', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
      <select
        class="input-field"
        :value="filters.type"
        @change="updateFilter('type', ($event.target as HTMLSelectElement).value)"
      >
        <option value="inscrits">Inscrits</option>
        <option value="actifs">Actifs</option>
        <option value="inactifs">Inactifs</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
      <select
        class="input-field"
        :value="filters.sortBy"
        @change="updateFilter('sortBy', ($event.target as HTMLSelectElement).value)"
      >
        <option value="date_inscription">Date d'inscription</option>
        <option value="nom">Nom</option>
        <option value="email">Email</option>
        <option value="derniere_activite">Dernière activité</option>
      </select>
    </div>
  </div>
</template>
