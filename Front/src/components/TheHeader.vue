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
  <header class="h-24 bg-[#050505] px-10 flex items-center justify-between sticky top-0 z-50">
    
    <div class="flex items-center gap-5">
      <div class="h-8 w-1.5 bg-[#E5E5D1] shadow-[0_0_20px_rgba(229,229,209,0.2)] rounded-full"></div>
      <h1 class="text-xl font-black text-white tracking-tighter italic">
        {{ pageTitle }}
      </h1>
    </div>

    <div class="flex items-center gap-6">
      
      <div class="relative notification-dropdown">
        <button 
          @click.stop="toggleNotifications"
          class="relative p-3 text-slate-500 hover:text-[#E5E5D1] hover:bg-white/5 rounded-2xl transition-all duration-300"
        >
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span 
            v-if="notificationStore.unreadCount > 0" 
            class="absolute top-3 right-3 w-3 h-3 bg-[#E5E5D1] border-[3px] border-[#050505] rounded-full shadow-[0_0_10px_rgba(229,229,209,0.6)]"
          ></span>
        </button>

        <transition name="menu-fade">
          <div v-if="showNotificationsMenu" class="absolute right-0 mt-4 w-[400px] bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50">
            <div class="px-7 py-5 border-b border-white/5 flex justify-between items-center bg-[#E5E5D1]/5">
              <span class="text-base font-black text-white uppercase tracking-widest">Flux</span>
              <span v-if="notificationStore.unreadCount > 0" class="text-[10px] bg-[#E5E5D1] text-[#050505] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter">
                {{ notificationStore.unreadCount }} nouveaux
              </span>
            </div>

            <div class="max-h-[450px] overflow-y-auto custom-scrollbar">
              <div v-if="isLoadingNotifications" class="p-10 text-center text-slate-500 text-sm italic">Analyse en cours...</div>
              <div v-else-if="notifications.length === 0" class="p-10 text-center text-slate-500 text-sm italic">Aucun mouvement.</div>
              
              <div v-else>
                <div
                  v-for="notification in notifications"
                  :key="notification._id"
                  @click="goToNotificationLink(notification)"
                  class="flex items-start gap-4 px-7 py-5 border-b border-white/[0.03] hover:bg-white/[0.05] cursor-pointer transition-colors relative group"
                  :class="{ 'bg-[#E5E5D1]/5': !notification.read }"
                >
                  <div class="flex-shrink-0 mt-1">
                    <img v-if="notification.sender?.photo" :src="notification.sender.photo" class="w-10 h-10 rounded-xl object-cover border border-[#E5E5D1]/20">
                    <div v-else class="w-10 h-10 rounded-xl bg-[#E5E5D1]/10 flex items-center justify-center text-[#E5E5D1]">
                      <span class="text-lg">🐑</span>
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <p class="text-base leading-snug" :class="{ 'text-white font-bold': !notification.read, 'text-slate-400': notification.read }">
                      {{ notification.message }}
                    </p>
                    <p class="text-[11px] text-slate-500 mt-2 font-bold uppercase tracking-wider opacity-60">{{ new Date(notification.createdAt).toLocaleDateString() }}</p>
                  </div>

                  <div class="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button v-if="!notification.read" @click.stop="markSingleNotificationAsRead(notification._id)" class="text-[#E5E5D1] hover:scale-125 transition-transform">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                    </button>
                    <button @click.stop="deleteSingleNotification(notification._id)" class="text-red-900/50 hover:text-red-500 hover:scale-125 transition-transform">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button @click="notificationStore.markAllAsRead()" class="w-full py-5 text-[11px] font-black text-slate-500 hover:text-[#E5E5D1] hover:bg-[#E5E5D1]/5 transition-all uppercase tracking-[0.3em]">
              Archiver tout le flux
            </button>
          </div>
        </transition>
      </div>

      <div class="w-[1px] h-8 bg-white/5 mx-2"></div>

      <div class="relative profile-dropdown">
        <button 
          @click.stop="toggleProfile"
          class="flex items-center gap-4 pl-2 pr-5 py-2 rounded-2xl bg-white/5 border border-white/10 hover:border-[#E5E5D1]/40 transition-all duration-300 group"
        >
          <div class="h-11 w-11 rounded-xl ring-2 ring-[#E5E5D1]/10 ring-offset-4 ring-offset-[#050505] overflow-hidden bg-[#E5E5D1] flex items-center justify-center shadow-[0_0_25px_rgba(229,229,209,0.1)]">
            <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" class="h-full w-full object-cover" />
            <span v-else class="text-sm font-black text-[#050505]">{{ userInitials }}</span>
          </div>
          
          <div class="hidden md:block text-left">
            <p class="text-base font-black text-white leading-none mb-1 group-hover:text-[#E5E5D1] transition-colors">{{ userStore.user?.name }}</p>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] opacity-80 italic">{{ userStore.userRole }}</p>
          </div>

          <svg class="w-4 h-4 text-slate-600 group-hover:text-[#E5E5D1] transition-transform duration-500" :class="{ 'rotate-180': showProfileMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <transition name="menu-fade">
          <div v-if="showProfileMenu" class="absolute right-0 mt-4 w-72 bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50">
            <div class="p-6 border-b border-white/5 bg-gradient-to-b from-[#E5E5D1]/5 to-transparent">
              <p class="text-base font-black text-white mb-1 truncate uppercase italic">{{ userStore.user?.name }}</p>
              <p class="text-xs text-slate-500 truncate font-bold tracking-tight">{{ userStore.user?.email }}</p>
            </div>
            <div class="p-3">
              <router-link to="/mon-compte" class="flex items-center gap-4 px-4 py-4 text-base text-slate-400 hover:bg-[#E5E5D1]/10 hover:text-white rounded-2xl transition-all group">
                <div class="p-2.5 rounded-xl bg-white/5 group-hover:bg-[#E5E5D1]/20 text-[#E5E5D1]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span class="font-bold">Paramètres</span>
              </router-link>
              
              <button @click="handleLogout" class="w-full mt-2 flex items-center gap-4 px-4 py-4 text-base text-red-900/80 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all group">
                <div class="p-2.5 rounded-xl bg-red-500/5 group-hover:bg-red-500/20">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                </div>
                <span class="font-bold">Quitter</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.menu-fade-enter-active, .menu-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-fade-enter-from, .menu-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
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