import { useState, useCallback, useRef } from 'react';
import { useEffect } from 'react';
import { apiData } from 'shared/api/api';

export interface DataLoaderConfig<T> {
  endpoint: string;
  limit?: number;
  transformData?: (data: any[]) => T[];
  clientSideFilter?: (items: T[], filters: any) => T[];
}

export interface DataLoaderState<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  offset: number;
  error: string | null;
}

export interface DataLoaderActions {
  loadMore: () => void;
  reset: () => void;
  setOffset: (offset: number) => void;
}

export function useDataLoader<T>(
  config: DataLoaderConfig<T>,
  filters: any,
  isActive: boolean,
  menuSelection: string
): [DataLoaderState<T>, DataLoaderActions] {
  const [state, setState] = useState<DataLoaderState<T>>({
    items: [],
    isLoading: false,
    hasMore: true,
    offset: 0,
    error: null
  });

  const [clientFilteredItems, setClientFilteredItems] = useState<T[]>([]);
  const allItemsRef = useRef<T[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingRef = useRef<boolean>(false);

  // Сброс состояния при изменении фильтров или режима
  const reset = useCallback(() => {
    setState({
      items: [],
      isLoading: false,
      hasMore: true,
      offset: 0,
      error: null
    });
    allItemsRef.current = [];
    setClientFilteredItems([]);
  }, []);

  // Загрузка данных - используем useRef для предотвращения циклических зависимостей
  const loadDataRef = useRef<((offset: number, isInitial?: boolean) => Promise<void>) | null>(null);

  loadDataRef.current = async (offset: number, isInitial = false) => {
    if (!isActive || loadingRef.current) return;

    // Отменяем предыдущий запрос
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    loadingRef.current = true;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams({
        limit: String(config.limit || 50),
        offset: String(offset)
      });

      // Добавляем фильтры в параметры запроса
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiData(`${config.endpoint}?${params.toString()}`, {
        signal: controller.signal
      });

      if (controller.signal.aborted) return;

      const rawData = response.data || [];
      const transformedData = config.transformData ? config.transformData(rawData) : rawData;

      if (isInitial) {
        allItemsRef.current = transformedData;
        setState(prev => ({
          ...prev,
          items: transformedData,
          hasMore: transformedData.length >= (config.limit || 50),
          offset: transformedData.length,
          isLoading: false
        }));
      } else {
        const newItems = [...allItemsRef.current, ...transformedData];
        allItemsRef.current = newItems;
        setState(prev => ({
          ...prev,
          items: newItems,
          hasMore: transformedData.length >= (config.limit || 50),
          offset: prev.offset + transformedData.length,
          isLoading: false
        }));
      }
    } catch (error: any) {
      if (controller.signal.aborted) return;
      
      setState(prev => ({
        ...prev,
        error: error?.message || 'Ошибка загрузки данных',
        isLoading: false,
        hasMore: false
      }));
    } finally {
      loadingRef.current = false;
      abortControllerRef.current = null;
    }
  };

  // Загрузка дополнительных данных
  const loadMore = useCallback(() => {
    if (state.hasMore && !loadingRef.current && loadDataRef.current) {
      loadDataRef.current(state.offset, false);
    }
  }, [state.hasMore, state.offset]);

  // Установка offset
  const setOffset = useCallback((offset: number) => {
    setState(prev => ({ ...prev, offset }));
  }, []);

  // Клиентская фильтрация
  useEffect(() => {
    if (config.clientSideFilter && allItemsRef.current.length > 0) {
      const filtered = config.clientSideFilter(allItemsRef.current, filters);
      setClientFilteredItems(filtered);
    } else {
      setClientFilteredItems(allItemsRef.current);
    }
  }, [filters, config.clientSideFilter, config]);

  // Сброс при изменении фильтров или режима
  useEffect(() => {
    reset();
  }, [filters, menuSelection, reset]);

  // Начальная загрузка
  useEffect(() => {
    if (isActive && state.offset === 0 && !loadingRef.current && loadDataRef.current) {
      loadDataRef.current(0, true);
    }
  }, [isActive, state.offset, config.endpoint, config.limit]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return [
    {
      ...state,
      items: config.clientSideFilter ? clientFilteredItems : state.items
    },
    {
      loadMore,
      reset,
      setOffset
    }
  ];
}