<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useFormationsStore } from '../../stores/formations';
import { useSessionStore } from '../../stores/sessionStore';
import { useUserStore } from '../../stores/user';
import FeatureCard from '../FeatureCard.vue';

const formationsStore = useFormationsStore();
const sessionStore = useSessionStore();
const userStore = useUserStore();

onMounted(async () => {
  // Chargement des données globales pour alimenter les statistiques en temps réel
  try {
    await Promise.all([
      formationsStore.fetchFormations({ publicOnly: false }),
      sessionStore.fetchSessions()
    ]);
  } catch (error) {
    console.error("Erreur lors de la récupération des données dashboard:", error);
  }
});

// --- LOGIQUE DE DATA DYNAMIQUE ---
// On filtre les formations qui attendent une action de l'admin
const pendingFormations = computed(() => 
  formationsStore.formations.filter(f => f.validationStatus === 'pending')
);

// Calcul du nombre total d'élèves inscrits sur toutes les sessions
const activeStudentsCount = computed(() => {
  return sessionStore.sessions.reduce((acc, s) => acc + (s.elevesInscrits?.length || 0), 0);
});

// Calcul des sessions actuellement marquées "en cours"
const activeSessionsCount = computed(() => 
  sessionStore.sessions.filter(s => s.status === 'en_cours').length
);

// --- MOCK DATA POUR LE FLUX D'ACTIVITÉS ---
// Ces données simulent les dernières "news" de la plateforme
const recentActivities = [
  { id: 1, type: 'diploma', user: 'Jean Dupont', detail: 'a obtenu son diplôme', time: 'Il y a 2h', icon: 'fa-graduation-cap', color: 'text-yellow-500' },
  { id: 2, type: 'start', user: 'Formation YouTube', detail: 'vient de débuter', time: 'Il y a 5h', icon: 'fa-rocket', color: 'text-indigo-500' },
  { id: 3, type: 'enroll', user: 'Sophie Martin', detail: 's\'est inscrite à "Vente B2B"', time: 'Ce matin', icon: 'fa-user-plus', color: 'text-green-500' }
];

const formatDate = () => {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
};

// --- MÉTHODES DE MANAGEMENT ---
const handleValidate = async (id: string) => {
  if (confirm("Voulez-vous valider cette formation et la rendre publiable ?")) {
    await formationsStore.updateFormationValidationStatus(id, 'approved');
  }
};
</script>

