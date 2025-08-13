import React, { useEffect, useRef, useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string) => Promise<void> | void
}

export function CreateListModal({ isOpen, onClose, onCreate }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    if (isOpen) setTimeout(() => ref.current?.focus(), 0)
    else setTitle('')
  }, [isOpen])
  if (!isOpen) return null
  return (
    <div role="dialog" aria-modal="true" onClick={onClose}
         style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
      <div ref={ref} tabIndex={-1} onClick={(e) => e.stopPropagation()}
           style={{ background: 'rgba(44,24,16,0.95)', border: '1px solid rgba(139,69,19,0.4)', borderRadius: 8, padding: 16, minWidth: 360 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 'bold' }}>Новый список</div>
          <button onClick={onClose}>✕</button>
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Название списка" />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} disabled={saving}>Отмена</button>
            <button
              onClick={async () => {
                const t = title.trim()
                if (!t) return
                setSaving(true)
                try { await onCreate(t); onClose(); }
                finally { setSaving(false) }
              }}
              disabled={saving || title.trim().length === 0}
            >Создать</button>
          </div>
        </div>
      </div>
    </div>
  )
}


