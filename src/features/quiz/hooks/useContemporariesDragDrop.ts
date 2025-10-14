import { useState, useRef } from 'react'

interface DragDropHandlers {
  // Desktop drag & drop
  handleDragStart: (e: React.DragEvent, personId: string) => void
  handleDragEnd: (e?: React.DragEvent) => void
  handleDragOverGroup: (e: React.DragEvent) => void
  handleDragOverCreateZone: (e: React.DragEvent) => void
  handleDragEnterGroup: (groupIndex: number) => void
  handleDragEnterCreateZone: () => void
  handleDragLeaveGroup: (groupIndex: number) => void
  handleDragLeaveCreateZone: () => void
  handleDrop: (e: React.DragEvent, targetGroupIndex: number, callback: (personId: string, groupIndex: number) => void) => void
  handleDropToCreateGroup: (e: React.DragEvent, callback: (personId: string) => void) => void
  
  // Mobile touch handlers
  handleTouchStart: (e: React.TouchEvent, personId: string) => void
  handleTouchMove: (e: React.TouchEvent) => void
  handleTouchEnd: (e: React.TouchEvent, addToGroupCallback: (personId: string, groupIndex: number) => void, createGroupCallback: (personId: string) => void) => void
  
  // State
  draggedItem: string | null
  draggedOverGroup: number | null
  draggedOverCreateZone: boolean
  isDragging: boolean
  
  // Utilities
  resetDragState: () => void
}

interface UseContemporariesDragDropParams {
  showFeedback: boolean
  isMobile: boolean
  groups: string[][]
}

export function useContemporariesDragDrop({ showFeedback, isMobile, groups }: UseContemporariesDragDropParams): DragDropHandlers {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedOverGroup, setDraggedOverGroup] = useState<number | null>(null)
  const [draggedOverCreateZone, setDraggedOverCreateZone] = useState(false)
  const dragCounters = useRef<{ [key: string]: number }>({})
  
  // Touch events state
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const draggedElementRef = useRef<HTMLDivElement | null>(null)

  const resetDragState = () => {
    if (draggedElementRef.current) {
      draggedElementRef.current.style.transform = ''
      draggedElementRef.current.style.zIndex = ''
      draggedElementRef.current.style.opacity = ''
      draggedElementRef.current.style.boxShadow = ''
      draggedElementRef.current.style.pointerEvents = ''
    }
    setTouchStartPos(null)
    setIsDragging(false)
    setDraggedItem(null)
    setDraggedOverGroup(null)
    setDraggedOverCreateZone(false)
    dragCounters.current = {}
  }

  // Desktop drag & drop handlers
  const handleDragStart = (e: React.DragEvent, personId: string) => {
    if (showFeedback) return
    e.stopPropagation()
    setDraggedItem(personId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', personId)
  }

  const handleDragEnd = (e?: React.DragEvent) => {
    if (e) {
      const target = e.currentTarget as HTMLElement
      target.style.opacity = ''
      target.style.transform = ''
    }
    
    setDraggedItem(null)
    setDraggedOverGroup(null)
    setDraggedOverCreateZone(false)
    dragCounters.current = {}
  }

  const handleDragOverGroup = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragOverCreateZone = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnterGroup = (groupIndex: number) => {
    const groupKey = `group-${groupIndex}`
    dragCounters.current[groupKey] = (dragCounters.current[groupKey] || 0) + 1
    setDraggedOverGroup(groupIndex)
    setDraggedOverCreateZone(false)
  }

  const handleDragEnterCreateZone = () => {
    const createZoneKey = 'create-zone'
    dragCounters.current[createZoneKey] = (dragCounters.current[createZoneKey] || 0) + 1
    setDraggedOverCreateZone(true)
    setDraggedOverGroup(null)
  }

  const handleDragLeaveGroup = (groupIndex: number) => {
    const groupKey = `group-${groupIndex}`
    dragCounters.current[groupKey] = Math.max(0, (dragCounters.current[groupKey] || 0) - 1)
    if (dragCounters.current[groupKey] === 0) {
      setDraggedOverGroup(null)
    }
  }

  const handleDragLeaveCreateZone = () => {
    const createZoneKey = 'create-zone'
    dragCounters.current[createZoneKey] = Math.max(0, (dragCounters.current[createZoneKey] || 0) - 1)
    if (dragCounters.current[createZoneKey] === 0) {
      setDraggedOverCreateZone(false)
    }
  }

  const handleDrop = (e: React.DragEvent, targetGroupIndex: number, callback: (personId: string, groupIndex: number) => void) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (showFeedback) return
    
    const personId = e.dataTransfer.getData('text/html')
    if (!personId) return
    
    // Если личность уже в этой группе, ничего не делаем
    if (groups[targetGroupIndex]?.includes(personId)) {
      handleDragEnd()
      return
    }
    
    callback(personId, targetGroupIndex)
    handleDragEnd()
  }

  const handleDropToCreateGroup = (e: React.DragEvent, callback: (personId: string) => void) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (showFeedback) return
    
    const personId = e.dataTransfer.getData('text/html')
    if (!personId) return
    
    callback(personId)
    handleDragEnd()
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, personId: string) => {
    if (showFeedback || !isMobile) return
    
    const touch = e.touches[0]
    setTouchStartPos({ x: touch.clientX, y: touch.clientY })
    setDraggedItem(personId)
    setIsDragging(true)
    
    const target = e.currentTarget as HTMLDivElement
    draggedElementRef.current = target
    target.style.pointerEvents = 'none'
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !touchStartPos || !isMobile) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartPos.x
    const deltaY = touch.clientY - touchStartPos.y

    // Определяем, что это действительно перетаскивание, а не просто касание
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      e.preventDefault()
      
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
      if (elementBelow) {
        const groupElement = elementBelow.closest('.group-persons')
        const createZoneElement = elementBelow.closest('.create-group-drop-zone')
        
        if (groupElement) {
          const groupIndex = parseInt(groupElement.getAttribute('data-group-index') || '0')
          setDraggedOverGroup(groupIndex)
          setDraggedOverCreateZone(false)
        } else if (createZoneElement) {
          setDraggedOverCreateZone(true)
          setDraggedOverGroup(null)
        } else {
          setDraggedOverGroup(null)
          setDraggedOverCreateZone(false)
        }
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent, addToGroupCallback: (personId: string, groupIndex: number) => void, createGroupCallback: (personId: string) => void) => {
    if (!isDragging || !isMobile) return
    const touch = e.changedTouches[0]

    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
    if (elementBelow) {
      const groupElement = elementBelow.closest('.group-persons')
      const createZoneElement = elementBelow.closest('.create-group-drop-zone')
      
      if (groupElement) {
        const groupIndex = parseInt(groupElement.getAttribute('data-group-index') || '0')
        const personId = draggedItem
        if (personId && !groups[groupIndex]?.includes(personId)) {
          addToGroupCallback(personId, groupIndex)
        }
      } else if (createZoneElement) {
        const personId = draggedItem
        if (personId) {
          createGroupCallback(personId)
        }
      }
    }

    resetDragState()
  }

  return {
    // Desktop handlers
    handleDragStart,
    handleDragEnd,
    handleDragOverGroup,
    handleDragOverCreateZone,
    handleDragEnterGroup,
    handleDragEnterCreateZone,
    handleDragLeaveGroup,
    handleDragLeaveCreateZone,
    handleDrop,
    handleDropToCreateGroup,
    
    // Mobile handlers
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    
    // State
    draggedItem,
    draggedOverGroup,
    draggedOverCreateZone,
    isDragging,
    
    // Utilities
    resetDragState,
  }
}

