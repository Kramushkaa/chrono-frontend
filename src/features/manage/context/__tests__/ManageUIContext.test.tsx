import React from 'react'
import { renderHook } from '@testing-library/react'
import { ManageUIProvider, useManageUI } from '../ManageUIContext'

describe('ManageUIContext', () => {
  const mockValue = {
    openAddAchievement: jest.fn(),
    openAddPeriod: jest.fn(),
    openAddForSelectedPerson: jest.fn(),
  }

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ManageUIProvider value={mockValue}>{children}</ManageUIProvider>
  )

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useManageUI', () => {
    it('should throw error when used outside provider', () => {
      expect(() => {
        renderHook(() => useManageUI())
      }).toThrow('useManageUI must be used within ManageUIProvider')
    })

    it('should provide manage UI actions', () => {
      const { result } = renderHook(() => useManageUI(), { wrapper })

      expect(result.current.openAddAchievement).toBe(mockValue.openAddAchievement)
      expect(result.current.openAddPeriod).toBe(mockValue.openAddPeriod)
      expect(result.current.openAddForSelectedPerson).toBe(mockValue.openAddForSelectedPerson)
    })

    it('should call openAddAchievement with correct id', () => {
      const { result } = renderHook(() => useManageUI(), { wrapper })

      result.current.openAddAchievement(123)
      
      expect(mockValue.openAddAchievement).toHaveBeenCalledWith(123)
    })

    it('should call openAddPeriod with correct id', () => {
      const { result } = renderHook(() => useManageUI(), { wrapper })

      result.current.openAddPeriod(456)
      
      expect(mockValue.openAddPeriod).toHaveBeenCalledWith(456)
    })

    it('should call openAddForSelectedPerson', () => {
      const { result } = renderHook(() => useManageUI(), { wrapper })

      result.current.openAddForSelectedPerson()
      
      expect(mockValue.openAddForSelectedPerson).toHaveBeenCalled()
    })
  })
})
