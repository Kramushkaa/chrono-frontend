import { getPersonGroup, getGroupColor, getGroupColorDark, getGroupColorMuted, getCategoryPriority, sortGroupedData } from '../groupingUtils'
import type { Person, GroupingType } from 'shared/types'

describe('groupingUtils', () => {
  const mockPerson: Person = {
    id: '1',
    name: 'Test Person',
    birthYear: 1900,
    deathYear: 1950,
    category: 'scientist',
    country: 'Russia',
    description: '',
    achievements: [],
  }

  describe('getPersonGroup', () => {
    it('should return category when grouping by category', () => {
      const result = getPersonGroup(mockPerson, 'category')
      expect(result).toBe('scientist')
    })

    it('should return full country when grouping by country', () => {
      const person = { ...mockPerson, country: 'Russia/Germany' }
      const result = getPersonGroup(person, 'country')
      expect(result).toBe('Russia/Germany')
    })

    it('should return "none" when grouping is none', () => {
      const result = getPersonGroup(mockPerson, 'none')
      expect(result).toBe('none')
    })

    it('should handle multiple countries separated by slash', () => {
      const person = { ...mockPerson, country: 'USA / France / Germany' }
      const result = getPersonGroup(person, 'country')
      expect(result).toBe('USA / France / Germany')
    })
  })

  describe('getGroupColor', () => {
    it('should return consistent color for same group', () => {
      const color1 = getGroupColor('scientist')
      const color2 = getGroupColor('scientist')
      expect(color1).toBe(color2)
    })

    it('should return color for group', () => {
      const color1 = getGroupColor('scientist')
      const color2 = getGroupColor('artist')
      // Colors might be the same if both groups map to default
      expect(color1).toBeTruthy()
      expect(color2).toBeTruthy()
    })

    it('should return valid hex color', () => {
      const color = getGroupColor('test-group')
      expect(color).toMatch(/^#[0-9a-f]{6}$/i)
    })
  })

  describe('sortGroupedData', () => {
    const persons: Person[] = [
      { ...mockPerson, id: '1', birthYear: 1950 },
      { ...mockPerson, id: '2', birthYear: 1900 },
      { ...mockPerson, id: '3', birthYear: 1920 },
    ]

    it('should sort by birth year when no grouping', () => {
      const result = sortGroupedData(persons, 'none')
      
      expect(result[0].birthYear).toBe(1900)
      expect(result[1].birthYear).toBe(1920)
      expect(result[2].birthYear).toBe(1950)
    })

    it('should group and sort when grouping by category', () => {
      const personsWithCategories: Person[] = [
        { ...mockPerson, id: '1', category: 'artist', birthYear: 1950 },
        { ...mockPerson, id: '2', category: 'scientist', birthYear: 1900 },
        { ...mockPerson, id: '3', category: 'scientist', birthYear: 1920 },
      ]

      const result = sortGroupedData(personsWithCategories, 'category')

      // Within same category, should be sorted by birth year
      const scientists = result.filter(p => p.category === 'scientist')
      expect(scientists[0].birthYear).toBe(1900)
      expect(scientists[1].birthYear).toBe(1920)
    })

    it('should handle empty array', () => {
      const result = sortGroupedData([], 'none')
      expect(result).toEqual([])
    })

    it('should group by country when groupingType is country', () => {
      const personsWithCountries: Person[] = [
        { ...mockPerson, id: '1', country: 'Russia', birthYear: 1950 },
        { ...mockPerson, id: '2', country: 'Germany', birthYear: 1900 },
        { ...mockPerson, id: '3', country: 'Russia', birthYear: 1920 },
      ]

      const result = sortGroupedData(personsWithCountries, 'country')

      // Should group by country and sort within groups by birth year
      expect(result.map(p => p.country)).toEqual(['Germany', 'Russia', 'Russia'])
      expect(result.map(p => p.birthYear)).toEqual([1900, 1920, 1950])
    })
  })

  describe('getCategoryPriority', () => {
    it('should return correct priority for known categories', () => {
      expect(getCategoryPriority('Правители')).toBe(1)
      expect(getCategoryPriority('Военачальники')).toBe(2)
      expect(getCategoryPriority('Ученые')).toBe(3)
      expect(getCategoryPriority('Музыканты')).toBe(9)
    })

    it('should return 999 for unknown category', () => {
      expect(getCategoryPriority('Unknown Category')).toBe(999)
    })
  })

  describe('getGroupColor variants', () => {
    it('should return specific colors for category groups', () => {
      expect(getGroupColor('Правители группа')).toBe('#d32f2f')
      expect(getGroupColor('Военачальники группа')).toBe('#f57c00')
      expect(getGroupColor('Ученые группа')).toBe('#1976d2')
    })

    it('should return dark colors correctly', () => {
      expect(getGroupColorDark('Правители группа')).toBe('#b71c1c')
      expect(getGroupColorDark('Музыканты группа')).toBe('#e65100')
    })

    it('should return muted colors correctly', () => {
      expect(getGroupColorMuted('Художники группа')).toBe('#c8e6c9')
      expect(getGroupColorMuted('Писатели группа')).toBe('#e1bee7')
    })
  })

  describe('getPersonGroup', () => {
    it('should return none for none grouping type', () => {
      const person = { ...mockPerson, category: 'artist', country: 'Russia' }
      expect(getPersonGroup(person, 'none')).toBe('none')
    })

    it('should return category for category grouping', () => {
      const person = { ...mockPerson, category: 'artist' }
      expect(getPersonGroup(person, 'category')).toBe('artist')
    })

    it('should return unknown for missing category', () => {
      const person = { ...mockPerson, category: undefined }
      expect(getPersonGroup(person, 'category')).toBe('Неизвестно')
    })

    it('should return country for country grouping', () => {
      const person = { ...mockPerson, country: 'Russia' }
      expect(getPersonGroup(person, 'country')).toBe('Russia')
    })

    it('should return unknown for missing country', () => {
      const person = { ...mockPerson, country: undefined }
      expect(getPersonGroup(person, 'country')).toBe('Неизвестно')
    })
  })
})
