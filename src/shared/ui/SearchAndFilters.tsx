import React from 'react'
import { FilterDropdown } from './FilterDropdown'

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
    <div className="search-and-filters" role="region" aria-label="Фильтр и поиск" style={{ marginBottom: 12, ...style }}>
      <div className="search-and-filters__controls" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
        <input 
          className="search-and-filters__input"
          value={searchValue} 
          onChange={(e) => onSearchChange(e.target.value)} 
          placeholder={searchPlaceholder} 
          style={{ flex: '1 1 200px', minWidth: 200, maxWidth: '100%', padding: 6 }} 
        />
        
        {filters.map(filter => (
          <div key={filter.key} className="filter-dropdown">
            <FilterDropdown
              title={filter.label}
              textLabel={filter.label}
              items={filter.options.map(opt => opt.label)}
              selectedItems={filter.value ? [filter.options.find(opt => opt.value === filter.value)?.label || ''] : []}
              onSelectionChange={(selected) => {
                const selectedValue = selected.length > 0 ? selected[0] : ''
                const option = filter.options.find(opt => opt.label === selectedValue)
                filter.onChange(option ? option.value : '')
              }}
              getItemColor={() => '#f4e4c1'}
            />
          </div>
        ))}
      </div>
      
      <div className="search-and-filters__count" style={{ fontSize: 12, opacity: 0.8 }}>
        Найдено: {foundCount}{!isLoading && hasMore ? '+' : ''}
      </div>
    </div>
  )
}
