import { useState, useMemo } from 'react';
import { useAchievements } from 'shared/hooks/useAchievements';
import { usePeriods } from 'shared/hooks/usePeriods'; 
import { usePersons } from 'features/persons/hooks/usePersons'; 
import { useApiData } from 'shared/hooks/useApiData';
import { buildMineParams } from 'features/manage/utils/queryParams';
import type { Person, Achievement, FiltersState } from 'shared/types';

type Tab = 'persons' | 'achievements' | 'periods';
type MenuSelection = 'all' | 'pending' | 'mine' | `list:${number}`;

// Period type для manage
interface PeriodItem {
  id: number
  name: string
  startYear: number
  endYear: number
  type: string
  description?: string
  person_id?: string
  country_id?: number
  status?: string
}

export function useManagePageData(activeTab: Tab, menuSelection: MenuSelection, isAuthenticated: boolean, filters: FiltersState) {
  
  
  
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

  // Загружаем элементы "Моих" только когда вкладка открыта
  const enablePersonsMine = isAuthenticated && menuSelection === 'mine' && activeTab === 'persons'
  
  // Стабилизируем зависимости для предотвращения бесконечных вызовов
  const categoriesString = useMemo(() => filters.categories.join(','), [filters.categories]);
  const countriesString = useMemo(() => filters.countries.join(','), [filters.countries]);
  const statusFiltersString = useMemo(() => JSON.stringify(statusFilters), [statusFilters]);
  
  const personsQueryParams = useMemo(() => {
    const shouldApplyFilters = activeTab === 'persons' && isMineOrPendingMode;
    return buildMineParams(shouldApplyFilters, {
      q: searchPersons,
      categoryList: filters.categories,
      countryList: filters.countries,
      statusMap: statusFilters
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isMineOrPendingMode, searchPersons, categoriesString, countriesString, statusFiltersString]);
  
  const personsMineResult = useApiData<Person>({
    endpoint: '/api/persons/mine',
    enabled: enablePersonsMine,
    pageSize: 100,
    queryParams: personsQueryParams
  });
  const personsMineState = personsMineResult[0];
  const personsMineActions = personsMineResult[1];
  
  // Логи для отладки убраны

  // Создаем стабильный ключ для достижений
  // removed unused achievementsMineQueryKey

  const enableAchievementsMine = isAuthenticated && menuSelection === 'mine' && activeTab === 'achievements'
  
  // Стабилизируем зависимости для achievements
  const achStatusFiltersString = useMemo(() => JSON.stringify(achStatusFilters), [achStatusFilters]);
  
  const achievementsQueryParams = useMemo(() => {
    const shouldApplyFilters = activeTab === 'achievements' && isMineOrPendingMode;
    return buildMineParams(shouldApplyFilters, {
      q: searchAch,
      statusMap: achStatusFilters
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isMineOrPendingMode, searchAch, achStatusFiltersString]);
  
  const achievementsMineResult = useApiData<Achievement>({
    endpoint: '/api/achievements/mine',
    enabled: enableAchievementsMine,
    pageSize: 100,
    queryParams: achievementsQueryParams
  });
  const achievementsMineState = achievementsMineResult[0];
  const achievementsMineActions = achievementsMineResult[1];

  // Создаем стабильный ключ для периодов
  // removed unused periodsMineQueryKey

  const enablePeriodsMine = isAuthenticated && menuSelection === 'mine' && activeTab === 'periods'
  
  // Стабилизируем зависимости для periods
  const periodsStatusFiltersString = useMemo(() => JSON.stringify(periodsStatusFilters), [periodsStatusFilters]);
  
  const periodsQueryParams = useMemo(() => {
    const shouldApplyFilters = activeTab === 'periods' && isMineOrPendingMode;
    return buildMineParams(shouldApplyFilters, {
      q: searchPeriods,
      statusMap: periodsStatusFilters,
      extra: { type: periodType || undefined }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isMineOrPendingMode, searchPeriods, periodType, periodsStatusFiltersString]);
  
  const periodsMineResult = useApiData<PeriodItem>({
    endpoint: '/api/periods/mine',
    enabled: enablePeriodsMine,
    pageSize: 100,
    queryParams: periodsQueryParams
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
    // Флаги активности mine
    enablePersonsMine,
    enableAchievementsMine,
    enablePeriodsMine,

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
    personsAltInitialLoading: personsMineState.isInitialLoading,
    personsAltHasMore: personsMineState.hasMore,
    loadMorePersonsAlt: personsMineActions.loadMore,

    // Данные для достижений и периодов (режим "Все")
    achievementsData: getAchievementsData(),
    periodsData: getPeriodsData(),

    // Данные для режима "Мои"
    achievementsMineData: {
      items: achievementsMineState.items,
      isLoading: achievementsMineState.isLoading || achievementsMineState.isInitialLoading,
      isInitialLoading: achievementsMineState.isInitialLoading,
      hasMore: achievementsMineState.hasMore,
      loadMore: achievementsMineActions.loadMore
    },
    periodsMineData: {
      items: periodsMineState.items,
      isLoading: periodsMineState.isLoading || periodsMineState.isInitialLoading,
      isInitialLoading: periodsMineState.isInitialLoading,
      hasMore: periodsMineState.hasMore,
      loadMore: periodsMineActions.loadMore
    },

    // Действия для сброса
    resetPersons: personsMineActions.reset,
    resetAchievements: achievementsMineActions.reset,
    resetPeriods: periodsMineActions.reset
  };
}
