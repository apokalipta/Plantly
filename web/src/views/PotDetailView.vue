<template>
  <section class="mk-container">
    <a href="#" @click.prevent="goBack" class="muted" style="display:inline-block; margin-bottom:0.5rem">← Retour</a>
    <div class="mk-card">
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" style="color:#ef4444">{{ error }}</div>
      <div v-else-if="pot">
        <h1>{{ pot.name || 'Pot' }}</h1>
        <div style="margin-top:1rem">
          <h3>Statut</h3>
          <p class="muted">Statut global: {{ pot.globalStatus }}</p>
          <p class="muted">Dernière activité: {{ formatDate(pot.lastSeenAt) }}</p>
        </div>
        <div style="margin-top:1rem">
          <h3>Plante</h3>
          <p class="muted">Surnom: {{ pot.plant?.nickname || '—' }}</p>
          <p class="muted">Espèce: {{ speciesName(pot.plant) }}</p>
          <router-link :to="{ name: 'new-plant', params: { id: potId } }"><button class="btn" style="margin-top:0.5rem">Changer / ajouter une plante</button></router-link>
        </div>
        <div style="margin-top:1rem">
          <h3>Dernière mesure</h3>
          <p class="muted">Horodatage: {{ formatDate(pot.latestMeasurement?.timestamp) }}</p>
          <p class="muted">Humidité: {{ pot.latestMeasurement?.soilMoisture ?? '—' }}</p>
          <p class="muted">Lumière: {{ pot.latestMeasurement?.lightLevel ?? '—' }}</p>
          <p class="muted">Température: {{ pot.latestMeasurement?.temperature ?? '—' }}</p>
        </div>
        <section class="mk-card" style="margin-top: 1.5rem;">
          <h2>Historique des mesures</h2>
          <p class="muted">Dernières valeurs d'humidité du sol.</p>
          <div v-if="loadingMeasurements">Chargement des mesures…</div>
          <div v-else-if="errorMeasurements" style="color:#ef4444">{{ errorMeasurements }}</div>
          <MeasurementsChart v-else :measurements="measurements" />
        </section>
        <section class="mk-card" style="margin-top: 1.5rem;">
          <h2>Alertes</h2>
          <p class="muted">Problèmes détectés sur ce pot.</p>

          <div v-if="loadingAlerts">Chargement des alertes…</div>
          <div v-else-if="alertsError" style="color:#ef4444">{{ alertsError }}</div>
          <div v-else>
            <p v-if="alerts.length === 0">Aucune alerte en cours pour ce pot.</p>
            <ul v-else class="alerts-list">
              <li v-for="alert in alerts" :key="alert.id" class="alert-item">
                <div class="alert-header">
                  <span class="alert-type">{{ alert.type || 'ALERTE' }}</span>
                  <span class="alert-badge" :class="{ 'alert-badge--critical': alert.severity === 'CRITICAL', 'alert-badge--warning': alert.severity === 'WARNING' }">
                    {{ alert.severity }}
                  </span>
                </div>
                <div class="alert-body">
                  <small>Créée le {{ formatDate(alert.createdAt) }}</small>
                  <small v-if="alert.resolvedAt">Résolue le {{ formatDate(alert.resolvedAt) }}</small>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { usePotsStore } from '../stores/pots';
import { getPotMeasurements } from '../api/potsApi';
import MeasurementsChart from '@/components/MeasurementsChart.vue';
import { getPotAlerts } from '@/api/alertsApi';

const route = useRoute();
const router = useRouter();
const potsStore = usePotsStore();
const potId = computed(() => String(route.params.id || ''));

onMounted(() => {
  if (potId.value) {
    potsStore.fetchPotById(potId.value);
    loadMeasurements(potId.value);
    loadAlerts(potId.value);
  }
});

onBeforeRouteUpdate((to) => {
  const id = String(to.params.id || '');
  if (id) {
    potsStore.fetchPotById(id);
    loadMeasurements(id);
    loadAlerts(id);
  }
});

function goBack() { router.push({ name: 'pots' }); }

function formatDate(d) { try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; } }
function speciesName(plant) { return plant?.speciesName || plant?.speciesId || '—'; }

const pot = computed(() => potsStore.selectedPot);
const loading = computed(() => potsStore.loading);
const error = computed(() => potsStore.error);

const measurements = ref([]);
const loadingMeasurements = ref(false);
const errorMeasurements = ref(null);

const alerts = ref([]);
const loadingAlerts = ref(false);
const alertsError = ref(null);

async function loadMeasurements(id) {
  loadingMeasurements.value = true;
  errorMeasurements.value = null;
  try {
    measurements.value = await getPotMeasurements(id, 50);
  } catch (e) {
    console.error(e);
    errorMeasurements.value = 'Erreur lors du chargement des mesures';
  } finally {
    loadingMeasurements.value = false;
  }
}

async function loadAlerts(id) {
  loadingAlerts.value = true;
  alertsError.value = null;
  try {
    alerts.value = await getPotAlerts(id, true);
  } catch (e) {
    console.error(e);
    alertsError.value = 'Erreur lors du chargement des alertes.';
  } finally {
    loadingAlerts.value = false;
  }
}
</script>
