import { authStorage } from './auth';
import type { UpsertPersonDTO, LifePeriodItemDTO } from '../dto'
// API configuration
const getApiConfig = () => {
  // Определяем окружение
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalBackend = process.env.REACT_APP_USE_LOCAL_BACKEND === 'true';
  // Приоритет: локальное переопределение (localStorage) > env FORCE > остальные правила
  const lsForcedApiUrl = (typeof window !== 'undefined' && window.localStorage)
    ? window.localStorage.getItem('FORCE_API_URL') || undefined
    : undefined;
  const forcedApiUrl = lsForcedApiUrl || process.env.REACT_APP_FORCE_API_URL;
  const logEnabled = process.env.REACT_APP_LOG_API_CALLS === 'true' || isDevelopment;
  
  // URL для разных окружений
  const LOCAL_BACKEND_URL = process.env.REACT_APP_LOCAL_BACKEND_URL || 'http://localhost:3001';
  const REMOTE_BACKEND_URL = process.env.REACT_APP_REMOTE_BACKEND_URL || 'https://chrono-back-kramushka.amvera.io';
  
  // Выбираем URL в зависимости от настроек
  let apiUrl: string;
  if (forcedApiUrl) {
    apiUrl = forcedApiUrl;
    if (logEnabled) console.log('🚩 Принудительно задан backend:', apiUrl);
  } else if (isDevelopment && isLocalBackend) {
    apiUrl = LOCAL_BACKEND_URL;
    if (logEnabled) console.log('🔧 Используется локальный backend:', apiUrl);
  } else {
    apiUrl = process.env.REACT_APP_API_URL || REMOTE_BACKEND_URL;
    if (logEnabled) console.log('🌐 Используется удаленный backend:', apiUrl);
  }
  
  return {
    baseUrl: apiUrl,
    timeout: 10000, // 10 секунд
    retries: 2
  };
};

const API_CONFIG = getApiConfig();
const API_BASE_URL = API_CONFIG.baseUrl;

// Safe decode function
const safeDecode = (str: string): string => {
  try {
    return decodeURIComponent(escape(str));
  } catch (error) {
    console.warn('Failed to decode string:', str, error);
    return str;
  }
};

// Helper function for API requests with retry logic
const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= API_CONFIG.retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      lastError = error as Error;
      console.warn(`API request attempt ${attempt + 1} failed:`, error);
      
      if (attempt < API_CONFIG.retries) {
        // Ждем перед повторной попыткой (экспоненциальная задержка)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw lastError || new Error('API request failed after all retries');
};

// Types for API responses
interface Person {
  id: string;
  name: string;
  birthYear: number;
  deathYear: number;
  category: string;
  country: string;
  description: string;
  imageUrl?: string;
  wikiLink?: string | null;
  reignStart?: number;
  reignEnd?: number;
  rulerPeriods?: Array<{
    startYear: number;
    endYear: number;
    countryId?: number;
    countryName?: string;
  }>;
  periods?: Array<{
    startYear: number;
    endYear: number;
    type?: string;
    countryId?: number;
    countryName?: string;
    comment?: string | null;
  }>;
  achievements: string[];
  achievementsWiki?: (string | null)[];
  achievementYears?: number[];
}

interface ApiFilters {
  category?: string;
  country?: string;
  startYear?: number;
  endYear?: number;
}

// Helper function to build query string from filters
const buildQueryString = (filters: ApiFilters): string => {
  const params = new URLSearchParams();
  
  if (filters.category) {
    params.append('category', filters.category);
  }
  if (filters.country) {
    params.append('country', filters.country);
  }
  if (filters.startYear !== undefined) {
    params.append('startYear', filters.startYear.toString());
  }
  if (filters.endYear !== undefined) {
    params.append('endYear', filters.endYear.toString());
  }
  
  return params.toString();
};

