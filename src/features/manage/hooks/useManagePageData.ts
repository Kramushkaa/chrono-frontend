import { useState, useMemo } from 'react';
import { useAchievements } from 'hooks/useAchievements';
import { usePeriods } from 'hooks/usePeriods';
import { usePersons } from 'hooks/usePersons';
import { useApiData } from 'hooks/useApiData';
import { buildMineParams } from 'features/manage/utils/queryParams';

type Tab = 'persons' | 'achievements' | 'periods';
type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`;

export function useManagePageData(activeTab: Tab, menuSelection: MenuSelection, isAuthenticated: boolean, filters: any) {
  
  
  
  // Состояния для поиска
  const [searchPersons, setSearchPersons] = useState('');
  const [searchAch, setSearchAch] = useState('');
  const [searchPeriods, setSearchPeriods] = useState('');
  const [periodType, setPeriodType] = useState<'life' | 'ruler' | ''>('');

  // Состояния для фильтров статусов
  const [statusFilters, setStatusFilters] = useState<Record<string, boolean>>({
    draft: false,
    pending: false,
    approved: false,
    rejected: false
  });

  const [achStatusFilters, setAchStatusFilters] = useState<Record<string, boolean>>({
    draft: false,
    pending: false,
    approved: false,
    rejected: false
  });

  const [periodsStatusFilters, setPeriodsStatusFilters] = useState<Record<string, boolean>>({
    draft: false,
    pending: false,
    approved: false,
    rejected: false
  });



  // Определяем, активен ли режим 'mine' или 'pending'
  const isMineOrPendingMode = menuSelection === 'mine' || menuSelection === 'pending';

  // Данные для режима 'all' (используем существующие хуки)
  const personsQuery = useMemo(() => {
    const query = {
      q: searchPersons,
      category: activeTab === 'persons' && filters.categories.length ? filters.categories.join(',') : undefined,
      country: activeTab === 'persons' && filters.countries.length ? filters.countries.join(',') : undefined
    };
    return query;
  }, [searchPersons, filters, activeTab]);

  const { 
    items: personsAll, 
    isLoading: isPersonsLoadingAll, 
    hasMore: personsHasMoreAll, 
    loadMore: loadMorePersonsAll 
  } = usePersons(personsQuery, activeTab === 'persons' && menuSelection === 'all');

  const { 
    items: achItemsAll, 
    isLoading: achLoadingAll, 
    hasMore: hasMoreAll, 
    loadMore: loadMoreAll 
  } = useAchievements(searchAch, activeTab === 'achievements' && menuSelection === 'all');

  const { 
    items: periodItemsAll, 
    isLoading: periodsLoadingAll, 
    hasMore: periodsHasMoreAll, 
    loadMore: loadMorePeriodsAll 
  } = usePeriods(
    { query: searchPeriods, type: periodType }, 
    activeTab === 'periods' && menuSelection === 'all'
  );

  // Данные для режимов 'mine' и 'pending' (используем прямой вызов useApiData)
  // Создаем стабильный ключ для отслеживания изменений параметров "Mine" данных
  // removed unused personsMineQueryKey

  // Загружаем данные для "Моих" всегда, чтобы счетчики работали правильно
  const personsMineResult = useApiData({
    endpoint: '/api/persons/mine',
    enabled: isAuthenticated, // Загружаем всегда для счетчиков
    pageSize: 100,
    queryParams: useMemo(() => {
      const shouldApplyFilters = activeTab === 'persons' && menuSelection === 'mine';
      return buildMineParams(shouldApplyFilters, {
        q: searchPersons,
        categoryList: filters.categories,
        countryList: filters.countries,
        statusMap: statusFilters
      });
    }, [activeTab, menuSelection, searchPersons, filters, statusFilters])
  });
  const personsMineState = personsMineResult[0];
  const personsMineActions = personsMineResult[1];
  
  // Логи для отладки убраны

  // Создаем стабильный ключ для достижений
  // removed unused achievementsMineQueryKey

  const achievementsMineResult = useApiData({
    endpoint: '/api/achievements/mine',
    enabled: isAuthenticated, // Загружаем всегда для счетчиков
    pageSize: 100,
    queryParams: useMemo(() => {
      const shouldApplyFilters = activeTab === 'achievements' && menuSelection === 'mine';
      return buildMineParams(shouldApplyFilters, {
        q: searchAch,
        statusMap: achStatusFilters
      });
    }, [activeTab, menuSelection, searchAch, achStatusFilters])
  });
  const achievementsMineState = achievementsMineResult[0];
  const achievementsMineActions = achievementsMineResult[1];

  // Создаем стабильный ключ для периодов
  // removed unused periodsMineQueryKey

  const periodsMineResult = useApiData({
    endpoint: '/api/periods/mine',
    enabled: isAuthenticated, // Загружаем всегда для счетчиков
    pageSize: 100,
    queryParams: useMemo(() => {
      const shouldApplyFilters = activeTab === 'periods' && menuSelection === 'mine';
      return buildMineParams(shouldApplyFilters, {
        q: searchPeriods,
        statusMap: periodsStatusFilters,
        extra: { type: periodType || undefined }
      });
    }, [activeTab, menuSelection, searchPeriods, periodType, periodsStatusFilters])
  });
  const periodsMineState = periodsMineResult[0];
  const periodsMineActions = periodsMineResult[1];



  const getAchievementsData = () => {
    if (menuSelection === 'all') {
      return {
        items: achItemsAll,
        isLoading: achLoadingAll,
        hasMore: hasMoreAll,
        loadMore: loadMoreAll
      };
    } else if (isMineOrPendingMode) {
      return {
        items: achievementsMineState.items,
        isLoading: achievementsMineState.isLoading,
        hasMore: achievementsMineState.hasMore,
        loadMore: achievementsMineActions.loadMore
      };
    }
    return { items: [], isLoading: false, hasMore: false, loadMore: () => {} };
  };

  const getPeriodsData = () => {
    if (menuSelection === 'all') {
      return {
        items: periodItemsAll,
        isLoading: periodsLoadingAll,
        hasMore: periodsHasMoreAll,
        loadMore: loadMorePeriodsAll
      };
    } else if (isMineOrPendingMode) {
      return {
        items: periodsMineState.items,
        isLoading: periodsMineState.isLoading,
        hasMore: periodsMineState.hasMore,
        loadMore: periodsMineActions.loadMore
      };
    }
    return { items: [], isLoading: false, hasMore: false, loadMore: () => {} };
  };

  return {
    // Состояния поиска
    searchPersons,
    setSearchPersons,
    searchAch,
    setSearchAch,
    searchPeriods,
    setSearchPeriods,
    periodType,
    setPeriodType,

    // Фильтры статусов
    statusFilters,
    setStatusFilters,
    achStatusFilters,
    setAchStatusFilters,
    periodsStatusFilters,
    setPeriodsStatusFilters,

    // Данные для режима "Все"
    personsAll: personsAll,
    isPersonsLoadingAll: isPersonsLoadingAll,
    personsHasMoreAll: personsHasMoreAll,
    loadMorePersonsAll: loadMorePersonsAll,

    // Данные для режима "Мои"
    personsAlt: personsMineState.items,
    personsAltLoading: personsMineState.isLoading,
    personsAltHasMore: personsMineState.hasMore,
    loadMorePersonsAlt: personsMineActions.loadMore,

    // Данные для достижений и периодов (режим "Все")
    achievementsData: getAchievementsData(),
    periodsData: getPeriodsData(),

    // Данные для режима "Мои"
    achievementsMineData: {
      items: achievementsMineState.items,
      isLoading: achievementsMineState.isLoading,
      hasMore: achievementsMineState.hasMore,
      loadMore: achievementsMineActions.loadMore
    },
    periodsMineData: {
      items: periodsMineState.items,
      isLoading: periodsMineState.isLoading,
      hasMore: periodsMineState.hasMore,
      loadMore: periodsMineActions.loadMore
    },

    // Действия для сброса
    resetPersons: personsMineActions.reset,
    resetAchievements: achievementsMineActions.reset,
    resetPeriods: periodsMineActions.reset
  };
}
