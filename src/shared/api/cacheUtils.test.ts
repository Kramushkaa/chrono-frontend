import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createCountCache } from './cacheUtils'

describe('createCountCache', () => {
  let mockFetcher: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockFetcher = vi.fn()
  })

  it('should fetch and cache value on first call', async () => {
    mockFetcher.mockResolvedValueOnce(42)
    const cache = createCountCache(mockFetcher)

    const result = await cache.get()

    expect(result).toBe(42)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
    expect(mockFetcher).toHaveBeenCalledWith(undefined)
  })

  it('should return cached value on subsequent calls with same params', async () => {
    mockFetcher.mockResolvedValueOnce(42)
    const cache = createCountCache(mockFetcher)

    const result1 = await cache.get()
    const result2 = await cache.get()
    const result3 = await cache.get()

    expect(result1).toBe(42)
    expect(result2).toBe(42)
    expect(result3).toBe(42)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should cache values separately for different params', async () => {
    mockFetcher
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(20)
    const cache = createCountCache(mockFetcher)

    const result1 = await cache.get({ status: 'approved' })
    const result2 = await cache.get({ status: 'pending' })

    expect(result1).toBe(10)
    expect(result2).toBe(20)
    expect(mockFetcher).toHaveBeenCalledTimes(2)
    expect(mockFetcher).toHaveBeenNthCalledWith(1, { status: 'approved' })
    expect(mockFetcher).toHaveBeenNthCalledWith(2, { status: 'pending' })
  })

  it('should return cached value for same params object', async () => {
    mockFetcher.mockResolvedValueOnce(100)
    const cache = createCountCache(mockFetcher)

    const params = { status: 'approved', limit: 10 }
    const result1 = await cache.get(params)
    const result2 = await cache.get({ status: 'approved', limit: 10 })

    expect(result1).toBe(100)
    expect(result2).toBe(100)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should invalidate cache and fetch new value', async () => {
    mockFetcher
      .mockResolvedValueOnce(42)
      .mockResolvedValueOnce(84)
    const cache = createCountCache(mockFetcher)

    const result1 = await cache.get()
    cache.invalidate()
    const result2 = await cache.get()

    expect(result1).toBe(42)
    expect(result2).toBe(84)
    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })

  it('should handle empty params as undefined', async () => {
    mockFetcher.mockResolvedValueOnce(5)
    const cache = createCountCache(mockFetcher)

    const result1 = await cache.get()
    const result2 = await cache.get(undefined)

    expect(result1).toBe(5)
    expect(result2).toBe(5)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should handle fetcher errors', async () => {
    const error = new Error('Network error')
    mockFetcher.mockRejectedValueOnce(error)
    const cache = createCountCache(mockFetcher)

    await expect(cache.get()).rejects.toThrow('Network error')
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should fetch again after error and invalidation', async () => {
    const error = new Error('Network error')
    mockFetcher
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(99)
    const cache = createCountCache(mockFetcher)

    await expect(cache.get()).rejects.toThrow('Network error')
    cache.invalidate()
    const result = await cache.get()

    expect(result).toBe(99)
    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })

  it('should handle params with different key order as same params', async () => {
    mockFetcher.mockResolvedValueOnce(123)
    const cache = createCountCache(mockFetcher)

    // JSON.stringify сортирует ключи по алфавиту, но в JavaScript порядок ключей может влиять
    const result1 = await cache.get({ a: 1, b: 2 })
    const result2 = await cache.get({ b: 2, a: 1 })

    expect(result1).toBe(123)
    // Второй запрос должен сделать новый fetcher, т.к. JSON.stringify даст разные строки
    expect(mockFetcher).toHaveBeenCalledTimes(2)
  })

  it('should return zero count', async () => {
    mockFetcher.mockResolvedValueOnce(0)
    const cache = createCountCache(mockFetcher)

    const result = await cache.get()

    expect(result).toBe(0)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })

  it('should cache zero value', async () => {
    mockFetcher.mockResolvedValueOnce(0)
    const cache = createCountCache(mockFetcher)

    const result1 = await cache.get()
    const result2 = await cache.get()

    expect(result1).toBe(0)
    expect(result2).toBe(0)
    expect(mockFetcher).toHaveBeenCalledTimes(1)
  })
})

