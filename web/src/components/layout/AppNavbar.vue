<template>
  <div class="mk-topbar">
    <div class="mk-container">
      <div class="mk-topbar__bar">
        <div class="mk-topbar__left">
          <router-link to="/" class="mk-topbar__brand">Plantly</router-link>
        </div>
        <nav class="mk-topbar__nav">
          <router-link to="/" class="mk-topbar__link"><span class="material-icons">home</span> Accueil</router-link>
          <router-link to="/bases" class="mk-topbar__link"><span class="material-icons">dashboard</span> Bases</router-link>
          <router-link to="/wiki" class="mk-topbar__link"><span class="material-icons">menu_book</span> Wiki</router-link>
          <router-link to="/scan" class="mk-topbar__link"><span class="material-icons">photo_camera</span> Scan</router-link>
          <router-link to="/tutorials" class="mk-topbar__link"><span class="material-icons">school</span> Tutoriels</router-link>
          <router-link to="/profile" class="mk-topbar__link"><span class="material-icons">person</span> Profil</router-link>
        </nav>
        <div class="mk-topbar__cta">
          <router-link to="/bases" class="mk-topbar__btn">Ajouter une base</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
