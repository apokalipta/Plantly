<template>
  <div class="page-container">
    <div class="card" style="max-width:760px; margin:0 auto;">
      <h1>Profil</h1>
      <div v-if="toastMessage" class="mk-card" style="background:#d1fae5; color:#064e3b; border:1px solid #a7f3d0; margin-top:0.5rem;">
        {{ toastMessage }}
      </div>
      <div style="display:flex; gap:1rem; align-items:center; margin-top:0.75rem;">
        <div style="width:80px; height:80px; border-radius:50%; background:#1f2937; overflow:hidden; display:flex; align-items:center; justify-content:center;">
          <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" style="width:100%; height:100%; object-fit:cover;" />
          <span v-else class="muted">A</span>
        </div>
        <div style="flex:1;">
          <p class="muted" style="margin:0 0 0.25rem 0">{{ username || localUsername }}</p>
          <label>Photo de profil</label>
          <input type="file" accept="image/*" @change="onAvatarChange" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        </div>
      </div>

      <div style="margin-top:1rem;">
        <label>Nom d’utilisateur</label>
        <input v-model="username" type="text" placeholder="Votre nom" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
      </div>

      <div style="display:flex; gap:0.5rem; margin-top:0.75rem;">
        <button class="btn" @click="saveProfile" :disabled="saving">Enregistrer</button>
        <button class="btn" @click="logout">Se déconnecter</button>
      </div>

      <div style="margin-top:1.25rem;">
        <h2>Mot de passe</h2>
        <p class="muted">Changer le mot de passe.</p>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; margin-top:0.5rem;">
          <input v-model="currentPassword" type="password" placeholder="Mot de passe actuel" style="padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
          <input v-model="newPassword" type="password" placeholder="Nouveau mot de passe" style="padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
          <input v-model="confirmPassword" type="password" placeholder="Confirmer" style="padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        </div>
        <button class="btn" style="margin-top:0.5rem" @click="changePassword" :disabled="savingPw">Changer le mot de passe</button>
        <p v-if="messagePw" :style="{ color: pwError ? '#ef4444' : '#22c55e', marginTop: '0.5rem' }">{{ messagePw }}</p>
      </div>

      <div style="margin-top:1.25rem">
        <h2>Succès</h2>
        <p class="muted">Consultez vos succès débloqués et objectifs.</p>
        <router-link :to="{ name: 'achievements' }"><button class="btn">Voir mes succès</button></router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import * as profileApi from '../api/profileApi';

const router = useRouter();
const auth = useAuthStore();

const avatarFile = ref(null);
const avatarPreview = ref('');
const username = ref('');
const localUsername = ref('');
const saving = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const savingPw = ref(false);
const messagePw = ref('');
const pwError = ref(false);
const toastMessage = ref('');

onMounted(async () => {
  try {
    const me = await profileApi.getMe();
    username.value = me?.username || '';
    avatarPreview.value = me?.avatarUrl || '';
  } catch (e) { /* silent: profile endpoint may be unimplemented */ }
  try { localUsername.value = localStorage.getItem('username') || ''; } catch {}
});

function onAvatarChange(e) {
  const file = e?.target?.files?.[0];
  if (file) {
    avatarFile.value = file;
    try { avatarPreview.value = URL.createObjectURL(file); } catch {}
  }
}

async function saveProfile() {
  saving.value = true;
  try {
    if (username.value) await profileApi.updateProfile({ username: username.value });
    if (avatarFile.value) {
      await profileApi.uploadAvatar(avatarFile.value);
      toastMessage.value = 'Photo de profil mise à jour';
      setTimeout(() => { toastMessage.value = ''; }, 2500);
    }
  } catch (e) { console.error(e); }
  saving.value = false;
}

async function logout() {
  try { await auth.logout(); } catch {}
  router.push({ name: 'login' });
}

async function changePassword() {
  messagePw.value = '';
  pwError.value = false;
  if (!currentPassword.value || !newPassword.value || newPassword.value !== confirmPassword.value) {
    pwError.value = true;
    messagePw.value = 'Renseignez le mot de passe actuel et vérifiez la confirmation';
    return;
  }
  savingPw.value = true;
  try {
    await profileApi.changePassword(currentPassword.value, newPassword.value);
    messagePw.value = 'Mot de passe mis à jour';
    pwError.value = false;
  } catch (e) {
    console.error(e);
    pwError.value = true;
    messagePw.value = 'Échec de la mise à jour du mot de passe';
  } finally {
    savingPw.value = false;
  }
}
</script>
