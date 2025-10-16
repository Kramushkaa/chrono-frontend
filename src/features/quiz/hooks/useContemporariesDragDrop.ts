import { useState, useRef, useEffect } from 'react'

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
  addToGroup?: (personId: string, groupIndex: number) => void
  createGroup?: (personId: string) => void
}

export function useContemporariesDragDrop({ showFeedback, isMobile, groups, addToGroup, createGroup }: UseContemporariesDragDropParams): DragDropHandlers {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedOverGroup, setDraggedOverGroup] = useState<number | null>(null)
  const [draggedOverCreateZone, setDraggedOverCreateZone] = useState(false)
  const dragCounters = useRef<{ [key: string]: number }>({})
  
  // Touch events state
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const draggedElementRef = useRef<HTMLDivElement | null>(null)

  // Store callbacks in refs so they can be used in document event listeners
  const callbacksRef = useRef<{
    addToGroup: ((personId: string, groupIndex: number) => void) | null
    createGroup: ((personId: string) => void) | null
  }>({ addToGroup: null, createGroup: null })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current.addToGroup = addToGroup || null
    callbacksRef.current.createGroup = createGroup || null
  }, [addToGroup, createGroup])

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
    target.style.opacity = '0.7'
    target.style.zIndex = '1000'
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    // This is just a stub - real handling happens in document event listener
    // We keep this for compatibility but actual logic is in useEffect
  }

  const handleTouchEnd = (e: React.TouchEvent, addToGroupCallback: (personId: string, groupIndex: number) => void, createGroupCallback: (personId: string) => void) => {
    // This is just a stub - real handling happens in document event listener
    // We keep this for compatibility but actual logic is in useEffect
  }

  // Bind touch events to document when dragging
  useEffect(() => {
    if (!isDragging || !isMobile) return

    const handleMove = (e: TouchEvent) => {
      if (!touchStartPos) return
      const touch = e.touches[0]
      const deltaX = touch.clientX - touchStartPos.x
      const deltaY = touch.clientY - touchStartPos.y

      // Определяем, что это действительно перетаскивание
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

    const handleEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0]

      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY)
      if (elementBelow) {
        const groupElement = elementBelow.closest('.group-persons')
        const createZoneElement = elementBelow.closest('.create-group-drop-zone')
        
        if (groupElement && callbacksRef.current.addToGroup) {
          const groupIndex = parseInt(groupElement.getAttribute('data-group-index') || '0')
          const personId = draggedItem
          if (personId && !groups[groupIndex]?.includes(personId)) {
            callbacksRef.current.addToGroup(personId, groupIndex)
          }
        } else if (createZoneElement && callbacksRef.current.createGroup) {
          const personId = draggedItem
          if (personId) {
            callbacksRef.current.createGroup(personId)
          }
        }
      }

      resetDragState()
    }

    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)

    return () => {
      document.removeEventListener('touchmove', handleMove)
      document.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, isMobile, touchStartPos, draggedItem, groups])

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

