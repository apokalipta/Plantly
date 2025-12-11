<template>
  <BaseLayout />
</template>

<script setup>
import BaseLayout from './layouts/argon/BaseLayout.vue';
</script>
<style>
.btn { transition: transform .08s ease, box-shadow .2s ease, background-color .2s ease, color .2s ease; }
.btn-standard { padding: 0.625rem 1rem; border-radius: 0.5rem; font-weight: 600; min-width: 160px; }
.btn:hover { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(0,0,0,.12); }
.btn:active { transform: translateY(0); box-shadow: 0 2px 8px rgba(0,0,0,.10); }
.btn-block { width: 100%; }

.card { transition: background-color .2s ease, box-shadow .2s ease, transform .08s ease; border-radius: 0.75rem; }
.card:not(.card-static):hover { background-color: #f8f9fa; transform: translateY(-1px) scale(1.01); box-shadow: 0 10px 28px rgba(0,0,0,.14); }
</style>
<!-- Intention: Shell racine basé sur Argon, with navbar/footer + router-view -->
