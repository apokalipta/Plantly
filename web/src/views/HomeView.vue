<template>
  <section>
    <div class="card" style="padding:2rem; text-align:center; background: linear-gradient(120deg, rgba(34,197,94,0.15), rgba(12,18,31,0.6));">
      <h1 style="margin-bottom: 0.5rem">Bienvenue sur Plantly</h1>
      <p class="muted" style="margin-bottom:1rem">Suivez vos pots connectés, prenez soin de vos plantes, et débloquez des succès.</p>
      <div style="display:flex; gap:0.75rem; justify-content:center; flex-wrap:wrap;">
        <router-link to="/pots"><button class="btn">Voir mes pots</button></router-link>
        <router-link to="/wiki"><button class="btn">Explorer le wiki</button></router-link>
        <router-link to="/profile"><button class="btn">Profil</button></router-link>
      </div>
    </div>
    <div class="card-grid" style="margin-top:1.25rem;">
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
        <p class="muted">Suivez vos objectifs et progrès.</p>
        <router-link :to="{ name: 'achievements' }"><button class="btn">Voir mes succès</button></router-link>
      </div>
      <div class="card">
        <h2>Alertes</h2>
        <p class="muted">Surveillez les alertes et les actions requises.</p>
        <router-link :to="{ name: 'pots' }"><button class="btn">Voir les alertes</button></router-link>
      </div>
    </div>
  </section>
</template>
