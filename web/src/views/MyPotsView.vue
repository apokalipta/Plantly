<template>
  <section class="section">
    <div class="container">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h1 class="mb-0">Mes pots</h1>
        <router-link to="/pots/new" class="btn btn-primary btn-standard">Ajouter un pot</router-link>
      </div>
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else class="row">
        <div v-for="pot in pots" :key="pot.id" class="col-md-6 col-lg-4 mb-3">
          <div class="card shadow border-0 p-3 h-100">
            <h2 class="h5">{{ pot.name || 'Pot sans nom' }}</h2>
            <p class="text-muted mb-1">Statut:
              <span class="badge" :class="badgeClass(pot.globalStatus)">{{ pot.globalStatus || 'N/A' }}</span>
            </p>
            <p class="text-muted">Dernière activité: {{ formatDate(pot.lastSeenAt) }}</p>
            <button class="btn btn-outline-primary btn-standard" @click="openPot(pot.id)">Voir le pot</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Afficher la liste des pots de l’utilisateur et leurs statuts
// Objectif: Charger depuis le store et offrir navigation vers le détail
// Logique: onMounted -> fetch, gestion des états UI et routing
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

function badgeClass(status) {
  if (status === 'CRITICAL') return 'badge-danger';
  if (status === 'WARNING') return 'badge-warning';
  return 'badge-secondary';
}
</script>
