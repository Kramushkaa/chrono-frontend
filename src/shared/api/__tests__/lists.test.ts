import { createListShareCode, resolveListShare } from '../lists'

// Mock core API functions
jest.mock('../core', () => ({
  apiData: jest.fn(),
}))

import { apiData } from '../core'

const mockApiData = apiData as jest.MockedFunction<typeof apiData>

describe('lists API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createListShareCode', () => {
    it('should create share code successfully', async () => {
      mockApiData.mockResolvedValue({ code: 'abc123' } as any)

      const result = await createListShareCode(1)

      expect(result).toBe('abc123')
      expect(mockApiData).toHaveBeenCalledWith('/api/lists/1/share', { method: 'POST' })
    })

    it('should return null if code is missing', async () => {
      mockApiData.mockResolvedValue({} as any)

      const result = await createListShareCode(1)

      expect(result).toBeNull()
    })

    it('should return null on error', async () => {
      mockApiData.mockRejectedValue(new Error('API Error'))

      const result = await createListShareCode(1)

      expect(result).toBeNull()
    })

    it('should handle empty string code', async () => {
      mockApiData.mockResolvedValue({ code: '' } as any)

      const result = await createListShareCode(1)

      expect(result).toBeNull()
    })
  })

  describe('resolveListShare', () => {
    it('should resolve share code successfully', async () => {
      const mockPayload = {
        title: 'My List',
        list_id: 42,
        owner_user_id: 123,
        items: [
          { item_type: 'person', person_id: 'person-1' },
          { item_type: 'achievement', achievement_id: 5 },
        ],
      }

      mockApiData.mockResolvedValue(mockPayload as any)

      const result = await resolveListShare('abc123')

      expect(result).toEqual({
        title: 'My List',
        list_id: 42,
        owner_user_id: '123',
        items: mockPayload.items,
      })
      expect(mockApiData).toHaveBeenCalledWith('/api/list-shares/abc123')
    })

    it('should handle missing title', async () => {
      mockApiData.mockResolvedValue({
        list_id: 1,
        items: [],
      } as any)

      const result = await resolveListShare('abc123')

      expect(result).toEqual({
        title: '',
        list_id: 1,
        owner_user_id: undefined,
        items: [],
      })
    })

    it('should handle invalid list_id', async () => {
      mockApiData.mockResolvedValue({
        title: 'Test',
        list_id: 'invalid',
        items: [],
      } as any)

      const result = await resolveListShare('abc123')

      expect(result).toEqual({
        title: 'Test',
        list_id: undefined,
        owner_user_id: undefined,
        items: [],
      })
    })

    it('should handle missing items', async () => {
      mockApiData.mockResolvedValue({
        title: 'Test',
        list_id: 1,
      } as any)

      const result = await resolveListShare('abc123')

      expect(result).toEqual({
        title: 'Test',
        list_id: 1,
        owner_user_id: undefined,
        items: [],
      })
    })

    it('should handle non-array items', async () => {
      mockApiData.mockResolvedValue({
        title: 'Test',
        list_id: 1,
        items: 'not-an-array',
      } as any)

      const result = await resolveListShare('abc123')

      expect(result).toEqual({
        title: 'Test',
        list_id: 1,
        owner_user_id: undefined,
        items: [],
      })
    })

    it('should return null on error', async () => {
      mockApiData.mockRejectedValue(new Error('Not found'))

      const result = await resolveListShare('invalid-code')

      expect(result).toBeNull()
    })

    it('should encode special characters in code', async () => {
      mockApiData.mockResolvedValue({ title: 'Test', items: [] } as any)

      await resolveListShare('code/with/slashes')

      expect(mockApiData).toHaveBeenCalledWith('/api/list-shares/code%2Fwith%2Fslashes')
    })

    it('should handle null owner_user_id', async () => {
      mockApiData.mockResolvedValue({
        title: 'Test',
        list_id: 1,
        owner_user_id: null,
        items: [],
      } as any)

      const result = await resolveListShare('abc123')

      expect(result).toEqual({
        title: 'Test',
        list_id: 1,
        owner_user_id: undefined,
        items: [],
      })
    })

    it('should convert numeric owner_user_id to string', async () => {
      mockApiData.mockResolvedValue({
        title: 'Test',
        list_id: 1,
        owner_user_id: 456,
        items: [],
      } as any)

      const result = await resolveListShare('abc123')

      expect(result?.owner_user_id).toBe('456')
    })
  })
})

