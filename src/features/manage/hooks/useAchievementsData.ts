import { useDataLoader } from './useDataLoader';

interface UseAchievementsDataProps {
  isActive: boolean;
  menuSelection: string;
  filters: {
    search: string;
    status: Record<string, boolean>;
  };
}

export function useAchievementsData({ isActive, menuSelection, filters }: UseAchievementsDataProps) {
  // Клиентская фильтрация для режима 'mine'
  const clientSideFilter = (items: any[], filters: any) => {
    const q = filters.search?.trim().toLowerCase() || '';
    const selectedStatuses = Object.entries(filters.status || {})
      .filter(([_, checked]) => checked)
      .map(([status, _]) => status);

    return items.filter((achievement) => {
      // Поиск
      if (q.length > 0) {
        const title = (achievement.title || '').toLowerCase();
        const description = (achievement.description || '').toLowerCase();
        const haystack = `${title} ${description}`;
        if (!haystack.includes(q)) return false;
      }

      // Фильтр по статусам
      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(achievement.status)) return false;
      }

      return true;
    });
  };

  const config = {
    endpoint: menuSelection === 'pending' ? '/api/admin/achievements/pending' : '/api/achievements/mine',
    limit: 100,
    clientSideFilter: menuSelection === 'mine' ? clientSideFilter : undefined
  };

  return useDataLoader<any>(config, filters, isActive, menuSelection);
}
