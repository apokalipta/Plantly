<template>
  <section class="section section-shaped">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-5">
          <div class="card shadow border-0 p-4">
            <h1 class="mb-3">Connexion</h1>
            <form @submit.prevent="submit">
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="email" type="email" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <input id="password" v-model="password" type="password" required class="form-control" />
              </div>
              <button class="btn btn-primary btn-standard btn-block" type="submit" :disabled="loading">Se connecter</button>
              <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
              <p class="text-muted mt-2">Pas de compte ? <router-link to="/register">Créer un compte</router-link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Vue de connexion avec gestion des erreurs et redirection
// Objectif: Authentifier l’utilisateur et stocker les jetons via le store
// Logique: Soumission contrôlée, états de chargement et messages d’erreur
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const auth = useAuthStore();

async function submit() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await auth.login(email.value, password.value);
    router.push({ name: 'home' });
  } catch (e) {
    console.error(e);
    errorMessage.value = 'Identifiants invalides';
  } finally {
    loading.value = false;
  }
}
</script>
