import { useCallback, useState, useEffect, RefObject } from 'react'

interface UseFilterDropdownPositionParams {
  isOpen: boolean
  itemsCount: number
  isMobile: boolean
  dropdownRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
}

type VerticalPosition = 'bottom' | 'top'
type HorizontalPosition = 'left' | 'right' | 'center'

export function useFilterDropdownPosition({
  isOpen,
  itemsCount,
  isMobile,
  dropdownRef,
  contentRef,
}: UseFilterDropdownPositionParams) {
  const [dropdownPosition, setDropdownPosition] = useState<VerticalPosition>('bottom')
  const [horizontalPosition, setHorizontalPosition] = useState<HorizontalPosition>('left')

  const updateDropdownPosition = useCallback(() => {
    if (!dropdownRef.current || !contentRef.current) return

    const dropdownRect = dropdownRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Оценка высоты контента (примерная)
    const estimatedContentHeight = Math.min(itemsCount * 30 + 80, 300) // 30px на элемент + 80px для кнопок

    // Проверяем, помещается ли dropdown снизу
    const spaceBelow = viewportHeight - dropdownRect.bottom
    const spaceAbove = dropdownRect.top

    if (spaceBelow < estimatedContentHeight && spaceAbove > estimatedContentHeight) {
      setDropdownPosition('top')
    } else {
      setDropdownPosition('bottom')
    }

    // Проверяем горизонтальное позиционирование
    const dropdownWidth = isMobile ? Math.min(250, viewportWidth - 20) : 300
    const spaceRight = viewportWidth - dropdownRect.left
    const spaceLeft = dropdownRect.right

    // На мобильных устройствах приоритет отдаем центрированию
    if (isMobile) {
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
  }, [itemsCount, isMobile, dropdownRef, contentRef])

  // Обновляем позицию dropdown при изменении размера окна или открытии
  useEffect(() => {
    if (!isOpen) return

    const handleResize = () => {
      updateDropdownPosition()
    }

    // Обновляем позицию при открытии
    setTimeout(updateDropdownPosition, 0)

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, updateDropdownPosition])

  // Calculate popup position for mobile
  const getMobilePopupPosition = useCallback(() => {
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
      transform: 'none',
    }
  }, [dropdownRef])

  return {
    dropdownPosition,
    horizontalPosition,
    updateDropdownPosition,
    getMobilePopupPosition,
  }
}

