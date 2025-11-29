<template>
  <div class="card" style="max-width: 520px; margin: 3rem auto;">
    <h1 style="margin-bottom: 1rem">Connexion</h1>
    <form @submit.prevent="submit">
      <div style="margin-bottom: 0.75rem;">
        <label>Email</label>
        <input v-model="email" type="email" required style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Mot de passe</label>
        <input v-model="password" type="password" required style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
      </div>
      <button class="btn" type="submit" :disabled="loading" style="width:100%;">Se connecter</button>
      <p v-if="errorMessage" style="color:#ef4444; margin-top:0.75rem;">{{ errorMessage }}</p>
      <p class="muted" style="margin-top:0.75rem;">Pas de compte ? <router-link to="/register">Créer un compte</router-link></p>
    </form>
  </div>
</template>

<script setup>
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
