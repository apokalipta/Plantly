<template>
  <section class="section">
    <div class="container">
      <a href="#" @click.prevent="goBack" class="text-muted d-inline-block mb-2">← Retour au wiki</a>
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else-if="plant">
        <div class="card shadow border-0 p-4 mb-3">
          <div class="row">
            <div class="col-md-8">
              <div class="d-flex align-items-center mb-2">
                <h1 class="mb-0 mr-3">{{ plant.commonName }}</h1>
                <span v-if="plant.type" class="badge p-2" :class="typeClass(plant.type)">{{ formatType(plant.type) }}</span>
              </div>
              <p class="text-muted mb-3"><i>{{ plant.latinName }}</i></p>
              <p class="lead" style="font-size: 1.1rem;">{{ plant.descriptionShort }}</p>
            </div>
            <div class="col-md-4 text-center">
               <img v-if="plant.imageUrl" :src="resolveImageUrl(plant.imageUrl)" :alt="plant.commonName || 'Plante'" class="img-fluid rounded shadow-sm" style="max-height: 200px; object-fit: cover;" />
            </div>
          </div>
        </div>

        <div class="card shadow border-0 p-3 mt-3" v-if="plant.care">
          <h2 class="h5">Paramètres de culture</h2>
          <div class="row">
            <div class="col-sm-6">
              <p class="text-muted mb-1"><strong>Humidité sol:</strong> {{ plant.care.minMoisture }}% – {{ plant.care.maxMoisture }}%</p>
              <p class="text-muted mb-1"><strong>Lumière:</strong> {{ plant.care.minLight }} – {{ plant.care.maxLight }} lux</p>
            </div>
            <div class="col-sm-6">
              <p class="text-muted mb-1"><strong>Température:</strong> {{ plant.care.recommendedTemperatureMin }}°C – {{ plant.care.recommendedTemperatureMax }}°C</p>
              <p class="text-muted mb-1"><strong>Arrosage:</strong> tous les {{ plant.care.wateringIntervalDays }} jours</p>
            </div>
          </div>
          <p class="mt-2" v-if="plant.care.careTips"><strong>Note générale:</strong> {{ plant.care.careTips }}</p>
        </div>

        <div class="card shadow border-0 p-3 mt-3" v-if="plant.care && plant.care.plantingTips">
          <h2 class="h5">Comment planter</h2>
          <p style="white-space: pre-line;">{{ plant.care.plantingTips }}</p>
        </div>

        <div class="card shadow border-0 p-3 mt-3" v-if="plant.care && plant.care.maintenanceTips">
          <h2 class="h5">Entretien</h2>
          <p style="white-space: pre-line;">{{ plant.care.maintenanceTips }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Détail d’une espèce du wiki avec conseils de soin
// Objectif: Charger par ID route et afficher image/infos
// Logique: Hooks de route et store wiki pour gérer l’état et la navigation
import { onMounted, computed } from 'vue';
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router';
import { useWikiStore } from '../stores/wiki';

const route = useRoute();
const router = useRouter();
const wiki = useWikiStore();
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''));

function resolveImageUrl(u) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const root = base.endsWith('/api') ? base.slice(0, -4) : base;
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith('/')) return `${root}${u}`;
  return u;
}

onMounted(() => { if (id.value) wiki.fetchPlantById(id.value); });

onBeforeRouteUpdate((to) => {
  const newId = typeof to.params.id === 'string' ? to.params.id : '';
  if (newId) wiki.fetchPlantById(newId);
});

function goBack() { router.push({ name: 'wiki' }); }

const plant = computed(() => wiki.selectedPlant);
const loading = computed(() => wiki.loading);
const error = computed(() => wiki.error);

function formatType(t) {
  const map = {
    DECORATIVE: 'Décorative',
    AROMATIQUE: 'Aromatique',
    PARFUMEE: 'Parfumée',
    COMESTIBLE: 'Comestible'
  };
  return map[t] || t;
}

function typeClass(t) {
  const map = {
    DECORATIVE: 'badge-info',
    AROMATIQUE: 'badge-success',
    PARFUMEE: 'badge-warning',
    COMESTIBLE: 'badge-primary'
  };
  return map[t] || 'badge-secondary';
}
</script>
