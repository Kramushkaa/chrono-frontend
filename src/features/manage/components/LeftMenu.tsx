import React from 'react'
import type { UserList, ListModerationStatus } from 'shared/types'

export type UserListItem = (UserList & { readonly?: boolean })
export type LeftMenuSelection =
  | { type: 'all' }
  | { type: 'pending' }
  | { type: 'mine' }
  | { type: 'list'; listId: number }

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

const statusLabels: Record<ListModerationStatus, string> = {
  draft: 'Черновик',
  pending: 'На модерации',
  published: 'Опубликован',
  rejected: 'Отклонён',
}

const statusColors: Record<ListModerationStatus, string> = {
  draft: 'rgba(139,69,19,0.35)',
  pending: 'rgba(255,165,0,0.6)',
  published: 'rgba(46,160,67,0.6)',
  rejected: 'rgba(220,53,69,0.6)',
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
             onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ type: 'mine' }) }}>Мои {typeof mineCount === 'number' ? `(${mineCount})` : ''}</div>
        {userLists.map((l) => {
          const active = selectedKey === `list:${l.id}`
          const statusBadge = !l.readonly ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 6px',
                borderRadius: 12,
                fontSize: 10,
                backgroundColor: statusColors[l.moderation_status],
                color: '#fff',
                marginLeft: 6,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
              }}
            >
              {statusLabels[l.moderation_status]}
            </span>
          ) : null
          return (
            <div key={l.id} 
                 role="button" 
                 tabIndex={0}
                 style={{ ...itemStyle(active), ...rowStyle }}
                 onClick={() => onSelect({ type: 'list', listId: l.id })}
                 onKeyDown={(e) => { if (e.key === 'Enter') onSelect({ type: 'list', listId: l.id }) }}>
              <div style={{ flex: 1 }}>
                <span>{l.title}</span>
                <span style={{ opacity: 0.7, marginLeft: 6, fontSize: 12 }}>({l.items_count || 0})</span>
                {statusBadge}
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





