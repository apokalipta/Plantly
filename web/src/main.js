import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router/index.ts';
import App from './App.vue';
// Argon styles are loaded via CDN in index.html; remove old global styles
import { useAuthStore } from './stores/auth';
// Intention: Initialiser l’application Vue (Pinia + Router) et l’état d’auth
// Objectif: Restaurer les jetons depuis le storage dès le démarrage
// Logique: Créer l’app, enregistrer Pinia/Router, puis initFromStorage avant mount

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
const auth = useAuthStore();
auth.initFromStorage();
app.mount('#app');
