import { renderHook, waitFor, act } from '@testing-library/react'
import { useLeaderboard, useUserStats } from '../useLeaderboard'
import * as api from '../../../../shared/api'

vi.mock('../../../../shared/api', () => ({
  getGlobalLeaderboard: vi.fn(),
  getUserStats: vi.fn(),
}))

const mockGetGlobalLeaderboard = api.getGlobalLeaderboard as vi.MockedFunction<typeof api.getGlobalLeaderboard>
const mockGetUserStats = api.getUserStats as vi.MockedFunction<typeof api.getUserStats>

describe('useLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load leaderboard on mount', async () => {
    const mockResponse = {
      success: true,
      data: {
        topPlayers: [
          { rank: 1, userId: 1, username: 'user1', totalRating: 1000, gamesPlayed: 50, averageScore: 90, bestScore: 100 },
          { rank: 2, userId: 2, username: 'user2', totalRating: 900, gamesPlayed: 45, averageScore: 85, bestScore: 95 },
        ],
        userEntry: { rank: 10, userId: 3, username: 'user3', totalRating: 500, gamesPlayed: 20, averageScore: 75, bestScore: 90 },
        totalPlayers: 100,
        page: { limit: 30, offset: 0, hasMore: true },
      },
    }

    mockGetGlobalLeaderboard.mockResolvedValue(mockResponse as any)

    const { result } = renderHook(() => useLeaderboard())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetGlobalLeaderboard).toHaveBeenCalledWith({ limit: 30, offset: 0 })
    expect(result.current.topPlayers).toHaveLength(2)
    expect(result.current.topPlayers[0].username).toBe('user1')
    expect(result.current.userEntry?.username).toBe('user3')
    expect(result.current.totalPlayers).toBe(100)
    expect(result.current.currentPage).toBe(0)
    expect(result.current.totalPages).toBe(Math.ceil(100 / 30))
    expect(result.current.error).toBeNull()
  })

  it('should handle error on load', async () => {
    mockGetGlobalLeaderboard.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useLeaderboard())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('API Error')
    expect(result.current.topPlayers).toEqual([])
  })

  it('should handle unsuccessful response', async () => {
    mockGetGlobalLeaderboard.mockResolvedValue({ success: false, data: null } as any)

    const { result } = renderHook(() => useLeaderboard())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load leaderboard')
  })

  it('should refresh leaderboard', async () => {
    const mockResponse = {
      success: true,
      data: {
        topPlayers: [],
        totalPlayers: 0,
        page: { limit: 30, offset: 0, hasMore: false },
      },
    }

    mockGetGlobalLeaderboard.mockResolvedValue(mockResponse as any)

    const { result } = renderHook(() => useLeaderboard())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetGlobalLeaderboard).toHaveBeenCalledTimes(1)

    // Refresh
    result.current.refresh()

    await waitFor(() => {
      expect(mockGetGlobalLeaderboard).toHaveBeenCalledTimes(2)
    })
  })

  it('should navigate between pages when available', async () => {
    const firstPage = {
      success: true,
      data: {
        topPlayers: [
          { rank: 1, userId: 1, username: 'user1', totalRating: 1000, gamesPlayed: 20, averageScore: 90, bestScore: 100 },
        ],
        totalPlayers: 60,
        page: { limit: 30, offset: 0, hasMore: true },
      },
    }
    const secondPage = {
      success: true,
      data: {
        topPlayers: [
          { rank: 31, userId: 4, username: 'user4', totalRating: 400, gamesPlayed: 10, averageScore: 60, bestScore: 80 },
        ],
        totalPlayers: 60,
        page: { limit: 30, offset: 30, hasMore: false },
      },
    }

    mockGetGlobalLeaderboard
      .mockResolvedValueOnce(firstPage as any)
      .mockResolvedValueOnce(secondPage as any)

    const { result } = renderHook(() => useLeaderboard())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.currentPage).toBe(0)
    expect(result.current.canGoNext).toBe(true)

    await act(async () => {
      result.current.goToNextPage()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.currentPage).toBe(1)
    expect(mockGetGlobalLeaderboard).toHaveBeenLastCalledWith({ limit: 30, offset: 30 })
    expect(result.current.canGoNext).toBe(false)
    expect(result.current.canGoPrev).toBe(true)
  })
})

describe('useUserStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should load user stats on mount', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalGames: 50,
        totalRating: 4500,
        averageRating: 90,
        bestRating: 100,
        averageScore: 85,
        rank: 15,
        recentAttempts: [
          { id: 1, rating: 95, createdAt: '2025-01-01T00:00:00Z' },
        ],
      },
    }

    mockGetUserStats.mockResolvedValue(mockResponse as any)

    const { result } = renderHook(() => useUserStats())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.totalGames).toBe(50)
    expect(result.current.averageRating).toBe(90)
    expect(result.current.rank).toBe(15)
    expect(result.current.recentAttempts).toHaveLength(1)
    expect(result.current.error).toBeNull()
  })

  it('should handle error on load', async () => {
    mockGetUserStats.mockRejectedValue(new Error('Stats error'))

    const { result } = renderHook(() => useUserStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Stats error')
    expect(result.current.totalGames).toBe(0)
  })

  it('should handle unsuccessful response', async () => {
    mockGetUserStats.mockResolvedValue({ success: false, data: null } as any)

    const { result } = renderHook(() => useUserStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to load user stats')
  })

  it('should refresh stats', async () => {
    const mockResponse = {
      success: true,
      data: {
        totalGames: 0,
        totalRating: 0,
        averageRating: 0,
        bestRating: 0,
        averageScore: 0,
        recentAttempts: [],
      },
    }

    mockGetUserStats.mockResolvedValue(mockResponse as any)

    const { result } = renderHook(() => useUserStats())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(mockGetUserStats).toHaveBeenCalledTimes(1)

    // Refresh
    result.current.refresh()

    await waitFor(() => {
      expect(mockGetUserStats).toHaveBeenCalledTimes(2)
    })
  })
})






