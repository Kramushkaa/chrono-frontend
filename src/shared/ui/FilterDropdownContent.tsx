import React, { RefObject } from 'react'

interface FilterDropdownContentProps {
  title: string
  items: string[]
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
  getItemColor?: (item: string) => string
  isMobile: boolean
  dropdownPosition: 'bottom' | 'top'
  horizontalPosition: 'left' | 'right' | 'center'
  mobilePopupStyle: { top: string; left: string; transform: string }
  contentRef: RefObject<HTMLDivElement>
  activeIndex: number
  setActiveIndex: (index: number) => void
  setIsOpen: (open: boolean) => void
  onContentMouseEnter: () => void
  onContentMouseLeave: () => void
}

export const FilterDropdownContent = React.memo<FilterDropdownContentProps>(
  ({
    title,
    items,
    selectedItems,
    onSelectionChange,
    getItemColor,
    isMobile,
    dropdownPosition,
    horizontalPosition,
    mobilePopupStyle,
    contentRef,
    activeIndex,
    setActiveIndex,
    setIsOpen,
    onContentMouseEnter,
    onContentMouseLeave,
  }) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      const inputs = Array.from(
        contentRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]') || []
      )
      const max = inputs.length - 1

      if (e.key === 'Escape') {
        e.preventDefault()
        setIsOpen(false)
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault()
        setIsOpen(false)
        return
      }

      if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault()

      if (e.key === 'ArrowDown') {
        const next = Math.min(activeIndex < 0 ? 0 : activeIndex + 1, max)
        setActiveIndex(next)
        inputs[next]?.focus()
      } else if (e.key === 'ArrowUp') {
        const prev = Math.max(activeIndex < 0 ? 0 : activeIndex - 1, 0)
        setActiveIndex(prev)
        inputs[prev]?.focus()
      } else if (e.key === 'Home') {
        setActiveIndex(0)
        inputs[0]?.focus()
      } else if (e.key === 'End') {
        setActiveIndex(max)
        inputs[max]?.focus()
      } else if (e.key === ' ' || e.key === 'Enter') {
        const idx = activeIndex >= 0 ? activeIndex : 0
        const input = inputs[idx]
        if (input) {
          input.click()
        }
      }
    }

    return (
      <div
        className="filter-dropdown-content"
        ref={contentRef}
        onMouseEnter={onContentMouseEnter}
        onMouseLeave={onContentMouseLeave}
        role="listbox"
        aria-label={`Список ${title}`}
        aria-multiselectable="true"
        onKeyDown={handleKeyDown}
        style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? mobilePopupStyle.top : dropdownPosition === 'bottom' ? '100%' : 'auto',
          bottom: isMobile ? 'auto' : dropdownPosition === 'top' ? '100%' : 'auto',
          left: isMobile
            ? mobilePopupStyle.left
            : horizontalPosition === 'left'
              ? '0'
              : horizontalPosition === 'center'
                ? '50%'
                : 'auto',
          right: isMobile ? 'auto' : horizontalPosition === 'right' ? '0' : 'auto',
          transform: isMobile
            ? mobilePopupStyle.transform
            : horizontalPosition === 'center'
              ? 'translateX(-50%)'
              : 'none',
          zIndex: isMobile ? 10003 : 1000,
          maxHeight: isMobile ? '50vh' : '300px',
          overflowY: 'auto',
          display: 'block',
          minWidth: isMobile ? '200px' : '250px',
          maxWidth: isMobile ? '280px' : '300px',
          width: isMobile ? 'auto' : isMobile && horizontalPosition === 'center' ? 'calc(100vw - 40px)' : 'auto',
          background: 'rgba(44, 24, 16, 0.98)',
          border: '2px solid rgba(244, 228, 193, 0.3)',
          borderRadius: isMobile ? '12px' : '6px',
          boxShadow: isMobile ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          pointerEvents: isMobile ? 'auto' : 'auto',
        }}
      >
        {/* Action buttons */}
        <div
          style={{
            padding: isMobile ? '0.8rem' : '0.5rem',
            borderBottom: '1px solid rgba(139, 69, 19, 0.3)',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange(items)
            }}
            aria-label={`Выбрать все ${title}`}
            style={{
              padding: isMobile ? '0.5rem 0.8rem' : '0.25rem 0.5rem',
              background: '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '0.7rem',
              flex: isMobile ? '1' : 'auto',
              minHeight: isMobile ? '44px' : 'auto',
            }}
          >
            Выбрать все
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSelectionChange([])
            }}
            aria-label={`Снять все ${title}`}
            style={{
              padding: isMobile ? '0.5rem 0.8rem' : '0.25rem 0.5rem',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: isMobile ? '0.8rem' : '0.7rem',
              flex: isMobile ? '1' : 'auto',
              minHeight: isMobile ? '44px' : 'auto',
            }}
          >
            Снять все
          </button>
        </div>

        {/* Items list */}
        {items.map((item, idx) => (
          <label
            key={item}
            className={`filter-checkbox ${activeIndex === idx ? 'active' : ''}`}
            onClick={(e) => e.stopPropagation()}
            role="option"
            aria-selected={selectedItems.includes(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: isMobile ? '0.6rem 0.5rem' : '0.4rem 0.5rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
              borderRadius: '3px',
              margin: '0.1rem 0',
              minHeight: isMobile ? '44px' : 'auto',
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = 'rgba(139, 69, 19, 0.1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = 'transparent'
              }
            }}
          >
            <input
              type="checkbox"
              id={`fd-option-${title}-${idx}`}
              checked={selectedItems.includes(item)}
              onChange={(e) => {
                e.stopPropagation()
                if (e.target.checked) {
                  onSelectionChange([...selectedItems, item])
                } else {
                  onSelectionChange(selectedItems.filter((i) => i !== item))
                }
              }}
              aria-label={`Выбрать ${item}`}
              style={{
                margin: 0,
                cursor: 'pointer',
              }}
            />
            <span
              style={{
                color: getItemColor ? getItemColor(item) : '#f4e4c1',
                fontWeight: getItemColor ? 'bold' : 'normal',
                fontSize: '0.8rem',
              }}
            >
              {item}
            </span>
          </label>
        ))}
      </div>
    )
  }
)

FilterDropdownContent.displayName = 'FilterDropdownContent'

