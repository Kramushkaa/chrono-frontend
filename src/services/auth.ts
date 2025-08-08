import { apiFetch } from './api';

export interface AuthUser {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  email_verified: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const authStorage = {
  load(): AuthState {
    try {
      const raw = localStorage.getItem('auth');
      return raw ? JSON.parse(raw) : { user: null, accessToken: null, refreshToken: null };
    } catch {
      return { user: null, accessToken: null, refreshToken: null };
    }
  },
  save(state: AuthState) {
    localStorage.setItem('auth', JSON.stringify(state));
  },
  clear() {
    localStorage.removeItem('auth');
  }
};

export async function register(payload: { email: string; password: string; username?: string; full_name?: string; }) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error(data?.message || 'Registration failed');
  return data;
}

export async function login(payload: { email: string; password: string; }) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Login failed');
  const data = await res.json();
  const state: AuthState = {
    user: data?.data?.user || null,
    accessToken: data?.data?.access_token || null,
    refreshToken: data?.data?.refresh_token || null
  };
  authStorage.save(state);
  return state;
}

export async function refresh(accessState: AuthState) {
  if (!accessState.refreshToken) throw new Error('No refresh token');
  const res = await apiFetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: accessState.refreshToken })
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  const newState: AuthState = {
    user: data?.data?.user || accessState.user,
    accessToken: data?.data?.access_token || null,
    refreshToken: accessState.refreshToken
  };
  authStorage.save(newState);
  return newState;
}

export async function getProfile(accessToken: string) {
  const res = await apiFetch('/api/auth/profile', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  if (!res.ok) throw new Error('Profile fetch failed');
  return res.json();
}

export async function logout(accessState: AuthState) {
  const res = await apiFetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(accessState.accessToken ? { 'Authorization': `Bearer ${accessState.accessToken}` } : {}) },
    body: JSON.stringify({ refresh_token: accessState.refreshToken })
  });
  if (!res.ok) throw new Error('Logout failed');
  authStorage.clear();
}

