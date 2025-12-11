<template>
  <section class="section">
    <div class="container">
      <h1 class="mb-3">Succès</h1>
      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else>
        <div class="card shadow border-0 p-3 mb-3">
          <p class="text-muted mb-0">
            <span class="badge badge-success mr-2">Débloqué</span>
            <span class="badge badge-secondary">Non débloqué</span>
          </p>
          <p class="text-muted mt-2">{{ unlockedCount }} / {{ totalCount }} succès débloqués</p>
        </div>
        <div class="row">
          <div v-for="a in achievements" :key="a.id" class="col-md-6 col-lg-4 mb-3">
            <div class="card shadow border-0 p-3 h-100" :style="{ opacity: a.unlocked ? 1 : 0.8 }">
              <h2 class="h5 mb-1">{{ a.title }}</h2>
              <p v-if="a.icon" class="text-muted mb-1">{{ a.icon }}</p>
              <p class="text-muted mb-2">{{ a.description }}</p>
              <p v-if="a.category" class="text-muted" style="font-size:0.9rem">Catégorie: {{ a.category }}</p>
              <div class="mt-2">
                <span class="badge" :class="a.unlocked ? 'badge-success' : 'badge-secondary'">{{ a.unlocked ? 'Débloqué' : 'À débloquer' }}</span>
                <p v-if="a.unlockedAt" class="text-muted mt-1">{{ formatDate(a.unlockedAt) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useAchievementsStore } from '../stores/achievements';

const achievementsStore = useAchievementsStore();

onMounted(() => { achievementsStore.fetchMyAchievements(); });

function formatDate(d) { try { return d ? new Date(d).toLocaleString() : '—'; } catch { return '—'; } }

const achievements = computed(() => achievementsStore.achievements);
const loading = computed(() => achievementsStore.loading);
const error = computed(() => achievementsStore.error);
const totalCount = computed(() => achievements.value.length);
const unlockedCount = computed(() => achievements.value.filter(a => a.unlocked).length);
</script>
