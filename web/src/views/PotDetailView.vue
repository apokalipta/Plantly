<template>
  <section>
    <a href="#" @click.prevent="goBack" class="muted" style="display:inline-block; margin-bottom:0.5rem">← Retour</a>
    <div class="card">
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
        </div>
        <div style="margin-top:1rem">
          <h3>Dernière mesure</h3>
          <p class="muted">Horodatage: {{ formatDate(pot.latestMeasurement?.timestamp) }}</p>
          <p class="muted">Humidité: {{ pot.latestMeasurement?.soilMoisture ?? '—' }}</p>
          <p class="muted">Lumière: {{ pot.latestMeasurement?.lightLevel ?? '—' }}</p>
          <p class="muted">Température: {{ pot.latestMeasurement?.temperature ?? '—' }}</p>
        </div>
        <div style="margin-top:1rem">
          <h3>Alertes</h3>
          <p class="muted">TODO: afficher les alertes</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePotsStore } from '../stores/pots';

const route = useRoute();
const router = useRouter();
const potsStore = usePotsStore();
const potId = computed(() => String(route.params.id || ''));

onMounted(() => {
  if (potId.value) {
    potsStore.fetchPotById(potId.value);
  }
});

function goBack() { router.push({ name: 'pots' }); }

function formatDate(d) { try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; } }
function speciesName(plant) { return plant?.speciesName || plant?.speciesId || '—'; }

const pot = computed(() => potsStore.selectedPot);
const loading = computed(() => potsStore.loading);
const error = computed(() => potsStore.error);
</script>
