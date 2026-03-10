<template>
  <section class="section">
    <div class="container">
      <a href="#" @click.prevent="goBack" class="text-muted d-inline-block mb-2">← Retour</a>
      <div class="card shadow border-0 p-3">
        <div v-if="loading">Chargement…</div>
        <div v-else-if="error" class="text-danger">{{ error }}</div>
        <div v-else-if="base">
          <h1 class="mb-3">{{ base.name || base.baseUid }}</h1>

          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card shadow border-0 p-3 h-100">
                <h2 class="h5 mb-3">Slots</h2>
                <div class="slot-grid">
                  <button v-for="s in base.slots" :key="s.id" class="slot-cell"
                          :class="{ active: s.isActive, selected: s.slotIndex === selectedSlotIndex }"
                          @click="selectSlot(s.slotIndex)">
                    <div class="slot-index">{{ s.slotIndex }}</div>
                    <div class="slot-format">{{ s.potFormat }}</div>
                  </button>
                </div>
                <div class="mt-3">
                  <button class="btn btn-outline-secondary btn-standard" @click="toggleReconfig">{{ showReconfig ? 'Annuler' : 'Reconfigurer la base' }}</button>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card shadow border-0 p-3 h-100">
                <h2 class="h5 mb-3">Slot sélectionné</h2>
                <div v-if="currentSlot">
                  <p class="text-muted mb-1">Format: {{ currentSlot.potFormat }}</p>
                  <p class="text-muted mb-1">Actif: {{ currentSlot.isActive ? 'Oui' : 'Non' }}</p>

                  <h3 class="h6 mt-3">Plante</h3>
                  <p class="mb-2" v-if="currentSlot.plant">
                    Espèce: {{ currentSlot.plant.speciesId }}<br />
                    Surnom: {{ currentSlot.plant.nickname || '—' }}
                  </p>
                  <div class="mb-2" v-else>Pas de plante assignée</div>
                  <div class="d-flex gap-2">
                    <input v-model.number="plantSpeciesId" type="number" min="1" placeholder="Espèce ID" class="form-control" style="max-width: 160px;" />
                    <input v-model="plantNickname" type="text" placeholder="Surnom (facultatif)" class="form-control" style="max-width: 180px;" />
                    <button class="btn btn-primary btn-standard" :disabled="!plantSpeciesId || loading" @click="assignPlant">Changer la plante</button>
                  </div>

                  <h3 class="h6 mt-3">Alertes</h3>
                  <div v-if="(currentSlot.alerts || []).length === 0" class="text-muted">Aucune alerte en cours.</div>
                  <ul v-else class="list-group mb-3">
                    <li v-for="a in currentSlot.alerts" :key="a.id" class="list-group-item d-flex justify-content-between align-items-center">
                      <span>{{ a.type }}</span>
                      <span class="badge" :class="a.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'">{{ a.severity }}</span>
                    </li>
                  </ul>

                  <h3 class="h6 mt-3">Dernières mesures</h3>
                  <div v-if="loadingMeasurements">Chargement des mesures…</div>
                  <div v-else-if="errorMeasurements" class="text-danger">{{ errorMeasurements }}</div>
                  <MeasurementsChart v-else :measurements="measurements" />
                </div>
              </div>
            </div>
          </div>

          <div v-if="showReconfig" class="card shadow border-0 p-3">
            <h2 class="h5">Reconfigurer la base</h2>
            <p class="text-muted">Choisissez le format et l’activation de chaque slot. Les règles de capacité seront validées.</p>
            <div class="row">
              <div v-for="s in reconfigSlots" :key="s.slotIndex" class="col-md-3 mb-3">
                <div class="card border-0 shadow p-2">
                  <div class="mb-2"><strong>Slot {{ s.slotIndex }}</strong></div>
                  <select v-model="s.potFormat" class="form-select">
                    <option value="SMALL">SMALL</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LARGE">LARGE</option>
                  </select>
                  <div class="form-check mt-2">
                    <input class="form-check-input" type="checkbox" :id="`active-${s.slotIndex}`" v-model="s.isActive" />
                    <label class="form-check-label" :for="`active-${s.slotIndex}`">Actif</label>
                  </div>
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-success btn-standard" :disabled="loading" @click="applyReconfig">Appliquer</button>
              <button class="btn btn-secondary btn-standard" @click="toggleReconfig">Fermer</button>
            </div>
            <div v-if="error" class="text-danger mt-2">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBasesStore } from '../stores/bases';
import { storeToRefs } from 'pinia';
import MeasurementsChart from '@/components/MeasurementsChart.vue';

const route = useRoute();
const router = useRouter();
const basesStore = useBasesStore();
const { selectedBase: base, selectedSlotIndex, loading, error, measurements, loadingMeasurements, errorMeasurements } = storeToRefs(basesStore);

const baseId = computed(() => String(route.params.id || ''));
const showReconfig = ref(false);
const plantSpeciesId = ref(null);
const plantNickname = ref('');

onMounted(async () => {
  if (baseId.value) {
    await basesStore.fetchBaseById(baseId.value);
    await loadSlotMeasurements();
  }
});

watch(selectedSlotIndex, async () => {
  await loadSlotMeasurements();
});

async function loadSlotMeasurements() {
  if (!baseId.value) return;
  await basesStore.fetchSlotMeasurements(baseId.value, selectedSlotIndex.value, 50);
}

function goBack() { router.push({ name: 'bases' }); }
const currentSlot = computed(() => {
  try { return (base.value?.slots || []).find((s) => s.slotIndex === selectedSlotIndex.value) || null; } catch { return null; }
});
function selectSlot(i) { basesStore.selectSlot(i); }
function toggleReconfig() {
  showReconfig.value = !showReconfig.value;
  if (showReconfig.value) {
    reconfigSlots.value = (base.value?.slots || []).map((s) => ({ slotIndex: s.slotIndex, potFormat: String(s.potFormat), isActive: !!s.isActive }));
  }
}
const reconfigSlots = ref([]);
async function applyReconfig() {
  if (!baseId.value) return;
  await basesStore.reconfigureSlots(baseId.value, reconfigSlots.value);
  if (!error.value) showReconfig.value = false;
}
async function assignPlant() {
  if (!baseId.value || !plantSpeciesId.value) return;
  await basesStore.changeSlotPlant(baseId.value, selectedSlotIndex.value, { speciesId: Number(plantSpeciesId.value), nickname: plantNickname.value || undefined });
  plantSpeciesId.value = null;
  plantNickname.value = '';
  await loadSlotMeasurements();
}
</script>

<style scoped>
.slot-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.slot-cell { border: 1px solid #ddd; border-radius: .5rem; padding: .5rem; background: #fafafa; text-align: center; cursor: pointer; }
.slot-cell.active { background: #eef9ee; }
.slot-cell.selected { outline: 2px solid var(--accent, #4caf50); }
.slot-index { font-weight: 600; }
.slot-format { font-size: .85rem; color: #666; }
</style>
