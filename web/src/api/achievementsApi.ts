import { http } from './httpClient';

export async function getMyAchievements(): Promise<any[]> {
  // TODO: type properly AchievementDto[]
  return http('/me/achievements', { method: 'GET' });
}

