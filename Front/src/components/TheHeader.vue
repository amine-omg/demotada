<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useNotificationStore } from '../stores/notificationStore';

const props = defineProps<{
  pageTitle: string;
}>();

const router = useRouter();
const userStore = useUserStore();
const notificationStore = useNotificationStore();

const showProfileMenu = ref(false);
const showNotificationsMenu = ref(false);

// Ajoute isMobile et la fonction de vérification
const isMobile = ref(false);
const checkMobile = () => { isMobile.value = window.innerWidth < 768; };

onMounted(() => {
  checkMobile();
  window.addEventListener('resize', checkMobile);
  window.addEventListener('click', closeMenus);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile);
  window.removeEventListener('click', closeMenus);
});

// Fonctions de bascule exclusives
const toggleNotifications = () => {
  showNotificationsMenu.value = !showNotificationsMenu.value;
  if (showNotificationsMenu.value) {
    showProfileMenu.value = false;
  }
};

const toggleProfile = () => {
  showProfileMenu.value = !showProfileMenu.value;
  if (showProfileMenu.value) {
    showNotificationsMenu.value = false;
  }
};

// On garde ta fonction closeMenus pour le clic extérieur
const closeMenus = (e: MouseEvent) => {
  const target = e.target as Element;
  if (!target.closest('.profile-dropdown')) showProfileMenu.value = false;
  if (!target.closest('.notification-dropdown')) showNotificationsMenu.value = false;
};

const notifications = computed(() => notificationStore.notifications);
const isLoadingNotifications = computed(() => notificationStore.loading);

const markSingleNotificationAsRead = (id: string) => notificationStore.markAsRead(id);
const deleteSingleNotification = (id: string) => notificationStore.deleteNotification(id);
const goToNotificationLink = (notification: any) => {
  if (notification.link) router.push(notification.link);
  notificationStore.markAsRead(notification._id);
  showNotificationsMenu.value = false;
};


onMounted(() => window.addEventListener('click', closeMenus));
onUnmounted(() => window.removeEventListener('click', closeMenus));

const userInitials = computed(() => {
  const name = userStore.user?.name || 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
});