// Get persons with optional filters
export const getPersons = async (filters: ApiFilters = {}): Promise<Person[]> => {
  try {
    const queryString = buildQueryString(filters);
    const url = `${API_BASE_URL}/api/persons${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiRequest(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const payload = await response.json().catch(() => null) as any;
    const data = Array.isArray(payload) ? payload : (payload?.data ?? []);
    
    // Преобразуем данные в правильный формат с безопасной декодировкой
    let transformedData = (data as any[]).map((person: {
      id: string;
      name?: string;
      birthYear: number;
      deathYear: number;
      category?: string;
      country?: string;
      description?: string;
      imageUrl?: string;
      wikiLink?: string | null;
      reignStart?: number;
      reignEnd?: number;
      achievementYears?: number[];
      achievements?: string[];
      achievements_wiki?: (string | null)[];
      rulerPeriods?: Array<{ startYear: number; endYear: number; countryId?: number; countryName?: string }>
    }) => ({
      id: person.id,
      name: safeDecode(person.name || ''),
      birthYear: person.birthYear,
      deathYear: person.deathYear,
      category: safeDecode(person.category || ''),
      country: safeDecode(person.country || ''),
      description: safeDecode(person.description || ''),
      imageUrl: person.imageUrl,
      wikiLink: person.wikiLink || null,
      reignStart: person.reignStart,
      reignEnd: person.reignEnd,
      rulerPeriods: Array.isArray(person.rulerPeriods) ? person.rulerPeriods : [],
      achievementYears: Array.isArray((person as any).achievementYears) ? (person as any).achievementYears : undefined,
      achievements: Array.isArray(person.achievements) ? person.achievements.map((a: string) => safeDecode(a || '')) : []
      ,
      achievementsWiki: Array.isArray((person as any).achievements_wiki) ? (person as any).achievements_wiki : []
    }));
    
    // Дополнительная фильтрация на клиенте для множественных стран
    if (filters.country) {
      const selectedCountries = filters.country.split(',').map((c: string) => c.trim());
      transformedData = transformedData.filter((person: Person) => {
        const personCountries = person.country.includes('/') 
          ? person.country.split('/').map((c: string) => c.trim())
          : [person.country];
        return selectedCountries.some((selected: string) => personCountries.includes(selected));
      });
    }
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching persons:', error);
    // Return empty array as fallback
    return [];
  }
};

// Get all categories
let CACHED_CATEGORIES: { items: string[]; ts: number } | null = null
const CACHE_TTL_MS = 60_000
export const getCategories = async (): Promise<string[]> => {
  try {
    if (CACHED_CATEGORIES && Date.now() - CACHED_CATEGORIES.ts < CACHE_TTL_MS) {
      return CACHED_CATEGORIES.items
    }
    const url = `${API_BASE_URL}/api/categories`;
    const response = await apiRequest(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const payload = await response.json().catch(() => null) as any;
    const raw = Array.isArray(payload) ? payload : (payload?.data ?? []);
    
    // Безопасная декодировка категорий
    const items = (raw as any[]).map((category: string) => safeDecode(category || ''));
    CACHED_CATEGORIES = { items, ts: Date.now() }
    return items;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories as fallback
    return ['Политик', 'Ученый', 'Художник', 'Писатель', 'Военачальник'];
  }
};

// Get all countries
export const getCountries = async (): Promise<string[]> => {
  try {
    if ((getCountries as any)._cache && Date.now() - (getCountries as any)._cache.ts < CACHE_TTL_MS) {
      return (getCountries as any)._cache.items
    }
    const url = `${API_BASE_URL}/api/countries`;
    const response = await apiRequest(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const payload = await response.json().catch(() => null) as any;
    const raw = Array.isArray(payload) ? payload : (payload?.data ?? []);
    
    // Безопасная декодировка стран и разбивка множественных стран
    const allCountries = new Set<string>();
    
    (raw as any[]).forEach((country: string | null) => {
      const decodedCountry = safeDecode(country || '');
      if (decodedCountry.includes('/')) {
        // Разбиваем множественные страны на отдельные
        const countries = decodedCountry.split('/').map(c => c.trim());
        countries.forEach(c => {
          if (c) allCountries.add(c);
        });
      } else {
        allCountries.add(decodedCountry);
      }
    });
    
    // Сортируем страны по алфавиту
    const list = Array.from(allCountries).sort();
    ;(getCountries as any)._cache = { items: list, ts: Date.now() }
    return list;
  } catch (error) {
    console.error('Error fetching countries:', error);
    // Return default countries as fallback
    return ['Древний Рим', 'Древняя Греция', 'Древний Египет', 'Китай', 'Индия'];
  }
};

// Test connection to backend
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};

// Get backend info
export const getBackendInfo = () => {
  return {
    baseUrl: API_BASE_URL,
    isLocal: API_BASE_URL.includes('localhost'),
    config: API_CONFIG
  };
}; 

// DTO version check
export async function getDtoVersion(): Promise<string | null> {
  try {
    const res = await apiRequest(`${API_BASE_URL}/api/dto-version`)
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const v = data?.data?.version
    return typeof v === 'string' ? v : null
  } catch {
    return null
  }
}

// --- List sharing helpers ---
export async function createListShareCode(listId: number): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/lists/${listId}/share`, { method: 'POST' })
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    return data?.data?.code || null
  } catch { return null }
}

