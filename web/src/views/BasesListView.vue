<template>
  <section class="section">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="mb-0">Mes bases</h1>
        <div class="d-flex gap-2">
          <input v-model="pairCode" type="text" placeholder="Code d’appairage" class="form-control" style="max-width: 220px;" />
          <button class="btn btn-primary btn-standard" :disabled="!pairCode || loading" @click="pair">Ajouter une base</button>
        </div>
      </div>
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else class="row">
        <div v-for="base in bases" :key="base.id" class="col-md-6 col-lg-4 mb-3">
          <div class="card shadow border-0 p-3 h-100">
            <h2 class="h5">{{ base.name || base.baseUid }}</h2>
            <p class="text-muted mb-1">Slots actifs: {{ activeSlotsCount(base) }}/4</p>
            <p class="text-muted">Dernière activité: {{ formatDate(latestActivity(base)) }}</p>
            <button class="btn btn-outline-primary btn-standard" @click="openBase(base.id)">Voir la base</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBasesStore } from '../stores/bases';
import { storeToRefs } from 'pinia';

const router = useRouter();
const basesStore = useBasesStore();
const { bases, loading, error } = storeToRefs(basesStore);
const pairCode = ref('');

onMounted(() => {
  basesStore.fetchMyBases();
});

function openBase(id) { router.push({ name: 'base-detail', params: { id } }); }
function formatDate(d) { try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; } }
function activeSlotsCount(base) { try { return (base.slots || []).filter((s) => s.isActive).length; } catch { return 0; } }
function latestActivity(base) {
  try {
    const ts = (base.slots || [])
      .map((s) => s.latestMeasurement?.timestamp ? new Date(s.latestMeasurement.timestamp).getTime() : 0)
      .reduce((a, b) => Math.max(a, b), 0);
    return ts ? new Date(ts) : null;
  } catch { return null; }
}
async function pair() {
  await basesStore.pairBase(pairCode.value || '');
  pairCode.value = '';
}
</script>
