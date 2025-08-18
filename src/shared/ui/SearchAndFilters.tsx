import React from 'react'

interface SearchAndFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  filters?: Array<{
    key: string
    label: string
    value: string
    options: Array<{ value: string; label: string }>
    onChange: (value: string) => void
  }>
  foundCount: number
  hasMore?: boolean
  isLoading?: boolean
  style?: React.CSSProperties
}

export function SearchAndFilters({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Поиск...",
  filters = [],
  foundCount,
  hasMore = false,
  isLoading = false,
  style
}: SearchAndFiltersProps) {
  return (
    <div role="region" aria-label="Фильтр и поиск" style={{ marginBottom: 12, ...style }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <input 
          value={searchValue} 
          onChange={(e) => onSearchChange(e.target.value)} 
          placeholder={searchPlaceholder} 
          style={{ flex: '1 1 260px', minWidth: 260, padding: 6 }} 
        />
        
        {filters.map(filter => (
          <select 
            key={filter.key}
            value={filter.value} 
            onChange={(e) => filter.onChange(e.target.value)} 
            style={{ padding: 6 }}
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
      
      <div style={{ fontSize: 12, opacity: 0.8 }}>
        Найдено: {foundCount}{!isLoading && hasMore ? '+' : ''}
      </div>
    </div>
  )
}
