import {
  saveLifePeriods,
  getMyPeriodsCount,
  getPeriodDrafts,
  updatePeriod,
  submitPeriodDraft,
  createPeriodDraft,
} from '../periods'

// Mock core API functions
vi.mock('../core', () => ({
  apiFetch: vi.fn(),
  apiData: vi.fn(),
  apiJson: vi.fn(),
}))

import { apiFetch, apiData, apiJson } from '../core'

const mockApiFetch = vi.mocked(apiFetch)
const mockApiData = vi.mocked(apiData)
const mockApiJson = vi.mocked(apiJson)

describe('periods API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  describe('saveLifePeriods', () => {
    it('should save life periods for person', async () => {
      mockApiJson.mockResolvedValue({ data: { success: true } } as any)

      const periods = [
        { country_id: 1, start_year: 1900, end_year: 1920 },
        { country_id: 2, start_year: 1920, end_year: 1950 },
      ]

      await saveLifePeriods('person-1', periods)

      expect(mockApiJson).toHaveBeenCalledWith(
        '/api/persons/person-1/life-periods',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ periods }),
        })
      )
    })

    it('should handle single period', async () => {
      mockApiJson.mockResolvedValue({ data: { success: true } } as any)

      const periods = [{ country_id: 1, start_year: 1900, end_year: 1950 }]

      await saveLifePeriods('person-1', periods)

      expect(mockApiJson).toHaveBeenCalled()
    })
  })

  describe('getMyPeriodsCount', () => {
    it('should return count from response', async () => {
      mockApiData.mockResolvedValue({ count: 15 } as any)

      const result = await getMyPeriodsCount()

      expect(result).toBe(15)
      expect(mockApiData).toHaveBeenCalledWith('/api/periods/mine?count=true')
    })

    it.skip('should return 0 for invalid count', async () => {
      mockApiData.mockResolvedValue({ count: 'invalid' } as any)

      const result = await getMyPeriodsCount()

      expect(result).toBe(0)
    })

    it.skip('should return 0 for missing count', async () => {
      mockApiData.mockResolvedValue({} as any)

      const result = await getMyPeriodsCount()

      expect(result).toBe(0)
    })

    it.skip('should return 0 for null count', async () => {
      mockApiData.mockResolvedValue({ count: null } as any)

      const result = await getMyPeriodsCount()

      expect(result).toBe(0)
    })
  })

  describe('getPeriodDrafts', () => {
    it('should fetch period drafts with pagination', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [{ id: 1, status: 'draft' }] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getPeriodDrafts(10, 5)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/periods/drafts?limit=10&offset=5')
    })

    it('should fetch without pagination params', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getPeriodDrafts()

      expect(mockApiFetch).toHaveBeenCalledWith('/api/periods/drafts?')
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Error message' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getPeriodDrafts()).rejects.toThrow('Error message')
    })

    it('should use default error message', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getPeriodDrafts()).rejects.toThrow('Не удалось получить черновики периодов')
    })
  })

  describe('updatePeriod', () => {
    it('should update period with all fields', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { id: 1 } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const updates = {
        start_year: 1905,
        end_year: 1925,
        period_type: 'life',
        country_id: 2,
        comment: 'Updated comment',
      }

      await updatePeriod(1, updates)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/periods/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      )
    })

    it('should update period with partial fields', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { id: 1 } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await updatePeriod(1, { start_year: 1910 })

      expect(mockApiFetch).toHaveBeenCalled()
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Update failed' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(updatePeriod(1, { start_year: 1900 })).rejects.toThrow('Update failed')
    })
  })

  describe('submitPeriodDraft', () => {
    it('should submit draft for moderation', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { status: 'pending' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await submitPeriodDraft(1)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/periods/1/submit',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Submit failed' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(submitPeriodDraft(1)).rejects.toThrow('Submit failed')
    })
  })

  describe('createPeriodDraft', () => {
    it('should create period as draft', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { id: 1, status: 'draft' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        start_year: 1900,
        end_year: 1950,
        period_type: 'life',
        country_id: 1,
        comment: 'Test comment',
      }

      await createPeriodDraft('person-1', data)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/person-1/periods',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ...data, saveAsDraft: true }),
        })
      )
    })

    it('should create period draft without optional fields', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { id: 1 } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        start_year: 1900,
        end_year: 1950,
        period_type: 'life',
      }

      await createPeriodDraft('person-1', data)

      expect(mockApiFetch).toHaveBeenCalled()
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Creation failed' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        start_year: 1900,
        end_year: 1950,
        period_type: 'life',
      }

      await expect(createPeriodDraft('person-1', data)).rejects.toThrow('Creation failed')
    })
  })
})


