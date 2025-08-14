import { useState, useRef, useCallback, useEffect } from 'react'

interface UseTimelineDragProps {
  timelineWidth: number
  containerWidth: number
}

export const useTimelineDrag = ({ timelineWidth, containerWidth }: UseTimelineDragProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartY, setDragStartY] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const dragStartTime = useRef<number>(0)
  const didAutoScroll = useRef<boolean>(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const isInteractive = target.closest('.life-bar') || 
                         target.closest('.achievement-marker') ||
                         target.closest('button') ||
                         target.closest('[role="button"]')
    
    if (isInteractive) return

    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartY(e.clientY)
    setScrollLeft(timelineRef.current?.scrollLeft || 0)
    setScrollTop(timelineRef.current?.scrollTop || 0)
    dragStartTime.current = Date.now()
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return

    // Предотвращаем скролл страницы во время перетаскивания
    e.preventDefault()

    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    const newScrollLeft = scrollLeft - deltaX
    const newScrollTop = scrollTop - deltaY
    
    if (timelineRef.current) {
      const maxScrollLeft = timelineRef.current.scrollWidth - timelineRef.current.clientWidth
      const maxScrollTop = timelineRef.current.scrollHeight - timelineRef.current.clientHeight
      
      timelineRef.current.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft))
      timelineRef.current.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop))
    }
  }, [isDragging, dragStartX, dragStartY, scrollLeft, scrollTop])

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return

    const dragDuration = Date.now() - dragStartTime.current
    
    if (dragDuration < 200) {
      setIsDraggingTimeline(false)
    } else {
      setIsDraggingTimeline(true)
      setTimeout(() => setIsDraggingTimeline(false), 100)
    }

    setIsDragging(false)
  }, [isDragging])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement
    const isInteractive = target.closest('.life-bar') || 
                         target.closest('.achievement-marker') ||
                         target.closest('button') ||
                         target.closest('[role="button"]')
    
    if (isInteractive) return

    setIsDragging(true)
    setDragStartX(e.touches[0].clientX)
    setDragStartY(e.touches[0].clientY)
    setScrollLeft(timelineRef.current?.scrollLeft || 0)
    setScrollTop(timelineRef.current?.scrollTop || 0)
    dragStartTime.current = Date.now()
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return

    // Предотвращаем скролл страницы во время перетаскивания
    e.preventDefault()

    const deltaX = e.touches[0].clientX - dragStartX
    const deltaY = e.touches[0].clientY - dragStartY
    const newScrollLeft = scrollLeft - deltaX
    const newScrollTop = scrollTop - deltaY
    
    if (timelineRef.current) {
      const maxScrollLeft = timelineRef.current.scrollWidth - timelineRef.current.clientWidth
      const maxScrollTop = timelineRef.current.scrollHeight - timelineRef.current.clientHeight
      
      timelineRef.current.scrollLeft = Math.max(0, Math.min(maxScrollLeft, newScrollLeft))
      timelineRef.current.scrollTop = Math.max(0, Math.min(maxScrollTop, newScrollTop))
    }
  }, [isDragging, dragStartX, dragStartY, scrollLeft, scrollTop])

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    const dragDuration = Date.now() - dragStartTime.current
    
    if (dragDuration < 200) {
      setIsDraggingTimeline(false)
    } else {
      setIsDraggingTimeline(true)
      setTimeout(() => setIsDraggingTimeline(false), 100)
    }

    setIsDragging(false)
  }, [isDragging])

  useEffect(() => {
    return () => {
      setIsDragging(false)
      setIsDraggingTimeline(false)
    }
  }, [])

  // Auto-scroll to the far right on first mount for better initial overview
  useEffect(() => {
    if (didAutoScroll.current) return
    const el = timelineRef.current
    if (!el) return
    // Defer until after first paint
    const id = window.requestAnimationFrame(() => {
      try {
        const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth)
        el.scrollTo({ left: maxLeft, behavior: 'smooth' })
        didAutoScroll.current = true
      } catch {}
    })
    return () => { try { window.cancelAnimationFrame(id) } catch {} }
  }, [])

  return {
    timelineRef,
    isDragging,
    isDraggingTimeline,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  }
} 