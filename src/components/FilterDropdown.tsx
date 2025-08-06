import React, { useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useMobile } from '../hooks/useMobile'

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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const [horizontalPosition, setHorizontalPosition] = useState<'left' | 'right' | 'center'>('left')
  const [isOpen, setIsOpen] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const isMobile = useMobile()
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMouseOverRef = useRef(false)
  
  // Create portal container for mobile popups
  useEffect(() => {
    if (isMobile && isOpen) {
      const container = document.createElement('div')
      container.style.position = 'fixed'
      container.style.top = '0'
      container.style.left = '0'
      container.style.width = '100%'
      container.style.height = '100%'
      container.style.zIndex = '10003'
      container.style.pointerEvents = 'auto'
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.3)' // Semi-transparent overlay
      
      // Add click handler to close dropdown when clicking overlay
      container.addEventListener('click', (e) => {
        if (e.target === container) {
          setIsOpen(false)
        }
      })
      
      document.body.appendChild(container)
      setPortalContainer(container)
      
      return () => {
        if (container.parentNode) {
          container.parentNode.removeChild(container)
        }
        setPortalContainer(null)
      }
    }
  }, [isMobile, isOpen])
  
  // Функция для определения позиции dropdown
  const updateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current || !contentRef.current) return
    
    const dropdownRect = dropdownRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    
    // Оценка высоты контента (примерная)
    const estimatedContentHeight = Math.min(items.length * 30 + 80, 300) // 30px на элемент + 80px для кнопок
    
    // Проверяем, помещается ли dropdown снизу
    const spaceBelow = viewportHeight - dropdownRect.bottom
    const spaceAbove = dropdownRect.top
    
    if (spaceBelow < estimatedContentHeight && spaceAbove > estimatedContentHeight) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }
    
    // Проверяем горизонтальное позиционирование для всех устройств
    const dropdownWidth = isMobile ? Math.min(250, viewportWidth - 20) : 300 // Ограничиваем ширину на мобильных
    const spaceRight = viewportWidth - dropdownRect.left
    const spaceLeft = dropdownRect.right
    
    // На мобильных устройствах приоритет отдаем центрированию
    if (isMobile) {
      // Если dropdown шире, чем доступное пространство, центрируем его
      if (dropdownWidth >= viewportWidth - 20) {
        setHorizontalPosition('center')
      } else if (spaceRight < dropdownWidth && spaceLeft > dropdownWidth) {
        setHorizontalPosition('right')
      } else {
        setHorizontalPosition('left')
      }
    } else {
      // На десктопе используем старую логику
      if (spaceRight < dropdownWidth && spaceLeft > dropdownWidth) {
        setHorizontalPosition('right')
      } else {
        setHorizontalPosition('left')
      }
    }
  }, [items.length, isMobile])

  // Обновляем позицию dropdown при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        updateDropdownPosition()
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, updateDropdownPosition])
  
  // Дополнительная проверка для мобильных устройств
  useEffect(() => {
    if (isMobile && isOpen) {
      const checkPosition = () => {
        if (contentRef.current) {
          const rect = contentRef.current.getBoundingClientRect()
          const viewportWidth = window.innerWidth
          
          // Если dropdown выходит за пределы экрана, пересчитываем позицию
          if (rect.left < 0 || rect.right > viewportWidth) {
            updateDropdownPosition()
          }
          // Если dropdown слишком высокий, пересчитываем вертикальную позицию
          if (rect.bottom > window.innerHeight) {
            setDropdownPosition('top')
          }
        }
      }
      
      // Проверяем позицию после рендера
      setTimeout(checkPosition, 100)
    }
  }, [isMobile, isOpen, updateDropdownPosition])
  
  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])
  
  // Улучшенные обработчики для разных устройств
  const handleMouseEnter = () => {
    if (!isMobile) {
      // Очищаем таймер закрытия
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      
      isMouseOverRef.current = true
      setIsOpen(true)
      // Небольшая задержка для корректного расчета позиции
      setTimeout(updateDropdownPosition, 0)
    }
  }
  
  const handleMouseLeave = () => {
    if (!isMobile) {
      isMouseOverRef.current = false
      
      // Добавляем задержку перед закрытием, чтобы избежать преждевременного закрытия
      // при быстром движении курсора
      closeTimeoutRef.current = setTimeout(() => {
        if (!isMouseOverRef.current) {
          setIsOpen(false)
        }
      }, 150) // Увеличиваем задержку до 150ms
    }
  }
  
  const handleClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen)
      if (!isOpen) {
        // На мобильных устройствах добавляем дополнительную задержку
        setTimeout(updateDropdownPosition, 50)
      }
    }
  }
  
  // Обработка клика вне dropdown для мобильных устройств
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isOpen) {
        const target = event.target as Node
        const isClickInsideDropdown = dropdownRef.current?.contains(target)
        const isClickInsideContent = contentRef.current?.contains(target)
        
        if (!isClickInsideDropdown && !isClickInsideContent) {
          setIsOpen(false)
        }
      }
    }
    
    if (isMobile && isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile, isOpen])
  
  // Обработчики для контента dropdown
  const handleContentMouseEnter = () => {
    if (!isMobile) {
      isMouseOverRef.current = true
      // Очищаем таймер закрытия при наведении на контент
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
    }
  }
  
  const handleContentMouseLeave = () => {
    if (!isMobile) {
      isMouseOverRef.current = false
      
      // Добавляем задержку перед закрытием контента
      closeTimeoutRef.current = setTimeout(() => {
        if (!isMouseOverRef.current) {
          setIsOpen(false)
        }
      }, 150)
    }
  }

  // Calculate popup position for mobile
  const getMobilePopupPosition = () => {
    if (!dropdownRef.current) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    
    const buttonRect = dropdownRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    
    // Position dropdown below the button
    let top = buttonRect.bottom + 8 // 8px gap below button
    let left = buttonRect.left
    
    // Ensure dropdown doesn't go off-screen
    const estimatedDropdownWidth = Math.min(250, viewportWidth - 20)
    const estimatedDropdownHeight = Math.min(300, viewportHeight * 0.6)
    
    // Adjust horizontal position if dropdown would go off-screen
    if (left + estimatedDropdownWidth > viewportWidth - 10) {
      left = viewportWidth - estimatedDropdownWidth - 10
    }
    if (left < 10) {
      left = 10
    }
    
    // If dropdown would go off-screen at the bottom, position it above the button
    if (top + estimatedDropdownHeight > viewportHeight - 10) {
      top = buttonRect.top - estimatedDropdownHeight - 8
    }
    
    // Ensure dropdown doesn't go off-screen at the top
    if (top < 10) {
      top = 10
    }
    
    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: 'none'
    }
  }

  // Render dropdown content
  const renderDropdownContent = () => {
    const mobilePopupStyle = isMobile ? getMobilePopupPosition() : { top: '', left: '', transform: '' }
    
    return (
      <div 
        className="filter-dropdown-content"
        ref={contentRef}
        onMouseEnter={handleContentMouseEnter}
        onMouseLeave={handleContentMouseLeave}
        role="listbox"
        aria-label={`Список ${title}`}
        aria-multiselectable="true"
        style={{
          position: isMobile ? 'fixed' : 'absolute',
          top: isMobile ? mobilePopupStyle.top : (dropdownPosition === 'bottom' ? '100%' : 'auto'),
          bottom: isMobile ? 'auto' : (dropdownPosition === 'top' ? '100%' : 'auto'),
          left: isMobile ? mobilePopupStyle.left : (horizontalPosition === 'left' ? '0' : horizontalPosition === 'center' ? '50%' : 'auto'),
          right: isMobile ? 'auto' : (horizontalPosition === 'right' ? '0' : 'auto'),
          transform: isMobile ? mobilePopupStyle.transform : (horizontalPosition === 'center' ? 'translateX(-50%)' : 'none'),
          zIndex: isMobile ? 10003 : 1000,
          maxHeight: isMobile ? '50vh' : '300px',
          overflowY: 'auto',
          display: 'block',
          minWidth: isMobile ? '200px' : '250px',
          maxWidth: isMobile ? '280px' : '300px',
          width: isMobile ? 'auto' : (isMobile && horizontalPosition === 'center' ? 'calc(100vw - 40px)' : 'auto'),
          background: 'rgba(44, 24, 16, 0.98)',
          border: '2px solid rgba(244, 228, 193, 0.3)',
          borderRadius: isMobile ? '12px' : '6px',
          boxShadow: isMobile ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)',
          pointerEvents: isMobile ? 'auto' : 'auto'
        }}
      >
        <div style={{ 
          padding: isMobile ? '0.8rem' : '0.5rem', 
          borderBottom: '1px solid rgba(139, 69, 19, 0.3)',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
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
              minHeight: isMobile ? '44px' : 'auto'
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
              minHeight: isMobile ? '44px' : 'auto'
            }}
          >
            Снять все
          </button>
        </div>
        {items.map(item => (
          <label 
            key={item} 
            className="filter-checkbox" 
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
              minHeight: isMobile ? '44px' : 'auto' // Минимальная высота для мобильных устройств
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
              checked={selectedItems.includes(item)}
              onChange={(e) => {
                e.stopPropagation()
                if (e.target.checked) {
                  onSelectionChange([...selectedItems, item])
                } else {
                  onSelectionChange(selectedItems.filter(i => i !== item))
                }
              }}
              aria-label={`Выбрать ${item}`}
              style={{
                margin: 0,
                cursor: 'pointer'
              }}
            />
            <span style={{ 
              color: getItemColor ? getItemColor(item) : '#f4e4c1',
              fontWeight: getItemColor ? 'bold' : 'normal',
              fontSize: '0.8rem'
            }}>
              {item}
            </span>
          </label>
        ))}
      </div>
    )
  }
  
  return (
    <div 
      className="filter-dropdown" 
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className={`filter-btn ${isActive ? 'active' : ''}`}
        style={{ 
          minWidth: 'auto',
          padding: isMobile ? '0.5rem 0.8rem' : '0.3rem 0.6rem',
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
          whiteSpace: 'nowrap'
        }}
        onClick={handleClick}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${title} - ${selectedItems.length} выбрано из ${items.length}`}
      >
        {icon && <span className="filter-icon">{icon}</span>}
        <span className="filter-text">{textLabel || title}</span>
        {isActive && <span className="filter-count">({selectedItems.length})</span>}
      </button>
      {isOpen && (
        isMobile && portalContainer ? (
          createPortal(renderDropdownContent(), portalContainer)
        ) : (
          renderDropdownContent()
        )
      )}
    </div>
  )
} 