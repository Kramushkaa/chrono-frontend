import { renderHook, waitFor } from '@testing-library/react'
import { useAchievementTooltipDismiss } from '../useAchievementTooltipDismiss'
import { useDtoVersionWarning } from '../useDtoVersionWarning'
import { useUnauthorizedToast } from '../useUnauthorizedToast'
import { usePerformanceMonitor } from '../usePerformanceMonitor'
import * as api from '../../api/api'
import * as ToastContext from '../../context/ToastContext'

// Mock API
vi.mock('../../api/api')

// Mock ToastContext
vi.mock('../../context/ToastContext', () => ({
  useToast: vi.fn(),
}))

describe('Simple Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'warn').mockImplementation()
    vi.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    ;(console.warn as vi.Mock).mockRestore()
    ;(console.log as vi.Mock).mockRestore()
  })

  describe('useAchievementTooltipDismiss', () => {
    it('should add event listeners on mount', () => {
      const mockHandler = vi.fn()
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
      const docAddEventListenerSpy = vi.spyOn(document, 'addEventListener')

      renderHook(() => useAchievementTooltipDismiss(true, mockHandler))

      expect(addEventListenerSpy).toHaveBeenCalledWith('closeAchievementTooltip', expect.any(Function))
      expect(docAddEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
      expect(docAddEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

      addEventListenerSpy.mockRestore()
      docAddEventListenerSpy.mockRestore()
    })

    it('should remove event listeners on unmount', () => {
      const mockHandler = vi.fn()
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
      const docRemoveEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() => useAchievementTooltipDismiss(true, mockHandler))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('closeAchievementTooltip', expect.any(Function))
      expect(docRemoveEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
      expect(docRemoveEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

      removeEventListenerSpy.mockRestore()
      docRemoveEventListenerSpy.mockRestore()
    })

    it('should call handler on closeAchievementTooltip event', () => {
      const mockHandler = vi.fn()

      renderHook(() => useAchievementTooltipDismiss(true, mockHandler))

      window.dispatchEvent(new Event('closeAchievementTooltip'))

      expect(mockHandler).toHaveBeenCalledWith(null, 0, 0)
    })
  })

  describe('useDtoVersionWarning', () => {
    it('should not warn when versions match', async () => {
      ;(api.getDtoVersion as vi.Mock).mockResolvedValue('1.0.0')

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(api.getDtoVersion).toHaveBeenCalled()
      })

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should warn when versions mismatch', async () => {
      ;(api.getDtoVersion as vi.Mock).mockResolvedValue('2.0.0')

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('DTO Version Mismatch')
        )
      })
    })

    it('should handle API error gracefully', async () => {
      ;(api.getDtoVersion as vi.Mock).mockRejectedValue(new Error('Network error'))

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(api.getDtoVersion).toHaveBeenCalled()
      })

      // Should not throw or warn
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should not warn when version is null', async () => {
      ;(api.getDtoVersion as vi.Mock).mockResolvedValue(null)

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(api.getDtoVersion).toHaveBeenCalled()
      })

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should cancel request on unmount', async () => {
      ;(api.getDtoVersion as vi.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve('2.0.0'), 100))
      )

      const { unmount } = renderHook(() => useDtoVersionWarning('1.0.0'))

      unmount()

      await new Promise((resolve) => setTimeout(resolve, 150))

      // Should not warn after unmount
      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('useUnauthorizedToast', () => {
    it('should add event listener on mount', () => {
      const mockShowToast = vi.fn()
      ;(ToastContext.useToast as vi.Mock).mockReturnValue({ showToast: mockShowToast })

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener')

      renderHook(() => useUnauthorizedToast())

      expect(addEventListenerSpy).toHaveBeenCalledWith('auth:unauthorized', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove event listener on unmount', () => {
      const mockShowToast = vi.fn()
      ;(ToastContext.useToast as vi.Mock).mockReturnValue({ showToast: mockShowToast })

      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useUnauthorizedToast())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('auth:unauthorized', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })

    it('should show toast on unauthorized event', () => {
      const mockShowToast = vi.fn()
      ;(ToastContext.useToast as vi.Mock).mockReturnValue({ showToast: mockShowToast })

      renderHook(() => useUnauthorizedToast())

      window.dispatchEvent(new Event('auth:unauthorized'))

      expect(mockShowToast).toHaveBeenCalledWith(
        'Сессия истекла. Пожалуйста, войдите снова.',
        'error',
        5000
      )
    })

    it('should handle toast errors gracefully', () => {
      const mockShowToast = vi.fn().mockImplementation(() => {
        throw new Error('Toast error')
      })
      ;(ToastContext.useToast as vi.Mock).mockReturnValue({ showToast: mockShowToast })

      renderHook(() => useUnauthorizedToast())

      // Should not throw
      expect(() => {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }).not.toThrow()
    })
  })

  describe('usePerformanceMonitor', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development'
    })

    it('should initialize performance monitoring', () => {
      const { result } = renderHook(() => usePerformanceMonitor({ componentName: 'TestComponent' }))

      // Hook should not throw and should be defined
      expect(result).toBeDefined()
    })

    it('should not log when disabled', () => {
      renderHook(() => usePerformanceMonitor({ componentName: 'TestComponent', enabled: false }))

      // No logs when disabled
      const calls = (console.log as vi.Mock).mock.calls.filter(
        call => call[0]?.includes('[Performance]')
      )
      expect(calls.length).toBe(0)
    })

    it('should log unmount information', () => {
      const { unmount } = renderHook(() =>
        usePerformanceMonitor({ componentName: 'TestComponent' })
      )

      unmount()

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent unmounted')
      )
    })

    it('should count renders', () => {
      const { rerender } = renderHook(() =>
        usePerformanceMonitor({ componentName: 'TestComponent' })
      )

      // Trigger multiple renders
      for (let i = 0; i < 10; i++) {
        rerender()
      }

      // Should log every 10th render
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('rendered 10 times')
      )
    })

    it('should not log in production', () => {
      process.env.NODE_ENV = 'production'

      renderHook(() => usePerformanceMonitor({ componentName: 'TestComponent' }))

      const calls = (console.log as vi.Mock).mock.calls.filter(
        call => call[0]?.includes('[Performance]')
      )
      expect(calls.length).toBe(0)
    })
  })
})






