<script setup lang="ts">
import { ref, watch } from 'vue';
import type { PropType } from 'vue';

interface DropdownItem { _id: string; name: string; }
interface FormationItem { _id: string; title: string; }

const props = defineProps({
  filters: {
    type: Object as PropType<any>,
    required: true
  },
  formations: {
    type: Array as PropType<FormationItem[]>,
    default: () => []
  },
  formateurs: {
    type: Array as PropType<any[]>,
    default: () => []
  },
  categories: {
    type: Array as PropType<DropdownItem[]>,
    default: () => []
  },
});

const emit = defineEmits(['update:filters', 'reset']);

const localFilters = ref({ ...props.filters });

// CRUCIAL: Maintient les filtres locaux synchronisés si le parent les modifie (ex: bouton Réinitialiser)
watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal };
}, { deep: true });

const applyFilters = () => {
  // On passe une copie propre de l'objet pour forcer la réactivité Vue 3
  emit('update:filters', { ...localFilters.value });
};

const resetFilters = () => {
  localFilters.value = {
    searchLieu: '',
    formationId: null,
    formateurId: null,
    categoryId: null,
  };
  emit('reset');
};
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 items-end w-full">
    
    <div class="w-full">
      <label class="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        Recherche
      </label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-indigo-500">
          <i class="fas fa-search text-gray-400 group-focus-within:text-indigo-500"></i>
        </div>
        <input
          type="text"
          v-model="localFilters.searchLieu"
          @input="applyFilters"
          placeholder="Lieu, titre..."
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
        />
      </div>
    </div>

    <div class="w-full">
      <label class="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        Formation
      </label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <i class="fas fa-graduation-cap text-gray-400 group-focus-within:text-indigo-500"></i>
        </div>
        <select 
          v-model="localFilters.formationId" 
          @change="applyFilters" 
          class="w-full pl-10 pr-8 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none cursor-pointer"
        >
          <option :value="null">Toutes les formations</option>
          <option v-for="formation in formations" :key="formation._id" :value="formation._id">
            {{ formation.title }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <i class="fas fa-chevron-down text-gray-400 text-[10px]"></i>
        </div>
      </div>
    </div>

    <div class="w-full">
      <label class="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        Formateur
      </label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <i class="fas fa-chalkboard-teacher text-gray-400 group-focus-within:text-indigo-500"></i>
        </div>
        <select 
          v-model="localFilters.formateurId" 
          @change="applyFilters" 
          class="w-full pl-10 pr-8 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none cursor-pointer"
        >
          <option :value="null">Tous les formateurs</option>
          <option v-for="formateur in formateurs" :key="formateur._id" :value="formateur._id">
            {{ formateur.prenom }} {{ formateur.nom }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <i class="fas fa-chevron-down text-gray-400 text-[10px]"></i>
        </div>
      </div>
    </div>

    <div class="w-full">
      <label class="block text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">
        Catégorie
      </label>
      <div class="relative group">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <i class="fas fa-tags text-gray-400 group-focus-within:text-indigo-500"></i>
        </div>
        <select 
          v-model="localFilters.categoryId" 
          @change="applyFilters" 
          class="w-full pl-10 pr-8 py-2.5 bg-gray-50/50 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none cursor-pointer"
        >
          <option :value="null">Toutes les catégories</option>
          <option v-for="category in categories" :key="category._id" :value="category._id">
            {{ category.name }}
          </option>
        </select>
        <div class="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
          <i class="fas fa-chevron-down text-gray-400 text-[10px]"></i>
        </div>
      </div>
    </div>

    <div class="w-full">
      <button 
        @click="resetFilters" 
        class="w-full h-[42px] bg-white hover:bg-red-50 text-gray-600 hover:text-red-500 font-bold rounded-xl transition-colors duration-200 text-sm flex items-center justify-center gap-2 border border-gray-200 hover:border-red-200 shadow-sm"
      >
        <i class="fas fa-undo-alt"></i> Effacer
      </button>
    </div>

  </div>
</template>

<style scoped>
/* Nettoyage du style natif des selects sur Safari/iOS */
select {
  -webkit-appearance: none;
  -moz-appearance: none;
}
</style>