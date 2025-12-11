<template>
  <section class="section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <div class="card card-static shadow border-0 p-4">
            <h1 class="mb-3">Profil</h1>
            <div v-if="toastMessage" class="alert alert-success">{{ toastMessage }}</div>
            <div v-if="toastError" class="alert alert-danger">{{ toastError }}</div>

            <div class="d-flex align-items-center mb-3">
              <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width:80px; height:80px; overflow:hidden;">
                <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" style="width:100%; height:100%; object-fit:cover;" />
                <span v-else class="text-muted">A</span>
              </div>
              <div class="ml-3 flex-fill">
                <p class="text-muted mb-1">{{ displayedUsername || localUsername }}</p>
                <button class="btn btn-outline-primary btn-standard" @click="openAvatarModal">Changer la photo</button>
              </div>
            </div>

            <div class="form-group">
              <label>Nom d’utilisateur</label>
              <input v-model="formUsername" type="text" placeholder="Votre nom" class="form-control" />
            </div>
            <div class="d-flex gap-2 mb-3">
              <button class="btn btn-primary btn-standard" @click="saveProfile" :disabled="saving">Enregistrer</button>
              <button class="btn btn-secondary btn-standard" @click="logout">Se déconnecter</button>
            </div>

            <div class="mt-3">
              <h2 class="h5">Mot de passe</h2>
              <p class="text-muted">Changer le mot de passe.</p>
              <div class="row">
                <div class="col-md-4 mb-2"><input v-model="currentPassword" type="password" placeholder="Mot de passe actuel" class="form-control" /></div>
                <div class="col-md-4 mb-2"><input v-model="newPassword" type="password" placeholder="Nouveau mot de passe" class="form-control" /></div>
                <div class="col-md-4 mb-2"><input v-model="confirmPassword" type="password" placeholder="Confirmer" class="form-control" /></div>
              </div>
              <button class="btn btn-outline-primary btn-standard mt-2" @click="changePassword" :disabled="savingPw">Changer le mot de passe</button>
              <p v-if="messagePw" :class="pwError ? 'text-danger' : 'text-success'" class="mt-2">{{ messagePw }}</p>
            </div>

            <div class="mt-3">
              <h2 class="h5">Succès</h2>
              <p class="text-muted">Consultez vos succès débloqués et objectifs.</p>
              <router-link :to="{ name: 'achievements' }" class="btn btn-info btn-sm">Voir mes succès</router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAvatarModal" class="position-fixed" style="inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1050;">
      <div class="card shadow border-0 p-3" style="width:420px;">
        <h3 class="mb-3">Changer la photo</h3>
        <div class="d-flex align-items-center mb-3">
          <div class="rounded-circle bg-light d-flex align-items-center justify-content-center" style="width:80px; height:80px; overflow:hidden;">
            <img v-if="modalPreview" :src="modalPreview" alt="preview" style="width:100%; height:100%; object-fit:cover;" />
            <span v-else class="text-muted">A</span>
          </div>
          <div class="ml-3 flex-fill">
            <input type="file" accept="image/*" @change="onModalFileChange" class="form-control" />
          </div>
        </div>
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-primary btn-standard" @click="confirmAvatarChange" :disabled="modalSaving || !modalSelectedFile">Confirmer</button>
          <button class="btn btn-secondary btn-standard" @click="closeAvatarModal" :disabled="modalSaving">Annuler</button>
        </div>
        <div v-if="modalError" class="alert alert-danger mt-2">{{ modalError }}</div>
      </div>
    </div>
  </section>
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
