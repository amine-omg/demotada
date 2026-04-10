<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import TheHeader from '../components/TheHeader.vue';

const coursDuJour = ref([
  {
    id: 'cours-1',
    heureDebut: '10:00',
    heureFin: '11:30',
    titreFormation: 'Marketing Digital - Promo 2025',
    titreCours: 'Session 3 : Introduction au SEO',
    statut: 'Planifié',
    elevesInscrits: 24,
    dateDebut: new Date(new Date().getTime() + 20 * 1000) 
  },
  {
    id: 'cours-2',
    heureDebut: '14:00',
    titreFormation: 'Introduction à la Data Science',
    titreCours: 'Session 1 : Les bases de Python',
    statut: 'Planifié',
    dateDebut: new Date(new Date().setHours(14, 0, 0, 0))
  }
]);

const elevesConnectes = ref(['Léa Martin', 'Hugo Dubois', 'Chloé Petit', 'Lucas Robert', 'Manon Moreau']); 

const maintenant = ref(new Date());
let timer: number;

const prochainCours = computed(() => coursDuJour.value[0]);

const estEnModeSalleAttente = computed(() => {
    if (!prochainCours.value) return false;
    const diffMinutes = (prochainCours.value.dateDebut.getTime() - maintenant.value.getTime()) / 60000;
    return diffMinutes <= 15;
});

const tempsRestant = computed(() => {
    if (!prochainCours.value) return 'N/A';
    const diffSecondes = Math.floor((prochainCours.value.dateDebut.getTime() - maintenant.value.getTime()) / 1000);
    if (diffSecondes <= 0) return "Le cours commence !";
    const minutes = Math.floor(diffSecondes / 60);
    const secondes = diffSecondes % 60;
    return `commence dans ${minutes}m ${secondes}s`;
});

const lancerLeCours = () => {
    // TODO: Remplacer par le vrai lien Google Meet
    window.open('https://meet.google.com', '_blank');
    alert("Le cours est lancé ! Les élèves seront notifiés.");
};

onMounted(() => {
  timer = setInterval(() => {
    maintenant.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

</script>

<template>
  <div>
    <TheHeader pageTitle="Dashboard" :showBackButton="false" />
    <main class="p-6 md:p-8">
      <div v-if="prochainCours && estEnModeSalleAttente" class="bg-white rounded-lg shadow-xl border p-8 max-w-3xl mx-auto">
        <div class="text-center">
          <i class="fas fa-clock text-4xl text-purple-400 mb-4"></i>
          <h2 class="text-xl font-bold text-[#423B71] uppercase tracking-wider">{{ tempsRestant }}</h2>
          <h1 class="text-3xl font-bold text-[#423B71] mt-2">{{ prochainCours.titreFormation }}</h1>
          <p class="text-lg text-gray-600">{{ prochainCours.titreCours }}</p>
        </div>

        <hr class="my-6 border-gray-200" />

        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="font-bold text-center text-gray-700 mb-4">SALLE D'ATTENTE VIRTUELLE</h3>
            <div class="flex items-center justify-center text-2xl font-bold text-gray-800">
                <i class="fas fa-users mr-3 text-teal-500"></i>
                <span>{{ elevesConnectes.length }} / {{ prochainCours.elevesInscrits }}</span>
                <span class="ml-2 text-base font-medium text-gray-500">élèves connectés</span>
            </div>
            <!-- TODO: Connecter à un WebSocket pour les mises à jour en temps réel -->
        </div>

        <div class="mt-8 text-center">
            <button @click="lancerLeCours" class="w-full max-w-md px-8 py-4 text-xl font-bold text-white bg-[#B2E9E1] text-[#443E73] rounded-lg shadow-lg hover:bg-[#FF8B7E] transition-all transform hover:scale-105">
                <i class="fas fa-video mr-3"></i>
                LANCER LE COURS
            </button>
            <button class="mt-4 text-sm text-gray-500 hover:text-gray-800">Envoyer un rappel aux absents</button>
        </div>
      </div>
      <div v-else>
        <h1 class="text-3xl font-bold text-[#423B71]">Bienvenue, [Nom du Formateur] !</h1>
        <p class="text-gray-600 mt-1">Voici le programme de votre journée.</p>

        <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div class="lg:col-span-2 p-6 bg-white rounded-lg shadow-sm border">
                <h2 class="font-bold text-lg text-[#423B71] mb-4">Vos cours en ligne aujourd'hui</h2>
                <div v-if="coursDuJour.length > 0" class="space-y-4">
                    <div v-for="cours in coursDuJour" :key="cours.id" class="p-4 border rounded-lg flex items-center justify-between">
                        <div>
                            <span class="font-bold text-purple-600">{{ cours.heureDebut }} - {{ cours.heureFin }}</span>
                            <p class="font-semibold text-gray-800">{{ cours.titreFormation }}</p>
                            <p class="text-sm text-gray-500">{{ cours.titreCours }}</p>
                        </div>
                        <button class="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Préparer le cours
                        </button>
                    </div>
                </div>
                <div v-else class="text-center py-8">
                    <p>Aucun cours en ligne programmé pour aujourd'hui.</p>
                </div>
            </div>

            <div class="lg:col-span-1 bg-[#B0E8DF] p-6 rounded-lg h-full">
                <div class="flex justify-center mb-4">
                    <div class="w-12 h-12 bg-white/50 rounded-full flex items-center justify-center">
                        <i class="fas fa-lightbulb text-2xl text-[#423B71]"></i>
                    </div>
                </div>
                <h3 class="font-bold text-lg text-center text-[#443E73] mb-2">Le saviez-vous ?</h3>
                <p class="text-sm text-center text-[#443E73]/80">
                    Ce tableau de bord est votre centre de contrôle. Planifiez vos cours dans le calendrier, et revenez ici le jour J pour lancer votre classe virtuelle en un clic !
                </p>
            </div>
        </div>
      </div>

    </main>
  </div>
</template>
