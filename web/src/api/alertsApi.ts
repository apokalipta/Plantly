import { http } from './httpClient';
// Intention: Lire les alertes associées à un pot
// Objectif: Supporter le filtrage par résolu/non résolu
// Logique: Construction de la query et appel via client HTTP commun

export async function getPotAlerts(potId: string, onlyUnresolved: boolean = true): Promise<any[]> {
  const qs = onlyUnresolved ? '?onlyUnresolved=true' : '';
  return http(`/pots/${potId}/alerts${qs}`, { method: 'GET' });
}
