import React, { useState, useRef, useEffect } from 'react'
import { LeftMenuSelection } from './LeftMenu'

type Props = {
  selectedKey: string
  onSelect: (sel: LeftMenuSelection) => void
  isModerator: boolean
  pendingCount?: number | null
  mineCount?: number | null
  userLists: Array<{ id: number; title: string; items_count?: number }>
  onAddList: () => void
  labelAll?: string
}

export function MobileListSelector({ 
  selectedKey, 
  onSelect, 
  isModerator, 
  pendingCount, 
  mineCount, 
  userLists, 
  onAddList, 
  labelAll = 'Все' 
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSelectedLabel = () => {
    if (selectedKey === 'all') return labelAll
    if (selectedKey === 'pending') return `Ожидают (${pendingCount || 0})`
    if (selectedKey === 'mine') return `Мои ${typeof mineCount === 'number' ? `(${mineCount})` : ''}`
    if (selectedKey.startsWith('list:')) {
      const listId = Number(selectedKey.split(':')[1])
      const list = userLists.find(l => l.id === listId)
      return list ? `${list.title} (${list.items_count || 0})` : 'Список'
    }
    return 'Выберите'
  }

  const handleSelect = (selection: LeftMenuSelection) => {
    onSelect(selection)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="lists-mobile-selector">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lists-mobile-selector__button"
      >
        <span>{getSelectedLabel()}</span>
        <span style={{ fontSize: '20px' }}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="lists-mobile-selector__dropdown">
          <div style={{ padding: '8px 0' }}>
            {/* Все */}
            <button
              onClick={() => handleSelect({ type: 'all' })}
              className={`lists-mobile-selector__option ${selectedKey === 'all' ? 'lists-mobile-selector__option--active' : ''}`}
            >
              {labelAll}
            </button>

            {/* Ожидают модерации */}
            {isModerator && (pendingCount || 0) > 0 && (
              <button
                onClick={() => handleSelect({ type: 'pending' })}
                className={`lists-mobile-selector__option ${selectedKey === 'pending' ? 'lists-mobile-selector__option--active' : ''}`}
              >
                Ожидают модерации ({pendingCount})
              </button>
            )}

            {/* Мои */}
            <button
              onClick={() => handleSelect({ type: 'mine' })}
              className={`lists-mobile-selector__option ${selectedKey === 'mine' ? 'lists-mobile-selector__option--active' : ''}`}
            >
              Мои {typeof mineCount === 'number' ? `(${mineCount})` : ''}
            </button>

            {/* Разделитель */}
            {userLists.length > 0 && (
              <div className="lists-mobile-selector__divider" />
            )}

            {/* Пользовательские списки */}
            {userLists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleSelect({ type: 'list', listId: list.id })}
                className={`lists-mobile-selector__option ${selectedKey === `list:${list.id}` ? 'lists-mobile-selector__option--active' : ''}`}
              >
                {list.title} ({list.items_count || 0})
              </button>
            ))}

            {/* Кнопка создания списка */}
            <div className="lists-mobile-selector__divider lists-mobile-selector__divider--top" />
            <div style={{ padding: '8px 16px' }}>
              <button
                onClick={() => {
                  onAddList()
                  setIsOpen(false)
                }}
                className="lists-mobile-selector__create-button"
              >
                + Создать список
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



