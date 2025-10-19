import { renderHook, act } from '@testing-library/react'
import { useTimelineDrag } from '../useTimelineDrag'

describe('useTimelineDrag', () => {
  const defaultProps = {
    timelineWidth: 2000,
    containerWidth: 800,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    expect(result.current.isDragging).toBe(false)
    expect(result.current.isDraggingTimeline).toBe(false)
    expect(result.current.timelineRef).toBeDefined()
    expect(result.current.handleMouseDown).toBeInstanceOf(Function)
    expect(result.current.handleMouseMove).toBeInstanceOf(Function)
    expect(result.current.handleMouseUp).toBeInstanceOf(Function)
    expect(result.current.handleTouchStart).toBeInstanceOf(Function)
    expect(result.current.handleTouchMove).toBeInstanceOf(Function)
    expect(result.current.handleTouchEnd).toBeInstanceOf(Function)
  })

  it('should handle mouse down on timeline', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    const mockEvent = {
      clientX: 100,
      clientY: 50,
      preventDefault: jest.fn(),
      target: document.createElement('div'),
    }

    // Mock getBoundingClientRect for timelineRef
    const mockElement = {
      scrollLeft: 10,
      scrollTop: 5,
    }
    
    result.current.timelineRef.current = mockElement as any

    act(() => {
      result.current.handleMouseDown(mockEvent as any)
    })

    expect(result.current.isDragging).toBe(true)
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('should not start dragging when clicking interactive elements', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    // Create interactive element
    const interactiveElement = document.createElement('div')
    interactiveElement.className = 'life-bar'
    const mockEvent = {
      clientX: 100,
      clientY: 50,
      preventDefault: jest.fn(),
      target: interactiveElement,
    }

    // Mock closest for interactive element
    interactiveElement.closest = jest.fn((selector: string) => {
      if (selector === '.life-bar') return interactiveElement
      return null
    })

    act(() => {
      result.current.handleMouseDown(mockEvent as any)
    })

    expect(result.current.isDragging).toBe(false)
    expect(mockEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('should handle mouse move during drag', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    // First start dragging
    const mockMouseDownEvent = {
      clientX: 100,
      clientY: 50,
      preventDefault: jest.fn(),
      target: document.createElement('div'),
    }

    const mockElement = {
      scrollLeft: 10,
      scrollTop: 5,
      scrollWidth: 2000,
      clientWidth: 800,
      scrollHeight: 1000,
      clientHeight: 600,
    }
    
    result.current.timelineRef.current = {
      ...mockElement,
      scrollLeft: 10,
      scrollTop: 5,
    } as any

    act(() => {
      result.current.handleMouseDown(mockMouseDownEvent as any)
    })

    // Then move mouse
    const mockMouseMoveEvent = {
      clientX: 150,
      clientY: 100,
      preventDefault: jest.fn(),
    }

    act(() => {
      result.current.handleMouseMove(mockMouseMoveEvent as any)
    })

    expect(result.current.isDragging).toBe(true)
    expect(mockMouseMoveEvent.preventDefault).toHaveBeenCalled()
  })

  it('should not handle mouse move when not dragging', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    const mockMouseMoveEvent = {
      clientX: 150,
      clientY: 100,
      preventDefault: jest.fn(),
    }

    act(() => {
      result.current.handleMouseMove(mockMouseMoveEvent as any)
    })

    expect(mockMouseMoveEvent.preventDefault).not.toHaveBeenCalled()
  })

  it('should handle mouse up to stop dragging', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    // Start dragging first
    const mockMouseDownEvent = {
      clientX: 100,
      clientY: 50,
      preventDefault: jest.fn(),
      target: document.createElement('div'),
    }

    result.current.timelineRef.current = {
      scrollLeft: 10,
      scrollTop: 5,
    } as any

    act(() => {
      result.current.handleMouseDown(mockMouseDownEvent as any)
    })

    expect(result.current.isDragging).toBe(true)

    // Then stop dragging
    act(() => {
      result.current.handleMouseUp()
    })

    expect(result.current.isDragging).toBe(false)
  })

  it('should handle scroll boundaries correctly', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    const mockElement = {
      scrollLeft: 0,
      scrollTop: 0,
      scrollWidth: 2000,
      clientWidth: 800,
      scrollHeight: 1000,
      clientHeight: 600,
    }
    
    result.current.timelineRef.current = mockElement as any

    const mockMouseDownEvent = {
      clientX: 100,
      clientY: 50,
      preventDefault: jest.fn(),
      target: document.createElement('div'),
    }

    act(() => {
      result.current.handleMouseDown(mockMouseDownEvent as any)
    })

    // Move mouse far beyond boundaries
    const mockMouseMoveEvent = {
      clientX: -1000,
      clientY: -1000,
      preventDefault: jest.fn(),
    }

    act(() => {
      result.current.handleMouseMove(mockMouseMoveEvent as any)
    })

    // Should still be dragging even if we hit boundaries
    expect(result.current.isDragging).toBe(true)
  })

  it('should provide timeline ref', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    expect(result.current.timelineRef).toBeDefined()
    expect(result.current.timelineRef.current).toBeNull()
  })

  it('should handle touch events', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 50 }],
      preventDefault: jest.fn(),
      target: document.createElement('div'),
    }

    const mockElement = {
      scrollLeft: 10,
      scrollTop: 5,
      scrollWidth: 2000,
      clientWidth: 800,
      scrollHeight: 1000,
      clientHeight: 600,
    }
    
    result.current.timelineRef.current = mockElement as any

    act(() => {
      result.current.handleTouchStart(mockTouchEvent as any)
    })

    expect(result.current.isDragging).toBe(true)

    // Test touch move
    const mockTouchMoveEvent = {
      touches: [{ clientX: 150, clientY: 100 }],
      preventDefault: jest.fn(),
    }

    act(() => {
      result.current.handleTouchMove(mockTouchMoveEvent as any)
    })

    expect(mockTouchMoveEvent.preventDefault).toHaveBeenCalled()

    // Test touch end
    act(() => {
      result.current.handleTouchEnd()
    })

    expect(result.current.isDragging).toBe(false)
  })

  it('should not start touch dragging when clicking interactive elements', () => {
    const { result } = renderHook(() => useTimelineDrag(defaultProps))

    // Create interactive element
    const interactiveElement = document.createElement('div')
    interactiveElement.className = 'life-bar'
    
    // Mock closest for interactive element
    interactiveElement.closest = jest.fn((selector: string) => {
      if (selector === '.life-bar') return interactiveElement
      return null
    })

    const mockTouchEvent = {
      touches: [{ clientX: 100, clientY: 50 }],
      preventDefault: jest.fn(),
      target: interactiveElement,
    }

    act(() => {
      result.current.handleTouchStart(mockTouchEvent as any)
    })

    expect(result.current.isDragging).toBe(false)
  })
})
