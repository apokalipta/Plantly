import { defineStore } from 'pinia';
import * as achievementsApi from '../api/achievementsApi';
// Intention: Store Pinia pour charger et exposer les succès utilisateur
// Objectif: Gérer l’état de chargement/erreur et normaliser les données
// Logique: Appel API unique et affectation sécurisée avec Array.isArray

export const useAchievementsStore = defineStore('achievements', {
  state: () => ({
    achievements: [] as any[],
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchMyAchievements() {
      this.loading = true;
      this.error = null;
      try {
        const data = await achievementsApi.getMyAchievements();
        this.achievements = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors du chargement des succès';
      } finally {
        this.loading = false;
      }
    },
  },
});
