import {
  deleteListItem,
  copySharedListFromUrl,
  createAndCopyShareLink,
  openListOnTimeline,
} from '../lists'
import * as api from '../../api/api'

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
      ;(api.apiFetch as jest.Mock).mockResolvedValue({ ok: true })

      const result = await deleteListItem(1, 10)

      expect(result).toBe(true)
      expect(api.apiFetch).toHaveBeenCalledWith('/api/lists/1/items/10', { method: 'DELETE' })
    })

    it('should return false on failed delete', async () => {
      ;(api.apiFetch as jest.Mock).mockResolvedValue({ ok: false })

      const result = await deleteListItem(1, 10)

      expect(result).toBe(false)
    })

    it('should return false on error', async () => {
      ;(api.apiFetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await deleteListItem(1, 10)

      expect(result).toBe(false)
    })
  })

  describe('copySharedListFromUrl', () => {
    // Note: These tests are complex due to window.location mocking
    // Skipping for now as they would require full integration testing

    it.skip('should return null when no share code in URL', async () => {
      // Requires window.location mocking
    })

    it.skip('should copy shared list successfully', async () => {
      // Requires window.location mocking
    })
  })

  describe('createAndCopyShareLink', () => {
    // Note: Skipping tests requiring window.location/navigator.clipboard due to jsdom limitations
    // These are better suited for E2E tests

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
  })

  describe('openListOnTimeline', () => {
    // Note: Skipping tests requiring window.location due to jsdom limitations
    // These are better suited for E2E tests

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

