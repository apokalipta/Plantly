import { defineStore } from 'pinia';
import * as authApi from '../api/authApi';
// Intention: Store Pinia pour l’authentification (tokens et email utilisateur)
// Objectif: Encapsuler les actions login/register/logout et l’état d’auth
// Logique: Persistance locale des jetons, getters pour isAuthenticated

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    userEmail: null as string | null,
  }),
  getters: {
    isAuthenticated: (s) => !!s.accessToken,
  },
  actions: {
    initFromStorage() {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      this.userEmail = localStorage.getItem('userEmail');
    },
    async login(email: string, password: string) {
      const res = await authApi.login({ email, password });
      this.accessToken = res.accessToken;
      this.refreshToken = res.refreshToken;
      this.userEmail = email;
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('userEmail', email);
    },
    async register(email: string, password: string) {
      const res = await authApi.register({ email, password, username: `user-${Math.random().toString(36).slice(2,8)}` });
      this.accessToken = res.accessToken;
      this.refreshToken = res.refreshToken;
      this.userEmail = email;
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('userEmail', email);
    },
    async registerWithUsername(email: string, password: string, username: string) {
      const res = await authApi.register({ email, password, username });
      this.accessToken = res.accessToken;
      this.refreshToken = res.refreshToken;
      this.userEmail = email;
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      localStorage.setItem('userEmail', email);
    },
    async logout() {
      try { await authApi.logout(); } catch {}
      this.accessToken = null;
      this.refreshToken = null;
      this.userEmail = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userEmail');
    },
  },
});
