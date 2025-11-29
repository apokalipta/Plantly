<template>
  <div>
    <header class="app-header mk-navbar">
      <router-link to="/" class="brand" style="text-decoration:none; color: inherit;">Plantly</router-link>
      <nav class="nav">
        <router-link to="/">Accueil</router-link>
        <router-link to="/pots">Pots</router-link>
        <router-link to="/wiki">Wiki</router-link>
        <router-link to="/scan">Scan</router-link>
        <router-link to="/tutorials">Tutoriels</router-link>
        <router-link to="/profile">Profil</router-link>
      </nav>
    </header>
    <footer class="mk-footer">
      <div class="mk-container">© Plantly — Tous droits réservés</div>
    </footer>
    <main class="page-container">
      <router-view />
    </main>
  </div>
</template>
