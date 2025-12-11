<template>
  <section class="section">
    <div class="container">
      <h1 class="mb-3">Wiki des plantes</h1>
      <div class="card shadow border-0 p-3 mb-3">
        <form @submit.prevent="onSearch" class="form-row align-items-center">
          <div class="col-sm-9 mb-2">
            <input v-model="search" type="text" placeholder="Rechercher une plante" class="form-control" />
          </div>
          <div class="col-sm-3 mb-2 text-right">
            <button class="btn btn-primary btn-standard btn-block" type="submit">Rechercher</button>
          </div>
        </form>
      </div>
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else class="row">
        <div v-for="p in displayPlants" :key="p.id" class="col-md-6 col-lg-4 mb-3">
          <div class="card shadow border-0 p-3 h-100 position-relative d-flex flex-column">
            <button class="btn btn-sm btn-outline-warning position-absolute" style="top:8px; right:8px;" :class="{ 'active': (favorites || []).includes(p.id) }" @click="wiki.toggleFavorite(p.id)" aria-label="Basculer favori">★</button>
            <h2 class="h5">{{ p.commonName }}</h2>
            <p class="text-muted"><i>{{ p.latinName }}</i></p>
            <p class="text-muted">{{ p.descriptionShort }}</p>
            <button class="btn btn-outline-primary btn-standard mt-auto" @click="open(p.id)">Voir la fiche</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Liste des plantes du wiki avec favoris et recherche
// Objectif: Charger et trier, mise en avant des favoris
// Logique: Store wiki, watch sur recherche et navigation vers le détail
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useWikiStore } from '../stores/wiki';
import { storeToRefs } from 'pinia';

const router = useRouter();
const wiki = useWikiStore();
const search = ref('');

onMounted(() => {
  wiki.initFavorites();
  wiki.fetchPlants();
});

function onSearch() { wiki.fetchPlants(search.value); }
function open(id) { router.push({ name: 'wiki-detail', params: { id } }); }

const { plants, loading, error, favorites } = storeToRefs(wiki);

watch(search, (v) => { if (!v.trim()) wiki.fetchPlants(''); });

const displayPlants = computed(() => {
  const favSet = new Set(favorites.value || []);
  const sorted = [...(plants.value || [])].sort((a, b) => {
    const fa = favSet.has(a.id);
    const fb = favSet.has(b.id);
    if (fa && !fb) return -1;
    if (!fa && fb) return 1;
    return (a.commonName || '').localeCompare(b.commonName || '');
  });
  return sorted;
});
</script>
