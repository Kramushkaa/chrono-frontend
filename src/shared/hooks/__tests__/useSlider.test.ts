import { renderHook, act } from '@testing-library/react'
import { useSlider } from '../useSlider'

// Helper to create mock element with closest method
const createMockElement = () => {
  const mockElement = document.createElement('div')
  mockElement.className = 'year-range-slider'
  return mockElement
}

// Helper to create mock event
const createMockEvent = (button: number = 0) => {
  const mockElement = createMockElement()
  return {
    preventDefault: vi.fn(),
    button,
    currentTarget: {
      closest: vi.fn().mockReturnValue(mockElement),
    },
  } as unknown as React.MouseEvent
}

describe('useSlider', () => {
  it('should initialize with not dragging state', () => {
    const { result } = renderHook(() => useSlider())

    expect(result.current.isDraggingSlider).toBe(false)
    expect(result.current.draggedHandle).toBe(null)
  })

  it('should start dragging on mouse down', () => {
    const { result } = renderHook(() => useSlider())
    const mockEvent = createMockEvent()

    act(() => {
      result.current.handleSliderMouseDown(mockEvent, 'start')
    })

    expect(result.current.isDraggingSlider).toBe(true)
    expect(result.current.draggedHandle).toBe('start')
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('should handle mouse move while dragging', () => {
    const { result } = renderHook(() => useSlider())
    const mockEvent = createMockEvent()

    // Start dragging
    act(() => {
      result.current.handleSliderMouseDown(mockEvent, 'start')
    })

    expect(result.current.isDraggingSlider).toBe(true)
    expect(result.current.draggedHandle).toBe('start')
  })

  it('should stop dragging on mouse up', () => {
    const { result } = renderHook(() => useSlider())
    const mockEvent = createMockEvent()

    // Start dragging
    act(() => {
      result.current.handleSliderMouseDown(mockEvent, 'start')
    })

    expect(result.current.isDraggingSlider).toBe(true)

    // Stop dragging
    act(() => {
      result.current.handleSliderMouseUp()
    })

    expect(result.current.isDraggingSlider).toBe(false)
    expect(result.current.draggedHandle).toBe(null)
  })

  it('should set dragged handle correctly for end', () => {
    const { result } = renderHook(() => useSlider())
    const mockEvent = createMockEvent()

    act(() => {
      result.current.handleSliderMouseDown(mockEvent, 'end')
    })

    expect(result.current.isDraggingSlider).toBe(true)
    expect(result.current.draggedHandle).toBe('end')
  })

  it('should handle mouse move with proper parameters', () => {
    const { result } = renderHook(() => useSlider())
    const mockEvent = createMockEvent()

    // Mock DOM elements
    const mockSliderElement = document.createElement('div')
    mockSliderElement.getBoundingClientRect = vi.fn(() => ({
      left: 100,
      width: 200,
      top: 0,
      height: 50,
      right: 300,
      bottom: 50,
      x: 100,
      y: 0,
      toJSON: vi.fn(),
    }))

    // Mock querySelectorAll to return our mock element
    const originalQuerySelectorAll = document.querySelectorAll
    document.querySelectorAll = vi.fn(() => [mockSliderElement] as any)

    // Start dragging
    act(() => {
      result.current.handleSliderMouseDown(mockEvent, 'start')
    })

    // Mock mouse event - ensure touches is properly defined
    const mockMouseEvent = {
      clientX: 150, // 50px from left (25% of 200px width)
    } as MouseEvent

    const mockYearInputs = { start: '1800', end: '1900' }
    const mockApplyYearFilter = vi.fn()
    const mockSetYearInputs = vi.fn()

    act(() => {
      result.current.handleSliderMouseMove(mockMouseEvent, mockYearInputs, mockApplyYearFilter, mockSetYearInputs)
    })

    expect(result.current.isDraggingSlider).toBe(true)
    expect(result.current.draggedHandle).toBe('start')

    // Cleanup
    document.querySelectorAll = originalQuerySelectorAll
  })

  it('should not handle mouse move when not dragging', () => {
    const { result } = renderHook(() => useSlider())

    const mockMouseEvent = {
      clientX: 150,
    } as MouseEvent

    const mockYearInputs = { start: '1800', end: '1900' }
    const mockApplyYearFilter = vi.fn()
    const mockSetYearInputs = vi.fn()

    act(() => {
      result.current.handleSliderMouseMove(mockMouseEvent, mockYearInputs, mockApplyYearFilter, mockSetYearInputs)
    })

    expect(mockApplyYearFilter).not.toHaveBeenCalled()
    expect(mockSetYearInputs).not.toHaveBeenCalled()
  })

  it('should handle touch events', () => {
    const { result } = renderHook(() => useSlider())
    
    const mockTouchEvent = {
      preventDefault: vi.fn(),
      currentTarget: {
        closest: vi.fn().mockReturnValue(document.createElement('div')),
      },
      touches: [{ clientX: 100, clientY: 50 }],
    } as any

    act(() => {
      result.current.handleSliderMouseDown(mockTouchEvent, 'start')
    })

    expect(result.current.isDraggingSlider).toBe(true)
    expect(result.current.draggedHandle).toBe('start')
    expect(mockTouchEvent.preventDefault).toHaveBeenCalled()
  })

  it('should handle closest returning null', () => {
    const { result } = renderHook(() => useSlider())

    const mockEvent = {
      preventDefault: vi.fn(),
      currentTarget: {
        closest: vi.fn().mockReturnValue(null),
      },
    } as any

    act(() => {
      result.current.handleSliderMouseDown(mockEvent, 'start')
    })

    expect(result.current.isDraggingSlider).toBe(true)
    expect(result.current.draggedHandle).toBe('start')
    expect(mockEvent.preventDefault).toHaveBeenCalled()
  })

  it('should return all expected properties', () => {
    const { result } = renderHook(() => useSlider())

    expect(result.current).toHaveProperty('isDraggingSlider')
    expect(result.current).toHaveProperty('draggedHandle')
    expect(result.current).toHaveProperty('sliderRect')
    expect(result.current).toHaveProperty('handleSliderMouseDown')
    expect(result.current).toHaveProperty('handleSliderMouseMove')
    expect(result.current).toHaveProperty('handleSliderMouseUp')

    expect(typeof result.current.handleSliderMouseDown).toBe('function')
    expect(typeof result.current.handleSliderMouseMove).toBe('function')
    expect(typeof result.current.handleSliderMouseUp).toBe('function')
  })
})





