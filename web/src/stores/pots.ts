import { defineStore } from 'pinia';
import * as potsApi from '../api/potsApi';

export const usePotsStore = defineStore('pots', {
  state: () => ({
    pots: [] as any[],
    selectedPot: null as any | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchMyPots() {
      this.loading = true;
      this.error = null;
      try {
        const data = await potsApi.getMyPots();
        this.pots = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors du chargement des pots';
      } finally {
        this.loading = false;
      }
    },
    async fetchPotById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const data = await potsApi.getPotDetails(id);
        this.selectedPot = data || null;
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors du chargement du pot';
      } finally {
        this.loading = false;
      }
    },
  },
});

