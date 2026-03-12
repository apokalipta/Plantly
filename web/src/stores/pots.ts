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
    async fetchMyPots(opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loading = true;
        this.error = null;
      }
      try {
        const data = await potsApi.getMyPots();
        this.pots = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        if (!silent) {
          this.error = e?.message || 'Erreur lors du chargement des pots';
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },
    async fetchPotById(id: string, opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loading = true;
        this.error = null;
      }
      try {
        const data = await potsApi.getPotDetails(id);
        this.selectedPot = data || null;
      } catch (e: any) {
        console.error(e);
        if (!silent) {
          this.error = e?.message || 'Erreur lors du chargement du pot';
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },
    async deletePot(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await potsApi.deletePot(id);
        this.pots = this.pots.filter((p) => p?.id !== id);
        if (this.selectedPot?.id === id) {
          this.selectedPot = null;
        }
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors de la suppression du pot';
        throw e;
      } finally {
        this.loading = false;
      }
    },
  },
});
// Intention: Store Pinia pour gérer la liste et les détails des pots
// Objectif: Centraliser les appels et l’état (chargement, erreurs)
// Logique: Méthodes asynchrones appelant potsApi avec gestion d’erreurs
