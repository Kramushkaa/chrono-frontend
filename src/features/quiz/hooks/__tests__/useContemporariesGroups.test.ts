import { renderHook, act } from '@testing-library/react'
import { useContemporariesGroups } from '../useContemporariesGroups'
import type { QuizAnswer } from '../../types'

describe('useContemporariesGroups', () => {
  const mockPersons = [
    { id: 'p1', name: 'Person 1', birthYear: 1900, deathYear: 1950 },
    { id: 'p2', name: 'Person 2', birthYear: 1910, deathYear: 1960 },
    { id: 'p3', name: 'Person 3', birthYear: 1800, deathYear: 1850 },
    { id: 'p4', name: 'Person 4', birthYear: 1810, deathYear: 1860 },
  ]

  it('should initialize with one shuffled group', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons })
    )

    expect(result.current.groups).toHaveLength(1)
    expect(result.current.groups[0]).toHaveLength(4)
    // Check that all person IDs are present
    const allIds = result.current.groups[0].sort()
    expect(allIds).toEqual(['p1', 'p2', 'p3', 'p4'])
  })

  it('should restore user answer when showFeedback is true', () => {
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
      useContemporariesGroups({
        persons: mockPersons,
        showFeedback: true,
        userAnswer,
      })
    )

    expect(result.current.groups).toEqual([
      ['p1', 'p2'],
      ['p3', 'p4'],
    ])
  })

  describe('createGroup', () => {
    it('should create new group from person in existing group', () => {
      const { result } = renderHook(() =>
        useContemporariesGroups({ persons: mockPersons })
      )

      act(() => {
        result.current.createGroup('p1')
      })

      // Should have 2 groups now
      expect(result.current.groups).toHaveLength(2)
      // p1 should be in its own group
      expect(result.current.groups[1]).toEqual(['p1'])
      // Original group should have 3 persons
      expect(result.current.groups[0]).toHaveLength(3)
    })

    it('should remove empty group after creating new group', () => {
      const userAnswer: QuizAnswer = {
        questionId: 'q1',
        answer: [['p1'], ['p2', 'p3', 'p4']],
        isCorrect: false,
        timeMs: 1000,
      }

      const { result } = renderHook(() =>
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Initial: [[p1], [p2, p3, p4]]
      expect(result.current.groups).toHaveLength(2)

      act(() => {
        result.current.createGroup('p1')
      })

      // Should still have 2 groups (empty one was removed, new one created)
      expect(result.current.groups).toHaveLength(2)
      expect(result.current.groups[1]).toEqual(['p1'])
    })
  })

  describe('addToGroup', () => {
    it('should move person to target group', () => {
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
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Move p1 from group 0 to group 1
      act(() => {
        result.current.addToGroup('p1', 1)
      })

      expect(result.current.groups[0]).toEqual(['p2'])
      expect(result.current.groups[1]).toContain('p1')
      expect(result.current.groups[1]).toContain('p3')
      expect(result.current.groups[1]).toContain('p4')
    })

    it('should remove empty group after moving person', () => {
      const userAnswer: QuizAnswer = {
        questionId: 'q1',
        answer: [['p1'], ['p2', 'p3', 'p4']],
        isCorrect: false,
        timeMs: 1000,
      }

      const { result } = renderHook(() =>
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Move p1 to group 1
      act(() => {
        result.current.addToGroup('p1', 1)
      })

      // Should have only 1 group now (empty group removed)
      expect(result.current.groups).toHaveLength(1)
      expect(result.current.groups[0]).toEqual(['p2', 'p3', 'p4', 'p1'])
    })

    it('should adjust target index when removing group before it', () => {
      const userAnswer: QuizAnswer = {
        questionId: 'q1',
        answer: [['p1'], ['p2'], ['p3', 'p4']],
        isCorrect: false,
        timeMs: 1000,
      }

      const { result } = renderHook(() =>
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Move p1 (from group 0) to group 2 (which becomes 1 after removal)
      act(() => {
        result.current.addToGroup('p1', 2)
      })

      expect(result.current.groups).toHaveLength(2)
      // p1 should be in the last group
      expect(result.current.groups[1]).toContain('p1')
    })
  })

  describe('removeGroup', () => {
    it('should merge persons from removed group into first group', () => {
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
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Remove group 1
      act(() => {
        result.current.removeGroup(1)
      })

      expect(result.current.groups).toHaveLength(1)
      expect(result.current.groups[0]).toEqual(['p1', 'p2', 'p3', 'p4'])
    })

    it('should create new group if removing the last group', () => {
      const userAnswer: QuizAnswer = {
        questionId: 'q1',
        answer: [['p1', 'p2', 'p3', 'p4']],
        isCorrect: false,
        timeMs: 1000,
      }

      const { result } = renderHook(() =>
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Remove the only group
      act(() => {
        result.current.removeGroup(0)
      })

      // Should still have 1 group with all persons
      expect(result.current.groups).toHaveLength(1)
      expect(result.current.groups[0]).toEqual(['p1', 'p2', 'p3', 'p4'])
    })

    it('should handle removing middle group', () => {
      const userAnswer: QuizAnswer = {
        questionId: 'q1',
        answer: [['p1'], ['p2'], ['p3', 'p4']],
        isCorrect: false,
        timeMs: 1000,
      }

      const { result } = renderHook(() =>
        useContemporariesGroups({
          persons: mockPersons,
          showFeedback: true,
          userAnswer,
        })
      )

      // Remove middle group
      act(() => {
        result.current.removeGroup(1)
      })

      expect(result.current.groups).toHaveLength(2)
      expect(result.current.groups[0]).toEqual(['p1', 'p2'])
      expect(result.current.groups[1]).toEqual(['p3', 'p4'])
    })
  })

  it('should reset groups when persons change', () => {
    const persons1 = mockPersons.slice(0, 2)
    const persons2 = mockPersons.slice(2, 4)

    const { result, rerender } = renderHook(
      ({ persons }) => useContemporariesGroups({ persons }),
      { initialProps: { persons: persons1 } }
    )

    const firstGroups = result.current.groups

    // Change persons
    rerender({ persons: persons2 })

    // Should have new groups
    expect(result.current.groups).not.toBe(firstGroups)
    expect(result.current.groups[0]).toHaveLength(2)
  })

  it('should reset when showFeedback toggles', () => {
    const { result, rerender } = renderHook(
      ({ showFeedback, userAnswer }) =>
        useContemporariesGroups({ persons: mockPersons, showFeedback, userAnswer }),
      {
        initialProps: {
          showFeedback: false,
          userAnswer: null,
        },
      }
    )

    const initialGroups = result.current.groups

    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['p1', 'p2'], ['p3', 'p4']],
      isCorrect: true,
      timeMs: 1000,
    }

    // Toggle feedback on
    rerender({ showFeedback: true, userAnswer })

    expect(result.current.groups).toEqual(userAnswer.answer)
    expect(result.current.groups).not.toBe(initialGroups)
  })
})

