import { useState, useEffect, useRef, RefObject, useCallback } from 'react'

interface UseFilterDropdownStateParams {
  isMobile: boolean
  dropdownRef: RefObject<HTMLDivElement>
  contentRef: RefObject<HTMLDivElement>
}

export function useFilterDropdownState({ isMobile, dropdownRef, contentRef }: UseFilterDropdownStateParams) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      container.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'

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

  // Initialize active index and focus when opening
  useEffect(() => {
    if (!isOpen) return

    setActiveIndex(0)
    setTimeout(() => {
      const input = contentRef.current?.querySelector<HTMLInputElement>('input[type="checkbox"]')
      input?.focus()
    }, 0)
  }, [isOpen, contentRef])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [])

  // Return focus to button when closing
  useEffect(() => {
    if (!isOpen && dropdownRef.current) {
      setTimeout(() => {
        dropdownRef.current?.querySelector('button')?.focus()
      }, 0)
    }
  }, [isOpen, dropdownRef])

  // Click outside handler for mobile
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
  }, [isMobile, isOpen, dropdownRef, contentRef])

  // Event handlers
  const handleMouseEnter = useCallback(() => {
    if (!isMobile && !isOpen) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsOpen(true)
    }
  }, [isMobile, isOpen])

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 150)
    }
  }, [isMobile])

  const handleClick = useCallback(() => {
    if (isMobile) {
      setIsOpen((prev) => !prev)
    }
  }, [isMobile])

  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen((o) => !o)
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isOpen) setIsOpen(true)
        setTimeout(() => {
          const input = contentRef.current?.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')?.[0]
          input?.focus()
        }, 0)
      }
    },
    [isOpen, contentRef]
  )

  const handleContentMouseEnter = useCallback(() => {
    if (!isMobile && closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
  }, [isMobile])

  const handleContentMouseLeave = useCallback(() => {
    if (!isMobile) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 150)
    }
  }, [isMobile])

  return {
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
  }
}

