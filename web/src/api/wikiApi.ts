import { http } from './httpClient';
// Intention: Accéder au wiki des plantes côté frontend
// Objectif: Offrir des méthodes de lecture filtrée et par identifiant
// Logique: Construction de querystring sûre et utilisation du client HTTP central

export async function getPlants(search?: string): Promise<any[]> {
  const q = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return http(`/wiki/plants${q}`, { method: 'GET' });
}

export async function getPlantById(id: number | string): Promise<any> {
  return http(`/wiki/plants/${id}`, { method: 'GET' });
}
