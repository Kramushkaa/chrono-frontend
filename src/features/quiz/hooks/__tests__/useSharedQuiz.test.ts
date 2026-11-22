import { renderHook, act, waitFor } from '@testing-library/react'
import { useSharedQuiz } from '../useSharedQuiz'
import * as api from 'shared/api/quiz'

// Mock API
vi.mock('shared/api/quiz', () => ({
  createSharedQuiz: vi.fn(),
  getSharedQuiz: vi.fn(),
  startSharedQuiz: vi.fn(),
  checkSharedQuizAnswer: vi.fn(),
  finishSharedQuiz: vi.fn(),
  getSharedQuizLeaderboard: vi.fn(),
}))

const mockCreateSharedQuiz = api.createSharedQuiz as vi.MockedFunction<typeof api.createSharedQuiz>
const mockGetSharedQuiz = api.getSharedQuiz as vi.MockedFunction<typeof api.getSharedQuiz>
const mockStartSharedQuiz = api.startSharedQuiz as vi.MockedFunction<typeof api.startSharedQuiz>
const mockCheckSharedQuizAnswer = api.checkSharedQuizAnswer as vi.MockedFunction<
  typeof api.checkSharedQuizAnswer
>
const mockFinishSharedQuiz = api.finishSharedQuiz as vi.MockedFunction<typeof api.finishSharedQuiz>
const mockGetSharedQuizLeaderboard = api.getSharedQuizLeaderboard as vi.MockedFunction<
  typeof api.getSharedQuizLeaderboard
>

