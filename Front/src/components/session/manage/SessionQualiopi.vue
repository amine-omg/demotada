<script setup lang="ts">
import { ref, computed, onMounted, type PropType } from 'vue';
import api from '/services/api';
import type { Session } from '../../../stores/sessionStore';

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true
  }
});

const isLoading = ref(true);

// Stockage brut des résultats par type
const evaluationsData = ref({
  positioning: [] as any[],
  satisfaction_chaud: [] as any[],
  satisfaction_froid: [] as any[]
});

const fetchAllEvaluations = async () => {
  isLoading.value = true;
  try {
    // Extraction de l'ID de la formation liée à la session
    const formationId = typeof props.session.formation === 'object' 
      ? (props.session.formation as any)._id 
      : props.session.formation;

    // Récupération simultanée des 3 listes de résultats Qualiopi
    // (Utilisation d'un catch individuel pour éviter que tout plante si un type de test est vide)
    const [pos, chaud, froid] = await Promise.all([
      api.get(`/api/user-evaluations/${formationId}/stats/positioning`).catch(() => ({ data: [] })),
      api.get(`/api/user-evaluations/${formationId}/stats/satisfaction_chaud`).catch(() => ({ data: [] })),
      api.get(`/api/user-evaluations/${formationId}/stats/satisfaction_froid`).catch(() => ({ data: [] }))
    ]);

    evaluationsData.value.positioning = pos.data || [];
    evaluationsData.value.satisfaction_chaud = chaud.data || [];
    evaluationsData.value.satisfaction_froid = froid.data || [];

  } catch (error) {
    console.error("Erreur lors du chargement des suivis Qualiopi:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAllEvaluations);

// Calcul dynamique du statut de chaque élève de la session
const studentsStatusList = computed(() => {
  const eleves = props.session.elevesInscrits || [];
  
  return eleves.map(eleve => {
    const userId = String(eleve.userId || (eleve as any)._id);
    
    // Vérifier la présence de l'élève dans les 3 listes de résultats
    const hasPos = evaluationsData.value.positioning.some(r => String(r.student?._id || r.student) === userId);
    const hasChaud = evaluationsData.value.satisfaction_chaud.some(r => String(r.student?._id || r.student) === userId);
    const hasFroid = evaluationsData.value.satisfaction_froid.some(r => String(r.student?._id || r.student) === userId);
    
    const completedCount = [hasPos, hasChaud, hasFroid].filter(Boolean).length;
    
    return {
      ...eleve,
      hasPos,
      hasChaud,
      hasFroid,
      completedCount,
      initiales: (eleve.prenom?.charAt(0) || '') + (eleve.nom?.charAt(0) || 'U')
    };
  }).sort((a, b) => b.completedCount - a.completedCount); // Trier par les meilleurs élèves en premier
});
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-[#423B71] flex items-center gap-2">
          <i class="fas fa-clipboard-check text-green-500"></i> Suivi Qualiopi & Évaluations
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          Contrôlez l'état d'avancement des enquêtes obligatoires pour vos apprenants.
        </p>
      </div>
      <button @click="fetchAllEvaluations" class="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-sm font-bold rounded-lg border border-gray-200 transition-colors flex items-center gap-2">
        <i :class="['fas fa-sync-alt', { 'fa-spin': isLoading }]"></i>
        Rafraîchir
      </button>
    </div>

    <div class="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 w-full overflow-hidden">
      <div v-if="isLoading" class="py-12 flex flex-col items-center justify-center">
        <i class="fas fa-circle-notch fa-spin text-3xl text-green-400 mb-3"></i>
        <p class="text-gray-500 font-medium">Calcul des conformités...</p>
      </div>

      <div v-else>
        <div class="flex items-center justify-between mb-6">
          <span class="text-sm font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            {{ studentsStatusList.length }} apprenant(s) à certifier
          </span>
        </div>

        <div class="w-full overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table class="min-w-full table-auto">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-5 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest w-1/3">Apprenant</th>
                <th class="px-3 py-4 text-center text-xs font-black text-indigo-500 uppercase tracking-widest"><i class="fas fa-brain mr-1.5"></i> Positionnement</th>
                <th class="px-3 py-4 text-center text-xs font-black text-orange-500 uppercase tracking-widest"><i class="fas fa-fire mr-1.5"></i> À Chaud</th>
                <th class="px-3 py-4 text-center text-xs font-black text-blue-500 uppercase tracking-widest"><i class="fas fa-snowflake mr-1.5"></i> À Froid</th>
                <th class="px-5 py-4 text-right text-xs font-black text-gray-500 uppercase tracking-widest">Statut Légal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 bg-white">
              <tr v-for="eleve in studentsStatusList" :key="eleve.userId" class="hover:bg-slate-50 transition-colors group">
                
                <td class="px-5 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <img v-if="eleve.photo" :src="eleve.photo" class="w-10 h-10 rounded-full object-cover shadow-sm mr-3 border border-white"/>
                    <div v-else class="h-10 w-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-black mr-3 shadow-sm flex-shrink-0 text-sm">
                      {{ eleve.initiales }}
                    </div>
                    <div class="flex flex-col">
                      <span class="text-sm font-bold text-gray-900 truncate">{{ eleve.prenom }} {{ eleve.nom }}</span>
                      <span class="text-xs text-gray-400 truncate">{{ eleve.email }}</span>
                    </div>
                  </div>
                </td>

                <td class="px-3 py-4 text-center">
                  <div v-if="eleve.hasPos" class="inline-flex w-8 h-8 bg-green-100 text-green-600 rounded-full items-center justify-center shadow-sm">
                    <i class="fas fa-check"></i>
                  </div>
                  <div v-else class="inline-flex w-8 h-8 bg-gray-100 text-gray-300 rounded-full items-center justify-center">
                    <i class="fas fa-minus"></i>
                  </div>
                </td>

                <td class="px-3 py-4 text-center">
                  <div v-if="eleve.hasChaud" class="inline-flex w-8 h-8 bg-green-100 text-green-600 rounded-full items-center justify-center shadow-sm">
                    <i class="fas fa-check"></i>
                  </div>
                  <div v-else class="inline-flex w-8 h-8 bg-gray-100 text-gray-300 rounded-full items-center justify-center">
                    <i class="fas fa-minus"></i>
                  </div>
                </td>

                <td class="px-3 py-4 text-center">
                  <div v-if="eleve.hasFroid" class="inline-flex w-8 h-8 bg-green-100 text-green-600 rounded-full items-center justify-center shadow-sm">
                    <i class="fas fa-check"></i>
                  </div>
                  <div v-else class="inline-flex w-8 h-8 bg-gray-100 text-gray-300 rounded-full items-center justify-center">
                    <i class="fas fa-minus"></i>
                  </div>
                </td>

                <td class="px-5 py-4 text-right">
                  <div class="flex flex-col items-end gap-2">
                    
                    <span v-if="eleve.completedCount === 3" class="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-black bg-green-50 text-green-600 border border-green-200 shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                      <i class="fas fa-certificate mr-1.5"></i> Validé 100%
                    </span>

                    <span v-else-if="eleve.completedCount > 0" class="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-black bg-orange-50 text-orange-600 border border-orange-200">
                      <i class="fas fa-spinner fa-spin mr-1.5 opacity-70"></i> {{ eleve.completedCount }}/3 Complétés
                    </span>

                    <span v-else class="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-xs font-black bg-gray-100 text-gray-500 border border-gray-200">
                      <i class="fas fa-hourglass-start mr-1.5"></i> À démarrer
                    </span>

                    <div class="w-32 h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
                      <div :class="['h-full transition-all duration-1000', eleve.completedCount === 3 ? 'bg-green-500' : (eleve.completedCount === 2 ? 'bg-amber-400' : 'bg-red-400')]" :style="{ width: `${(eleve.completedCount / 3) * 100}%` }"></div>
                    </div>

                  </div>
                </td>
              </tr>

              <tr v-if="studentsStatusList.length === 0">
                <td colspan="5" class="px-4 py-16 text-center">
                  <div class="flex flex-col items-center justify-center">
                    <div class="bg-gray-50 p-4 rounded-full mb-3">
                      <i class="fas fa-users-slash text-gray-300 text-3xl"></i>
                    </div>
                    <p class="text-gray-600 font-bold text-lg">Aucun apprenant</p>
                    <p class="text-gray-500 text-sm mt-1">Ajoutez des inscrits à la session pour suivre leur certification.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>