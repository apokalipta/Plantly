import { defineStore } from 'pinia';
import * as basesApi from '../api/basesApi';

export const useBasesStore = defineStore('bases', {
  state: () => ({
    bases: [] as any[],
    selectedBase: null as any | null,
    selectedSlotIndex: 1 as number,
    loading: false,
    error: null as string | null,
    measurements: [] as any[],
    loadingMeasurements: false,
    errorMeasurements: null as string | null,
  }),
  actions: {
    async pairBase(pairingCode: string, name?: string) {
      this.loading = true;
      this.error = null;
      try {
        await basesApi.pairBase({ pairingCode, name });
        const data = await basesApi.getMyBases();
        this.bases = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors de l’appairage de la base';
      } finally {
        this.loading = false;
      }
    },
    async fetchMyBases(opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loading = true;
        this.error = null;
      }
      try {
        const data = await basesApi.getMyBases();
        this.bases = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        if (!silent) {
          this.error = e?.message || 'Erreur lors du chargement des bases';
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },
    async fetchBaseById(id: string, opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loading = true;
        this.error = null;
      }
      try {
        const data = await basesApi.getBaseDetails(id);
        this.selectedBase = data || null;
        const exists = (this.selectedBase?.slots || []).some((s: any) => s.slotIndex === this.selectedSlotIndex);
        if (!exists) this.selectedSlotIndex = 1;
      } catch (e: any) {
        console.error(e);
        if (!silent) {
          this.error = e?.message || 'Erreur lors du chargement de la base';
        }
      } finally {
        if (!silent) {
          this.loading = false;
        }
      }
    },
    async reconfigureSlots(id: string, slots: Array<{ slotIndex: number; potFormat: 'SMALL' | 'MEDIUM' | 'LARGE'; isActive: boolean }>) {
      this.loading = true;
      this.error = null;
      try {
        await basesApi.patchSlots(id, slots);
        await this.fetchBaseById(id);
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Configuration invalide';
      } finally {
        this.loading = false;
      }
    },
    async changeSlotPlant(id: string, slotIndex: number, payload: { speciesId: number; nickname?: string }) {
      this.loading = true;
      this.error = null;
      try {
        await basesApi.patchSlotPlant(id, slotIndex, payload);
        await this.fetchBaseById(id);
      } catch (e: any) {
        console.error(e);
        this.error = e?.message || 'Erreur lors du changement de plante';
      } finally {
        this.loading = false;
      }
    },
    async fetchSlotMeasurements(id: string, slotIndex: number, limit: number = 50, opts?: { silent?: boolean }) {
      const silent = !!opts?.silent;
      if (!silent) {
        this.loadingMeasurements = true;
        this.errorMeasurements = null;
      }
      try {
        const data = await basesApi.getSlotMeasurements(id, slotIndex, limit);
        this.measurements = Array.isArray(data) ? data : [];
      } catch (e: any) {
        console.error(e);
        if (!silent) {
          this.errorMeasurements = e?.message || 'Erreur lors du chargement des mesures du slot';
        }
      } finally {
        if (!silent) {
          this.loadingMeasurements = false;
        }
      }
    },
    selectSlot(index: number) {
      this.selectedSlotIndex = index;
    },
  },
});
