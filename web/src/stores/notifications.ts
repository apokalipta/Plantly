import { defineStore } from 'pinia';
import * as forumApi from '../api/forumApi';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    items: [] as any[],
    loading: false,
    error: '' as string,
  }),
  actions: {
    async fetchNotifications(opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loading = true;
        this.error = '';
      }
      try {
        const data = await forumApi.listNotifications();
        this.items = Array.isArray(data) ? data : [];
      } catch (e: any) {
        if (!silent) this.error = e?.message || 'Erreur lors du chargement des notifications';
      } finally {
        if (!silent) this.loading = false;
      }
    },
  },
});

