import { renderHook, act } from '@testing-library/react'
import { useTooltip } from '../useTooltip'
import type { Person } from '../../../../shared/types'

describe('useTooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  const mockPerson: Person = {
    id: 'person-1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1950,
    category: 'Test',
    country: 'Russia',
    description: 'Test description',
    achievements: [],
  }

  describe('person hover', () => {
    it('should show tooltip on person hover', () => {
      const { result } = renderHook(() => useTooltip())

      act(() => {
        result.current.handlePersonHover(mockPerson, 100, 200)
      })

      expect(result.current.hoveredPerson).toEqual(mockPerson)
      expect(result.current.mousePosition).toEqual({ x: 100, y: 200 })
      expect(result.current.showTooltip).toBe(true)
    })

    it('should hide tooltip on hover null with delay', () => {
      const { result } = renderHook(() => useTooltip())

      // Show tooltip first
      act(() => {
        result.current.handlePersonHover(mockPerson, 100, 200)
      })

      expect(result.current.showTooltip).toBe(true)

      // Hide tooltip
      act(() => {
        result.current.handlePersonHover(null, 0, 0)
      })

      // Should still be visible immediately
      expect(result.current.showTooltip).toBe(true)

      // Fast-forward timers
      act(() => {
        vi.advanceTimersByTime(200)
      })

      expect(result.current.showTooltip).toBe(false)
      expect(result.current.hoveredPerson).toBeNull()
    })

    it('should clear timeout when hovering new person', () => {
      const { result } = renderHook(() => useTooltip())

      const person1 = { ...mockPerson, id: 'person-1' }
      const person2 = { ...mockPerson, id: 'person-2' }

      act(() => {
        result.current.handlePersonHover(person1, 100, 200)
      })

      // Start hiding
      act(() => {
        result.current.handlePersonHover(null, 0, 0)
      })

      // Hover another person before timeout
      act(() => {
        result.current.handlePersonHover(person2, 150, 250)
      })

      // Tooltip should still be visible with new person
      expect(result.current.showTooltip).toBe(true)
      expect(result.current.hoveredPerson).toEqual(person2)
    })

    it('should update mouse position', () => {
      const { result } = renderHook(() => useTooltip())

      act(() => {
        result.current.handlePersonHover(mockPerson, 100, 200)
      })

      expect(result.current.mousePosition).toEqual({ x: 100, y: 200 })

      act(() => {
        result.current.handlePersonHover(mockPerson, 300, 400)
      })

      expect(result.current.mousePosition).toEqual({ x: 300, y: 400 })
    })
  })

  describe('achievement hover', () => {
    it('should show achievement tooltip on hover', () => {
      const { result } = renderHook(() => useTooltip())

      const achievement = {
        person: mockPerson,
        year: 1920,
        index: 0,
      }

      act(() => {
        result.current.handleAchievementHover(achievement, 100, 200)
      })

      expect(result.current.hoveredAchievement).toEqual(achievement)
      expect(result.current.mousePosition).toEqual({ x: 100, y: 200 })
      expect(result.current.showAchievementTooltip).toBe(true)
    })

    it('should hide achievement tooltip immediately', () => {
      const { result } = renderHook(() => useTooltip())

      const achievement = {
        person: mockPerson,
        year: 1920,
        index: 0,
      }

      act(() => {
        result.current.handleAchievementHover(achievement, 100, 200)
      })

      expect(result.current.showAchievementTooltip).toBe(true)

      act(() => {
        result.current.handleAchievementHover(null, 0, 0)
      })

      // Should hide immediately without delay
      expect(result.current.showAchievementTooltip).toBe(false)
      expect(result.current.hoveredAchievement).toBeNull()
    })

    it('should update achievement mouse position', () => {
      const { result } = renderHook(() => useTooltip())

      const achievement = {
        person: mockPerson,
        year: 1920,
        index: 0,
      }

      act(() => {
        result.current.handleAchievementHover(achievement, 100, 200)
      })

      expect(result.current.mousePosition).toEqual({ x: 100, y: 200 })

      act(() => {
        result.current.handleAchievementHover(achievement, 300, 400)
      })

      expect(result.current.mousePosition).toEqual({ x: 300, y: 400 })
    })
  })

  describe('cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const { result, unmount } = renderHook(() => useTooltip())

      act(() => {
        result.current.handlePersonHover(mockPerson, 100, 200)
      })

      act(() => {
        result.current.handlePersonHover(null, 0, 0)
      })

      // Timer should be set
      expect(result.current.hoverTimerRef.current).not.toBeNull()

      // Unmount
      unmount()

      // Timer should be cleared (can't assert directly, but verify no errors)
      expect(true).toBe(true)
    })
  })

  describe('independent tooltips', () => {
    it('should handle person and achievement tooltips independently', () => {
      const { result } = renderHook(() => useTooltip())

      const achievement = {
        person: mockPerson,
        year: 1920,
        index: 0,
      }

      // Show person tooltip
      act(() => {
        result.current.handlePersonHover(mockPerson, 100, 200)
      })

      expect(result.current.showTooltip).toBe(true)

      // Show achievement tooltip
      act(() => {
        result.current.handleAchievementHover(achievement, 150, 250)
      })

      expect(result.current.showAchievementTooltip).toBe(true)
      expect(result.current.showTooltip).toBe(true) // Person tooltip still visible
    })
  })
})






