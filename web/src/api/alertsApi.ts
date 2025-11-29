import { http } from './httpClient';

export async function getPotAlerts(potId: string, onlyUnresolved: boolean = true): Promise<any[]> {
  const qs = onlyUnresolved ? '?onlyUnresolved=true' : '';
  return http(`/pots/${potId}/alerts${qs}`, { method: 'GET' });
}

