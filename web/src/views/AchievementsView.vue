<template>
  <div class="page-container">
    <h1 style="margin-bottom: 1rem">Succès</h1>
    <div v-if="loading">Chargement…</div>
    <div v-else-if="error" style="color:#ef4444">{{ error }}</div>
    <div v-else>
      <div class="card" style="margin-bottom:1rem">
        <p class="muted">
          <span style="display:inline-block; padding:0.25rem 0.5rem; border-radius:999px; background:rgba(34,197,94,0.15); color:#22c55e; font-weight:600; margin-right:0.5rem;">Débloqué</span>
          <span style="display:inline-block; padding:0.25rem 0.5rem; border-radius:999px; background:rgba(148,163,184,0.15); color:#94a3b8; font-weight:600;">Non débloqué</span>
        </p>
        <p class="muted" style="margin-top:0.5rem">{{ unlockedCount }} / {{ totalCount }} succès débloqués</p>
      </div>
      <div class="card-grid">
        <div v-for="a in achievements" :key="a.id" class="card">
          <h2 style="margin-bottom:0.25rem">{{ a.title }}</h2>
          <p v-if="a.icon" class="muted" style="margin:0.25rem 0">{{ a.icon }}</p>
          <p class="muted" style="margin:0.5rem 0">{{ a.description }}</p>
          <p v-if="a.category" class="muted" style="font-size:0.9rem">Catégorie: {{ a.category }}</p>
          <div style="margin-top:0.75rem">
            <span v-if="a.unlocked" style="display:inline-block; padding:0.25rem 0.5rem; border-radius:999px; background:rgba(34,197,94,0.15); color:#22c55e; font-weight:600;">Débloqué</span>
            <span v-else style="display:inline-block; padding:0.25rem 0.5rem; border-radius:999px; background:rgba(148,163,184,0.15); color:#94a3b8; font-weight:600;">À débloquer</span>
            <p v-if="a.unlockedAt" class="muted" style="margin-top:0.35rem">{{ formatDate(a.unlockedAt) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
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
