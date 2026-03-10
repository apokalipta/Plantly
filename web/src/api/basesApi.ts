import { http } from './httpClient';

export async function pairBase(payload: { pairingCode: string; name?: string }): Promise<{ id: string }> {
  return http('/bases/pair', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getMyBases(): Promise<any[]> {
  return http('/bases', { method: 'GET' });
}

export async function getBaseDetails(id: string): Promise<any> {
  return http(`/bases/${id}`, { method: 'GET' });
}

export async function patchSlots(id: string, slots: Array<{ slotIndex: number; potFormat: 'SMALL' | 'MEDIUM' | 'LARGE'; isActive: boolean }>): Promise<{ status: string }> {
  return http(`/bases/${id}/slots`, { method: 'PATCH', body: JSON.stringify({ slots }) });
}

export async function patchSlotPlant(id: string, slotIndex: number, payload: { speciesId: number; nickname?: string }): Promise<{ status: string }> {
  return http(`/bases/${id}/slots/${slotIndex}/plant`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function getSlotMeasurements(id: string, slotIndex: number, limit: number = 50): Promise<any[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return http(`/bases/${id}/slots/${slotIndex}/measurements?${params.toString()}`, { method: 'GET' });
}
