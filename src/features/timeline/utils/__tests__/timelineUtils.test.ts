import {
  toRomanNumeral,
  getCenturyNumber,
  getCenturyColor,
  generateCenturyBoundaries,
  getPosition,
  getWidth,
} from '../timelineUtils'

describe('timelineUtils', () => {
  describe('toRomanNumeral', () => {
    it('should convert positive numbers', () => {
      expect(toRomanNumeral(1)).toBe('I')
      expect(toRomanNumeral(4)).toBe('IV')
      expect(toRomanNumeral(5)).toBe('V')
      expect(toRomanNumeral(9)).toBe('IX')
      expect(toRomanNumeral(10)).toBe('X')
      expect(toRomanNumeral(40)).toBe('XL')
      expect(toRomanNumeral(50)).toBe('L')
      expect(toRomanNumeral(90)).toBe('XC')
      expect(toRomanNumeral(100)).toBe('C')
      expect(toRomanNumeral(400)).toBe('CD')
      expect(toRomanNumeral(500)).toBe('D')
      expect(toRomanNumeral(900)).toBe('CM')
      expect(toRomanNumeral(1000)).toBe('M')
    })

    it('should convert complex numbers', () => {
      expect(toRomanNumeral(1994)).toBe('MCMXCIV')
      expect(toRomanNumeral(2024)).toBe('MMXXIV')
      expect(toRomanNumeral(444)).toBe('CDXLIV')
      expect(toRomanNumeral(1666)).toBe('MDCLXVI')
    })

    it('should handle negative numbers', () => {
      expect(toRomanNumeral(-5)).toBe('-V')
      expect(toRomanNumeral(-100)).toBe('-C')
      expect(toRomanNumeral(-1994)).toBe('-MCMXCIV')
    })

    it('should handle zero', () => {
      expect(toRomanNumeral(0)).toBe('')
    })
  })

  describe('getCenturyNumber', () => {
    it('should calculate century for positive years', () => {
      expect(getCenturyNumber(1)).toBe(1)
      expect(getCenturyNumber(100)).toBe(1)
      expect(getCenturyNumber(101)).toBe(2)
      expect(getCenturyNumber(200)).toBe(2)
      expect(getCenturyNumber(2000)).toBe(20)
      expect(getCenturyNumber(2024)).toBe(21)
    })

    it('should calculate century for negative years', () => {
      expect(getCenturyNumber(-1)).toBe(1)
      expect(getCenturyNumber(-100)).toBe(1)
      expect(getCenturyNumber(-101)).toBe(2)
      expect(getCenturyNumber(-200)).toBe(2)
      expect(getCenturyNumber(-500)).toBe(5)
    })

    it('should handle year 0', () => {
      expect(getCenturyNumber(0)).toBe(1)
    })
  })

  describe('getCenturyColor', () => {
    it('should return color based on century index', () => {
      const minYear = 0
      const color1 = getCenturyColor(50, minYear) // Same century (0-99)
      const color2 = getCenturyColor(75, minYear) // Same century (0-99)
      const color3 = getCenturyColor(150, minYear) // Different century (100-199)

      expect(color1).toContain('rgba')
      expect(color2).toContain('rgba')
      expect(color1).toBe(color2) // Same century
      expect(color1).not.toBe(color3) // Different century
    })

    it('should cycle through colors', () => {
      const minYear = 0
      const colors = []
      for (let i = 0; i < 10; i++) {
        colors.push(getCenturyColor(i * 100 + 50, minYear))
      }

      // Should have some repeating colors due to cycling
      expect(new Set(colors).size).toBeLessThan(10)
    })

    it('should handle negative years', () => {
      const minYear = -1000
      const color = getCenturyColor(-500, minYear)

      expect(color).toContain('rgba')
    })
  })

  describe('generateCenturyBoundaries', () => {
    it('should generate boundaries for simple range', () => {
      const boundaries = generateCenturyBoundaries(0, 300)

      expect(boundaries).toContain(0)
      expect(boundaries).toContain(100)
      expect(boundaries).toContain(200)
      expect(boundaries).toContain(300)
    })

    it('should handle negative years', () => {
      const boundaries = generateCenturyBoundaries(-200, 100)

      expect(boundaries).toContain(-200)
      expect(boundaries).toContain(-100)
      expect(boundaries).toContain(0)
      expect(boundaries).toContain(100)
    })

    it('should align to century boundaries', () => {
      const boundaries = generateCenturyBoundaries(50, 250)

      expect(boundaries[0]).toBe(0) // Aligned down
      expect(boundaries).toContain(100)
      expect(boundaries).toContain(200)
    })

    it('should not exceed maxYear', () => {
      const boundaries = generateCenturyBoundaries(0, 150)

      expect(boundaries.every(b => b <= 150)).toBe(true)
    })

    it('should handle single century range', () => {
      const boundaries = generateCenturyBoundaries(10, 90)

      expect(boundaries).toContain(0)
      expect(boundaries.length).toBeGreaterThan(0)
    })
  })

  describe('getPosition', () => {
    it('should calculate position correctly', () => {
      const position = getPosition(1900, 1800, 10, 50)

      expect(position).toBe(50 + (1900 - 1800) * 10)
      expect(position).toBe(1050)
    })

    it('should handle zero padding', () => {
      const position = getPosition(100, 0, 1, 0)

      expect(position).toBe(100)
    })

    it('should handle negative years', () => {
      const position = getPosition(-500, -1000, 5, 100)

      expect(position).toBe(100 + 500 * 5)
      expect(position).toBe(2600)
    })

    it('should handle same year as minYear', () => {
      const position = getPosition(1800, 1800, 10, 50)

      expect(position).toBe(50)
    })
  })

  describe('getWidth', () => {
    it('should calculate width correctly', () => {
      const width = getWidth(1900, 1980, 10)

      expect(width).toBe((1980 - 1900) * 10)
      expect(width).toBe(800)
    })

    it('should handle single year', () => {
      const width = getWidth(2000, 2000, 5)

      expect(width).toBe(0)
    })

    it('should handle negative years', () => {
      const width = getWidth(-500, -400, 2)

      expect(width).toBe(100 * 2)
      expect(width).toBe(200)
    })

    it('should handle span across BC/AD', () => {
      const width = getWidth(-50, 50, 1)

      expect(width).toBe(100)
    })
  })
})

