import { renderHook, act } from '@testing-library/react'
import { useFilterDropdownState } from '../useFilterDropdownState'

// Mock DOM methods
const mockDropdownRef = {
  current: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    contains: jest.fn(() => false),
    querySelector: jest.fn(),
  },
}

const mockContentRef = {
  current: {
    querySelectorAll: jest.fn(() => []),
    querySelector: jest.fn(),
  },
}

describe('useFilterDropdownState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Reset DOM
    document.body.innerHTML = ''
  })

  afterEach(() => {
    // Clean up any created portal containers
    const containers = document.querySelectorAll('[style*="position: fixed"]')
    containers.forEach(container => container.remove())
  })

  it('should initialize with closed state', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: false,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    expect(result.current.isOpen).toBe(false)
    expect(result.current.activeIndex).toBe(-1)
    expect(result.current.portalContainer).toBeNull()
  })

  it('should toggle open state', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: false,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    act(() => {
      result.current.setIsOpen(true)
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('should create portal container on mobile when opened', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: true,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    act(() => {
      result.current.setIsOpen(true)
    })

    expect(result.current.portalContainer).toBeTruthy()
    expect(result.current.portalContainer?.parentNode).toBe(document.body)
  })

  it('should remove portal container when closed on mobile', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: true,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    // Open
    act(() => {
      result.current.setIsOpen(true)
    })

    const container = result.current.portalContainer
    expect(container).toBeTruthy()

    // Close
    act(() => {
      result.current.setIsOpen(false)
    })

    expect(result.current.portalContainer).toBeNull()
  })

  it('should update active index', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: false,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    act(() => {
      result.current.setActiveIndex(2)
    })

    expect(result.current.activeIndex).toBe(2)
  })

  it('should handle mouse enter for desktop hover', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: false,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    act(() => {
      result.current.handleMouseEnter()
    })

    expect(result.current.isOpen).toBe(true)
  })

  it('should handle click on mobile', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: true,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    expect(result.current.isOpen).toBe(false)

    act(() => {
      result.current.handleClick()
    })

    expect(result.current.isOpen).toBe(true)

    act(() => {
      result.current.handleClick()
    })

    expect(result.current.isOpen).toBe(false)
  })

  it('should handle button key down events', () => {
    const mockInput = { focus: jest.fn() }
    mockContentRef.current.querySelector = jest.fn(() => mockInput as any)

    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: false,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    const mockEvent = {
      key: 'Enter',
      preventDefault: jest.fn(),
    }

    act(() => {
      result.current.handleButtonKeyDown(mockEvent as any)
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()

    // Test ArrowDown
    const arrowEvent = {
      key: 'ArrowDown',
      preventDefault: jest.fn(),
    }

    act(() => {
      result.current.handleButtonKeyDown(arrowEvent as any)
    })

    expect(arrowEvent.preventDefault).toHaveBeenCalled()
  })

  it('should handle content mouse events', () => {
    const { result } = renderHook(() => useFilterDropdownState({
      isMobile: false,
      dropdownRef: mockDropdownRef as any,
      contentRef: mockContentRef as any,
    }))

    // Test mouse enter and leave on content
    act(() => {
      result.current.handleContentMouseEnter()
    })

    act(() => {
      result.current.handleContentMouseLeave()
    })

    // Functions should exist and be callable
    expect(typeof result.current.handleContentMouseEnter).toBe('function')
    expect(typeof result.current.handleContentMouseLeave).toBe('function')
  })
})
