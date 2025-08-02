// API functions for connecting to backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://chrono-back-kramushka.amvera.io';

// Safe decode function
const safeDecode = (str: string): string => {
  try {
    return decodeURIComponent(escape(str));
  } catch (error) {
    console.warn('Failed to decode string:', str, error);
    return str;
  }
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
    
    console.log('Fetching persons from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Persons data received:', data);
    
    // Преобразуем данные в правильный формат с безопасной декодировкой
    let transformedData = data.map((person: any) => ({
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
      achievements: Array.isArray(person.achievements) ? person.achievements.map((a: any) => safeDecode(a || '')) : []
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
    
    console.log('Fetching categories from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Categories data received:', data);
    
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
    
    console.log('Fetching countries from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Countries data received:', data);
    
    // Безопасная декодировка стран и разбивка множественных стран
    const allCountries = new Set<string>();
    
    data.forEach((country: string) => {
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
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
}; 