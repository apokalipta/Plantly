<template>
  <div class="page-container">
    <div class="card" style="max-width:760px; margin:0 auto;">
      <h1>profile</h1>
      <div v-if="toastMessage" class="mk-card" style="background:#d1fae5; color:#064e3b; border:1px solid #a7f3d0; margin-top:0.5rem;">
        {{ toastMessage }}
      </div>
      <div v-if="toastError" class="mk-card" style="background:#fee2e2; color:#7f1d1d; border:1px solid #fecaca; margin-top:0.5rem;">
        {{ toastError }}
      </div>
      <div style="display:flex; gap:1rem; align-items:center; margin-top:0.75rem;">
        <div style="width:80px; height:80px; border-radius:50%; background:#1f2937; overflow:hidden; display:flex; align-items:center; justify-content:center;">
          <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" style="width:100%; height:100%; object-fit:cover;" />
          <span v-else class="muted">A</span>
        </div>
        <div style="flex:1;">
          <p class="muted" style="margin:0 0 0.25rem 0">{{ displayedUsername || localUsername }}</p>
          <button class="btn" @click="openAvatarModal">Change profile picture</button>
        </div>
      </div>

      <div style="margin-top:1rem;">
        <label>Nom d’utilisateur</label>
        <input v-model="formUsername" type="text" placeholder="Votre nom" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
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

      <div v-if="showAvatarModal" style="position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:50;">
        <div class="card" style="width:420px; background:#0f172a; border:1px solid #1f2937; border-radius:12px; padding:1rem;">
          <h3 style="margin-top:0;">Change profile picture</h3>
          <div style="display:flex; gap:1rem; align-items:center; margin:0.75rem 0;">
            <div style="width:80px; height:80px; border-radius:50%; background:#1f2937; overflow:hidden; display:flex; align-items:center; justify-content:center;">
              <img v-if="modalPreview" :src="modalPreview" alt="preview" style="width:100%; height:100%; object-fit:cover;" />
              <span v-else class="muted">A</span>
            </div>
            <div style="flex:1;">
              <input type="file" accept="image/*" @change="onModalFileChange" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
            <button class="btn" @click="confirmAvatarChange" :disabled="modalSaving || !modalSelectedFile">Confirm</button>
            <button class="btn" @click="closeAvatarModal" :disabled="modalSaving">Cancel</button>
          </div>
          <div v-if="modalError" class="mk-card" style="background:#fee2e2; color:#7f1d1d; border:1px solid #fecaca; margin-top:0.5rem;">
            {{ modalError }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Intention: Vue profil utilisateur (nom, avatar, mot de passe)
// Objectif: Modifier et persister les informations avec feedback visuel
// Logique: Appels API profil, modale avatar et gestion des toasts/erreurs
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import * as profileApi from '../api/profileApi';

const router = useRouter();
const auth = useAuthStore();

const avatarPreview = ref('');
const displayedUsername = ref('');
const formUsername = ref('');
const localUsername = ref('');
const saving = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const savingPw = ref(false);
const messagePw = ref('');
const pwError = ref(false);
const toastMessage = ref('');
const toastError = ref('');
const showAvatarModal = ref(false);
const modalSelectedFile = ref(null);
const modalPreview = ref('');
const modalSaving = ref(false);
const modalError = ref('');

onMounted(async () => {
  try {
    const me = await profileApi.getMe();
    displayedUsername.value = me?.username || '';
    formUsername.value = me?.username || '';
    avatarPreview.value = me?.avatarUrl || '';
  } catch (e) {}
  try { localUsername.value = localStorage.getItem('username') || ''; } catch {}
  if (!displayedUsername.value && localUsername.value) displayedUsername.value = localUsername.value;
});

function openAvatarModal() {
  showAvatarModal.value = true;
  modalSelectedFile.value = null;
  modalPreview.value = '';
  modalError.value = '';
}

function closeAvatarModal() {
  if (modalSaving.value) return;
  showAvatarModal.value = false;
  modalSelectedFile.value = null;
  modalPreview.value = '';
  modalError.value = '';
}

function onModalFileChange(e) {
  const file = e?.target?.files?.[0];
  if (file) {
    modalSelectedFile.value = file;
    try { modalPreview.value = URL.createObjectURL(file); } catch {}
  }
}

async function saveProfile() {
  saving.value = true;
  try {
    toastError.value = '';
    if (formUsername.value) {
      await profileApi.updateProfile({ username: formUsername.value });
      displayedUsername.value = formUsername.value;
      try { localStorage.setItem('username', formUsername.value); } catch {}
      toastMessage.value = 'Nom d’utilisateur mis à jour';
      setTimeout(() => { toastMessage.value = ''; }, 2500);
    }
  } catch (e) {
    console.error(e);
    toastError.value = 'Échec de mise à jour du nom d’utilisateur';
    setTimeout(() => { toastError.value = ''; }, 3000);
  }
  saving.value = false;
}

async function confirmAvatarChange() {
  modalSaving.value = true;
  modalError.value = '';
  try {
    if (modalSelectedFile.value) {
      const res = await profileApi.uploadAvatar(modalSelectedFile.value);
      if (res?.url) {
        avatarPreview.value = res.url;
      } else {
        avatarPreview.value = modalPreview.value || avatarPreview.value;
      }
      toastMessage.value = 'Profile picture updated';
      setTimeout(() => { toastMessage.value = ''; }, 2500);
    }
    showAvatarModal.value = false;
  } catch (e) {
    console.error(e);
    modalError.value = 'Failed to update profile picture';
  } finally {
    modalSaving.value = false;
  }
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
