import {
  addAchievement,
  getMyAchievements,
  getMyAchievementsCount,
  getPendingAchievements,
  reviewAchievement,
  addGenericAchievement,
  getAchievementDrafts,
  updateAchievement,
  submitAchievementDraft,
  createAchievementDraft,
} from '../achievements'

// Mock core API functions
jest.mock('../core', () => ({
  apiFetch: jest.fn(),
  apiData: jest.fn(),
}))

import { apiFetch, apiData } from '../core'

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>
const mockApiData = apiData as jest.MockedFunction<typeof apiData>

describe('achievements API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addAchievement', () => {
    it('should successfully add achievement', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await addAchievement('person-1', {
        year: 1900,
        description: 'Test achievement',
      })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/person-1/achievements',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
      expect(result).toEqual({ data: { id: 1 } })
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Error message' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(
        addAchievement('person-1', { year: 1900, description: 'Test' })
      ).rejects.toThrow('Error message')
    })

    it('should use default error message when response has no message', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(
        addAchievement('person-1', { year: 1900, description: 'Test' })
      ).rejects.toThrow('Не удалось создать достижение')
    })

    it('should handle JSON parse errors', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(
        addAchievement('person-1', { year: 1900, description: 'Test' })
      ).rejects.toThrow('Не удалось создать достижение')
    })
  })

  describe('getMyAchievements', () => {
    it('should fetch user achievements with pagination', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [{ id: 1 }] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getMyAchievements(10, 5)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/achievements/mine?limit=10&offset=5')
    })

    it('should fetch without pagination params', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getMyAchievements()

      expect(mockApiFetch).toHaveBeenCalledWith('/api/achievements/mine?')
    })

    it('should handle only limit parameter', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getMyAchievements(20)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/achievements/mine?limit=20')
    })

    it('should not include offset when it is 0', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getMyAchievements(10, 0)

      // When offset is 0 (falsy), it's not included
      expect(mockApiFetch).toHaveBeenCalledWith('/api/achievements/mine?limit=10')
    })
  })

  describe('getMyAchievementsCount', () => {
    it('should return count from response', async () => {
      mockApiData.mockResolvedValue({ count: 42 } as any)

      const result = await getMyAchievementsCount()

      expect(result).toBe(42)
      expect(mockApiData).toHaveBeenCalledWith('/api/achievements/mine?count=true')
    })

    it('should return 0 for invalid count', async () => {
      mockApiData.mockResolvedValue({ count: 'invalid' } as any)

      const result = await getMyAchievementsCount()

      expect(result).toBe(0)
    })

    it('should return 0 for missing count', async () => {
      mockApiData.mockResolvedValue({} as any)

      const result = await getMyAchievementsCount()

      expect(result).toBe(0)
    })
  })

  describe('getPendingAchievements', () => {
    it('should fetch pending achievements', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [{ id: 1, status: 'pending' }] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getPendingAchievements(10, 5)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/admin/achievements/pending?limit=10&offset=5')
    })
  })

  describe('reviewAchievement', () => {
    it('should approve achievement', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { status: 'approved' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await reviewAchievement(1, 'approve')

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/admin/achievements/1/review',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ action: 'approve', comment: undefined }),
        })
      )
    })

    it('should reject achievement with comment', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { status: 'rejected' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await reviewAchievement(1, 'reject', 'Not accurate')

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/admin/achievements/1/review',
        expect.objectContaining({
          body: JSON.stringify({ action: 'reject', comment: 'Not accurate' }),
        })
      )
    })
  })

  describe('addGenericAchievement', () => {
    it('should create generic achievement', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1 } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const payload = {
        year: 1900,
        description: 'Generic achievement',
        country_id: 1,
      }

      await addGenericAchievement(payload)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/achievements',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      )
    })
  })

  describe('getAchievementDrafts', () => {
    it('should fetch achievement drafts', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [{ id: 1, status: 'draft' }] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getAchievementDrafts(5, 5)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/achievements/drafts?limit=5&offset=5')
    })
  })

  describe('updateAchievement', () => {
    it('should update achievement', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1, description: 'Updated' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const updates = { description: 'Updated' }
      await updateAchievement(1, updates)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/achievements/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      )
    })
  })

  describe('submitAchievementDraft', () => {
    it('should submit draft for moderation', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { status: 'pending' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await submitAchievementDraft(1)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/achievements/1/submit',
        expect.objectContaining({ method: 'POST' })
      )
    })
  })

  describe('createAchievementDraft', () => {
    it('should create achievement as draft', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 1, status: 'draft' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = { year: 1900, description: 'Draft achievement' }
      await createAchievementDraft('person-1', data)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/person-1/achievements',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ...data, saveAsDraft: true }),
        })
      )
    })
  })
})

