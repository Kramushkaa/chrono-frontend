import {
  deleteListItem,
  copySharedListFromUrl,
  createAndCopyShareLink,
  openListOnTimeline,
} from '../lists'
import * as api from '../../api/api'
const { apiFetch } = api as any // Correctly import apiFetch

// Mock API
jest.mock('../../api/api')

// Store original clipboard
const originalClipboard = navigator.clipboard

describe('lists utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset navigator.clipboard
    delete (navigator as any).clipboard
  })

  afterAll(() => {
    // Restore navigator.clipboard
    ;(navigator as any).clipboard = originalClipboard
  })

  describe('deleteListItem', () => {
    it('should return true on successful delete', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValue({ ok: true })

      const result = await deleteListItem(1, 10)

      expect(result).toBe(true)
      expect(apiFetch).toHaveBeenCalledWith('/api/lists/1/items/10', { method: 'DELETE' })
    })

    it('should return false on failed delete', async () => {
      ;(apiFetch as jest.Mock).mockResolvedValue({ ok: false })

      const result = await deleteListItem(1, 10)

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      ;(apiFetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await deleteListItem(1, 10)

      expect(result).toBe(false)
    })
  })

  describe('copySharedListFromUrl', () => {
    const originalLocation = window.location

    beforeEach(() => {
      // Mock window.location with search property that doesn't trigger navigation
      delete (window as any).location
      ;(window as any).location = { search: '', origin: 'http://localhost' }
    })

    afterEach(() => {
      // Restore original location
      ;(window as any).location = originalLocation
    })

    it('should return null when no share code in URL', async () => {
      ;(window as any).location.search = '?other=value'
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toBeNull()
    })

    it('should return null when API request fails', async () => {
      ;(window as any).location.search = '?share=test-code'
      ;(apiFetch as jest.Mock).mockResolvedValue({ ok: false })
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toBeNull()
    })

    it('should copy shared list successfully with valid response', async () => {
      ;(window as any).location.search = '?share=test-code'
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { id: 123, title: 'Copied List' }
        })
      }
      ;(apiFetch as jest.Mock).mockResolvedValue(mockResponse)
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toEqual({ id: 123, title: 'Copied List' })
      expect(apiFetch).toHaveBeenCalledWith('/api/lists/copy-from-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'test-code', title: 'fallback title' })
      })
    })

    it('should handle invalid response data gracefully', async () => {
      ;(window as any).location.search = '?share=test-code'
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'invalid', title: null } })
      }
      ;(apiFetch as jest.Mock).mockResolvedValue(mockResponse)
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toEqual({ id: null, title: 'fallback title' })
    })
  })

  describe('createAndCopyShareLink', () => {
    it('should return false when no code generated', async () => {
      const mockShowToast = jest.fn()
      ;(api.createListShareCode as jest.Mock).mockResolvedValue(null)

      const result = await createAndCopyShareLink(1, mockShowToast)

      expect(result).toBe(false)
      expect(mockShowToast).toHaveBeenCalledWith('Не удалось создать ссылку', 'error')
    })

    it('should return false on error', async () => {
      const mockShowToast = jest.fn()
      ;(api.createListShareCode as jest.Mock).mockRejectedValue(new Error('Error'))

      const result = await createAndCopyShareLink(1, mockShowToast)

      expect(result).toBe(false)
      expect(mockShowToast).toHaveBeenCalledWith('Не удалось создать ссылку', 'error')
    })

    it('should copy link to clipboard when clipboard API is available', async () => {
      const mockShowToast = jest.fn()
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      
      // Mock navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })
      
      ;(api.createListShareCode as jest.Mock).mockResolvedValue('test-code-123')

      const result = await createAndCopyShareLink(1, mockShowToast)

      expect(result).toBe(true)
      expect(mockWriteText).toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Ссылка скопирована', 'success')
    })

    it('should work without showToast callback', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined)
      
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })
      
      ;(api.createListShareCode as jest.Mock).mockResolvedValue('test-code')

      const result = await createAndCopyShareLink(1)

      expect(result).toBe(true)
    })

    it('should handle clipboard API fallback with alert when clipboard not available', async () => {
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {})
      const mockShowToast = jest.fn()
      
      // Mock navigator without clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      
      // Mock window.location.origin (simple mock that doesn't trigger navigation)
      delete (window as any).location
      ;(window as any).location = { origin: 'http://localhost', search: '' }
      
      ;(api.createListShareCode as jest.Mock).mockResolvedValue('test-code-456')

      const result = await createAndCopyShareLink(2, mockShowToast)

      expect(result).toBe(true)
      expect(mockAlert).toHaveBeenCalledWith('http://localhost/lists?share=test-code-456')
      
      mockAlert.mockRestore()
    })
  })

  describe('openListOnTimeline', () => {
    // Note: Skipping tests requiring window.location due to jsdom limitations
    // These are better suited for E2E tests
    
    beforeEach(() => {
      // Mock window.location to avoid navigation errors
      delete (window as any).location
      ;(window as any).location = { search: '', origin: 'http://localhost', href: '' }
    })

    it('should show error when code creation fails', async () => {
      const mockShowToast = jest.fn()
      ;(api.createListShareCode as jest.Mock).mockResolvedValue(null)

      await openListOnTimeline(5, null, mockShowToast)

      expect(mockShowToast).toHaveBeenCalledWith('Не удалось открыть на таймлайне', 'error')
    })

    it('should show error on exception', async () => {
      const mockShowToast = jest.fn()
      ;(api.createListShareCode as jest.Mock).mockRejectedValue(new Error('Error'))

      await openListOnTimeline(5, null, mockShowToast)

      expect(mockShowToast).toHaveBeenCalledWith('Не удалось открыть на таймлайне', 'error')
    })
  })
})