export async function resolveListShare(code: string): Promise<{ title: string; list_id?: number; owner_user_id?: string; items: Array<{ item_type: string; person_id?: string; achievement_id?: number; period_id?: number }> } | null> {
  try {
    const res = await apiFetch(`/api/list-shares/${encodeURIComponent(code)}`)
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    const title = data?.data?.title || ''
    const list_id = Number(data?.data?.list_id)
    const owner_user_id = data?.data?.owner_user_id != null ? String(data.data.owner_user_id) : undefined
    const items = Array.isArray(data?.data?.items) ? data.data.items : []
    return { title, list_id: Number.isFinite(list_id) ? list_id : undefined, owner_user_id, items }
  } catch { return null }
}

// Экспорт кандидатов и утилит для переключения бекенда из UI
export const getApiCandidates = () => {
  const LOCAL_BACKEND_URL = process.env.REACT_APP_LOCAL_BACKEND_URL || 'http://localhost:3001';
  const REMOTE_BACKEND_URL = process.env.REACT_APP_REMOTE_BACKEND_URL || 'https://chrono-back-kramushka.amvera.io';
  const current = API_BASE_URL;
  return { local: LOCAL_BACKEND_URL, remote: REMOTE_BACKEND_URL, current };
};

export const applyBackendOverride = (url?: string) => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  if (url && url.trim().length > 0) {
    window.localStorage.setItem('FORCE_API_URL', url.trim());
  } else {
    window.localStorage.removeItem('FORCE_API_URL');
  }
  window.location.reload();
};

// --- Auth-aware fetch with 401 handling and token refresh ---

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

async function refreshTokenIfNeeded(): Promise<void> {
  if (isRefreshing) {
    await new Promise<void>((resolve) => pendingRequests.push(resolve));
    return;
  }
  isRefreshing = true;
  try {
    const state = authStorage.load();
    if (!state.refreshToken) throw new Error('No refresh token');
    const res = await apiRequest(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: state.refreshToken })
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    const newState = {
      user: data?.data?.user || state.user,
      accessToken: data?.data?.access_token || null,
      refreshToken: data?.data?.refresh_token || state.refreshToken
    };
    authStorage.save(newState);
  } finally {
    isRefreshing = false;
    pendingRequests.forEach((resolve) => resolve());
    pendingRequests = [];
  }
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const url = `${API_BASE_URL}${path}`;
  const state = authStorage.load();
  const headers = new Headers(init.headers || {});
  if (state.accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${state.accessToken}`);
  }
  try {
    const res = await apiRequest(url, { ...init, headers });
    if (res.status !== 401) return res;
    // Try refresh and retry once
    await refreshTokenIfNeeded();
    const refreshed = authStorage.load();
    const retryHeaders = new Headers(init.headers || {});
    if (refreshed.accessToken) retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);
    return apiRequest(url, { ...init, headers: retryHeaders });
  } catch (e) {
    throw e;
  }
}

// --- Persons CRUD helpers for /manage ---
type UpsertPersonPayload = UpsertPersonDTO

export async function adminUpsertPerson(payload: UpsertPersonPayload) {
  const res = await apiFetch(`/api/admin/persons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось сохранить личность');
  return data;
}

