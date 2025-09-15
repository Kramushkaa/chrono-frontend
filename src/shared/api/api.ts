import { authStorage } from '../../features/auth/services/auth'
import type { UpsertPersonDTO, LifePeriodItemDTO } from '../dto'
import { validateDto } from '../dto'
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
  
  // URL для разных окружений
  const LOCAL_BACKEND_URL = process.env.REACT_APP_LOCAL_BACKEND_URL || 'http://localhost:3001';
  const REMOTE_BACKEND_URL = process.env.REACT_APP_REMOTE_BACKEND_URL || 'https://chrono-back-kramushka.amvera.io';
  
  // Выбираем URL в зависимости от настроек
  let apiUrl: string;
  if (forcedApiUrl) {
    apiUrl = forcedApiUrl;
    // silent in prod
  } else if (isDevelopment && isLocalBackend) {
    apiUrl = LOCAL_BACKEND_URL;
    // silent in prod
  } else {
    apiUrl = process.env.REACT_APP_API_URL || REMOTE_BACKEND_URL;
    // silent in prod
  }
  
  return {
    baseUrl: apiUrl,
    timeout: 10000, // 10 секунд
    retries: 2
  };
};

const API_CONFIG = getApiConfig();
const API_BASE_URL = API_CONFIG.baseUrl;

// Text normalization: decode only percent-encoded strings; otherwise return as-is
const maybePercentDecode = (input: unknown): string => {
  if (typeof input !== 'string') return '';
  // Decode only if we clearly see percent-encoding patterns
  if (!/%[0-9A-Fa-f]{2}/.test(input)) return input;
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
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
      // silent
      
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
  limit?: number;
  offset?: number;
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
  if (filters.limit !== undefined) {
    params.append('limit', filters.limit.toString());
  }
  if (filters.offset !== undefined) {
    params.append('offset', filters.offset.toString());
  }
  
  return params.toString();
};

// Get persons with optional filters
export const getPersons = async (filters: ApiFilters = {}): Promise<Person[]> => {
  try {
    // Ensure we fetch enough for the timeline (server default is 100)
    const withDefaultLimit: ApiFilters = { limit: 1000, ...filters };
    const queryString = buildQueryString(withDefaultLimit);
    const url = `/api/persons${queryString ? `?${queryString}` : ''}`;
    const data = await apiData<any[]>(url);
    
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
      name: maybePercentDecode(person.name || ''),
      birthYear: person.birthYear,
      deathYear: person.deathYear,
      category: maybePercentDecode(person.category || ''),
      country: maybePercentDecode(person.country || ''),
      description: maybePercentDecode(person.description || ''),
      imageUrl: person.imageUrl,
      wikiLink: person.wikiLink || null,
      reignStart: person.reignStart,
      reignEnd: person.reignEnd,
      rulerPeriods: Array.isArray(person.rulerPeriods) ? person.rulerPeriods : [],
      achievementYears: Array.isArray((person as any).achievementYears) ? (person as any).achievementYears : undefined,
      achievements: Array.isArray(person.achievements) ? person.achievements.map((a: string) => maybePercentDecode(a || '')) : []
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
    /* eslint-disable no-console */
    if (process.env.NODE_ENV !== 'production') console.error('Error fetching persons:', error);
    /* eslint-enable no-console */
    throw error;
  }
};

// Get all categories
let CACHED_CATEGORIES: { items: string[]; ts: number } | null = null
const CACHE_TTL_MS = 60_000
export const getCategories = async (): Promise<string[]> => {
  if (CACHED_CATEGORIES && Date.now() - CACHED_CATEGORIES.ts < CACHE_TTL_MS) {
    return CACHED_CATEGORIES.items
  }
  const raw = await apiData<any[]>(`/api/categories`);
  const items = (raw as any[]).map((category: string) => maybePercentDecode(category || ''));
  CACHED_CATEGORIES = { items, ts: Date.now() }
  return items;
};

// Get all countries
export const getCountries = async (): Promise<string[]> => {
  if ((getCountries as any)._cache && Date.now() - (getCountries as any)._cache.ts < CACHE_TTL_MS) {
    return (getCountries as any)._cache.items
  }
  const raw = await apiData<any[]>(`/api/countries`);
  const allCountries = new Set<string>();
  (raw as any[]).forEach((country: string | null) => {
    const decodedCountry = maybePercentDecode(country || '');
    if (decodedCountry.includes('/')) {
      const countries = decodedCountry.split('/').map(c => c.trim());
      countries.forEach(c => { if (c) allCountries.add(c); });
    } else {
      allCountries.add(decodedCountry);
    }
  });
  const list = Array.from(allCountries).sort();
  ;(getCountries as any)._cache = { items: list, ts: Date.now() }
  return list;
};

// Test connection to backend
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await apiRequest(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    /* eslint-disable no-console */
    if (process.env.NODE_ENV !== 'production') console.error('Backend connection test failed:', error);
    /* eslint-enable no-console */
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
    const data = await apiData<{ version?: string }>(`/api/dto-version`)
    const v = (data as any)?.version
    return typeof v === 'string' ? v : null
  } catch {
    return null
  }
}

