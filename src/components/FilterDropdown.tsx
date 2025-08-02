import React from 'react'

interface FilterDropdownProps {
  title: string
  items: string[]
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
  getItemColor?: (item: string) => string
  icon?: React.ReactNode
  textLabel?: string
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  title, 
  items, 
  selectedItems, 
  onSelectionChange, 
  getItemColor,
  icon,
  textLabel
}) => {
  const isActive = selectedItems.length > 0
  
  return (
    <div className="filter-dropdown">
      <button 
        className={`filter-btn ${isActive ? 'active' : ''}`}
        style={{ 
          minWidth: 'auto',
          padding: '0.3rem 0.6rem',
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.3rem',
          background: isActive ? 'rgba(139, 69, 19, 0.15)' : 'rgba(139, 69, 19, 0.08)',
          border: `1px solid ${isActive ? 'rgba(139, 69, 19, 0.3)' : 'rgba(139, 69, 19, 0.2)'}`,
          borderRadius: '4px',
          color: '#f4e4c1',
          fontSize: '0.7rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap'
        }}
      >
        {icon && <span className="filter-icon">{icon}</span>}
        <span className="filter-text">{textLabel || title}</span>
        {isActive && <span className="filter-count">({selectedItems.length})</span>}
      </button>
      <div className="filter-dropdown-content">
        <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(139, 69, 19, 0.3)' }}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange(items)
            }}
            style={{
              padding: '0.25rem 0.5rem',
              marginRight: '0.5rem',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem'
            }}
          >
            Выбрать все
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange([])
            }}
            style={{
              padding: '0.25rem 0.5rem',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.7rem'
            }}
          >
            Снять все
          </button>
        </div>
        {items.map(item => (
          <label key={item} className="filter-checkbox" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={selectedItems.includes(item)}
              onChange={(e) => {
                e.stopPropagation()
                if (e.target.checked) {
                  onSelectionChange([...selectedItems, item])
                } else {
                  onSelectionChange(selectedItems.filter(i => i !== item))
                }
              }}
            />
            <span style={{ 
              color: getItemColor ? getItemColor(item) : '#f4e4c1',
              fontWeight: getItemColor ? 'bold' : 'normal'
            }}>
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
} 