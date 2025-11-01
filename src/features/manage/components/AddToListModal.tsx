import React, { useEffect, useRef, useState } from 'react'
import type { UserListItem } from './LeftMenu'

type Props = {
  isOpen: boolean
  onClose: () => void
  lists: UserListItem[]
  onAdd: (listId: number) => Promise<void> | void
  onCreateList?: () => void
  extraControls?: React.ReactNode
}

export function AddToListModal({ isOpen, onClose, lists, onAdd, onCreateList, extraControls }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [selectedId, setSelectedId] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => ref.current?.focus(), 0)
      setSelectedId(lists[0]?.id ?? '')
    } else {
      setSelectedId('')
    }
  }, [isOpen, lists])
  if (!isOpen) return null
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
         style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div ref={ref} tabIndex={-1} onClick={(e) => e.stopPropagation()}
           style={{ background: 'rgba(44,24,16,0.95)', border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 16, minWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 'bold' }}>Добавить в список</div>
          <button onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <select value={selectedId === '' ? '' : String(selectedId)} onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : '')}
                  style={{ padding: '6px' }}>
            {lists.length === 0 && <option value="">Нет списков</option>}
            {lists.map(l => (
              <option key={l.id} value={l.id}>{l.title} ({l.items_count ?? 0})</option>
            ))}
          </select>
          {extraControls}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            <div>
              {onCreateList && <button onClick={onCreateList}>Создать список</button>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onClose} disabled={saving}>Отмена</button>
              <button
                onClick={async () => {
                  if (selectedId === '' || !Number.isInteger(selectedId)) return
                  setSaving(true)
                  try { await onAdd(selectedId) } finally { setSaving(false) }
                }}
                disabled={saving || selectedId === ''}
              >Добавить</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}





