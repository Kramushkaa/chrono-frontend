import { useState, useEffect, useCallback } from 'react'

export const useFilters = () => {
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('chrononinja-filters');
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      return {
        categories: parsed.categories || [],
        countries: parsed.countries || [],
        timeRange: parsed.timeRange || { start: -800, end: 2000 },
        showAchievements: parsed.showAchievements !== undefined ? parsed.showAchievements : true,
        hideEmptyCenturies: parsed.hideEmptyCenturies !== undefined ? parsed.hideEmptyCenturies : false
      };
    }
    return {
      categories: [] as string[],
      countries: [] as string[],
      timeRange: { start: -800, end: 2000 },
      showAchievements: true,
      hideEmptyCenturies: false
    };
  })

  const [groupingType, setGroupingType] = useState<'category' | 'country' | 'none'>(() => {
    const savedGrouping = localStorage.getItem('chrononinja-grouping');
    return savedGrouping as 'category' | 'country' | 'none' || 'category';
  })

  const [yearInputs, setYearInputs] = useState({
    start: filters.timeRange.start.toString(),
    end: filters.timeRange.end.toString()
  })

  // Сохраняем фильтры в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('chrononinja-filters', JSON.stringify(filters));
  }, [filters]);

  // Сохраняем тип группировки в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('chrononinja-grouping', groupingType);
  }, [groupingType]);

  // Функция для применения фильтра по году
  const applyYearFilter = useCallback((field: 'start' | 'end', value: string) => {
    const parsed = parseInt(value);
    const numValue = isNaN(parsed) ? (field === 'start' ? -800 : 2000) : parsed;
    setFilters(prev => ({
      ...prev,
      timeRange: { ...prev.timeRange, [field]: numValue }
    }))
  }, [])

  // Функция для обработки нажатия Enter
  const handleYearKeyPress = useCallback((field: 'start' | 'end', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyYearFilter(field, e.currentTarget.value)
      // Переводим фокус на следующий элемент
      const inputs = e.currentTarget.parentElement?.parentElement?.querySelectorAll('input')
      if (inputs) {
        const currentIndex = Array.from(inputs).indexOf(e.currentTarget)
        const nextInput = inputs[currentIndex + 1] as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      }
    }
  }, [applyYearFilter])

  const resetAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      countries: [],
      timeRange: { start: -800, end: 2000 },
      showAchievements: true,
      hideEmptyCenturies: false
    })
    setYearInputs({
      start: '-800',
      end: '2000'
    })
  }, [])

  const parseYearValue = useCallback((value: string, defaultValue: number): number => {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }, [])

  return {
    filters,
    setFilters,
    groupingType,
    setGroupingType,
    yearInputs,
    setYearInputs,
    applyYearFilter,
    handleYearKeyPress,
    resetAllFilters,
    parseYearValue
  }
} 