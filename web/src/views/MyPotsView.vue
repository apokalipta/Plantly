<template>
  <section>
    <h1 style="margin-bottom: 1rem">Mes pots</h1>
    <div v-if="loading">Chargement…</div>
    <div v-else-if="error" style="color:#ef4444">{{ error }}</div>
    <div v-else>
      <div class="card-grid">
        <div v-for="pot in pots" :key="pot.id" class="card">
          <h2>{{ pot.name || 'Pot sans nom' }}</h2>
          <p class="muted">Statut: {{ pot.globalStatus || 'N/A' }}</p>
          <p class="muted">Dernière activité: {{ formatDate(pot.lastSeenAt) }}</p>
          <button class="btn" @click="openPot(pot.id)">Voir le pot</button>
        </div>
        <div class="card">
          <h2>Ajouter un pot</h2>
          <p class="muted">Lier un nouvel appareil provisionné.</p>
          <router-link to="/pots/new"><button class="btn">Ajouter un pot</button></router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePotsStore } from '../stores/pots';

const router = useRouter();
const potsStore = usePotsStore();
const { pots, loading, error } = potsStore;

onMounted(() => {
  potsStore.fetchMyPots();
});

function openPot(id) {
  router.push({ name: 'pot-detail', params: { id } });
}

function formatDate(d) {
  try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; }
}
</script>