const handleLogout = async () => {
  await userStore.logout();
  router.push('/login');
};
</script>
<template>
  <header class="h-16 md:h-24 bg-[#050505] px-4 md:px-10 flex items-center justify-between sticky top-0 z-50 w-full shrink-0 overflow-x-hidden min-w-0">
    
    <div class="flex items-center gap-3 md:gap-5 min-w-0 flex-1">
      <router-link to="/" class="md:hidden flex items-center justify-center w-8 h-8 shrink-0">
        <img 
          src="https://demotada.onrender.com/uploads/horns.png" 
          alt="Logo" 
          class="w-full h-full object-contain filter brightness-110"
        />
      </router-link>

      <div class="hidden md:block h-8 w-1.5 bg-[#E5E5D1] shadow-[0_0_20px_rgba(229,229,209,0.2)] rounded-full shrink-0"></div>
      
      <h1 class="flex-1 min-w-0 text-base md:text-xl font-black text-white tracking-tighter italic truncate pr-2">
        {{ pageTitle }}
      </h1>
    </div>

    <div class="flex items-center gap-2 md:gap-6 shrink-0 ml-auto">
      
      <div class="relative notification-dropdown shrink-0">
        <button 
          @click.stop="toggleNotifications"
          class="relative p-2 md:p-3 text-slate-500 hover:text-[#E5E5D1] hover:bg-white/5 rounded-xl md:rounded-2xl transition-all duration-300 shrink-0"
        >
          <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span 
            v-if="notificationStore.unreadCount > 0" 
            class="absolute top-2 right-2 md:top-3 md:right-3 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#E5E5D1] border-2 md:border-[3px] border-[#050505] rounded-full shadow-[0_0_10px_rgba(229,229,209,0.6)]"
          ></span>
        </button>

        <transition name="menu-fade">
          <div v-if="showNotificationsMenu" class="absolute right-0 mt-3 md:mt-4 w-[90vw] sm:w-[350px] md:w-[400px] max-w-[400px] bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden z-50 origin-top-right shrink-0">
            <div class="px-5 py-4 md:px-7 md:py-5 border-b border-white/5 flex justify-between items-center bg-[#E5E5D1]/5 min-w-0">
              <span class="text-sm md:text-base font-black text-white uppercase tracking-widest truncate flex-1 pr-2">Flux</span>
              <span v-if="notificationStore.unreadCount > 0" class="text-[9px] md:text-[10px] bg-[#E5E5D1] text-[#050505] px-2 md:px-2.5 py-1 rounded-full font-black uppercase tracking-tighter shrink-0">
                {{ notificationStore.unreadCount }} nouveaux
              </span>
            </div>

            <div class="max-h-[60vh] md:max-h-[450px] overflow-y-auto custom-scrollbar min-w-0">
              <div v-if="isLoadingNotifications" class="p-8 md:p-10 text-center text-slate-500 text-xs md:text-sm italic truncate">Analyse...</div>
              <div v-else-if="notifications.length === 0" class="p-8 md:p-10 text-center text-slate-500 text-xs md:text-sm italic truncate">Aucun mouvement.</div>
              
              <div v-else>
                <div
                  v-for="notification in notifications"
                  :key="notification._id"
                  @click="goToNotificationLink(notification)"
                  class="flex items-start gap-3 md:gap-4 px-4 py-4 md:px-7 md:py-5 border-b border-white/[0.03] hover:bg-white/[0.05] cursor-pointer transition-colors relative group min-w-0"
                  :class="{ 'bg-[#E5E5D1]/5': !notification.read }"
                >
                  <div class="shrink-0 mt-1">
                    <img v-if="notification.sender?.photo" :src="notification.sender.photo" class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl object-cover border border-[#E5E5D1]/20">
                    <div v-else class="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-[#E5E5D1]/10 flex items-center justify-center text-[#E5E5D1] shrink-0">
                      <span class="text-sm md:text-lg">🐑</span>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0 pr-6">
                    <p class="text-xs md:text-base leading-snug break-words" :class="{ 'text-white font-bold': !notification.read, 'text-slate-400': notification.read }">
                      {{ notification.message }}
                    </p>
                    <p class="text-[9px] md:text-[11px] text-slate-500 mt-1 md:mt-2 font-bold uppercase tracking-wider opacity-60 truncate">{{ new Date(notification.createdAt).toLocaleDateString() }}</p>
                  </div>

                  <div class="absolute right-2 top-4 flex flex-col gap-2 md:gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity bg-[#0A0A0A]/80 p-1 rounded-md shrink-0">
                    <button v-if="!notification.read" @click.stop="markSingleNotificationAsRead(notification._id)" class="text-[#E5E5D1] md:hover:scale-125 transition-transform p-1 md:p-0">
                      <svg class="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    </button>
                    <button @click.stop="deleteSingleNotification(notification._id)" class="text-red-900/50 hover:text-red-500 md:hover:scale-125 transition-transform p-1 md:p-0">
                      <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button @click="notificationStore.markAllAsRead()" class="w-full py-4 md:py-5 text-[9px] md:text-[11px] font-black text-slate-500 hover:text-[#E5E5D1] hover:bg-[#E5E5D1]/5 transition-all uppercase tracking-[0.3em] truncate shrink-0">
              Archiver le flux
            </button>
          </div>
        </transition>
      </div>

      <div class="w-[1px] h-6 md:h-8 bg-white/10 mx-1 md:mx-2 shrink-0"></div>

      <div class="relative profile-dropdown shrink-0">
        <button 
          @click.stop="toggleProfile"
          class="flex items-center gap-2 md:gap-4 p-1 md:pl-2 md:pr-5 md:py-2 rounded-xl md:rounded-2xl bg-transparent md:bg-white/5 border border-transparent md:border-white/10 md:hover:border-[#E5E5D1]/40 transition-all duration-300 group min-w-0 shrink-0"
        >
          <div class="h-8 w-8 md:h-11 md:w-11 rounded-lg md:rounded-xl ring-2 ring-[#E5E5D1]/10 ring-offset-2 md:ring-offset-4 ring-offset-[#050505] overflow-hidden bg-[#E5E5D1] flex items-center justify-center shadow-[0_0_15px_rgba(229,229,209,0.1)] shrink-0">
            <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" class="h-full w-full object-cover" />
            <span v-else class="text-xs md:text-sm font-black text-[#050505]">{{ userInitials }}</span>
          </div>
          
          <div class="hidden md:block text-left min-w-0">
            <p class="text-base font-black text-white leading-none mb-1 group-hover:text-[#E5E5D1] transition-colors truncate">{{ userStore.user?.name }}</p>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] opacity-80 italic truncate">{{ userStore.userRole }}</p>
          </div>

          <svg class="hidden md:block w-4 h-4 text-slate-600 group-hover:text-[#E5E5D1] transition-transform duration-500 shrink-0" :class="{ 'rotate-180': showProfileMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <transition name="menu-fade">
          <div v-if="showProfileMenu" class="absolute right-0 mt-3 md:mt-4 w-[85vw] max-w-[280px] md:w-72 md:max-w-none bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.9)] overflow-hidden z-50 origin-top-right shrink-0">
            <div class="p-5 md:p-6 border-b border-white/5 bg-gradient-to-b from-[#E5E5D1]/5 to-transparent text-left min-w-0">
              <p class="text-sm md:text-base font-black text-white mb-1 truncate uppercase italic">{{ userStore.user?.name || 'Utilisateur' }}</p>
              <p class="text-[10px] md:text-xs text-slate-500 truncate font-bold tracking-tight">{{ userStore.user?.email || 'email@exemple.com' }}</p>
            </div>
            <div class="p-2 md:p-3 min-w-0">
              <router-link to="/mon-compte" class="flex items-center gap-3 md:gap-4 px-3 py-3 md:px-4 md:py-4 text-sm md:text-base text-slate-400 hover:bg-[#E5E5D1]/10 hover:text-white rounded-xl md:rounded-2xl transition-all group min-w-0">
                <div class="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-white/5 group-hover:bg-[#E5E5D1]/20 text-[#E5E5D1] shrink-0">
                  <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span class="font-bold truncate">Paramètres</span>
              </router-link>
              
              <button @click="handleLogout" class="w-full mt-1 md:mt-2 flex items-center gap-3 md:gap-4 px-3 py-3 md:px-4 md:py-4 text-sm md:text-base text-red-900/80 hover:bg-red-500/10 hover:text-red-500 rounded-xl md:rounded-2xl transition-all group min-w-0">
                <div class="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-red-500/5 group-hover:bg-red-500/20 shrink-0">
                  <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span class="font-bold truncate">Quitter</span>
              </button>
            </div>
          </div>
        </transition>
      </div>

    </div>
  </header>
</template>

<style scoped>
/* Force les boutons de droite à garder leur place */
.shrink-0 {
  flex-shrink: 0 !important;
}

/* Assure la coupure propre du texte long pour le titre */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(229, 229, 209, 0.05);
  border-radius: 10px;
}
</style>
