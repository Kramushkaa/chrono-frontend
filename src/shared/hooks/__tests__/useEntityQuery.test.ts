import { renderHook, waitFor, act } from '@testing-library/react'
import { useEntityQuery, clearEntityQueryCache } from '../useEntityQuery'

// Mock the API functions
jest.mock('../../api/core', () => ({
  apiData: jest.fn(),
}))

import { apiData } from '../../api/core'

const mockApiData = apiData as jest.MockedFunction<typeof apiData>

// Mock fetch globally
global.fetch = jest.fn()

describe('useEntityQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clearEntityQueryCache() // Clear cache between tests
    // Reset fetch mock
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('should fetch data successfully', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(mockData)

    const { result } = renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test',
        enabled: true,
      })
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toEqual([])

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
  })

  it('should handle errors', async () => {
    const error = new Error('API Error')
    mockApiData.mockRejectedValue(error)

    const { result } = renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test-error',
        enabled: true,
      })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toEqual([])
  })

  it('should not fetch when disabled', () => {
    renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test',
        enabled: false,
      })
    )

    expect(mockApiData).not.toHaveBeenCalled()
  })

  it('should transform data when transform function provided', async () => {
    const rawData = [{ id: 1, name: 'Test' }]
    const transformedData = [{ id: 1, name: 'Transformed Test' }]
    
    mockApiData.mockResolvedValue(rawData)

    const transform = (data: any[]) => 
      data.map(item => ({ ...item, name: `Transformed ${item.name}` }))

    const { result } = renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test-transform',
        enabled: true,
        transform,
      })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(transformedData)
  })

  it('should refetch data when refetch is called', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(mockData)

    const { result } = renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test-refetch',
        enabled: true,
      })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(mockApiData).toHaveBeenCalledTimes(1)

    // Call refetch
    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(mockApiData).toHaveBeenCalledTimes(2)
    })
  })

  it('should use custom cache key', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(mockData)

    renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test',
        enabled: true,
        cacheKey: 'custom-key',
      })
    )

    await waitFor(() => {
      expect(mockApiData).toHaveBeenCalledTimes(1)
    })

    // Second hook with same cache key should not fetch
    renderHook(() =>
      useEntityQuery({
        endpoint: '/api/test',
        enabled: true,
        cacheKey: 'custom-key',
      })
    )

    // Should still be only 1 call due to caching
    expect(mockApiData).toHaveBeenCalledTimes(1)
  })
})
