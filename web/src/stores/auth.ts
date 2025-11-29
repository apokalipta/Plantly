import { defineStore } from 'pinia';
import * as authApi from '../api/authApi';

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
      const res = await authApi.register({ email, password });
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
