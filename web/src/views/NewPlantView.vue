<template>
  <section class="section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card card-static shadow border-0 p-4">
            <h1 class="mb-3">Associer une plante</h1>
            <p class="text-muted">Choisissez une espèce pour ce pot.</p>
            <form @submit.prevent="onSubmit" class="mt-3">
              <div class="form-group">
                <label for="species">Espèce</label>
                <div class="position-relative">
                  <input id="species" v-model="speciesQuery" type="text" placeholder="Sélectionner..." class="form-control" @focus="showDropdown = true" @input="onQuery" @keydown.enter.prevent="selectFirst" @blur="onBlur" />
                  <ul v-if="showDropdown && filteredPlants.length" class="list-group position-absolute w-100" style="z-index:1050; max-height: 220px; overflow-y: auto;">
                    <li v-for="plant in filteredPlants" :key="plant.id" class="list-group-item list-group-item-action" @mousedown.prevent="choosePlant(plant)">{{ plant.commonName }}</li>
                  </ul>
                </div>
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
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWikiStore } from '../stores/wiki';
import { patchPotPlant } from '../api/potsApi';

const route = useRoute();
const router = useRouter();
const potId = computed(() => String(route.params.id || ''));
const wiki = useWikiStore();
const speciesQuery = ref('');
const showDropdown = ref(false);
const chosenSpeciesId = ref(null);
const filteredPlants = computed(() => {
  const q = (speciesQuery.value || '').trim().toLowerCase();
  const arr = Array.isArray(wiki.plants) ? wiki.plants : [];
  if (!q) return arr;
  return arr.filter(p => String(p.commonName || '').toLowerCase().includes(q));
});
const nickname = ref('');
const loading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

onMounted(() => { wiki.fetchPlants(); });

watch(speciesQuery, (v) => {
  const q = (v || '').trim();
  wiki.fetchPlants(q);
});

function onQuery() {
  const q = (speciesQuery.value || '').trim();
  wiki.fetchPlants(q);
  showDropdown.value = true;
}

function choosePlant(p) {
  speciesQuery.value = p?.commonName || '';
  chosenSpeciesId.value = p?.id || null;
  showDropdown.value = false;
}

function selectFirst() {
  const p = filteredPlants.value?.[0];
  if (p) choosePlant(p);
}

function onBlur() {
  setTimeout(() => { showDropdown.value = false; }, 100);
}

async function onSubmit() {
  errorMessage.value = null;
  successMessage.value = null;
  const q = (speciesQuery.value || '').trim().toLowerCase();
  const exact = (wiki.plants || []).find(p => String(p.commonName || '').toLowerCase() === q);
  const starts = exact ? exact : (wiki.plants || []).find(p => String(p.commonName || '').toLowerCase().startsWith(q));
  const chosenId = chosenSpeciesId.value || starts?.id;
  if (!chosenId) {
    errorMessage.value = 'Veuillez choisir une espèce';
    return;
  }
  loading.value = true;
  try {
    await patchPotPlant(potId.value, { speciesId: Number(chosenId), nickname: nickname.value || undefined });
    successMessage.value = 'Plante associée';
    await router.push({ name: 'pot-detail', params: { id: potId.value } });
  } catch (e) {
    console.error(e);
    errorMessage.value = e?.message || 'Erreur lors de l’association de la plante';
  } finally {
    loading.value = false;
  }
}
</script>
