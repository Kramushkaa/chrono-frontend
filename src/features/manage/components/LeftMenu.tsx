import React from 'react'

export type UserListItem = { id: number; title: string; items_count?: number }
export type LeftMenuSelection = { type: 'all' | 'pending' | 'mine' | 'list'; listId?: number }

type Props = {
  selectedKey: string
  onSelect: (sel: LeftMenuSelection) => void
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  userLists: UserListItem[]
  onAddList: () => void
  labelAll?: string
  onDeleteList?: (id: number) => void
  onShareList?: (id: number) => void
  onShowOnTimeline?: (id: number) => void
  readonlyListId?: number
  onCopySharedList?: (id: number) => void
  id?: string
}

export function LeftMenu({ selectedKey, onSelect, isModerator, pendingCount, mineCount, userLists, onAddList, labelAll = 'Все', onDeleteList, onShareList, onShowOnTimeline, readonlyListId, onCopySharedList, id }: Props) {
  const itemStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 8px',
    cursor: 'pointer',
    borderBottom: '1px solid rgba(139,69,19,0.2)',
    background: active ? 'rgba(139,69,19,0.15)' : 'transparent',
    fontWeight: active ? 600 : 400,
  })
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 }
  const actionsStyle: React.CSSProperties = { display: 'flex', gap: 4, marginLeft: 'auto' }
  const actionBtn: React.CSSProperties = { padding: '2px 6px', fontSize: 12 }
  return (
    <div id={id} role="region" aria-label="Меню списков" style={{ borderRight: '1px solid rgba(139,69,19,0.3)', paddingRight: 12, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' }}>
      <div role="list" style={{ display: 'grid', minWidth: 220 }}>
        <div role="button" tabIndex={0} style={itemStyle(selectedKey === 'all')}
             onClick={() => onSelect({ type: 'all' })}
             onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ type: 'all' }) }}>{labelAll}</div>
        {isModerator && (pendingCount || 0) > 0 && (
          <div role="button" tabIndex={0} style={itemStyle(selectedKey === 'pending')}
               onClick={() => onSelect({ type: 'pending' })}
               onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ type: 'pending' }) }}>Ожидают модерации ({pendingCount})</div>
        )}
        {/* Always show "Мои" for authenticated users */}
        <div role="button" tabIndex={0} style={itemStyle(selectedKey === 'mine')}
             onClick={() => onSelect({ type: 'mine' })}
             onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ type: 'mine' }) }}>Мои {mineCount ? `(${mineCount})` : ''}</div>
        {userLists.map((l) => {
          const active = selectedKey === `list:${l.id}`
          return (
            <div key={l.id} 
                 role="button" 
                 tabIndex={0}
                 style={{ ...itemStyle(active), ...rowStyle }}
                 onClick={() => onSelect({ type: 'list', listId: l.id })}
                 onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ type: 'list', listId: l.id }) }}>
              <div style={{ flex: 1 }}>
                {l.title}<span style={{ opacity: 0.7, marginLeft: 6, fontSize: 12 }}>({l.items_count || 0})</span>
              </div>
              <div style={actionsStyle} aria-label="Действия со списком">
                {readonlyListId === l.id ? (
                  <>
                    <button title="Скопировать себе" style={actionBtn} onClick={(e) => { e.stopPropagation(); onCopySharedList?.(l.id) }}>📋</button>
                    <button title="Показать на таймлайне" style={actionBtn} onClick={(e) => { e.stopPropagation(); onShowOnTimeline?.(l.id) }}>⏱️</button>
                  </>
                ) : (
                  <>
                    <button title="Показать на таймлайне" style={actionBtn} onClick={(e) => { e.stopPropagation(); onShowOnTimeline?.(l.id) }}>⏱️</button>
                    <button title="Поделиться" style={actionBtn} onClick={(e) => { e.stopPropagation(); onShareList?.(l.id) }}>🔗</button>
                    <button title="Удалить" style={actionBtn} onClick={(e) => { e.stopPropagation();
                      const ok = window.confirm('Удалить список и все его элементы?'); if (ok) onDeleteList?.(l.id)
                    }}>🗑️</button>
                  </>
                )}
              </div>
            </div>
          )
        })}
        <div style={{ padding: '6px 8px' }}>
          <button onClick={onAddList}>Создать список</button>
        </div>
      </div>
    </div>
  )
}