// --- List sharing helpers ---
export async function createListShareCode(listId: number): Promise<string | null> {
  try {
    const data = await apiData<{ code?: string }>(`/api/lists/${listId}/share`, { method: 'POST' })
    return (data as any)?.code || null
  } catch { return null }
}

export async function resolveListShare(code: string): Promise<{ title: string; list_id?: number; owner_user_id?: string; items: Array<{ item_type: string; person_id?: string; achievement_id?: number; period_id?: number }> } | null> {
  try {
    const payload = await apiData<any>(`/api/list-shares/${encodeURIComponent(code)}`)
    const title = payload?.title || ''
    const list_id = Number(payload?.list_id)
    const owner_user_id = payload?.owner_user_id != null ? String(payload.owner_user_id) : undefined
    const items = Array.isArray(payload?.items) ? payload.items : []
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
    const retryRes = await apiRequest(url, { ...init, headers: retryHeaders });
    if (retryRes.status === 401) {
      // Token refresh did not help → force logout and notify UI
      try { authStorage.clear(); } catch {}
      if (typeof window !== 'undefined' && (window as any).dispatchEvent) {
        try { (window as any).dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { path } })); } catch {}
      }
    }
    return retryRes;
  } catch (e) {
    throw e;
  }
}

// --- Unified JSON parsing helpers ---
type ApiErrorPayload = { message?: string; error?: string; error_message?: string } & Record<string, unknown>
type ApiError = Error & { status?: number; payload?: ApiErrorPayload };

async function parseResponseJson<T = unknown>(res: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await (res.clone ? res.clone().json() : res.json());
  } catch {
    try {
      const text = await res.text();
      try { body = JSON.parse(text); } catch { body = { message: text } as ApiErrorPayload }
    } catch {}
  }
  if (!res.ok) {
    const payload = (body || {}) as ApiErrorPayload
    const message =
      (payload && (payload.message || payload.error || payload.error_message)) ||
      `HTTP ${res.status}`;
    const err: ApiError = new Error(typeof message === 'string' ? message : 'Request failed');
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return body as T;
}

export async function apiJson<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  return parseResponseJson(res);
}

export async function apiData<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const payload: any = await apiJson(path, init);
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) return payload.data as T;
  return payload as T;
}

// --- Persons CRUD helpers for /manage ---
type UpsertPersonPayload = UpsertPersonDTO

