import React from 'react'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEntityQuery } from '../useEntityQuery'

vi.mock('../../api/core', () => ({
  apiData: vi.fn(),
}))

import { apiData } from '../../api/core'

const mockApiData = apiData as vi.MockedFunction<typeof apiData>

const createWrapper =
  (client?: QueryClient) =>
  ({ children }: { children: React.ReactNode }) => {
    const queryClient =
      client ??
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, staleTime: 0 },
        },
      })

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

const renderWithClient = (callback: () => unknown, client?: QueryClient) =>
  renderHook(callback, { wrapper: createWrapper(client) })

describe('useEntityQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches data successfully', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(mockData)

    const { result } = renderWithClient(() =>
      useEntityQuery({
        endpoint: '/api/test',
        enabled: true,
      })
    )

    expect(result.current.isLoading).toBe(true)
    expect(result.current.data).toEqual([])

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBe(null)
  })

  it('handles errors', async () => {
    const error = new Error('API Error')
    mockApiData.mockRejectedValue(error)

    const { result } = renderWithClient(() =>
      useEntityQuery({
        endpoint: '/api/test-error',
        enabled: true,
      })
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toEqual(error)
    expect(result.current.data).toEqual([])
  })

  it('does not fetch when disabled', () => {
    renderWithClient(() =>
      useEntityQuery({
        endpoint: '/api/test',
        enabled: false,
      })
    )

    expect(mockApiData).not.toHaveBeenCalled()
  })

  it('applies transform function', async () => {
    const rawData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(rawData)

    const transform = (data: any[]) =>
      data.map(item => ({
        ...item,
        name: `Transformed ${item.name}`,
      }))

    const { result } = renderWithClient(() =>
      useEntityQuery({
        endpoint: '/api/test-transform',
        enabled: true,
        transform,
      })
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.data[0]?.name).toBe('Transformed Test')
  })

  it('refetches data when refetch is called', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(mockData)

    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    const { result } = renderWithClient(
      () =>
        useEntityQuery({
          endpoint: '/api/test-refetch',
          enabled: true,
        }),
      client
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(mockApiData).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.refetch()
    })

    await waitFor(() => expect(mockApiData).toHaveBeenCalledTimes(2))
  })

  it('reuses cached data for identical cache keys', async () => {
    const mockData = [{ id: 1, name: 'Test' }]
    mockApiData.mockResolvedValue(mockData)

    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 10_000 } },
    })

    renderWithClient(
      () =>
        useEntityQuery({
          endpoint: '/api/test',
          enabled: true,
          cacheKey: 'custom-key',
        }),
      client
    )

    await waitFor(() => expect(mockApiData).toHaveBeenCalledTimes(1))

    renderWithClient(
      () =>
        useEntityQuery({
          endpoint: '/api/test',
          enabled: true,
          cacheKey: 'custom-key',
        }),
      client
    )

    expect(mockApiData).toHaveBeenCalledTimes(1)
  })
})

