import { http } from './httpClient';

export async function getMe(): Promise<any> {
  return http('/users/me', { method: 'GET' });
}

export async function updateProfile(payload: { username?: string }): Promise<any> {
  return http('/users/me', { method: 'PUT', body: JSON.stringify(payload) });
}

export async function uploadAvatar(file: File): Promise<any> {
  const fd = new FormData();
  fd.append('avatar', file);
  return http('/users/me/avatar', { method: 'POST', body: fd });
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<any> {
  return http('/auth/change-password', { method: 'POST', body: JSON.stringify({ oldPassword, newPassword }) });
}
