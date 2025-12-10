<template>
  <AppNavbar />
  <main class="mk-container">
    <router-view />
  </main>
  <AppFooter />
</template>

<script setup>
import AppNavbar from './components/layout/AppNavbar.vue';
import AppFooter from './components/layout/AppFooter.vue';
</script>
<!-- Intention: Racine de l’app Vue, conteneur du layout et du router-view -->
<!-- Objectif: Structurer l’UI globale et intégrer la navigation/application -->
<!-- Logique: Composants de layout et point d’injection des vues -->
