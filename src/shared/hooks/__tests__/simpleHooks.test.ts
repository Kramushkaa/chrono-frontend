import { renderHook, waitFor } from '@testing-library/react'
import { useAchievementTooltipDismiss } from '../useAchievementTooltipDismiss'
import { useDtoVersionWarning } from '../useDtoVersionWarning'
import { useUnauthorizedToast } from '../useUnauthorizedToast'
import { usePerformanceMonitor } from '../usePerformanceMonitor'
import * as api from '../../api/api'
import * as ToastContext from '../../context/ToastContext'

// Mock API
jest.mock('../../api/api')

// Mock ToastContext
jest.mock('../../context/ToastContext', () => ({
  useToast: jest.fn(),
}))

describe('Simple Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    ;(console.warn as jest.Mock).mockRestore()
    ;(console.log as jest.Mock).mockRestore()
  })

  describe('useAchievementTooltipDismiss', () => {
    it('should add event listeners on mount', () => {
      const mockHandler = jest.fn()
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      const docAddEventListenerSpy = jest.spyOn(document, 'addEventListener')

      renderHook(() => useAchievementTooltipDismiss(true, mockHandler))

      expect(addEventListenerSpy).toHaveBeenCalledWith('closeAchievementTooltip', expect.any(Function))
      expect(docAddEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
      expect(docAddEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

      addEventListenerSpy.mockRestore()
      docAddEventListenerSpy.mockRestore()
    })

    it('should remove event listeners on unmount', () => {
      const mockHandler = jest.fn()
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      const docRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener')

      const { unmount } = renderHook(() => useAchievementTooltipDismiss(true, mockHandler))

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('closeAchievementTooltip', expect.any(Function))
      expect(docRemoveEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))
      expect(docRemoveEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function))

      removeEventListenerSpy.mockRestore()
      docRemoveEventListenerSpy.mockRestore()
    })

    it('should call handler on closeAchievementTooltip event', () => {
      const mockHandler = jest.fn()

      renderHook(() => useAchievementTooltipDismiss(true, mockHandler))

      window.dispatchEvent(new Event('closeAchievementTooltip'))

      expect(mockHandler).toHaveBeenCalledWith(null, 0, 0)
    })
  })

  describe('useDtoVersionWarning', () => {
    it('should not warn when versions match', async () => {
      ;(api.getDtoVersion as jest.Mock).mockResolvedValue('1.0.0')

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(api.getDtoVersion).toHaveBeenCalled()
      })

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should warn when versions mismatch', async () => {
      ;(api.getDtoVersion as jest.Mock).mockResolvedValue('2.0.0')

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('DTO Version Mismatch')
        )
      })
    })

    it('should handle API error gracefully', async () => {
      ;(api.getDtoVersion as jest.Mock).mockRejectedValue(new Error('Network error'))

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(api.getDtoVersion).toHaveBeenCalled()
      })

      // Should not throw or warn
      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should not warn when version is null', async () => {
      ;(api.getDtoVersion as jest.Mock).mockResolvedValue(null)

      renderHook(() => useDtoVersionWarning('1.0.0'))

      await waitFor(() => {
        expect(api.getDtoVersion).toHaveBeenCalled()
      })

      expect(console.warn).not.toHaveBeenCalled()
    })

    it('should cancel request on unmount', async () => {
      ;(api.getDtoVersion as jest.Mock).mockImplementation(
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
      const mockShowToast = jest.fn()
      ;(ToastContext.useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast })

      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')

      renderHook(() => useUnauthorizedToast())

      expect(addEventListenerSpy).toHaveBeenCalledWith('auth:unauthorized', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove event listener on unmount', () => {
      const mockShowToast = jest.fn()
      ;(ToastContext.useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast })

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

      const { unmount } = renderHook(() => useUnauthorizedToast())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('auth:unauthorized', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })

    it('should show toast on unauthorized event', () => {
      const mockShowToast = jest.fn()
      ;(ToastContext.useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast })

      renderHook(() => useUnauthorizedToast())

      window.dispatchEvent(new Event('auth:unauthorized'))

      expect(mockShowToast).toHaveBeenCalledWith(
        'Сессия истекла. Пожалуйста, войдите снова.',
        'error',
        5000
      )
    })

    it('should handle toast errors gracefully', () => {
      const mockShowToast = jest.fn().mockImplementation(() => {
        throw new Error('Toast error')
      })
      ;(ToastContext.useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast })

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
      const calls = (console.log as jest.Mock).mock.calls.filter(
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

      const calls = (console.log as jest.Mock).mock.calls.filter(
        call => call[0]?.includes('[Performance]')
      )
      expect(calls.length).toBe(0)
    })
  })
})

