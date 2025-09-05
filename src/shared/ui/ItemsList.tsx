import React from 'react'
import { ItemCard } from './ItemCard'

interface ItemsListProps {
  items: Array<{
    id: number | string
    title: string
    subtitle?: string
    description?: string
    year?: number | string
    startYear?: number | string
    endYear?: number | string
    type?: string
    person?: any
  }>
  isLoading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onAddToList?: (id: number | string) => void
  onSelect?: (id: number | string) => void
  onPersonSelect?: (person: any) => void
  isAuthenticated?: boolean
  emailVerified?: boolean
  showAuthModal?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  emptyMessage?: string
  loadingMessage?: string
  style?: React.CSSProperties
  gridMinWidth?: number
}

export function ItemsList({
  items,
  isLoading,
  hasMore,
  onLoadMore,
  onAddToList,
  onSelect,
  onPersonSelect,
  isAuthenticated = true,
  emailVerified = true,
  showAuthModal,
  showToast,
  emptyMessage = "Элементы не найдены",
  loadingMessage = "Загрузка...",
  style,
  gridMinWidth = 260
}: ItemsListProps) {
  const handleAddToList = (id: number | string) => {
    if (onAddToList) {
      onAddToList(id)
    }
  }

  const handleSelect = (id: number | string) => {
    if (onSelect) {
      onSelect(id)
    }
  }

  return (
    <div
      className="items-list"
      id="items-list"
      role="region"
      aria-label="Список элементов"
      style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: 6, ...style }}
      onScroll={(e) => {
        const el = e.currentTarget as HTMLDivElement
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
          if (!isLoading && hasMore) {
            onLoadMore()
          }
        }
      }}
    >
      {isLoading && items.length === 0 && <div>{loadingMessage}</div>}
      
      {!isLoading && items.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px', 
          opacity: 0.7, 
          fontSize: 14,
          border: '1px dashed rgba(139,69,19,0.3)',
          borderRadius: 8,
          background: 'rgba(139,69,19,0.05)'
        }}>
          {emptyMessage}
        </div>
      )}
      
      <div className="items-list__grid" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${gridMinWidth}px, 1fr))`, gap: 12 }}>
        {items.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            subtitle={item.subtitle}
            description={item.description}
            year={item.year}
            startYear={item.startYear}
            endYear={item.endYear}
            person={item.person}
            onPersonSelect={onPersonSelect}
            type={item.type}
            onAddToList={onAddToList ? () => handleAddToList(item.id) : undefined}
            onSelect={onSelect ? () => handleSelect(item.id) : undefined}
            isAuthenticated={isAuthenticated}
            emailVerified={emailVerified}
            showAuthModal={showAuthModal}
            showToast={showToast}
          />
        ))}
      </div>
      
      {!isLoading && hasMore && (
        <div style={{ marginTop: 12 }}>
          <button onClick={onLoadMore} style={{ padding: '6px 12px' }}>
            Показать ещё
          </button>
        </div>
      )}
    </div>
  )
}
