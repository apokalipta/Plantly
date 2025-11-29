import { defineStore } from 'pinia';
import * as wikiApi from '../api/wikiApi';

export const useWikiStore = defineStore('wiki', {
  state: () => ({
    plants: [] as any[],
    selectedPlant: null as any | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchPlants(search: string = '') {
      this.loading = true;
      this.error = null;
      try {
        const data = await wikiApi.getPlants(search);
        this.plants = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors du chargement du wiki';
      } finally {
        this.loading = false;
      }
    },
    async fetchPlantById(id: string | number) {
      this.loading = true;
      this.error = null;
      try {
        const data = await wikiApi.getPlantById(id);
        this.selectedPlant = data || null;
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors du chargement de la fiche';
      } finally {
        this.loading = false;
      }
    },
  },
});

