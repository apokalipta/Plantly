import { http } from './httpClient';

export async function login(payload: { email: string; password: string }): Promise<{ accessToken: string; refreshToken: string }> {
  return http('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export async function register(payload: { email: string; password: string }): Promise<{ accessToken: string; refreshToken: string }> {
  return http('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export async function logout(): Promise<{ status?: string } | void> {
  return http('/auth/logout', { method: 'POST' });
}

