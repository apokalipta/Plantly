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
