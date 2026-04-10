import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import { useUserStore } from '../stores/user';

// --- PAGES AUTH (INDISPENSABLES) ---
import LoginPage from '../views/LoginPage.vue';
import RegisterPage from '../views/RegisterPage.vue';
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue';
import ResetPasswordPage from '../views/ResetPasswordPage.vue';
import AccountPage from '../views/AccountPage.vue';
import NotFoundPage from '../views/NotFoundPage.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/inscription',
      name: 'register',
      component: RegisterPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPasswordPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/reset-password/:token',
      name: 'reset-password',
      component: ResetPasswordPage,
      meta: { requiresAuth: false }
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('../components/OnboardingModal.vue'),
      meta: { requiresAuth: true }
    },
    // Signature publique (Accessibles sans compte)
    {
      path: '/sign/:token',
      name: 'public-signature',
      component: () => import('../views/SignaturePublicPage.vue'),
      meta: { requiresAuth: false }
    },

    // --- CŒUR DE L'APPLICATION (SOUS LAYOUT PRINCIPAL) ---
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      redirect: '/dashboard', 
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardMandataire.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/pipeline',
          name: 'Pipeline',
          component: () => import('../views/PipelineDossiers.vue'),
          meta: { requiresAuth: true }
        },
         {
          path: '/demo-cee',
          name: 'demo-cee',
          component: () => import('../views/MagicUploadDemo.vue'),
          meta: { requiresAuth: true }
        },
         {
          path: '/demo-ah',
          name: 'demo-ah',
          component: () => import('../views/AhGeneratorDemo.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/dossier/:id',
          name: 'dossier-detail',
          component: () => import('../views/DossierDetailPage.vue'),
          meta: { requiresAuth: true }
        },
        
        // --- GESTION ENTREPRISES & PARTENAIRES ---
        {
          path: '/entreprises',
          name: 'EntreprisesList',
          component: () => import('../views/EntreprisesList.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/entreprises/:id',
          name: 'EntrepriseDetail',
          component: () => import('../views/EntrepriseDetail.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/entreprises/:id/simulation',
          name: 'SimulationGamifiee',
          component: () => import('../views/SimulationView.vue'),
          meta: { requiresAuth: true }
        },

        // --- OUTILS MÉTIERS ---
        {
          path: '/liasses',
          name: 'LiassesGenerator',
          component: () => import('../views/LiassesGeneratorPage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/fiscal',
          name: 'FiscalVerification',
          component: () => import('../views/FiscalVerificationPage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/portail-oblige',
          name: 'ObligeePortal',
          component: () => import('../views/ObligeePortalPage.vue'),
          meta: { requiresAuth: true }
        },

        // --- EXPORT & COMPTABILITÉ EMMY ---
        {
          path: '/emmy-index',
          name: 'emmy-index',
          component: () => import('../views/EmmyIndexPage.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/emmy-export/:id',
          name: 'emmy-export',
          component: () => import('../views/EmmyExportPage.vue'),
          meta: { requiresAuth: true }
        },

        // --- ADMINISTRATION ---
        {
          path: '/admin/validation',
          name: 'ValidationPartenaires',
          component: () => import('../views/ValidationPartenaires.vue'),
          meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
          path: '/admin/tarifs',
          name: 'TarifsAdmin',
          component: () => import('../views/TarifsAdmin.vue'),
          meta: { requiresAuth: true, roles: ['admin'] }
        },
        {
          path: '/mon-compte',
          name: 'mon-compte',
          component: AccountPage,
          meta: { requiresAuth: true }
        }
      ]
    },

    // Page 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage
    }
  ]
});

// --- LOGIQUE DE NAVIGATION (GUARD) ---
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  
  // 1. Récupération du profil si token présent mais store vide
  if (userStore.authToken && !userStore.user.nom) {
    try {
      await userStore.fetchUserProfile();
    } catch (error) {
      userStore.logout();
      next({ name: 'login' });
      return;
    }
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isUserAuthenticated = userStore.isAuthenticated;

  // 2. Vérification Authentification
  if (requiresAuth && !isUserAuthenticated) {
    next({ name: 'login' });
    return;
  }

  // 3. Redirection automatique si déjà connecté (évite de retourner sur login)
  if (isUserAuthenticated && (to.name === 'login' || to.name === 'register')) {
    next({ name: 'dashboard' });
    return;
  }

  // 4. Onboarding (uniquement pour les non-admins)
  const isUserOnboarded = userStore.isUserOnboarded;
  const userRole = userStore.userRole;
  
  if (isUserAuthenticated && userRole !== 'admin' && !isUserOnboarded && to.name !== 'onboarding') {
    next({ name: 'onboarding' });
    return;
  }

  // 5. Vérification des rôles Admin
  const authorizedRoles = to.meta.roles;
  if (isUserAuthenticated && authorizedRoles && authorizedRoles.length > 0) {
    if (userRole === 'admin') {
      next();
    } else if (!authorizedRoles.includes(userRole)) {
      next({ name: 'dashboard' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;