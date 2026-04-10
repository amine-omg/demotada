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