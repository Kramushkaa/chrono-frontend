import React, { useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMobile } from '../hooks/useMobile'
import { useFilterDropdownPosition } from '../hooks/useFilterDropdownPosition'
import { useFilterDropdownState } from '../hooks/useFilterDropdownState'
import { FilterDropdownContent } from './FilterDropdownContent'

interface FilterDropdownProps {
  title: string
  items: string[]
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
  getItemColor?: (item: string) => string
  icon?: React.ReactNode
  textLabel?: string
}

export const FilterDropdown: React.FC<FilterDropdownProps> = React.memo(
  ({ title, items, selectedItems, onSelectionChange, getItemColor, icon, textLabel }) => {
    const isActive = selectedItems.length > 0
    const dropdownRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const isMobile = useMobile()

    const {
      isOpen,
      setIsOpen,
      activeIndex,
      setActiveIndex,
      portalContainer,
      handleMouseEnter,
      handleMouseLeave,
      handleClick,
      handleButtonKeyDown,
      handleContentMouseEnter,
      handleContentMouseLeave,
    } = useFilterDropdownState({ isMobile, dropdownRef, contentRef })

    const { dropdownPosition, horizontalPosition, getMobilePopupPosition } = useFilterDropdownPosition({
      isOpen,
      itemsCount: items.length,
      isMobile,
      dropdownRef,
      contentRef,
    })

    const mobilePopupStyle = isMobile ? getMobilePopupPosition() : { top: '', left: '', transform: '' }

    const renderContent = () => (
      <FilterDropdownContent
        title={title}
        items={items}
        selectedItems={selectedItems}
        onSelectionChange={onSelectionChange}
        getItemColor={getItemColor}
        isMobile={isMobile}
        dropdownPosition={dropdownPosition}
        horizontalPosition={horizontalPosition}
        mobilePopupStyle={mobilePopupStyle}
        contentRef={contentRef}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        setIsOpen={setIsOpen}
        onContentMouseEnter={handleContentMouseEnter}
        onContentMouseLeave={handleContentMouseLeave}
      />
    )

    return (
      <div className="filter-dropdown" ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <button
          className={`filter-btn ${isActive ? 'active' : ''}`}
          style={{
            minWidth: isMobile ? '140px' : '100px',
            width: isMobile ? '140px' : '100px',
            padding: isMobile ? '0.5rem 0.8rem' : '0.3rem 0.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: isActive ? 'rgba(139, 69, 19, 0.15)' : 'rgba(139, 69, 19, 0.08)',
            border: `1px solid ${isActive ? 'rgba(139, 69, 19, 0.3)' : 'rgba(139, 69, 19, 0.2)'}`,
            borderRadius: '4px',
            color: '#f4e4c1',
            fontSize: isMobile ? '0.9rem' : '0.7rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            justifyContent: 'center',
          }}
          onClick={handleClick}
          onKeyDown={handleButtonKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`${title} - ${selectedItems.length} выбрано из ${items.length}`}
        >
          {icon && <span className="filter-icon">{icon}</span>}
          <span
            className="filter-text"
            style={{
              fontSize: isMobile ? '0.8rem' : '0.7rem',
              textAlign: 'center',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {textLabel || title}
          </span>
          {isActive && (
            <span className="filter-count" style={{ fontSize: isMobile ? '0.7rem' : '0.6rem', marginLeft: 'auto' }}>
              ({selectedItems.length})
            </span>
          )}
        </button>
        {isOpen && (isMobile && portalContainer ? createPortal(renderContent(), portalContainer) : renderContent())}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Кастомная функция сравнения для React.memo
    return (
      prevProps.title === nextProps.title &&
      prevProps.items.length === nextProps.items.length &&
      prevProps.items.every((item, index) => item === nextProps.items[index]) &&
      prevProps.selectedItems.length === nextProps.selectedItems.length &&
      prevProps.selectedItems.every((item, index) => item === nextProps.selectedItems[index]) &&
      prevProps.icon === nextProps.icon &&
      prevProps.textLabel === nextProps.textLabel
    )
  }
)



