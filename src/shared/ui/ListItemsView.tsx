import React from 'react'
import { ListSummary } from 'shared/ui/ListSummary'

type MixedItem = { key: string; listItemId: number; type: 'person' | 'achievement' | 'period'; title: string; subtitle?: string }

type Props = {
  items: MixedItem[]
  filterType: 'person' | 'achievement' | 'period'
  isLoading: boolean
  onDelete: (listItemId: number) => Promise<void> | void
  emptyText?: string
  onPersonSelect?: (person: any) => void
}

export function ListItemsView({ items, filterType, isLoading, onDelete, emptyText = 'Список пуст', onPersonSelect }: Props) {
  const filtered = items.filter(i => i.type === filterType)

  return (
    <div className="list-items-view" id="list-items-view" role="region" aria-label="Содержимое списка" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto', paddingRight: 6 }}>
      <ListSummary items={items} style={{ marginBottom: 8, fontSize: 12, opacity: 0.9 }} />
      {isLoading && filtered.length === 0 && <div>Загрузка…</div>}
      {filtered.map((it) => (
        <div 
          key={it.key} 
          className="list-items-view__row" 
          id={`list-item-${it.listItemId}`} 
          style={{ 
            padding: '6px 8px', 
            borderBottom: '1px solid rgba(139,69,19,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            cursor: onPersonSelect && it.type === 'person' ? 'pointer' : 'default'
          }}
          onClick={onPersonSelect && it.type === 'person' ? () => onPersonSelect(it) : undefined}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{it.title}</div>
            {it.subtitle && <div style={{ fontSize: 12, opacity: 0.85 }}>{it.subtitle}</div>}
          </div>
          <button aria-label="Удалить из списка" title="Удалить" onClick={async (e) => { 
            e.stopPropagation()
            await onDelete(it.listItemId) 
          }}>✕</button>
        </div>
      ))}
      {!isLoading && filtered.length === 0 && <div style={{ opacity: 0.8 }}>{emptyText}</div>}
    </div>
  )
}





