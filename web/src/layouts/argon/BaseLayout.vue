<template>
  <div>
    <header class="header-global">
      <nav class="navbar navbar-main navbar-expand-lg navbar-light bg-white">
        <div class="container">
          <router-link class="navbar-brand mr-lg-5" to="/">Plantly</router-link>
          <button class="navbar-toggler" type="button" @click="toggled = !toggled">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" :class="{ show: toggled }">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item"><router-link class="nav-link" to="/">Accueil</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/pots">Pots</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/wiki">Wiki</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/scan">Scan</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/tutorials">Tutoriels</router-link></li>
            </ul>
            <ul class="navbar-nav ml-auto">
              <template v-if="!isAuth">
                <li class="nav-item"><router-link class="nav-link" to="/login">Connexion</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/register">Créer un compte</router-link></li>
              </template>
              <template v-else>
                <li class="nav-item"><router-link class="nav-link" to="/profile">Profil</router-link></li>
                <li class="nav-item"><a class="nav-link" href="#" @click.prevent="logout">Déconnexion</a></li>
              </template>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main class="container py-4">
      <router-view />
    </main>

    <footer class="footer py-4">
      <div class="container text-center">
        <div class="row">
          <div class="col-md-12">
            <p class="mb-0 text-muted">© Plantly — Tous droits réservés</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const isAuth = computed(() => auth.isAuthenticated);
const toggled = ref(false);

function logout() {
  auth.logout();
}
</script>

<style scoped>
.navbar-main { border-bottom: 1px solid #e9ecef; }
.navbar-main .nav-link { font-weight: 600; padding: .5rem .75rem; border-radius: .5rem; transition: background-color .15s ease, color .15s ease; }
.navbar-main .nav-link:hover { background-color: #f8f9fa; color: #212529; }
.navbar-main .nav-link.router-link-active { background-color: #e9f2ff; color: #0d6efd; }
</style>
