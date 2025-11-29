<template>
  <div>
    <header class="app-header">
      <div class="brand">Plantly</div>
      <nav class="nav">
        <router-link to="/">Accueil</router-link>
        <router-link to="/pots">Pots</router-link>
        <router-link to="/wiki">Wiki</router-link>
        <router-link to="/scan">Scan</router-link>
        <router-link to="/tutorials">Tutoriels</router-link>
        <router-link to="/profile">Profil</router-link>
      </nav>
    </header>
    <main class="page-container">
      <router-view />
    </main>
  </div>
</template>
