<template>
  <div class="page-container">
    <div class="card" style="max-width: 640px; margin: 0 auto;">
      <h1>Ajouter un pot</h1>
      <form @submit.prevent="onSubmit" style="margin-top:1rem;">
        <div style="margin-bottom:0.75rem;">
          <label>UID de l’appareil</label>
          <input v-model="deviceUid" type="text" placeholder="PLANT-ABC-001" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        </div>
        <div style="margin-bottom:0.75rem;">
          <label>Code d’appairage</label>
          <input v-model="pairingCode" type="text" placeholder="123456" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        </div>
        <div style="margin-bottom:0.75rem;">
          <label>Nom (optionnel)</label>
          <input v-model="name" type="text" placeholder="Mon pot" style="width:100%; padding:0.5rem; border-radius:8px; border:1px solid #1f2937; background:#0f172a; color:#e5e7eb;" />
        </div>
        <button class="btn" type="submit" :disabled="loading" style="width:100%;">Lier le pot</button>
      </form>

      <p v-if="errorMessage" style="color:#ef4444; margin-top:0.75rem;">{{ errorMessage }}</p>
      <p v-if="successMessage" style="color:#22c55e; margin-top:0.75rem;">{{ successMessage }}</p>

      <p class="muted" style="margin-top:1rem;">
        <router-link to="/pots">← Retour à mes pots</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { linkPot } from '../api/potsApi';

const router = useRouter();
const deviceUid = ref('');
const pairingCode = ref('');
const name = ref('');
const loading = ref(false);
const errorMessage = ref(null);
const successMessage = ref(null);

async function onSubmit() {
  errorMessage.value = null;
  successMessage.value = null;
  if (!deviceUid.value || !pairingCode.value) {
    errorMessage.value = 'UID et code d’appairage sont requis';
    return;
  }
  loading.value = true;
  try {
    await linkPot({ deviceUid: deviceUid.value, pairingCode: pairingCode.value, name: name.value || undefined });
    successMessage.value = 'Pot ajouté avec succès.';
    router.push({ name: 'pots' });
  } catch (e) {
    console.error(e);
    errorMessage.value = 'Échec du lien du pot. Vérifiez le code et réessayez.';
  } finally {
    loading.value = false;
  }
}
</script>
