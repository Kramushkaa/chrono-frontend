import { renderHook, act } from '@testing-library/react'
import { useContemporariesDragDrop } from '../useContemporariesDragDrop'

describe('useContemporariesDragDrop', () => {
  const mockAddToGroup = vi.fn()
  const mockCreateGroup = vi.fn()
  const mockGroups = [['person-1', 'person-2'], ['person-3']]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with null/false states', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
          addToGroup: mockAddToGroup,
          createGroup: mockCreateGroup,
        })
      )

      expect(result.current.draggedItem).toBeNull()
      expect(result.current.draggedOverGroup).toBeNull()
      expect(result.current.draggedOverCreateZone).toBe(false)
      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('Desktop Drag & Drop', () => {
    it('should handle drag start', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      const mockEvent = {
        stopPropagation: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as any

      act(() => {
        result.current.handleDragStart(mockEvent, 'person-1')
      })

      expect(result.current.draggedItem).toBe('person-1')
      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text/html', 'person-1')
    })

    it('should not start drag when showFeedback is true', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: true,
          isMobile: false,
          groups: mockGroups,
        })
      )

      const mockEvent = {
        stopPropagation: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as any

      act(() => {
        result.current.handleDragStart(mockEvent, 'person-1')
      })

      expect(result.current.draggedItem).toBeNull()
    })

    it('should handle drag end', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      // Start drag first
      const mockStartEvent = {
        stopPropagation: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as any

      act(() => {
        result.current.handleDragStart(mockStartEvent, 'person-1')
      })

      // End drag
      act(() => {
        result.current.handleDragEnd()
      })

      expect(result.current.draggedItem).toBeNull()
      expect(result.current.draggedOverGroup).toBeNull()
      expect(result.current.draggedOverCreateZone).toBe(false)
    })

    it('should handle drag over group', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      const mockEvent = { preventDefault: vi.fn(), dataTransfer: { dropEffect: '' } } as any

      act(() => {
        result.current.handleDragOverGroup(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.dataTransfer.dropEffect).toBe('move')
    })

    it('should handle drag over create zone', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      const mockEvent = { preventDefault: vi.fn(), dataTransfer: { dropEffect: '' } } as any

      act(() => {
        result.current.handleDragOverCreateZone(mockEvent)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockEvent.dataTransfer.dropEffect).toBe('move')
    })

    it('should handle drag enter group', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      act(() => {
        result.current.handleDragEnterGroup(0)
      })

      expect(result.current.draggedOverGroup).toBe(0)
    })

    it('should handle drag enter create zone', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      act(() => {
        result.current.handleDragEnterCreateZone()
      })

      expect(result.current.draggedOverCreateZone).toBe(true)
    })

    it('should handle drag leave group with counter', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      // Enter group multiple times
      act(() => {
        result.current.handleDragEnterGroup(0)
        result.current.handleDragEnterGroup(0)
      })

      // Leave once
      act(() => {
        result.current.handleDragLeaveGroup(0)
      })

      // Should still be over group
      expect(result.current.draggedOverGroup).toBe(0)

      // Leave again
      act(() => {
        result.current.handleDragLeaveGroup(0)
      })

      // Now should be null
      expect(result.current.draggedOverGroup).toBeNull()
    })

    it('should handle drop to group', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
          addToGroup: mockAddToGroup,
        })
      )

      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        dataTransfer: { getData: vi.fn().mockReturnValue('person-1') },
      } as any

      act(() => {
        result.current.handleDrop(mockEvent, 1, mockAddToGroup)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockAddToGroup).toHaveBeenCalledWith('person-1', 1)
    })

    it('should handle drop to create zone', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
          createGroup: mockCreateGroup,
        })
      )

      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        dataTransfer: { getData: vi.fn().mockReturnValue('person-1') },
      } as any

      act(() => {
        result.current.handleDropToCreateGroup(mockEvent, mockCreateGroup)
      })

      expect(mockEvent.preventDefault).toHaveBeenCalled()
      expect(mockCreateGroup).toHaveBeenCalledWith('person-1')
    })
  })

  describe('Mobile Touch Events', () => {
    it('should handle touch start', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: true,
          groups: mockGroups,
        })
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        touches: [{ clientX: 100, clientY: 200 }],
        currentTarget: document.createElement('div'),
      } as any

      act(() => {
        result.current.handleTouchStart(mockEvent, 'person-1')
      })

      expect(result.current.draggedItem).toBe('person-1')
      expect(result.current.isDragging).toBe(true)
    })

    it('should not start touch when showFeedback is true', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: true,
          isMobile: true,
          groups: mockGroups,
        })
      )

      const mockEvent = {
        preventDefault: vi.fn(),
        touches: [{ clientX: 100, clientY: 200 }],
        currentTarget: document.createElement('div'),
      } as any

      act(() => {
        result.current.handleTouchStart(mockEvent, 'person-1')
      })

      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('Reset Drag State', () => {
    it('should reset all drag state', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      // Set some state
      const mockEvent = {
        stopPropagation: vi.fn(),
        dataTransfer: { effectAllowed: '', setData: vi.fn() },
      } as any

      act(() => {
        result.current.handleDragStart(mockEvent, 'person-1')
        result.current.handleDragEnterGroup(0)
        result.current.handleDragEnterCreateZone()
      })

      // Reset
      act(() => {
        result.current.resetDragState()
      })

      expect(result.current.draggedItem).toBeNull()
      expect(result.current.draggedOverGroup).toBeNull()
      expect(result.current.draggedOverCreateZone).toBe(false)
      expect(result.current.isDragging).toBe(false)
    })
  })

  describe('Handlers Return Values', () => {
    it('should provide all required handler functions', () => {
      const { result } = renderHook(() =>
        useContemporariesDragDrop({
          showFeedback: false,
          isMobile: false,
          groups: mockGroups,
        })
      )

      expect(typeof result.current.handleDragStart).toBe('function')
      expect(typeof result.current.handleDragEnd).toBe('function')
      expect(typeof result.current.handleDragOverGroup).toBe('function')
      expect(typeof result.current.handleDragOverCreateZone).toBe('function')
      expect(typeof result.current.handleDragEnterGroup).toBe('function')
      expect(typeof result.current.handleDragEnterCreateZone).toBe('function')
      expect(typeof result.current.handleDragLeaveGroup).toBe('function')
      expect(typeof result.current.handleDragLeaveCreateZone).toBe('function')
      expect(typeof result.current.handleDrop).toBe('function')
      expect(typeof result.current.handleDropToCreateGroup).toBe('function')
      expect(typeof result.current.handleTouchStart).toBe('function')
      expect(typeof result.current.handleTouchMove).toBe('function')
      expect(typeof result.current.handleTouchEnd).toBe('function')
      expect(typeof result.current.resetDragState).toBe('function')
    })
  })
})






