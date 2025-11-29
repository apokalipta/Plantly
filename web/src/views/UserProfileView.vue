<template>
  <div class="card">
    <h1>Profil Utilisateur</h1>
    <p class="muted">Informations de profil et préférences. TODO.</p>

    <div style="margin-top:1rem">
      <h2>Succès</h2>
      <p class="muted">Consultez vos succès débloqués et objectifs.</p>
      <router-link :to="{ name: 'achievements' }"><button class="btn">Voir mes succès</button></router-link>
    </div>
  </div>
</template>
