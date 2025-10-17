import { renderHook, act } from '@testing-library/react'
import { useMobileLayout } from '../useMobileLayout'

describe('useMobileLayout', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('should return desktop state for large screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
  })

  it('should return mobile state for small screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
  })

  it('should return tablet state for medium screens', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 900,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('should handle mobile breakpoint at 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
  })

  it('should handle tablet breakpoint at 769px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 769,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('should handle tablet upper breakpoint at 1024px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('should handle desktop breakpoint at 1025px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1025,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(false)
  })

  it('should update on window resize from desktop to mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1440,
    })

    const { result } = renderHook(() => useMobileLayout())

    expect(result.current.isMobile).toBe(false)

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isMobile).toBe(true)
    expect(result.current.isTablet).toBe(false)
  })

  it('should update on window resize from mobile to tablet', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const { result } = renderHook(() => useMobileLayout())

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isMobile).toBe(false)
    expect(result.current.isTablet).toBe(true)
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

    const { unmount } = renderHook(() => useMobileLayout())

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    removeEventListenerSpy.mockRestore()
  })
})

