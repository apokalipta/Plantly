<template>
  <div>
    <header class="header-global">
      <nav class="navbar navbar-main navbar-expand-lg navbar-light bg-white">
        <div class="container">
          <router-link class="navbar-brand mr-lg-5" to="/">Plantly</router-link>
          <button class="navbar-toggler" type="button" @click="toggled = !toggled">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" :class="{ show: toggled }">
            <ul class="navbar-nav mr-auto">
              <li class="nav-item"><router-link class="nav-link" to="/">Accueil</router-link></li>
              <li class="nav-item" v-if="isAuth"><router-link class="nav-link" to="/mon-espace">Mon espace</router-link></li>
              <li class="nav-item" v-if="isAuth"><router-link class="nav-link" to="/pots">Pots</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/wiki">Wiki</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/boutique">Boutique</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/forum">Forum</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/scan">Scan</router-link></li>
              <li class="nav-item"><router-link class="nav-link" to="/tutorials">Tutoriels</router-link></li>
            </ul>
            <ul class="navbar-nav ml-auto">
              <li class="nav-item">
                <a class="nav-link" href="#" @click.prevent="openCart">Panier ({{ cartCount }})</a>
              </li>
              <template v-if="!isAuth">
                <li class="nav-item"><router-link class="nav-link" to="/login">Connexion</router-link></li>
                <li class="nav-item"><router-link class="nav-link" to="/register">Créer un compte</router-link></li>
              </template>
              <template v-else>
                <li class="nav-item"><router-link class="nav-link" to="/profile">Profil</router-link></li>
                <li class="nav-item"><a class="nav-link" href="#" @click.prevent="logout">Déconnexion</a></li>
              </template>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main class="container py-4">
      <router-view />
    </main>

    <footer class="footer py-4">
      <div class="container text-center">
        <div class="row">
          <div class="col-md-12">
            <p class="mb-0 text-muted">© Plantly — Tous droits réservés</p>
          </div>
        </div>
      </div>
    </footer>

    <div v-if="toastMessage" class="alert alert-success shop-toast" role="alert">
      {{ toastMessage }}
    </div>

    <div v-if="cartOpen" class="cart-backdrop" @click="closeCart"></div>
    <aside v-if="cartOpen" class="cart-drawer" aria-label="Panier">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="h5 mb-0">Panier</h2>
        <button class="btn btn-sm btn-outline-secondary" @click="closeCart">Fermer</button>
      </div>

      <div v-if="cartItems.length === 0" class="text-muted">Votre panier est vide.</div>

      <div v-else class="cart-items">
        <div v-for="it in cartItems" :key="it.product.id" class="card shadow border-0 p-3 mb-2">
          <div class="d-flex justify-content-between align-items-start">
            <div class="mr-2">
              <div class="font-weight-bold">{{ it.product.name }}</div>
              <div class="text-muted">{{ formatPrice(it.product.price) }}</div>
            </div>
            <button class="btn btn-sm btn-outline-danger" @click="remove(it.product.id)">Supprimer</button>
          </div>
          <div class="d-flex align-items-center justify-content-between mt-2">
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary" @click="decrement(it.product.id)">-</button>
              <input
                class="form-control form-control-sm text-center"
                style="width: 72px;"
                type="number"
                min="1"
                :value="it.quantity"
                @input="onQtyInput(it.product.id, $event)"
              />
              <button class="btn btn-sm btn-outline-secondary" @click="increment(it.product.id)">+</button>
            </div>
            <div class="text-muted font-weight-bold">{{ formatPrice(lineTotal(it)) }}</div>
          </div>
        </div>
      </div>

      <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
        <div>
          <div class="text-muted">Total</div>
          <div class="h5 mb-0">{{ formatPrice(cartTotal) }}</div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-standard" :disabled="cartItems.length === 0" @click="clearCart">Vider</button>
          <button class="btn btn-primary btn-standard" :disabled="cartItems.length === 0" @click="pay">Payer</button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { usePotsStore } from '@/stores/pots';
import { useWikiStore } from '@/stores/wiki';
import { useAchievementsStore } from '@/stores/achievements';
import { useCartStore } from '@/stores/cart';

const auth = useAuthStore();
const isAuth = computed(() => auth.isAuthenticated);
const toggled = ref(false);
const router = useRouter();
const potsStore = usePotsStore();
const wikiStore = useWikiStore();
const achievementsStore = useAchievementsStore();
const cartStore = useCartStore();
const cartOpen = ref(false);
const toastMessage = ref('');

const cartItems = computed(() => cartStore.items || []);
const cartTotal = computed(() => cartStore.total);
const cartCount = computed(() => cartStore.itemsCount);

function openCart() {
  cartOpen.value = true;
}

function closeCart() {
  cartOpen.value = false;
}

function formatPrice(v) {
  const n = Number(v);
  const value = Number.isFinite(n) ? n : 0;
  return `${value.toFixed(2).replace('.', ',')} €`;
}

function lineTotal(it) {
  const price = Number(it?.product?.price) || 0;
  const q = Number(it?.quantity) || 0;
  return price * q;
}

function onQtyInput(id, evt) {
  const raw = evt?.target?.value;
  cartStore.setQuantity(String(id || ''), Number(raw));
}

function increment(id) {
  cartStore.increment(String(id || ''));
}

function decrement(id) {
  cartStore.decrement(String(id || ''));
}

function remove(id) {
  cartStore.removeProduct(String(id || ''));
}

function clearCart() {
  cartStore.clear();
}

function pay() {
  cartStore.clear();
  cartOpen.value = false;
  toastMessage.value = 'Commande validée';
  setTimeout(() => {
    toastMessage.value = '';
  }, 2500);
}

async function logout() {
  try { await auth.logout(); } catch {}
  try {
    potsStore.pots = [];
    potsStore.selectedPot = null;
    potsStore.loading = false;
    potsStore.error = null;
  } catch {}
  try {
    wikiStore.plants = [];
    wikiStore.selectedPlant = null;
    wikiStore.loading = false;
    wikiStore.error = null;
    wikiStore.favorites = [];
  } catch {}
  try {
    achievementsStore.achievements = [];
    achievementsStore.loading = false;
    achievementsStore.error = null;
  } catch {}
  try { localStorage.removeItem('username'); } catch {}
  try { router.replace({ name: 'login' }); } catch {}
  try { window.location.assign('/login'); } catch {}
}
</script>

<style scoped>
.navbar-main { border-bottom: 1px solid #e9ecef; }
.navbar-main .nav-link { font-weight: 600; padding: .5rem .75rem; border-radius: .5rem; transition: background-color .15s ease, color .15s ease; }
.navbar-main .nav-link:hover { background-color: #f8f9fa; color: #212529; }
.navbar-main .nav-link.router-link-active { background-color: #e9f2ff; color: #0d6efd; }

.shop-toast {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1060;
  min-width: 220px;
}

.cart-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1040;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(420px, 92vw);
  background: #fff;
  z-index: 1050;
  padding: 16px;
  overflow: auto;
  border-left: 1px solid #e9ecef;
}

.cart-items {
  max-height: calc(100vh - 260px);
  overflow: auto;
}
</style>
