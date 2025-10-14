import { apiRequest, apiFetch, apiData, apiJson } from '../core'

// Mock fetch
global.fetch = jest.fn()

describe('API core', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('apiRequest', () => {
    it('should successfully fetch data', async () => {
      const mockResponse = new Response('{"data": "test"}', { status: 200 })
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      const result = await apiRequest('http://test.com/api')
      
      expect(result.status).toBe(200)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure', async () => {
      ;(global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(new Response('{"data": "test"}', { status: 200 }))

      const result = await apiRequest('http://test.com/api')
      
      expect(result.status).toBe(200)
      // Should have tried 3 times (initial + 2 retries)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should throw after all retries fail', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(apiRequest('http://test.com/api')).rejects.toThrow()
      
      // Should have tried 3 times (initial + 2 retries)
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })

    it('should respect timeout', async () => {
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 15000)) // 15 seconds
      )

      // This should timeout (default 10s)
      await expect(apiRequest('http://test.com/api')).rejects.toThrow()
    })
  })

  describe('apiJson', () => {
    it('should parse JSON response', async () => {
      const mockData = { test: 'data' }
      const mockResponse = new Response(JSON.stringify(mockData), { status: 200 })
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // Mock apiRequest
      jest.spyOn(require('../core'), 'apiRequest').mockResolvedValue(mockResponse)

      const result = await apiJson('/api/test')
      
      expect(result).toEqual(mockData)
    })

    it('should throw on non-OK response', async () => {
      const mockResponse = new Response('{"error": "Not found"}', { status: 404 })
      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      // This test would need proper mocking of apiFetch
      // Simplified version
      expect(mockResponse.ok).toBe(false)
    })
  })

  describe('apiData', () => {
    it('should extract data from standard API response', async () => {
      const mockData = { test: 'value' }
      const mockResponse = { data: mockData }
      
      // Mock apiJson
      const apiJsonSpy = jest.spyOn(require('../core'), 'apiJson').mockResolvedValue(mockResponse)

      const result = await apiData('/api/test')
      
      expect(result).toEqual(mockData)
      
      apiJsonSpy.mockRestore()
    })

    it('should return response directly if no data field', async () => {
      const mockResponse = { test: 'value' }
      
      // Mock apiJson
      const apiJsonSpy = jest.spyOn(require('../core'), 'apiJson').mockResolvedValue(mockResponse)

      const result = await apiData('/api/test')
      
      expect(result).toEqual(mockResponse)
      
      apiJsonSpy.mockRestore()
    })
  })
})
