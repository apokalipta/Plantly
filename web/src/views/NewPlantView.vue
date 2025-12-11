<template>
  <section class="section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card shadow border-0 p-4">
            <h1 class="mb-3">Associer une plante</h1>
            <p class="text-muted">Choisissez une espèce pour ce pot.</p>
            <form @submit.prevent="onSubmit" class="mt-3">
              <div class="form-group">
                <label for="species">Espèce</label>
                <select id="species" v-model="selectedSpeciesId" class="form-control">
                  <option :value="null">Sélectionner…</option>
                  <option v-for="plant in wiki.plants" :key="plant.id" :value="plant.id">{{ plant.commonName }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="nickname">Surnom (optionnel)</label>
                <input id="nickname" v-model="nickname" type="text" placeholder="Mon basilic" class="form-control" />
              </div>
              <button class="btn btn-primary btn-standard btn-block" type="submit" :disabled="loading">Associer</button>
              <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
              <p v-if="successMessage" class="text-success mt-2">{{ successMessage }}</p>
              <p class="text-muted mt-3">
                <router-link :to="{ name: 'pot-detail', params: { id: potId } }">← Retour au pot</router-link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
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
