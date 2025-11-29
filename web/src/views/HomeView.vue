<template>
  <section>
    <h1 style="margin-bottom: 1rem">Accueil</h1>
    <div class="card-grid">
      <div class="card">
        <h2>Mes pots</h2>
        <p class="muted">Aperçu rapide de vos pots connectés.</p>
        <router-link to="/pots"><button class="btn">Voir mes pots</button></router-link>
      </div>
      <div class="card">
        <h2>Wiki plantes</h2>
        <p class="muted">Explorez l’encyclopédie des espèces et conseils d’entretien.</p>
        <router-link to="/wiki"><button class="btn">Explorer</button></router-link>
      </div>
      <div class="card">
        <h2>Succès</h2>
        <p class="muted">0 succès débloqué • 3 en progression</p>
      </div>
      <div class="card">
        <h2>Alertes</h2>
        <p class="muted">0 alertes critiques • 2 actions recommandées</p>
      </div>
    </div>
  </section>
</template>