describe('useSharedQuiz', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSharedQuiz())

    expect(result.current.quiz).toBe(null)
    expect(result.current.sessionToken).toBe(null)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  describe('createSharedQuiz', () => {
    it('should create shared quiz successfully', async () => {
      mockCreateSharedQuiz.mockResolvedValue({
        success: true,
        data: {
          shareCode: 'test-code',
          shareUrl: 'http://test.com/quiz?share=test-code',
          sharedQuizId: 1,
        },
      })

      const { result } = renderHook(() => useSharedQuiz())

      let response: any

      await act(async () => {
        response = await result.current.createSharedQuiz(
          'Test Quiz',
          'Description',
          {
            questionCount: 5,
            selectedCategories: [],
            selectedCountries: [],
            timeRange: { start: -800, end: 2000 },
            questionTypes: ['birthYear'],
          },
          []
        )
      })

      expect(response).toEqual({
        shareCode: 'test-code',
        shareUrl: 'http://test.com/quiz?share=test-code',
      })
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should handle create error', async () => {
      mockCreateSharedQuiz.mockRejectedValue(new Error('Create failed'))

      const { result } = renderHook(() => useSharedQuiz())

      let response: any

      await act(async () => {
        response = await result.current.createSharedQuiz(
          'Test Quiz',
          'Description',
          {
            questionCount: 5,
            selectedCategories: [],
            selectedCountries: [],
            timeRange: { start: -800, end: 2000 },
            questionTypes: [],
          },
          []
        )
      })

      expect(response).toBe(null)
      expect(result.current.error).toBe('Create failed')
      expect(result.current.loading).toBe(false)
    })
  })

  describe('loadSharedQuiz', () => {
    it('should load shared quiz successfully', async () => {
      const mockQuiz: any = {
        id: 1,
        shareCode: 'test-code',
        title: 'Test Quiz',
        questions: [],
      }

      mockGetSharedQuiz.mockResolvedValue(mockQuiz)

      const { result } = renderHook(() => useSharedQuiz())

      let success: boolean = false

      await act(async () => {
        success = await result.current.loadSharedQuiz('test-code')
      })

      expect(success).toBe(true)
      expect(result.current.quiz).toEqual(mockQuiz)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should handle load error', async () => {
      mockGetSharedQuiz.mockRejectedValue(new Error('Quiz not found'))

      const { result } = renderHook(() => useSharedQuiz())

      let success: boolean = false

      await act(async () => {
        success = await result.current.loadSharedQuiz('invalid-code')
      })

      expect(success).toBe(false)
      expect(result.current.quiz).toBe(null)
      expect(result.current.error).toBe('Quiz not found')
    })
  })

  describe('startSession', () => {
    it('should start session successfully', async () => {
      mockStartSharedQuiz.mockResolvedValue({
        success: true,
        data: {
          sessionToken: 'session-123',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      })

      const { result } = renderHook(() => useSharedQuiz())

      let success: boolean = false

      await act(async () => {
        success = await result.current.startSession('test-code')
      })

      expect(success).toBe(true)
      expect(result.current.sessionToken).toBe('session-123')
    })

    it('should handle start session error', async () => {
      mockStartSharedQuiz.mockRejectedValue(new Error('Session failed'))

      const { result } = renderHook(() => useSharedQuiz())

      let success: boolean = false

      await act(async () => {
        success = await result.current.startSession('test-code')
      })

      expect(success).toBe(false)
      expect(result.current.error).toBe('Session failed')
    })
  })

  describe('checkAnswer', () => {
    it('should check answer successfully', async () => {
      mockCheckSharedQuizAnswer.mockResolvedValue({
        success: true,
        data: {
          isCorrect: true,
          correctAnswer: 'Correct Answer',
          explanation: 'Test explanation',
        },
      })

      const { result } = renderHook(() => useSharedQuiz())

      // Set session token first
      await act(async () => {
        mockStartSharedQuiz.mockResolvedValue({
          success: true,
          data: { sessionToken: 'session-123', expiresAt: '2025-12-31' },
        })
        await result.current.startSession('share-code')
      })

      let response: any

      await act(async () => {
        response = await result.current.checkAnswer('share-code', 'q1', 'Test Answer', 1000)
      })

      expect(response).toEqual({
        isCorrect: true,
        correctAnswer: 'Correct Answer',
        explanation: 'Test explanation',
      })
    })

    it('should handle check answer error when no session', async () => {
      const { result } = renderHook(() => useSharedQuiz())

      let response: any

      await act(async () => {
        response = await result.current.checkAnswer('share-code', 'q1', 'Test Answer', 1000)
      })

      expect(response).toBe(null)
      expect(result.current.error).toBe('No active session')
    })
  })

  describe('finishQuiz', () => {
    it('should finish quiz successfully', async () => {
      mockFinishSharedQuiz.mockResolvedValue({
        success: true,
        data: {
          correctAnswers: 9,
          totalQuestions: 10,
          totalTimeMs: 60000,
          detailedResults: [],
        },
      })

      const { result } = renderHook(() => useSharedQuiz())

      // Set session token first
      await act(async () => {
        mockStartSharedQuiz.mockResolvedValue({
          success: true,
          data: { sessionToken: 'session-123', expiresAt: '2025-12-31' },
        })
        await result.current.startSession('share-code')
      })

      let response: any

      await act(async () => {
        response = await result.current.finishQuiz('share-code')
      })

      expect(response).toEqual({
        correctAnswers: 9,
        totalQuestions: 10,
        totalTimeMs: 60000,
        detailedResults: [],
      })
      expect(result.current.sessionToken).toBe(null) // Should clear after finish
    })

    it('should handle finish quiz error when no session', async () => {
      const { result } = renderHook(() => useSharedQuiz())

      let response: any

      await act(async () => {
        response = await result.current.finishQuiz('share-code')
      })

      expect(response).toBe(null)
      expect(result.current.error).toBe('No active session')
    })
  })

  describe('loadLeaderboard', () => {
    it('should load leaderboard successfully', async () => {
      const mockLeaderboard = {
        success: true,
        data: {
          quizTitle: 'Test Quiz',
          entries: [
            { username: 'user1', rating: 100, rank: 1, attemptedAt: '2025-01-01' },
            { username: 'user2', rating: 95, rank: 2, attemptedAt: '2025-01-02' },
          ],
          userEntry: { username: 'currentUser', rating: 90, rank: 3, attemptedAt: '2025-01-03' },
          totalAttempts: 50,
        },
      }

      mockGetSharedQuizLeaderboard.mockResolvedValue(mockLeaderboard)

      const { result } = renderHook(() => useSharedQuiz())

      let success: boolean = false

      await act(async () => {
        success = await result.current.loadLeaderboard('test-code')
      })

      expect(success).toBe(true)
      expect(result.current.leaderboard.entries).toEqual(mockLeaderboard.data.entries)
      expect(result.current.leaderboard.userEntry).toEqual(mockLeaderboard.data.userEntry)
      expect(result.current.leaderboard.quizTitle).toBe('Test Quiz')
      expect(result.current.leaderboard.totalAttempts).toBe(50)
      expect(result.current.leaderboard.loading).toBe(false)
    })

    it('should handle leaderboard error', async () => {
      mockGetSharedQuizLeaderboard.mockRejectedValue(new Error('Leaderboard failed'))

      const { result } = renderHook(() => useSharedQuiz())

      let success: boolean = false

      await act(async () => {
        success = await result.current.loadLeaderboard('test-code')
      })

      expect(success).toBe(false)
      expect(result.current.leaderboard.error).toBe('Leaderboard failed')
      expect(result.current.leaderboard.loading).toBe(false)
    })
  })
})






