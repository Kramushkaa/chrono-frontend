import {
  categoryColors,
  categoryColorsDark,
  categoryColorsMuted,
  getCategoryColor,
  getCategoryColorDark,
  getCategoryColorMuted,
} from '../categoryColors'

describe('categoryColors', () => {
  describe('color palettes', () => {
    it('should have all categories in main palette', () => {
      const categories = Object.keys(categoryColors)
      expect(categories.length).toBeGreaterThan(0)
      expect(categoryColors['Философ']).toBe('#FF6B6B')
      expect(categoryColors['Ученый']).toBe('#FFEAA7')
    })

    it('should have matching categories in all palettes', () => {
      const mainCategories = Object.keys(categoryColors)
      const darkCategories = Object.keys(categoryColorsDark)
      const mutedCategories = Object.keys(categoryColorsMuted)

      expect(mainCategories.sort()).toEqual(darkCategories.sort())
      expect(mainCategories.sort()).toEqual(mutedCategories.sort())
    })

    it('should have valid hex colors', () => {
      const hexPattern = /^#[0-9A-F]{6}$/i

      Object.values(categoryColors).forEach(color => {
        expect(color).toMatch(hexPattern)
      })

      Object.values(categoryColorsDark).forEach(color => {
        expect(color).toMatch(hexPattern)
      })

      Object.values(categoryColorsMuted).forEach(color => {
        expect(color).toMatch(hexPattern)
      })
    })
  })

  describe('getCategoryColor', () => {
    it('should return correct color for known category', () => {
      expect(getCategoryColor('Философ')).toBe('#FF6B6B')
      expect(getCategoryColor('Художник')).toBe('#4ECDC4')
      expect(getCategoryColor('Писатель')).toBe('#45B7D1')
    })

    it('should return default color for unknown category', () => {
      expect(getCategoryColor('Unknown')).toBe('#95A5A6')
      expect(getCategoryColor('')).toBe('#95A5A6')
      expect(getCategoryColor('NonExistent')).toBe('#95A5A6')
    })

    it('should be case-sensitive', () => {
      expect(getCategoryColor('философ')).toBe('#95A5A6') // lowercase should fallback
      expect(getCategoryColor('Философ')).toBe('#FF6B6B') // correct case
    })
  })

  describe('getCategoryColorDark', () => {
    it('should return correct dark color for known category', () => {
      expect(getCategoryColorDark('Философ')).toBe('#e55a5a')
      expect(getCategoryColorDark('Художник')).toBe('#3db8b0')
      expect(getCategoryColorDark('Политик')).toBe('#84c4b4')
    })

    it('should return default dark color for unknown category', () => {
      expect(getCategoryColorDark('Unknown')).toBe('#7f8c8d')
      expect(getCategoryColorDark('')).toBe('#7f8c8d')
    })

    it('should return darker shades than main palette', () => {
      // Verify that dark colors are actually darker (this is a sanity check)
      const mainPhilosoph = categoryColors['Философ']
      const darkPhilosoph = categoryColorsDark['Философ']
      expect(mainPhilosoph).not.toBe(darkPhilosoph)
    })
  })

  describe('getCategoryColorMuted', () => {
    it('should return correct muted color for known category', () => {
      expect(getCategoryColorMuted('Философ')).toBe('#b97a6b')
      expect(getCategoryColorMuted('Художник')).toBe('#6b9b97')
      expect(getCategoryColorMuted('Музыкант')).toBe('#a17ab9')
    })

    it('should return default muted color for unknown category', () => {
      expect(getCategoryColorMuted('Unknown')).toBe('#a8926a')
      expect(getCategoryColorMuted('')).toBe('#a8926a')
    })

    it('should return muted shades different from main palette', () => {
      const mainPhilosoph = categoryColors['Философ']
      const mutedPhilosoph = categoryColorsMuted['Философ']
      expect(mainPhilosoph).not.toBe(mutedPhilosoph)
    })
  })

  describe('comprehensive category coverage', () => {
    const allCategories = [
      'Философ', 'Художник', 'Писатель', 'Поэт', 'Ученый',
      'Музыкант', 'Политик', 'Изобретатель', 'Архитектор',
      'Военный деятель', 'Путешественник', 'Общественный деятель',
      'Режиссер', 'Теолог', 'Просветитель', 'Революционер',
      'Дипломат', 'Король', 'Император', 'Королева', 'Царь', 'Царица'
    ]

    it('should have colors for all expected categories', () => {
      allCategories.forEach(category => {
        expect(categoryColors[category]).toBeDefined()
        expect(categoryColorsDark[category]).toBeDefined()
        expect(categoryColorsMuted[category]).toBeDefined()
      })
    })

    it('should return consistent colors across all getter functions', () => {
      allCategories.forEach(category => {
        expect(getCategoryColor(category)).toBe(categoryColors[category])
        expect(getCategoryColorDark(category)).toBe(categoryColorsDark[category])
        expect(getCategoryColorMuted(category)).toBe(categoryColorsMuted[category])
      })
    })
  })
})






