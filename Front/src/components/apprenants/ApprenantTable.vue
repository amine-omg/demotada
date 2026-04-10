<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router'; 

const router = useRouter();

interface Apprenant {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  derniereActivite: string;
  revenus: string;
}

const props = defineProps<{
  apprenants: Apprenant[];
}>();

const getInitials = (prenom: string, nom: string) => {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString; 
  return date.toLocaleDateString('fr-FR');
};
</script>

<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apprenant
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Activité
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Revenus
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="apprenants.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-gray-500">
              Il n'y a pas de résultat pour cette recherche
            </td>
          </tr>
          <tr v-for="apprenant in apprenants" :key="apprenant.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ getInitials(apprenant.nom, apprenant.prenom) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    <router-link
                      :to="`/apprenants/${apprenant.id}`"
                      class="hover:text-[#F04636] transition-colors cursor-pointer"
                    >
                      {{ apprenant.prenom }} {{ apprenant.nom }}
                    </router-link>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ apprenant.email }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ apprenant.derniereActivite }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ apprenant.revenus }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
