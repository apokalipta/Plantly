import { defineStore } from "pinia";
import bootstrap from "bootstrap/dist/js/bootstrap.min.js";
// Intention: Exposer des dépendances globales côté UI (ex: Bootstrap)
// Objectif: Éviter les imports redondants et centraliser l’accès
// Logique: Stocker l’instance bootstrap pour usage dans des composants utilitaires
export const useAppStore = defineStore("storeId", {
  state: () => ({
    bootstrap,
  }),
});
