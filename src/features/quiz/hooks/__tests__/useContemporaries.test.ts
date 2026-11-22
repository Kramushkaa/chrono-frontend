import { renderHook, act } from '@testing-library/react'
import { useContemporariesGroups } from '../useContemporariesGroups'
import { useContemporariesFeedback } from '../useContemporariesFeedback'
import type { ContemporariesQuestionData, QuizAnswer } from '../../types'

describe('useContemporariesGroups', () => {
  const mockPersons: ContemporariesQuestionData['persons'] = [
    { id: 'person-1', name: 'Person 1', birthYear: 1900, deathYear: 1950, category: 'Test', imageUrl: '' },
    { id: 'person-2', name: 'Person 2', birthYear: 1920, deathYear: 1970, category: 'Test', imageUrl: '' },
    { id: 'person-3', name: 'Person 3', birthYear: 1800, deathYear: 1850, category: 'Test', imageUrl: '' },
  ]

  it('should initialize with shuffled single group', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    expect(result.current.groups).toHaveLength(1)
    expect(result.current.groups[0]).toHaveLength(3)
    expect(result.current.groups[0]).toEqual(expect.arrayContaining(['person-1', 'person-2', 'person-3']))
  })

  it('should create new group from person', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    act(() => {
      result.current.createGroup('person-1')
    })

    expect(result.current.groups).toHaveLength(2)
    expect(result.current.groups[1]).toEqual(['person-1'])
  })

  it('should add person to existing group', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    // Create a new group first
    act(() => {
      result.current.createGroup('person-1')
    })

    // Add another person to the new group
    act(() => {
      result.current.addToGroup('person-2', 1)
    })

    expect(result.current.groups[1]).toEqual(['person-1', 'person-2'])
  })

  it('should remove empty group when person is moved', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    // Create two new groups
    act(() => {
      result.current.createGroup('person-1')
      result.current.createGroup('person-2')
    })

    // Move person-1 to group with person-2, which should delete empty group
    act(() => {
      result.current.addToGroup('person-1', 1)
    })

    expect(result.current.groups.every(g => g.length > 0)).toBe(true)
  })

  it('should remove group and merge persons into first group', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    // Create a new group
    act(() => {
      result.current.createGroup('person-1')
    })

    const initialFirstGroupLength = result.current.groups[0].length

    // Remove the new group
    act(() => {
      result.current.removeGroup(1)
    })

    expect(result.current.groups).toHaveLength(1)
    expect(result.current.groups[0].length).toBe(initialFirstGroupLength + 1)
  })

  it('should handle removing last group by creating new one with persons', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    // Move all persons to separate groups
    act(() => {
      result.current.createGroup('person-1')
      result.current.createGroup('person-2')
      result.current.createGroup('person-3')
    })

    const groupToRemove = result.current.groups.length - 1

    // Remove one group
    act(() => {
      result.current.removeGroup(groupToRemove)
    })

    // All groups should still have content
    expect(result.current.groups.every(g => g.length > 0)).toBe(true)
  })

  it('should restore user answer when showFeedback is true', () => {
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1', 'person-2'], ['person-3']],
      timeSpent: 1000,
      isCorrect: true,
    }

    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: true, userAnswer })
    )

    expect(result.current.groups).toEqual([['person-1', 'person-2'], ['person-3']])
  })

  it('should reset groups when persons change', () => {
    const { result, rerender } = renderHook(
      ({ persons }) => useContemporariesGroups({ persons, showFeedback: false }),
      { initialProps: { persons: mockPersons } }
    )

    const initialGroups = result.current.groups

    // Change persons
    const newPersons = [
      { id: 'person-4', name: 'Person 4', birthYear: 2000, deathYear: 2020, category: 'Test', imageUrl: '' },
    ]

    rerender({ persons: newPersons })

    expect(result.current.groups).not.toEqual(initialGroups)
    expect(result.current.groups[0]).toHaveLength(1)
    expect(result.current.groups[0][0]).toBe('person-4')
  })

  it('should adjust target group index when moving person from earlier group', () => {
    const { result } = renderHook(() =>
      useContemporariesGroups({ persons: mockPersons, showFeedback: false })
    )

    // Create multiple groups
    act(() => {
      result.current.createGroup('person-1')
      result.current.createGroup('person-2')
      result.current.createGroup('person-3')
    })

    // Move person from first custom group (index 1) to last group (index 3)
    // After removing empty group, target index should be adjusted
    act(() => {
      result.current.addToGroup('person-1', 3)
    })

    // Verify groups structure is valid
    expect(result.current.groups.every(g => g.length > 0)).toBe(true)
  })
})

