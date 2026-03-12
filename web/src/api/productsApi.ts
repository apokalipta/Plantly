import { http } from './httpClient';
// Intention: Accéder aux produits de la boutique (catalogue + fiche).
// Objectif: Centraliser les appels API /products utilisés par les vues boutique.
// Logique: GET liste avec filtre catégorie optionnel, et GET détail par id.

export async function getProducts(category?: string): Promise<any[]> {
  const c = String(category || '').trim();
  const q = c ? `?category=${encodeURIComponent(c)}` : '';
  return http(`/products${q}`, { method: 'GET' });
}

export async function getProductById(id: string): Promise<any> {
  return http(`/products/${encodeURIComponent(id)}`, { method: 'GET' });
}