<template>
  <div class="max-w-[1600px] mx-auto space-y-10 pb-12">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end px-2 gap-4">
      <div>
        <p class="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-2">{{ formatDate() }}</p>
        <h1 class="text-4xl font-black text-[#423B71] tracking-tight">
          Hello, {{ userStore.user.prenom }} ! 👋
        </h1>
        <p class="text-gray-500 mt-2 font-medium">Voici ce qui se passe sur votre plateforme aujourd'hui.</p>
      </div>
      <div class="flex gap-3">
        <button class="px-6 py-3 bg-white border border-gray-200 text-[#423B71] font-bold rounded-2xl shadow-sm hover:shadow-md transition-all text-sm">
          Extraire Rapports
        </button>
        <button class="px-6 py-3 bg-[#423B71] text-white font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all text-sm">
          + Nouvel Établissement
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="stat-card bg-white border-l-4 border-indigo-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label">Élèves actifs</p>
            <h3 class="stat-number">{{ activeStudentsCount }}</h3>
          </div>
          <div class="p-3 bg-indigo-50 text-indigo-500 rounded-xl"><i class="fas fa-users text-xl"></i></div>
        </div>
        <p class="stat-delta text-green-500"><i class="fas fa-arrow-up mr-1"></i> +12% <span class="text-gray-400 font-normal">vs mois dernier</span></p>
      </div>

      <div class="stat-card bg-white border-l-4 border-purple-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label">Sessions en cours</p>
            <h3 class="stat-number">{{ activeSessionsCount }}</h3>
          </div>
          <div class="p-3 bg-purple-50 text-purple-500 rounded-xl"><i class="fas fa-clock text-xl"></i></div>
        </div>
        <p class="stat-delta text-gray-400">Stable <span class="font-normal">sur 30 jours</span></p>
      </div>

      <div class="stat-card bg-white border-l-4 border-orange-500">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label">A valider</p>
            <h3 class="stat-number text-orange-600">{{ pendingFormations.length }}</h3>
          </div>
          <div class="p-3 bg-orange-50 text-orange-500 rounded-xl"><i class="fas fa-tasks text-xl"></i></div>
        </div>
        <p class="stat-delta font-bold text-orange-500 italic">Action requise</p>
      </div>

      <div class="stat-card bg-[#423B71] text-white">
        <div class="flex justify-between items-start">
          <div>
            <p class="stat-label !text-indigo-200">Revenu mensuel</p>
            <h3 class="stat-number text-white">12,450 €</h3>
          </div>
          <div class="p-3 bg-white/10 text-white rounded-xl"><i class="fas fa-wallet text-xl"></i></div>
        </div>
        <p class="stat-delta text-indigo-300"><i class="fas fa-chart-line mr-1"></i> +8% croissance</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <div class="lg:col-span-8 bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 class="text-xl font-black text-[#423B71]">Management : Formations en attente</h3>
          <span class="bg-orange-100 text-orange-700 px-4 py-1 rounded-full text-xs font-black uppercase">{{ pendingFormations.length }} dossiers</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                <th class="px-8 py-4">Formation</th>
                <th class="px-8 py-4">Créateur</th>
                <th class="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="f in pendingFormations" :key="f._id" class="hover:bg-gray-50/50 transition-colors">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-3">
                    <img :src="f.image || '/img/placeholder.jpg'" class="w-10 h-10 rounded-lg object-cover shadow-sm">
                    <span class="font-bold text-[#423B71] text-sm">{{ f.title }}</span>
                  </div>
                </td>
                <td class="px-8 py-5">
                  <span class="text-xs font-medium text-gray-600 italic">{{ f.createdBy?.prenom }} {{ f.createdBy?.nom }}</span>
                </td>
                <td class="px-8 py-5 text-right">
                  <div class="flex justify-end gap-2">
                    <button @click="$router.push(`/formations/${f._id}`)" class="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-all">
                      Examiner
                    </button>
                    <button @click="handleValidate(f._id)" class="px-4 py-2 bg-green-50 text-green-600 font-bold rounded-xl text-xs hover:bg-green-100 transition-all">
                      Valider
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="pendingFormations.length === 0">
                <td colspan="3" class="px-8 py-12 text-center text-gray-400 italic text-sm">Aucun dossier en attente de validation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="lg:col-span-4 bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
        <h3 class="text-xl font-black text-[#423B71] mb-8">Dernières news</h3>
        <div class="space-y-8">
          <div v-for="activity in recentActivities" :key="activity.id" class="flex gap-4 relative">
            <div v-if="activity.id !== recentActivities.length" class="absolute left-6 top-10 w-0.5 h-6 bg-gray-50"></div>
            
            <div class="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 shadow-inner">
              <i :class="['fas', activity.icon, activity.color]"></i>
            </div>
            <div>
              <p class="text-sm text-[#423B71] font-bold">
                {{ activity.user }} 
                <span class="font-medium text-gray-500">{{ activity.detail }}</span>
              </p>
              <p class="text-[10px] text-gray-400 font-black uppercase tracking-wider mt-1">{{ activity.time }}</p>
            </div>
          </div>
        </div>
        <button class="w-full mt-10 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-400 transition-all">
          Voir tout l'historique
        </button>
      </div>

    </div>

    <div class="pt-8">
      <h3 class="text-xl font-black text-[#423B71] mb-8 px-2">Management rapide</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          title="Établissements"
          description="Gérez les écoles et partenaires."
          image-url="/img/etablissements.jpg"
          to="/etablissements"
          class="!rounded-[2rem]"
        />
        <FeatureCard
          title="Inscriptions"
          description="Suivi des nouveaux inscrits du mois."
          image-url="/img/inscriptions.jpg"
          to="/apprenants"
          class="!rounded-[2rem]"
        />
        <FeatureCard
          title="Rapports"
          description="Consultez les bilans d'activité."
          image-url="/img/rapports.jpg"
          to="/rapports"
          class="!rounded-[2rem]"
        />
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

.stat-delta {
  @apply text-[11px] font-bold mt-4;
}

/* Scrollbar personnalisée pour le tableau sur mobile */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>