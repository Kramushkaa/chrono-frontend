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
    preventDefault: jest.fn(),
    button,
    currentTarget: {
      closest: jest.fn().mockReturnValue(mockElement),
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
})
