<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TheHeader from '../components/TheHeader.vue';
import { useEventStore } from '../stores/eventStore';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

const eventStore = useEventStore();
const events = computed(() => eventStore.events);
const isModalVisible = ref(false);
const newEvent = ref({
  title: '',
  start: '',
  end: '',
  allDay: false,
});

const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  locale: frLocale,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek',
  },
  editable: true,
  selectable: true,
  weekends: true,
  events: events,
  dateClick: (arg) => {
    newEvent.value = {
      title: '',
      start: arg.dateStr,
      end: arg.dateStr,
      allDay: true,
    };
    isModalVisible.value = true;
  },
  eventClick: (arg) => {
    alert(`Événement cliqué : ${arg.event.title}`);
  },
});

onMounted(() => {
  eventStore.fetchEvents();
});

const handleAddEvent = async () => {
  if (!newEvent.value.title) {
    alert('Le titre est requis.');
    return;
  }
  try {
    await eventStore.createEvent(newEvent.value);
    isModalVisible.value = false;
  } catch (error) {
    alert("Erreur lors de la création de l'événement.");
  }
};
</script>

<template>
  <div>
    <TheHeader pageTitle="Calendrier" :showBackButton="false" />
    <main class="p-6 md:p-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-[#423B71]">Votre calendrier</h1>
        <p class="text-gray-600 mt-1">Organisez vos cours, planifiez vos échéances et ne manquez plus jamais un rendez-vous.</p>
      </div>

      <div class="flex flex-col lg:flex-row items-start gap-8">
        <div class="w-full lg:w-2/3">
          <div class="bg-white p-6 rounded-lg shadow-lg border-2 border-gray-100">
            <FullCalendar :options="calendarOptions" />
          </div>
        </div>

        <div class="w-full lg:w-1/3">
          <div class="sticky top-28 bg-[#DCD8F4] p-6 rounded-lg shadow-xl border border-purple-300">

            <div class="space-y-4 mt-6">
                <div>
                    <label for="filter-type" class="label text-sm font-semibold text-gray-700">Filtrer par type</label>
                    <select id="filter-type" class="input-field bg-white/70">
                        <option>Tous les types</option>
                        <option>Cours en ligne</option>
                        <option>Rendu de devoir</option>
                        <option>Réunion</option>
                    </select>
                </div>
                <div>
                    <label for="filter-formation" class="label text-sm font-semibold text-gray-700">Filtrer par formation</label>
                    <select id="filter-formation" class="input-field bg-white/70">
                        <option>Toutes les formations</option>
                        <option>Marketing Digital</option>
                        <option>Data Science</option>
                    </select>
                </div>
            </div>

            <hr class="my-6 border-gray-400/50" />
            <div class="flex items-center justify-center mb-4">
                <i class="fas fa-tasks text-2xl text-[#423B71] mr-3"></i>
                <h3 class="font-bold text-xl text-[#423B71]">Prochaines Échéances</h3>
            </div>
            <div class="text-center text-gray-600">
                <p>Vos prochains événements apparaîtront ici.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-if="isModalVisible" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-[#DCD8F4] rounded-lg shadow-2xl w-full max-w-md p-8" @click.stop>
        <h3 class="text-2xl font-bold text-[#423B71] mb-6">Ajouter un événement</h3>
        <form @submit.prevent="handleAddEvent" class="space-y-4">
          <div>
            <label for="event-title" class="label">Titre</label>
            <input type="text" id="event-title" class="input-field" v-model="newEvent.title" required>
          </div>
          <div>
            <label for="event-start" class="label">Début</label>
            <input type="date" id="event-start" class="input-field" v-model="newEvent.start">
          </div>
          <div>
            <label for="event-end" class="label">Fin</label>
            <input type="date" id="event-end" class="input-field" v-model="newEvent.end">
          </div>
          <div class="flex items-center">
            <input type="checkbox" id="event-allday" v-model="newEvent.allDay" class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500">
            <label for="event-allday" class="ml-2 block text-sm text-gray-900">Journée entière</label>
          </div>
          <div class="flex justify-end space-x-4 pt-4">
            <button type="button" @click="isModalVisible = false" class="px-6 py-2 text-base font-bold text-[#423B72] bg-transparent rounded-lg hover:bg-gray-100/50 transition-all">Annuler</button>
            <button type="submit" class="px-6 py-2 text-base font-bold rounded-lg shadow-lg transition-all bg-[#B2E9E1] text-[#443E73] hover:bg-[#FF8B7E]">
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
:root {
    --fc-border-color: #e2e8f0;
    --fc-daygrid-event-dot-width: 8px;
    --fc-list-event-dot-width: 10px;
    --fc-event-border-color: #876EC8;
    --fc-event-bg-color: #876EC8;
    --fc-event-text-color: #fff;
}
.fc .fc-button-primary {
    background-color: #B2E9E1 !important; 
    border-color: #B2E9E1 !important;
    color: #443E73 !important; 
    font-weight: 600 !important;
    transition: background-color 0.2s;
}
.fc .fc-button-primary:hover {
    background-color: #a1d4cb !important; 
    border-color: #a1d4cb !important;
}
.fc .fc-button-primary:not(:disabled).fc-button-active, 
.fc .fc-button-primary:not(:disabled):active {
    background-color: #a1d4cb !important;
    border-color: #a1d4cb !important;
    color: #443E73 !important;
}
.fc .fc-daygrid-day.fc-day-today {
    background-color: #f3e8ff !important;
}
.fc .fc-toolbar-title {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: #423B71;
}

.label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}
.input-field {
  @apply w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#B2E9E0] focus:border-transparent transition-shadow;
}
</style>
