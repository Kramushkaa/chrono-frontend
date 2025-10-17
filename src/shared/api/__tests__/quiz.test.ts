import {
  saveQuizAttempt,
  createSharedQuiz,
  getSharedQuiz,
  startSharedQuiz,
  checkSharedQuizAnswer,
  finishSharedQuiz,
  getGlobalLeaderboard,
  getUserStats,
  getSharedQuizLeaderboard,
  getQuizHistory,
  getQuizAttemptDetail,
  getQuizSessionDetail,
} from '../quiz'

// Mock core API functions
jest.mock('../core', () => ({
  apiFetch: jest.fn(),
}))

import { apiFetch } from '../core'

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>

describe('quiz API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('saveQuizAttempt', () => {
    it('should save quiz attempt', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { attemptId: 1, rating: 85.5 },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        config: {
          questionCount: 10,
          selectedCategories: [],
          selectedCountries: [],
          timeRange: { start: -800, end: 2000 },
          questionTypes: ['birthYear', 'profession'],
        },
        correctAnswers: 8,
        totalQuestions: 10,
        totalTimeMs: 60000,
        detailedAnswers: [],
      }

      const result = await saveQuizAttempt(data as any)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/quiz/save-result',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
      expect(result.data.attemptId).toBe(1)
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Save failed' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(saveQuizAttempt({} as any)).rejects.toThrow('Save failed')
    })

    it('should use default error message', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({}),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(saveQuizAttempt({} as any)).rejects.toThrow('Failed to save quiz attempt')
    })
  })

  describe('createSharedQuiz', () => {
    it('should create shared quiz', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { shareCode: 'abc123', sharedQuizId: 1 },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        config: {
          questionCount: 5,
          selectedCategories: [],
          selectedCountries: [],
          timeRange: { start: -800, end: 2000 },
          questionTypes: [],
        },
        questions: [],
      }

      const result = await createSharedQuiz(data as any)

      expect(result.data.shareCode).toBe('abc123')
    })
  })

  describe('getSharedQuiz', () => {
    it('should fetch shared quiz', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { id: 1, shareCode: 'abc123', questions: [] },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await getSharedQuiz('abc123')

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/shared/abc123')
      expect(result.shareCode).toBe('abc123')
    })

    it('should throw error on not found', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Quiz not found' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getSharedQuiz('invalid')).rejects.toThrow('Quiz not found')
    })
  })

  describe('startSharedQuiz', () => {
    it('should start quiz session', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { sessionToken: 'session-123', expiresAt: '2025-01-01T00:00:00Z' },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await startSharedQuiz('abc123')

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/quiz/shared/abc123/start',
        expect.objectContaining({ method: 'POST' })
      )
      expect(result.data.sessionToken).toBe('session-123')
    })
  })

  describe('checkSharedQuizAnswer', () => {
    it('should check answer', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { isCorrect: true, correctAnswer: 'Answer', explanation: 'Explanation' },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        sessionToken: 'session-123',
        questionId: 'q1',
        userAnswer: 'Answer',
      }

      const result = await checkSharedQuizAnswer('abc123', data as any)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/quiz/shared/abc123/check-answer',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
      expect(result.data.isCorrect).toBe(true)
    })
  })

  describe('finishSharedQuiz', () => {
    it('should finish quiz', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { rating: 92.5, rank: 5 },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const data = {
        sessionToken: 'session-123',
      }

      const result = await finishSharedQuiz('abc123', data as any)

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/quiz/shared/abc123/finish',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      )
      expect(result.data.rating).toBe(92.5)
    })
  })

  describe('getGlobalLeaderboard', () => {
    it('should fetch global leaderboard', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            topPlayers: [{ userId: 1, username: 'user1', totalRating: 1000 }],
            userEntry: null,
            totalPlayers: 100,
          },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await getGlobalLeaderboard()

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/leaderboard')
      expect(result.data.totalPlayers).toBe(100)
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Leaderboard error' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getGlobalLeaderboard()).rejects.toThrow('Leaderboard error')
    })
  })

  describe('getUserStats', () => {
    it('should fetch user stats', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { totalGames: 50, averageScore: 85, bestScore: 100 },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await getUserStats()

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/leaderboard/me')
      expect(result.data.totalGames).toBe(50)
    })
  })

  describe('getSharedQuizLeaderboard', () => {
    it('should fetch shared quiz leaderboard', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            entries: [{ username: 'user1', score: 95 }],
            totalAttempts: 25,
          },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await getSharedQuizLeaderboard('abc123')

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/shared/abc123/leaderboard')
      expect(result.data.totalAttempts).toBe(25)
    })
  })

  describe('getQuizHistory', () => {
    it('should fetch quiz history without limit', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { attempts: [] },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getQuizHistory()

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/history')
    })

    it('should fetch quiz history with limit', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { attempts: [] },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await getQuizHistory(20)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/history?limit=20')
    })

    it('should throw error on failure', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'History error' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getQuizHistory()).rejects.toThrow('History error')
    })
  })

  describe('getQuizAttemptDetail', () => {
    it('should fetch attempt details', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: {
            id: 1,
            correctAnswers: 8,
            totalQuestions: 10,
            detailedResults: [],
          },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await getQuizAttemptDetail(1)

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/history/attempt/1')
      expect(result.data.id).toBe(1)
    })

    it('should throw error on not found', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Attempt not found' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getQuizAttemptDetail(999)).rejects.toThrow('Attempt not found')
    })
  })

  describe('getQuizSessionDetail', () => {
    it('should fetch session details', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: { sessionToken: 'session-123', quiz: { questions: [] } },
        }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      const result = await getQuizSessionDetail('session-123')

      expect(mockApiFetch).toHaveBeenCalledWith('/api/quiz/history/session-123')
      expect(result.data.sessionToken).toBe('session-123')
    })

    it('should throw error on invalid session', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Session not found' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getQuizSessionDetail('invalid')).rejects.toThrow('Session not found')
    })
  })

  describe('error handling consistency', () => {
    it('should handle JSON parse errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(saveQuizAttempt({} as any)).rejects.toThrow('Failed to save quiz attempt')
    })

    it('should prioritize error message from response', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ message: 'Custom error' }),
      } as any

      mockApiFetch.mockResolvedValue(mockResponse)

      await expect(getQuizHistory()).rejects.toThrow('Custom error')
    })
  })
})

