<template>
  <section class="mk-container">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h1 style="margin-bottom: 1rem">Mes pots</h1>
      <router-link to="/pots/new"><button class="mk-btn">Ajouter un pot</button></router-link>
    </div>
    <div v-if="loading">Chargement…</div>
    <div v-else-if="error" style="color:#ef4444">{{ error }}</div>
    <div v-else>
      <div class="mk-grid">
        <div v-for="pot in pots" :key="pot.id" class="mk-card">
          <h2>{{ pot.name || 'Pot sans nom' }}</h2>
          <p class="muted">Statut: <span class="mk-badge" :class="{ warn: pot.globalStatus === 'WARNING', crit: pot.globalStatus === 'CRITICAL' }">{{ pot.globalStatus || 'N/A' }}</span></p>
          <p class="muted">Dernière activité: {{ formatDate(pot.lastSeenAt) }}</p>
          <button class="mk-btn" @click="openPot(pot.id)">Voir le pot</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePotsStore } from '../stores/pots';
import { storeToRefs } from 'pinia';

const router = useRouter();
const potsStore = usePotsStore();
const { pots, loading, error } = storeToRefs(potsStore);

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
