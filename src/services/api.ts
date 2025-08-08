// API configuration
const getApiConfig = () => {
  // Определяем окружение
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLocalBackend = process.env.REACT_APP_USE_LOCAL_BACKEND === 'true';
  
  // URL для разных окружений
  const LOCAL_BACKEND_URL = 'http://localhost:3001';
  const REMOTE_BACKEND_URL = 'https://chrono-back-kramushka.amvera.io';
  
  // Выбираем URL в зависимости от настроек
  let apiUrl: string;
  
  if (isDevelopment && isLocalBackend) {
    apiUrl = LOCAL_BACKEND_URL;
    console.log('🔧 Используется локальный backend:', apiUrl);
  } else {
    apiUrl = process.env.REACT_APP_API_URL || REMOTE_BACKEND_URL;
    console.log('🌐 Используется удаленный backend:', apiUrl);
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
  reignStart?: number;
  reignEnd?: number;
  achievementYear1?: number;
  achievementYear2?: number;
  achievementYear3?: number;
  achievements: string[];
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
    
    const data = await response.json();
    
    // Преобразуем данные в правильный формат с безопасной декодировкой
    let transformedData = data.map((person: {
      id: string;
      name?: string;
      birthYear: number;
      deathYear: number;
      category?: string;
      country?: string;
      description?: string;
      imageUrl?: string;
      reignStart?: number;
      reignEnd?: number;
      achievementYear1?: number;
      achievementYear2?: number;
      achievementYear3?: number;
      achievements?: string[];
    }) => ({
      id: person.id,
      name: safeDecode(person.name || ''),
      birthYear: person.birthYear,
      deathYear: person.deathYear,
      category: safeDecode(person.category || ''),
      country: safeDecode(person.country || ''),
      description: safeDecode(person.description || ''),
      imageUrl: person.imageUrl,
      reignStart: person.reignStart,
      reignEnd: person.reignEnd,
      achievementYear1: person.achievementYear1,
      achievementYear2: person.achievementYear2,
      achievementYear3: person.achievementYear3,
      achievements: Array.isArray(person.achievements) ? person.achievements.map((a: string) => safeDecode(a || '')) : []
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
export const getCategories = async (): Promise<string[]> => {
  try {
    const url = `${API_BASE_URL}/api/categories`;
    const response = await apiRequest(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Безопасная декодировка категорий
    return data.map((category: string) => safeDecode(category || ''));
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories as fallback
    return ['Политик', 'Ученый', 'Художник', 'Писатель', 'Военачальник'];
  }
};

// Get all countries
export const getCountries = async (): Promise<string[]> => {
  try {
    const url = `${API_BASE_URL}/api/countries`;
    const response = await apiRequest(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Безопасная декодировка стран и разбивка множественных стран
    const allCountries = new Set<string>();
    
    data.forEach((country: string | null) => {
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
    return Array.from(allCountries).sort();
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

// --- Auth-aware fetch with 401 handling and token refresh ---
import { authStorage } from './auth';

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