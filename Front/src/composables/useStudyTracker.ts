import { onMounted, onUnmounted, ref } from 'vue';
import api from '/services/api';

export function useStudyTracker(
  sessionId: string | (() => string), 
  pageType: 'live' | 'elearning' | 'classe'
) {
  const isTracking = ref(false);
  let sessionStartTime = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  const SAFETY_INTERVAL_MS = 60000; 

  // 1. LE CACHE : On sauvegarde l'ID pour ne pas le perdre si l'élève change de route
  let cachedSessionId = '';
  const getSessionId = () => {
    const id = typeof sessionId === 'function' ? sessionId() : sessionId;
    if (id) cachedSessionId = id;
    return id || cachedSessionId;
  };

  const sendAccumulatedTime = (isTabClosing = false) => {
    if (!isTracking.value || sessionStartTime === 0) return;

    const now = Date.now();
    const elapsedSeconds = Math.floor((now - sessionStartTime) / 1000);

    if (elapsedSeconds < 1) return; 

    // Arrondi Qualiopi : 1 sec = 60 sec (1 min), 65 sec = 120 sec (2 min)
    const secondsToSend = Math.ceil(elapsedSeconds / 60) * 60;

    const id = getSessionId();
    if (!id) return;

    const payload = {
      sessionId: id,
      pingIntervalSeconds: secondsToSend,
      pageType
    };

    if (isTabClosing) {
      // 2. FERMETURE RÉELLE (La croix rouge du navigateur)
      // On recompose l'URL complète du backend pour que fetch ne se perde pas
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const baseUrl = api.defaults?.baseURL || import.meta.env.VITE_API_URL || '';
      const targetUrl = `${baseUrl.replace(/\/$/, '')}/api/tracking/ping`;

      try {
        fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {}); // Erreur silencieuse assumée en fermeture de fenêtre
      } catch (e) {}
    } else {
      // 3. NAVIGATION INTERNE (L'élève navigue de page en page sur ton site)
      // Axios prend le relais : il a déjà la bonne URL (Render) et le bon Token injecté !
      api.post('/api/tracking/ping', payload).catch(e => console.error('Erreur Tracker:', e));
    }

    sessionStartTime = Date.now();
  };

  const startTracking = () => {
    if (isTracking.value) return;
    isTracking.value = true;
    sessionStartTime = Date.now();
    intervalId = setInterval(() => sendAccumulatedTime(false), SAFETY_INTERVAL_MS);
  };

  const stopTracking = (isTabClosing = false) => {
    if (!isTracking.value) return;
    sendAccumulatedTime(isTabClosing);
    isTracking.value = false;
    sessionStartTime = 0;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) stopTracking(false);
    else startTracking();
  };

  const handleBeforeUnload = () => {
    stopTracking(true); // Vraie fermeture de l'onglet
  };

  onMounted(() => {
    // Initialise le cache de l'ID dès le montage de la page
    getSessionId();
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    startTracking();
  });

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    
    stopTracking(false); 
  });

  return { isTracking, startTracking, stopTracking };
}