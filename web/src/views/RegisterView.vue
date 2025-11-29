<template>
  <div class="card" style="max-width: 520px; margin: 3rem auto;">
    <h1 style="margin-bottom: 1rem">Inscription</h1>
    <form @submit.prevent="submit">
      <div style="margin-bottom: 0.75rem;">
        <label>Email</label>
        <input v-model="email" type="email" required style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
      </div>
      <div style="margin-bottom: 0.75rem;">
        <label>Mot de passe</label>
        <input v-model="password" type="password" required style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
      </div>
      <div style="margin-bottom: 1rem;">
        <label>Confirmer le mot de passe</label>
        <input v-model="passwordConfirm" type="password" required style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
      </div>
      <button class="btn" type="submit" :disabled="loading" style="width:100%;">Créer le compte</button>
      <p v-if="errorMessage" style="color:#ef4444; margin-top:0.75rem;">{{ errorMessage }}</p>
      <p class="muted" style="margin-top:0.75rem;">Déjà inscrit ? <router-link to="/login">Se connecter</router-link></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const email = ref('');
const password = ref('');
const passwordConfirm = ref('');
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
    await auth.register(email.value, password.value);
    router.push({ name: 'home' });
  } catch (e) {
    console.error(e);
    errorMessage.value = 'Inscription échouée';
  } finally {
    loading.value = false;
  }
}
</script>
