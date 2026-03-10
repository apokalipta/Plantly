import { http } from './httpClient';
// Intention: Gérer les appels relatifs aux pots (liste, détails, mesures)
// Objectif: Centraliser les accès côté frontend et clarifier les types attendus
// Logique: GET/POST vers endpoints /pots avec pagination/limites et liaison

export async function getMyPots(): Promise<any[]> {
  // TODO: type properly PotSummary[]
  return http('/pots', { method: 'GET' });
}

export async function getPotDetails(id: string): Promise<any> {
  // TODO: type properly PotDetails
  return http(`/pots/${id}`, { method: 'GET' });
}

export async function getPotAlerts(id: string): Promise<any[]> {
  // TODO: type properly AlertDto[]
  return http(`/pots/${id}/alerts`, { method: 'GET' });
}

export async function getPotMeasurements(potId: string, limit: number = 50): Promise<any[]> {
  // TODO: type properly MeasurementDto[]
  const params = new URLSearchParams({ limit: String(limit) });
  return http(`/pots/${potId}/measurements?${params.toString()}`, { method: 'GET' });
}

export async function linkPot(payload: {
  deviceUid: string;
  pairingCode: string;
  name?: string;
  speciesId?: number;
  plantNickname?: string;
}): Promise<any> {
  // TODO: type properly PotDetails
  return http('/pots/link', { method: 'POST', body: JSON.stringify(payload) });
}

export async function removePotPlant(potId: string): Promise<{ status?: string } | void> {
  return http(`/pots/${potId}/plant`, { method: 'DELETE' });
}

