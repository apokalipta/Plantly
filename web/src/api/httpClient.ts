/// <reference types="vite/client" />
let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const baseURL = base.endsWith('/api') ? base : `${base}/api`;

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseURL}${path}`;
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  const token = localStorage.getItem('accessToken');
  if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err || new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
