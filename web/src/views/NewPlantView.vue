<template>
  <div class="page-container">
    <div class="card" style="max-width: 640px; margin: 0 auto;">
      <h1>Associer une plante</h1>
      <p class="muted">Choisissez une espèce pour ce pot.</p>

      <form @submit.prevent="onSubmit" style="margin-top:1rem;">
        <div style="margin-bottom:0.75rem;">
          <label>Espèce</label>
          <select v-model="selectedSpeciesId" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;">
            <option :value="null">Sélectionner…</option>
            <option v-for="plant in wiki.plants" :key="plant.id" :value="plant.id">{{ plant.commonName }}</option>
          </select>
        </div>
        <div style="margin-bottom:0.75rem;">
          <label>Surnom (optionnel)</label>
          <input v-model="nickname" type="text" placeholder="Mon basilic" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        </div>
        <button class="btn" type="submit" :disabled="loading" style="width:100%;">Associer</button>
      </form>

      <p v-if="errorMessage" style="color:#ef4444; margin-top:0.75rem;">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color:#22c55e; margin-top:0.75rem;">{{ successMessage }}</p>

      <p class="muted" style="margin-top:1rem;">
        <router-link :to="{ name: 'pot-detail', params: { id: potId } }">← Retour au pot</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useWikiStore } from '../stores/wiki';

const route = useRoute();
const potId = computed(() => String(route.params.id || ''));
const wiki = useWikiStore();
const selectedSpeciesId = ref(null);
const nickname = ref('');
const loading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

onMounted(() => { wiki.fetchPlants(); });

async function onSubmit() {
  errorMessage.value = null;
  successMessage.value = null;
  if (!selectedSpeciesId.value) {
    errorMessage.value = 'Veuillez choisir une espèce';
    return;
  }
  loading.value = true;
  try {
    successMessage.value = 'Fonctionnalité à venir';
  } catch (e) {
    console.error(e);
    errorMessage.value = 'Erreur lors de l’association de la plante';
  } finally {
    loading.value = false;
  }
}
</script>
