import { defineStore } from 'pinia';
// Intention: Store Pinia du panier (ajout, quantité, suppression, total)
// Objectif: Fournir un panier simple pour la boutique mock sans persistance avancée
// Logique: Stocke un snapshot minimal du produit + quantité et expose des getters calculés

type CartProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
};

type CartItem = {
  product: CartProduct;
  quantity: number;
};

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
  }),
  getters: {
    itemsCount: (state) => state.items.reduce((acc, it) => acc + (it?.quantity || 0), 0),
    total: (state) => state.items.reduce((acc, it) => acc + (Number(it?.product?.price) || 0) * (it?.quantity || 0), 0),
  },
  actions: {
    addProduct(product: any, quantity: number = 1) {
      const q = Math.max(1, Number(quantity) || 1);
      const p: CartProduct = {
        id: String(product?.id || ''),
        name: String(product?.name || ''),
        price: Number(product?.price) || 0,
        imageUrl: product?.imageUrl ?? undefined,
        category: product?.category ?? undefined,
      };
      if (!p.id) return;
      const existing = this.items.find((it) => it?.product?.id === p.id);
      if (existing) {
        existing.quantity = Math.max(1, (existing.quantity || 0) + q);
        return;
      }
      this.items.push({ product: p, quantity: q });
    },
    setQuantity(productId: string, quantity: number) {
      const id = String(productId || '');
      const q = Number(quantity);
      const idx = this.items.findIndex((it) => it?.product?.id === id);
      if (idx < 0) return;
      if (!Number.isFinite(q) || q <= 0) {
        this.items.splice(idx, 1);
        return;
      }
      this.items[idx].quantity = Math.floor(q);
    },
    increment(productId: string) {
      const it = this.items.find((x) => x?.product?.id === String(productId || ''));
      if (!it) return;
      it.quantity = (it.quantity || 0) + 1;
    },
    decrement(productId: string) {
      const it = this.items.find((x) => x?.product?.id === String(productId || ''));
      if (!it) return;
      const next = (it.quantity || 0) - 1;
      if (next <= 0) {
        this.removeProduct(productId);
        return;
      }
      it.quantity = next;
    },
    removeProduct(productId: string) {
      const id = String(productId || '');
      this.items = this.items.filter((it) => it?.product?.id !== id);
    },
    clear() {
      this.items = [];
    },
  },
});
