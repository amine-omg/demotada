<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useFormationsStore } from '../../stores/formations';
import { useSessionStore } from '../../stores/sessionStore';
import { useUserStore } from '../../stores/user';
import FeatureCard from '../FeatureCard.vue';

// On reçoit l'ID de l'école depuis DashboardPage.vue
const props = defineProps<{ ecoleId?: string | null }>();

const formationsStore = useFormationsStore();
const sessionStore = useSessionStore();
const userStore = useUserStore();

// --- LOGIQUE DE NOM DYNAMIQUE ---
const currentSchoolName = computed(() => {
  // Priorité 1 : On est admin et on a sélectionné une école
  if (userStore.userRole === 'admin' && userStore.adminSelectedContext) {
    return userStore.adminSelectedContext.nom;
  }
  // Priorité 2 : On est un compte 'ecole' rattaché
  if (userStore.user.associatedEntity && typeof userStore.user.associatedEntity === 'object') {
    return userStore.user.associatedEntity.nom;
  }
  return 'Établissement';
});

// --- FONCTION DE CHARGEMENT CENTRALISÉE ---
const loadDashboardData = async () => {
  // On utilise l'ID passé en prop ou l'ID de l'entité de l'utilisateur
  const targetId = props.ecoleId || (userStore.user.associatedEntity as any)?._id;
  
  if (!targetId) return;

  const context = { ecoleId: targetId };
  
  try {
    await Promise.all([
      formationsStore.fetchFormations(context),
      sessionStore.fetchSessions({ 
        ...context, 
        role: userStore.userRole, 
        userId: userStore.user.id 
      })
    ]);
  } catch (error) {
    console.error("Erreur chargement EcoleDashboard:", error);
  }
};

// RELANCE les requêtes dès que l'admin change d'établissement
watch(() => props.ecoleId, () => {
  loadDashboardData();
});

onMounted(() => {
  loadDashboardData();
});

// --- DATA DYNAMIQUE POUR LES COMPTEURS ---
const totalStudents = computed(() => {
  return sessionStore.sessions.reduce((acc, s) => acc + (s.elevesInscrits?.length || 0), 0);
});

const sessionsAvenir = computed(() => 
  sessionStore.sessions.filter(s => s.status === 'à venir')
);

const recentStudents = computed(() => {
  const allEnrolled = sessionStore.sessions.flatMap(s => 
    (s.elevesInscrits || []).map(e => ({ 
      ...e, 
      sessionTitle: typeof s.formation === 'object' ? s.formation.title : s.title 
    }))
  );
  return allEnrolled.sort((a, b) => new Date(b.dateInscription).getTime() - new Date(a.dateInscription).getTime()).slice(0, 5);
});

const formatDate = () => {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};
</script>

<template>
  <div class="max-w-[1600px] mx-auto space-y-10 pb-12 animate-in fade-in duration-500">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4">
      <div>
        <p class="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">{{ formatDate() }}</p>
        <h1 class="text-4xl font-black text-[#423B71] tracking-tight">
          Dashboard <span class="text-gray-400 font-medium">— {{ currentSchoolName }}</span>
        </h1>
        <p class="text-gray-600 mt-2 font-medium italic">Suivi de la réussite et gestion des sessions.</p>
      </div>
      <div class="flex gap-3">
        <button @click="$router.push('/sessions')" class="px-6 py-3 bg-[#423B71] text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all text-sm">
          + Nouvelle Session
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="stat-card bg-white border-l-4 border-indigo-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label">Total Apprenants</p>
            <h3 class="stat-number">{{ totalStudents }}</h3>
          </div>
          <div class="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><i class="fas fa-user-graduate text-xl"></i></div>
        </div>
      </div>

      <div class="stat-card bg-white border-l-4 border-[#62D6CA]">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label">Sessions à venir</p>
            <h3 class="stat-number">{{ sessionsAvenir.length }}</h3>
          </div>
          <div class="p-3 bg-teal-50 text-teal-500 rounded-xl"><i class="fas fa-calendar-alt text-xl"></i></div>
        </div>
      </div>

      <div class="stat-card bg-white border-l-4 border-purple-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label">Catalogue</p>
            <h3 class="stat-number">{{ formationsStore.formations.length }}</h3>
          </div>
          <div class="p-3 bg-purple-50 text-purple-500 rounded-xl"><i class="fas fa-book text-xl"></i></div>
        </div>
      </div>

      <div class="stat-card bg-[#423B71] text-white">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label !text-indigo-200">Taux de réussite</p>
            <h3 class="stat-number text-white">-- %</h3>
          </div>
          <div class="p-3 bg-white/10 text-white rounded-xl"><i class="fas fa-award text-xl"></i></div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 class="text-xl font-black text-[#423B71]">Inscriptions récentes</h3>
          <button @click="$router.push('/apprenants')" class="text-xs font-black text-indigo-500 uppercase tracking-widest hover:underline">Voir tout</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50">
              <tr class="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th class="px-8 py-4">Apprenant</th>
                <th class="px-8 py-4">Formation / Session</th>
                <th class="px-8 py-4">Inscrit le</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="student in recentStudents" :key="student.userId" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">
                      {{ student.prenom[0] }}{{ student.nom[0] }}
                    </div>
                    <span class="font-bold text-[#423B71] text-sm">{{ student.prenom }} {{ student.nom }}</span>
                  </div>
                </td>
                <td class="px-8 py-5 text-xs font-medium text-gray-500">{{ student.sessionTitle }}</td>
                <td class="px-8 py-5 text-xs text-gray-400 italic">{{ new Date(student.dateInscription).toLocaleDateString() }}</td>
              </tr>
              <tr v-if="recentStudents.length === 0">
                <td colspan="3" class="px-8 py-12 text-center text-gray-300 italic">Aucune inscription sur cette période.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
        <h3 class="text-xl font-black text-[#423B71] mb-8">Flux établissement</h3>
        <div class="space-y-8 text-center py-10">
           <i class="fas fa-bolt text-4xl text-gray-100 mb-4"></i>
           <p class="text-gray-400 text-sm font-medium">Les mises à jour de {{ currentSchoolName }} apparaîtront ici.</p>
        </div>
      </div>
    </div>

    <div class="pt-8">
      <h3 class="text-xl font-black text-[#423B71] mb-8 px-2">Management rapide</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard title="Catalogue" description="Gérez vos programmes." to="/formations" class="!rounded-[2rem]" />
        <FeatureCard title="Émargements" description="Suivi des présences." to="/documents" class="!rounded-[2rem]" />
        <FeatureCard title="Rapports" description="Bilans pédagogiques." to="/rapports" class="!rounded-[2rem]" />
      </div>
    </div>

  </div>
</template>

<style scoped>
.stat-card {
  @apply p-6 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col justify-between transition-all hover:shadow-md;
}
.stat-label {
  @apply text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1;
}
.stat-number {
  @apply text-3xl font-black text-[#423B71] tracking-tight;
}
</style>