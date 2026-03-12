<template>
  <section class="section" v-if="auth.isAuthenticated">
    <div class="container">
      <h1 class="mb-3">Mon Espace Plantly</h1>
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

      <div class="row mt-4">
        <div class="col-12">
          <div class="card shadow border-0 p-4">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <h2 class="h5 mb-0">Notifications</h2>
              <button class="btn btn-sm btn-outline-secondary btn-standard" @click="refreshNotifications" :disabled="notificationsStore.loading">
                Actualiser
              </button>
            </div>

            <div v-if="notificationsStore.loading" class="text-muted">Chargement…</div>
            <div v-else-if="notificationsStore.error" class="alert alert-danger mb-0">{{ notificationsStore.error }}</div>
            <div v-else-if="notifications.length === 0" class="text-muted">Aucune notification.</div>
            <div v-else class="d-flex flex-column gap-2">
              <div v-for="n in notifications" :key="n.id" class="d-flex justify-content-between gap-2">
                <div>
                  <div class="fw-semibold">{{ n.message }}</div>
                  <div class="text-muted" style="font-size:.85rem;">{{ formatNotifDate(n.createdAt) }}</div>
                </div>
                <div class="text-muted" style="font-size:.85rem;">{{ n.type }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { usePotsStore } from '../stores/pots';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';
import { useNotificationsStore } from '../stores/notifications';

const potsStore = usePotsStore();
const auth = useAuthStore();
const { pots } = storeToRefs(potsStore);
const notificationsStore = useNotificationsStore();
const { items: notifications } = storeToRefs(notificationsStore);

onMounted(() => {
  if (auth.isAuthenticated && (!Array.isArray(pots.value) || pots.value.length === 0)) {
    potsStore.fetchMyPots();
  }
  if (auth.isAuthenticated && (!Array.isArray(notifications.value) || notifications.value.length === 0)) {
    notificationsStore.fetchNotifications();
  }
});

const potsCount = computed(() => (Array.isArray(pots.value) ? pots.value.length : 0));
const plantsCount = computed(() => {
  try {
    return (pots.value || []).reduce((acc, p) => acc + (p && p.plant ? 1 : 0), 0);
  } catch { return 0; }
});

const hasBad = computed(() => (pots.value || []).some((p) => String(p?.globalStatus) === 'BAD'));
const hasOffline = computed(() => (pots.value || []).some((p) => String(p?.globalStatus) === 'OFFLINE'));
const hasActionRequired = computed(() => (pots.value || []).some((p) => String(p?.globalStatus) === 'ACTION_REQUIRED'));
const globalStatusText = computed(() => (hasBad.value ? 'Critique' : hasOffline.value ? 'Hors ligne' : hasActionRequired.value ? 'Attention' : 'OK'));
const statusTextClass = computed(() => (hasBad.value ? 'text-danger' : hasOffline.value ? 'text-secondary' : hasActionRequired.value ? 'text-warning' : 'text-success'));
const statusFaIcon = computed(() => (hasBad.value ? 'fa fa-exclamation-triangle' : hasOffline.value ? 'fa fa-times-circle' : hasActionRequired.value ? 'fa fa-exclamation-circle' : 'fa fa-check-circle'));
const statusIconClass = computed(() => (hasBad.value ? 'text-danger' : hasOffline.value ? 'text-secondary' : hasActionRequired.value ? 'text-warning' : 'text-success'));

function refreshNotifications() {
  if (!auth.isAuthenticated) return;
  notificationsStore.fetchNotifications();
}

function formatNotifDate(d) {
  const dt = d ? new Date(d) : null;
  if (!dt || Number.isNaN(dt.getTime())) return '';
  try {
    return dt.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dt.toISOString();
  }
}
</script>
