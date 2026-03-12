<template>
  <section class="section">
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h1 class="mb-0">Boutique</h1>
        <div class="d-flex align-items-center gap-2 mt-2 mt-md-0">
          <label class="text-muted mb-0 mr-2" for="shop-category">Catégorie</label>
          <select id="shop-category" class="form-control" style="min-width: 220px;" v-model="category">
            <option value="ALL">Toutes</option>
            <option v-for="c in categories" :key="c" :value="c">{{ formatCategory(c) }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading">Chargement…</div>
      <div v-else-if="error" class="text-danger">{{ error }}</div>
      <div v-else class="row">
        <div v-for="p in products" :key="p.id" class="col-md-6 col-lg-4 mb-3">
          <div class="card shadow border-0 p-3 h-100 d-flex flex-column shop-card">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div class="d-flex align-items-center flex-wrap gap-2">
                <span v-if="p.category" class="badge badge-info">{{ formatCategory(p.category) }}</span>
                <span v-if="isFloralyPremium(p)" class="shop-premium-badge">Série signature</span>
              </div>
              <span class="text-muted font-weight-bold">{{ formatPrice(p.price) }}</span>
            </div>
            <div class="text-center mb-2 shop-image-wrap">
              <img
                v-if="p.imageUrl"
                :src="resolveImageUrl(p.imageUrl)"
                :alt="p.name || 'Produit'"
                class="img-fluid rounded-2xl shadow-soft"
                style="height: 160px; width: 100%; object-fit: cover;"
              />
            </div>
            <h2 class="h5 mb-2">{{ p.name }}</h2>
            <p class="text-muted mb-3" style="min-height: 3.2em; overflow: hidden;">
              {{ p.description }}
            </p>
            <div class="d-flex gap-2 mt-auto">
              <button class="btn btn-standard flex-fill btn-anthracite-outline" @click="openProduct(p.id)">Voir</button>
              <button class="btn btn-standard flex-fill btn-anthracite" @click="addQuick(p)">Ajouter</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!loading && !error && products.length === 0" class="text-muted">
        Aucun produit pour le moment.
      </div>
    </div>
  </section>
</template>

<script setup>
// Intention: Page catalogue boutique avec grille produits et filtre catégorie
// Objectif: Charger les produits depuis l’API et permettre l’ajout rapide au panier
// Logique: Requêtes GET /products, filtrage par query, et actions via store panier
import { onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import * as productsApi from '@/api/productsApi';

const router = useRouter();
const cart = useCartStore();

const loading = ref(false);
const error = ref('');
const products = ref([]);

const categories = ['SEED', 'ACCESSORY', 'POT', 'SOIL'];
const category = ref('ALL');

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

async function loadProducts() {
  loading.value = true;
  error.value = '';
  try {
    const c = category.value === 'ALL' ? '' : category.value;
    const data = await productsApi.getProducts(c);
    products.value = Array.isArray(data) ? data : [];
  } catch (e) {
    console.error(e);
    error.value = 'Erreur lors du chargement des produits.';
  } finally {
    loading.value = false;
  }
}

function openProduct(id) {
  router.push({ name: 'shop-product', params: { id } });
}

function addQuick(p) {
  cart.addProduct(p, 1);
}

function isFloralyPremium(p) {
  const name = String(p?.name || '');
  return /floraly\s+premium/i.test(name);
}

onMounted(loadProducts);
watch(category, loadProducts);
</script>

<style scoped>
.shop-card {
  background: #fafaf9;
  border-radius: 1.25rem;
}

.shop-image-wrap {
  min-height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rounded-2xl {
  border-radius: 1rem;
}

.shadow-soft {
  box-shadow: 0 18px 60px rgba(41, 37, 36, 0.12);
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
