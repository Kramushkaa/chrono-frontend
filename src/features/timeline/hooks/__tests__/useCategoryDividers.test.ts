import { renderHook } from '@testing-library/react'
import { useCategoryDividers } from '../useCategoryDividers'
import type { Person } from 'shared/types'

// Mock groupingUtils
vi.mock('features/persons/utils/groupingUtils', () => ({
  getPersonGroup: vi.fn(),
}))

import { getPersonGroup } from 'features/persons/utils/groupingUtils'

const mockGetPersonGroup = getPersonGroup as vi.MockedFunction<typeof getPersonGroup>

describe('useCategoryDividers', () => {
  const createMockPerson = (id: string, category: string): Person => ({
    id,
    name: `Person ${id}`,
    birthYear: 1900,
    deathYear: 1950,
    category,
    country: 'Test',
    description: 'Test',
    achievements: [],
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when grouping is none', () => {
    const rowPlacement = [[createMockPerson('1', 'Philosopher')]]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'none')
    )

    expect(result.current).toEqual([])
  })

  it('should return empty array for empty row placement', () => {
    const { result } = renderHook(() =>
      useCategoryDividers([], 'category')
    )

    expect(result.current).toEqual([])
  })

  it('should create divider for each category', () => {
    mockGetPersonGroup
      .mockReturnValueOnce('Философы')
      .mockReturnValueOnce('Ученые')
      .mockReturnValueOnce('Художники')

    const rowPlacement = [
      [createMockPerson('1', 'Philosopher')],
      [createMockPerson('2', 'Scientist')],
      [createMockPerson('3', 'Artist')],
    ]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'category')
    )

    expect(result.current).toEqual([
      { category: 'Философы', top: 0 },
      { category: 'Ученые', top: 70 },
      { category: 'Художники', top: 140 },
    ])
  })

  it('should not create duplicate dividers for same category', () => {
    mockGetPersonGroup
      .mockReturnValueOnce('Философы')
      .mockReturnValueOnce('Философы')
      .mockReturnValueOnce('Ученые')

    const rowPlacement = [
      [createMockPerson('1', 'Philosopher')],
      [createMockPerson('2', 'Philosopher')],
      [createMockPerson('3', 'Scientist')],
    ]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'category')
    )

    expect(result.current).toEqual([
      { category: 'Философы', top: 0 },
      { category: 'Ученые', top: 140 },
    ])
  })

  it('should use 20px height for empty rows', () => {
    mockGetPersonGroup
      .mockReturnValueOnce('Философы')
      .mockReturnValueOnce('Ученые')

    const rowPlacement = [
      [createMockPerson('1', 'Philosopher')],
      [], // Empty row
      [createMockPerson('2', 'Scientist')],
    ]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'category')
    )

    expect(result.current).toEqual([
      { category: 'Философы', top: 0 },
      { category: 'Ученые', top: 90 }, // 70 (first row) + 20 (empty row)
    ])
  })

  it('should use 70px height for non-empty rows', () => {
    mockGetPersonGroup
      .mockReturnValueOnce('Group 1')
      .mockReturnValueOnce('Group 2')

    const rowPlacement = [
      [createMockPerson('1', 'Cat1')],
      [createMockPerson('2', 'Cat2')],
    ]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'category')
    )

    expect(result.current[0].top).toBe(0)
    expect(result.current[1].top).toBe(70)
  })

  it('should work with country grouping', () => {
    mockGetPersonGroup.mockReturnValue('Russia')

    const rowPlacement = [[createMockPerson('1', 'Test')]]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'country')
    )

    expect(result.current).toEqual([
      { category: 'Russia', top: 0 },
    ])
    expect(mockGetPersonGroup).toHaveBeenCalledWith(
      expect.any(Object),
      'country'
    )
  })

  it('should memoize result', () => {
    mockGetPersonGroup.mockReturnValue('Philosophers')

    const rowPlacement = [[createMockPerson('1', 'Philosopher')]]

    const { result, rerender } = renderHook(
      ({ placement, grouping }) => useCategoryDividers(placement, grouping),
      {
        initialProps: { placement: rowPlacement, grouping: 'category' as const },
      }
    )

    const firstResult = result.current

    // Rerender with same props
    rerender({ placement: rowPlacement, grouping: 'category' as const })

    // Should return same reference (memoized)
    expect(result.current).toBe(firstResult)
  })

  it('should recalculate when rowPlacement changes', () => {
    mockGetPersonGroup.mockReturnValue('Group')

    const rowPlacement1 = [[createMockPerson('1', 'Cat1')]]
    const rowPlacement2 = [[createMockPerson('2', 'Cat2')]]

    const { result, rerender } = renderHook(
      ({ placement, grouping }) => useCategoryDividers(placement, grouping),
      {
        initialProps: { placement: rowPlacement1, grouping: 'category' as const },
      }
    )

    const firstResult = result.current

    // Rerender with different placement
    rerender({ placement: rowPlacement2, grouping: 'category' as const })

    // Should recalculate
    expect(result.current).not.toBe(firstResult)
  })

  it('should recalculate when groupingType changes', () => {
    const rowPlacement = [[createMockPerson('1', 'Test')]]

    const { result, rerender } = renderHook(
      ({ placement, grouping }) => useCategoryDividers(placement, grouping),
      {
        initialProps: { placement: rowPlacement, grouping: 'category' as const },
      }
    )

    // Rerender with different grouping
    rerender({ placement: rowPlacement, grouping: 'none' as const })

    // Should return empty array for 'none'
    expect(result.current).toEqual([])
  })

  it('should handle complex row placement with multiple persons per row', () => {
    mockGetPersonGroup
      .mockReturnValueOnce('Group A')
      .mockReturnValueOnce('Group B')

    const rowPlacement = [
      [
        createMockPerson('1', 'Cat1'),
        createMockPerson('2', 'Cat1'),
        createMockPerson('3', 'Cat1'),
      ],
      [createMockPerson('4', 'Cat2')],
    ]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'category')
    )

    // Should only check first person in each row
    expect(mockGetPersonGroup).toHaveBeenCalledTimes(2)
    expect(result.current).toEqual([
      { category: 'Group A', top: 0 },
      { category: 'Group B', top: 70 },
    ])
  })

  it('should skip empty rows but account for their height', () => {
    mockGetPersonGroup
      .mockReturnValueOnce('Group 1')
      .mockReturnValueOnce('Group 2')

    const rowPlacement = [
      [createMockPerson('1', 'Cat1')],
      [], // Empty
      [], // Empty
      [createMockPerson('2', 'Cat2')],
    ]

    const { result } = renderHook(() =>
      useCategoryDividers(rowPlacement, 'category')
    )

    expect(result.current).toEqual([
      { category: 'Group 1', top: 0 },
      { category: 'Group 2', top: 110 }, // 70 + 20 + 20
    ])
  })
})






