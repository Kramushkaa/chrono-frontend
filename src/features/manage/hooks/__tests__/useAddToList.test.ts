import { renderHook, act, waitFor } from '@testing-library/react'
import { useAddToList } from '../useAddToList'

describe('useAddToList', () => {
  const mockShowToast = vi.fn()
  const mockReloadLists = vi.fn()
  const mockGetSelectedPerson = vi.fn()
  const mockApiFetch = vi.fn()
  const mockApiData = vi.fn()

  const defaultParams = {
    showToast: mockShowToast,
    reloadLists: mockReloadLists,
    getSelectedPerson: mockGetSelectedPerson,
    apiFetch: mockApiFetch,
    apiData: mockApiData,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAddToList(defaultParams))

    expect(result.current.isOpen).toBe(false)
    expect(result.current.includeLinked).toBe(false)
  })

  describe('openForPerson', () => {
    it('should open modal for person', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      expect(result.current.isOpen).toBe(true)
    })

    it('should reset other pending items', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      expect(result.current.isOpen).toBe(true)
      expect(result.current.includeLinked).toBe(false)
    })
  })

  describe('openForAchievement', () => {
    it('should open modal for achievement', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForAchievement(42)
      })

      expect(result.current.isOpen).toBe(true)
    })

    it('should reset includeLinked', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForAchievement(42)
      })

      expect(result.current.includeLinked).toBe(false)
    })
  })

  describe('openForPeriod', () => {
    it('should open modal for period', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPeriod(99)
      })

      expect(result.current.isOpen).toBe(true)
    })
  })

  describe('close', () => {
    it('should close modal', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      expect(result.current.isOpen).toBe(true)

      act(() => {
        result.current.close()
      })

      expect(result.current.isOpen).toBe(false)
    })
  })

  describe('setIncludeLinked', () => {
    it('should update includeLinked state', () => {
      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.setIncludeLinked(true)
      })

      expect(result.current.includeLinked).toBe(true)
    })
  })

  describe('onAdd', () => {
    it('should add person to list successfully', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/lists/10/items',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item_type: 'person', person_id: 'person-1' }),
        })
      )

      expect(mockShowToast).toHaveBeenCalledWith('Добавлено в список', 'success')
      expect(mockReloadLists).toHaveBeenCalledWith(true)
      expect(result.current.isOpen).toBe(false)
    })

    it('should add achievement to list successfully', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForAchievement(42)
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/lists/10/items',
        expect.objectContaining({
          body: JSON.stringify({ item_type: 'achievement', achievement_id: 42 }),
        })
      )

      expect(mockShowToast).toHaveBeenCalledWith('Добавлено в список', 'success')
    })

    it('should add period to list successfully', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPeriod(99)
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/lists/10/items',
        expect.objectContaining({
          body: JSON.stringify({ item_type: 'period', period_id: 99 }),
        })
      )

      expect(mockShowToast).toHaveBeenCalledWith('Добавлено в список', 'success')
    })

    it('should show info toast when item already exists', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'already_exists' }),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockShowToast).toHaveBeenCalledWith(
        'Элемент уже есть в выбранном списке',
        'info'
      )
    })

    it('should handle error response', async () => {
      mockApiFetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'List not found' }),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockShowToast).toHaveBeenCalledWith('List not found', 'error')
    })

    it('should use default error message when no message in response', async () => {
      mockApiFetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockShowToast).toHaveBeenCalledWith(
        'Не удалось добавить в список',
        'error'
      )
    })

    it('should handle network error', async () => {
      mockApiFetch.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockShowToast).toHaveBeenCalledWith('Network error', 'error')
    })

    it('should add linked achievements and periods when includeLinked is true', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      mockApiData
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // achievements
        .mockResolvedValueOnce([{ id: 3 }, { id: 4 }]) // periods

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
        result.current.setIncludeLinked(true)
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      await waitFor(() => {
        expect(mockApiData).toHaveBeenCalledWith(
          '/api/persons/person-1/achievements'
        )
        expect(mockApiData).toHaveBeenCalledWith('/api/persons/person-1/periods')
      })

      // Person + 2 achievements + 2 periods = 5 calls
      expect(mockApiFetch).toHaveBeenCalledTimes(5)
      expect(mockShowToast).toHaveBeenCalledWith(
        'Связанные достижения и периоды добавлены',
        'success'
      )
    })

    it('should handle error when adding linked items', async () => {
      mockApiFetch.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      mockApiData.mockRejectedValue(new Error('Failed to fetch'))

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
        result.current.setIncludeLinked(true)
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          'Не удалось добавить связанные элементы',
          'error'
        )
      })
    })

    it('should use getSelectedPerson when no pending person id', async () => {
      mockGetSelectedPerson.mockReturnValue({ id: 'selected-person' })
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      const { result } = renderHook(() => useAddToList(defaultParams))

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockApiFetch).toHaveBeenCalledWith(
        '/api/lists/10/items',
        expect.objectContaining({
          body: JSON.stringify({ item_type: 'person', person_id: 'selected-person' }),
        })
      )
    })

    it('should do nothing when no person, achievement or period', async () => {
      mockGetSelectedPerson.mockReturnValue(null)

      const { result } = renderHook(() => useAddToList(defaultParams))

      await act(async () => {
        await result.current.onAdd(10)
      })

      expect(mockApiFetch).not.toHaveBeenCalled()
      expect(mockShowToast).not.toHaveBeenCalled()
    })

    it('should handle non-array response for linked items', async () => {
      mockApiFetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ message: 'success' }),
      })

      mockApiData
        .mockResolvedValueOnce('not an array') // achievements
        .mockResolvedValueOnce(null) // periods

      const { result } = renderHook(() => useAddToList(defaultParams))

      act(() => {
        result.current.openForPerson({ id: 'person-1' })
        result.current.setIncludeLinked(true)
      })

      await act(async () => {
        await result.current.onAdd(10)
      })

      // Should only call once for the person itself (no achievements/periods)
      expect(mockApiFetch).toHaveBeenCalledTimes(1)
    })
  })
})






