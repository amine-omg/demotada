<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { PropType } from 'vue';
import type { Session } from '../../../stores/sessionStore';
import { useCoursStore } from '../../../stores/coursStore';

const props = defineProps({
  session: {
    type: Object as PropType<Session>,
    required: true
  }
});

const coursStore = useCoursStore();
const isLoading = ref(true);

// Jours de la semaine pour l'en-tête
const weekDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// Date de référence pour l'affichage du mois en cours
const viewDate = ref(new Date());

// --- RÉCUPÉRATION DES DONNÉES ---
onMounted(async () => {
  isLoading.value = true;
  if (props.session._id) {
    await coursStore.fetchCoursForSession(props.session._id);
    
    // Caler la vue initiale sur le premier cours, ou la date de début, ou aujourd'hui
    if (courses.value.length > 0) {
      viewDate.value = new Date(courses.value[0].date);
    } else if (props.session.dateDebut) {
      viewDate.value = new Date(props.session.dateDebut);
    }
  }
  isLoading.value = false;
});

const courses = computed(() => coursStore.coursForSession || []);
const totalEleves = computed(() => props.session.elevesInscrits?.length || 0);

// --- UTILITAIRES DE DATE ---
const getFormattedDateKey = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const todayKey = getFormattedDateKey(new Date());

// Map des cours classés par date (YYYY-MM-DD)
const coursesByDate = computed(() => {
  const map: Record<string, any[]> = {};
  courses.value.forEach(c => {
    const key = getFormattedDateKey(c.date);
    if (!map[key]) map[key] = [];
    map[key].push(c);
  });
  return map;
});

// --- LOGIQUE DU CALENDRIER MENSUEL ---
const currentMonthLabel = computed(() => {
  const month = viewDate.value.toLocaleDateString('fr-FR', { month: 'long' });
  const year = viewDate.value.getFullYear();
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
});

const prevMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1);
};

const nextMonth = () => {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1);
};

const goToToday = () => {
  viewDate.value = new Date();
};

// Génère toujours 42 cases (6 lignes de 7 colonnes) pour un affichage stable
const calendarGrid = computed(() => {
  const year = viewDate.value.getFullYear();
  const month = viewDate.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  // Ajustement pour que la semaine commence le lundi (0 = Lundi, 6 = Dimanche)
  const startDayOfWeek = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;

  const gridStart = new Date(year, month, 1 - startDayOfWeek);
  const days = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + i);

    const dateKey = getFormattedDateKey(current);
    days.push({
      dateObj: new Date(current),
      dateKey,
      dayNumber: current.getDate(),
      isCurrentMonth: current.getMonth() === month,
      isWeekend: current.getDay() === 0 || current.getDay() === 6,
      isToday: dateKey === todayKey,
      courses: coursesByDate.value[dateKey] || []
    });
  }
  return days;
});

const currentMonthCoursesCount = computed(() => {
  return calendarGrid.value.filter(d => d.isCurrentMonth && d.courses.length > 0).length;
});

// Vue Agenda pour Mobile (uniquement les jours du mois qui ont des cours)
const mobileAgendaDays = computed(() => {
  return calendarGrid.value.filter(d => d.isCurrentMonth && d.courses.length > 0);
});


// --- CALCUL DES ÉMARGEMENTS ---
const getAttendanceCount = (course: any, period: 'morning' | 'afternoon') => {
  if (!course.attendance || !Array.isArray(course.attendance)) return 0;
  
  return course.attendance.filter((record: any) => {
    const s = record.status;
    if (period === 'morning') {
      return s === 'present' || s === 'morning_present' || s === 'late';
    } else {
      return s === 'present' || s === 'afternoon_present' || s === 'late';
    }
  }).length;
};

// Actions préparées
const handleEmargementMatin = (courseId: string) => {
  console.log("Ouvrir l'interface d'émargement MATIN pour le cours :", courseId);
};

const handleEmargementSoir = (courseId: string) => {
  console.log("Ouvrir l'interface d'émargement SOIR pour le cours :", courseId);
};
</script>

