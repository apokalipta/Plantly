import { http } from './httpClient';

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

