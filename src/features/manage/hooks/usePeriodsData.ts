import { useDataLoader } from './useDataLoader';

interface UsePeriodsDataProps {
  isActive: boolean;
  menuSelection: string;
  filters: {
    search: string;
    type: string;
    status: Record<string, boolean>;
  };
}

export function usePeriodsData({ isActive, menuSelection, filters }: UsePeriodsDataProps) {
  // Клиентская фильтрация для режима 'mine'
  const clientSideFilter = (items: any[], filters: any) => {
    const q = filters.search?.trim().toLowerCase() || '';
    const periodType = filters.type || '';
    const selectedStatuses = Object.entries(filters.status || {})
      .filter(([_, checked]) => checked)
      .map(([status, _]) => status);

    return items.filter((period) => {
      // Поиск
      if (q.length > 0) {
        const personName = (period.person_name || period.personName || '').toLowerCase();
        const countryName = (period.country_name || period.countryName || '').toLowerCase();
        const haystack = `${personName} ${countryName}`;
        if (!haystack.includes(q)) return false;
      }

      // Фильтр по типу периода
      if (periodType && periodType !== period.period_type && periodType !== period.periodType) {
        return false;
      }

      // Фильтр по статусам
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(period.status)) return false;
      }

      return true;
    });
  };

  const config = {
    endpoint: menuSelection === 'mine' ? '/api/periods/mine' : '/api/admin/periods/pending',
    limit: 100,
    clientSideFilter: menuSelection === 'mine' ? clientSideFilter : undefined
  };

  return useDataLoader<any>(config, filters, isActive, menuSelection);
}
