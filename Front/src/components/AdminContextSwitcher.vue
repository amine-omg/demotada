<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEtablissementsStore, type EtablissementSimple } from '../stores/etablissementsStore';
import { useUserStore } from '../stores/user';
import { useRoute, useRouter } from 'vue-router'; 

const etablissementsStore = useEtablissementsStore();
const userStore = useUserStore();

const router = useRouter(); 
const route = useRoute();  

const isPanelOpen = ref(false);
const searchQuery = ref('');

onMounted(() => {
  if (userStore.userRole === 'admin') {
    etablissementsStore.fetchAdminSchoolList();
  }
});

const currentContext = computed(() => userStore.getAdminContext);
const allSchools = computed(() => etablissementsStore.adminSchoolList);

const filteredSchools = computed(() => {
  if (!searchQuery.value) {
    return allSchools.value;
  }
  return allSchools.value.filter(school =>
    school.nom.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});


const selectSchool = (school: EtablissementSimple) => {
  userStore.setAdminContext(school);
  isPanelOpen.value = false;
  router.push({ path: route.fullPath, force: true }).catch(()=>{});
};

const clearContext = () => {
  userStore.setAdminContext(null);
  isPanelOpen.value = false;
  window.location.reload();
};
</script>

<template>
  <div class="relative">
    <button @click="isPanelOpen = !isPanelOpen" class="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 border border-gray-200">
      <span class="text-sm font-semibold text-gray-700">
        {{ currentContext ? currentContext.nom : "Choisir un contexte" }}
      </span>
      <svg class="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>

    <div v-if="isPanelOpen" class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="Rechercher un établissement..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
      />
      <ul class="max-h-60 overflow-y-auto space-y-1">
        <li v-if="currentContext" @click="clearContext" class="px-3 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 cursor-pointer font-semibold">
          Aucun contexte
        </li>
        <li v-for="school in filteredSchools" :key="school._id" @click="selectSchool(school)" class="px-3 py-2 text-sm text-gray-800 rounded-md hover:bg-gray-100 cursor-pointer">
          {{ school.nom }}
        </li>
        <li v-if="!filteredSchools.length" class="px-3 py-2 text-sm text-gray-500">
          Aucun résultat.
        </li>
      </ul>
    </div>
  </div>
</template>