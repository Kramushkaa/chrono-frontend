import { renderHook } from '@testing-library/react'
import { useContemporariesFeedback } from '../useContemporariesFeedback'
import type { ContemporariesQuestionData, QuizAnswer } from '../../types'

describe('useContemporariesFeedback', () => {
  const createMockData = (): ContemporariesQuestionData => ({
    persons: [
      { id: 'p1', name: 'Person 1', birthYear: 1900, deathYear: 1950 },
      { id: 'p2', name: 'Person 2', birthYear: 1910, deathYear: 1960 },
      { id: 'p3', name: 'Person 3', birthYear: 1800, deathYear: 1850 },
      { id: 'p4', name: 'Person 4', birthYear: 1810, deathYear: 1860 },
    ],
    correctGroups: [
      ['p1', 'p2'], // Group 1: overlapping 1900-1960
      ['p3', 'p4'], // Group 2: overlapping 1800-1860
    ],
  })

  it('should return empty object when showFeedback is false', () => {
    const data = createMockData()

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: false,
        userAnswer: null,
        data,
      })
    )

    expect(result.current).toEqual({})
  })

  it('should return empty object when userAnswer is null', () => {
    const data = createMockData()

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: true,
        userAnswer: null,
        data,
      })
    )

    expect(result.current).toEqual({})
  })

  it('should mark all persons as correct when groups match perfectly', () => {
    const data = createMockData()
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [
        ['p1', 'p2'],
        ['p3', 'p4'],
      ],
      isCorrect: true,
      timeMs: 1000,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: true,
        userAnswer,
        data,
      })
    )

    expect(result.current).toEqual({
      p1: 'correct',
      p2: 'correct',
      p3: 'correct',
      p4: 'correct',
    })
  })

  it('should mark extra persons as incorrect in complete group', () => {
    const data = createMockData()
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [
        ['p1', 'p2', 'p3'], // p3 is extra
        ['p4'],
      ],
      isCorrect: false,
      timeMs: 1000,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: true,
        userAnswer,
        data,
      })
    )

    expect(result.current.p1).toBe('correct')
    expect(result.current.p2).toBe('correct')
    expect(result.current.p3).toBe('incorrect') // Extra person
    expect(result.current.p4).toBe('incorrect') // Incomplete group
  })

  it('should mark all as incorrect in incomplete group', () => {
    const data = createMockData()
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [
        ['p1'], // Missing p2
        ['p2', 'p3', 'p4'],
      ],
      isCorrect: false,
      timeMs: 1000,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: true,
        userAnswer,
        data,
      })
    )

    expect(result.current.p1).toBe('incorrect') // Incomplete group
    expect(result.current.p2).toBe('incorrect') // Wrong grouping
  })

  it('should mark all as incorrect when no matching correct group', () => {
    const data = createMockData()
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [
        ['p1', 'p3'], // No correct group has both
        ['p2', 'p4'],
      ],
      isCorrect: false,
      timeMs: 1000,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: true,
        userAnswer,
        data,
      })
    )

    expect(result.current.p1).toBe('incorrect')
    expect(result.current.p2).toBe('incorrect')
    expect(result.current.p3).toBe('incorrect')
    expect(result.current.p4).toBe('incorrect')
  })

  it('should handle single person groups', () => {
    const data = createMockData()
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['p1'], ['p2'], ['p3'], ['p4']],
      isCorrect: false,
      timeMs: 1000,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({
        showFeedback: true,
        userAnswer,
        data,
      })
    )

    // All should be incorrect as groups are incomplete
    expect(result.current.p1).toBe('incorrect')
    expect(result.current.p2).toBe('incorrect')
    expect(result.current.p3).toBe('incorrect')
    expect(result.current.p4).toBe('incorrect')
  })

  it('should memoize result', () => {
    const data = createMockData()
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [
        ['p1', 'p2'],
        ['p3', 'p4'],
      ],
      isCorrect: true,
      timeMs: 1000,
    }

    const { result, rerender } = renderHook(
      ({ showFeedback, userAnswer, data }) =>
        useContemporariesFeedback({ showFeedback, userAnswer, data }),
      {
        initialProps: { showFeedback: true, userAnswer, data },
      }
    )

    const firstResult = result.current

    // Rerender with same props
    rerender({ showFeedback: true, userAnswer, data })

    // Should return same reference (memoized)
    expect(result.current).toBe(firstResult)
  })

  it('should recalculate when userAnswer changes', () => {
    const data = createMockData()
    const userAnswer1: QuizAnswer = {
      questionId: 'q1',
      answer: [['p1', 'p2'], ['p3', 'p4']],
      isCorrect: true,
      timeMs: 1000,
    }
    const userAnswer2: QuizAnswer = {
      questionId: 'q1',
      answer: [['p1'], ['p2', 'p3', 'p4']],
      isCorrect: false,
      timeMs: 1000,
    }

    const { result, rerender } = renderHook(
      ({ showFeedback, userAnswer, data }) =>
        useContemporariesFeedback({ showFeedback, userAnswer, data }),
      {
        initialProps: { showFeedback: true, userAnswer: userAnswer1, data },
      }
    )

    const firstResult = result.current

    // Rerender with different answer
    rerender({ showFeedback: true, userAnswer: userAnswer2, data })

    // Should recalculate
    expect(result.current).not.toBe(firstResult)
    expect(result.current.p1).toBe('incorrect')
  })
})

