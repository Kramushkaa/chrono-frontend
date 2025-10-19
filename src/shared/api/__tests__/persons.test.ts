import {
  getPersons,
  getPersonById,
  proposeNewPerson,
  updatePerson,
  getPersonDrafts,
  submitPersonDraft,
  createPersonDraft,
  getMyPersonsCount,
} from '../persons'

// Mock core API functions
jest.mock('../core', () => ({
  apiFetch: jest.fn(),
  apiData: jest.fn(),
  maybePercentDecode: jest.fn((str) => str), // Simple passthrough for testing
}))

import { apiFetch, apiData } from '../core'

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>
const mockApiData = apiData as jest.MockedFunction<typeof apiData>

describe('persons API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getPersons', () => {
    it('should fetch persons with default limit', async () => {
      const mockPersons = [
        {
          id: 'person-1',
          name: 'Test Person',
          birthYear: 1900,
          deathYear: 1980,
          category: 'Test',
          country: 'Russia',
          description: 'Test description',
        },
      ]

      mockApiData.mockResolvedValue(mockPersons as any)

      await getPersons()

      expect(mockApiData).toHaveBeenCalledWith('/api/persons?limit=1000')
    })

    it('should apply filters correctly', async () => {
      mockApiData.mockResolvedValue([] as any)

      await getPersons({
        category: 'Философ',
        country: 'Россия',
        startYear: 1800,
        endYear: 1900,
        limit: 50,
        offset: 10,
      })

      const call = mockApiData.mock.calls[0][0] as string
      expect(call).toContain('category=%D0%A4%D0%B8%D0%BB%D0%BE%D1%81%D0%BE%D1%84')
      expect(call).toContain('startYear=1800')
      expect(call).toContain('endYear=1900')
      expect(call).toContain('limit=50')
      expect(call).toContain('offset=10')
    })

    it('should handle partial filters', async () => {
      mockApiData.mockResolvedValue([] as any)

      await getPersons({
        category: 'Test',
        limit: 100,
      })

      const call = mockApiData.mock.calls[0][0] as string
      expect(call).toContain('category=Test')
      expect(call).toContain('limit=100')
      expect(call).not.toContain('offset')
      expect(call).not.toContain('startYear')
    })

    it('should handle only limit filter', async () => {
      mockApiData.mockResolvedValue([] as any)

      await getPersons({ limit: 200 })

      expect(mockApiData).toHaveBeenCalledWith('/api/persons?limit=200')
    })

    it('should transform persons data correctly', async () => {
      const mockPersons = [
        {
          id: 'person-1',
          name: 'Test',
          birthYear: 1900,
          deathYear: 1950,
          category: 'Category',
          country: 'Country',
          description: 'Desc',
          imageUrl: 'http://example.com/image.jpg',
        },
      ]

      mockApiData.mockResolvedValue(mockPersons as any)

      const result = await getPersons()

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('person-1')
      expect(result[0].name).toBe('Test')
    })

    it('should handle errors', async () => {
      mockApiData.mockRejectedValue(new Error('API Error'))

      await expect(getPersons()).rejects.toThrow('API Error')
    })
  })

  describe('getPersonById', () => {
    it('should fetch person by id', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test Person',
        birthYear: 1900,
        deathYear: 1980,
        category: 'Test',
        country: 'Russia',
        description: 'Test description',
        periods: [],
        achievements: [],
      }

      mockApiData.mockResolvedValue(mockPerson as any)

      const result = await getPersonById('person-1')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('person-1')
      expect(mockApiData).toHaveBeenCalledWith('/api/persons/person-1')
    })

    it('should encode special characters in id', async () => {
      mockApiData.mockResolvedValue({
        id: 'test/id',
        name: 'Test',
        birthYear: 1900,
        deathYear: 1950,
        category: 'Cat',
        country: 'Country',
        description: 'Desc',
      } as any)

      await getPersonById('test/id')

      expect(mockApiData).toHaveBeenCalledWith('/api/persons/test%2Fid')
    })

    it('should return null on error', async () => {
      mockApiData.mockRejectedValue(new Error('Not found'))

      const result = await getPersonById('non-existent')

      expect(result).toBeNull()
    })

    it('should handle periods with different field names', async () => {
      const mockPerson = {
        id: 'person-1',
        name: 'Test',
        birthYear: 1900,
        deathYear: 1950,
        category: 'Cat',
        country: 'Country',
        description: 'Desc',
        periods: [
          { start_year: 1900, end_year: 1920, period_type: 'life' },
          { startYear: 1920, endYear: 1950, type: 'ruler' },
        ],
      }

      mockApiData.mockResolvedValue(mockPerson as any)

      const result = await getPersonById('person-1')

      expect(result?.periods).toHaveLength(2)
      expect(result?.periods[0].startYear).toBe(1900)
      expect(result?.periods[1].type).toBe('ruler')
    })
  })

  describe('proposeNewPerson', () => {
    it('should propose new person', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'new-person' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const payload = {
        id: 'new-person',
        name: 'New Person',
        birthYear: 1900,
        deathYear: 1950,
        category: 'Test',
        description: 'Description',
        imageUrl: null,
        wikiLink: null,
        lifePeriods: [],
      }

      await proposeNewPerson(payload as any)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/propose',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      )
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Validation error' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(
        proposeNewPerson({
          id: 'test',
          name: 'Test',
          birthYear: 1900,
          deathYear: 1950,
        } as any)
      ).rejects.toThrow('Validation error')
    })
  })

  describe('updatePerson', () => {
    it('should update person', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'person-1' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const updates = {
        name: 'Updated Name',
        birthYear: 1905,
      }

      await updatePerson('person-1', updates)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/person-1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updates),
        })
      )
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Update failed' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(updatePerson('person-1', { name: 'Test' })).rejects.toThrow('Update failed')
    })
  })

  describe('getPersonDrafts', () => {
    it('should fetch drafts with pagination', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getPersonDrafts(10, 5)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/persons/drafts?limit=10&offset=5')
    })

    it('should fetch without pagination', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getPersonDrafts()

      expect(mockApiFetch).toHaveBeenCalledWith('/api/persons/drafts?')
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Error' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getPersonDrafts()).rejects.toThrow('Error')
    })
  })

  describe('submitPersonDraft', () => {
    it('should submit draft', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { status: 'pending' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await submitPersonDraft('person-1')

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/person-1/submit',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Submit failed' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(submitPersonDraft('person-1')).rejects.toThrow('Submit failed')
    })
  })

  describe('createPersonDraft', () => {
    it('should create person as draft', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: { id: 'draft-1' } }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        id: 'draft-1',
        name: 'Draft Person',
        birthYear: 1900,
        deathYear: 1950,
        category: 'Test',
        description: 'Desc',
        imageUrl: null,
        wikiLink: null,
        lifePeriods: [],
      }

      await createPersonDraft(data)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/persons/propose',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ ...data, saveAsDraft: true }),
        })
      )
    })
  })

  describe('getMyPersonsCount', () => {
    it('should return count', async () => {
      mockApiData.mockResolvedValue({ count: 25 } as any)

      const result = await getMyPersonsCount()

      expect(result).toBe(25)
      expect(mockApiData).toHaveBeenCalledWith('/api/persons/mine?count=true')
    })

    it('should return 0 for invalid count', async () => {
      mockApiData.mockResolvedValue({ count: 'invalid' } as any)

      const result = await getMyPersonsCount()

      expect(result).toBe(0)
    })

    it('should return 0 for missing count', async () => {
      mockApiData.mockResolvedValue({} as any)

      const result = await getMyPersonsCount()

      expect(result).toBe(0)
    })
  })
})

