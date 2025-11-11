import React from 'react'

interface ItemCardProps {
  id: number | string
  title: string
  subtitle?: string
  description?: string
  year?: number | string
  startYear?: number | string
  endYear?: number | string
  type?: string
  person?: any
  onAddToList?: () => void
  onRemoveFromList?: () => void
  onSelect?: () => void
  onPersonSelect?: (person: any) => void
  onEdit?: () => void
  isAuthenticated?: boolean
  emailVerified?: boolean
  showAuthModal?: () => void
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void
  addButtonTitle?: string
  addButtonDisabled?: boolean
  isListMode?: boolean
  showEditButton?: boolean
  style?: React.CSSProperties
}

export const ItemCard = React.memo(function ItemCard({
  id,
  title,
  subtitle,
  description,
  year,
  startYear,
  endYear,
  type,
  person,
  onAddToList,
  onRemoveFromList,
  onSelect,
  onPersonSelect,
  onEdit,
  isAuthenticated = true,
  emailVerified = true,
  showAuthModal,
  showToast,
  addButtonTitle = "Добавить в список",
  addButtonDisabled = false,
  isListMode = false,
  showEditButton = false,
  style
}: ItemCardProps) {
  
  const handleAddToList = () => {
    if (!isAuthenticated) {
      showAuthModal?.()
      return
    }
    if (!emailVerified) {
      showToast?.('Требуется подтверждение email', 'error')
      return
    }
    onAddToList?.()
  }

  const handleRemoveFromList = () => {
    onRemoveFromList?.()
  }

  const handleSelect = () => {
    if (onPersonSelect && person) {
      onPersonSelect(person)
    } else if (onSelect) {
      onSelect()
    }
  }

  return (
    <div 
      key={id}
      className="item-card items-list__card"
      id={`item-card-${id}`}
      style={{ 
        border: '1px solid rgba(139,69,19,0.4)', 
        borderRadius: 8, 
        padding: 12, 
        background: 'rgba(44,24,16,0.85)', 
        position: 'relative',
        cursor: onSelect ? 'pointer' : 'default',
        ...style
      }}
      onClick={handleSelect}
    >
      <div style={{ fontWeight: 'bold', marginBottom: 6 }}>{title || '—'}</div>
      
      {subtitle && (
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>{subtitle}</div>
      )}
      
      {type && (
        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
          {type}
        </div>
      )}
      
      {year !== undefined && year !== null && (
        <div style={{ fontSize: 14 }}>
          {year}
        </div>
      )}
      
      {(startYear || endYear) && (
        <div style={{ fontSize: 14 }}>
          {startYear ?? '—'} — {endYear ?? '—'}
        </div>
      )}
      
      {description && (
        <div style={{ fontSize: 14 }}>{description}</div>
      )}
      
      {(onAddToList || onRemoveFromList || onEdit) && (
        <div style={{ 
          position: 'absolute', 
          top: 8, 
          right: 8, 
          display: 'flex', 
          gap: '4px',
          alignItems: 'center'
        }}>
          {onEdit && showEditButton && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              title="Редактировать"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#f4e4c1',
                transition: 'all 0.2s ease'
              }}
              aria-label="Редактировать элемент"
            >
              ✏️
            </button>
          )}
          {(onAddToList || onRemoveFromList) && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (isListMode && onRemoveFromList) {
                  handleRemoveFromList()
                } else if (onAddToList) {
                  handleAddToList()
                }
              }}
              disabled={addButtonDisabled}
              title={isListMode ? "Удалить из списка" : addButtonTitle}
              style={{
                opacity: addButtonDisabled ? 0.5 : 1,
                cursor: addButtonDisabled ? 'not-allowed' : 'pointer'
              }}
            >
              {isListMode ? '✕' : '＋'}
            </button>
          )}
        </div>
      )}
    </div>
  )
})



