import { useCallback, useMemo } from 'react';
import { useApiData } from './useApiData';

export interface DataLoaderConfig<T> {
  endpoint: string;
  limit?: number;
  transformData?: (data: any[]) => T[];
  clientSideFilter?: (items: T[], filters: any) => T[];
  queryParams?: Record<string, string | number | boolean>;
  cacheKey?: string;
}

export interface DataLoaderState<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  isInitialLoading: boolean;
}

export interface DataLoaderActions {
  loadMore: () => void;
  reset: () => void;
  refetch: () => void;
}

export function useDataLoaderV2<T>(
  config: DataLoaderConfig<T>,
  filters: any,
  isActive: boolean,
  menuSelection: string
): [DataLoaderState<T>, DataLoaderActions] {
  // Формируем параметры запроса
  const queryParams = useMemo(() => {
    const params = { ...config.queryParams };
    
    // Добавляем серверные фильтры для режима 'mine'
    if (menuSelection === 'mine' && filters.status) {
      const selectedStatuses = Object.entries(filters.status)
        .filter(([_, checked]) => checked)
        .map(([status, _]) => status);
      if (selectedStatuses.length > 0) {
        params.status = selectedStatuses.join(',');
      }
    }
    
    return params;
  }, [config.queryParams, menuSelection, filters.status]);

  // Используем универсальный хук
  const [apiState, apiActions] = useApiData<T>({
    endpoint: config.endpoint,
    pageSize: config.limit || 50,
    enabled: isActive,
    cacheKey: config.cacheKey,
    queryParams,
    transformData: config.transformData,
    onError: (error) => {
      console.error('DataLoader error:', error);
    }
  });

  // Применяем клиентскую фильтрацию
  const clientFilteredItems = useMemo(() => {
    if (config.clientSideFilter && apiState.items.length > 0) {
      return config.clientSideFilter(apiState.items, filters);
    }
    return apiState.items;
  }, [apiState.items, filters, config]);

  // Сброс при изменении фильтров или режима
  const reset = useCallback(() => {
    apiActions.reset();
  }, [apiActions]);

  // Повторная загрузка
  const refetch = useCallback(() => {
    apiActions.refetch();
  }, [apiActions]);

  return [
    {
      ...apiState,
      items: clientFilteredItems
    },
    {
      loadMore: apiActions.loadMore,
      reset,
      refetch
    }
  ];
}

// Хук для простого использования без сложной логики
export function useSimpleDataLoader<T>(
  endpoint: string,
  queryParams: Record<string, string | number | boolean> = {},
  enabled: boolean = true
) {
  const [state, actions] = useApiData<T>({
    endpoint,
    queryParams,
    enabled,
    cacheKey: `${endpoint}:${JSON.stringify(queryParams)}`
  });

  return {
    data: state.items,
    isLoading: state.isLoading,
    hasMore: state.hasMore,
    error: state.error,
    loadMore: actions.loadMore,
    reset: actions.reset,
    refetch: actions.refetch
  };
}
