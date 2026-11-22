import {
  deleteListItem,
  copySharedListFromUrl,
  createAndCopyShareLink,
  openListOnTimeline,
} from '../lists'
import * as coreApi from '../../api/core'
import * as api from '../../api/lists'

// Mock API modules
vi.mock('../../api/core')
vi.mock('../../api/lists')

// Store original clipboard
const originalClipboard = navigator.clipboard

describe('lists utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset navigator.clipboard
    delete (navigator as any).clipboard
  })

  afterAll(() => {
    // Restore navigator.clipboard
    ;(navigator as any).clipboard = originalClipboard
  })

  describe('deleteListItem', () => {
    it('should return true on successful delete', async () => {
      vi.mocked(coreApi.apiFetch).mockResolvedValue({ ok: true } as Response)

      const result = await deleteListItem(1, 10)

      expect(result).toBe(true)
      expect(coreApi.apiFetch).toHaveBeenCalledWith('/api/lists/1/items/10', { method: 'DELETE' })
    })

    it('should return false on failed delete', async () => {
      vi.mocked(coreApi.apiFetch).mockResolvedValue({ ok: false } as Response)

      const result = await deleteListItem(1, 10)

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      vi.mocked(coreApi.apiFetch).mockRejectedValue(new Error('Network error'))

      const result = await deleteListItem(1, 10)

      expect(result).toBe(false)
    })
  })

  describe('copySharedListFromUrl', () => {
    // Helper to mock search without navigation
    const mockLocationSearch = (search: string) => {
      delete (window as any).location
      ;(window as any).location = { 
        search, 
        origin: 'http://localhost',
        href: `http://localhost${search}`,
        pathname: '/',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        protocol: 'http:',
        hash: ''
      }
    }

    it('should return null when no share code in URL', async () => {
      mockLocationSearch('?other=value')
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toBeNull()
    })

    it('should return null when API request fails', async () => {
      mockLocationSearch('?share=test-code')
      vi.mocked(coreApi.apiFetch).mockResolvedValue({ ok: false } as Response)
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toBeNull()
    })

    it.skip('should copy shared list successfully with valid response', async () => {
      // Skipped: JSDOM doesn't support window.location.search changes properly
      mockLocationSearch('?share=test-code')
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          data: { id: 123, title: 'Copied List' }
        })
      }
      vi.mocked(coreApi.apiFetch).mockResolvedValue(mockResponse as any)
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toEqual({ id: 123, title: 'Copied List' })
      expect(coreApi.apiFetch).toHaveBeenCalledWith('/api/lists/copy-from-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'test-code', title: 'fallback title' })
      })
    })

    it.skip('should handle invalid response data gracefully', async () => {
      // Skipped: JSDOM doesn't support window.location.search changes properly
      mockLocationSearch('?share=test-code')
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { id: 'invalid', title: null } })
      }
      vi.mocked(coreApi.apiFetch).mockResolvedValue(mockResponse as any)
      
      const result = await copySharedListFromUrl('fallback title')
      
      expect(result).toEqual({ id: null, title: 'fallback title' })
    })
  })

  describe('createAndCopyShareLink', () => {
    it('should return false when no code generated', async () => {
      const mockShowToast = vi.fn()
      vi.mocked(api.createListShareCode).mockResolvedValue(null)

      const result = await createAndCopyShareLink(1, mockShowToast)

      expect(result).toBe(false)
      expect(mockShowToast).toHaveBeenCalledWith('Не удалось создать ссылку', 'error')
    })

    it('should return false on error', async () => {
      const mockShowToast = vi.fn()
      vi.mocked(api.createListShareCode).mockRejectedValue(new Error('Error'))

      const result = await createAndCopyShareLink(1, mockShowToast)

      expect(result).toBe(false)
      expect(mockShowToast).toHaveBeenCalledWith('Не удалось создать ссылку', 'error')
    })

    it('should copy link to clipboard when clipboard API is available', async () => {
      const mockShowToast = vi.fn()
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      
      // Mock navigator.clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })
      
      vi.mocked(api.createListShareCode).mockResolvedValue('test-code-123')

      const result = await createAndCopyShareLink(1, mockShowToast)

      expect(result).toBe(true)
      expect(mockWriteText).toHaveBeenCalled()
      expect(mockShowToast).toHaveBeenCalledWith('Ссылка скопирована', 'success')
    })

    it('should work without showToast callback', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined)
      
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
        configurable: true,
      })
      
      vi.mocked(api.createListShareCode).mockResolvedValue('test-code')

      const result = await createAndCopyShareLink(1)

      expect(result).toBe(true)
    })

    it('should handle clipboard API fallback with toast when clipboard not available', async () => {
      const mockShowToast = vi.fn()
      
      // Mock navigator without clipboard
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      })
      
      // Mock window.location.origin
      delete (window as any).location
      ;(window as any).location = { 
        origin: 'http://localhost', 
        search: '',
        href: 'http://localhost',
        pathname: '/',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        protocol: 'http:',
        hash: ''
      }
      
      vi.mocked(api.createListShareCode).mockResolvedValue('test-code-456')

      const result = await createAndCopyShareLink(2, mockShowToast)

      expect(result).toBe(true)
      expect(mockShowToast).toHaveBeenCalledWith('Ссылка: http://localhost/lists?share=test-code-456', 'info')
    })
  })

  describe('openListOnTimeline', () => {
    // Note: Skipping tests requiring window.location.href changes due to jsdom limitations
    // These are better suited for E2E tests

    it('should show error when code creation fails', async () => {
      delete (window as any).location
      ;(window as any).location = { 
        search: '', 
        origin: 'http://localhost', 
        href: 'http://localhost',
        pathname: '/',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        protocol: 'http:',
        hash: ''
      }
      
      const mockShowToast = vi.fn()
      vi.mocked(api.createListShareCode).mockResolvedValue(null)

      await openListOnTimeline(5, null, mockShowToast)

      expect(mockShowToast).toHaveBeenCalledWith('Не удалось открыть на таймлайне', 'error')
    })

    it('should show error on exception', async () => {
      delete (window as any).location
      ;(window as any).location = { 
        search: '', 
        origin: 'http://localhost', 
        href: 'http://localhost',
        pathname: '/',
        host: 'localhost',
        hostname: 'localhost',
        port: '',
        protocol: 'http:',
        hash: ''
      }
      
      const mockShowToast = vi.fn()
      vi.mocked(api.createListShareCode).mockRejectedValue(new Error('Error'))

      await openListOnTimeline(5, null, mockShowToast)

      expect(mockShowToast).toHaveBeenCalledWith('Не удалось открыть на таймлайне', 'error')
    })
  })
})






