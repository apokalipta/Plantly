<template>
  <section class="section section-shaped">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-5">
          <div class="card shadow border-0 p-4">
            <h1 class="mb-3">Inscription</h1>
            <form @submit.prevent="submit">
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="email" type="email" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="password">Mot de passe</label>
                <input id="password" v-model="password" type="password" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="username">Nom d’utilisateur</label>
                <input id="username" v-model="username" type="text" required class="form-control" />
              </div>
              <div class="form-group">
                <label for="passwordConfirm">Confirmer le mot de passe</label>
                <input id="passwordConfirm" v-model="passwordConfirm" type="password" required class="form-control" />
              </div>
                      <button class="btn btn-primary btn-standard btn-block" type="submit" :disabled="loading">Créer le compte</button>
              <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
              <p class="text-muted mt-2">Déjà inscrit ? <router-link to="/login">Se connecter</router-link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Vue d’inscription avec génération/validation du nom d’utilisateur
// Objectif: Créer le compte et rediriger, tout en gérant les erreurs
// Logique: Comparaison des mots de passe et fallback de username si absent
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
const username = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const auth = useAuthStore();

async function submit() {
  loading.value = true;
  errorMessage.value = '';
  try {
    if (password.value !== passwordConfirm.value) {
      errorMessage.value = 'Les mots de passe ne correspondent pas';
      return;
    }
    await auth.registerWithUsername(email.value, password.value, username.value || generateUsername());
    try { localStorage.setItem('username', username.value || ''); } catch {}
    router.push({ name: 'home' });
  } catch (e) {
    console.error(e);
    errorMessage.value = 'Inscription échouée';
  } finally {
    loading.value = false;
  }
}

function generateUsername() {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `user-${suffix}`;
}
</script>
