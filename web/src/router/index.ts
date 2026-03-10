import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '../stores/auth';
// Intention: Définir les routes et protéger celles nécessitant une authentification
// Objectif: Rediriger vers /login lorsque l’utilisateur n’est pas authentifié
// Logique: Liste de noms protégés et guard global beforeEach avec redirect

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/pots', name: 'pots', component: () => import('../views/MyPotsView.vue') },
  { path: '/pots/new', name: 'new-pot', component: () => import('../views/NewPotView.vue') },
  { path: '/pots/:id', name: 'pot-detail', component: () => import('../views/PotDetailView.vue') },
  { path: '/pots/:id/new-plant', name: 'new-plant', component: () => import('../views/NewPlantView.vue') },
  { path: '/bases', name: 'bases', component: () => import('../views/BasesListView.vue') },
  { path: '/bases/:id', name: 'base-detail', component: () => import('../views/BaseDetailView.vue') },
  { path: '/wiki', name: 'wiki', component: () => import('../views/PlantWikiListView.vue') },
  { path: '/wiki/:id', name: 'wiki-detail', component: () => import('../views/PlantWikiDetailView.vue') },
  { path: '/tutorials', name: 'tutorials', component: () => import('../views/TutorialsView.vue') },
  { path: '/scan', name: 'scan', component: () => import('../views/PlantScanView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/UserProfileView.vue') },
  { path: '/profile/achievements', name: 'achievements', component: () => import('../views/AchievementsView.vue') },
  { path: '/profile/history', name: 'history', component: () => import('../views/HistoryView.vue') },
  { path: '/settings', name: 'settings', component: () => import('../views/SettingsView.vue') },
  { path: '/settings/notifications', name: 'settings-notifications', component: () => import('../views/NotificationSettingsView.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const protectedNames = new Set([
  'pots', 'new-pot', 'pot-detail', 'new-plant',
  'bases', 'base-detail',
  'profile', 'achievements', 'history', 'settings', 'settings-notifications',
]);

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (protectedNames.has(String(to.name)) && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  return true;
});

export default router;
