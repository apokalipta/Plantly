<template>
  <section class="section">
    <div class="container">
      <a href="#" @click.prevent="goBack" class="text-muted d-inline-block mb-2">← Retour à la boutique</a>

      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else-if="product" class="card shadow border-0 p-4 shop-product-card">
        <div class="row">
          <div class="col-md-5 text-center mb-3 mb-md-0">
            <div class="product-image-wrap bg-slate-200 rounded-3xl overflow-hidden shadow-soft">
              <img
                v-if="product.imageUrl"
                :src="resolveImageUrl(product.imageUrl)"
                :alt="product.name || 'Produit'"
                class="product-image"
              />
            </div>
          </div>
          <div class="col-md-7">
            <div class="d-flex align-items-center mb-2">
              <h1 class="mb-0 mr-3" :class="isFloraly ? 'text-emerald-900' : ''">{{ product.name }}</h1>
              <span v-if="product.category" class="badge badge-info p-2">{{ formatCategory(product.category) }}</span>
              <span v-if="isFloralyPremium" class="shop-premium-badge ml-2">Série signature</span>
            </div>
            <p class="text-muted font-weight-bold mb-3" style="font-size: 1.1rem;">{{ formatPrice(product.price) }}</p>
            <p class="text-muted mb-4" style="white-space: pre-line;">{{ product.description }}</p>

            <div class="d-flex gap-2">
              <button class="btn btn-standard btn-anthracite" @click="addToCart">Ajouter au panier</button>
              <button class="btn btn-standard btn-anthracite-outline" @click="goBack">Continuer mes achats</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-muted">Produit introuvable.</div>
    </div>
  </section>
</template>

<script setup>
// Intention: Page fiche produit boutique
// Objectif: Charger le produit par id et permettre l’ajout au panier
// Logique: Requête GET /products/:id, états loading/error, actions via store panier
import { computed, onMounted, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import * as productsApi from '@/api/productsApi';

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const id = computed(() => (typeof route.params.id === 'string' ? route.params.id : ''));
const loading = ref(false);
const error = ref('');
const product = ref(null);
const isFloraly = computed(() => /floraly/i.test(String(product.value?.name || '')));
const isFloralyPremium = computed(() => /floraly\s+premium/i.test(String(product.value?.name || '')));

function resolveImageUrl(u) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const root = base.endsWith('/api') ? base.slice(0, -4) : base;
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  if (u.startsWith('/')) return `${root}${u}`;
  return u;
}

function formatCategory(c) {
  const map = {
    SEED: 'Graines',
    ACCESSORY: 'Accessoires',
    POT: 'Pots',
    SOIL: 'Terreaux',
  };
  return map[String(c || '')] || String(c || '');
}

function formatPrice(v) {
  const n = Number(v);
  const value = Number.isFinite(n) ? n : 0;
  return `${value.toFixed(2).replace('.', ',')} €`;
}

async function loadById(productId) {
  const pid = String(productId || '').trim();
  if (!pid) return;
  loading.value = true;
  error.value = '';
  product.value = null;
  try {
    product.value = await productsApi.getProductById(pid);
  } catch (e) {
    console.error(e);
    error.value = 'Erreur lors du chargement du produit.';
  } finally {
    loading.value = false;
  }
}

function addToCart() {
  if (!product.value) return;
  cart.addProduct(product.value, 1);
}

function goBack() {
  router.push({ name: 'shop' });
}

onMounted(() => {
  if (id.value) loadById(id.value);
});
onBeforeRouteUpdate((to) => {
  const newId = typeof to.params.id === 'string' ? to.params.id : '';
  if (newId) loadById(newId);
});
</script>

<style scoped>
.shop-product-card {
  background: #fafaf9;
  border-radius: 1.25rem;
}

.text-emerald-900 { color: #064e3b; }
.bg-slate-200 { background: #e2e8f0; }
.rounded-3xl { border-radius: 1.5rem; }
.overflow-hidden { overflow: hidden; }
.shadow-soft { box-shadow: 0 26px 90px rgba(41, 37, 36, 0.14); }

.product-image-wrap {
  width: 100%;
  aspect-ratio: 4 / 3;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1.5rem;
}

.btn-anthracite {
  background: #2d2d2d;
  border-color: #2d2d2d;
  color: #fff;
}

.btn-anthracite:hover {
  background: #3a3a3a;
  border-color: #3a3a3a;
  color: #fff;
}

.btn-anthracite-outline {
  background: transparent;
  border: 1px solid rgba(45, 45, 45, 0.35);
  color: #2d2d2d;
}

.btn-anthracite-outline:hover {
  background: rgba(45, 45, 45, 0.06);
  border-color: rgba(45, 45, 45, 0.5);
  color: #2d2d2d;
}

.shop-premium-badge {
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  background: rgba(249, 247, 242, 0.85);
  border: 1px solid rgba(120, 113, 108, 0.25);
  color: #292524;
}
</style>
