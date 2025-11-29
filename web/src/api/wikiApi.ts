import { http } from './httpClient';

export async function getPlants(search?: string): Promise<any[]> {
  const q = search && search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return http(`/wiki/plants${q}`, { method: 'GET' });
}

export async function getPlantById(id: number | string): Promise<any> {
  return http(`/wiki/plants/${id}`, { method: 'GET' });
}

