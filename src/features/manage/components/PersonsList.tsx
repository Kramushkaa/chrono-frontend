import React from 'react'
import { Person } from 'shared/types'
import { FilterDropdown } from 'shared/ui/FilterDropdown'

type FiltersState = {
  categories: string[]
  countries: string[]
  showAchievements?: boolean
  hideEmptyCenturies?: boolean
  timeRange?: { start: number; end: number }
}

type Props = {
  search: string
  setSearch: (v: string) => void
  categories: string[]
  countries: string[]
  filters: FiltersState
  setFilters: (updater: (prev: FiltersState) => FiltersState) => void
  persons: Person[]
  isLoading: boolean
  hasMore: boolean
  loadMore: () => void
  onSelect: (p: Person) => void
}

export function PersonsList({ search, setSearch, categories, countries, filters, setFilters, persons, isLoading, hasMore, loadMore, onSelect }: Props) {
  return (
    <div role="region" aria-label="Список личностей" style={{ borderRight: '1px solid rgba(139,69,19,0.3)', paddingRight: 12 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ marginBottom: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск"
            style={{ width: '100%', padding: 6 }}
          aria-label="Поиск личностей"
          />
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <FilterDropdown
            title="Категории"
            textLabel="Род деятельности"
            items={categories}
            selectedItems={filters.categories}
            onSelectionChange={(cats) => setFilters(prev => ({ ...prev, categories: cats })) as any}
          />
          <FilterDropdown
            title="Страны"
            textLabel="Страна"
            items={countries}
            selectedItems={filters.countries}
            onSelectionChange={(cntrs) => setFilters(prev => ({ ...prev, countries: cntrs })) as any}
          />
        </div>
      </div>
      <div
        role="list"
        aria-busy={isLoading}
        onScroll={(e) => {
          const el = e.currentTarget as HTMLDivElement
          if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
            if (!isLoading && hasMore) loadMore()
          }
        }}
        style={{ overflowY: 'auto', maxHeight: '70vh', paddingRight: 6 }}
      >
        {isLoading && persons.length === 0 && <div>Загрузка...</div>}
        {persons.map(p => (
          <div key={p.id} onClick={() => onSelect(p)} role="button" tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); onSelect(p) }
            }}
            style={{ padding: '6px 8px', cursor: 'pointer', borderBottom: '1px solid rgba(139,69,19,0.2)' }}
          >
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85 }}>{p.category}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{(p as any).country}</div>
          </div>
        ))}
        {!isLoading && persons.length === 0 && <div style={{ opacity: 0.8 }}>Ничего не найдено</div>}
        {!isLoading && hasMore && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
            <button onClick={loadMore} style={{ padding: '6px 10px' }}>Показать ещё</button>
          </div>
        )}
      </div>
    </div>
  )
}