<template>
  <div class="space-y-6">
    
    <div class="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-[#423B71] flex items-center gap-2">
          <i class="far fa-calendar-alt text-indigo-400"></i> Planning de la session
        </h2>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          Gérez l'agenda, les cours et les présences.
        </p>
      </div>
      <button class="bg-[#B2E9E1] hover:bg-[#9ddbd1] text-[#443E73] font-bold py-2.5 px-5 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 w-full md:w-auto">
        <i class="fas fa-plus"></i> Ajouter un cours
      </button>
    </div>

    <div v-if="isLoading" class="bg-white rounded-xl shadow-sm border border-gray-100 py-20 flex flex-col items-center justify-center">
      <i class="fas fa-circle-notch fa-spin text-4xl text-indigo-300 mb-4"></i>
      <p class="text-gray-500 font-bold">Chargement du calendrier...</p>
    </div>

    <div v-else class="space-y-6">
      
      <div class="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        <div class="flex items-center gap-4">
          <button @click="prevMonth" class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3 class="text-2xl font-black text-[#423B71] w-48 text-center">{{ currentMonthLabel }}</h3>
          <button @click="nextMonth" class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition-colors border border-gray-200">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div class="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            {{ currentMonthCoursesCount }} jour(s) de cours
          </div>
          <button @click="goToToday" class="text-sm font-bold text-gray-600 hover:text-indigo-600 transition-colors">
            Aujourd'hui
          </button>
        </div>
      </div>

      <div class="block lg:hidden space-y-4">
        <template v-if="mobileAgendaDays.length > 0">
          <div 
            v-for="day in mobileAgendaDays" 
            :key="day.dateKey"
            class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
              <span class="font-bold text-gray-700 capitalize">
                {{ day.dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) }}
              </span>
              <span v-if="day.isToday" class="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Aujourd'hui</span>
            </div>
            
            <div class="p-4 space-y-4">
              <div v-for="course in day.courses" :key="course._id" class="border-l-4 border-l-indigo-400 pl-3">
                <h4 class="text-sm font-bold text-gray-800 mb-1">{{ course.title }}</h4>
                <div class="flex items-center text-xs text-gray-500 font-medium mb-3">
                  <i class="far fa-clock mr-1.5"></i> {{ course.startTime || '09:00' }} - {{ course.endTime || '17:00' }}
                </div>
                
                <div class="flex gap-2">
                  <button @click="handleEmargementMatin(course._id)" class="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 transition-colors">
                    <i class="fas fa-sun text-amber-500"></i>
                    <span class="text-xs font-bold">{{ getAttendanceCount(course, 'morning') }}/{{ totalEleves }}</span>
                  </button>
                  <button @click="handleEmargementSoir(course._id)" class="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors">
                    <i class="fas fa-moon text-indigo-400"></i>
                    <span class="text-xs font-bold">{{ getAttendanceCount(course, 'afternoon') }}/{{ totalEleves }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="bg-white rounded-xl shadow-sm border border-dashed border-gray-200 py-12 flex flex-col items-center text-center">
          <i class="fas fa-mug-hot text-4xl text-gray-300 mb-3"></i>
          <p class="font-bold text-gray-600">Aucun cours ce mois-ci</p>
        </div>
      </div>

      <div class="hidden lg:flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div class="grid grid-cols-7 bg-gray-800 text-white border-b border-gray-200">
          <div 
            v-for="(day, index) in weekDays" 
            :key="day" 
            class="py-3 px-4 text-center text-xs font-bold uppercase tracking-wider"
            :class="{'text-gray-400': index >= 5}"
          >
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-px">
          
          <div 
            v-for="day in calendarGrid" 
            :key="day.dateKey"
            :class="[
              'min-h-[140px] p-2 flex flex-col transition-colors relative',
              !day.isCurrentMonth ? 'bg-gray-50/50 text-gray-400 opacity-60' : (day.isWeekend ? 'bg-gray-50/80' : 'bg-white hover:bg-indigo-50/10'),
              day.isToday ? 'ring-2 ring-inset ring-indigo-400 z-10 bg-indigo-50/20' : ''
            ]"
          >
            <div class="flex items-center justify-between mb-2">
              <span 
                :class="[
                  'text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full',
                  day.isToday ? 'bg-indigo-500 text-white shadow-md' : (day.courses.length > 0 && day.isCurrentMonth ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500')
                ]"
              >
                {{ day.dayNumber }}
              </span>
              <span v-if="day.dayNumber === 1 || day.isToday" class="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                {{ day.isToday ? "Auj." : day.dateObj.toLocaleDateString('fr-FR', { month: 'short' }) }}
              </span>
            </div>

            <div class="flex-1 space-y-2 overflow-y-auto hide-scrollbar">
              <div 
                v-for="course in day.courses" 
                :key="course._id"
                class="group relative bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-400"
              >
                <h4 class="text-xs font-bold text-gray-800 line-clamp-2 leading-snug mb-1" :title="course.title">
                  {{ course.title }}
                </h4>
                
                <div class="flex items-center text-[10px] text-gray-500 font-medium mb-2">
                  <i class="far fa-clock mr-1"></i>
                  {{ course.startTime || '09:00' }} - {{ course.endTime || '17:00' }}
                </div>

                <div class="flex gap-1 border-t border-gray-100 pt-2">
                  <button 
                    @click="handleEmargementMatin(course._id)"
                    class="flex-1 flex items-center justify-center px-1 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100 transition-colors group/btn"
                    title="Émargement Matin"
                  >
                    <i class="fas fa-sun text-[10px] text-amber-500 mr-1 group-hover/btn:animate-spin-slow"></i>
                    <span class="text-[10px] font-black">{{ getAttendanceCount(course, 'morning') }}/{{ totalEleves }}</span>
                  </button>

                  <button 
                    @click="handleEmargementSoir(course._id)"
                    class="flex-1 flex items-center justify-center px-1 py-1 rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100 transition-colors group/btn"
                    title="Émargement Soir"
                  >
                    <i class="fas fa-moon text-[10px] text-indigo-400 mr-1 group-hover/btn:animate-pulse"></i>
                    <span class="text-[10px] font-black">{{ getAttendanceCount(course, 'afternoon') }}/{{ totalEleves }}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.animate-spin-slow {
  animation: spin 4s linear infinite;
}
</style>