import { apiFetch } from 'shared/api/api';

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

// Version to track auth storage format changes
const AUTH_STORAGE_VERSION = 'v2-vite'; // Changed after Vite migration

export const authStorage = {
  load(): AuthState {
    try {
      // Check storage version
      const version = localStorage.getItem('auth_version');
      if (version !== AUTH_STORAGE_VERSION) {
        // Clear old auth data if version mismatch
        if (process.env.NODE_ENV !== 'production') {
          console.log('Auth storage version mismatch, clearing old tokens');
        }
        this.clear();
        localStorage.setItem('auth_version', AUTH_STORAGE_VERSION);
        return { user: null, accessToken: null, refreshToken: null };
      }

      const raw = localStorage.getItem('auth');
      return raw ? JSON.parse(raw) : { user: null, accessToken: null, refreshToken: null };
    } catch {
      return { user: null, accessToken: null, refreshToken: null };
    }
  },
  save(state: AuthState) {
    localStorage.setItem('auth', JSON.stringify(state));
    localStorage.setItem('auth_version', AUTH_STORAGE_VERSION);
  },
  clear() {
    localStorage.removeItem('auth');
    localStorage.removeItem('auth_version');
  }
};

export async function register(payload: { email: string; password: string; login?: string; username?: string; full_name?: string; }) {
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

export async function login(payload: { login: string; password: string; }) {
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

export async function updateProfile(accessToken: string, payload: { username?: string; full_name?: string; avatar_url?: string; }) {
  const res = await apiFetch('/api/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Profile update failed');
  return data;
}

export async function changePassword(accessToken: string, payload: { current_password: string; new_password: string; }) {
  const res = await apiFetch('/api/auth/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Password change failed');
  return data;
}

