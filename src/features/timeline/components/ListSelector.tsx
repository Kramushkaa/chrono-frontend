import React from 'react'

interface Props {
  isAuthenticated: boolean
  personLists: Array<{ id: number; title: string }>
  selectedListId: number | null
  selectedListKey: string
  sharedListMeta: { code: string; title: string; listId?: number } | null
  onChange: (value: string) => void
}

export function ListSelector({ isAuthenticated, personLists, selectedListId, selectedListKey, sharedListMeta, onChange }: Props) {
  return (
    <select
      value={selectedListKey || (selectedListId ? `list:${selectedListId}` : '')}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '4px 8px', minWidth: 160 }}
    >
      <option value="">Все</option>
      {sharedListMeta ? (
        <option value={`share:${sharedListMeta.code}`}>🔒 {sharedListMeta.title}</option>
      ) : null}
      {isAuthenticated ? personLists.map(l => (
        <option key={l.id} value={`list:${l.id}`}>{l.title}</option>
      )) : null}
    </select>
  )
}