export async function proposePersonEdit(personId: string, payload: Partial<UpsertPersonPayload>) {
  const res = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/edits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить правку');
  return data;
}

export async function proposeNewPerson(payload: UpsertPersonPayload) {
  const res = await apiFetch(`/api/persons/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось предложить личность');
  return data;
}

export async function addAchievement(personId: string, payload: { year: number; description: string; wikipedia_url?: string | null; image_url?: string | null }) {
  const res = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось создать достижение');
  return data;
}

// Create achievement not bound to person (optionally bound to country via country_id)
export async function addGenericAchievement(payload: { year: number; description: string; wikipedia_url?: string | null; image_url?: string | null; country_id?: number | null }) {
  const res = await apiFetch(`/api/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось создать достижение');
  return data;
}

export type CountryOption = { id: number; name: string };
let CACHED_COUNTRIES: { items: CountryOption[]; ts: number } | null = null
export async function getCountryOptions(): Promise<CountryOption[]> {
  if (CACHED_COUNTRIES && Date.now() - CACHED_COUNTRIES.ts < CACHE_TTL_MS) {
    return CACHED_COUNTRIES.items
  }
  // Prefer options endpoint; if unavailable, derive from /api/countries
  try {
    const res = await apiFetch(`/api/countries/options`);
    if (res.ok) {
      const data = await res.json().catch(() => ({ data: [] }));
      const items: CountryOption[] = Array.isArray(data.data) ? data.data : [];
      if (items.length > 0) {
        CACHED_COUNTRIES = { items, ts: Date.now() }
        return items
      }
    }
  } catch {}
  // Fallback: build options from names
  const names = await getCountries()
  const mapped = names.map((name, idx) => ({ id: idx + 1, name }))
  CACHED_COUNTRIES = { items: mapped, ts: Date.now() }
  return mapped
}

export async function getPersonById(id: string): Promise<Person | null> {
  try {
    const res = await apiFetch(`/api/persons/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const payload = await res.json().catch(() => null) as any;
    const p = (payload && payload.data) ? payload.data : payload;
    // Map to Person type used on frontend
    const mapped: Person = {
      id: p.id,
      name: safeDecode(p.name || ''),
      birthYear: p.birthYear,
      deathYear: p.deathYear,
      category: safeDecode(p.category || ''),
      country: safeDecode(p.country || ''),
      description: safeDecode(p.description || ''),
      imageUrl: p.imageUrl || undefined,
      wikiLink: p.wikiLink || null,
      reignStart: p.reignStart || undefined,
      reignEnd: p.reignEnd || undefined,
      rulerPeriods: Array.isArray(p.rulerPeriods) ? p.rulerPeriods : [],
      periods: Array.isArray(p.periods)
        ? (p.periods as any[])
            .map((pr: any) => ({
              startYear: pr.startYear ?? pr.start_year,
              endYear: pr.endYear ?? pr.end_year,
              type: pr.type ?? pr.period_type,
              countryId: pr.countryId ?? pr.country_id,
              countryName: pr.countryName ?? pr.country_name,
              comment: pr.comment ?? pr.period_comment ?? null,
            }))
            .sort((a, b) => (a.startYear ?? 0) - (b.startYear ?? 0))
        : [],
        achievementYears: Array.isArray(p.achievementYears) ? p.achievementYears : undefined,
      achievements: Array.isArray(p.achievements) ? p.achievements.map((a: string) => safeDecode(a || '')) : [],
      achievementsWiki: Array.isArray(p.achievementsWiki) ? p.achievementsWiki : []
    };
    return mapped;
  } catch {
    return null;
  }
}

// --- Life periods (countries of residence) ---
export type LifePeriodInput = Pick<LifePeriodItemDTO, 'country_id' | 'start_year' | 'end_year'>
export async function saveLifePeriods(personId: string, periods: LifePeriodInput[]) {
  const res = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/life-periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periods })
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.message || 'Не удалось сохранить страны проживания')
  return data
}