export async function adminUpsertPerson(payload: UpsertPersonPayload) {
  if (process.env.NODE_ENV !== 'production') {
    const v = validateDto('UpsertPerson', payload)
    /* eslint-disable no-console */
    if (!v.ok) console.warn('DTO validation failed (UpsertPerson):', v.errors)
    /* eslint-enable no-console */
  }
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
  if (process.env.NODE_ENV !== 'production') {
    const v = validateDto('AchievementPerson', payload as any)
    /* eslint-disable no-console */
    if (!v.ok) console.warn('DTO validation failed (AchievementPerson):', v.errors)
    /* eslint-enable no-console */
  }
  const res = await apiFetch(`/api/persons/${encodeURIComponent(personId)}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось создать достижение');
  return data;
}

// Get user's achievements
export async function getMyAchievements(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const res = await apiFetch(`/api/achievements/mine?${params.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить достижения');
  return data;
}

// Count-only helpers for "mine"
export async function getMyPersonsCount(): Promise<number> {
  const payload = await apiData<{ count: number }>(`/api/persons/mine?count=true`)
  const c = (payload as any)?.count
  const n = Number(c)
  return Number.isFinite(n) ? n : 0
}

export async function getMyAchievementsCount(): Promise<number> {
  const payload = await apiData<{ count: number }>(`/api/achievements/mine?count=true`)
  const c = (payload as any)?.count
  const n = Number(c)
  return Number.isFinite(n) ? n : 0
}

export async function getMyPeriodsCount(): Promise<number> {
  const payload = await apiData<{ count: number }>(`/api/periods/mine?count=true`)
  const c = (payload as any)?.count
  const n = Number(c)
  return Number.isFinite(n) ? n : 0
}

// Get pending achievements (for moderators)
export async function getPendingAchievements(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());
  
  const res = await apiFetch(`/api/admin/achievements/pending?${params.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить pending достижения');
  return data;
}

// Review achievement (approve/reject) - for moderators
export async function reviewAchievement(achievementId: number, action: 'approve' | 'reject', comment?: string) {
  const res = await apiFetch(`/api/admin/achievements/${achievementId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, comment })
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось обработать достижение');
  return data;
}

// Create achievement not bound to person (optionally bound to country via country_id)
export async function addGenericAchievement(payload: { year: number; description: string; wikipedia_url?: string | null; image_url?: string | null; country_id?: number | null }) {
  if (process.env.NODE_ENV !== 'production') {
    const v = validateDto('AchievementGeneric', payload as any)
    /* eslint-disable no-console */
    if (!v.ok) console.warn('DTO validation failed (AchievementGeneric):', v.errors)
    /* eslint-enable no-console */
  }
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
    const items = await apiData<CountryOption[]>(`/api/countries/options`);
    if (Array.isArray(items) && items.length > 0) {
      CACHED_COUNTRIES = { items, ts: Date.now() }
      return items
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
    const p = await apiData<any>(`/api/persons/${encodeURIComponent(id)}`)
    // Map to Person type used on frontend
    const mapped: any = {
      id: p.id,
      name: maybePercentDecode(p.name || ''),
      birthYear: p.birthYear,
      deathYear: p.deathYear,
      category: maybePercentDecode(p.category || ''),
      country: maybePercentDecode(p.country || ''),
      description: maybePercentDecode(p.description || ''),
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
      achievements: Array.isArray(p.achievements) ? p.achievements.map((a: string) => maybePercentDecode(a || '')) : [],
      achievementsWiki: Array.isArray(p.achievementsWiki) ? p.achievementsWiki : [],
      status: p.status
    };
    return mapped;
  } catch {
    return null;
  }
}

// --- Life periods (countries of residence) ---
export type LifePeriodInput = Pick<LifePeriodItemDTO, 'country_id' | 'start_year' | 'end_year'>
export async function saveLifePeriods(personId: string, periods: LifePeriodInput[]) {
  if (process.env.NODE_ENV !== 'production') {
    const pack = { periods: periods.map(p => ({ country_id: p.country_id, start_year: p.start_year, end_year: p.end_year })) }
    const v = validateDto('LifePeriods', pack)
    /* eslint-disable no-console */
    if (!v.ok) console.warn('DTO validation failed (LifePeriods):', v.errors)
    /* eslint-enable no-console */
  }
  const data = await apiJson(`/api/persons/${encodeURIComponent(personId)}/life-periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ periods })
  })
  return data
}

// Draft management functions
export async function getAchievementDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const res = await apiFetch(`/api/achievements/drafts?${params.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить черновики достижений');
  return data;
}

export async function getPeriodDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const res = await apiFetch(`/api/periods/drafts?${params.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить черновики периодов');
  return data;
}

export async function updateAchievement(achievementId: number, data: { year?: number; description?: string; wikipedia_url?: string | null; image_url?: string | null }) {
  const res = await apiFetch(`/api/achievements/${achievementId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось обновить достижение');
  return responseData;
}

export async function updatePeriod(periodId: number, data: { start_year?: number; end_year?: number; period_type?: string; country_id?: number | null; comment?: string | null }) {
  const res = await apiFetch(`/api/periods/${periodId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось обновить период');
  return responseData;
}

export async function submitAchievementDraft(achievementId: number) {
  const res = await apiFetch(`/api/achievements/${achievementId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить черновик на модерацию');
  return data;
}

export async function submitPeriodDraft(periodId: number) {
  const res = await apiFetch(`/api/periods/${periodId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить черновик на модерацию');
  return data;
}

export async function createAchievementDraft(personId: string, data: { year: number; description: string; wikipedia_url?: string | null; image_url?: string | null }) {
  const res = await apiFetch(`/api/persons/${personId}/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true })
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось создать черновик достижения');
  return responseData;
}

export async function createPeriodDraft(personId: string, data: { start_year: number; end_year: number; period_type: string; country_id?: number | null; comment?: string | null }) {
  const res = await apiFetch(`/api/persons/${personId}/periods`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true })
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось создать черновик периода');
  return responseData;
}

// Person draft management functions
export async function getPersonDrafts(limit?: number, offset?: number) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  if (offset) params.append('offset', offset.toString());

  const res = await apiFetch(`/api/persons/drafts?${params.toString()}`);
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось получить черновики личностей');
  return data;
}

export async function updatePerson(personId: string, data: { name?: string; birthYear?: number; deathYear?: number; category?: string; description?: string; imageUrl?: string | null; wikiLink?: string | null; lifePeriods?: Array<{ countryId: string; start: number | ''; end: number | '' }> }) {
  const res = await apiFetch(`/api/persons/${personId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось обновить личность');
  return responseData;
}

export async function submitPersonDraft(personId: string) {
  const res = await apiFetch(`/api/persons/${personId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'Не удалось отправить черновик на модерацию');
  return data;
}

export async function createPersonDraft(data: { id: string; name: string; birthYear: number; deathYear: number; category: string; description: string; imageUrl: string | null; wikiLink: string | null; lifePeriods: Array<{ countryId: string; start: number | ''; end: number | '' }> }) {
  const res = await apiFetch(`/api/persons/propose`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, saveAsDraft: true })
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось создать черновик личности');
  return responseData;
}

export async function revertPersonToDraft(personId: string) {
  const res = await apiFetch(`/api/persons/${personId}/revert-to-draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const responseData = await res.json().catch(() => null);
  if (!res.ok) throw new Error(responseData?.message || 'Не удалось вернуть личность в черновики');
  return responseData;
}