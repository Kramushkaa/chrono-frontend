import React from 'react'
import { FilterDropdown } from 'shared/ui/FilterDropdown'
import type { FiltersState, SetFilters } from 'shared/types'

interface Props {
  itemType: 'person' | 'achievement' | 'period'
  searchQuery: string
  setSearchQuery: (v: string) => void
  categories: string[]
  countries: string[]
  filters: FiltersState
  setFilters: SetFilters
  statusFilters: Record<string, boolean>
  setStatusFilters: (fs: Record<string, boolean>) => void
  showStatusFilter: boolean
  showPersonFilters: boolean
  totalCount: number
  isLoading: boolean
  hasMore: boolean
}

export function SearchAndFilters({
  itemType,
  searchQuery,
  setSearchQuery,
  categories,
  countries,
  filters,
  setFilters,
  statusFilters,
  setStatusFilters,
  showStatusFilter,
  showPersonFilters,
  totalCount,
  isLoading,
  hasMore
}: Props) {
  return (
    <div className="search-and-filters" role="region" aria-label="Фильтр и поиск" style={{ marginBottom: 12 }}>
      {showStatusFilter && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterDropdown
            title="📋 Статус"
            textLabel="Статус"
            items={['🟡 Черновики', '🟠 На модерации', '🟢 Одобренные', '🔴 Отклоненные']}
            selectedItems={Object.entries(statusFilters)
              .filter(([_, checked]) => checked)
              .map(([status]) => {
                switch (status) {
                  case 'draft': return '🟡 Черновики'
                  case 'pending': return '🟠 На модерации'
                  case 'approved': return '🟢 Одобренные'
                  case 'rejected': return '🔴 Отклоненные'
                  default: return status
                }
              })}
            onSelectionChange={(statuses) => {
              const statusMap: Record<string, string> = {
                '🟡 Черновики': 'draft',
                '🟠 На модерации': 'pending',
                '🟢 Одобренные': 'approved',
                '🔴 Отклоненные': 'rejected'
              }
              const selectedKeys = (statuses as string[]).map(s => statusMap[s]).filter(Boolean)
              const newFilters = {
                draft: selectedKeys.includes('draft'),
                pending: selectedKeys.includes('pending'),
                approved: selectedKeys.includes('approved'),
                rejected: selectedKeys.includes('rejected')
              }
              setStatusFilters(newFilters)
            }}
            getItemColor={(item) => {
              if (item.includes('Черновики')) return '#ffc107'
              if (item.includes('модерации')) return '#fd7e14'
              if (item.includes('Одобренные')) return '#28a745'
              if (item.includes('Отклоненные')) return '#dc3545'
              return '#f4e4c1'
            }}
          />
        </div>
      )}

      <div className="search-and-filters__controls" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          id={`${itemType}-search-input`}
          className="search-and-filters__input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value.replace(/\s+/g, ' ').trimStart())}
          placeholder={itemType === 'person' ? 'Поиск по имени/стране' : itemType === 'achievement' ? 'Поиск по достижениям/имени/стране' : 'Поиск по имени/стране'}
        />

        {showPersonFilters && (
          <>
            <FilterDropdown
              title="🎭"
              textLabel="Род деятельности"
              items={categories}
              selectedItems={filters?.categories || []}
              onSelectionChange={(categories: string[]) => setFilters((prev) => ({ ...prev, categories }))}
              getItemColor={() => '#f4e4c1'}
            />
            <FilterDropdown
              title="🌍"
              textLabel="Страна"
              items={countries}
              selectedItems={filters?.countries || []}
              onSelectionChange={(countries: string[]) => setFilters((prev) => ({ ...prev, countries }))}
              getItemColor={() => '#f4e4c1'}
            />
          </>
        )}

        <div className="search-and-filters__count" style={{ fontSize: 12, opacity: 0.8 }}>
          Найдено: {totalCount}{!isLoading && hasMore ? '+' : ''}
        </div>
      </div>
    </div>
  )
}


