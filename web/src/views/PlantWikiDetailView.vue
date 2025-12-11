<template>
  <section class="section">
    <div class="container">
      <a href="#" @click.prevent="goBack" class="text-muted d-inline-block mb-2">← Retour au wiki</a>
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else-if="plant">
        <div class="card shadow border-0 p-3">
          <h1 class="mb-1">{{ plant.commonName }}</h1>
          <p class="text-muted"><i>{{ plant.latinName }}</i></p>
        </div>
        <div class="card shadow border-0 p-3 mt-3">
          <p>{{ plant.descriptionShort }}</p>
          <img v-if="plant.imageUrl" :src="resolveImageUrl(plant.imageUrl)" :alt="plant.commonName || 'Plante'" class="img-fluid rounded mt-2" />
        </div>
        <div class="card shadow border-0 p-3 mt-3" v-if="plant.care">
          <h2 class="h5">Conseils de soin</h2>
          <p class="text-muted mb-1">Humidité: {{ plant.care.minMoisture }}–{{ plant.care.maxMoisture }}</p>
          <p class="text-muted mb-1">Lumière: {{ plant.care.minLight }}–{{ plant.care.maxLight }}</p>
          <p class="text-muted mb-1">Température: {{ plant.care.recommendedTemperatureMin }}–{{ plant.care.recommendedTemperatureMax }}</p>
          <p class="text-muted mb-1">Arrosage: toutes {{ plant.care.wateringIntervalDays }} jours</p>
          <p class="mt-2">{{ plant.care.careTips }}</p>
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
</script>
