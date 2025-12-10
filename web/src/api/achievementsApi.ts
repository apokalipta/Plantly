import { http } from './httpClient';
// Intention: Récupérer les succès de l’utilisateur courant
// Objectif: Exposer une API simple au store pour l’affichage des succès
// Logique: GET /me/achievements et typage à améliorer côté frontend

export async function getMyAchievements(): Promise<any[]> {
  // TODO: type properly AchievementDto[]
  return http('/me/achievements', { method: 'GET' });
}
