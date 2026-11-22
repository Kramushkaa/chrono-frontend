import { renderHook, act } from '@testing-library/react'
import { useManageModals } from '../useManageModals'

describe('useManageModals', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useManageModals())

    expect(result.current.isEditing).toBe(false)
    expect(result.current.showCreate).toBe(false)
    expect(result.current.createType).toBe('person')
    expect(result.current.showAuthModal).toBe(false)
    expect(result.current.showEditWarning).toBe(false)
    expect(result.current.isReverting).toBe(false)
    expect(result.current.showCreateList).toBe(false)
  })

  it('should update isEditing state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setIsEditing(true)
    })

    expect(result.current.isEditing).toBe(true)

    act(() => {
      result.current.setIsEditing(false)
    })

    expect(result.current.isEditing).toBe(false)
  })

  it('should update showCreate state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setShowCreate(true)
    })

    expect(result.current.showCreate).toBe(true)
  })

  it('should update createType state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setCreateType('achievement')
    })

    expect(result.current.createType).toBe('achievement')

    act(() => {
      result.current.setCreateType('period')
    })

    expect(result.current.createType).toBe('period')
  })

  it('should update showAuthModal state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setShowAuthModal(true)
    })

    expect(result.current.showAuthModal).toBe(true)
  })

  it('should update showEditWarning state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setShowEditWarning(true)
    })

    expect(result.current.showEditWarning).toBe(true)
  })

  it('should update isReverting state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setIsReverting(true)
    })

    expect(result.current.isReverting).toBe(true)
  })

  it('should update showCreateList state', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setShowCreateList(true)
    })

    expect(result.current.showCreateList).toBe(true)
  })

  it('should handle multiple state changes independently', () => {
    const { result } = renderHook(() => useManageModals())

    act(() => {
      result.current.setIsEditing(true)
      result.current.setShowCreate(true)
      result.current.setCreateType('achievement')
    })

    expect(result.current.isEditing).toBe(true)
    expect(result.current.showCreate).toBe(true)
    expect(result.current.createType).toBe('achievement')
    expect(result.current.showAuthModal).toBe(false)
  })
})






