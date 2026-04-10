<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useFormationBuilderStore } from '../stores/formationBuilder';
import { useUserStore } from '../stores/user'; 

interface ApprovedInstructor {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

const props = defineProps<{
  formationId: string;
}>();

const formationBuilderStore = useFormationBuilderStore();
const userStore = useUserStore(); 

const approvedInstructors = computed(() => formationBuilderStore.formation.approvedInstructors);
const isLoading = computed(() => formationBuilderStore.isLoading || userStore.isLoading);

const instructorEmailToAdd = ref(''); // Pour l'input de recherche par email
const searchResults = ref<any[]>([]); // Résultats de la recherche d'utilisateurs
const searchError = ref<string | null>(null);

onMounted(() => {
    if (props.formationId && !formationBuilderStore.formation._id) {
        formationBuilderStore.loadFormation(props.formationId);
    }
});


const searchInstructors = async () => {
    searchError.value = null;
    searchResults.value = [];
    if (!instructorEmailToAdd.value.trim()) {
        searchError.value = "Veuillez entrer un email pour rechercher un formateur.";
        return;
    }

    try {
        const foundUser = await userStore.fetchUserByEmail(instructorEmailToAdd.value.trim()); 

        if (foundUser) {
            if (approvedInstructors.value.some(a => a._id === foundUser._id)) {
                searchError.value = "Ce formateur est déjà agréé pour cette formation.";
            } else {
                searchResults.value = [foundUser]; 
            }
        } else {
            searchError.value = "Aucun formateur trouvé avec cet email.";
        }
    } catch (error: any) {
        searchError.value = error.response?.data?.message || "Erreur lors de la recherche du formateur.";
        console.error("Erreur de recherche de formateur:", error);
    }
};

const addInstructor = async (instructor: ApprovedInstructor) => {
    if (!props.formationId || !instructor._id) return;

    formationBuilderStore.addApprovedInstructor(instructor);

    try {
        await formationBuilderStore.saveFormation();
        instructorEmailToAdd.value = ''; // Réinitialiser l'input
        searchResults.value = []; // Effacer les résultats de recherche
        searchError.value = null;
    } catch (error) {
        searchError.value = "Erreur lors de l'ajout du formateur agréé.";
        console.error("Erreur ajout formateur agréé:", error);
    }
};

const removeInstructor = async (instructorId: string) => {
    if (!props.formationId || !instructorId) return;

    if (confirm("Êtes-vous sûr de vouloir retirer ce formateur de la liste des agréés ?")) {
        formationBuilderStore.removeApprovedInstructor(instructorId);

        try {
            await formationBuilderStore.saveFormation();
        } catch (error) {
            searchError.value = "Erreur lors du retrait du formateur agréé.";
            console.error("Erreur retrait formateur agréé:", error);
        }
    }
};
</script>

<template>
    <div class="bg-white rounded-lg shadow-sm border p-6">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-semibold text-gray-900 mb-2">
                Formateurs agréés
            </h2>
            <p class="text-gray-600">
                Gérez les formateurs habilités à dispenser cette formation.
            </p>
        </div>

        <div class="mb-6 border-b pb-6 border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Ajouter un formateur</h3>
            <div class="flex flex-col sm:flex-row gap-3 items-center">
                <input
                    type="email"
                    v-model="instructorEmailToAdd"
                    @keyup.enter="searchInstructors"
                    class="input-field flex-grow"
                    placeholder="Rechercher par email..."
                />
                <button @click="searchInstructors" class="btn-primary flex-shrink-0">
                    Rechercher
                </button>
            </div>
            <p v-if="searchError" class="text-red-500 text-sm mt-2">{{ searchError }}</p>

            <div v-if="searchResults.length > 0" class="mt-4 bg-gray-50 p-3 rounded-md">
                <p class="font-medium text-gray-700 mb-2">Résultats de la recherche :</p>
                <div v-for="user in searchResults" :key="user._id" class="flex items-center justify-between p-2 border-b last:border-b-0">
                    <span>{{ user.prenom }} {{ user.nom }} ({{ user.email }})</span>
                    <button @click="addInstructor(user)" class="btn-secondary text-xs px-3 py-1">
                        Ajouter
                    </button>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Liste des formateurs agréés ({{ approvedInstructors.length }})</h3>
            <div v-if="isLoading" class="text-center py-4 text-gray-500">Chargement...</div>
            <div v-else-if="approvedInstructors.length === 0" class="text-center py-8 text-gray-500">
                Aucun formateur agréé pour cette formation pour le moment.
            </div>
            <div v-else class="space-y-3">
                <div
                    v-for="instructor in approvedInstructors"
                    :key="instructor._id"
                    class="flex items-center justify-between bg-gray-50 p-3 rounded-md border"
                >
                    <span>{{ instructor.prenom }} {{ instructor.nom }} ({{ instructor.email }})</span>
                    <button @click="removeInstructor(instructor._id)" class="text-gray-400 hover:text-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.label { @apply block text-sm font-medium text-gray-700 mb-1; }
.input-field { @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent; }
.btn-primary { @apply bg-[#B0E9DF] text-black font-medium px-4 py-2 rounded-md; }
.btn-secondary { @apply bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-md; }
</style>
