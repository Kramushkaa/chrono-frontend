import { useDataLoader } from './useDataLoader';
import { Person } from 'shared/types';

interface UsePersonsDataProps {
  isActive: boolean;
  menuSelection: string;
  filters: {
    search: string;
    categories: string[];
    countries: string[];
    status: Record<string, boolean>;
  };
}

export function usePersonsData({ isActive, menuSelection, filters }: UsePersonsDataProps) {
  // Клиентская фильтрация для режима 'mine'
  const clientSideFilter = (items: Person[], filters: any) => {
    const decodeIfNeeded = (s: string | undefined | null) => {
      const v = (s ?? '').toString();
      if (/%[0-9A-Fa-f]{2}/.test(v)) {
        try { return decodeURIComponent(v) } catch { return v }
      }
      return v;
    };

    const q = filters.search?.trim().toLowerCase() || '';
    const selectedCategories = filters.categories || [];
    const selectedCountries = filters.countries || [];

    return items.filter((person) => {
      const name = decodeIfNeeded((person as any).name).toLowerCase();
      const category = decodeIfNeeded((person as any).category).toLowerCase();
      const countryRaw = decodeIfNeeded((person as any).country).toLowerCase();
      const description = decodeIfNeeded((person as any).description).toLowerCase();

      // Поиск
      if (q.length > 0) {
        const haystack = `${name} ${category} ${countryRaw} ${description}`;
        if (!haystack.includes(q)) return false;
      }

      // Фильтр по категориям
      if (selectedCategories.length > 0) {
        const ok = selectedCategories.some((c: string) => category === c.toLowerCase());
        if (!ok) return false;
      }

      // Фильтр по странам
      if (selectedCountries.length > 0) {
        const personCountries = countryRaw.includes('/') 
          ? countryRaw.split('/').map(s => s.trim()) 
          : [countryRaw];
        const ok = selectedCountries.some((c: string) => 
          personCountries.includes(c.toLowerCase())
        );
        if (!ok) return false;
      }

      return true;
    });
  };

  const config = {
    endpoint: menuSelection === 'pending' ? '/api/admin/persons/moderation' : '/api/persons/mine',
    limit: 50,
    clientSideFilter: menuSelection === 'mine' ? clientSideFilter : undefined
  };

  return useDataLoader<Person>(config, filters, isActive, menuSelection);
}