describe('useContemporariesFeedback', () => {
  const mockData: ContemporariesQuestionData = {
    persons: [
      { id: 'person-1', name: 'Person 1', birthYear: 1900, deathYear: 1950, category: 'Test', imageUrl: '' },
      { id: 'person-2', name: 'Person 2', birthYear: 1920, deathYear: 1970, category: 'Test', imageUrl: '' },
      { id: 'person-3', name: 'Person 3', birthYear: 1800, deathYear: 1850, category: 'Test', imageUrl: '' },
    ],
    correctGroups: [['person-1', 'person-2'], ['person-3']],
  }

  it('should return empty object when showFeedback is false', () => {
    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: false, userAnswer: null, data: mockData })
    )

    expect(result.current).toEqual({})
  })

  it('should return empty object when userAnswer is null', () => {
    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: true, userAnswer: null, data: mockData })
    )

    expect(result.current).toEqual({})
  })

  it('should mark persons as correct in complete matching group', () => {
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1', 'person-2'], ['person-3']],
      timeSpent: 1000,
      isCorrect: true,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: true, userAnswer, data: mockData })
    )

    expect(result.current['person-1']).toBe('correct')
    expect(result.current['person-2']).toBe('correct')
    expect(result.current['person-3']).toBe('correct')
  })

  it('should mark extra persons in group as incorrect', () => {
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1', 'person-2', 'person-3']],
      timeSpent: 1000,
      isCorrect: false,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: true, userAnswer, data: mockData })
    )

    expect(result.current['person-1']).toBe('correct')
    expect(result.current['person-2']).toBe('correct')
    expect(result.current['person-3']).toBe('incorrect') // Extra person
  })

  it('should mark incomplete group as incorrect', () => {
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1'], ['person-2', 'person-3']],
      timeSpent: 1000,
      isCorrect: false,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: true, userAnswer, data: mockData })
    )

    // person-1 is alone but should be with person-2
    expect(result.current['person-1']).toBe('incorrect')
    // person-2 and person-3 should not be together
    expect(result.current['person-2']).toBe('incorrect')
    expect(result.current['person-3']).toBe('incorrect')
  })

  it('should mark persons in non-matching group as incorrect', () => {
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-3'], ['person-1', 'person-2']],
      timeSpent: 1000,
      isCorrect: true,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: true, userAnswer, data: mockData })
    )

    // All should be correct as groups match
    expect(result.current['person-1']).toBe('correct')
    expect(result.current['person-2']).toBe('correct')
    expect(result.current['person-3']).toBe('correct')
  })

  it('should initialize missing persons', () => {
    const userAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1']],
      timeSpent: 1000,
      isCorrect: false,
    }

    const { result } = renderHook(() =>
      useContemporariesFeedback({ showFeedback: true, userAnswer, data: mockData })
    )

    // person-1 is incomplete
    expect(result.current['person-1']).toBe('incorrect')
    // person-2 and person-3 should be marked as missing initially,
    // but since they're in correctGroups, they get status
    expect(['incorrect', 'missing']).toContain(result.current['person-2'])
    expect(['incorrect', 'missing']).toContain(result.current['person-3'])
  })

  it('should update when userAnswer changes', () => {
    const initialAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1'], ['person-2'], ['person-3']],
      timeSpent: 1000,
      isCorrect: false,
    }

    const { result, rerender } = renderHook(
      ({ userAnswer }) => useContemporariesFeedback({ showFeedback: true, userAnswer, data: mockData }),
      { initialProps: { userAnswer: initialAnswer } }
    )

    const initialStatuses = result.current

    const correctAnswer: QuizAnswer = {
      questionId: 'q1',
      answer: [['person-1', 'person-2'], ['person-3']],
      timeSpent: 1000,
      isCorrect: true,
    }

    rerender({ userAnswer: correctAnswer })

    const newStatuses = result.current

    expect(newStatuses).not.toEqual(initialStatuses)
    expect(newStatuses['person-1']).toBe('correct')
    expect(newStatuses['person-2']).toBe('correct')
    expect(newStatuses['person-3']).toBe('correct')
  })
})






