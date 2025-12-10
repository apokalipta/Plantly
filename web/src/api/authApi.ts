import { http } from './httpClient';
// Intention: Encapsuler les appels d’authentification (login/register/logout)
// Objectif: Simplifier l’utilisation dans les stores et vues
// Logique: Corps JSON, endpoints stables et gestion des réponses typées

export async function login(payload: { email: string; password: string }): Promise<{ accessToken: string; refreshToken: string }> {
  return http('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function register(payload: { email: string; password: string; username: string }): Promise<{ accessToken: string; refreshToken: string }> {
  return http('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logout(): Promise<{ status?: string } | void> {
  return http('/auth/logout', { method: 'POST' });
}
