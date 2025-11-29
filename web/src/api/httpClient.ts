/// <reference types="vite/client" />
let base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const baseURL = base.endsWith('/api') ? base : `${base}/api`;

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${baseURL}${path}`;
  const doFetch = async (): Promise<Response> => {
    const headers = new Headers(init?.headers);
    const bodyIsFormData = typeof FormData !== 'undefined' && init?.body instanceof FormData;
    if (!headers.has('Content-Type') && !bodyIsFormData) {
      headers.set('Content-Type', 'application/json');
    }
    const token = localStorage.getItem('accessToken');
    if (token && !headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...init, headers });
  };

  let res = await doFetch();
  if (res.status === 401) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw err || new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

async function tryRefreshTokens(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return handleRefreshFailure();
    const data = await res.json();
    if (data?.accessToken && data?.refreshToken) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    }
    return handleRefreshFailure();
  } catch {
    return handleRefreshFailure();
  }
}

function handleRefreshFailure(): false {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  const current = window.location.pathname + window.location.search;
  if (!current.startsWith('/login')) {
    try { window.location.assign(`/login?redirect=${encodeURIComponent(current)}`); } catch {}
  }
  return false;
}
