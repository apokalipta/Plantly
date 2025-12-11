<template>
  <section class="section">
    <div class="container">
      <div class="row">
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card shadow border-0 p-4 h-100 text-center">
            <div class="mb-2"><i class="fa fa-archive" aria-hidden="true"></i></div>
            <h2 class="h5 mb-1">Nombre de pots</h2>
            <p class="display-4 mb-0">{{ potsCount }}</p>
          </div>
        </div>
        <div class="col-lg-4 col-md-6 mb-3">
          <div class="card shadow border-0 p-4 h-100 text-center">
            <div class="mb-2"><i class="fa fa-leaf" aria-hidden="true"></i></div>
            <h2 class="h5 mb-1">Nombre de plantes</h2>
            <p class="display-4 mb-0">{{ plantsCount }}</p>
          </div>
        </div>
        <div class="col-lg-4 col-md-12 mb-3">
          <div class="card shadow border-0 p-4 h-100 text-center">
            <div class="mb-2" :class="statusIconClass">
              <i :class="statusFaIcon" aria-hidden="true"></i>
            </div>
            <h2 class="h5 mb-1">Statut global</h2>
            <p class="mb-1" :class="statusTextClass">{{ globalStatusText }}</p>
            <p class="text-muted mb-0" style="font-size: .9rem;">Basé sur les statuts des pots</p>
          </div>
        </div>
      </div>

      <div class="row mt-4 align-items-stretch">
        <div class="col-md-6 col-lg-3 mb-3 d-flex">
          <div class="card shadow border-0 p-3 h-100 w-100 d-flex flex-column">
            <h2 class="h5">Mes pots</h2>
            <p class="text-muted">Aperçu rapide de vos pots connectés.</p>
            <router-link to="/pots" class="btn btn-primary btn-standard btn-block mt-auto">Voir mes pots</router-link>
          </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-3 d-flex">
          <div class="card shadow border-0 p-3 h-100 w-100 d-flex flex-column">
            <h2 class="h5">Wiki plantes</h2>
            <p class="text-muted">Explorez l’encyclopédie des espèces et conseils d’entretien.</p>
            <router-link to="/wiki" class="btn btn-success btn-standard btn-block mt-auto">Explorer</router-link>
          </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-3 d-flex">
          <div class="card shadow border-0 p-3 h-100 w-100 d-flex flex-column">
            <h2 class="h5">Succès</h2>
            <p class="text-muted">Suivez vos objectifs et progrès.</p>
            <router-link :to="{ name: 'achievements' }" class="btn btn-info btn-standard btn-block mt-auto">Voir mes succès</router-link>
          </div>
        </div>
        <div class="col-md-6 col-lg-3 mb-3 d-flex">
          <div class="card shadow border-0 p-3 h-100 w-100 d-flex flex-column">
            <h2 class="h5">Alertes</h2>
            <p class="text-muted">Surveillez les alertes et les actions requises.</p>
            <router-link :to="{ name: 'pots' }" class="btn btn-warning btn-standard btn-block mt-auto">Voir les alertes</router-link>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { usePotsStore } from '../stores/pots';
import { storeToRefs } from 'pinia';

const potsStore = usePotsStore();
const { pots } = storeToRefs(potsStore);

onMounted(() => { if (!Array.isArray(pots.value) || pots.value.length === 0) potsStore.fetchMyPots(); });

const potsCount = computed(() => (Array.isArray(pots.value) ? pots.value.length : 0));
const plantsCount = computed(() => {
  try {
    return (pots.value || []).reduce((acc, p) => acc + (p && p.plant ? 1 : 0), 0);
  } catch { return 0; }
});

const hasCritical = computed(() => (pots.value || []).some(p => String(p?.globalStatus) === 'CRITICAL'));
const hasWarning = computed(() => (pots.value || []).some(p => String(p?.globalStatus) === 'WARNING'));
const globalStatusText = computed(() => (hasCritical.value ? 'Critique' : hasWarning.value ? 'Attention' : 'OK'));
const statusTextClass = computed(() => (hasCritical.value ? 'text-danger' : hasWarning.value ? 'text-warning' : 'text-success'));
const statusFaIcon = computed(() => (hasCritical.value ? 'fa fa-exclamation-triangle' : hasWarning.value ? 'fa fa-exclamation-circle' : 'fa fa-check-circle'));
const statusIconClass = computed(() => (hasCritical.value ? 'text-danger' : hasWarning.value ? 'text-warning' : 'text-success'));
</script>
