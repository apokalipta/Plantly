<template>
  <section class="mk-container">
    <h1 style="margin-bottom: 1rem">Wiki des plantes</h1>
    <div class="card" style="margin-bottom:1rem">
      <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
        <input v-model="search" type="text" placeholder="Rechercher une plante" style="flex:1; min-width:240px; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        <button class="btn" @click="onSearch">Rechercher</button>
      </div>
    </div>
    <div v-if="loading">Chargement…</div>
    <div v-else-if="error" style="color:#ef4444">{{ error }}</div>
    <div v-else>
      <div class="mk-grid">
        <div v-for="p in displayPlants" :key="p.id" class="mk-card" style="position:relative;">
          <button class="fav-toggle" :class="{ 'fav-on': (favorites || []).includes(p.id) }" @click="wiki.toggleFavorite(p.id)" aria-label="Basculer favori">★</button>
          <h2>{{ p.commonName }}</h2>
          <p class="muted"><i>{{ p.latinName }}</i></p>
          <p class="muted" style="margin-top:0.5rem">{{ p.descriptionShort }}</p>
          <button class="btn" style="margin-top:0.75rem" @click="open(p.id)">Voir la fiche</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
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
