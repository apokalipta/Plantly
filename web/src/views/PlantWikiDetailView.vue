<template>
  <section>
    <a href="#" @click.prevent="goBack" class="muted" style="display:inline-block; margin-bottom:0.5rem">← Retour au wiki</a>
    <div v-if="loading">Chargement…</div>
    <div v-else-if="error" style="color:#ef4444">{{ error }}</div>
    <div v-else-if="plant">
      <h1 style="margin-bottom:0.25rem">{{ plant.commonName }}</h1>
      <p class="muted"><i>{{ plant.latinName }}</i></p>
      <div class="card" style="margin-top:1rem">
        <p>{{ plant.descriptionShort }}</p>
        <img v-if="plant.imageUrl" :src="plant.imageUrl" alt="image" style="margin-top:0.75rem; max-width:100%; border-radius:12px;" />
      </div>
      <div class="card" v-if="plant.care" style="margin-top:1rem">
        <h2>Conseils de soin</h2>
        <p class="muted">Humidité: {{ plant.care.minMoisture }}–{{ plant.care.maxMoisture }}</p>
        <p class="muted">Lumière: {{ plant.care.minLight }}–{{ plant.care.maxLight }}</p>
        <p class="muted">Température: {{ plant.care.recommendedTemperatureMin }}–{{ plant.care.recommendedTemperatureMax }}</p>
        <p class="muted">Arrosage: toutes {{ plant.care.wateringIntervalDays }} jours</p>
        <p style="margin-top:0.5rem">{{ plant.care.careTips }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWikiStore } from '../stores/wiki';

const route = useRoute();
const router = useRouter();
const wiki = useWikiStore();
const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''));

onMounted(() => { if (id.value) wiki.fetchPlantById(id.value); });

function goBack() { router.push({ name: 'wiki' }); }

const plant = computed(() => wiki.selectedPlant);
const loading = computed(() => wiki.loading);
const error = computed(() => wiki.error);
</script>
