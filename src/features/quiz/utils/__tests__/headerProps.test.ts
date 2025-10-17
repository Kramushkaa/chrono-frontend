import { getMinimalHeaderProps } from '../headerProps'

describe('headerProps utils', () => {
  describe('getMinimalHeaderProps', () => {
    it('should return minimal header props with defaults', () => {
      const props = getMinimalHeaderProps()

      expect(props.mode).toBe('minimal')
      expect(props.isScrolled).toBe(false)
      expect(props.showControls).toBe(false)
      expect(props.filters).toEqual({
        categories: [],
        countries: [],
        showAchievements: true,
        hideEmptyCenturies: false,
      })
    })

    it('should include onBackToMenu when provided', () => {
      const mockCallback = jest.fn()
      const props = getMinimalHeaderProps({ onBackToMenu: mockCallback })

      expect(props.onBackToMenu).toBe(mockCallback)
    })

    it('should include extraLeftButton when provided', () => {
      const mockButton = { label: 'Test Button', onClick: jest.fn() }
      const props = getMinimalHeaderProps({ extraLeftButton: mockButton })

      expect(props.extraLeftButton).toBe(mockButton)
    })

    it('should include extraRightControls when provided', () => {
      const mockControls = 'controls-element'
      const props = getMinimalHeaderProps({ extraRightControls: mockControls as any })

      expect(props.extraRightControls).toBe(mockControls)
    })

    it('should have empty arrays for categories and countries', () => {
      const props = getMinimalHeaderProps()

      expect(props.allCategories).toEqual([])
      expect(props.allCountries).toEqual([])
    })

    it('should have default year inputs', () => {
      const props = getMinimalHeaderProps()

      expect(props.yearInputs).toEqual({ start: '-800', end: '2000' })
    })

    it('should have noop functions for actions', () => {
      const props = getMinimalHeaderProps()

      // These should be functions that do nothing
      expect(typeof props.setShowControls).toBe('function')
      expect(typeof props.setFilters).toBe('function')
      expect(typeof props.setGroupingType).toBe('function')
      expect(typeof props.setYearInputs).toBe('function')
      expect(typeof props.applyYearFilter).toBe('function')
      expect(typeof props.handleYearKeyPress).toBe('function')
      expect(typeof props.resetAllFilters).toBe('function')

      // Calling them should not throw
      expect(() => props.setShowControls(true)).not.toThrow()
      expect(() => props.setFilters({} as any)).not.toThrow()
    })

    it('should have groupingType set to none', () => {
      const props = getMinimalHeaderProps()

      expect(props.groupingType).toBe('none')
    })

    it('should have empty sortedData', () => {
      const props = getMinimalHeaderProps()

      expect(props.sortedData).toEqual([])
    })

    it('should have slider handlers', () => {
      const props = getMinimalHeaderProps()

      expect(typeof props.handleSliderMouseDown).toBe('function')
      expect(typeof props.handleSliderMouseMove).toBe('function')
      expect(typeof props.handleSliderMouseUp).toBe('function')
      expect(props.isDraggingSlider).toBe(false)
    })

    it('should accept all optional parameters', () => {
      const mockBackToMenu = jest.fn()
      const mockExtraButton = { label: 'Extra', onClick: jest.fn() }
      const mockExtraControls = 'extra-controls'

      const props = getMinimalHeaderProps({
        onBackToMenu: mockBackToMenu,
        extraLeftButton: mockExtraButton,
        extraRightControls: mockExtraControls as any,
      })

      expect(props.onBackToMenu).toBe(mockBackToMenu)
      expect(props.extraLeftButton).toBe(mockExtraButton)
      expect(props.extraRightControls).toBe(mockExtraControls)
    })

    it('should work with empty object', () => {
      const props = getMinimalHeaderProps({})

      expect(props.mode).toBe('minimal')
      expect(props.onBackToMenu).toBeUndefined()
      expect(props.extraLeftButton).toBeUndefined()
      expect(props.extraRightControls).toBeUndefined()
    })
  })
})

