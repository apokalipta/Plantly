<template>
  <section class="section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="card shadow border-0 p-4">
            <h1 class="mb-3">Ajouter un pot</h1>
            <form @submit.prevent="onSubmit">
              <div class="form-group">
                <label for="deviceUid">UID de l’appareil</label>
                <input id="deviceUid" v-model="deviceUid" type="text" placeholder="PLANT-ABC-001" class="form-control" />
              </div>
              <div class="form-group">
                <label for="pairingCode">Code d’appairage</label>
                <input id="pairingCode" v-model="pairingCode" type="text" placeholder="123456" class="form-control" />
              </div>
              <div class="form-group">
                <label for="name">Nom (optionnel)</label>
                <input id="name" v-model="name" type="text" placeholder="Mon pot" class="form-control" />
              </div>
              <button class="btn btn-primary btn-standard btn-block" type="submit" :disabled="loading">Lier le pot</button>
              <p v-if="errorMessage" class="text-danger mt-2">{{ errorMessage }}</p>
              <p v-if="successMessage" class="text-success mt-2">{{ successMessage }}</p>
              <p class="text-muted mt-3"><router-link to="/pots">← Retour à mes pots</router-link></p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
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
