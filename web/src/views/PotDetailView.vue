<template>
  <section class="section">
    <div class="container">
      <a href="#" @click.prevent="goBack" class="text-muted d-inline-block mb-2">← Retour</a>
      <div class="card card-static shadow border-0 p-3">
        <div v-if="loading">Chargement…</div>
        <div v-else-if="error" class="text-danger">{{ error }}</div>
        <div v-else-if="pot">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h1 class="mb-0">{{ pot.name || 'Pot' }}</h1>
            <button class="btn btn-outline-danger btn-standard" :disabled="deletingPot" @click="onDeletePot">Supprimer</button>
          </div>
          <div v-if="deleteError" class="text-danger mb-3">{{ deleteError }}</div>
          <section class="card shadow border-0 p-3 mb-3">
            <h2 class="h5">Alertes</h2>
            <p class="text-muted">Problèmes détectés sur ce pot.</p>
            <div v-if="loadingAlerts">Chargement des alertes…</div>
            <div v-else-if="alertsError" class="text-danger">{{ alertsError }}</div>
            <div v-else>
              <p v-if="alerts.length === 0">Aucune alerte en cours pour ce pot.</p>
              <ul v-else class="list-group">
                <li v-for="alert in alerts" :key="alert.id" class="list-group-item d-flex justify-content-between align-items-center">
                  <span>{{ formatAlertType(alert.type) }}</span>
                  <span class="badge" :class="severityBadgeClass(alert.severity)">{{ formatSeverity(alert.severity) }}</span>
                </li>
              </ul>
            </div>
          </section>
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card shadow border-0 p-3 h-100">
                <h3 class="h5">Statut</h3>
                <p class="text-muted mb-1">
                  Statut global:
                  <span class="badge" :class="globalStatusBadgeClass">{{ globalStatusLabel }}</span>
                </p>
                <p class="text-muted">Dernière activité: {{ formatDate(pot.lastSeenAt) }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card shadow border-0 p-3 h-100">
                <h3 class="h5">Plante</h3>
                <template v-if="pot.plant">
                  <p class="text-muted mb-1">Surnom: {{ pot.plant?.nickname || '—' }}</p>
                  <p class="text-muted mb-1">
                    Espèce:
                    <span v-if="speciesInfo?.commonName">{{ speciesInfo.commonName }}</span>
                    <span v-else>{{ speciesName(pot.plant) }}</span>
                    <span v-if="speciesInfo?.latinName" class="text-muted"> (<i>{{ speciesInfo.latinName }}</i>)</span>
                  </p>
                  <div v-if="speciesInfo?.care" class="mt-2">
                    <p class="text-muted mb-1">Arrosage: toutes {{ speciesInfo.care.wateringIntervalDays }} jours</p>
                  </div>
                </template>
                <template v-else>
                  <p class="text-muted">Aucune plante associée à ce pot.</p>
                </template>
                <button class="btn btn-outline-primary btn-standard mt-2" @click="openPlantActions">Changer / Enlever une plante</button>
              </div>
            </div>
          </div>

          <div class="card shadow border-0 p-3 mb-3">
            <h3 class="h5">Dernière mesure</h3>
            <p class="text-muted mb-3">Horodatage: {{ formatDate(pot.latestMeasurement?.timestamp) }}</p>
            <div class="row">
              <div class="col-md-3">
                <p class="text-muted mb-1">Humidité</p>
                <p class="mb-1">{{ moistureValue }}<span v-if="moistureValue !== '—'">%</span></p>
                <small v-if="moistureRangeParts" class="text-muted">
                  {{ moistureRangeParts.left }} &lt; <span :class="moistureStatus.class || 'text-muted'">{{ moistureRangeParts.mid }}</span> &lt; {{ moistureRangeParts.right }}
                </small>
              </div>
              <div class="col-md-3">
                <p class="text-muted mb-1">Lumière</p>
                <p class="mb-1">{{ lightValue }}</p>
                <small v-if="lightRangeParts" class="text-muted">
                  {{ lightRangeParts.left }} &lt; <span :class="lightStatus.class || 'text-muted'">{{ lightRangeParts.mid }}</span> &lt; {{ lightRangeParts.right }}
                </small>
              </div>
              <div class="col-md-3">
                <p class="text-muted mb-1">Température</p>
                <p class="mb-1">{{ temperatureValue }}<span v-if="temperatureValue !== '—'">°C</span></p>
                <small v-if="temperatureRangeParts" class="text-muted">
                  {{ temperatureRangeParts.left }} &lt; <span :class="temperatureStatus.class || 'text-muted'">{{ temperatureRangeParts.mid }}</span> &lt; {{ temperatureRangeParts.right }}
                </small>
              </div>
              <div class="col-md-3">
                <p class="text-muted mb-1">Humidité de l’air</p>
                <p class="mb-1">{{ airHumidityValue }}<span v-if="airHumidityValue !== '—'">%</span></p>
              </div>
            </div>
          </div>

          <section class="card shadow border-0 p-3 mb-3">
            <h2 class="h5">Historique des mesures</h2>
            <p class="text-muted">Dernières valeurs d'humidité du sol.</p>
            <div v-if="loadingMeasurements">Chargement des mesures…</div>
            <div v-else-if="errorMeasurements" class="text-danger">{{ errorMeasurements }}</div>
            <MeasurementsChart v-else :measurements="measurements" />
          </section>

          <div v-if="showPlantActions" class="modal-overlay">
            <div class="card card-static shadow border-0 p-4 modal-card">
              <h3 class="mb-3">Action sur la plante</h3>
              <p class="text-muted mb-3">Choisissez une action pour la plante associée à ce pot.</p>
              <div v-if="!confirmingRemove" class="modal-actions mb-2">
                <button class="btn btn-primary btn-standard" @click="router.push({ name: 'new-plant', params: { id: potId } })">Changer la plante</button>
                <button class="btn btn-outline-danger btn-standard" :disabled="!pot?.plant || removingPlant" @click="onClickRemove">Enlever la plante</button>
                <button class="btn btn-secondary btn-standard" @click="showPlantActions = false">Annuler</button>
              </div>
              <div v-else>
                <p class="mb-3">Êtes-vous sûr de vouloir enlever la plante de ce pot ?</p>
                <div class="modal-actions">
                  <button class="btn btn-danger btn-standard" :disabled="removingPlant" @click="confirmRemovePlant">Oui, enlever</button>
                  <button class="btn btn-secondary btn-standard" :disabled="removingPlant" @click="confirmingRemove = false">Annuler</button>
                </div>
              </div>
              <div v-if="removingPlant" class="text-muted">Suppression en cours…</div>
              <div v-if="removeError" class="text-danger">{{ removeError }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Vue détail d’un pot avec mesures et alertes
// Objectif: Charger les données par ID route et offrir navigation/retour
// Logique: Hooks de route, stores/API et états de chargement/erreur
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { usePotsStore } from '../stores/pots';
import { getPotLatestMeasurement, getPotMeasurements, removePotPlant } from '../api/potsApi';
import MeasurementsChart from '@/components/MeasurementsChart.vue';
import { getPotAlerts } from '@/api/alertsApi';
import { getPlantById } from '@/api/wikiApi';

const route = useRoute();
const router = useRouter();
const potsStore = usePotsStore();
const potId = computed(() => String(route.params.id || ''));

const AUTO_REFRESH_MS = 5000;
const refreshInFlight = ref(false);
const autoRefreshTimerId = ref(null);

async function refreshLatestMeasurement(id) {
  const latest = await getPotLatestMeasurement(id);
  if (!latest) return;

  const latestTs = new Date(latest.timestamp).getTime();
  const currentTs = pot.value?.latestMeasurement?.timestamp ? new Date(pot.value.latestMeasurement.timestamp).getTime() : -Infinity;
  if (Number.isFinite(latestTs) && latestTs > currentTs) {
    if (potsStore.selectedPot) {
      potsStore.selectedPot.latestMeasurement = latest;
      potsStore.selectedPot.lastSeenAt = latest.timestamp;
    }
  }

  const headTs = measurements.value?.[0]?.timestamp ? new Date(measurements.value[0].timestamp).getTime() : -Infinity;
  if (Number.isFinite(latestTs) && latestTs > headTs) {
    const next = [latest, ...(measurements.value || [])]
      .filter((m) => m && m.timestamp)
      .filter((m, idx, arr) => {
        const t = new Date(m.timestamp).getTime();
        return idx === arr.findIndex((x) => new Date(x.timestamp).getTime() === t);
      })
      .slice(0, 50);
    measurements.value = next;
  } else if (Number.isFinite(latestTs) && latestTs === headTs) {
    measurements.value = [latest, ...(measurements.value || []).slice(1)];
  }
}

async function refreshNow(silent = false) {
  if (!potId.value) return;
  if (refreshInFlight.value) return;
  refreshInFlight.value = true;
  try {
    if (silent) {
      await Promise.all([refreshLatestMeasurement(potId.value), loadAlerts(potId.value, true)]);
    } else {
      await Promise.all([potsStore.fetchPotById(potId.value), loadMeasurements(potId.value), loadAlerts(potId.value)]);
    }
  } finally {
    refreshInFlight.value = false;
  }
}

function onVisibilityChange() {
  if (!document.hidden) refreshNow(true);
}

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshTimerId.value = window.setInterval(() => {
    if (document.hidden) return;
    refreshNow(true);
  }, AUTO_REFRESH_MS);
  document.addEventListener('visibilitychange', onVisibilityChange);
}

function stopAutoRefresh() {
  if (autoRefreshTimerId.value != null) {
    clearInterval(autoRefreshTimerId.value);
    autoRefreshTimerId.value = null;
  }
  document.removeEventListener('visibilitychange', onVisibilityChange);
}

onMounted(async () => {
  if (!potId.value) return;
  await refreshNow(false);
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

onBeforeRouteUpdate(async (to) => {
  stopAutoRefresh();
  const id = String(to.params.id || '');
  if (id) {
    await Promise.all([
      potsStore.fetchPotById(id),
      loadMeasurements(id),
      loadAlerts(id),
    ]);
  }
  startAutoRefresh();
});

function goBack() { router.push({ name: 'pots' }); }

function formatDate(d) { try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; } }
function speciesName(plant) { return plant?.speciesName || plant?.speciesId || '—'; }

const pot = computed(() => potsStore.selectedPot);
const loading = computed(() => potsStore.loading);
const error = computed(() => potsStore.error);

const computedGlobalStatus = computed(() => {
  const now = Date.now();
  const lastSeenAt = pot.value?.lastSeenAt ? new Date(pot.value.lastSeenAt).getTime() : NaN;
  if (!Number.isFinite(lastSeenAt)) return 'OFFLINE';
  if (now - lastSeenAt > 30 * 60 * 1000) return 'OFFLINE';

  const soilMoisture = pot.value?.latestMeasurement?.soilMoisture;
  const lightLevel = pot.value?.latestMeasurement?.lightLevel;

  const MOISTURE_MIN = 30;
  const MOISTURE_MAX = 70;
  const LIGHT_MIN = 200;
  const LIGHT_MAX = 1000;
  const RANGE_TOLERANCE_RATIO = 0.1;

  const moistureMin = typeof speciesCare.value?.minMoisture === 'number' ? speciesCare.value.minMoisture : MOISTURE_MIN;
  const moistureMax = typeof speciesCare.value?.maxMoisture === 'number' ? speciesCare.value.maxMoisture : MOISTURE_MAX;
  const lightMin = typeof speciesCare.value?.minLight === 'number' ? speciesCare.value.minLight : LIGHT_MIN;
  const lightMax = typeof speciesCare.value?.maxLight === 'number' ? speciesCare.value.maxLight : LIGHT_MAX;

  const evalMetric = (value, min, max) => {
    if (value === undefined || value === null || !Number.isFinite(Number(value))) return 'missing';
    const v = Number(value);
    if (v >= min && v <= max) return 'good';
    const range = max - min;
    const margin = range * RANGE_TOLERANCE_RATIO;
    const outerMin = min - margin;
    const outerMax = max + margin;
    if (v >= outerMin && v <= outerMax) return 'slight';
    return 'bad';
  };

  const moistureEval = evalMetric(soilMoisture, moistureMin, moistureMax);
  const lightEval = evalMetric(lightLevel, lightMin, lightMax);
  const anyBad = moistureEval === 'bad' || lightEval === 'bad';
  if (anyBad) return 'BAD';
  const anyMissingOrSlight = [moistureEval, lightEval].some((e) => e === 'missing' || e === 'slight');
  if (anyMissingOrSlight) return 'ACTION_REQUIRED';
  return 'OK';
});

const globalStatusLabel = computed(() => {
  const s = String(computedGlobalStatus.value || '');
  if (s === 'OK') return 'OK';
  if (s === 'ACTION_REQUIRED') return 'Action requise';
  if (s === 'BAD') return 'Critique';
  if (s === 'OFFLINE') return 'Hors ligne';
  return s || '—';
});

const globalStatusBadgeClass = computed(() => {
  const s = String(computedGlobalStatus.value || '');
  if (s === 'BAD') return 'badge-danger';
  if (s === 'ACTION_REQUIRED') return 'badge-warning';
  if (s === 'OFFLINE') return 'badge-secondary';
  if (s === 'OK') return 'badge-success';
  return 'badge-secondary';
});

const measurements = ref([]);
const loadingMeasurements = ref(false);
const errorMeasurements = ref(null);

const alerts = ref([]);
const loadingAlerts = ref(false);
const alertsError = ref(null);

const showPlantActions = ref(false);
const removingPlant = ref(false);
const removeError = ref(null);
const confirmingRemove = ref(false);
const deletingPot = ref(false);
const deleteError = ref(null);

async function loadMeasurements(id, silent = false) {
  if (!silent) {
    loadingMeasurements.value = true;
    errorMeasurements.value = null;
  }
  try {
    measurements.value = await getPotMeasurements(id, 50);
  } catch (e) {
    console.error(e);
    if (!silent) {
      errorMeasurements.value = 'Erreur lors du chargement des mesures';
    }
  } finally {
    if (!silent) {
      loadingMeasurements.value = false;
    }
  }
}

async function loadAlerts(id, silent = false) {
  if (!silent) {
    loadingAlerts.value = true;
    alertsError.value = null;
  }
  try {
    alerts.value = await getPotAlerts(id, true);
  } catch (e) {
    console.error(e);
    if (!silent) {
      alertsError.value = 'Erreur lors du chargement des alertes.';
    }
  } finally {
    if (!silent) {
      loadingAlerts.value = false;
    }
  }
}

function formatAlertType(type) {
  const t = String(type || '').trim();
  if (!t) return 'Alerte';
  const map = {
    WATER_NEEDED: 'Arrosage nécessaire',
    WATER_TOO_MUCH: 'Excès d’eau',
    LIGHT_TOO_LOW: 'Lumière trop faible',
    LIGHT_TOO_HIGH: 'Lumière trop forte',
    BATTERY_LOW: 'Batterie faible',
    OFFLINE: 'Pot hors ligne',
    OTHER: 'Alerte (générique)',
  };
  if (map[t]) return map[t];
  return t.replace(/_/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function formatSeverity(severity) {
  const s = String(severity || '').trim();
  if (s === 'CRITICAL') return 'Critique';
  if (s === 'WARNING') return 'Attention';
  if (s === 'INFO') return 'Info';
  return s || '—';
}

function severityBadgeClass(severity) {
  const s = String(severity || '').trim();
  if (s === 'CRITICAL') return 'badge-danger';
  if (s === 'WARNING') return 'badge-warning';
  if (s === 'INFO') return 'badge-info';
  return 'badge-secondary';
}

const speciesCare = ref(null);
const speciesInfo = ref(null);

watch(pot, async (p) => {
  const sid = p?.plant?.speciesId;
  if (sid != null) {
    try {
      const plant = await getPlantById(sid);
      speciesInfo.value = plant || null;
      speciesCare.value = plant?.care || null;
    } catch {}
  } else {
    speciesCare.value = null;
    speciesInfo.value = null;
  }
}, { immediate: true });

const moistureStatus = computed(() => {
  const v = pot.value?.latestMeasurement?.soilMoisture;
  const min = speciesCare.value?.minMoisture;
  const max = speciesCare.value?.maxMoisture;
  return metricStatus(v, min, max);
});

const lightStatus = computed(() => {
  const v = pot.value?.latestMeasurement?.lightLevel;
  const min = speciesCare.value?.minLight;
  const max = speciesCare.value?.maxLight;
  return metricStatus(v, min, max);
});

const temperatureStatus = computed(() => {
  const v = pot.value?.latestMeasurement?.temperature;
  const min = speciesCare.value?.recommendedTemperatureMin;
  const max = speciesCare.value?.recommendedTemperatureMax;
  return metricStatus(v, min, max);
});

function metricStatus(value, min, max) {
  const isNum = typeof value === 'number';
  const hasRange = typeof min === 'number' && typeof max === 'number';
  if (!isNum || !hasRange) return { text: '', class: '' };
  if (value < min) return { text: 'Trop bas', class: 'text-danger' };
  if (value > max) return { text: 'Trop haut', class: 'text-danger' };
  return { text: 'Tout est bon', class: 'text-success' };
}

const moistureValue = computed(() => {
  const raw = pot.value?.latestMeasurement?.soilMoisture;
  return typeof raw === 'number' ? String(raw) : '—';
});

const lightValue = computed(() => {
  const raw = pot.value?.latestMeasurement?.lightLevel;
  return typeof raw === 'number' ? String(raw) : '—';
});

const temperatureValue = computed(() => {
  const raw = pot.value?.latestMeasurement?.temperature;
  return typeof raw === 'number' ? `${raw}` : '—';
});

const airHumidityValue = computed(() => {
  const raw = pot.value?.latestMeasurement?.airHumidity;
  return typeof raw === 'number' ? `${raw}` : '—';
});

function makeRange(value, min, max, unit) {
  const isNum = typeof value === 'number';
  const hasRange = typeof min === 'number' && typeof max === 'number';
  if (!isNum || !hasRange) return '';
  const mid = unit ? `${value}${unit}` : `${value}`;
  const left = unit ? `${min}${unit}` : `${min}`;
  const right = unit ? `${max}${unit}` : `${max}`;
  return `${left} < ${mid} < ${right}`;
}

const moistureRangeParts = computed(() => {
  const v = pot.value?.latestMeasurement?.soilMoisture;
  const min = speciesCare.value?.minMoisture;
  const max = speciesCare.value?.maxMoisture;
  if (typeof v !== 'number' || typeof min !== 'number' || typeof max !== 'number') return null;
  return { left: `${min}%`, mid: `${v}%`, right: `${max}%` };
});

const lightRangeParts = computed(() => {
  const v = pot.value?.latestMeasurement?.lightLevel;
  const min = speciesCare.value?.minLight;
  const max = speciesCare.value?.maxLight;
  if (typeof v !== 'number' || typeof min !== 'number' || typeof max !== 'number') return null;
  return { left: `${min}`, mid: `${v}`, right: `${max}` };
});

const temperatureRangeParts = computed(() => {
  const v = pot.value?.latestMeasurement?.temperature;
  const min = speciesCare.value?.recommendedTemperatureMin;
  const max = speciesCare.value?.recommendedTemperatureMax;
  if (typeof v !== 'number' || typeof min !== 'number' || typeof max !== 'number') return null;
  return { left: `${min}°C`, mid: `${v}°C`, right: `${max}°C` };
});

function openPlantActions() {
  showPlantActions.value = true;
}

function onClickRemove() {
  confirmingRemove.value = true;
}

async function confirmRemovePlant() {
  if (!potId.value) return;
  removeError.value = null;
  removingPlant.value = true;
  try {
    await removePotPlant(potId.value);
    await potsStore.fetchPotById(potId.value);
    showPlantActions.value = false;
  } catch (e) {
    console.error(e);
    removeError.value = 'Échec de la suppression de la plante';
  } finally {
    removingPlant.value = false;
  }
}

async function onDeletePot() {
  if (!potId.value) return;
  deleteError.value = null;
  const ok = window.confirm('Supprimer ce pot ? Cette action est irréversible.');
  if (!ok) return;
  deletingPot.value = true;
  try {
    await potsStore.deletePot(potId.value);
    router.push({ name: 'pots' });
  } catch (e) {
    console.error(e);
    deleteError.value = 'Échec de la suppression du pot';
  } finally {
    deletingPot.value = false;
  }
}
</script>
<style scoped>
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1050; }
.modal-card { width: 520px; max-width: 92vw; }
.modal-actions { display: flex; gap: .5rem; flex-wrap: wrap; }
.modal-actions .btn { flex: 1 1 160px; }
</style>
